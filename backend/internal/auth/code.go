package auth

import (
	"crypto/rand"
	"database/sql"
	"fmt"
	"math/big"
	"time"

	"golang.org/x/crypto/bcrypt"
)

const (
	codeLen     = 6
	codeExpiry  = 10 * time.Minute
	maxAttempts = 5
	bcryptCost  = bcrypt.DefaultCost
)

// VerifyResult encodes the outcome of a code verification attempt.
type VerifyResult int

const (
	VerifyOK       VerifyResult = iota
	VerifyWrong                 // incorrect code, attempt recorded
	VerifyExpired               // validity window has passed
	VerifyCapped                // attempt limit reached; request a new code
	VerifyNotFound              // no active code for this user
)

// IssueCode generates a 6-digit code for the user, invalidates prior codes,
// and returns the plaintext code for delivery. Only the hash is persisted.
func IssueCode(db *sql.DB, userID int64) (string, error) {
	code, err := generateCode()
	if err != nil {
		return "", err
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(code), bcryptCost)
	if err != nil {
		return "", err
	}
	_, err = db.Exec(
		`UPDATE otp_codes SET consumed = 1 WHERE user_id = ? AND consumed = 0`,
		userID,
	)
	if err != nil {
		return "", err
	}
	_, err = db.Exec(
		`INSERT INTO otp_codes (user_id, code_hash, expires_at) VALUES (?, ?, ?)`,
		userID, string(hash), time.Now().Add(codeExpiry),
	)
	return code, err
}

// VerifyCode checks the submitted code against the user's active code.
func VerifyCode(db *sql.DB, userID int64, code string) (VerifyResult, error) {
	var id int64
	var hash string
	var expiresAt time.Time
	var attempts int

	row := db.QueryRow(
		`SELECT id, code_hash, expires_at, attempts FROM otp_codes
		 WHERE user_id = ? AND consumed = 0
		 ORDER BY created_at DESC LIMIT 1`,
		userID,
	)
	if err := row.Scan(&id, &hash, &expiresAt, &attempts); err == sql.ErrNoRows {
		return VerifyNotFound, nil
	} else if err != nil {
		return VerifyNotFound, err
	}
	if attempts >= maxAttempts {
		return VerifyCapped, nil
	}
	if time.Now().After(expiresAt) {
		return VerifyExpired, nil
	}
	if _, err := db.Exec(`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?`, id); err != nil {
		return VerifyNotFound, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(code)); err != nil {
		return VerifyWrong, nil
	}
	_, err := db.Exec(`UPDATE otp_codes SET consumed = 1 WHERE id = ?`, id)
	return VerifyOK, err
}

func generateCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%0*d", codeLen, n), nil
}
