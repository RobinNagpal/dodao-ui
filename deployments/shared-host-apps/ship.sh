#!/usr/bin/env bash
# Ships an assembled bundle (build-bundle.sh) to the shared Lightsail host and restarts it:
#
#   1. rsync to /srv/<app>/next, hard-linking unchanged files from /srv/<app>/current
#   2. rewrite /etc/<app>-api.env from the app's env JSON + RUNTIME_ENV overrides
#   3. swap next → current (the old one is kept as /srv/<app>/previous for a manual rollback)
#      and restart <app>-api
#   4. wait for http://127.0.0.1:<port>/api/health on the host, then https://<public host>/api/health
#      through Caddy — the latter only enforced once DNS points at the host
#
# Never touches the database: no migrations, no queries.
#
# Env: APP, APP_PORT, PUBLIC_HOST, DEPLOY_HOST, APP_ENV_JSON (file), RUNTIME_ENV (KEY=value lines,
#      appended last so they win), SSH_KEY_FILE, KNOWN_HOSTS_FILE.
set -euo pipefail

: "${APP:?}" "${APP_PORT:?}" "${PUBLIC_HOST:?}" "${DEPLOY_HOST:?}" "${APP_ENV_JSON:?}"
: "${RUNTIME_ENV:=}"
: "${SSH_KEY_FILE:=$HOME/.ssh/id_deploy}"
: "${KNOWN_HOSTS_FILE:=$HOME/.ssh/known_hosts}"
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
bundle="$root/deployments/shared-host-apps/dist/$APP"
remote="deploy@$DEPLOY_HOST"

[[ -f "$bundle/index.js" ]] || { echo "error: no bundle at $bundle — run build-bundle.sh $APP" >&2; exit 1; }

ssh_opts=(
  -i "$SSH_KEY_FILE"
  -o UserKnownHostsFile="$KNOWN_HOSTS_FILE"
  -o StrictHostKeyChecking=yes
  -o BatchMode=yes
)

dump_journal() {
  ssh "${ssh_opts[@]}" "$remote" \
    "systemctl is-active $APP-api || true; journalctl -u $APP-api -n 80 --no-pager" || true
}

# --- 1. stage ---------------------------------------------------------------------------------
# Staged beside the live directory and swapped, so systemd never restarts into a half-transferred
# bundle. --link-dest makes every file unchanged since the live bundle a hard link instead of a
# transfer (a cold first deploy sends it all).
rsync -az --delete --link-dest="/srv/$APP/current" -e "ssh ${ssh_opts[*]}" \
  "$bundle/" "$remote:/srv/$APP/next/"

# --- 2. environment ---------------------------------------------------------------------------
# Rewritten every deploy, so the secret — not a hand edit on the box — decides what the service
# runs with. Values are double-quoted for systemd's EnvironmentFile parser, which takes everything
# inside literally except \" and \\ (so a value may hold spaces, $, # or newlines).
render_env() {
  echo "# Written by deployments/shared-host-apps/ship.sh on every deploy. Do not edit by hand."
  jq -r '
    to_entries[]
    | if (.key | test("^[A-Za-z_][A-Za-z0-9_]*$")) then . else error("invalid env key: \(.key)") end
    | "\(.key)=\"\(.value | tostring | gsub("\\\\"; "\\\\") | gsub("\""; "\\\""))\""' "$APP_ENV_JSON"
  if [[ -n "$RUNTIME_ENV" ]]; then
    echo "# Fixed by the workflow (listed last, so they win)."
    printf '%s\n' "$RUNTIME_ENV"
  fi
}
# Rendered completely before anything is sent, so a bad key fails the deploy here instead of
# truncating the live file. Piped rather than passed as an argument: an argument is visible in
# `ps` on the host.
env_file="$(mktemp)"
trap 'rm -f "$env_file"' EXIT
render_env >"$env_file"
ssh "${ssh_opts[@]}" "$remote" "umask 077 && cat > /etc/$APP-api.env" <"$env_file"

# --- 3. swap + restart ------------------------------------------------------------------------
ssh "${ssh_opts[@]}" "$remote" "
  set -euo pipefail
  rm -rf /srv/$APP/previous
  if [ -e /srv/$APP/current ]; then mv /srv/$APP/current /srv/$APP/previous; fi
  mv /srv/$APP/next /srv/$APP/current
  sudo systemctl restart $APP-api
"

# --- 4. verify --------------------------------------------------------------------------------
# The service itself, over loopback on the host: independent of DNS and certificates.
up=""
for attempt in $(seq 1 24); do
  if ssh "${ssh_opts[@]}" "$remote" "curl -fsS --max-time 5 http://127.0.0.1:$APP_PORT/api/health"; then
    echo; echo "$APP-api is serving on 127.0.0.1:$APP_PORT."
    up=yes
    break
  fi
  echo "attempt $attempt: $APP-api not serving yet"
  sleep 5
done
if [[ -z "$up" ]]; then
  echo "::error::$APP-api did not come up. Last 80 log lines:"
  dump_journal
  exit 1
fi

# Then through Caddy, pinned to the host's address so it tests this host whatever DNS says. Caddy
# can only hold a certificate for the name once DNS points here, so before the DNS switch this is
# a warning rather than a failure.
resolved="$(getent ahostsv4 "$PUBLIC_HOST" | awk '{print $1}' | sort -u | tr '\n' ' ' || true)"
for attempt in $(seq 1 12); do
  if curl -fsS --max-time 10 --resolve "$PUBLIC_HOST:443:$DEPLOY_HOST" "https://$PUBLIC_HOST/api/health"; then
    echo; echo "https://$PUBLIC_HOST is serving."
    exit 0
  fi
  echo "attempt $attempt: https://$PUBLIC_HOST not serving yet"
  sleep 5
done

if [[ " $resolved " != *" $DEPLOY_HOST "* ]]; then
  echo "::warning::$PUBLIC_HOST resolves to [${resolved% }], not $DEPLOY_HOST — DNS has not been switched yet, so Caddy cannot have its certificate. The service itself is up."
  exit 0
fi
echo "::error::$APP-api answers on loopback but https://$PUBLIC_HOST/api/health does not — check Caddy (journalctl -u caddy)."
dump_journal
exit 1
