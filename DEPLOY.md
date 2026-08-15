# Deploying Buckie with CI/CD

Push to `main` → GitHub Actions builds the frontend + Go binary, SSH-deploys to
your VPS, restarts the service. This doc is the one-time setup. After that,
**every merged ticket ships by pushing to `main`**.

> Cost: ~£5/mo VPS + ~£10/yr domain. For manual/local runs see `INSTALL.md`.

## Architecture

```
push to main
    │
    ▼
GitHub Actions: ci.yml (gates: build/vet/test/lint/format)
    │  passes
    ▼
GitHub Actions: deploy.yml
    ├─ build SPA (frontend/dist)
    ├─ cross-compile Go binary (linux/amd64)
    ├─ scp artifacts → VPS:/opt/buckie/incoming
    ├─ ssh: post-deploy.sh swaps artifacts + restarts service
    └─ ssh: health check (systemctl is-active)
    │
    ▼
Caddy (auto-TLS) → 127.0.0.1:8080 (Buckie binary)
```

The VPS is lean: no Go, no Node — CI builds everything. Only Caddy + the binary.

## Prerequisites (buy / sign up)

1. **Domain** (~£10/yr) — Porkbun, Namecheap, or Cloudflare.
2. **DigitalOcean droplet** — 1 vCPU / 1 GB / Ubuntu 24.04 LTS, region near you.
   Note the **public IPv4**. Add an SSH key during creation (yours, for admin).
3. **Resend account** (free, resend.com) — get SMTP host/port/username/API key.

## Step 1 — Point the domain at the VPS

In your DNS, add an **A record** (e.g. `buckie` → droplet IP):

```
buckie  A  203.0.113.10
```

Wait a few minutes. Verify: `dig +short buckie.yourname.com` returns the IP.

## Step 2 — Provision the VPS (one-time)

SSH in as root with the admin key you added at droplet creation:

```sh
ssh root@203.0.113.10
```

Get the setup script onto the box (copy-paste from this repo's `deploy/setup-vps.sh`,
or `apt-get install -y git && git clone https://github.com/piero-pm/buckie.git`),
then run it:

```sh
bash buckie/deploy/setup-vps.sh
```

This creates the `buckie` user, `/opt/buckie`, installs Caddy, writes the
systemd unit, opens the firewall (80/443/22), and creates an env-file template.
It prints the next steps.

## Step 3 — Authorize the deploy key

The CI pipeline needs an SSH key to deploy. **On your laptop** (not the VPS),
generate a dedicated deploy-only key:

```sh
ssh-keygen -t ed25519 -f ~/.ssh/buckie_deploy -C "buckie-deploy"
# leave the passphrase empty (CI uses it unattended)
```

Print the **public** key and add it to the VPS `buckie` user:

```sh
cat ~/.ssh/buckie_deploy.pub
# on the VPS, as root:
sudo -u buckie mkdir -p /home/buckie/.ssh
sudo -u buckie tee -a /home/buckie/.ssh/authorized_keys < <(paste-the-pubkey)
sudo -u buckie chmod 600 /home/buckie/.ssh/authorized_keys
```

Print the **private** key (`cat ~/.ssh/buckie_deploy`) — you'll paste it into
GitHub in the next step. Keep it secret; it can deploy to your server.

## Step 4 — Configure GitHub secrets

In your repo: **Settings → Secrets and variables → Actions → New repository secret**.

| Secret name | Value |
| --- | --- |
| `VPS_HOST` | droplet public IP (e.g. `203.0.113.10`) |
| `VPS_USER` | `buckie` |
| `VPS_SSH_KEY` | the **private** key (full contents, incl. `-----BEGIN…`) |
| `VPS_PATH` | `/opt/buckie` |
| `DEPLOY_DOMAIN` | `buckie.yourname.com` |

SMTP creds go **on the VPS**, not GitHub — edit `/opt/buckie/buckie.env`
(provisioned in step 2) and fill `SMTP_HOST/PORT/FROM/USER/PASS`.

## Step 5 — First deploy

Push any commit to `main` (or go to **Actions → Deploy → Run workflow**). Watch
the run: build → scp → restart → health check. Caddy provisions TLS on the first
request to your domain. Open `https://buckie.yourname.com` — you should see the
landing page.

## Day-to-day deploys

Merge a ticket (or commit) to `main`. CI gates run; on green, the Deploy job
ships. No manual steps. Failed deploys leave the old binary running (the swap is
in-place but systemd restarts from the new path only after upload succeeds).

## Troubleshooting

- **Deploy skipped with "VPS_HOST secret is not set"** — you haven't configured
  secrets yet (step 4). Until then the workflow no-ops safely.
- **TLS not provisioning** — confirm ports 80+443 are open (`sudo ufw status`)
  and the DNS A record resolves. Caddy needs 80 for the ACME challenge.
- **502 bad gateway** — the binary isn't running. `ssh buckie@VPS` then
  `sudo systemctl status buckie` and `sudo journalctl -u buckie -e`.
- **Sign-in codes not arriving** — check the env file has real SMTP values and
  `journalctl -u buckie` shows no SMTP errors. Verify your sending domain
  in the Resend dashboard. **DigitalOcean blocks outbound SMTP ports 25/465/587**
  — use Resend's STARTTLS alternative **port 2587** (`SMTP_PORT=2587`).
- **Rollback** — re-run the Deploy workflow for a previous commit, or SSH in and
  `git checkout <prev-tag>` style redeploy manually from a known-good binary.

## Security notes

- The deploy key is **deploy-only** (NOPASSWD on exactly `systemctl restart
  buckie`, `systemctl reload caddy`, and the Caddyfile copy) — see
  `/etc/sudoers.d/buckie` on the VPS. It cannot root the box.
- Your data is still host-blind: the VPS stores only ciphertext + SMTP creds.
  Losing the VPS loses nothing readable; rotate the deploy key if compromised.
