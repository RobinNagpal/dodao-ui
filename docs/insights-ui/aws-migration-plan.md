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
10. [Deploy-skew handling](#10-deploy-skew-handling)
11. [Database](#11-database)
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
| ~Monthly cost | **~$55–70 all-in** | ~$120–200 |
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

```
                         Route 53 (koalagains.com)
                                   │
                      ┌────────────▼─────────────┐
                      │   CloudFront (reuse        │  ← EZI5H8FKNE9R1, swap origin
                      │   EZI5H8FKNE9R1)           │
                      │  - /_next/static/* → S3     │  (optional, skew safety — §10)
                      │  - /stocks|/etfs|tariff/*   │  cacheable, 6-day TTL (unchanged)
                      │  - default → Lightsail      │  + secret header (origin lock)
                      └──────┬───────────────┬──────┘
                             │               │
            ┌────────────────▼──┐     ┌──────▼───────────────────────────┐
            │ S3 (static assets) │     │  Lightsail Container Service      │
            │  (optional)        │     │  power=medium, scale=1            │
            └────────────────────┘     │  Next.js `next start` + Chromium  │
                                       │  public HTTPS endpoint (bundled    │
                                       │  LB + managed TLS), /api/health    │
                                       └───────────────┬───────────────────┘
                                                       │
                                    ┌──────────────────▼─────────────────┐
                                    │ PostgreSQL                          │
                                    │ (existing managed DB, or Lightsail  │
                                    │  managed Postgres) — DATABASE_URL   │
                                    └─────────────────────────────────────┘

   ⚡ maxDuration=300 tariff generators → return 202 + run in background on the persistent
      container (§9), so no request is held open against the bundled-LB timeout.

   EventBridge Scheduler (4 rules) ──► invoker Lambda ──► HTTPS POST to cron endpoints
                                                          (Authorization: AUTOMATION_SECRET)
```

**Component summary**

| Layer | AWS service | Notes |
|---|---|---|
| Edge / CDN | CloudFront | Reuse `EZI5H8FKNE9R1`; change origin Vercel → Lightsail service URL; keep cacheable behaviors + 6-day TTL |
| Compute | **Lightsail Container Service** (`power=medium`, `scale=1`) | `next start` (standalone) + Chromium; bundled load balancer + managed TLS + custom-domain support; SSR/RSC, API routes, server actions, Puppeteer |
| Image registry | ECR | Image built in CI, pulled via the service's ECR image-puller role |
| Static assets (optional) | S3 + CloudFront origin | Offload `/_next/static` for deploy-skew safety ([§10](#10-deploy-skew-handling)) |
| Database | Existing managed Postgres **or** Lightsail managed Postgres | App connects via `DATABASE_URL` (SSL) |
| Secrets | Lightsail deployment `environment` (sourced from Secrets Manager in CI) | Lightsail has no native Secrets Manager mount; CI reads SM and passes values into the deployment ([§6](#6-secrets--environment-variables)) |
| Crons | EventBridge Scheduler + invoker Lambda | One rule per current Vercel cron |
| DNS / TLS | Route 53 + ACM (CloudFront, us-east-1) + Lightsail managed cert | |
| Observability | Lightsail metrics + container logs; CloudWatch for the cron Lambda | |

> **CloudFront reuse.** Keep `EZI5H8FKNE9R1` and the `flush-cloudfront-cache` workflow as-is —
> only the **origin** changes (Vercel → the Lightsail service public domain, HTTPS custom
> origin, locked with a secret header). `terraform import` the distribution into state rather
> than recreating it (a recreate changes the domain and breaks DNS + invalidation history).

---

## 4. Terraform layout

Primary (Lightsail): **`insights-ui/deploy/aws/terraform-lightsail/`**

```
insights-ui/deploy/aws/
├── Dockerfile                       # standalone Next.js + Chromium (build context = repo root)
├── .dockerignore
├── README.md
├── terraform-lightsail/             # ← PRIMARY (this plan)
│   ├── versions.tf                  # providers (aws 5.x, archive), S3 backend
│   ├── providers.tf                 # aws (region) + aws.us_east_1 (CloudFront/ACM)
│   ├── variables.tf                 # region, domain, image_tag, power/scale, secret vars
│   ├── terraform.tfvars.example
│   ├── container.tf                 # lightsail_container_service + deployment_version + ECR puller policy
│   ├── database.tf                  # OPTIONAL lightsail managed Postgres (flag-gated)
│   ├── cloudfront.tf                # import EZI5H8FKNE9R1; origin → Lightsail; S3 static behavior
│   ├── s3_assets.tf                 # OPTIONAL static-asset bucket (skew safety)
│   ├── scheduler.tf                 # EventBridge Scheduler + invoker Lambda + its IAM
│   ├── acm.tf / route53.tf          # CloudFront cert + DNS
│   └── outputs.tf
└── terraform/                       # ← ECS Fargate scale-up path (Appendix A)
```

**State backend.** S3 + DynamoDB lock. Never commit `*.tfstate` or `terraform.tfvars`
(holds secret values) — only `terraform.tfvars.example`.

A runnable skeleton lands under `terraform-lightsail/`; values are placeholders and it is not
`apply`-ready until the open questions ([§16](#16-open-questions)) are answered.

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
| Database | `DATABASE_URL` | SM → TF var → deployment env (point at the chosen Postgres) |
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

## 7. Replacing Vercel crons

`vercel.json`'s 4 crons → **EventBridge Scheduler** rules, each triggering a tiny **invoker
Lambda** that does an authenticated HTTPS `POST` (`Authorization: <AUTOMATION_SECRET>`) to the
same app endpoint. (Lightsail has no built-in scheduler, so this is unchanged from the generic
plan.)

| Schedule (cron) | Path | EventBridge expression |
|---|---|---|
| `*/3 * * * *` | `/api/koala_gains/tickers-v1/generate-ticker-v1-request` | `rate(3 minutes)` |
| `0 23 * * 1-5` | `/api/koala_gains/tickers-v1/generate-daily-top-gainers` | `cron(0 23 ? * MON-FRI *)` |
| `0 23 * * 1-5` | `/api/koala_gains/tickers-v1/generate-daily-top-losers` | `cron(0 23 ? * MON-FRI *)` |
| `*/3 * * * *` | `/api/koala_gains/etfs-v1/generate-etf-v1-request` | `rate(3 minutes)` |

- Each endpoint **must validate `AUTOMATION_SECRET`** (this becomes the auth boundary).
- Keep `UTC` to preserve the current `0 23` timing.

---

## 8. CI/CD changes

New workflow **`.github/workflows/insights-ui-deploy-aws.yml`** (replaces the Vercel deploy at
cut-over):

1. **Auth to AWS** via GitHub OIDC (preferred) or `KOALA_AWS_*`.
2. **Build & push image** to ECR, tagged with the git SHA (build context = repo root for the
   `@dodao/web-core` workspace dep). Pass `NEXT_PUBLIC_VERCEL_URL` / `NEXT_PUBLIC_VERCEL_ENV`
   as build args.
3. **(Optional) upload static assets** to S3 for skew safety ([§10](#10-deploy-skew-handling)).
4. **Read secrets from Secrets Manager** and **`terraform apply`** (`terraform-lightsail/`) with
   `-var image_tag=<sha>` + sensitive env `-var`s → registers a new Lightsail deployment
   version (health-checked rolling deploy).
5. **Wait for the service `ACTIVE`/healthy** and hit `/api/health`.
6. CloudFront stays as-is; `flush-cloudfront-cache.yml` + `invalidateCloudFrontPaths()` keep
   working.

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

## 10. Deploy-skew handling

Today Vercel Skew Protection + CloudFront keep old JS chunks reachable so CloudFront-cached
HTML (referencing build N's hashed chunks) keeps working after a deploy to N+1. On Lightsail:

- **Lightsail does health-checked rolling deploys** — the previous deployment version keeps
  serving until the new one is healthy, so there's no hard cutover gap.
- **But** CloudFront-cached HTML can reference build N's `/_next/static/*` chunks for up to the
  6-day TTL, while the new container only serves build N+1's chunks → 404s on old chunks for
  cached pages.
- **Mitigation (recommended): offload `/_next/static/*` (and `public/`) to S3** via a CloudFront
  behavior, and on each deploy upload the new build's assets **without deleting old ones**
  (hashed names never collide). Old chunks remain fetchable ≥ one TTL window (lifecycle expiry
  at 14 days). This reproduces the Vercel skew window. The S3 bucket + behavior are the
  `s3_assets.tf` / CloudFront pieces in the skeleton.
- **Lighter alternative:** accept a brief skew exposure and rely on Next's `deploymentId` +
  client reload; simpler but can surface a stale-asset 404 on cached pages right after a deploy.

---

## 11. Database

- **Keep the existing managed Postgres** if there is one — only `DATABASE_URL` (and network
  reachability + SSL) needs confirming. Lowest-risk.
- **Or provision Lightsail managed Postgres** (`database.tf`, flag-gated) for an all-in-Lightsail
  setup. Note: a Lightsail container service reaching a Lightsail managed DB uses the DB's
  endpoint with SSL — validate connectivity (public-with-SSL vs. private) during staging.
- **Or RDS** if you want VPC-private Postgres (this nudges toward the Fargate topology, since
  Lightsail containers aren't in your VPC).
- Migrate via `pg_dump` → restore (or `prisma migrate deploy` for a fresh schema), verify row
  counts on the largest tables, repoint `DATABASE_URL`, keep the old DB read-only until sign-off.

---

## 12. Cut-over runbook

DNS stays on CloudFront throughout; only the CloudFront origin changes, so the public hostname
never moves.

1. **Merge §5 app prep** (standalone output, headers, `/api/health`, `waitUntil`→`after()`,
   async generators, `VERCEL_ENV` handling) — all Vercel-safe.
2. **`terraform apply` the Lightsail stack** (service `scale=1`, crons disabled): ECR, container
   service + first deployment, optional DB, optional S3 assets, CloudFront cert.
3. **Build & push the image**, confirm the service goes healthy, run DB migration ([§11](#11-database)).
4. **Smoke test the Lightsail public URL directly** (or a `staging.koalagains.com` record):
   auth + cookies, `/stocks/*`, `/etfs/*`, tariff pages, an async generator (202 + completion),
   Puppeteer scrape, S3 upload, CloudFront invalidation helper.
5. **Import the production CloudFront** (`terraform import aws_cloudfront_distribution.main
   EZI5H8FKNE9R1`); reconcile until `plan` is clean.
6. **Swap the origin** to the Lightsail service (default behavior) + S3 (static behavior). Apply.
   CloudFront keeps serving cached pages throughout.
7. **Enable EventBridge crons**; remove crons from `vercel.json`.
8. **Monitor** Lightsail metrics, container logs, DB connections for 24–48h.
9. **Decommission Vercel** once stable: delete the project/cron, remove the Vercel workflow,
   drop `@vercel/*` deps.

---

## 13. Rollback plan

- **Fast rollback (origin):** repoint the CloudFront default behavior back to the Vercel origin
  (kept warm until step 9). Minutes to propagate.
- **App rollback:** redeploy the **previous Lightsail deployment version** (Lightsail retains
  prior versions) or the previous ECR tag.
- **DB rollback:** old DB kept read-only until sign-off; repoint `DATABASE_URL` back.
- Keep Vercel alive **≥ one CloudFront TTL window (6–7 days)** post-cut-over before deleting.

---

## 14. Cost

Indicative monthly (illustrative — confirm with the AWS calculator):

| Item | Driver | Note |
|---|---|---|
| Lightsail container service | `power` × `scale` | `medium` (1 vCPU / 4 GB) **$40**, includes LB + TLS; `small` (2 GB) **$20** if Puppeteer headroom allows |
| Database | managed Postgres | existing DB = $0 incremental; Lightsail managed Postgres ~$15–30 |
| CloudFront | unchanged | already in use |
| S3 assets (optional) | tiny | static chunks only |
| Lambda + EventBridge | negligible | cron invokers |
| ECR | tiny | image storage |
| **Ballpark** | | **~$55–70 all-in** (vs. ~$120–200 for Fargate) |

No NAT gateway, no ALB line item, no ElastiCache — the bundled Lightsail LB and single-process
cache remove the three biggest cost adders of the Fargate design.

---

## 15. Phased delivery checklist

- [ ] **Phase 0 — App prep (Vercel-safe):** `output: 'standalone'`; move `vercel.json` headers
      into `next.config.ts`; add `/api/health`; `waitUntil`→`after()`; convert `maxDuration=300`
      routes to async/202 ([§9](#9-long-running-generation-routes)); set `VERCEL_ENV` cookie
      handling ([§5.6](#5-application--code-changes)); align Node version; Dockerfile + local run.
- [ ] **Phase 1 — Lightsail foundation:** ECR, container service + first deployment, DB
      decision, optional S3 assets bucket, CloudFront cert.
- [ ] **Phase 2 — Crons & CI:** EventBridge Scheduler + invoker Lambda; GitHub Actions
      build/push + `terraform apply` workflow (secrets sourced from Secrets Manager).
- [ ] **Phase 3 — Edge:** import CloudFront, point origin at Lightsail, add S3 static behavior,
      validate on a staging host.
- [ ] **Phase 4 — DB migration & staging validation:** dump/restore, full smoke test.
- [ ] **Phase 5 — Cut-over:** swap CloudFront origin, enable AWS crons, disable Vercel crons,
      monitor.
- [ ] **Phase 6 — Decommission Vercel:** delete project, remove Vercel workflow & deps.

---

## 16. Open questions

1. **AWS account & region** for the Lightsail service + ECR? (CloudFront/ACM cert must be in
   `us-east-1`.)
2. **Node size:** `small` (2 GB) vs. `medium` (4 GB) — driven by Puppeteer memory headroom.
   Default `medium`.
3. **Database:** keep the existing managed Postgres, or move to Lightsail managed Postgres
   ([§11](#11-database))?
4. **Long-running routes** ([§9](#9-long-running-generation-routes)): commit to the async/202
   refactor (recommended), or run those generations via CLI scripts for now?
5. **CloudFront:** confirm import & reuse of `EZI5H8FKNE9R1`.
6. **Static-asset/skew:** S3-offload (recommended) vs. accept a brief skew window
   ([§10](#10-deploy-skew-handling)).
7. **CI auth:** GitHub OIDC role vs. existing `KOALA_AWS_*` keys.

---

## Appendix A — ECS Fargate scale-up path

If/when the app outgrows a single node (origin load, or a hard HA/autoscaling requirement),
move to **ECS Fargate** — the Terraform for it lives in `insights-ui/deploy/aws/terraform/`.
It adds, on top of this plan:

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

*See [`insights-ui/deploy/aws/`](../../insights-ui/deploy/aws/) for the Dockerfile, the
primary `terraform-lightsail/` skeleton, and the `terraform/` Fargate scale-up tree.*
