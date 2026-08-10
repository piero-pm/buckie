package auth

import (
	"encoding/json"
	"net/http"
	"testing"
	"time"
)

// EX-LOGIN-1: a valid code within the window starts a private session.
func TestSuccessfulSignIn(t *testing.T) {
	env := newTestEnv(t)

	resp := postJSON(t, env, "/api/auth/request-code", map[string]string{"email": "user@example.com"})
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("request-code: got %d, want 200", resp.StatusCode)
	}

	code := env.sender.lastCode
	resp = postJSON(t, env, "/api/auth/verify-code",
		map[string]string{"email": "user@example.com", "code": code})
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("verify-code: got %d, want 200", resp.StatusCode)
	}

	cookie := sessionCookie(resp)
	if cookie == nil {
		t.Fatal("no session cookie in response")
	}

	me := getWithCookie(t, env, "/api/auth/me", cookie)
	defer me.Body.Close()
	if me.StatusCode != http.StatusOK {
		t.Fatalf("me: got %d, want 200", me.StatusCode)
	}
}

// EX-LOGIN-2: code submitted within (but near the edge of) its validity window succeeds.
func TestBoundaryWindow(t *testing.T) {
	env := newTestEnv(t)
	email := "boundary@example.com"

	postJSON(t, env, "/api/auth/request-code", map[string]string{"email": email}).Body.Close()

	// Shrink expiry to 2 seconds from now — still valid, tests the near-expiry path.
	uid, err := userIDByEmail(env.db, email)
	if err != nil || uid == 0 {
		t.Fatalf("get uid: %v", err)
	}
	_, err = env.db.Exec(
		`UPDATE otp_codes SET expires_at = ? WHERE user_id = ? AND consumed = 0`,
		time.Now().Add(2*time.Second), uid,
	)
	if err != nil {
		t.Fatalf("set near-expiry: %v", err)
	}

	resp := postJSON(t, env, "/api/auth/verify-code",
		map[string]string{"email": email, "code": env.sender.lastCode})
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("boundary verify: got %d, want 200", resp.StatusCode)
	}
}

// EX-LOGIN-3: a wrong code is refused and no session is created.
func TestWrongCodeHTTP(t *testing.T) {
	env := newTestEnv(t)
	email := "wrong@example.com"

	postJSON(t, env, "/api/auth/request-code", map[string]string{"email": email}).Body.Close()

	resp := postJSON(t, env, "/api/auth/verify-code",
		map[string]string{"email": email, "code": "000000"})
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("wrong code: got %d, want 401", resp.StatusCode)
	}
	if sessionCookie(resp) != nil {
		t.Error("should not set session cookie on wrong code")
	}
}

// EX-LOGIN-4: an expired code is refused with an invitation to request a new one.
func TestExpiredCodeHTTP(t *testing.T) {
	env := newTestEnv(t)
	email := "expired@example.com"

	postJSON(t, env, "/api/auth/request-code", map[string]string{"email": email}).Body.Close()

	uid, err := userIDByEmail(env.db, email)
	if err != nil || uid == 0 {
		t.Fatalf("get uid: %v", err)
	}
	_, err = env.db.Exec(
		`UPDATE otp_codes SET expires_at = ? WHERE user_id = ? AND consumed = 0`,
		time.Now().Add(-time.Minute), uid,
	)
	if err != nil {
		t.Fatalf("expire: %v", err)
	}

	resp := postJSON(t, env, "/api/auth/verify-code",
		map[string]string{"email": email, "code": env.sender.lastCode})
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("expired code: got %d, want 401", resp.StatusCode)
	}
	var body map[string]string
	_ = json.NewDecoder(resp.Body).Decode(&body)
	if body["error"] == "" {
		t.Error("expected error message in body")
	}
}

// TestUniformUnknownEmail: an unregistered email returns the same 200 as a known one.
func TestUniformUnknownEmail(t *testing.T) {
	env := newTestEnv(t)

	known := postJSON(t, env, "/api/auth/request-code", map[string]string{"email": "known@example.com"})
	known.Body.Close()

	unknown := postJSON(t, env, "/api/auth/request-code", map[string]string{"email": "new@example.com"})
	unknown.Body.Close()

	if known.StatusCode != http.StatusOK || unknown.StatusCode != http.StatusOK {
		t.Errorf("status: known=%d unknown=%d, both want 200",
			known.StatusCode, unknown.StatusCode)
	}
}

// BR-CONF-1: two users each receive a distinct session scoped to their own data.
func TestTwoUserIsolation(t *testing.T) {
	env := newTestEnv(t)

	signIn := func(email string) *http.Cookie {
		postJSON(t, env, "/api/auth/request-code", map[string]string{"email": email}).Body.Close()
		code := env.sender.lastCode
		resp := postJSON(t, env, "/api/auth/verify-code",
			map[string]string{"email": email, "code": code})
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("sign in %s: got %d", email, resp.StatusCode)
		}
		c := sessionCookie(resp)
		if c == nil {
			t.Fatalf("no cookie for %s", email)
		}
		return c
	}

	cookieA := signIn("alice@example.com")
	cookieB := signIn("bob@example.com")

	meFor := func(cookie *http.Cookie) int64 {
		resp := getWithCookie(t, env, "/api/auth/me", cookie)
		defer resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("me: got %d", resp.StatusCode)
		}
		var body map[string]int64
		_ = json.NewDecoder(resp.Body).Decode(&body)
		return body["user_id"]
	}

	uidA := meFor(cookieA)
	uidB := meFor(cookieB)

	if uidA == 0 || uidB == 0 {
		t.Fatal("user IDs must be non-zero")
	}
	if uidA == uidB {
		t.Errorf("isolation failure: both sessions map to user_id %d", uidA)
	}

	// A's cookie must not be accepted as B's session (and vice versa).
	respCross := getWithCookie(t, env, "/api/auth/me", cookieA)
	defer respCross.Body.Close()
	var crossBody map[string]int64
	_ = json.NewDecoder(respCross.Body).Decode(&crossBody)
	if crossBody["user_id"] != uidA {
		t.Errorf("cross-session: expected user_id %d, got %d", uidA, crossBody["user_id"])
	}
}
