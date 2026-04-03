#!/bin/sh
set -e

if [ -z "$DATABASE_URL" ]; then
  echo "docker-entrypoint: DATABASE_URL is not set; skipping Prisma sync."
elif [ "${SKIP_DB_PUSH:-0}" = "1" ]; then
  echo "docker-entrypoint: SKIP_DB_PUSH=1; skipping Prisma sync."
else
  echo "docker-entrypoint: syncing schema (prisma db push)..."
  node ./node_modules/prisma/build/index.js db push --skip-generate
fi

exec "$@"
