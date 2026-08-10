package auth

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"net/mail"
	"time"
)

const cookieName = "session"

// NewMux returns a ServeMux with all API routes registered.
func NewMux(db *sql.DB, sender CodeSender) *http.ServeMux {
	h := &handler{db: db, sender: sender, limiter: newRateLimiter()}
	mux := http.NewServeMux()
	mux.HandleFunc("POST /api/auth/request-code", h.requestCode)
	mux.HandleFunc("POST /api/auth/verify-code", h.verifyCode)
	mux.HandleFunc("POST /api/auth/sign-out", h.signOut)
	mux.HandleFunc("GET /api/auth/me", h.me)
	return mux
}

type handler struct {
	db      *sql.DB
	sender  CodeSender
	limiter *rateLimiter
}

func (h *handler) requestCode(w http.ResponseWriter, r *http.Request) {
	var req struct{ Email string }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || !validEmail(req.Email) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid email"})
		return
	}
	if !h.limiter.allowCodeRequest(req.Email, r.RemoteAddr) {
		writeJSON(w, http.StatusTooManyRequests, map[string]string{"message": "a code was sent"})
		return
	}
	uid, err := upsertUser(h.db, req.Email)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal"})
		return
	}
	code, err := IssueCode(h.db, uid)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal"})
		return
	}
	_ = h.sender.Send(req.Email, code)
	writeJSON(w, http.StatusOK, map[string]string{"message": "a code was sent"})
}

func (h *handler) verifyCode(w http.ResponseWriter, r *http.Request) {
	var req struct{ Email, Code string }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || !validEmail(req.Email) {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request"})
		return
	}
	uid, err := userIDByEmail(h.db, req.Email)
	if err != nil || uid == 0 {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid or expired code"})
		return
	}
	result, err := VerifyCode(h.db, uid, req.Code)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal"})
		return
	}
	switch result {
	case VerifyOK:
		token, err := CreateSession(h.db, uid)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal"})
			return
		}
		setSessionCookie(w, token)
		writeJSON(w, http.StatusOK, map[string]string{"message": "signed in"})
	case VerifyExpired:
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "expired code, request a new one"})
	case VerifyCapped:
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "too many attempts, request a new code"})
	default:
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid or expired code"})
	}
}

func (h *handler) signOut(w http.ResponseWriter, r *http.Request) {
	if c, err := r.Cookie(cookieName); err == nil {
		_ = DeleteSession(h.db, c.Value)
	}
	clearSessionCookie(w)
	w.WriteHeader(http.StatusNoContent)
}

func (h *handler) me(w http.ResponseWriter, r *http.Request) {
	c, err := r.Cookie(cookieName)
	if err != nil {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthenticated"})
		return
	}
	uid, ok, err := ValidateSession(h.db, c.Value)
	if err != nil || !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthenticated"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]int64{"user_id": uid})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func validEmail(email string) bool {
	if len(email) > 254 {
		return false
	}
	_, err := mail.ParseAddress(email)
	return err == nil
}

func setSessionCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    token,
		Path:     "/",
		Expires:  time.Now().Add(sessionLifetime),
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}

func clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     cookieName,
		Value:    "",
		Path:     "/",
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteLaxMode,
	})
}
