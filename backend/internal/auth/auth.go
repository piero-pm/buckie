package auth

import (
	"database/sql"
	"net/http"
)

// CurrentUserID resolves the authenticated user for a request, or returns
// ok=false when there is no valid session. Shared by auth and vault handlers so
// every session-gated route reads the session cookie the same way.
func CurrentUserID(db *sql.DB, r *http.Request) (int64, bool, error) {
	c, err := r.Cookie(cookieName)
	if err != nil {
		return 0, false, nil
	}
	return ValidateSession(db, c.Value)
}
