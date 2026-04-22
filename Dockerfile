# syntax=docker/dockerfile:1
FROM node:20-bookworm-slim AS base
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

LABEL org.opencontainers.image.title="Banany Blog"
LABEL org.opencontainers.image.description="Self-hosted small-web publishing (Next.js + Prisma + Postgres)"
LABEL org.opencontainers.image.source="https://github.com/runawaydevil/banany-blog"

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Prisma + Next need placeholders at build time (no DB required for generate)
ENV DATABASE_URL="postgresql://banany:banany@localhost:5432/banany"
ENV SKIP_DB_DURING_BUILD=1
ENV AUTH_SECRET="build-time-placeholder"
ENV APP_URL="http://localhost:3000"
ENV NEXTAUTH_URL="http://localhost:3000"
ENV S3_BUCKET="banany"
ENV S3_ACCESS_KEY_ID="x"
ENV S3_SECRET_ACCESS_KEY="y"
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Prisma CLI + engines (from full install) so we can run migrations on container start
COPY --from=deps /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
COPY docker-entrypoint.sh ./docker-entrypoint.sh
# Windows checkouts often use CRLF; Linux then fails with "no such file or directory" on shebang
RUN sed -i 's/\r$//' ./docker-entrypoint.sh && chmod +x ./docker-entrypoint.sh && chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["./docker-entrypoint.sh"]
# Limit Node heap memory to prevent container OOMKilled
ENV NODE_OPTIONS="--max-old-space-size=512"
CMD ["node", "server.js"]
