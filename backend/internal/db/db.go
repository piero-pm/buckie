package db

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

const schema = `
CREATE TABLE IF NOT EXISTS users (
	id         INTEGER  PRIMARY KEY AUTOINCREMENT,
	email      TEXT     UNIQUE NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS otp_codes (
	id         INTEGER  PRIMARY KEY AUTOINCREMENT,
	user_id    INTEGER  NOT NULL REFERENCES users(id),
	code_hash  TEXT     NOT NULL,
	expires_at DATETIME NOT NULL,
	attempts   INTEGER  NOT NULL DEFAULT 0,
	consumed   INTEGER  NOT NULL DEFAULT 0,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
	id         TEXT     PRIMARY KEY,
	user_id    INTEGER  NOT NULL REFERENCES users(id),
	expires_at DATETIME NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Host-blind vault: the server stores only non-secret KDF material and a
-- ciphertext verifier per user. The passphrase and derived key never arrive
-- (ADR-002/003). One row per user (PRIMARY KEY user_id) => at most one setup.
CREATE TABLE IF NOT EXISTS user_vaults (
	user_id     INTEGER  PRIMARY KEY REFERENCES users(id),
	kdf_salt    BLOB     NOT NULL,
	kdf_params  TEXT     NOT NULL,
	verifier    BLOB     NOT NULL,
	created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Generic per-user encrypted-record store (delivery-brief §3). Each row is an
-- opaque ciphertext blob the server cannot read; the kind column separates
-- record types (expense vs recurring template). All domain logic runs client-side;
-- this table only persists what the user's client encrypted.
CREATE TABLE IF NOT EXISTS records (
	id         TEXT     PRIMARY KEY,
	user_id    INTEGER  NOT NULL REFERENCES users(id),
	kind       TEXT     NOT NULL,
	ciphertext BLOB     NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS records_user_kind ON records (user_id, kind);
`

// Open returns a configured SQLite database with schema applied.
func Open(path string) (*sql.DB, error) {
	d, err := sql.Open("sqlite", path)
	if err != nil {
		return nil, err
	}
	d.SetMaxOpenConns(1) // SQLite is single-writer
	if _, err = d.Exec(schema); err != nil {
		d.Close()
		return nil, err
	}
	return d, nil
}
