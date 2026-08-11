package vault

import (
	"database/sql"
	"errors"
)

// ErrVaultExists is returned by Create when a vault already exists for the user.
// Setup is a one-shot operation; a second setup is refused (EX-PASS-1 guard).
var ErrVaultExists = errors.New("vault already exists")

// Vault is the non-secret per-user envelope persisted server-side. The salt and
// params let any device re-derive the key; the verifier is a ciphertext blob
// whose successful decrypt proves the passphrase. None of this is secret.
type Vault struct {
	Salt    []byte
	Params  string
	Verifer []byte
}

// Get returns the user's vault envelope, or ok=false if none exists yet.
func Get(db *sql.DB, userID int64) (Vault, bool, error) {
	var v Vault
	err := db.QueryRow(
		`SELECT kdf_salt, kdf_params, verifier FROM user_vaults WHERE user_id = ?`,
		userID,
	).Scan(&v.Salt, &v.Params, &v.Verifer)
	if err == sql.ErrNoRows {
		return Vault{}, false, nil
	}
	if err != nil {
		return Vault{}, false, err
	}
	return v, true, nil
}

// Create stores a user's vault envelope. It fails with ErrVaultExists if a vault
// is already present (PRIMARY KEY user_id), preserving the one-setup invariant.
func Create(db *sql.DB, userID int64, v Vault) error {
	_, err := db.Exec(
		`INSERT INTO user_vaults (user_id, kdf_salt, kdf_params, verifier) VALUES (?, ?, ?, ?)`,
		userID, v.Salt, v.Params, v.Verifer,
	)
	if err != nil && isUniqueConstraint(err) {
		return ErrVaultExists
	}
	return err
}
