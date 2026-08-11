package vault

import (
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"

	"penny-saver/internal/auth"
)

// NewMux returns a ServeMux with the session-gated vault routes registered.
// Both routes require a valid session cookie (resolved via auth.CurrentUserID).
func NewMux(db *sql.DB) *http.ServeMux {
	h := &handler{db: db}
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/vault", h.get)
	mux.HandleFunc("POST /api/vault", h.create)
	return mux
}

type handler struct {
	db *sql.DB
}

// envelopeDTO carries the non-secret vault material to/from the client. Salt and
// verifier are base64 so the JSON is portable; params is the client's opaque
// KDF-options string (echoed back verbatim for re-derivation on any device).
type envelopeDTO struct {
	Salt     string `json:"salt"`
	Params   string `json:"params"`
	Verifier string `json:"verifier"`
}

// get responds with {hasPassphrase, ...envelope?}. The envelope fields are
// present only when a vault exists (needed for new-device unlock; EX-PASS-4).
func (h *handler) get(w http.ResponseWriter, r *http.Request) {
	uid, ok, err := auth.CurrentUserID(h.db, r)
	if err != nil || !ok {
		writeJSON(w, http.StatusUnauthorized, errBody("unauthenticated"))
		return
	}
	v, exists, err := Get(h.db, uid)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, errBody("internal"))
		return
	}
	if !exists {
		writeJSON(w, http.StatusOK, map[string]any{"hasPassphrase": false})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"hasPassphrase": true,
		"salt":          base64.StdEncoding.EncodeToString(v.Salt),
		"params":        v.Params,
		"verifier":      base64.StdEncoding.EncodeToString(v.Verifer),
	})
}

// create stores a first-time vault envelope. 201 on success; 409 if a vault
// already exists (one-shot setup guard for EX-PASS-1).
func (h *handler) create(w http.ResponseWriter, r *http.Request) {
	uid, ok, err := auth.CurrentUserID(h.db, r)
	if err != nil || !ok {
		writeJSON(w, http.StatusUnauthorized, errBody("unauthenticated"))
		return
	}
	var dto envelopeDTO
	if err := json.NewDecoder(r.Body).Decode(&dto); err != nil {
		writeJSON(w, http.StatusBadRequest, errBody("invalid request"))
		return
	}
	v, err := decodeEnvelope(dto)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errBody("invalid envelope"))
		return
	}
	if err := Create(h.db, uid, v); err != nil {
		if errors.Is(err, ErrVaultExists) {
			writeJSON(w, http.StatusConflict, errBody("passphrase already set"))
			return
		}
		writeJSON(w, http.StatusInternalServerError, errBody("internal"))
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func decodeEnvelope(dto envelopeDTO) (Vault, error) {
	salt, err := base64.StdEncoding.DecodeString(dto.Salt)
	if err != nil {
		return Vault{}, err
	}
	ver, err := base64.StdEncoding.DecodeString(dto.Verifier)
	if err != nil {
		return Vault{}, err
	}
	if dto.Params == "" {
		return Vault{}, errors.New("missing params")
	}
	return Vault{Salt: salt, Params: dto.Params, Verifer: ver}, nil
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func errBody(msg string) map[string]string {
	return map[string]string{"error": msg}
}
