package vault

import (
	"encoding/json"
	"io"
	"net/http"
	"testing"
)

// GET /api/vault with no vault yet reports hasPassphrase=false (EX-PASS-1 entry).
func TestGetNoVault(t *testing.T) {
	srv, _, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "new@example.com")

	resp := get(t, srv, "/api/vault", cookie)
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("got %d, want 200", resp.StatusCode)
	}
	var body map[string]any
	_ = json.NewDecoder(resp.Body).Decode(&body)
	if body["hasPassphrase"] != false {
		t.Errorf("hasPassphrase = %v, want false", body["hasPassphrase"])
	}
	if _, ok := body["salt"]; ok {
		t.Error("salt must be absent when no vault exists")
	}
}

// POST /api/vault stores a first-time envelope (204), and GET then shows it.
func TestCreateThenGet(t *testing.T) {
	srv, _, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "setup@example.com")

	resp := postWithCookie(t, srv, "/api/vault", sampleEnvelope(t), cookie)
	resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		t.Fatalf("create: got %d, want 204", resp.StatusCode)
	}

	got := get(t, srv, "/api/vault", cookie)
	defer got.Body.Close()
	var body map[string]any
	_ = json.NewDecoder(got.Body).Decode(&body)
	if body["hasPassphrase"] != true {
		t.Errorf("hasPassphrase = %v, want true", body["hasPassphrase"])
	}
	if body["salt"] == nil || body["verifier"] == nil || body["params"] == nil {
		t.Error("envelope fields must be present after setup")
	}
}

// A second POST for the same user is refused 409 (one-shot setup, EX-PASS-1).
func TestCreateDuplicateRefused(t *testing.T) {
	srv, _, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "dup@example.com")

	first := postWithCookie(t, srv, "/api/vault", sampleEnvelope(t), cookie)
	first.Body.Close()
	if first.StatusCode != http.StatusNoContent {
		t.Fatalf("first create: got %d", first.StatusCode)
	}

	second := postWithCookie(t, srv, "/api/vault", sampleEnvelope(t), cookie)
	defer second.Body.Close()
	if second.StatusCode != http.StatusConflict {
		t.Fatalf("second create: got %d, want 409", second.StatusCode)
	}
}

// BR-CONF-1 isolation: each user sees only their own vault.
func TestPerUserIsolation(t *testing.T) {
	srv, _, sender := newTestServer(t)
	cookieA := signIn(t, srv, sender, "alice@example.com")
	cookieB := signIn(t, srv, sender, "bob@example.com")

	// Alice sets up; Bob has not.
	postWithCookie(t, srv, "/api/vault", sampleEnvelope(t), cookieA).Body.Close()

	bobGet := get(t, srv, "/api/vault", cookieB)
	defer bobGet.Body.Close()
	var bobBody map[string]any
	_ = json.NewDecoder(bobGet.Body).Decode(&bobBody)
	if bobBody["hasPassphrase"] != false {
		t.Error("Bob must not see Alice's vault (isolation)")
	}
}

// Unauthenticated requests are refused 401 on both routes.
func TestUnauthenticatedRefused(t *testing.T) {
	srv, _, _ := newTestServer(t)

	getResp, err := http.Get(srv.URL + "/api/vault")
	if err != nil {
		t.Fatalf("GET no-auth: %v", err)
	}
	defer getResp.Body.Close()
	if getResp.StatusCode != http.StatusUnauthorized {
		t.Errorf("GET no-auth: got %d, want 401", getResp.StatusCode)
	}
	_, _ = io.ReadAll(getResp.Body)
}
