package vault

import (
	"encoding/base64"
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

// BR-PASS-2 (TICKET-034): PUT overwrites the stored envelope.
func TestReplaceEnvelope(t *testing.T) {
	srv, _, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "changer@example.com")

	postWithCookie(t, srv, "/api/vault", sampleEnvelope(t), cookie).Body.Close()

	next := envelopeDTO{
		Salt:     base64.StdEncoding.EncodeToString([]byte("fedcba9876543210")),
		Params:   `{"m":65536,"t":3,"p":1}`,
		Verifier: base64.StdEncoding.EncodeToString([]byte("new-verifier-blob")),
	}
	put := putWithCookie(t, srv, "/api/vault", next, cookie)
	put.Body.Close()
	if put.StatusCode != http.StatusNoContent {
		t.Fatalf("replace: got %d, want 204", put.StatusCode)
	}

	got := get(t, srv, "/api/vault", cookie)
	defer got.Body.Close()
	var body map[string]any
	_ = json.NewDecoder(got.Body).Decode(&body)
	if body["verifier"] != next.Verifier || body["salt"] != next.Salt {
		t.Errorf("GET after replace should show the new envelope, got %v", body)
	}
}

// BR-PASS-2: replacement is repeatable — a second PUT also succeeds (no 409).
func TestReplaceRepeatable(t *testing.T) {
	srv, _, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "twice@example.com")

	postWithCookie(t, srv, "/api/vault", sampleEnvelope(t), cookie).Body.Close()
	putWithCookie(t, srv, "/api/vault", sampleEnvelope(t), cookie).Body.Close()
	second := putWithCookie(t, srv, "/api/vault", sampleEnvelope(t), cookie)
	second.Body.Close()
	if second.StatusCode != http.StatusNoContent {
		t.Fatalf("second replace: got %d, want 204", second.StatusCode)
	}
}

// PUT without a session is refused 401 and changes nothing.
func TestReplaceUnauthenticatedRefused(t *testing.T) {
	srv, _, sender := newTestServer(t)
	cookie := signIn(t, srv, sender, "locked@example.com")
	postWithCookie(t, srv, "/api/vault", sampleEnvelope(t), cookie).Body.Close()

	req, err := http.NewRequest(http.MethodPut, srv.URL+"/api/vault", nil)
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	anon, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("PUT: %v", err)
	}
	anon.Body.Close()
	if anon.StatusCode != http.StatusUnauthorized {
		t.Fatalf("unauth replace: got %d, want 401", anon.StatusCode)
	}

	got := get(t, srv, "/api/vault", cookie)
	defer got.Body.Close()
	var body map[string]any
	_ = json.NewDecoder(got.Body).Decode(&body)
	if body["hasPassphrase"] != true {
		t.Error("unauthenticated PUT must not disturb the stored vault")
	}
}
