# Deploy behind your own reverse proxy

Banany Blog is a **single Next.js app** (public site, dashboard, and API). In production you typically:

1. Run the stack with **`docker-compose.prod.yml`** (or your own orchestration).
2. Bind the app to a **high, non-default host port** (default example: **38127** → container **3000**).
3. Keep **PostgreSQL** and **MinIO** on the internal Docker network only (no published ports).
4. Terminate **HTTPS** on your reverse proxy and forward to the app port.

This repository **does not** ship a production proxy container. You manage Nginx, Caddy, Traefik, etc. yourself.

## Environment

Copy [`.env.production.example`](../.env.production.example) to `.env` and set at least:

- `APP_URL` / `NEXTAUTH_URL` — your public `https://` origin  
- `AUTH_SECRET` — long random string  
- `POSTGRES_PASSWORD`, `MINIO_ROOT_PASSWORD`  
- S3-related vars (Compose wires them to MinIO by default)

Optional **Mailgun** variables for password reset: `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM` (see `.env.production.example`).

Start:

```bash
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

## Reverse proxy requirements

Forward to `127.0.0.1:BANANY_APP_PORT_HOST` (or the container’s published address on your host).

- Preserve **`Host`** (or set it to the public hostname).
- Set **`X-Forwarded-Proto`** to `https` when TLS is terminated upstream.
- Set **`X-Forwarded-For`** to the client chain if you need real IPs in logs.

**Uploads:** allow a large enough **client body size** for media uploads (e.g. tens of MB).

**Timeouts:** set sane `proxy_read_timeout` / `send_timeout` (Nginx) or Caddy equivalents so large uploads can complete without the edge closing first.

**Caching:** do not cache **`/dashboard`**, **`/api/auth/*`**, or authenticated responses aggressively.

**Edge headers (optional):** Banany sets CSP and other headers in `next.config.ts`. You may duplicate or tighten headers at the proxy for defense in depth; avoid conflicting `Content-Security-Policy` values unless you know both layers match.

**Health:** point orchestration or manual checks at `GET /api/health` on the app port.

**WebSockets:** not required for core Banany flows today; if you add streaming features later, ensure your proxy allows upgrade where needed.

## Minimal examples (secondary)

**Nginx** (illustrative):

```nginx
server {
  server_name blog.example.com;
  location / {
    proxy_pass http://127.0.0.1:38127;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 64m;
  }
}
```

**Caddy**:

```caddyfile
blog.example.com {
  reverse_proxy 127.0.0.1:38127
}
```

(Caddy sets forwarded headers by default.)

## First-time setup

1. Confirm the app responds on the host port (e.g. `curl -I http://127.0.0.1:38127`).
2. Point DNS and the proxy at that upstream with **`APP_URL`** already set to the final `https://` URL.
3. Open **`/setup`** in the browser (through the proxy) and finish onboarding.
4. Verify login, dashboard, `/feed.xml`, `/sitemap.xml`, password reset email (if Mailgun is set), and favicon.

See also [ports-and-origins.md](./ports-and-origins.md), [deploy-first-production.md](./deploy-first-production.md), and [security-hardening.md](./security-hardening.md).
