package main

import (
	"log"
	"net/http"
	"os"

	"penny-saver/internal/auth"
	"penny-saver/internal/db"
)

func main() {
	store, err := db.Open(envOr("DB_PATH", "penny-saver.db"))
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer store.Close()

	sender := auth.NewSender()
	mux := auth.NewMux(store, sender)

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
