#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "docker-entrypoint: DATABASE_URL is not set; skipping Prisma sync."
elif [ "${SKIP_DB_PUSH:-0}" = "1" ]; then
  echo "docker-entrypoint: SKIP_DB_PUSH=1; skipping Prisma sync."
elif [ -d "./prisma/migrations" ] && find ./prisma/migrations -mindepth 1 -maxdepth 1 -type d | grep -q .; then
  echo "docker-entrypoint: applying migrations (prisma migrate deploy)..."
  node ./node_modules/prisma/build/index.js migrate deploy
else
  echo "docker-entrypoint: syncing schema (prisma db push)..."
  node ./node_modules/prisma/build/index.js db push --skip-generate
fi

exec "$@"
