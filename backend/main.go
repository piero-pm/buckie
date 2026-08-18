package main

import (
	"log"
	"net/http"
	"os"
	"strings"

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
	mux.Handle("/", spaFallback(http.Dir(staticDir)))

	addr := envOr("ADDR", ":8080")
	log.Printf("listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}

// spaFallback serves static files, falling back to index.html for unknown
// non-/api paths so client-side routes (e.g. /expenses) survive refresh and
// deep links (WORK-007 BR-ROUTE-1).
func spaFallback(root http.FileSystem) http.Handler {
	files := http.FileServer(root)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		path := strings.TrimPrefix(r.URL.Path, "/")
		if path != "" {
			if f, err := root.Open(path); err == nil {
				f.Close()
				files.ServeHTTP(w, r)
				return
			}
		}
		index := r.Clone(r.Context())
		index.URL.Path = "/"
		files.ServeHTTP(w, index)
	})
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
