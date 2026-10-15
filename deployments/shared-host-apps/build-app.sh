#!/usr/bin/env bash
# Builds one Next.js app for the shared Lightsail host and assembles its bundle.
#
#   APP_ENV_JSON=<file> PUBLIC_HOST=tidbitshub.org BUILD_ENV_KEYS="V2_API_SERVER_URL ..." \
#     bash deployments/shared-host-apps/build-app.sh academy-ui
#
# APP_ENV_JSON is the app's Secrets Manager JSON (KEY → value). Only what `next build` inlines is
# exported from it: every NEXT_PUBLIC_* key, plus the keys named in BUILD_ENV_KEYS (an app's
# next.config `env` block inlines those too). Nothing else — notably not DATABASE_URL: neither
# app reads the database at build time, so the build never connects to it.
set -euo pipefail

app="${1:?usage: build-app.sh <app>}"
: "${APP_ENV_JSON:?APP_ENV_JSON (path to the env JSON of the app) is required}"
: "${PUBLIC_HOST:?PUBLIC_HOST (the production hostname) is required}"
: "${BUILD_ENV_KEYS:=}"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# shellcheck disable=SC2016 # $wanted and $k are jq variables
build_keys_filter='
  ($keys | split(" ") | map(select(length > 0))) as $wanted
  | to_entries[]
  | select((.key | startswith("NEXT_PUBLIC_")) or (.key as $k | $wanted | any(. == $k)))
  | "\(.key)=\(.value | tostring)\u0000"'
while IFS= read -r -d '' assignment; do
  export "${assignment?}"
  echo "build env: ${assignment%%=*}"
done < <(jq -j --arg keys "$BUILD_ENV_KEYS" "$build_keys_filter" "$APP_ENV_JSON")

# What Vercel provided as system env. Shared getBaseUrl() reads these: server-side it builds
# https://<NEXT_PUBLIC_VERCEL_URL>, so this must be the public host (bare, no scheme).
export NEXT_PUBLIC_VERCEL_URL="$PUBLIC_HOST"
export NEXT_PUBLIC_VERCEL_ENV=production
export NEXT_TELEMETRY_DISABLED=1
unset DATABASE_URL

cd "$root"
pnpm --filter "$app" build
bash deployments/shared-host-apps/build-bundle.sh "$app"
