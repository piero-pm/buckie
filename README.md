# Penny Saver

Passwordless spending tracker for ~5 self-hosted users.

## Running locally

### Prerequisites

- Go 1.22+
- Node.js 20+

### Backend (API + static server)

```sh
cd backend
go run .
```

The server listens on `:8080` by default.

### Frontend (dev mode with hot reload)

```sh
cd frontend
npm install
npm run dev
```

Vite runs on port 5173 and proxies `/api` to `:8080`.

### Getting the sign-in code in dev mode

Set `DEV_MODE=true` so the server prints the code to stdout:

```sh
DEV_MODE=true go run .
```

Output: `DEV sign-in code for you@example.com: 123456`

**Never set `DEV_MODE=true` in production — codes will not be logged.**

## Building for production

```sh
# 1. Build the SPA
cd frontend && npm run build   # outputs frontend/dist/

# 2. Build the Go binary (run from project root)
cd ../backend && go build -o ../penny-saver .
```

The binary serves both the API and the SPA on one port.

## Deploying

1. Copy `penny-saver` (binary) to your server.
2. Set environment variables:
   | Variable     | Default          | Description                        |
   |--------------|------------------|------------------------------------|
   | `ADDR`       | `:8080`          | Listen address                     |
   | `DB_PATH`    | `penny-saver.db` | SQLite file path                   |
   | `STATIC_DIR` | `frontend/dist`  | Path to built SPA assets           |
   | `DEV_MODE`   | `false`          | Log codes to stdout — dev only     |
3. Update `Caddyfile` with your domain and run `caddy run`.
   Caddy provisions TLS automatically.

## Running the gates locally

```sh
# Backend
cd backend
go build ./...
go vet ./...
gofmt -l .        # must be empty
go test ./...

# Frontend
cd frontend
npm ci
npm run lint
npx prettier --check .
npm test
npm run build
```

---

*Slice 1 — walking skeleton: request code → verify → empty private home.*
*Email delivery is dev/log only in Slice 1; SMTP integration is deferred.*
