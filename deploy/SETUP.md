# Setting grove up on the owner's computer

For quickstart §3 (tasks T062–T065). Run as an admin user; commands that change the system need `sudo`.

## 1. Firebase (can be done from the phone)

1. Create a Firebase project at console.firebase.google.com (free Spark plan).
2. Authentication → Sign-in method → turn on **Email/Password** (not the email-link option).
3. Authentication → Settings → **User actions** → turn on **Email enumeration protection**.
4. Project settings → General → copy the **Web API key** and the **Project ID**.
5. Project settings → Service accounts → **Generate new private key**; keep the JSON file safe.

## 2. GitHub token (can be done from the phone)

GitHub → Settings → Developer settings → Fine-grained tokens → Generate:
- Repository access: **only** the private repo reviewers can see.
- Permissions: **Contents: Read and write** (nothing else).
- Expiration: a date after the review.

In the repo's README, add these two lines where the link should appear:

```
<!-- grove-link -->
<!-- /grove-link -->
```

The reviewer account's email and password are written into the README by hand, next to it.

## 3. The computer

```sh
sudo useradd --system --create-home --home-dir /var/lib/grove grove
sudo mkdir -p /opt/grove /etc/grove /mnt/grove-backup
sudo chown grove:grove /var/lib/grove /mnt/grove-backup
sudo git clone <repo> /opt/grove && cd /opt/grove && sudo npm ci --omit=dev
sudo cp deploy/grove.env.example /etc/grove/grove.env   # then fill it in
sudo cp <downloaded service-account.json> /etc/grove/service-account.json
sudo chown -R grove:grove /etc/grove && sudo chmod 600 /etc/grove/*
```

Install cloudflared (Cloudflare's package for your distribution), then:

```sh
sudo cp deploy/grove.service deploy/grove-tunnel.service /etc/systemd/system/
sudo mkdir -p /etc/systemd/journald.conf.d && sudo cp deploy/journald-grove.conf /etc/systemd/journald.conf.d/grove.conf
sudo systemctl restart systemd-journald
sudo systemctl daemon-reload && sudo systemctl enable --now grove grove-tunnel
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

- Mount the backup disk at `/mnt/grove-backup` (add it to `/etc/fstab`).
- Check that full-disk encryption is on for the computer and the backup disk (constitution 4.11).
- No ports are opened: cloudflared only connects outwards.

## 4. Accounts

```sh
cd /opt/grove
sudo -u grove --preserve-env npm run owner:setup -- --email you@example.com
sudo -u grove --preserve-env npm run reviewer:setup -- --email you+grove-reviewer@example.com
```

(Load the environment first, e.g. `set -a; . /etc/grove/grove.env; set +a` in a root shell.)

## Check tools for development

- gitleaks 8.28.0 (release binary in `~/.local/bin`)
- semgrep 1.182.1 (`pipx install semgrep`, or a venv)
- Playwright's Chromium: `npx playwright install chromium`
