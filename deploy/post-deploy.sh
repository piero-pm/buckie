#!/usr/bin/env bash
# Runs on the VPS after each CI deploy. Atomically swaps the new binary + SPA
# into place and restarts the service. Args: <install-path> <domain>
set -euo pipefail

INSTALL="${1:?install path required}"
DOMAIN="${2:-}"

cd "$INSTALL/incoming"

# Move the new artifacts into place (overwrite). dist/ is replaced wholesale.
install -m 0755 buckie-bin "$INSTALL/buckie"
rm -rf "$INSTALL/dist"
mv dist "$INSTALL/dist"

# Refresh the Caddyfile with the current domain, then reload Caddy (graceful).
if [ -n "$DOMAIN" ] && command -v caddy >/dev/null 2>&1; then
  sed "s|DEPLOY_DOMAIN|$DOMAIN|g" Caddyfile > /tmp/caddyfile.new
  if [ -f /etc/caddy/Caddyfile ]; then
    sudo cp /tmp/caddyfile.new /etc/caddy/Caddyfile
    sudo systemctl reload caddy || sudo systemctl restart caddy
  fi
fi

# Restart the app (systemd picks up the new binary).
sudo systemctl restart buckie
echo "deploy activated: $INSTALL (domain=${DOMAIN:-none})"
