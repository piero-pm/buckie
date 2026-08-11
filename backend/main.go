package main

import (
	"log"
	"net/http"
	"os"

	"penny-saver/internal/auth"
	"penny-saver/internal/db"
	"penny-saver/internal/vault"
)

func main() {
	store, err := db.Open(envOr("DB_PATH", "penny-saver.db"))
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer store.Close()

	// One top-level mux composes the auth and vault route groups, then serves
	// the built SPA for everything else.
	mux := http.NewServeMux()
	mux.Handle("/api/auth/", auth.NewMux(store, auth.NewSender()))
	mux.Handle("/api/vault", vault.NewMux(store))

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
