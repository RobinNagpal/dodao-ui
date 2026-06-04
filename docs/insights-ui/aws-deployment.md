# AWS Deployment (as-built) — insights-ui / KoalaGains

How the **live** AWS deployment of `insights-ui` actually works, the issues that were hit
bringing it up and how each was fixed, the env-var / base-URL contract, and the operational
runbook. This is the *as-built* companion to two other docs:

- **[aws-migration-plan.md](aws-migration-plan.md)** — the original plan / rationale / phased design.
- **[`deployments/insights-ui/README.md`](../../deployments/insights-ui/README.md)** — the Terraform + Dockerfile mechanics.

Status: **Phase A is LIVE.** The app runs on AWS at `prod.koalagains.com` in parallel with the
Vercel deployment that still serves `koalagains.com`. CloudFront does **not** front the AWS app
yet (that's Phase B). Apex/Vercel is untouched.

---

## 1. What's deployed

```
prod.koalagains.com ──(Route53 CNAME)──► Lightsail Container Service "insights-ui" (1 node, medium)
                                                │  next start + system Chromium (Puppeteer)
browser ──(assetPrefix)──► S3 insights-ui-static-assets/_next/static   └──► existing RDS Postgres (public + SSL)
EventBridge Scheduler (4 crons) ──► Lambda insights-ui-cron-invoker ──► GET prod.koalagains.com/api/...
app ──(pino transport)──► CloudWatch Logs /insights-ui/app
```

- Single-node Lightsail container service (`scale = 1`, enforced by a Terraform validation) — a
  single coherent in-process cache; scaling >1 would break `unstable_cache`/`revalidateTag`.
- Static assets served straight from a public S3 bucket via Next.js `assetPrefix` (no CloudFront).
- Database is the **existing** RDS (public access + SSL); Terraform provisions nothing for it.
- Crons are owned by AWS (removed from `vercel.json`) so there's a single writer against the
  shared RDS.

### Live AWS resources (account `729763663166`, region `us-east-1`)

| Resource | Name / ID |
|---|---|
| Lightsail container service | `insights-ui` (RUNNING) |
| Direct host | `prod.koalagains.com` (Route53 CNAME → Lightsail) |
| ECR repository | `insights-ui` (IMMUTABLE tags, scan-on-push, keep-last-20) |
| Static assets bucket | `insights-ui-static-assets` (public-read on `/_next/static/*`) |
| Terraform state | S3 `koalagains-terraform-state` (versioned + SSE), **no DynamoDB lock** |
| App secrets | Secrets Manager `insights-ui/app-env` (33 keys) |
| CI deploy identity | IAM user `insights-ui-deploy` (AdministratorAccess); access key in GitHub repo secrets `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` |
| Logs | CloudWatch Log Group `/insights-ui/app`; dashboard `insights-ui-logs` |
| Crons | 4 EventBridge schedules → Lambda `insights-ui-cron-invoker` |
| Existing CloudFront (Vercel apex) | `EZI5H8FKNE9R1` — the AWS app still invalidates it on cron/save writes |

---

## 2. Deploy flow

CI workflow: **`.github/workflows/insights-ui-deploy-aws.yml`**. Auto-runs on push to `main`
touching `insights-ui/**`, `shared/web-core/**`, `deployments/insights-ui/**`, or the workflow
file; also `workflow_dispatch`. A `concurrency.group` serializes runs (this is *why* the
Terraform backend needs no DynamoDB lock — CI is the only applier and never overlaps).

Ordered steps (≈20 min end-to-end; the Docker build is the long pole):

1. **AWS auth** via static access keys (the `insights-ui-deploy` user) — not OIDC.
2. `terraform init` (S3 backend) + targeted `apply` of `aws_ecr_repository.app` and
   `aws_s3_bucket.assets` so the build/push and asset upload have targets.
3. `docker build` (context = repo root; `deployments/insights-ui/Dockerfile`) with
   `NEXT_PUBLIC_*` build args, then `docker push` to ECR tagged with the git short SHA.
4. Extract `/_next/static` from the image and `aws s3 sync` to the bucket (no `--delete` → old
   build chunks survive for deploy-skew safety; 30-day lifecycle expiry).
5. **Full `terraform apply`** — registers a new Lightsail deployment version pointing at the new
   image, injecting `app_secrets` from Secrets Manager via a generated `secrets.auto.tfvars.json`
   (not inline `-var`, which would leak secrets / can't parse a JSON map). Has a built-in
   retry-after-120s for the cert-PENDING_VALIDATION race.
6. Wait for the Lightsail deployment to reach `ACTIVE`, then smoke-test
   `https://prod.koalagains.com/api/health`.

To deploy: merge to `main` (or run the workflow manually). Note: a change that touches **only**
repo-root files (e.g. `pnpm-workspace.yaml`) is **not** in the trigger paths — dispatch the
workflow manually in that case.

### Bootstrap (one-time, already done)

These exist out-of-band (not created by a normal apply): the S3 state bucket, the
`insights-ui/app-env` secret, the `insights-ui-deploy` IAM user + GitHub secrets, and the
`koalagains.com` Route53 hosted zone. If recreating from scratch, see
`deployments/insights-ui/README.md`.

---

## 3. Env-var & base-URL contract (read before touching URL logic)

A subtle but load-bearing asymmetry:

| Var | Local | Vercel prod | AWS prod |
|---|---|---|---|
| `NEXT_PUBLIC_VERCEL_URL` | `localhost:3000` | **unset** | `prod.koalagains.com` (Docker build arg, inlined) |
| `NEXT_PUBLIC_VERCEL_ENV` | `local` | **unset** | `production` |
| `VERCEL` / `VERCEL_URL` / `VERCEL_ENV` | – | set by Vercel | unset |

So `NEXT_PUBLIC_VERCEL_*` are Vercel-named but only actually set on **AWS** (and local), never on
Vercel itself. `NEXT_PUBLIC_*` are inlined at build time into both client and server bundles.

Base-URL resolution is split into two intents (see
`insights-ui/src/utils/getBaseUrlForServerSidePages.ts`; shared
`shared/web-core/src/utils/api/getBaseURL.ts` is intentionally **unchanged** — it's used by ~430
sites across 7 apps):

- **`getBaseUrlForServerSidePages()`** — SSR self-fetch base = the **running host** so each
  deployment fetches its own `/api` directly: local → `http://localhost:3000`, AWS →
  `https://prod.koalagains.com` (direct CNAME, **not** CloudFront → always fresh), Vercel →
  `getBaseUrl()` is `''` server-side → falls back to `https://koalagains.com`. Provably identical
  to the old behavior on Vercel and local; only AWS changed.
- **`getCanonicalUrl()`** — always `https://koalagains.com`. Used by the **14 sitemap routes**
  (and any canonical/OG URL). NEVER use the self-fetch base for sitemaps — on AWS it would emit
  `prod.koalagains.com` into the sitemap (SEO leak).

Why it matters: `koalagains.com` API GET paths `/api/koala_gains/tickers-v1/exchange/*` and
`/country/*` are CloudFront-cached for 6 days. If AWS SSR self-fetched `koalagains.com` it would
serve stale data from Vercel's cache instead of its own DB. Fetching `prod.koalagains.com` (direct
to Lightsail) avoids that.

---

## 4. Issues hit bringing it up (and the fix for each)

The Docker build / Terraform apply / container boot surfaced a chain of real issues. If a future
deploy regresses, this is the map:

| Symptom | Root cause | Fix | PR |
|---|---|---|---|
| `terraform init` fails instantly in CI | State bucket + DynamoDB lock table didn't exist; backend referenced a lock table we didn't want | Created S3 state bucket; dropped `dynamodb_table` from the backend (workflow `concurrency` serializes instead) | #1570 |
| CI can't auth to AWS | No GitHub OIDC provider in the account | Switched workflow to static IAM keys (`insights-ui-deploy` user) | #1570 |
| `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH` | pnpm ≥10 no longer reads `pnpm.overrides` from `package.json`; pins were only under `resolutions` | Moved `overrides` into `pnpm-workspace.yaml` (matching the lockfile) | #1571 |
| `ERR_PNPM_IGNORED_BUILDS` (deps stage) | pnpm ≥10 blocks dependency build scripts and errors in CI | `onlyBuiltDependencies` did **not** suppress it under pnpm 11.5.1; used `dangerouslyAllowAllBuilds: true` in `pnpm-workspace.yaml` (covers the build stage's implicit install too) | #1573, #1574 |
| `next build` fails: "API key must be set when using the Gemini API" | Gemini clients constructed at **module load**; page-data collection imports them without `GOOGLE_API_KEY` (Vercel injects all env at build; the Docker build does not) | Lazy-init the Gemini clients (construct on first use) in `llm-grounding-utils.ts` and `scripts/llm‑utils‑gemini.ts` | #1576 |
| `terraform apply`: `Invalid for_each argument` | `aws_route53_record.lightsail_cert_validation` used `for_each` over the cert's *computed* `domain_validation_options` — keys unknown on first apply | Single domain → index `tolist(...)[0]` instead of `for_each` | #1577 |
| Lightsail deployment FAILED, container crash-loops | `PrismaClientInitializationError`: client generated for `debian-openssl-1.1.x`, runtime needs `3.0.x` (slim build stage can't detect OpenSSL → defaults to 1.1.x) | Pin `binaryTargets = ["native", "debian-openssl-3.0.x"]` in `schema.prisma` | #1578 |
| AWS SSR pages render Vercel's (stale) data | `getBaseUrlForServerSidePages()` hardcoded `koalagains.com` → SSR self-fetch went through CloudFront | Split self-fetch (running host) vs canonical (see §3) | #1579 |

General lesson: **Vercel injects all env vars at build time; the Docker build only passes the
three `NEXT_PUBLIC_*` build args.** Any code that reads a secret at *module load / build time*
(client construction, top-level env asserts) will break the Docker build but not Vercel. Keep
such initialization lazy.

---

## 5. Operational runbook

**Redeploy:** merge to `main` (touching an in-path file) or run
`gh workflow run insights-ui-deploy-aws.yml --ref main`. Watch with
`gh run watch <run-id> --exit-status`.

**Health / state:**
```bash
curl -fsS https://prod.koalagains.com/api/health            # {"status":"ok"}
aws lightsail get-container-services --service-name insights-ui --region us-east-1 \
  --query 'containerServices[0].state'                       # RUNNING
```

**Logs (why a deployment failed / app errors):**
```bash
# Container stdout/stderr for the running deployment (Prisma/boot errors show here):
aws lightsail get-container-log --service-name insights-ui --container-name app --region us-east-1
# Structured app logs:
aws logs tail /insights-ui/app --region us-east-1 --since 1h
# Or the public CloudWatch dashboard "insights-ui-logs".
```

**Debug a failed CI deploy:** `gh run view <id> --log-failed`. The build/apply gets *further*
each fix — match the failing step against §4.

**Secrets** live in Secrets Manager `insights-ui/app-env` (the inner JSON object becomes the
`app_secrets` map). Update with `aws secretsmanager put-secret-value`, then redeploy to inject
the new env into a fresh Lightsail deployment version.

**Cert note:** the Lightsail TLS cert for `prod.koalagains.com` must be ISSUED before it attaches.
On a clean first apply it can be `PENDING_VALIDATION`; the workflow retries once after 120s. If a
deploy fails there, just re-dispatch — state is remote and the cert keeps validating.

---

## 6. Open follow-ups (non-blocking)

- **Phase B:** `manage_cloudfront=true` to put CloudFront in front of the Lightsail origin
  (import the existing distribution; replicate all behaviors). Then **Phase C:** apex cut-over and
  Vercel decommission.
- **ECR `IMMUTABLE` tags + git-SHA image tag:** re-deploying the *same* commit fails `docker push`
  (tag already exists). Fine today (deploys follow commits); revisit if re-runs are needed.
- **Cron endpoints are unauthenticated** (`AUTOMATION_SECRET` hardening deferred) — anyone can hit
  the `generate-*` endpoints against the shared RDS.
- **Schema migrations must stay expand-only** while Vercel + AWS share the RDS.
- Add `prod.koalagains.com` to Google/Discord/Twitter OAuth redirect URIs for auth on the direct host.
