# Rotating the Claude OAuth token on the live AWS deployment

**When to use:** report generation (or the auto-generation usage gate) suddenly fails
with Claude auth errors, or the `auto-gen-status` diagnostic shows a `usageError`. This
almost always means the server's Claude **subscription OAuth** lineage has gone stale and
needs to be re-seeded from a freshly-logged-in local Claude Code.

This is the operational runbook. For the underlying token-provider design see
[`aws-deployment.md`](aws-deployment.md) and the code in
`insights-ui/src/util/claude/claude-token-provider.ts`.

---

## Why the token goes stale

insights-ui talks to Claude with a **subscription OAuth token**, not an API key. Two
tokens are involved:

- **Refresh token** (`sk-ant-ort…`) — long-lived, self-refreshing. This is the important one.
- **Access token** (`sk-ant-oat…`) — short-lived (~8h), minted from the refresh token on demand.

The server never bakes in a static access token. Instead the token provider holds the
**refresh token** and exchanges it for a fresh access token whenever one is needed — the
same thing the Claude Code CLI does. So in steady state the server is self-sustaining.

**Refresh-token expiry (~29 days).** Each refresh token carries a `refreshTokenExpiresAt`
roughly 29 days out. But because every exchange **rotates** to a new refresh token (with a
fresh ~29-day expiry) that the server re-persists to S3, the lineage stays alive
*indefinitely* as long as the server does at least one Claude exchange within each window.
The stamped expiry is only the hard deadline if the token is never used again. So this only
bites when generation has been idle/dead for close to a month — at which point you re-seed
with the procedure below.

**The catch — refresh tokens ROTATE on every use.** Each exchange at
`https://platform.claude.com/v1/oauth/token` returns a *new* refresh token and invalidates
the one just used. Whoever refreshes last owns the lineage. This means:

- If you run `claude /login` locally (or anything else refreshes the same lineage), the
  server's persisted refresh token becomes a **dead branch** — the next time the server
  tries to exchange it, the endpoint rejects it and Claude calls fail.
- Conversely, a fresh local `/login` mints a brand-new independent lineage. Re-seeding the
  server from that new local token puts the server back on a live branch.

So the fix is always the same: **take the current local refresh token and write it to the
two places the server reads from.**

## Where the server reads the refresh token (priority order)

From `claude-token-provider.ts` → `candidateRefreshTokens()`:

