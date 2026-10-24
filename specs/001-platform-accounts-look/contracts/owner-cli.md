# Contract: owner commands (G-01)

Run on the owner's computer as user `grove` (`sudo -u grove npm run <command> -- …` in grove's folder). Each command writes a security-log entry (FR-023) and exits non-zero with a plain message on failure.

| Command | Arguments | Effect |
|---|---|---|
| `owner:setup` | `--email <address>` (password asked in the terminal, twice, not echoed) | Creates the owner account in Firebase and grove with the owner and learner roles (FR-016). Refuses if an owner already exists. |
| `reviewer:setup` | `--email <address the owner controls>` (password asked twice, not echoed; must meet the rule of FR-010) | Creates the one shared reviewer account in Firebase and grove with the reviewer and learner roles (FR-010). Refuses if a reviewer account already exists. Reminds the owner to write the email and password into the README. |
| `learner:export` | `--email <address> [--out <file>]` | Writes all of that account's data as JSON (FR-017). |
| `learner:delete` | `--email <address> --yes` | Deletes the account, its sessions and all its data in grove, and the Firebase user (FR-017). |
| `log:show` | `[--since <hours>] [--event <name>]` | Prints the security log. |
| `availability:show` | `[--days <n>]` | Prints the hourly checks and the share answered per day (SC-004). |
| `backup:now` | – | Writes and checks a backup immediately (same as the hourly job). |
| `backup:restore` | `--file <backup> --yes` | Stops if grove is running; replaces the database with the backup (for the by-hand restore test, SC-005). |

Changing the reviewer password: the owner uses the password reset (the reset email goes to the owner's address) and updates the README by hand.

## The tunnel supervisor (`grove-tunnel.service`)

- Starts `cloudflared tunnel --url http://127.0.0.1:<PORT>` and reads its output.
- On a new `https://*.trycloudflare.com` address: stores it in `settings.tunnel_url`, then updates the README between `<!-- grove-link -->` and `<!-- /grove-link -->`, retrying every 15 s until it succeeds (FR-004, ≤ 2 minutes).
- Every hour, requests `<tunnel_url>/health` and records the result in `availability_checks` (FR-004, Q-06).
- Touches no file but `README.md` in the configured repository.
