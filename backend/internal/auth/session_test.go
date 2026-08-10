package auth

import (
	"testing"
	"time"
)

// TestCreateAndValidateSession: a fresh session validates for the correct user.
func TestCreateAndValidateSession(t *testing.T) {
	store := openTestDB(t)
	uid := mustUpsertUser(t, store, "sess@example.com")

	token, err := CreateSession(store, uid)
	if err != nil {
		t.Fatalf("create: %v", err)
	}

	gotUID, ok, err := ValidateSession(store, token)
	if err != nil {
		t.Fatalf("validate: %v", err)
	}
	if !ok {
		t.Fatal("session should be valid")
	}
	if gotUID != uid {
		t.Errorf("user_id: got %d, want %d", gotUID, uid)
	}
}

// TestExpiredSession: a session past its lifetime is rejected.
func TestExpiredSession(t *testing.T) {
	store := openTestDB(t)
	uid := mustUpsertUser(t, store, "exp@example.com")

	token, err := CreateSession(store, uid)
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	_, err = store.Exec(
		`UPDATE sessions SET expires_at = ? WHERE id = ?`,
		time.Now().Add(-time.Minute), token,
	)
	if err != nil {
		t.Fatalf("expire: %v", err)
	}

	_, ok, err := ValidateSession(store, token)
	if err != nil {
		t.Fatalf("validate: %v", err)
	}
	if ok {
		t.Error("expired session should be invalid")
	}
}

// TestDeleteSession: deleting a session makes it invalid immediately.
func TestDeleteSession(t *testing.T) {
	store := openTestDB(t)
	uid := mustUpsertUser(t, store, "del@example.com")

	token, err := CreateSession(store, uid)
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if err := DeleteSession(store, token); err != nil {
		t.Fatalf("delete: %v", err)
	}

	_, ok, err := ValidateSession(store, token)
	if err != nil {
		t.Fatalf("validate: %v", err)
	}
	if ok {
		t.Error("deleted session should be invalid")
	}
}
