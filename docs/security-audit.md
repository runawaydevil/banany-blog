# Security audit — Banany Blog

Auditoria orientada ao código (estado inicial antes / depois do hardening). Severidades: **Critical**, **High**, **Medium**, **Low**.

| ID | Severity | Area | Finding | Status |
|----|----------|------|---------|--------|
| A1 | High | Reset tokens | `PasswordResetToken.token` stored and queried in plaintext | **Fixed** — `tokenHash` (SHA-256) only |
| A2 | High | Media | `GET /api/media/raw?key=` served any S3 key without `Media` row check | **Fixed** — require `Media.key` |
| A3 | High | Passwords | bcrypt-only; no Argon2id for new passwords | **Fixed** — Argon2id primary, bcrypt verify + rehash on login |
| A4 | Medium | Upload | Client-controlled `prefix` in S3 key; trusted `file.type`; SVG allowed | **Fixed** — prefix allowlist, `file-type` magic bytes, SVG blocked |
| A5 | Medium | Abuse | No rate limits on login, forgot/reset, subscribe, upload | **Fixed** — in-memory limits per IP |
| A6 | Medium | Headers | No security headers or CSP in `next.config` | **Fixed** — see `next.config.ts` + `docs/security-hardening.md` |
| A7 | Medium | Ops | No lightweight health endpoint for orchestration | **Fixed** — `GET /api/health` |
| A8 | Low | Session | JWT sessions not revoked on password reset | **Accepted** — document in hardening doc; optional future `tokenVersion` |
| A9 | Low | Rate limit | In-memory buckets not shared across replicas | **Accepted** — document; use Redis later if scaled |

## API write paths (inventory)

| Route | Auth | Validation | Notes |
|-------|------|------------|-------|
| `POST /api/setup` | No (pre-setup) | Zod | OK |
| `GET/PATCH /api/site` | GET public; PATCH session | Zod PATCH | OK |
| `POST/GET /api/posts` | POST session | Zod | OK |
| `PATCH/DELETE /api/posts/[id]` | Session | Zod | OK |
| `POST/GET /api/pages` | POST session | Zod | OK |
| `PATCH/DELETE /api/pages/[id]` | Session | Zod | OK |
| `PUT /api/nav` | Session | Zod | OK |
| `GET /api/media` | Session | — | OK |
| `POST /api/upload` | Session | + hardened | OK |
| `POST /api/subscribers` | Public | Zod + RL | OK |
| `POST forgot-password` | Public | Zod + RL | OK |
| `POST reset-password` | Public | Zod + RL | OK |
| `[...nextauth]` | Framework | — | RL in `authorize` |

## Residual risks

- Rate limiting is per Node process (not distributed).
- CSP uses `unsafe-inline` for styles/scripts where required for Next.js + TipTap compatibility (see `security-hardening.md`).
- No antivirus scanning on uploads.
- Mailgun credentials only in env — protect `docker compose` / host env files.
