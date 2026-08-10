package auth

import "database/sql"

// upsertUser returns the user ID for the email, creating the record if absent.
func upsertUser(db *sql.DB, email string) (int64, error) {
	_, err := db.Exec(
		`INSERT INTO users (email) VALUES (?) ON CONFLICT(email) DO NOTHING`,
		email,
	)
	if err != nil {
		return 0, err
	}
	var id int64
	err = db.QueryRow(`SELECT id FROM users WHERE email = ?`, email).Scan(&id)
	return id, err
}

// userIDByEmail returns 0 without error when the email is not registered.
func userIDByEmail(db *sql.DB, email string) (int64, error) {
	var id int64
	err := db.QueryRow(`SELECT id FROM users WHERE email = ?`, email).Scan(&id)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	return id, err
}
