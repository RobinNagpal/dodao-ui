# syntax=docker/dockerfile:1
#
# Multi-stage build for the insights-ui Next.js standalone server.
#
# IMPORTANT: build context must be the MONOREPO ROOT, because insights-ui depends on the
# `@dodao/web-core` pnpm workspace package. Build with:
#
#   docker build -f deployments/insights-ui/Dockerfile -t insights-ui .
#
# Requires `output: 'standalone'` in insights-ui/next.config.ts.

FROM node:22-bookworm-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
# Don't download puppeteer's bundled Chromium during install/build — the runtime stage uses
# the system chromium via PUPPETEER_EXECUTABLE_PATH instead (saves ~150MB + avoids version churn).
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN corepack enable
WORKDIR /app

# ---- Dependencies ------------------------------------------------------------------------
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY insights-ui/package.json insights-ui/
COPY shared/web-core/package.json shared/web-core/
# Dependency build scripts are allowed via `dangerouslyAllowAllBuilds: true` in
# pnpm-workspace.yaml (applies to this install AND the build stage's implicit install).
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter insights-ui...

# ---- Build -------------------------------------------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* are inlined at build time — pass them as build args in CI.
#  - NEXT_PUBLIC_VERCEL_URL / _ENV: shared getBaseUrl() reads these (bare host, no scheme).
#  - NEXT_PUBLIC_ASSET_PREFIX: S3 base URL so the browser loads /_next/static/* from S3.
ARG NEXT_PUBLIC_VERCEL_URL
ARG NEXT_PUBLIC_VERCEL_ENV
ARG NEXT_PUBLIC_ASSET_PREFIX
ENV NEXT_PUBLIC_VERCEL_URL=${NEXT_PUBLIC_VERCEL_URL}
ENV NEXT_PUBLIC_VERCEL_ENV=${NEXT_PUBLIC_VERCEL_ENV}
ENV NEXT_PUBLIC_ASSET_PREFIX=${NEXT_PUBLIC_ASSET_PREFIX}
RUN pnpm --filter insights-ui exec prisma generate \
    && pnpm --filter insights-ui build

# ---- Runtime -----------------------------------------------------------------------------
# Chromium is installed so Puppeteer can launch a headless browser inside the container.
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        chromium ca-certificates fonts-liberation \
    && rm -rf /var/lib/apt/lists/* \
    && groupadd -r nextjs && useradd -r -g nextjs nextjs

COPY --from=build --chown=nextjs:nextjs /app/insights-ui/.next/standalone ./
COPY --from=build --chown=nextjs:nextjs /app/insights-ui/.next/static ./insights-ui/.next/static
COPY --from=build --chown=nextjs:nextjs /app/insights-ui/public ./insights-ui/public

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "insights-ui/server.js"]
