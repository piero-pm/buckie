package auth

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

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

func mustUpsertUser(t *testing.T, store *sql.DB, email string) int64 {
	t.Helper()
	id, err := upsertUser(store, email)
	if err != nil {
		t.Fatalf("upsert user %s: %v", email, err)
	}
	return id
}

func mustIssueCode(t *testing.T, store *sql.DB, uid int64) string {
	t.Helper()
	code, err := IssueCode(store, uid)
	if err != nil {
		t.Fatalf("issue code: %v", err)
	}
	return code
}

// stubSender captures the last code sent; used in HTTP integration tests.
type stubSender struct {
	lastCode string
}

func (s *stubSender) Send(_, code string) error {
	s.lastCode = code
	return nil
}

// testEnv holds a running httptest server with shared DB and sender.
type testEnv struct {
	server *httptest.Server
	sender *stubSender
	db     *sql.DB
}

func newTestEnv(t *testing.T) *testEnv {
	t.Helper()
	store := openTestDB(t)
	sender := &stubSender{}
	mux := NewMux(store, sender)
	srv := httptest.NewServer(mux)
	t.Cleanup(srv.Close)
	return &testEnv{server: srv, sender: sender, db: store}
}

// postJSON sends a JSON POST and returns the response.
func postJSON(t *testing.T, env *testEnv, path string, body any) *http.Response {
	t.Helper()
	b, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	resp, err := http.Post(env.server.URL+path, "application/json", bytes.NewReader(b))
	if err != nil {
		t.Fatalf("POST %s: %v", path, err)
	}
	return resp
}

// getWithCookie sends a GET with a session cookie and returns the response.
func getWithCookie(t *testing.T, env *testEnv, path string, cookie *http.Cookie) *http.Response {
	t.Helper()
	req, err := http.NewRequest(http.MethodGet, env.server.URL+path, nil)
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	if cookie != nil {
		req.AddCookie(cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("GET %s: %v", path, err)
	}
	return resp
}

// sessionCookie extracts the session cookie from a response.
func sessionCookie(resp *http.Response) *http.Cookie {
	for _, c := range resp.Cookies() {
		if c.Name == cookieName {
			return c
		}
	}
	return nil
}
