<p align="center">
  <img src="img/banany.svg" alt="Banany Blog" width="160" height="160" />
</p>

# Banany Blog

**Version 0.0.1** · **Pablo Murad** · [pablomurad@pm.me](mailto:pablomurad@pm.me)

This project is a work in progress.

Banany Blog is built for the small web: a quieter, more personal part of the internet shaped by independent sites, ownership, and publishing on your own domain first. Its purpose is not to turn writing into content production, but to help people keep a human, durable, self-hosted place online that feels truly theirs.

It is designed around restraint. Banany Blog favors clarity over clutter, writing over dashboards, and identity over platform polish. The goal is a blog that feels calm, personal, and alive: minimal in structure, expressive in voice, and simple enough that the site itself stays in the background while the writing and the person behind it stay at the center.

## Deploy

Copy [`.env.example`](.env.example) for local work, or [`.env.production.example`](.env.production.example) into `.env` on the server, fill in secrets and your public `https://` URL, then run the app with Docker Compose as in the docs below (`--env-file .env`). In production, terminate TLS on your own reverse proxy and forward to the app’s published host port (`BANANY_APP_PORT_HOST`, default `38127`). After first run, complete `/setup` at that public URL and keep **Dashboard → Settings → Public site URL** aligned with the same origin.

## Further reading

- [First production deployment](docs/deploy-first-production.md)
- [Reverse proxy (TLS and routing)](docs/deploy-external-reverse-proxy.md)
- [Ports and public URL](docs/ports-and-origins.md)
- [Backup & restore](docs/ops-backup-restore.md)
- [Mailgun (password reset email)](docs/mailgun-production.md)
- [Security audit](docs/security-audit.md) · [Security hardening](docs/security-hardening.md)

Mailgun is configured only via `MAILGUN_*` environment variables; the dashboard does not store API keys for email.

---

Feedback welcome at [pablomurad@pm.me](mailto:pablomurad@pm.me).
