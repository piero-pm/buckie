package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// BR-HARD-2: /health answers 200 "ok" without authentication.
func TestHealth(t *testing.T) {
	rec := httptest.NewRecorder()
	health(rec, httptest.NewRequest(http.MethodGet, "/health", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("health: got %d, want 200", rec.Code)
	}
	if rec.Body.String() != "ok" {
		t.Errorf("health body: got %q, want ok", rec.Body.String())
	}
}

// BR-ROUTE-1 (WORK-007): unknown non-/api paths serve the SPA index so
// client routes survive refresh; real files still serve directly.
func TestSpaFallback(t *testing.T) {
	dir := t.TempDir()
	files := map[string]string{
		"index.html": "<html>spa</html>",
		"app.js":     "console.log(1)",
	}
	for name, body := range files {
		if err := os.WriteFile(filepath.Join(dir, name), []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	handler := spaFallback(http.Dir(dir))

	for _, tc := range []struct {
		path string
		want string
	}{
		{"/app.js", "console.log(1)"},     // real file serves
		{"/", "<html>spa</html>"},         // root serves index
		{"/expenses", "<html>spa</html>"}, // client route falls back
	} {
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, tc.path, nil))
		if !strings.Contains(rec.Body.String(), tc.want) {
			t.Errorf("%s: body %q, want %q", tc.path, rec.Body.String(), tc.want)
		}
	}
}
