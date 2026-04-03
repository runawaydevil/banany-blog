# Security hardening summary

This document complements [`security-audit.md`](./security-audit.md) and the [security hardening plan](./security-hardening-plan.md).

## Passwords

- **Argon2id** is the primary algorithm (`lib/auth/password.ts`).
- Legacy **bcrypt** hashes (from older installs) still verify; on successful login the hash is **replaced** with Argon2id.
- First-time setup and password reset always store Argon2id.

## Password reset tokens

- The value sent by email is **not** stored. Only **SHA-256** (hex) of that value is stored in `PasswordResetToken.tokenHash`.
- Creating a new reset request **deletes** prior tokens for that user.
- If sending email fails, the DB row is removed so no orphan token remains.

## Rate limiting

- Implemented in `lib/rate-limit.ts` with an in-memory map (per Node process).
- **Not** shared across multiple app replicas; use a shared store (e.g. Redis) if you scale horizontally.
- Applied to: login (credentials `authorize`), forgot-password, reset-password, newsletter subscribe, upload.

## Cookies / TLS

- `useSecureCookies` is enabled when `NEXTAUTH_URL` is `https://...` or `BANANY_BEHIND_HTTPS_PROXY=1`.
- Terminate TLS at your reverse proxy and set `NEXTAUTH_URL` / `APP_URL` to the public `https` origin.

## Content Security Policy

- Global CSP is set in `next.config.ts` (headers).
- `script-src` includes `'unsafe-inline'` and `'unsafe-eval'` for compatibility with **Next.js** and the **TipTap** editor. Tightening further may require nonces and more invasive changes.
- `frame-ancestors 'none'` replaces legacy `X-Frame-Options` intent (both are set where applicable).

## Uploads

- Allowed prefixes: `uploads`, `branding`, `fonts` only.
- **SVG** uploads are rejected (XSS risk when misused).
- Types are validated with **`file-type`** (magic bytes), not only the browser-reported MIME type.
- Raster images and GIFs are normalized to **WebP** via `sharp`.

## Media proxy

- `GET /api/media/raw` only serves objects whose `key` exists in the `Media` table and matches a strict key pattern.

## Health

- `GET /api/health` returns `{ ok: true }` without querying the database (suitable for Docker `HEALTHCHECK`).

## Residual risks

- JWT sessions are **not** revoked on password reset (single-instance blog trade-off). A future `tokenVersion` on `User` could invalidate older JWTs.
- No antivirus scanning on uploads.
- Owner-controlled **custom CSS** in settings is trusted input (conscious self-XSS / layout risk).

## Schema changes

- After pulling these changes, run **`npx prisma db push`** (or your chosen migration workflow) so `PasswordResetToken` uses `tokenHash` instead of `token`. Existing reset tokens are invalidated.