1. **In-memory** rotated value (this container process's newest) — not something you can set.
2. **S3 persisted object** — `s3://dodao-ai-insights-agent/internal/claude-oauth/refresh-token.json`
   (private, AES256). The container writes rotations here so they survive restarts, and
   reads it on startup / when in-memory is empty. **Updating this fixes the RUNNING
   container without a redeploy.**
3. **Env bootstrap** — `ANTHROPIC_OAUTH_REFRESH_TOKEN` in **Secrets Manager** secret
   `insights-ui/app-env` (us-east-1). CI regenerates the Lightsail env from this on every
   deploy, so if you only update S3, the **next redeploy** would re-inject the stale token.

**Update BOTH** — S3 for immediate recovery, Secrets Manager so a future CI deploy doesn't
re-poison it.

## Prerequisites

- Local Claude Code logged in with a **valid** subscription (`claude /login` if unsure).
  On macOS the credential lives in the keychain under service `"Claude Code-credentials"`.
- AWS CLI configured with an identity that can write the S3 object and put the SM secret
  (e.g. the `dodao-admin` user). `aws sts get-caller-identity` to check.

## Procedure

Do NOT print token values to the terminal or into any file that gets committed. Stage
everything in the scratchpad.

```bash
# 0) Read the local credential from the macOS keychain (JSON blob; do not echo it).
security find-generic-password -s "Claude Code-credentials" -w > "$SCRATCH/local_creds.json"

# 1) Build the S3 payload (matches the PersistedRefreshToken shape the provider writes)
#    and write it to the object the running container reads.
python3 - <<'PY'
import json, datetime
o = json.load(open("$SCRATCH/local_creds.json"))
o = o.get("claudeAiOauth", o)
r = o["refreshToken"].strip()
assert r.startswith("sk-ant-ort")
json.dump({"refreshToken": r, "updatedAt": datetime.datetime.utcnow().isoformat()+"Z"},
          open("$SCRATCH/refresh-token.json","w"))
PY

aws s3api put-object \
  --bucket dodao-ai-insights-agent \
  --key internal/claude-oauth/refresh-token.json \
  --body "$SCRATCH/refresh-token.json" \
  --content-type application/json --acl private --server-side-encryption AES256

# 2) Patch ANTHROPIC_OAUTH_REFRESH_TOKEN (+ the bootstrap ANTHROPIC_OAUTH_TOKEN access
#    token) in Secrets Manager, PRESERVING every other key.
aws secretsmanager get-secret-value --secret-id insights-ui/app-env \
  --query SecretString --output text > "$SCRATCH/sm_current.json"

python3 - <<'PY'
import json
sm = json.load(open("$SCRATCH/sm_current.json"))
o  = json.load(open("$SCRATCH/local_creds.json")); o = o.get("claudeAiOauth", o)
sm["ANTHROPIC_OAUTH_REFRESH_TOKEN"] = o["refreshToken"].strip()
sm["ANTHROPIC_OAUTH_TOKEN"]         = o["accessToken"].strip()
json.dump(sm, open("$SCRATCH/sm_new.json","w"))
PY

aws secretsmanager put-secret-value --secret-id insights-ui/app-env \
  --secret-string "file://$SCRATCH/sm_new.json"

# 3) Clean up staged secrets.
rm -f "$SCRATCH"/local_creds.json "$SCRATCH"/refresh-token.json "$SCRATCH"/sm_current.json "$SCRATCH"/sm_new.json
```

No redeploy is required: on its next Claude call the container reads the fresh S3 token,
exchanges it for an access token, rotates, and re-persists. The Secrets Manager update just
keeps the bootstrap honest for the next CI deploy.

> If the container had already cached a (now-dead) refresh token in memory, it will still
> try that first, fail, and **fall through to the S3 candidate** — so recovery is automatic.
> A restart is only needed if you want to skip that one-time fall-through.

## Verify

Call the read-only diagnostic (no side effects) with the automation token
(`AUTOMATION_SECRET` in the same SM secret):

```bash
curl -sS "https://prod.koalagains.com/api/koala_gains/cron/auto-gen-status" \
  -H "x-automation-token: $AUTOMATION_SECRET" | python3 -m json.tool
```

Success looks like `"usageError": null` and a `gate` with **real** numbers, e.g.:

```json
"gate": { "allowed": true, "reason": "ok", "fiveHourPct": 3, "weeklyPct": 12,
          "remainingPct": 88, "requiredRemainingPct": 80, "hoursToReset": 140,
          "strategy": "Conservative" }
```

A non-null `usageError` (or a 5xx) means the token still isn't valid — re-check that the
local login is actually current and that you wrote the refresh token, not the access token.

## Gotchas

- **Endpoint is `platform.claude.com`**, NOT `console.anthropic.com` (404s) and NOT
  `api.anthropic.com` (that's the Messages API). Client id
  `9d1c250a-e61b-44d9-88ed-5944d1962f5e`.
- **Never call the OAuth usage endpoint directly with the local token** to "test" it — a
  direct exchange rotates the lineage and can log the server (or your local CLI) out. Use
  the `auto-gen-status` endpoint, which exercises the *server's* provider.
- **Don't run `claude /login` again after re-seeding** unless you intend to rotate the
  lineage once more — it moves the live branch off what you just wrote to S3/SM.
- **Preserve all other SM keys.** Read-modify-write the whole JSON; a bare
  `put-secret-value` with only the two keys would wipe the other ~33.
```
