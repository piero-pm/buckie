package main

import (
	"net/http"
	"net/http/httptest"
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
