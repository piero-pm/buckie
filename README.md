# Buckie

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

Set `DEV_MODE=true` so the server prints the code to stdout (no SMTP needed):

```sh
DEV_MODE=true go run .
```

Output: `DEV sign-in code for you@example.com: 123456`

**Never set `DEV_MODE=true` in production.**

### Encryption passphrase (host-blind)

After your first sign-in you're asked to set a **separate encryption passphrase**
(≥12 letters/numbers). It derives the key that encrypts your data **in the
browser**; the server only ever stores ciphertext (ADR-002/003). There is no
recovery — losing the passphrase means your stored data is permanently
unreadable. On the same device the key is cached so you don't re-enter it; on a
new device you re-enter the passphrase to unlock.

## Building for production

```sh
# 1. Build the SPA
cd frontend && npm run build   # outputs frontend/dist/

# 2. Build the Go binary (run from project root)
cd ../backend && go build -o ../buckie .
```

The binary serves both the API and the SPA on one port.

## Deploying

1. Copy `buckie` (binary) to your server.
2. Set environment variables:
   | Variable     | Default          | Description                                            |
   |--------------|------------------|--------------------------------------------------------|
   | `ADDR`       | `:8080`          | Listen address                                         |
   | `DB_PATH`    | `buckie.db` | SQLite file path                                       |
   | `STATIC_DIR` | `frontend/dist`  | Path to built SPA assets                               |
   | `DEV_MODE`   | `false`          | Log codes to stdout — dev only; **never** in production |
   | `SMTP_HOST`  | (none)           | SMTP server host (e.g. `smtp.resend.com`). When unset, codes are not delivered. |
   | `SMTP_PORT`  | `587`            | SMTP port                                              |
   | `SMTP_USER`  | (none)           | SMTP username (also used as FROM if `SMTP_FROM` unset) |
   | `SMTP_PASS`  | (none)           | SMTP password / API key                                |
   | `SMTP_FROM`  | `SMTP_USER`      | From address for sign-in emails                        |
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

*Phase 1 — login → encryption-passphrase setup → expense capture → recurring → dashboard.*
*Host-blind: the server stores only ciphertext; all domain logic runs client-side.
Sign-in codes are delivered via SMTP (any provider) when `SMTP_HOST` is set.*
