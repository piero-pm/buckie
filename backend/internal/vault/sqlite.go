package vault

import (
	"strings"
)

// isUniqueConstraint reports whether err is a SQLite UNIQUE/PK violation.
// modernc.org/sqlite returns these with the SQLite error text "UNIQUE constraint".
func isUniqueConstraint(err error) bool {
	if err == nil {
		return false
	}
	return strings.Contains(err.Error(), "UNIQUE constraint")
}
