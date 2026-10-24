# Contract: owner commands (G-01)

Run on the owner's computer as user `grove` (`sudo -u grove npm run <command> -- …` in grove's folder). Each command writes a security-log entry (FR-023) and exits non-zero with a plain message on failure.

| Command | Arguments | Effect |
|---|---|---|
| `owner:setup` | `--email <address>` (password asked in the terminal, twice, not echoed) | Creates the owner account in Firebase and grove with the owner and learner roles (FR-016). Refuses if an owner already exists. |
| `invite:set` | `--label <text> --uses <1–5> [--reviewer]` | Makes a new random code (replacing the active code with the same label), prints it once, and writes it into the README between the invitation markers (FR-010, RQ-368). |
| `invite:list` | – | Labels, uses taken / allowed, active or not (never the codes). |
| `learner:export` | `--email <address> [--out <file>]` | Writes all of that learner's data as JSON (FR-017). |
| `learner:delete` | `--email <address> --yes` | Deletes the account, its sessions and all its data in grove, and the Firebase user (FR-017). |
| `log:show` | `[--since <hours>] [--event <name>]` | Prints the security log. |
| `backup:now` | – | Writes and checks a backup immediately (same as the hourly job). |
| `backup:restore` | `--file <backup> --yes` | Stops if grove is running; replaces the database with the backup (for the by-hand restore test, SC-005). |

## The tunnel supervisor (`grove-tunnel.service`)

- Starts `cloudflared tunnel --url http://127.0.0.1:<PORT>` and reads its output.
- On a new `https://*.trycloudflare.com` address: stores it in `settings.tunnel_url`, then updates the README between `<!-- grove-link -->` and `<!-- /grove-link -->`, retrying every 15 s until it succeeds (FR-004, ≤ 2 minutes).
- Touches no file but `README.md` in the configured repository.
