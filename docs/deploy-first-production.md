# First production deployment

Prerequisites: Linux host (or similar) with Docker and Docker Compose v2, a domain pointing to the server, and TLS termination (e.g. Nginx or Caddy) in front of the app.

## 1. DNS

Create an `A` (or `AAAA`) record for your blog hostname to the server’s public IP.

## 2. Secrets and environment

```bash
cp .env.production.example .env
```

Edit `.env` (never commit it):

- Strong `AUTH_SECRET`, `POSTGRES_PASSWORD`, `MINIO_ROOT_PASSWORD`
- `APP_URL` and `NEXTAUTH_URL` as `https://your.domain` (no trailing slash)
- `MAILGUN_*` if you need password reset email

Set `BANANY_BEHIND_HTTPS_PROXY=1` so the app emits `Strict-Transport-Security` and secure cookie behaviour aligns with HTTPS.

## 3. Database schema

From the host (or a one-off container with the same image and env):

```bash
docker compose -f docker-compose.prod.yml --env-file .env run --rm app \
  node ./node_modules/prisma/build/index.js db push
```

Or rely on the app entrypoint `db push` on first start (already in `docker-entrypoint.sh`) after upgrading code that changes the schema.

**Trade-off:** `db push` is convenient for self-hosting; for strict migration history, adopt `prisma migrate` separately.

## 4. Start the stack

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Ensure your reverse proxy forwards to `127.0.0.1:${BANANY_APP_PORT_HOST:-38127}` with correct `Host`, `X-Forwarded-Proto`, and `X-Forwarded-For`. See [deploy-external-reverse-proxy.md](./deploy-external-reverse-proxy.md).

## 5. First-time setup

Open `https://your.domain/setup` and create the owner account.

The setup form pre-fills **Public site URL** from `APP_URL` / `NEXT_PUBLIC_APP_URL` when those are set. After setup, open **Dashboard → Settings** and confirm **Public site URL** still matches your canonical browser origin (for example `https://banany.lol` or `https://www.banany.lol`—pick one and redirect the other at the proxy). If the stored value differs from `APP_URL` / `NEXTAUTH_URL`, production shows a warning and feeds, sitemap, and email links can disagree with what users see.

## 6. Post-deploy smoke checks

- [ ] `https://your.domain/api/health` returns `{"ok":true}`
- [ ] Public homepage loads
- [ ] Reverse proxy terminates TLS and forwards to `127.0.0.1:${BANANY_APP_PORT_HOST:-38127}` with `Host`, `X-Forwarded-Proto`, and `X-Forwarded-For` (see [deploy-external-reverse-proxy.md](./deploy-external-reverse-proxy.md))
- [ ] Login and dashboard work at the public `https://` URL (not only by hitting the raw host port)
- [ ] Create/edit a post; upload an image (branding or editor)
- [ ] `/feed.xml` and `/sitemap.xml` use the public URL
- [ ] Password reset email (if Mailgun configured): link uses the public `https://` origin and completes successfully
- [ ] Response headers include CSP and `X-Content-Type-Options: nosniff`

## 7. Rollback

```bash
docker compose -f docker-compose.prod.yml --env-file .env down
# restore previous image tag or git checkout + rebuild
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

Keep database and MinIO volumes unless you intend a full wipe.
