# Ports and public origins

## Canonical site URL (`APP_URL`)

Banany resolves the **public origin** (the URL visitors use in the browser) in this order:

1. `APP_URL` (preferred)
2. `SITE_URL`
3. `NEXTAUTH_URL`
4. `NEXT_PUBLIC_APP_URL`

When any of these is set, it overrides the `publicUrl` stored in the database for **absolute links** (sitemap, RSS, Open Graph URLs, password-reset links, and proxied media URLs when `S3_PUBLIC_URL` is not set).

Set **`APP_URL`** to your real HTTPS origin behind your reverse proxy, for example `https://blog.example.com`. Also set **`NEXTAUTH_URL`** to the same value so NextAuth matches the browser.

In **production**, the app process validates at startup (see `instrumentation.ts`) that a public origin and S3 credentials exist. It does **not** require Mailgun unless you set `BANANY_REQUIRE_MAILGUN=1`.

## Avoid persisting localhost in production

- First-time setup **prefills** the public URL from the trusted env vars above. If `APP_URL` is set, that value is **authoritative** and the setup field is read-only.
- Saving `http://localhost:…` as the site URL in production is **rejected** unless `ALLOW_LOCALHOST_PUBLIC_URL=1` (for controlled testing only).
- If the database `publicUrl` drifts from `APP_URL`, the dashboard shows a banner (production only) with **Apply URL from environment**.

## Docker port variables

These only affect **host → container** mapping in Compose. The Node process inside the app container still listens on **port 3000**.

| Variable | Purpose |
|----------|---------|
| `BANANY_APP_PORT_HOST` | Host port for the Next.js app (default **38127** in `docker-compose.prod.yml`, **3000** in dev `docker-compose.yml`) |
| `BANANY_DB_PORT_HOST` | Dev only: Postgres on the host (default **35432**, avoids local **5432**) |
| `BANANY_MINIO_API_PORT_HOST` | Dev only: MinIO S3 API (default **39000**, avoids local **9000**) |
| `BANANY_MINIO_CONSOLE_PORT_HOST` | Dev only: MinIO console (default **39001**) |

Production Compose **does not publish** Postgres or MinIO ports; only the app service exposes a host port.

## Changing ports later

1. Change `BANANY_APP_PORT_HOST` (or your process manager / systemd unit) and restart the container.
2. Update your **reverse proxy** upstream to the new port.
3. Do **not** change `APP_URL` unless the domain or scheme actually changed.

## Favicon caching

The HTML references `/icon?v=…` with a cache-busting query. Browsers may still cache aggressively; after changing the favicon in **Appearance**, do a hard refresh if the tab icon looks stale.
