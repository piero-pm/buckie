package vault

import (
	"bytes"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"penny-saver/internal/auth"
	"penny-saver/internal/db"
)

// openTestDB creates a fresh in-memory SQLite DB scoped to the test.
func openTestDB(t *testing.T) *sql.DB {
	t.Helper()
	store, err := db.Open(":memory:")
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}
	t.Cleanup(func() { store.Close() })
	return store
}

// stubSender captures the last OTP code so tests can complete sign-in.
type stubSender struct{ lastCode string }

func (s *stubSender) Send(_, code string) error { s.lastCode = code; return nil }

// newTestServer composes the auth + vault muxes exactly like main.go, over one
// in-memory DB, so vault routes can be exercised behind real session auth.
func newTestServer(t *testing.T) (*httptest.Server, *sql.DB, *stubSender) {
	t.Helper()
	store := openTestDB(t)
	sender := &stubSender{}
	mux := http.NewServeMux()
	mux.Handle("/api/auth/", auth.NewMux(store, sender))
	mux.Handle("/api/vault", NewMux(store))
	srv := httptest.NewServer(mux)
	t.Cleanup(srv.Close)
	return srv, store, sender
}

// signIn completes a full email-OTP sign-in and returns the session cookie.
func signIn(t *testing.T, srv *httptest.Server, sender *stubSender, email string) *http.Cookie {
	t.Helper()
	post(t, srv, "/api/auth/request-code", map[string]string{"email": email})
	resp := post(t, srv, "/api/auth/verify-code",
		map[string]string{"email": email, "code": sender.lastCode})
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("sign in %s: %d", email, resp.StatusCode)
	}
	for _, c := range resp.Cookies() {
		if c.Name == "session" {
			return c
		}
	}
	t.Fatal("no session cookie")
	return nil
}

func post(t *testing.T, srv *httptest.Server, path string, body any) *http.Response {
	t.Helper()
	b, _ := json.Marshal(body)
	resp, err := http.Post(srv.URL+path, "application/json", bytes.NewReader(b))
	if err != nil {
		t.Fatalf("POST %s: %v", path, err)
	}
	return resp
}

// postWithCookie sends an authed POST with the session cookie attached.
func postWithCookie(t *testing.T, srv *httptest.Server, path string, body any, cookie *http.Cookie) *http.Response {
	t.Helper()
	b, _ := json.Marshal(body)
	req, err := http.NewRequest(http.MethodPost, srv.URL+path, bytes.NewReader(b))
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.AddCookie(cookie)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("POST %s: %v", path, err)
	}
	return resp
}

func get(t *testing.T, srv *httptest.Server, path string, cookie *http.Cookie) *http.Response {
	t.Helper()
	req, _ := http.NewRequest(http.MethodGet, srv.URL+path, nil)
	req.AddCookie(cookie)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("GET %s: %v", path, err)
	}
	return resp
}

// sampleEnvelope builds a valid first-time setup envelope for tests.
func sampleEnvelope(t *testing.T) envelopeDTO {
	t.Helper()
	salt := base64.StdEncoding.EncodeToString([]byte("0123456789abcdef"))
	ver := base64.StdEncoding.EncodeToString([]byte("verifier-blob-xxxx"))
	return envelopeDTO{Salt: salt, Params: `{"m":65536,"t":3,"p":1}`, Verifier: ver}
}
