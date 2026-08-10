package auth

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"time"
)

const sessionLifetime = 30 * 24 * time.Hour

// CreateSession mints a random session token, stores it, and returns it.
func CreateSession(db *sql.DB, userID int64) (string, error) {
	token, err := newToken()
	if err != nil {
		return "", err
	}
	_, err = db.Exec(
		`INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`,
		token, userID, time.Now().Add(sessionLifetime),
	)
	return token, err
}

// ValidateSession returns the user ID and true when the token exists and is not expired.
func ValidateSession(db *sql.DB, token string) (int64, bool, error) {
	var userID int64
	var expiresAt time.Time
	err := db.QueryRow(
		`SELECT user_id, expires_at FROM sessions WHERE id = ?`, token,
	).Scan(&userID, &expiresAt)
	if err == sql.ErrNoRows {
		return 0, false, nil
	}
	if err != nil {
		return 0, false, err
	}
	if time.Now().After(expiresAt) {
		return 0, false, nil
	}
	return userID, true, nil
}

// DeleteSession removes the session unconditionally.
func DeleteSession(db *sql.DB, token string) error {
	_, err := db.Exec(`DELETE FROM sessions WHERE id = ?`, token)
	return err
}

func newToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
