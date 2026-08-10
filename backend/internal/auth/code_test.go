package auth

import (
	"testing"
	"time"
)

// TestIssueAndVerify: a fresh code verifies successfully.
func TestIssueAndVerify(t *testing.T) {
	store := openTestDB(t)
	uid := mustUpsertUser(t, store, "a@example.com")

	code := mustIssueCode(t, store, uid)
	result, err := VerifyCode(store, uid, code)
	if err != nil {
		t.Fatalf("verify: %v", err)
	}
	if result != VerifyOK {
		t.Errorf("got %d, want VerifyOK", result)
	}
}

// TestWrongCode: an incorrect code is refused and does not start a session.
func TestWrongCode(t *testing.T) {
	store := openTestDB(t)
	uid := mustUpsertUser(t, store, "b@example.com")
	mustIssueCode(t, store, uid)

	result, err := VerifyCode(store, uid, "000000")
	if err != nil {
		t.Fatalf("verify: %v", err)
	}
	if result != VerifyWrong {
		t.Errorf("got %d, want VerifyWrong", result)
	}
}

// TestExpiredCode: a code past its window is refused with VerifyExpired.
func TestExpiredCode(t *testing.T) {
	store := openTestDB(t)
	uid := mustUpsertUser(t, store, "c@example.com")
	code := mustIssueCode(t, store, uid)

	_, err := store.Exec(
		`UPDATE otp_codes SET expires_at = ? WHERE user_id = ? AND consumed = 0`,
		time.Now().Add(-time.Minute), uid,
	)
	if err != nil {
		t.Fatalf("expire: %v", err)
	}

	result, err := VerifyCode(store, uid, code)
	if err != nil {
		t.Fatalf("verify: %v", err)
	}
	if result != VerifyExpired {
		t.Errorf("got %d, want VerifyExpired", result)
	}
}

// TestAttemptCap: after maxAttempts wrong codes the next attempt is capped.
func TestAttemptCap(t *testing.T) {
	store := openTestDB(t)
	uid := mustUpsertUser(t, store, "d@example.com")
	mustIssueCode(t, store, uid)

	for i := range maxAttempts {
		result, err := VerifyCode(store, uid, "000000")
		if err != nil {
			t.Fatalf("attempt %d: %v", i, err)
		}
		if result != VerifyWrong {
			t.Errorf("attempt %d: got %d, want VerifyWrong", i, result)
		}
	}

	result, err := VerifyCode(store, uid, "000000")
	if err != nil {
		t.Fatalf("capped attempt: %v", err)
	}
	if result != VerifyCapped {
		t.Errorf("got %d, want VerifyCapped", result)
	}
}

// TestCodeReplacement: issuing a new code invalidates the prior code.
func TestCodeReplacement(t *testing.T) {
	store := openTestDB(t)
	uid := mustUpsertUser(t, store, "e@example.com")

	old := mustIssueCode(t, store, uid)
	mustIssueCode(t, store, uid) // replaces old

	result, err := VerifyCode(store, uid, old)
	if err != nil {
		t.Fatalf("verify old: %v", err)
	}
	if result != VerifyNotFound && result != VerifyWrong {
		t.Errorf("old code not invalidated: got %d", result)
	}
}
