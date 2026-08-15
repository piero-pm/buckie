#!/usr/bin/env bash
# One-time provisioning for a fresh Ubuntu VPS. Idempotent: safe to re-run.
# Run as root on the droplet:  sudo bash setup-vps.sh
# Creates: buckie user, /opt/buckie, Caddy + auto-TLS, systemd service,
# UFW firewall, and an env-file template you must fill with SMTP creds.
set -euo pipefail

INSTALL=/opt/buckie
USER=buckie

echo "==> Creating user '$USER' (if missing)"
if ! id "$USER" >/dev/null 2>&1; then
  useradd --system --create-home --shell /bin/bash "$USER"
fi

echo "==> Install dir $INSTALL"
mkdir -p "$INSTALL/incoming" "$INSTALL/dist"
chown -R "$USER":"$USER" "$INSTALL"

echo "==> Installing Caddy (auto-TLS)"
if ! command -v caddy >/dev/null 2>&1; then
  apt-get update -y
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl sudo
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
    | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
    > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y
  apt-get install -y caddy
fi

echo "==> systemd unit"
cat > /etc/systemd/system/buckie.service <<EOF
[Unit]
Description=Buckie
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL
EnvironmentFile=$INSTALL/buckie.env
ExecStart=$INSTALL/buckie
Restart=on-failure
RestartSec=3

[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable buckie

echo "==> Firewall (UFW): allow SSH, HTTP, HTTPS"
apt-get install -y ufw >/dev/null
ufw allow OpenSSH || ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
yes | ufw enable >/dev/null || true

echo "==> sudo for $USER (so post-deploy.sh can restart the service + reload Caddy)"
cat > /etc/sudoers.d/buckie <<EOF
$USER ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart buckie, /usr/bin/systemctl reload caddy, /usr/bin/systemctl restart caddy, /usr/bin/cp /tmp/caddyfile.new /etc/caddy/Caddyfile
EOF
chmod 0440 /etc/sudoers.d/buckie

echo "==> env-file template (EDIT THIS with SMTP creds before first deploy)"
if [ ! -f "$INSTALL/buckie.env" ]; then
  cat > "$INSTALL/buckie.env" <<EOF
ADDR=127.0.0.1:8080
DB_PATH=$INSTALL/buckie.db
STATIC_DIR=$INSTALL/dist
# SMTP for sign-in codes (Resend). Fill these in:
# NOTE: DigitalOcean blocks outbound 25/465/587; Resend's STARTTLS
# alternative port 2587 works and net/smtp handles STARTTLS on any port.
SMTP_HOST=
SMTP_PORT=2587
SMTP_FROM=
SMTP_USER=
SMTP_PASS=
# Do NOT set DEV_MODE in production.
EOF
  chown "$USER":"$USER" "$INSTALL/buckie.env"
  chmod 0640 "$INSTALL/buckie.env"
fi

echo ""
echo "=========================================="
echo "Provisioning complete."
echo "Next steps (see DEPLOY.md):"
echo "  1. Authorize the deploy SSH key for $USER (~$USER/.ssh/authorized_keys)."
echo "  2. Edit $INSTALL/buckie.env with your SMTP credentials."
echo "  3. Configure GitHub secrets (VPS_HOST, VPS_USER, VPS_SSH_KEY, VPS_PATH, DEPLOY_DOMAIN)."
echo "  4. Point your domain A record at this server's IP."
echo "  5. Push to main (or run the Deploy workflow manually) — Caddy gets TLS on first deploy."
echo "=========================================="
