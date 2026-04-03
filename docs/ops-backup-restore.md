# Backup and restore

## PostgreSQL

**Backup** (example with Compose service name `db`):

```bash
docker compose -f docker-compose.prod.yml --env-file .env exec -T db \
  pg_dump -U banany banany > banany-$(date +%F).sql
```

**Restore** (empty or wiped database):

```bash
docker compose -f docker-compose.prod.yml --env-file .env exec -T db \
  psql -U banany -d banany < banany-YYYY-MM-DD.sql
```

Restore **before** or **without** deleting the MinIO volume if you want media URLs in the DB to stay valid.

## Object storage (MinIO / S3)

- With Docker volumes: back up the MinIO data volume (e.g. `banany_minio_prod`) using your platform’s volume snapshot or `mc mirror` to another bucket.
- With external S3: use provider snapshot/lifecycle rules.

## Order of restore

1. Start Postgres and restore the SQL dump.
2. Start MinIO and restore objects (same bucket name and keys as before).
3. Start the app with the same `S3_*` and `DATABASE_URL` as when the backup was taken.

## Retention

Keep at least one off-site backup. For a personal blog, weekly DB dumps and monthly object storage copies are a reasonable minimum.
