# Grafana Cloud log shipping — insights-ui

How error logs from the live AWS deployment get into a searchable UI, why the app has to push
them itself, and the exact setup steps.

Companion docs: [aws-deployment.md](aws-deployment.md) (the as-built deployment),
[crawler-blocking.md](crawler-blocking.md) (why CPU/RAM headroom on the single node matters).

---

## 1. Why the app pushes its own logs

`insights-ui` runs on a **Lightsail Container Service**, not a Lightsail VM. That rules out the
normal approaches:

| Approach | Why it doesn't work here |
|---|---|
| Install Grafana Alloy / Promtail on the host | No SSH and no host filesystem on a container service. |
| Alloy as a sidecar container in the same deployment | Containers in a Lightsail deployment can talk over `localhost`, but there are **no shared volumes**, so a sidecar cannot read the app container's stdout. It would also eat RAM/CPU on a single node already tight for Puppeteer — see [crawler-blocking.md](crawler-blocking.md). |
| Native CloudWatch integration | Lightsail container services have none. |
| `aws lightsail get-container-log` | Works, and stays our fallback, but keeps only the **latest 3 days** and has no usable UI. |
| A Lambda polling `GetContainerLog` | Viable (EventBridge + `insights-ui-cron-invoker` already exist) but more moving parts than an in-process pusher, and inherits the 3-day window plus dedup/ordering work. |

So the app ships structured JSON lines straight to Grafana Cloud's Loki push API over HTTPS.

