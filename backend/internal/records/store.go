package records

import (
	"database/sql"
	"strings"
)

// Kind labels the record type. The server treats this as opaque grouping only;
// the payload is ciphertext the server cannot read.
const (
	KindExpense   = "expense"
	KindRecurring = "recurring"
	KindIncome    = "income" // income sources (TICKET-020); payload stays opaque
)

// Record is one opaque encrypted blob. Ciphertext is produced by the client's
// crypto module; the server never decrypts it.
type Record struct {
	ID         string
	Kind       string
	Ciphertext []byte
}

// List returns all of a user's records of the given kind, oldest first.
func List(db *sql.DB, userID int64, kind string) ([]Record, error) {
	rows, err := db.Query(
		`SELECT id, ciphertext FROM records WHERE user_id = ? AND kind = ? ORDER BY created_at`,
		userID, kind,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Record
	for rows.Next() {
		var r Record
		if err := rows.Scan(&r.ID, &r.Ciphertext); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}

// Put inserts or replaces a record (upsert by id). The client owns the id.
// Re-upload also refreshes the kind column so it never drifts from the
// payload's actual type (BR-HARD-3).
func Put(db *sql.DB, userID int64, r Record) error {
	_, err := db.Exec(
		`INSERT INTO records (id, user_id, kind, ciphertext, updated_at)
		 VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
		 ON CONFLICT(id) DO UPDATE SET kind = excluded.kind, ciphertext = excluded.ciphertext, updated_at = CURRENT_TIMESTAMP
		 WHERE records.user_id = ?`,
		r.ID, userID, r.Kind, r.Ciphertext, userID,
	)
	return err
}

// Delete removes a record, scoped to the acting user (no cross-user delete).
func Delete(db *sql.DB, userID int64, id string) error {
	_, err := db.Exec(`DELETE FROM records WHERE id = ? AND user_id = ?`, id, userID)
	return err
}

// validKind reports whether kind is one of the known record types.
func validKind(kind string) bool {
	return kind == KindExpense || kind == KindRecurring || kind == KindIncome
}

// isUniqueConstraint reports whether err is a SQLite UNIQUE/PK violation.
func isUniqueConstraint(err error) bool {
	return err != nil && strings.Contains(err.Error(), "UNIQUE constraint")
}
