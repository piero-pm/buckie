package records

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"buckie/internal/auth"
)

// maxBodyBytes bounds one record upload (BR-HARD-1). Real records are ~200
// bytes; 1 MiB leaves generous headroom while blocking abuse.
const maxBodyBytes = 1 << 20

// NewMux returns a ServeMux with the session-gated encrypted-record routes.
// The server stores only ciphertext; validation, dedup, and aggregation run
// client-side over decrypted records (delivery-brief §3).
func NewMux(db *sql.DB) *http.ServeMux {
	h := &handler{db: db}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/records", h.list)
	mux.HandleFunc("PUT /api/records/{id}", h.put)
	mux.HandleFunc("DELETE /api/records/{id}", h.delete)
	return mux
}

type handler struct {
	db *sql.DB
}

// list returns the user's records of a kind (?kind=expense|recurring). Each
// record's ciphertext is base64-encoded for transport.
func (h *handler) list(w http.ResponseWriter, r *http.Request) {
	uid, ok, err := auth.CurrentUserID(h.db, r)
	if err != nil || !ok {
		writeJSON(w, http.StatusUnauthorized, errBody("unauthenticated"))
		return
	}
	kind := r.URL.Query().Get("kind")
	if !validKind(kind) {
		writeJSON(w, http.StatusBadRequest, errBody("invalid kind"))
		return
	}
	recs, err := List(h.db, uid, kind)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errBody("internal"))
		return
	}
	out := make([]recordDTO, 0, len(recs))
	for _, rc := range recs {
		out = append(out, recordDTO{
			ID:         rc.ID,
			Ciphertext: base64.StdEncoding.EncodeToString(rc.Ciphertext),
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"records": out})
}

// decodePut reads and validates one put request (id, kind, ciphertext) within
// the size limit. It writes the error response itself and reports ok=false.
func decodePut(w http.ResponseWriter, r *http.Request) (recordDTO, string, bool) {
	id := r.PathValue("id")
	if id == "" || strings.ContainsRune(id, '/') {
		writeJSON(w, http.StatusBadRequest, errBody("invalid id"))
		return recordDTO{}, "", false
	}
	var dto recordDTO
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		var tooBig *http.MaxBytesError
		if errors.As(err, &tooBig) {
			writeJSON(w, http.StatusRequestEntityTooLarge, errBody("record too large"))
			return recordDTO{}, "", false
		}
		writeJSON(w, http.StatusBadRequest, errBody("invalid request"))
		return recordDTO{}, "", false
	}
	if !validKind(dto.Kind) {
		writeJSON(w, http.StatusBadRequest, errBody("invalid kind"))
		return recordDTO{}, "", false
	}
	return dto, id, true
}

// put upserts one encrypted record. The id is client-supplied (path param); the
// body carries kind + base64 ciphertext. The server cannot read the payload.
func (h *handler) put(w http.ResponseWriter, r *http.Request) {
	uid, ok, err := auth.CurrentUserID(h.db, r)
	if err != nil || !ok {
		writeJSON(w, http.StatusUnauthorized, errBody("unauthenticated"))
		return
	}
	dto, id, ok := decodePut(w, r)
	if !ok {
		return
	}
	cipher, err := base64.StdEncoding.DecodeString(dto.Ciphertext)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errBody("invalid ciphertext"))
		return
	}
	if err := Put(h.db, uid, Record{ID: id, Kind: dto.Kind, Ciphertext: cipher}); err != nil {
		writeJSON(w, http.StatusInternalServerError, errBody("internal"))
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// delete removes one record, scoped to the acting user.
func (h *handler) delete(w http.ResponseWriter, r *http.Request) {
	uid, ok, err := auth.CurrentUserID(h.db, r)
	if err != nil || !ok {
		writeJSON(w, http.StatusUnauthorized, errBody("unauthenticated"))
		return
	}
	if err := Delete(h.db, uid, r.PathValue("id")); err != nil {
		writeJSON(w, http.StatusInternalServerError, errBody("internal"))
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

type recordDTO struct {
	ID         string `json:"id"`
	Kind       string `json:"kind"`
	Ciphertext string `json:"ciphertext"`
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func errBody(msg string) map[string]string {
	return map[string]string{"error": msg}
}
