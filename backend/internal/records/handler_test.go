package records

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

func openTestDB(t *testing.T) *sql.DB {
	t.Helper()
	store, err := db.Open(":memory:")
	if err != nil {
		t.Fatalf("open test db: %v", err)
	}
	t.Cleanup(func() { store.Close() })
	return store
}

type stubSender struct{ lastCode string }

func (s *stubSender) Send(_, code string) error { s.lastCode = code; return nil }

// newTestServer composes auth + records muxes over one in-memory DB.
func newTestServer(t *testing.T) (*httptest.Server, *stubSender) {
	t.Helper()
	store := openTestDB(t)
	sender := &stubSender{}
	mux := http.NewServeMux()
	mux.Handle("/api/auth/", auth.NewMux(store, sender))
	mux.Handle("/api/records", NewMux(store))
	mux.Handle("/api/records/", NewMux(store))
	srv := httptest.NewServer(mux)
	t.Cleanup(srv.Close)
	return srv, sender
}

func signIn(t *testing.T, srv *httptest.Server, sender *stubSender, email string) *http.Cookie {
	t.Helper()
	post(t, srv, "/api/auth/request-code", map[string]string{"email": email})
	resp := post(t, srv, "/api/auth/verify-code",
		map[string]string{"email": email, "code": sender.lastCode})
	defer resp.Body.Close()
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

func do(t *testing.T, method, url string, body any, cookie *http.Cookie) *http.Response {
	t.Helper()
	var rd *bytes.Reader
	if body != nil {
		b, _ := json.Marshal(body)
		rd = bytes.NewReader(b)
	} else {
		rd = bytes.NewReader(nil)
	}
	req, err := http.NewRequest(method, url, rd)
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	if cookie != nil {
		req.AddCookie(cookie)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("%s %s: %v", method, url, err)
	}
	return resp
}

// dto builds a valid encrypted-record request body.
func dto(id string) recordDTO {
	return recordDTO{
		ID:         id,
		Kind:       KindExpense,
		Ciphertext: base64.StdEncoding.EncodeToString([]byte("encrypted-blob")),
	}
}
