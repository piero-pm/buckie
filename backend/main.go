package main

import (
	"log"
	"net/http"
	"os"

	"buckie/internal/auth"
	"buckie/internal/db"
	"buckie/internal/records"
	"buckie/internal/vault"
)

func main() {
	store, err := db.Open(envOr("DB_PATH", "buckie.db"))
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer store.Close()

	// One top-level mux composes the auth, vault, and records route groups, then
	// serves the built SPA for everything else.
	mux := http.NewServeMux()
	mux.HandleFunc("/health", health)
	mux.Handle("/api/auth/", auth.NewMux(store, auth.NewSender()))
	mux.Handle("/api/vault", vault.NewMux(store))
	mux.Handle("/api/records", records.NewMux(store))
	mux.Handle("/api/records/", records.NewMux(store))

	staticDir := envOr("STATIC_DIR", "frontend/dist")
	mux.Handle("/", http.FileServer(http.Dir(staticDir)))

	addr := envOr("ADDR", ":8080")
	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

func envOr(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

// health answers unauthenticated liveness for uptime checks (BR-HARD-2).
func health(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("ok"))
}
