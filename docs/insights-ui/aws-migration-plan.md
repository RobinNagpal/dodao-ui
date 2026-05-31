# Insights-UI: Vercel → AWS Migration Plan (Lightsail Containers + Terraform)

Status: **Proposed** · Owner: Platform · Scope: `insights-ui` (KoalaGains, `koalagains.com`)

The single reference for moving `insights-ui` off Vercel onto a Terraform-managed AWS
deployment using **AWS Lightsail Containers** (single node) behind the existing CloudFront.
Covers the target architecture, Terraform layout, every app/code change required, secrets,
the cron replacement, CI/CD, the long-running-route handling, the cut-over runbook, rollback,
and cost. The heavier **ECS Fargate** topology is retained as a documented scale-up path in
[Appendix A](#appendix-a-ecs-fargate-scale-up-path).

> **Companion reading.** [`cloudfront-deploy-skew.md`](./cloudfront-deploy-skew.md) describes the
> current CloudFront-in-front-of-Vercel caching architecture. The migration **keeps CloudFront**
> and only swaps the origin (Vercel → Lightsail), so that doc's mental model still applies.

---

## Table of contents

1. [What we run today (baseline)](#1-what-we-run-today-baseline)
2. [Why Lightsail Containers (single node)](#2-why-lightsail-containers-single-node)
3. [Target architecture](#3-target-architecture)
4. [Terraform layout](#4-terraform-layout)
5. [Application & code changes](#5-application--code-changes)
6. [Secrets & environment variables](#6-secrets--environment-variables)
7. [Replacing Vercel crons](#7-replacing-vercel-crons)
8. [CI/CD changes](#8-cicd-changes)
9. [Long-running generation routes](#9-long-running-generation-routes)
10. [Static assets & deploy-skew](#10-static-assets--deploy-skew)
11. [Database — already on RDS](#11-database--already-on-rds)
12. [Cut-over runbook](#12-cut-over-runbook)
13. [Rollback plan](#13-rollback-plan)
14. [Cost](#14-cost)
15. [Phased delivery checklist](#15-phased-delivery-checklist)
16. [Open questions](#16-open-questions)
- [Appendix A — ECS Fargate scale-up path](#appendix-a-ecs-fargate-scale-up-path)

---

## 1. What we run today (baseline)

`insights-ui` is a **Next.js 15 (App Router, Turbopack)** app on **Vercel**, fronted by an
**AWS CloudFront** distribution (`EZI5H8FKNE9R1`). What the migration must preserve:

| Concern | Today on Vercel | Source of truth |
|---|---|---|
| Runtime | Next.js 15 SSR + RSC, server actions, `force-dynamic` on `/stocks/*` `/etfs/*` `/industry-tariff-report/*` (64 routes) | `next.config.ts`, route configs |
| Edge cache | CloudFront in front of Vercel, 6-day TTL on cacheable prefixes | `cloudfront-deploy-skew.md` |
| Crons | 4 Vercel cron jobs (two `*/3` request generators, daily top gainers/losers) | `vercel.json` |
| CORS / headers | `/api/*` CORS, `noindex` on `/_next/static`, `/public-equities` | `vercel.json` |
| Long jobs | ~10 tariff-generation routes `export const maxDuration = 300` | `src/app/api/industry-tariff-reports/chapters/[chapterSlug]/*` |
| Auth | NextAuth (Google/Discord/Twitter/email), `COOKIE_DOMAIN=.koalagains.com`; cookie security gated on `VERCEL_ENV` | `src/app/api/auth/.../authOptions.ts` |
| Base URL | `getBaseUrl()` derives host from `NEXT_PUBLIC_VERCEL_URL` / `NEXT_PUBLIC_VERCEL_ENV` | `shared/web-core/.../getBaseURL.ts` |
| Data cache | `unstable_cache` (10×) + `revalidateTag` (62×) | `src/utils/*-cache-utils.ts`, `src/app/page.tsx` |
| Edge invalidation | `invalidateCloudFrontPaths()` using `@vercel/functions` `waitUntil` | `src/utils/cloudfront-cache-utils.ts` |
| DB | PostgreSQL via Prisma 6.19 | `prisma/`, `DATABASE_URL` |
| Object storage | AWS S3 (reports, uploads, PPT) | `src/util/upload-image.ts` |
| Headless browser | Puppeteer (scraping) | `src/util/api/scrape/getContentsUsingPuppeteer.ts` |
| External compute | Lambdas (stock/ETF analyzers, remotion, ffmpeg) over HTTPS | `.env.example` `*_LAMBDA_URL` |
| Build dep | Workspace pkg `@dodao/web-core` (pnpm monorepo) | `pnpm-workspace.yaml` |

---

## 2. Why Lightsail Containers (single node)

**Chosen: a single Lightsail container node behind the existing CloudFront.** The key
insight from the code audit: almost all the infrastructure complexity of a Vercel-replacement
(load balancer, NAT, a shared Redis cache handler) exists **only to run 2+ instances** — not
because the app needs it. Two facts make a single node the right default for KoalaGains:

1. **Origin load is low by design.** Per `cloudfront-deploy-skew.md`, CloudFront absorbs the
   hot `/stocks/*`, `/etfs/*`, and tariff traffic at the edge. The origin mostly serves
   cache-misses + API calls — a load one node carries comfortably.
2. **One process ⇒ one coherent cache.** With a single instance, `unstable_cache` /
   `revalidateTag` (10 + 62 usages) stay coherent with **zero extra infrastructure** — no
   ElastiCache, no custom `cacheHandler`. (Multi-instance would break this; see
   [Appendix A](#appendix-a-ecs-fargate-scale-up-path).)

| | Lightsail Containers (chosen) | ECS Fargate ([Appendix A](#appendix-a-ecs-fargate-scale-up-path)) |
|---|---|---|
| Load balancer + TLS | **Bundled** in the service price | Separate ALB (~$16+/mo) |
| Networking | AWS-managed (no VPC/NAT to run) | Full VPC + NAT (~$32+/mo) |
| Shared cache | **None needed (single process)** | ElastiCache for multi-task coherence |
| Scaling | Manual `power` × `scale` | Autoscaling + Multi-AZ HA |
| Terraform surface | **Small** (1 service + deployment) | Large (VPC/ALB/ECS/ElastiCache/…) |
| Repo precedent | `ai-agents/crowd-fund-analysis/terraform` | none |
| ~Monthly cost | **~$40–50** (DB already on RDS) | ~$120–200 + RDS |
| Trade-offs | No autoscaling; no horizontal HA; bundled-LB request timeout (see [§9](#9-long-running-generation-routes)) | More infra to own + cost |

**When to graduate to Fargate:** when origin load outgrows one node, or true HA / autoscaling
becomes a requirement. Going to Lightsail `scale>1` instead would reopen the cache-coherence
problem with no managed Redis in Lightsail to solve it — so the scale-up jump is Lightsail →
Fargate, not Lightsail → bigger Lightsail fleet.

**Why not OpenNext/Amplify:** OpenNext needs a Puppeteer rework for Lambda and a 15-min cap
awkward for the generators; Amplify has a weak Terraform story and no Puppeteer. Both rejected
for this app.

---

## 3. Target architecture

The roll-out is **phased and parallel**: AWS comes up alongside Vercel and is reachable
directly at **`prod.koalagains.com`** (no CloudFront) for validation; CloudFront and the cron
move happen only after we're happy. This is the **Phase A** picture:

```
   prod.koalagains.com ──(Route 53 CNAME)──► Lightsail Container Service
                                              power=medium, scale=1
                                              Next.js `next start` + Chromium
                                              bundled LB + Lightsail-managed TLS
                                              /api/health
                                                       │
   browser ──(assetPrefix)──► S3 (public)              ▼
        /_next/static/*                       Existing RDS PostgreSQL
        served straight from S3,              (public access + SSL, not provisioned here)
        no CloudFront needed                  DATABASE_URL via app_secrets

   koalagains.com  ──► (unchanged) Vercel via existing CloudFront  ◄── still live in parallel

   ⚡ maxDuration=300 tariff generators → return 202 + run in background on the persistent
      container (§9), so no request is held open against the bundled-LB timeout.
   ⏱ EventBridge crons are ACTIVE (this PR) and GET prod.koalagains.com; removed from vercel.json
      so AWS is the single cron owner — §7.
```

In **Phase B** the existing CloudFront (`EZI5H8FKNE9R1`) is pointed at `prod.koalagains.com`
(Lightsail) as its origin; in **Phase C** crons move to EventBridge and Vercel is retired.

**Component summary**

| Layer | AWS service | Notes |
|---|---|---|
| Compute | **Lightsail Container Service** (`power=medium`, `scale=1`) | `next start` (standalone) + Chromium; bundled LB + managed TLS; serves SSR/RSC, API routes, server actions, Puppeteer. Reachable directly at `prod.koalagains.com`. |
| Static assets | **S3 (public)** via Next.js `assetPrefix` | Browser loads `/_next/static/*` straight from S3 — **no CloudFront required**; works in Phase A and B ([§10](#10-static-assets--deploy-skew)) |
| Image registry | ECR | Image built in CI, pulled via the service's ECR image-puller role |
| Database | **Existing RDS Postgres** (public access + SSL; not provisioned here) | App connects via `DATABASE_URL` from `app_secrets` ([§11](#11-database--already-on-rds)) |
| Secrets | Lightsail deployment `environment` (sourced from Secrets Manager in CI) | Lightsail has no native Secrets Manager mount; CI reads SM and injects values ([§6](#6-secrets--environment-variables)) |
| Crons | EventBridge Scheduler + invoker Lambda (gated off in Phase A) | One rule per current Vercel cron; enabled at cut-over |
| Edge / CDN | CloudFront (**Phase B only**) | Reuse `EZI5H8FKNE9R1`; point its origin at `prod.koalagains.com`; keep cacheable behaviors + 6-day TTL |
| DNS / TLS | Route 53 + Lightsail-managed cert (direct host); ACM in us-east-1 for CloudFront (Phase B) | |
| Observability | Lightsail metrics + container logs; CloudWatch for the cron Lambda | |

---

## 4. Terraform layout

Location: **`deployments/insights-ui/`** (repo root).

```
deployments/insights-ui/
├── Dockerfile                # standalone Next.js + Chromium (build context = repo root)
├── .dockerignore
├── README.md
├── versions.tf               # providers (aws 5.x, archive, random), S3 backend
├── providers.tf              # aws (region) + aws.us_east_1 (CloudFront/ACM, Phase B)
├── variables.tf              # region, domains, image_tag, power/scale, rollout gates, app_env/secrets
├── terraform.tfvars.example
├── container.tf              # ECR repo + lightsail_container_service (prod.koalagains.com) + deployment + puller
├── domains.tf                # Lightsail cert for prod.koalagains.com + Route53 validation + direct CNAME
├── s3_static.tf              # public S3 bucket for /_next/static (served via assetPrefix)
├── cloudfront.tf             # PHASE B (gated by manage_cloudfront): distribution → Lightsail, apex/www, CF cert
├── scheduler.tf              # EventBridge crons (gated by enable_crons) + invoker Lambda + IAM
└── outputs.tf
```

**Rollout gates.** Two booleans, both default **off**, keep Phase A minimal:
`manage_cloudfront` (Phase B) and `enable_crons` (Phase C). See [§12](#12-rollout--cut-over-runbook).

**State backend.** S3 + DynamoDB lock. Never commit `*.tfstate` or `terraform.tfvars`
(holds secret values) — only `terraform.tfvars.example`.

The Fargate scale-up path ([Appendix A](#appendix-a-ecs-fargate-scale-up-path)) is documented
but not scaffolded — add it only if/when the app outgrows a single node.

---

## 5. Application & code changes

Most are additive and Vercel-safe, so they can merge before cut-over.

1. **`next.config.ts` — `output: 'standalone'`** for a slim container. Inert on Vercel, safe
   to merge early.

2. **Re-home `vercel.json` behavior** (ignored off Vercel):
   - **CORS** (`/api/*`) and **`noindex`** (`/_next/static/*`, `/public-equities*`) → move into
     `next.config.ts` `async headers()` (host-agnostic).
   - **Crons** → EventBridge ([§7](#7-replacing-vercel-crons)); delete from `vercel.json` at cut-over.

3. **Health endpoint.** Add `GET /api/health` → `200` for the Lightsail public-endpoint health
   check (and the container `HEALTHCHECK`). Reuse an existing route if one already exists.

4. **Puppeteer in-container.** Dockerfile installs system Chromium; set
   `PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium` and launch with `--no-sandbox`. Size the node
   for it (`medium` / 4 GB). Validate scraping after deploy.

5. **`@vercel/functions` `waitUntil` → `after()`.** The only usage is in
   `src/utils/cloudfront-cache-utils.ts` (fire-and-forget CloudFront invalidation). Replace with
   `import { after } from 'next/server'` and drop the dependency. On a persistent container the
   existing orphaned-promise fallback also works, but `after()` is the clean fix. **Verify the
   save-flow invalidation still fires.**

6. **Env vars that gate auth & base-URL — set them, don't rename.** Both confirmed in code:
   - `getBaseUrl()` (shared `@dodao/web-core`) reads **`NEXT_PUBLIC_VERCEL_URL`** +
     **`NEXT_PUBLIC_VERCEL_ENV`**. Set `NEXT_PUBLIC_VERCEL_URL=koalagains.com` and
     `NEXT_PUBLIC_VERCEL_ENV=production` as **Docker build args** (they're `NEXT_PUBLIC_*` →
     build-time). Renaming would mean editing shared web-core used by other apps.
   - `authOptions.ts` reads the non-public **`process.env.VERCEL_ENV`** to set cookie
     `secure: true` + apply `COOKIE_DOMAIN`. Undefined on AWS → insecure cookies, no domain,
     **auth breaks.** Set **`VERCEL_ENV=production` as a runtime container env** (or refactor to
     a host-neutral flag). **Auth-blocking — do not skip.**

7. **Data cache stays coherent for free (single node).** With `scale=1` the 10 `unstable_cache`
   reads + 62 `revalidateTag` calls share one process — no shared cache handler required. **This
   constraint is the main reason the deployment is single-node; do not raise `scale` without
   first adopting a shared `cacheHandler` (Appendix A).**

8. **Long-running generators → background.** Convert the `maxDuration = 300` tariff routes to
   return `202` and process in the background on the persistent container ([§9](#9-long-running-generation-routes)).

9. **Connection pooling.** One container holds a small persistent Prisma pool; keep
   `connection_limit` modest (today `=5`). No serverless connection churn to worry about.

10. **Node version alignment.** `package.json` (`>=22`), README (`>=23.11.0`), Dockerfile
    (`node:22`) disagree — pick one (22 LTS is fine for Next 15) and align all three.

11. **Sitemaps/robots** are dynamic DB-backed route handlers (`src/app/**/sitemap.xml`,
    `robots.ts`). They work unchanged; add a CloudFront cache behavior for `*/sitemap.xml` +
    `/robots.txt` so crawlers don't hammer the single node.

---

## 6. Secrets & environment variables

Lightsail container services have **no native Secrets Manager mount** — the deployment's
`environment` map takes plain strings (encrypted at rest by Lightsail). Keep the secret of
record in **AWS Secrets Manager** and have **CI read it and pass values into `terraform apply`
as sensitive `-var`s** (so nothing secret lands in git or state output). `NEXT_PUBLIC_*` are
build-time and go in as Docker build args.

| Category | Vars | Handling |
|---|---|---|
| Database | `DATABASE_URL` | SM → TF var → deployment env (points at the existing RDS endpoint) |
| Auth | `NEXTAUTH_URL=https://koalagains.com`, `NEXTAUTH_SECRET`, `DODAO_AUTH_SECRET`, `EMAIL_TOKEN_SECRET`, `COOKIE_DOMAIN=.koalagains.com` | deployment env |
| **Vercel-named host vars** | `VERCEL_ENV=production` (runtime), `NEXT_PUBLIC_VERCEL_URL`, `NEXT_PUBLIC_VERCEL_ENV` (build args) | [§5.6](#5-application--code-changes) — keep names, set values |
| OAuth | `GOOGLE_*`, `DISCORD_*`, `TWITTER_*` | deployment env; keep redirect URLs on `koalagains.com` |
| AI providers | `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `GEMINI_MODEL`, `LLM_PROVIDER` | deployment env |
| AWS access | `AWS_REGION`, `KOALA_AWS_*`, `PPT_GENERATION_AWS_*` | Lightsail containers can't assume an IAM task role, so the app's S3/CloudFront/Lambda access still uses **scoped IAM-user keys** (`KOALA_AWS_*`) via deployment env. Scope the policy tightly. |
| Lambdas | `STOCK_ANALYZER_LAMBDA_URL`, `ETF_ANALYZER_LAMBDA_URL`, `ETF_MORN_LAMBDA_URL`, `REMOTION_LAMBDA_URL`, `FFMPEG_LAMBDA_NAME`, `SCREENER_API_URL` | deployment env |
| Misc | `POLYGON_API_KEY`, `AUTOMATION_SECRET` | deployment env |

> **IAM note.** Unlike Fargate (task role), Lightsail containers have no instance/task IAM
> role, so the app keeps using `KOALA_AWS_*` keys for its own AWS calls. This is the one place
> Lightsail is *less* clean than Fargate — mitigate by scoping the IAM user to exactly the S3
> buckets + CloudFront distribution + Lambda functions it uses, and rotating the keys.

---

## 7. Crons moved to AWS (done in this PR)

The 4 crons are **removed from `vercel.json`** and recreated as **EventBridge Scheduler** rules,
each triggering a tiny **invoker Lambda** that issues an HTTPS **GET** to the same app endpoint
(Lightsail has no built-in scheduler). Removing them from Vercel in the same change means AWS
is the **single cron owner** — no double-run against the shared RDS.

| Was (Vercel) | Path (`spaceId` = `koala_gains`) | EventBridge expression |
|---|---|---|
| `*/3 * * * *` | `/api/koala_gains/tickers-v1/generate-ticker-v1-request` | `rate(3 minutes)` |
| `0 23 * * 1-5` | `/api/koala_gains/tickers-v1/generate-daily-top-gainers` | `cron(0 23 ? * MON-FRI *)` |
| `0 23 * * 1-5` | `/api/koala_gains/tickers-v1/generate-daily-top-losers` | `cron(0 23 ? * MON-FRI *)` |
| `*/3 * * * *` | `/api/koala_gains/etfs-v1/generate-etf-v1-request` | `rate(3 minutes)` |

- **Method/auth contract (verified in code):** all four are `export const GET` handlers with
  **no auth check** today (they relied on Vercel's internal cron invocation). The invoker
  therefore does a plain **GET** — same exposure as today. In Phase A it targets
  `https://prod.koalagains.com`; the local `cron_base_url` switches to the apex automatically
  once `manage_cloudfront=true`.
- **Schedules are created by default** (`enable_crons=true`). They go live the moment the
  Lightsail app is reachable at `prod.koalagains.com`. Deploy AWS around the same time you merge
  the `vercel.json` change; a brief gap is harmless (the `*/3` jobs just resume next tick).
- **Hardening (optional, not blocking):** add an `AUTOMATION_SECRET` (or CloudFront/header)
  check to these GET endpoints and have the invoker send it — they're currently world-triggerable
  on the public host, exactly as on Vercel.
- `UTC` preserves the current `0 23` timing.

---

## 8. CI/CD changes

New workflow **`.github/workflows/insights-ui-deploy-aws.yml`** (replaces the Vercel deploy at
cut-over):

1. **Auth to AWS** via GitHub OIDC (preferred) or `KOALA_AWS_*`.
2. **Create ECR repo + S3 bucket first** (`terraform apply -target`) so the push/upload have
   targets.
3. **Build & push image** to ECR, tagged with the git SHA (build context = repo root for the
   `@dodao/web-core` workspace dep). Pass `NEXT_PUBLIC_VERCEL_URL`, `NEXT_PUBLIC_VERCEL_ENV`,
   and `NEXT_PUBLIC_ASSET_PREFIX` (the S3 base URL) as build args.
4. **Upload static assets** to S3 (no `--delete` — retain old builds, [§10](#10-static-assets--deploy-skew)).
5. **Read secrets from Secrets Manager** and **`terraform apply`** (`deployments/insights-ui/`)
   with `-var image_tag=<sha>` + the sensitive `app_secrets` map → registers a new Lightsail
   deployment version (health-checked rolling deploy).
6. **Hit `/api/health`** on `prod.koalagains.com`.

The workflow targets **AWS only** — Vercel keeps deploying through its own flow during Phase A.
The lint/typecheck/build gates in `main.yml` (`insights_ui_job`) are unchanged.

The lint/typecheck/build gates in `main.yml` (`insights_ui_job`) are unchanged.

---

## 9. Long-running generation routes

~10 tariff routes under `/api/industry-tariff-reports/chapters/[chapterSlug]/*` export
`maxDuration = 300`. Lightsail's bundled load balancer request timeout is **not freely
configurable** (unlike an ALB `idle_timeout`), so holding an HTTP request open for 5 minutes
is unsafe. Because the container is **persistent** (not serverless), the clean fix is an
**async pattern**:

- The route **enqueues the work and returns `202 Accepted`** immediately, then completes the
  generation in the background (`after()` or a background promise / lightweight in-process
  queue). The process is long-lived, so the work survives the response — no request stays open
  against the LB timeout.
- The admin UI polls a status endpoint (or re-reads the generated record) instead of blocking
  on the long request.
- **Alternative / interim:** several generators already have CLI equivalents under
  `src/scripts/*` (e.g. `yarn generate:tariff`). Long ad-hoc generations can be run as a
  one-off script/task instead of an HTTP route until the async refactor lands.

This is the **one app-code change the Lightsail choice forces** (Fargate could instead just
raise the ALB timeout). It is also a better design on any platform, so it is worth doing.

---

## 10. Static assets & deploy-skew

**Static is served from a public S3 bucket via Next.js `assetPrefix`** — the browser fetches
`/_next/static/*` straight from `https://insights-ui-static-assets.s3.<region>.amazonaws.com`,
**with or without CloudFront in front**. The app container never serves the big JS/CSS chunks.

- `assetPrefix` is set from the `NEXT_PUBLIC_ASSET_PREFIX` build arg (`next.config.ts`). It's
  build-time, so the **Vercel build leaves it unset** (normal same-origin assets) — only the
  AWS image points at S3. Safe to merge.
- CI uploads each build's `.next/static` to S3 **without deleting prior builds** (hashed names
  never collide), so any cached HTML referencing an older build's chunks keeps resolving them.
  Lifecycle expiry at 14 days bounds storage while exceeding any cache window → **this is the
  deploy-skew protection** (replaces Vercel Skew Protection).
- **Lightsail rolling deploys** keep the previous deployment version serving until the new one
  is healthy, so SSR has no hard cut gap either.
- Bucket is public-read on `/_next/static/*` + `/public/*` with CORS for the app origins. When
  CloudFront arrives (Phase B) nothing changes — the browser still goes straight to S3 for
  static, so CloudFront needs no S3 origin/behavior.

---

## 11. Database — already on RDS

**Postgres already lives in RDS with public access enabled, and that's accepted.** Terraform
provisions nothing for the DB — the app just needs `DATABASE_URL` (existing RDS endpoint,
`sslmode=require`) injected via `app_secrets`. No data migration, no schema change.

Because RDS is publicly reachable, the Lightsail container (which isn't in your VPC) connects
over the public endpoint with SSL — no VPC peering or Fargate needed. Recommended hardening,
none of it blocking:

- Keep `sslmode=require` (or `verify-full` with the RDS CA bundle).
- Restrict the RDS security group to known source ranges where practical (Lightsail egress IPs
  are dynamic, so lean primarily on SSL + strong credentials).
- Keep `connection_limit` modest in `DATABASE_URL` (today `=5`) — one container, one small pool.

---

## 12. Rollout & cut-over runbook

Three phases. **Phase A runs AWS in parallel with Vercel** — Vercel keeps serving
`koalagains.com` via its CloudFront the whole time; nothing about the live site changes until
Phase B.

### Phase A — parallel, direct (now)
1. **Merge §5 app prep** (standalone output, `assetPrefix`, headers, `/api/health`,
   `waitUntil`→`after()`, async generators, `VERCEL_ENV` handling) — all Vercel-safe.
2. **Store secrets** in Secrets Manager (`insights-ui/app-env`), incl. `DATABASE_URL` → existing
   RDS, `NEXTAUTH_URL=https://prod.koalagains.com`.
3. **Add `prod.koalagains.com` to the Google/Discord/Twitter OAuth redirect URIs** so auth works
   on the direct host.
4. **Deploy** (CI or manual, `manage_cloudfront=false`, `enable_crons=false`): create ECR + S3,
   build/push image, upload static, `terraform apply` the Lightsail service + `prod.koalagains.com`
   cert/DNS. (If the cert is still validating on first apply, re-run after it issues.)
5. **Verify directly at `https://prod.koalagains.com`**: auth + cookies, `/stocks/*`, `/etfs/*`,
   tariff pages, an async generator (202 + completion), Puppeteer scrape, S3 upload, static
   assets loading from S3, DB reads/writes against RDS. Vercel is untouched throughout.

### Phase B — put CloudFront in front (when Phase A looks good)
6. Set `manage_cloudfront=true` and `terraform import 'aws_cloudfront_distribution.main[0]'
   EZI5H8FKNE9R1`; reconcile until `plan` is clean (replicate **all** existing behaviors,
   incl. the Phase-5 per-stocks-page API endpoints).
7. **Apply** — CloudFront origin now points at `prod.koalagains.com` (Lightsail). Switch the
   image build arg `NEXT_PUBLIC_VERCEL_URL` to `koalagains.com` and redeploy so server-side
   absolute URLs use the apex. CloudFront keeps serving cached pages throughout.

> **Crons already moved (this PR).** EventBridge owns the 4 crons and they're removed from
> `vercel.json` ([§7](#7-crons-moved-to-aws-done-in-this-pr)) — so there's no separate cron
> cut-over step. They GET `prod.koalagains.com` in Phase A and auto-switch to the apex in
> Phase B.

### Phase C — retire Vercel
8. **Monitor** Lightsail metrics, container logs, RDS connections, and cron runs for 24–48h.
9. **Decommission Vercel** once stable: delete the project, remove the Vercel deploy workflow,
   drop `@vercel/*` deps.

---

## 13. Rollback plan

- **Phase A:** there is nothing to roll back on the live site — Vercel still serves
  `koalagains.com`. If AWS misbehaves, just stop sending traffic to `prod.koalagains.com`.
- **Phase B (after CloudFront swap):** repoint the CloudFront origin back to Vercel (kept warm
  until decommission). Minutes to propagate.
- **App rollback:** redeploy the **previous Lightsail deployment version** (Lightsail retains
  prior versions) or the previous ECR image tag.
- **Database:** RDS is the same instance Vercel uses, so there is no separate DB to roll back —
  schema changes (if any) must stay backward-compatible across the parallel window.
- Keep Vercel alive **≥ one CloudFront TTL window (6–7 days)** after Phase B before deleting.

---

## 14. Cost

Indicative monthly (illustrative — confirm with the AWS calculator):

| Item | Driver | Note |
|---|---|---|
| Lightsail container service | `power` × `scale` | `medium` (1 vCPU / 4 GB) **$40**, includes LB + TLS; `small` (2 GB) **$20** if Puppeteer headroom allows |
| Database | existing RDS | $0 incremental — already running |
| CloudFront | unchanged | already in use |
| S3 assets (optional) | tiny | static chunks only |
| Lambda + EventBridge | negligible | cron invokers |
| ECR | tiny | image storage |
| **Ballpark** | | **~$40–50/mo on top of the existing RDS** (vs. ~$120–200 + RDS for Fargate) |

No NAT gateway, no ALB line item, no ElastiCache, no new DB — the bundled Lightsail LB,
single-process cache, and existing RDS remove the biggest cost adders of the Fargate design.

---

## 15. Phased delivery checklist

- [ ] **Phase 0 — App prep (Vercel-safe):** `output: 'standalone'`; move `vercel.json` headers
      into `next.config.ts`; add `/api/health`; `waitUntil`→`after()`; convert `maxDuration=300`
      routes to async/202 ([§9](#9-long-running-generation-routes)); set `VERCEL_ENV` cookie
      handling ([§5.6](#5-application--code-changes)); align Node version; Dockerfile + local run.
- [ ] **Phase 1 — Lightsail foundation:** ECR, S3 static bucket, container service + first
      deployment, `prod.koalagains.com` cert/DNS, confirm RDS connectivity ([§11](#11-database--already-on-rds)).
- [ ] **Phase 2 — Crons & CI (this PR):** EventBridge crons live + removed from `vercel.json`;
      GitHub Actions build/push + `terraform apply` workflow (secrets from Secrets Manager).
- [ ] **Phase 3 — Verify directly at `prod.koalagains.com`:** auth, pages, async generator,
      Puppeteer, S3 static loading, RDS reads/writes — Vercel untouched.
- [ ] **Phase 4 (B) — CloudFront:** `manage_cloudfront=true`, import `EZI5H8FKNE9R1`, point its
      origin at `prod.koalagains.com`, rebuild with apex base URL.
- [ ] **Phase 5 (C) — Decommission Vercel:** delete project, remove Vercel deploy workflow & deps.

---

## 16. Open questions

1. **AWS account & region** for the Lightsail service + ECR? (Phase-B CloudFront/ACM cert must
   be in `us-east-1`.)
2. **Node size:** `small` (2 GB) vs. `medium` (4 GB) — driven by Puppeteer memory headroom.
   Default `medium`.
3. **Long-running routes** ([§9](#9-long-running-generation-routes)): commit to the async/202
   refactor (recommended), or run those generations via CLI scripts for now?
4. **Cron hardening:** add an `AUTOMATION_SECRET` check to the GET cron endpoints now, or keep
   today's open-endpoint parity ([§7](#7-crons-moved-to-aws-done-in-this-pr))?
5. **CI auth:** GitHub OIDC role vs. existing `KOALA_AWS_*` keys.

> Resolved: **DB stays on the existing public RDS** (connect over SSL — no VPC peering/Fargate);
> **static is served from S3** via `assetPrefix`; **crons move to AWS in this PR**.

---

## Appendix A — ECS Fargate scale-up path

If/when the app outgrows a single node (origin load, or a hard HA/autoscaling requirement),
move to **ECS Fargate**. This path is **documented but not scaffolded** — it would add, on top
of this plan:

- **VPC (2 AZ) + NAT**, an **internal ALB** (origin-locked to CloudFront via a secret header,
  `idle_timeout=300` for the long generators — so Fargate can keep those routes synchronous if
  preferred), and **ECS service + autoscaling**.
- **ElastiCache (Redis) + a Next.js `cacheHandler`** — **required** at `scale ≥ 2`, because the
  default Next.js cache is per-instance: a `revalidateTag()` on one task would not invalidate
  the others, so `unstable_cache` reads would go stale across tasks. This is the single biggest
  reason multi-instance is more than "the same thing, bigger."
- **ECS task IAM role** replacing the `KOALA_AWS_*` keys for the app's own AWS calls.
- **RDS (Multi-AZ)** in private subnets.

Everything else (CloudFront reuse, EventBridge crons, S3 static-asset skew strategy, the §5
code changes, secrets-from-Secrets-Manager) carries over unchanged. The §5 app changes are all
forward-compatible with Fargate, so adopting Lightsail first does not create rework — the only
Fargate-specific additions are the cache handler and the IAM task role.

---

*See [`deployments/insights-ui/`](../../deployments/insights-ui/) for the Terraform and the
Dockerfile that implement this plan.*
