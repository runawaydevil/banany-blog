# Mailgun in production

Banany uses **environment variables only** (no dashboard fields):

- `MAILGUN_API_KEY`
- `MAILGUN_DOMAIN` (often `mg.example.com`)
- `MAILGUN_FROM` (e.g. `Blog <noreply@mg.example.com>`)
- Optional: `MAILGUN_REPLY_TO`, `MAILGUN_REGION` (`us` or `eu`)

## DNS

In the Mailgun dashboard, complete domain verification. Typically you add:

- **SPF** (TXT) — Mailgun provides the exact record.
- **DKIM** (TXT) — per-domain signing keys from Mailgun.
- **DMARC** (TXT) at `_dmarc.yourdomain` — start with `p=none` for monitoring, then tighten (`quarantine` / `reject`) when confident.

## Operational notes

- Never log full API responses from Mailgun if they might contain secrets.
- Password reset is **rate-limited** per IP (`forgot-password` / `reset-password` routes).
- If Mailgun is not configured, forgot-password returns **503** with a generic configuration message (not per-user enumeration on success paths).
- There is **no** in-app “send test email” button; use Mailgun’s logs or a one-off script if needed.

## Readiness

The dashboard **Settings** page shows whether `MAILGUN_*` is complete enough to send mail (derived from env, not from stored secrets).