> **Historical note:** `deployments/insights-ui/observability.tf` creates a CloudWatch log group
> `/insights-ui/app`, an IAM logging policy, and an `insights-ui-logs` dashboard with a `level`
> dropdown. **Nothing ever shipped to it** — there was no `pino` and no
> `@aws-sdk/client-cloudwatch-logs` in the app. That scaffold is still unused (and
> `app_iam_user_name` defaults to `""`, so the policy isn't even attached to a user). It is
> harmless; delete it or wire it up if CloudWatch is ever preferred over Grafana.

## 2. Code layout

| File | Role |
|---|---|
| `insights-ui/src/lib/logging/lokiClient.ts` | Batching HTTP pusher: queue → one `POST /loki/api/v1/push` every 2 s (or per 100 lines). Secret redaction, bounded buffer, nanosecond timestamps. |
| `insights-ui/src/lib/logging/serverLogger.ts` | Patches `console.error` / `console.warn`, handles `uncaughtExceptionMonitor`, and formats Next's request errors. |
| `insights-ui/src/instrumentation.ts` | Next's `register()` (installs the above at server startup) and `onRequestError` (every server error Next catches). |

**No refactor was needed.** The app already has ~218 `console.error` call sites, and every
`withErrorHandlingV1/V2/withLoggedInUser` wrapper in `shared/web-core` funnels errors through
them, so patching console captures them all. The original console is always called first, so
stdout and `get-container-log` behave exactly as before.

### Deliberate design choices

- **Inert unless configured.** Missing any of `LOKI_URL` / `LOKI_USER_ID` / `LOKI_TOKEN` and the
  whole thing is a no-op. Local dev and the Vercel deployment are unaffected.
- **Never blocks a request.** Callers enqueue synchronously; the push happens on an unref'd timer.
- **Bounded memory.** Buffer caps at 1000 lines; a Loki outage drops the oldest and ships a
  `dropped N lines` warning when it recovers, rather than growing until the container OOMs.
- **Secrets are redacted** before a line leaves the process — URL-embedded credentials,
  `sk-ant-*`, Stripe `sk_live_*`/`whsec_*`, `AKIA*`, JWTs, and `authorization:`/`api_key=` pairs.
  Error stacks carry connection strings more often than you'd expect.
- **Low-cardinality labels only.** The Loki stream is `{service, env, level}`; route, ticker,
  stack and digest go *inside* the JSON line and are queried with `| json`. A label per route
  would explode the index.
- **`uncaughtExceptionMonitor`, not `uncaughtException`.** The monitor variant observes the error
  without suppressing Node's crash-and-exit. Registering `uncaughtException`,
  `unhandledRejection` or a `SIGTERM` listener would keep a broken process alive — much worse
  than a missing log line.

### Known gaps (by design)

- Up to **2 seconds** of buffered lines are lost on a hard kill (container redeploy, OOM).
- A **fully unhandled promise rejection** outside a request may only reach stdout, since we
  deliberately don't register that listener. `get-container-log` covers it.
- `console.log` is **not** shipped by default (`LOKI_LOG_LEVELS=error,warn`). The
  `withErrorHandling*` wrappers log several `console.log` lines per request; shipping them would
  be mostly noise.

## 3. One-time Grafana Cloud setup

Free tier: **50 GB logs/month, 14-day retention, 3 active users**, no credit card. Shipping only
error+warn should stay far under 1 GB/month.

1. Sign up at [grafana.com](https://grafana.com/pricing/) and create a stack. Pick a **US**
   region — the app is in `us-east-1`.
2. In the stack, open **Loki → Send Logs**. Copy:
   - the push **URL**, e.g. `https://logs-prod-021.grafana.net/loki/api/v1/push`
   - the numeric **User / instance ID**
3. **Administration → Users and access → Access policies → Add access policy**. Realm = this
   stack, scope = **`logs:write`**. Add a token under it and copy the token (shown once).

Verify the credentials before touching the deploy:

```bash
curl -i -u "<LOKI_USER_ID>:<LOKI_TOKEN>" \
  -H 'Content-Type: application/json' \
  "<LOKI_URL>" \
  --data-binary "{\"streams\":[{\"stream\":{\"service\":\"insights-ui\",\"env\":\"manual-test\",\"level\":\"error\"},\"values\":[[\"$(date +%s)000000000\",\"{\\\"level\\\":\\\"error\\\",\\\"msg\\\":\\\"hello from curl\\\"}\"]]}]}"
```

A `204 No Content` means it worked. Then in Grafana → **Explore → Loki**:

```logql
{service="insights-ui", env="manual-test"}
```

## 4. Wiring it into the AWS deployment

No Terraform or infra change is needed. CI reads the whole Secrets Manager secret
`insights-ui/app-env` into the `app_secrets` map
(`.github/workflows/insights-ui-deploy-aws.yml`), and `container.tf` injects it with
`environment = merge(var.app_env, var.app_secrets)`.

So: add the three keys to that secret, preserving the existing ones.

```bash
# Read current, add the new keys, write back as one document.
aws secretsmanager get-secret-value --secret-id insights-ui/app-env \
  --query SecretString --output text --region us-east-1 > /tmp/app-env.json

jq '. + {
  LOKI_URL: "https://logs-prod-XXX.grafana.net/loki/api/v1/push",
  LOKI_USER_ID: "1234567",
  LOKI_TOKEN: "glc_..."
}' /tmp/app-env.json > /tmp/app-env.new.json

aws secretsmanager put-secret-value --secret-id insights-ui/app-env \
  --secret-string file:///tmp/app-env.new.json --region us-east-1

rm /tmp/app-env.json /tmp/app-env.new.json
```

> `put-secret-value` replaces the **entire** document — the `jq '. + {…}'` merge above is what
> keeps the other ~33 keys. Don't hand-write the JSON.

Then redeploy (push to `main`, or re-run the workflow) so the container picks up the new env.
On startup the container logs `[serverLogger] Grafana Cloud log shipping enabled`.

## 5. Seeing the errors

Grafana → **Explore → Loki**:

```logql
# Every error, newest first. "Live" toggle gives you tail -f.
{service="insights-ui", env="production", level="error"}

# Parse the JSON line so route / stack / digest become fields.
{service="insights-ui", level="error"} | json

# Errors on one route.
{service="insights-ui", level="error"} | json | routePath=~"/stocks.*"

# Error rate, for a dashboard panel or an alert.
sum(count_over_time({service="insights-ui", level="error"}[5m]))
```

Each line carries `level`, `msg`, `source` (`console.error` / `console.warn` /
`onRequestError` / `uncaughtException`) and, where available, `stack`, `path`, `method`,
`routePath`, `routeType`, `digest`.

**Alerting** is included in the free tier: Alerting → Alert rules → new rule on the
`count_over_time` query above, with a contact point (email, or the existing Discord webhook —
note `shared/web-core/.../errorLogger.ts` already posts errors to Discord independently).

## 6. Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Startup line never appears | One of the three env vars is missing/empty — the shipper is inert by design. Check with `aws lightsail get-container-log --service-name insights-ui --container-name app --region us-east-1`. |
| `push failed: 401` | Token isn't scoped `logs:write`, or `LOKI_USER_ID` is wrong (it's the numeric Loki instance ID, not your email). |
| `push failed: 400` | Almost always a timestamp sent as a number instead of a string. |
| `push failed: 429` | Free-tier ingest or rate limit. Narrow `LOKI_LOG_LEVELS` to `error`. |
| `dropped N lines (buffer full)` | Loki was unreachable for a while, or error volume spiked past 1000 buffered lines. |
| Nothing in Explore but no push errors | Wrong `env` label — check the `LOKI_ENV` / `NEXT_PUBLIC_VERCEL_ENV` value, or widen the query to `{service="insights-ui"}`. |
