package auth

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"buckie/internal/db"
)

// postJSONHeaders sends a JSON POST with extra headers (e.g. X-Forwarded-For).
func postJSONHeaders(t *testing.T, url, path string, hdr map[string]string, body any) *http.Response {
	t.Helper()
	b, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	req, err := http.NewRequest(http.MethodPost, url+path, bytes.NewReader(b))
	if err != nil {
		t.Fatalf("new request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	for k, v := range hdr {
		req.Header.Set(k, v)
	}
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("POST %s: %v", path, err)
	}
	return resp
}

// failingSender simulates SMTP being down (EX-ERR-1).
type failingSender struct{}

func (failingSender) Send(_, _ string) error { return errors.New("smtp down") }

// EX-RL-1: distinct forwarded client IPs each get their own bucket, so many
// users behind one proxy can log in within the same hour.
func TestForwardedForKeying(t *testing.T) {
	env := newTestEnv(t)
	for i := 0; i < 15; i++ {
		email := fmt.Sprintf("user%d@example.com", i)
		xff := fmt.Sprintf("203.0.113.%d", i)
		resp := postJSONHeaders(t, env.server.URL, "/api/auth/request-code",
			map[string]string{"X-Forwarded-For": xff},
			map[string]string{"email": email})
		resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("user %d: got %d, want 200", i, resp.StatusCode)
		}
	}
}

// EX-RL-2: up to 100 requests from one forwarded IP are served; the 101st is
// throttled with the truthful message (BR-RL-3).
func TestPerIPCeiling(t *testing.T) {
	env := newTestEnv(t)
	xff := map[string]string{"X-Forwarded-For": "198.51.100.7"}
	for i := 0; i < rateMaxIP; i++ {
		resp := postJSONHeaders(t, env.server.URL, "/api/auth/request-code", xff,
			map[string]string{"email": fmt.Sprintf("ip%d@example.com", i)})
		resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("request %d: got %d, want 200", i, resp.StatusCode)
		}
	}
	resp := postJSONHeaders(t, env.server.URL, "/api/auth/request-code", xff,
		map[string]string{"email": "over@example.com"})
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusTooManyRequests {
		t.Fatalf("over ceiling: got %d, want 429", resp.StatusCode)
	}
	var body map[string]string
	_ = json.NewDecoder(resp.Body).Decode(&body)
	if body["error"] == "" || body["message"] != "" {
		t.Errorf("429 body must carry a truthful error, got %v", body)
	}
}

// BR-RL-2 per-email ceiling: 10 requests for one email (from distinct IPs)
// are served; the 11th is throttled even from a fresh IP.
func TestPerEmailCeiling(t *testing.T) {
	env := newTestEnv(t)
	for i := 0; i < rateMaxEmail; i++ {
		xff := map[string]string{"X-Forwarded-For": fmt.Sprintf("192.0.2.%d", i)}
		resp := postJSONHeaders(t, env.server.URL, "/api/auth/request-code", xff,
			map[string]string{"email": "repeat@example.com"})
		resp.Body.Close()
		if resp.StatusCode != http.StatusOK {
			t.Fatalf("request %d: got %d, want 200", i, resp.StatusCode)
		}
	}
	xff := map[string]string{"X-Forwarded-For": "192.0.2.200"}
	resp := postJSONHeaders(t, env.server.URL, "/api/auth/request-code", xff,
		map[string]string{"email": "repeat@example.com"})
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusTooManyRequests {
		t.Fatalf("email over ceiling: got %d, want 429", resp.StatusCode)
	}
}

// EX-ERR-1: when the mail sender fails, the user is told the email was not
// sent instead of a false success.
func TestSendFailureReturns502(t *testing.T) {
	store, err := db.Open(":memory:")
	if err != nil {
		t.Fatalf("open db: %v", err)
	}
	t.Cleanup(func() { store.Close() })
	srv := httptest.NewServer(NewMux(store, failingSender{}))
	t.Cleanup(srv.Close)

	resp := postJSONHeaders(t, srv.URL, "/api/auth/request-code", nil,
		map[string]string{"email": "maildown@example.com"})
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusBadGateway {
		t.Fatalf("send failure: got %d, want 502", resp.StatusCode)
	}
	var body map[string]string
	_ = json.NewDecoder(resp.Body).Decode(&body)
	if body["error"] == "" {
		t.Error("502 body must explain the email was not sent")
	}
}
