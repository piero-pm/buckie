# Installing Buckie

Two paths: **run it locally** on your own machine, or **self-host on a VPS** for
access from your phone and other devices. Both end with you signing in, setting an
encryption passphrase, and recording expenses.

Buckie is one Go binary that serves both the API and the (built) web app on a
single port. SQLite stores everything in one file. Your financial data is encrypted
in your browser before it ever reaches the server — the server only stores
ciphertext.

---

## Option A — Run locally (your laptop/desktop)

Use this to try the app or develop it. You only need it running while you use it.

### Prerequisites

- **Go 1.22+** — <https://go.dev/dl/>
- **Node.js 20+** (includes npm) — <https://nodejs.org/>
- **Git** — to clone the repo

### Steps

```sh
# 1. Get the code
git clone https://github.com/piero-pm/buckie.git
cd buckie

# 2. Build the web app once (outputs frontend/dist/)
cd frontend
npm install
npm run build
cd ..

# 3. Run the server in dev mode (prints sign-in codes to the terminal)
cd backend
DEV_MODE=true go run .
```

The server listens on **<http://localhost:8080>**. Open it in your browser.

4. **Sign in:** enter your email, click *Send code*. Because `DEV_MODE=true`, the
   6-digit code is printed in the terminal where the server is running (not
   emailed). Enter it to sign in.

5. **Set your encryption passphrase:** on first sign-in you're prompted to create
   a passphrase (≥12 letters/numbers). Pick one you won't lose — there is no
   recovery. Store it in a password manager.

6. **Record expenses** via *Record a spend*, set up **recurring** costs, and view
   the **dashboard**.

> **Developing the UI with hot reload?** Run the Go backend (`DEV_MODE=true go
> run .` from `backend/`) and separately `npm run dev` from `frontend/`. Vite on
> :5173 proxies `/api` to :8080, so open <http://localhost:5173> instead.

### Stopping

Press `Ctrl+C` in the terminal. Your data persists in `backend/buckie.db`.

### Backing up

Copy `backend/buckie.db` somewhere safe. It's encrypted, but it's your only
copy of your data.

---

## Option B — Self-host on a VPS (access from your phone)

This gives you a real, always-on instance reachable from your iPhone browser and
desktop, with HTTPS and real email sign-in codes. Estimated cost: **~£5/month +
~£10/year** (domain).

### What you need

- A **domain name** you own (e.g. `buckie.yourname.com`) — ~£10/year from any
  registrar (Namecheap, Porkbun, Cloudflare…)
- A **small Linux VPS** — ~£4–6/month. Options: [Hetzner](https://www.hetzner.com)
  (CX11, €4.5/mo, EU), [DigitalOcean](https://www.digitalocean.com) ($4/mo
  droplet), or any Ubuntu 22.04/24.04 VPS. 1 vCPU / 1 GB RAM is plenty.
- A **transactional email account** (free tier) to deliver sign-in codes:
  [Resend](https://resend.com) (3000/mo free), [Brevo](https://www.brevo.com)
  (300/day free), or Mailgun/Mailtrap. You'll get an SMTP host, port, username,
  and a password/API key.
- DNS access to point your domain at the VPS.

### 1. Point your domain at the VPS

In your registrar/DNS, add an **A record**:

```
buckie  A  <your-vps-ipv4-address>
```

Wait a few minutes for it to propagate.

### 2. Set up the VPS

SSH in (`ssh root@<vps-ip>`), then install Go and Caddy:

```sh
# Go 1.22+
wget https://go.dev/dl/go1.22.5.linux-amd64.tar.gz
sudo rm -rf /usr/local/go && sudo tar -C /usr/local -xzf go1.22.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' | sudo tee -a /etc/profile.d/go.sh
source /etc/profile.d/go.sh
go version   # should print go1.22.x

# Caddy (auto-TLS reverse proxy)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install caddy
```

### 3. Build Buckie on the VPS

```sh
cd /opt
sudo git clone https://github.com/piero-pm/buckie.git
cd buckie
sudo chown -R $USER:$USER .

# Build the web app
cd frontend && npm install -g npm@latest && npm install && npm run build && cd ..

# Build the Go binary
cd backend && go build -o /opt/buckie/buckie . && cd ..

# Place the database
sudo touch /opt/buckie/buckie.db
sudo chown $USER:$USER /opt/buckie/buckie.db
```

### 4. Configure environment + Caddy

Create `/opt/buckie/buckie.env` with your real values (this example uses
Resend; Brevo/Mailgun follow the same pattern):

```sh
ADDR=127.0.0.1:8080          # loopback only; Caddy proxies to it
DB_PATH=/opt/buckie/buckie.db
STATIC_DIR=/opt/buckie/frontend/dist
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_FROM=Buckie <codes@yourdomain.com>
SMTP_USER=resend              # for Resend, username is "resend"
SMTP_PASS=re_xxxxxxxxxxxxx   # your Resend API key
# Do NOT set DEV_MODE in production
```

Edit `/etc/caddy/Caddyfile` (replace the domain):

```caddy
buckie.yourname.com {
    reverse_proxy 127.0.0.1:8080
}
```

### 5. Run it as a service (systemd)

Create `/etc/systemd/system/buckie.service`:

```ini
[Unit]
Description=Buckie
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/buckie
EnvironmentFile=/opt/buckie/buckie.env
ExecStart=/opt/buckie/buckie
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Then:

```sh
sudo systemctl daemon-reload
sudo systemctl enable --now buckie
sudo systemctl restart caddy   # provisions the TLS certificate
```

Check it's running: `sudo systemctl status buckie` (should say `active
(running)`). View logs with `sudo journalctl -u buckie -f`.

### 6. Use it

Open **<https://buckie.yourname.com>**. Enter your email → receive a real code by
email → sign in → set your encryption passphrase → start recording.

You can now use it from your iPhone Safari and any desktop browser.

---

## Updating to a new version

```sh
cd /opt/buckie
git pull
cd frontend && npm install && npm run build && cd ..
cd backend && go build -o /opt/buckie/buckie . && cd ..
sudo systemctl restart buckie
```

Your data in `buckie.db` is preserved across updates. (Schema uses
`CREATE TABLE IF NOT EXISTS`, so new tables are added automatically. Always keep a
backup of the `.db` file before updating.)

## Backing up

The entire app + all user data is one file:

```sh
# While the server is running, SQLite tolerates a file copy
sudo cp /opt/buckie/buckie.db /backup/buckie-$(date +%F).db
```

The backup is encrypted (ciphertext-only), so it's safe to store anywhere — but
it's your only recovery if the VPS dies.

## Troubleshooting

- **Codes not arriving:** check `sudo journalctl -u buckie -f` for SMTP
  errors. Verify `SMTP_HOST/PORT/USER/PASS/FROM`. With Resend, verify your sending
  domain in their dashboard. While debugging you can temporarily set
  `DEV_MODE=true` to read codes from the logs — but never leave it on in
  production.
- **TLS not working:** ensure port 80 + 443 are open on the VPS firewall
  (`sudo ufw allow 80,443/tcp`) and the DNS A record resolves
  (`dig buckie.yourname.com`).
- **Forgot your passphrase:** there is no recovery. You can reset by deleting
  your `buckie.db` (loses all data) and starting fresh.
