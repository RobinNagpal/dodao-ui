# Insights-UI: Vercel → AWS Migration Plan (Terraform)

Status: **Proposed** · Owner: Platform · Scope: `insights-ui` (KoalaGains, `koalagains.com`)

This document is the single reference for moving `insights-ui` off Vercel and onto a
Terraform-managed AWS deployment. It covers the target architecture, the Terraform
module layout, every application/code change required, the CI/CD changes, the cron
replacement, secrets, the cut-over runbook, rollback, and cost notes.

> **Companion reading.** [`cloudfront-deploy-skew.md`](./cloudfront-deploy-skew.md) describes the
> current CloudFront-in-front-of-Vercel caching architecture and the deploy-skew bug. The
> migration below **keeps CloudFront** and only swaps the origin (Vercel → AWS), so that doc's
> mental model still mostly applies — the deploy-skew section becomes even more important
> (see [§9 Deploy-skew on AWS](#9-deploy-skew-on-aws)).

---

## Table of contents

1. [What we run today (baseline)](#1-what-we-run-today-baseline)
2. [Target architecture](#2-target-architecture)
3. [Why containers (ECS Fargate) over OpenNext/Amplify](#3-why-containers-ecs-fargate-over-opennextamplify)
4. [Terraform layout](#4-terraform-layout)
5. [Application & code changes](#5-application--code-changes)
6. [Secrets & environment variables](#6-secrets--environment-variables)
7. [Replacing Vercel crons](#7-replacing-vercel-crons)
8. [CI/CD changes](#8-cicd-changes)
9. [Deploy-skew on AWS](#9-deploy-skew-on-aws)
10. [Database migration](#10-database-migration)
11. [Cut-over runbook](#11-cut-over-runbook)
12. [Rollback plan](#12-rollback-plan)
13. [Cost considerations](#13-cost-considerations)
14. [Phased delivery checklist](#14-phased-delivery-checklist)
15. [Open questions](#15-open-questions)

---

## 1. What we run today (baseline)

`insights-ui` is a **Next.js 15 (App Router, Turbopack)** application currently hosted on
**Vercel**, fronted by an **AWS CloudFront** distribution (`EZI5H8FKNE9R1`). Key facts the
migration has to preserve:

| Concern | Today on Vercel | Source of truth |
|---|---|---|
| Runtime | Next.js 15 SSR + RSC, server actions, `force-dynamic` `/stocks/*` `/etfs/*` `/industry-tariff-report/*` | `next.config.ts`, route segment configs |
| Edge cache | CloudFront in front of Vercel origin, 6-day TTL on cacheable prefixes | `cloudfront-deploy-skew.md` |
| Crons | 4 Vercel cron jobs (3-min ticker/etf request generators, daily top gainers/losers) | `vercel.json` |
| CORS / headers | `/api/*` CORS, `noindex` on `/_next/static`, `/public-equities` | `vercel.json` |
| Auth | NextAuth (Google/Discord/Twitter/email), JWT, `COOKIE_DOMAIN=.koalagains.com` | `src/app/api/auth/*`, `.env.example` |
| DB | PostgreSQL via Prisma (`@prisma/client` 6.19) | `prisma/`, `DATABASE_URL` |
| Object storage | AWS S3 (reports, uploads, PPT generation) | `src/util/upload-image.ts`, `insights-constants.ts` |
| Headless browser | Puppeteer (scraping) | `src/util/api/scrape/getContentsUsingPuppeteer.ts` |
| External compute | Lambdas (stock/ETF analyzers, remotion, ffmpeg, screener) invoked over HTTPS | `.env.example` `*_LAMBDA_URL` |
| Image optimization | Next.js `<Image>` with `raw.githubusercontent.com` remote pattern | `next.config.ts` |
| Redirects | ~25 permanent redirects for tariff report slugs | `next.config.ts` |
| Skew protection | Vercel Skew Protection (7-day window) | `cloudfront-deploy-skew.md` |
| Build dep | Workspace package `@dodao/web-core` (pnpm monorepo) | `pnpm-workspace.yaml` |

**Migration must keep:** CloudFront edge cache, all CORS/redirect/header behavior, all 4
crons, NextAuth on `.koalagains.com`, Puppeteer support, S3 access, and the existing
`flush-cloudfront-cache` invalidation workflow.

---

## 2. Target architecture

> **Two flavors of the same container.** The architecture below is the **horizontally-scaled
> ECS Fargate** topology (full HA, autoscaling). For the initial migration a **single-node
> Lightsail** variant is recommended as cheaper and simpler — it drops the ALB and ElastiCache
> entirely (see [§3a](#3a-the-single-node-simplification)). Read this section as the "scale-up"
> target; the Lightsail variant is a strict subset of it.

Scaled target: **containerized Next.js on ECS Fargate, behind an internal ALB, behind
the existing CloudFront**, with static assets offloaded to S3+CloudFront, RDS Postgres,
Secrets Manager, and EventBridge Scheduler for crons. Everything below is Terraform-managed.

```
                              Route 53 (koalagains.com)
                                       │
                          ┌────────────▼─────────────┐
                          │   CloudFront distribution │  ← reuse EZI5H8FKNE9R1 (swap origin)
                          │  - /_next/static/*  → S3  │
                          │  - /stocks|/etfs|tariff/* │  cacheable (6-day TTL, unchanged)
                          │  - default behavior → ALB │  + custom secret header (origin lock)
                          └──────┬─────────────┬──────┘
                                 │             │
                  ┌──────────────▼──┐     ┌────▼─────────────────────┐
                  │ S3 (static/     │     │  Application Load Balancer │  (HTTPS, ACM cert)
                  │  public assets) │     │  internal, private subnets │
                  └─────────────────┘     └────────────┬──────────────┘
                                                       │  target group :3000, /api/health
                                          ┌────────────▼──────────────┐
                                          │  ECS Fargate service       │
                                          │  Next.js `next start`      │
                                          │  (standalone) + Chromium   │
                                          │  rolling deploy, 2+ tasks  │
                                          └──┬─────────┬─────────┬────────┘
                                             │         │         │
                       ┌─────────────────────▼─┐ ┌─────▼──────┐ ┌▼──────────────────┐
                       │ RDS PostgreSQL         │ │ ElastiCache│ │ Secrets Manager    │
                       │ (private subnets)      │ │ (Redis):   │ │ (DATABASE_URL,     │
                       │                        │ │ shared     │ │  keys, REDIS_URL)  │
                       │                        │ │ cacheHandler│ │                   │
                       └────────────────────────┘ └────────────┘ └────────────────────┘

   ⚡ /api/industry-tariff-reports/.../* (maxDuration=300) → origin.koalagains.com → ALB (bypasses CloudFront)

        EventBridge Scheduler (4 rules)  ──►  invoker Lambda  ──►  HTTPS POST to app cron endpoints
                                                                   (Authorization: AUTOMATION_SECRET)
```

**Component summary**

| Layer | AWS service | Notes |
|---|---|---|
| Edge / CDN | CloudFront | Reuse existing distribution; change origin from Vercel domain to ALB + S3 origins |
| Static assets | S3 + CloudFront origin | `.next/static` + `public/` uploaded per deploy, retained across deploys (skew safety) |
| Compute | ECS Fargate | `next start` from `output: 'standalone'`; 2+ tasks; handles SSR/RSC, API routes, server actions, Puppeteer |
| Load balancing | ALB (internal) | Only CloudFront may reach it (custom header + SG); ACM cert for TLS |
| Database | RDS for PostgreSQL (or Aurora Serverless v2) | Private subnets; Multi-AZ in prod |
| **Shared cache** | **ElastiCache (Redis/Valkey)** | **Backs the Next.js `cacheHandler` so `unstable_cache`/`revalidateTag` stay coherent across tasks ([§5.10](#5-application--code-changes)). Omit only if option (b) — drop `unstable_cache` — is chosen.** |
| Secrets | Secrets Manager | Injected into the task definition as `secrets` |
| Crons | EventBridge Scheduler + small invoker Lambda | One rule per current Vercel cron |
| Container registry | ECR | Image built in CI, tagged with git SHA |
| DNS / TLS | Route 53 + ACM | App cert in `us-east-1` for CloudFront; ALB cert in app region |
| Observability | CloudWatch Logs + alarms | ECS task logs, ALB 5xx, target health, RDS metrics |
| Networking | VPC (2 AZ) | Public subnets (ALB/NAT), private subnets (ECS/RDS) |

> **CloudFront reuse vs. new.** The existing distribution `EZI5H8FKNE9R1` and the
> `flush-cloudfront-cache` workflow can be retained as-is — we only change its **origins**
> (Vercel → ALB + S3) and origin request policy. To keep this Terraform-managed cleanly we
> will `terraform import` the existing distribution into state rather than recreating it (a
> recreate would change the distribution domain and break Route 53 + cached invalidation
> history). See [§11](#11-cut-over-runbook).

> **Direct-to-origin path.** The `maxDuration = 300` tariff-generation routes
> ([§5.11](#5-application--code-changes)) cannot pass through CloudFront (60s origin cap).
> They reach the ALB directly via `origin.koalagains.com`, which the Terraform already
> provisions. The ALB `idle_timeout` is raised to 300s for them.

---

## 3. Compute model: ECS Fargate vs. Lightsail vs. OpenNext/Amplify

Four AWS targets were considered. Both container options (Fargate, Lightsail) suit the app;
**the right pick hinges on one decision: single node vs. horizontally-scaled.**

| Option | Pros | Cons | Verdict |
|---|---|---|---|
| **Lightsail Containers** (recommended for **single-node**) | Cheapest; bundles load balancer + managed TLS + custom domain; **far less Terraform** (no VPC/NAT/ALB/target-groups); matches an existing repo pattern (`ai-agents/crowd-fund-analysis/terraform`); single node ⇒ **no shared cache handler needed** ([§3a](#3a-the-single-node-simplification)) | No autoscaling (fixed `power`×`scale`); no managed Redis; **bundled LB request timeout may not allow the 300s routes** ([§5.11](#5-application--code-changes)); scale>1 reintroduces the cache-coherence problem with no managed Redis to solve it | **Recommended if origin load fits one node + the 300s timeout is resolved** |
| **ECS Fargate container** | Runs the exact `next start` server we build in CI; native Puppeteer; autoscaling + Multi-AZ HA; full VPC control (private RDS/ElastiCache); raisable ALB timeout for the 300s routes | Most infrastructure to own (VPC, NAT, ALB, ElastiCache for multi-task); higher fixed cost (~$120–200/mo) | **Recommended when HA / autoscaling / >1 node is required** |
| **OpenNext + AWS (Lambda/CloudFront)** | Closest to Vercel's serverless/ISR model; cheapest at very low traffic | Puppeteer in Lambda needs `@sparticuz/chromium` rework; 15-min Lambda cap awkward for 300s+ jobs; OpenNext adapter is another moving part; less Terraform-native | Alternative if we later drop containers |
| **AWS Amplify Hosting** | Managed Next.js SSR, least ops | Weak Terraform story; limited CloudFront-behavior control; Puppeteer unsupported | Rejected |

### 3a. The single-node simplification

Most of this plan's moving parts (ElastiCache, the shared `cacheHandler`, a multi-task ALB)
exist **only because of running 2+ instances**. They are the cost of horizontal scale, not of
the app. Two facts make a **single larger node** realistic for KoalaGains:

1. **Origin load is low by design.** Per `cloudfront-deploy-skew.md`, CloudFront absorbs the
   hot `/stocks/*`, `/etfs/*`, and tariff traffic at the edge; the origin mostly serves
   cache-misses + API calls. That is the load a single node must carry — not raw user traffic.
2. **One process ⇒ one cache.** With a single instance, `unstable_cache`/`revalidateTag`
   ([§5.10](#5-application--code-changes)) are coherent again with **zero extra infrastructure**
   — no Redis, no custom cache handler.

So a single Lightsail `medium` (1 vCPU / 4 GB — headroom for Puppeteer) **behind the existing
CloudFront** is the cheapest, lowest-Terraform path and collapses §5.10 entirely. Indicative
cost: Lightsail `medium` $40 (LB+TLS included) + managed/existing Postgres ≈ **$55–70/mo
all-in**, vs. ~$120–200 for the Fargate design.

**Before choosing Lightsail, resolve two things:**

- **The 300s tariff-generation routes** ([§5.11](#5-application--code-changes)). Lightsail's
  bundled LB request timeout is not freely tunable — **verify a 5-minute request survives**, or
  move those admin generators to an async job pattern (the better fix on any platform). This is
  the single biggest reason to prefer Fargate (raisable ALB `idle_timeout`).
- **HA expectations.** `scale=1` has no horizontal redundancy and a brief deploy-swap window
  (Lightsail does health-checked rolling deploys, so it's modest). If you need true HA or
  autoscaling later, move to Fargate — going to Lightsail `scale>1` reopens cache coherence
  with no managed Redis to lean on.

**Recommendation.** Default to **Lightsail single-node** for the initial migration (cheaper,
simpler, repo-consistent) once the 300s-route question is answered; keep the **Fargate** tree
in `deploy/aws/terraform/` as the documented scale-up path. The decision is tracked in
[§15 open questions](#15-open-questions).

> The Terraform skeleton in `deploy/aws/terraform/` currently targets the **Fargate** option.
> A Lightsail variant is far smaller — a `aws_lightsail_container_service` +
> `aws_lightsail_container_service_deployment_version` (env from Secrets Manager) + a managed
> DB, modeled on `ai-agents/crowd-fund-analysis/terraform/main.tf`. It can be added under
> `deploy/aws/terraform-lightsail/` once the compute model is confirmed.

---

## 4. Terraform layout

New directory: **`insights-ui/deploy/aws/`**

```
insights-ui/deploy/aws/
├── Dockerfile                  # multi-stage build of the Next.js standalone server
├── .dockerignore
├── README.md                   # how to build/push/apply locally
└── terraform/
    ├── versions.tf             # required_providers (aws 5.x), backend (S3 + DynamoDB lock)
    ├── providers.tf            # aws provider (app region) + aws.us_east_1 alias (CloudFront/ACM)
    ├── variables.tf            # all inputs (region, domain, image_tag, sizing, secrets ARNs)
    ├── terraform.tfvars.example
    ├── network.tf              # VPC, subnets, NAT, IGW, route tables (or terraform-aws-modules/vpc)
    ├── ecr.tf                  # ECR repository + lifecycle policy
    ├── secrets.tf              # Secrets Manager secret(s) + versions (values injected out-of-band)
    ├── rds.tf                  # RDS Postgres (or Aurora Serverless v2), subnet group, SG, params
    ├── elasticache.tf          # Redis/Valkey for the shared Next.js cacheHandler (§5.10)
    ├── alb.tf                  # internal ALB (idle_timeout 300 for maxDuration routes), TG, listener, SGs
    ├── ecs.tf                  # cluster, task def, service, autoscaling, CloudWatch log group
    ├── iam.tf                  # task execution role, task role, scheduler role, invoker Lambda role
    ├── s3_assets.tf            # S3 bucket for static/public assets + bucket policy (OAC)
    ├── cloudfront.tf           # distribution (import existing), origins (ALB + S3), behaviors, OAC
    ├── scheduler.tf            # EventBridge Scheduler rules + invoker Lambda (cron replacement)
    ├── route53.tf              # A/AAAA alias records to CloudFront
    ├── acm.tf                  # ACM certs (us-east-1 for CF, app-region for ALB)
    ├── monitoring.tf           # CloudWatch alarms (ALB 5xx, unhealthy hosts, RDS, ECS CPU/mem)
    └── outputs.tf              # cloudfront domain, alb dns, ecr url, rds endpoint
```

**State backend.** Remote state in S3 with a DynamoDB lock table (a one-time bootstrap, kept
in a tiny separate `terraform/bootstrap/` or created manually). Never commit `.tfstate` or
`*.tfvars` containing secrets — only `terraform.tfvars.example`.

**Module strategy.** Start with flat resource files (above) for reviewability; optionally
fold `network`/`ecs`/`rds` into community modules (`terraform-aws-modules/vpc`,
`.../rds`, `.../ecs`) once the shape is settled. The repo already uses raw `aws_*` resources
(see `ai-agents/crowd-fund-analysis/terraform/main.tf`), so we match that style first.

A runnable skeleton of these files lands alongside this plan under
`insights-ui/deploy/aws/` so reviewers can see the concrete resource shapes; values are
placeholders and the skeleton is **not** `apply`-ready until §15 open questions are resolved.

---

## 5. Application & code changes

These are the in-repo changes the migration requires (most are additive and Vercel-safe, so
they can merge before cut-over):

1. **`next.config.ts` — enable standalone output.**
   ```ts
   const nextConfig: NextConfig = {
     output: 'standalone',            // emit .next/standalone for a slim container
     // ...existing config unchanged...
   };
   ```
   `output: 'standalone'` is inert on Vercel, so it is safe to merge early.

2. **Port `vercel.json` behavior into the app / CloudFront.** `vercel.json` is ignored off
   Vercel. Re-home each piece:
   - **CORS headers** (`/api/*`) → add to `next.config.ts` `async headers()` (works on any
     host) so they survive the move.
   - **`noindex` headers** (`/_next/static/*`, `/public-equities*`) → `next.config.ts`
     `headers()` as well.
   - **Crons** → EventBridge Scheduler (see [§7](#7-replacing-vercel-crons)); delete from
     `vercel.json` only at cut-over.

3. **Health check endpoint.** Add `GET /api/health` returning `200` (DB ping optional) for
   the ALB target group. Reuse any existing health route if present before creating one.

4. **Puppeteer in-container.** Ensure the Dockerfile installs a Chromium that
   `getContentsUsingPuppeteer.ts` can launch (system Chromium + `executablePath`, or
   `puppeteer` full download). Set `PUPPETEER_EXECUTABLE_PATH` / launch `--no-sandbox` in the
   container. Validate scraping in staging.

5. **`@vercel/functions` `waitUntil` → `after()`.** The **only** `@vercel/functions` use is
   `waitUntil()` in `src/utils/cloudfront-cache-utils.ts` (the fire-and-forget CloudFront
   invalidation in `invalidateCloudFrontPaths()`). It already falls back to an orphaned
   promise off-Vercel, but the robust replacement is Next.js 15's `import { after } from
   'next/server'`. Swap it and drop the `@vercel/functions` dependency. **This is the live
   save-flow cache-invalidation path — verify it still fires after the swap.**

6. **Env vars that gate auth & base-URL (DO NOT rename — set them).** Two couplings, both
   confirmed in code:
   - `getBaseUrl()` (shared `@dodao/web-core`, used by other apps too) derives the absolute
     URL purely from **`NEXT_PUBLIC_VERCEL_URL`** + **`NEXT_PUBLIC_VERCEL_ENV`**. Renaming
     would mean editing shared web-core. **Simplest correct path: keep the names and set
     `NEXT_PUBLIC_VERCEL_URL=koalagains.com`, `NEXT_PUBLIC_VERCEL_ENV=production` as Docker
     build args** (they're `NEXT_PUBLIC_*`, so build-time, not runtime).
   - **`authOptions.ts` reads the non-public `process.env.VERCEL_ENV`** to decide cookie
     `secure: true` and to apply `COOKIE_DOMAIN` (`.koalagains.com`). On AWS this is undefined
     → **cookies become non-secure with no domain and auth/SSO breaks.** Set **`VERCEL_ENV=production`
     as a runtime task env var** (or refactor `authOptions.ts` to a host-neutral flag). This is
     an auth-blocking item — do not skip it.

7. **Skew protection replacement.** Vercel Skew Protection goes away. Implement the
   static-asset retention strategy in [§9](#9-deploy-skew-on-aws) and set a stable
   `deploymentId`/`assetPrefix` per build.

8. **Image optimization.** Next.js image optimization runs in-container (fine), but it is CPU
   heavy. Keep the existing `remotePatterns`; consider a CloudFront cache behavior for
   `/_next/image*`. No code change required initially.

9. **Connection pooling.** Containers hold persistent Prisma connections; ensure
   `connection_limit` in `DATABASE_URL` is sized for `tasks × connection_limit < RDS
   max_connections`. (Today it's `connection_limit=5` per the example.) Consider RDS Proxy if
   task count grows.

10. **Shared Next.js cache handler (multi-instance coherence) — REQUIRED.** The codebase
    uses **`unstable_cache` in 10 places** (home-page industries/posts, `/tariff-reports`
    listing, HTS chapter refs) and **`revalidateTag` in 62 places**. On Vercel the Data Cache
    is a single shared store, so `revalidateTag()` invalidates it globally. **Self-hosted
    Next.js defaults to a per-instance filesystem cache** — with `desired_count ≥ 2` Fargate
    tasks, a `revalidateTag()` executed on task A does **not** invalidate task B, so B keeps
    serving stale `unstable_cache` data until its own TTL. Options:
    - **(a) Shared cache handler backed by Redis/ElastiCache** (`cacheHandler` in
      `next.config.ts`, e.g. `@neshca/cache-handler` or Next 15's native Redis handler). Correct
      production answer; adds an ElastiCache node (see [§2](#2-target-architecture)).
    - **(b)** Drop `unstable_cache` for these reads and rely solely on CloudFront + explicit
      `invalidateCloudFrontPaths()` (which already runs alongside `revalidateTag`).
    - **(c)** Run a single task — rejected (no HA, no autoscaling).
    Pages themselves are `force-dynamic` (64 occurrences) so there are **no ISR HTML writes**
    to coordinate — this is purely about the Data Cache behind `unstable_cache`. Pick (a) or
    (b) before going multi-task. **This was the biggest gap in the first draft of this plan.**

11. **Long-running routes (`maxDuration = 300`) vs. edge/LB timeouts — REQUIRED.** ~10 tariff
    report-generation routes under `/api/industry-tariff-reports/chapters/[chapterSlug]/*`
    export `maxDuration = 300` (5-minute synchronous LLM generation). On AWS:
    - **ALB idle timeout defaults to 60s** → must be raised (`idle_timeout = 300+`; AWS allows
      up to 4000s).
    - **CloudFront origin response timeout caps at 60s** (extendable to 180s via a quota
      request, still < 300s). So these routes **cannot be served through CloudFront** for a
      full 5-minute response — they must reach the **ALB origin directly** (e.g. the
      `origin.koalagains.com` hostname the Terraform already provisions, or an `admin.`/`api.`
      host that bypasses the CDN).
    - **Better long-term:** convert these admin-triggered generators to an async job pattern
      (enqueue → 202 → poll/webhook) so no HTTP request is held open for minutes. Minimal
      cut-over path = direct-to-ALB + raised idle timeout; flag the async refactor as
      follow-up.

12. **Runtime filesystem is ephemeral (not a runtime issue here).** `reports-out/` and other
    `writeFileSync` paths live only in `src/scripts/*` (CLI/local tooling), not in request
    handlers — so the ephemeral container FS is fine. Confirmed: no API route writes to local
    disk expecting persistence. (Anything that did would need S3 instead.)

13. **Node version alignment.** `package.json` `engines` says `>=22`, the README says
    `>=23.11.0`, the Dockerfile pins `node:22`. Pick one (22 LTS is fine for Next 15) and make
    the three consistent to avoid build/runtime drift.

14. **Sitemaps / robots are dynamic route handlers.** `src/app/**/sitemap.xml` (stocks, blogs,
    tariff, scenarios, etc.) and `robots.ts` query the DB at request time. They work unchanged
    in-container, but the `stocks` sitemap can be large/slow — add a CloudFront cache behavior
    for `*/sitemap.xml` (and `/robots.txt`) so crawlers don't hammer the origin.

---

## 6. Secrets & environment variables

All runtime config moves from Vercel project env vars to **AWS Secrets Manager**, injected
into the ECS task definition via the `secrets` block (never baked into the image).

| Category | Vars | Handling |
|---|---|---|
| Database | `DATABASE_URL` | Secrets Manager; point at RDS endpoint |
| Auth | `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `DODAO_AUTH_SECRET`, `EMAIL_TOKEN_SECRET`, `COOKIE_DOMAIN=.koalagains.com` | Secrets Manager; `NEXTAUTH_URL=https://koalagains.com` |
| OAuth | `GOOGLE_*`, `DISCORD_*`, `TWITTER_*` | Secrets Manager; update OAuth redirect URLs if host/path changes (should stay `koalagains.com`) |
| AI providers | `OPENAI_API_KEY`, `GOOGLE_API_KEY`, `GEMINI_MODEL`, `LLM_PROVIDER` | Secrets Manager |
| AWS access | `AWS_REGION`, `KOALA_AWS_*`, `PPT_GENERATION_AWS_*` | Prefer the **ECS task IAM role** over static keys for S3/CloudFront/Lambda; keep keys only where a separate account/identity is genuinely required |
| Lambdas | `STOCK_ANALYZER_LAMBDA_URL`, `ETF_ANALYZER_LAMBDA_URL`, `ETF_MORN_LAMBDA_URL`, `REMOTION_LAMBDA_URL`, `FFMPEG_LAMBDA_NAME`, `SCREENER_API_URL` | Secrets Manager / plain env |
| **Vercel-named host vars** | `VERCEL_ENV`, `NEXT_PUBLIC_VERCEL_URL`, `NEXT_PUBLIC_VERCEL_ENV` | **Keep the names, set the values** ([§5.6](#5-application--code-changes)). `VERCEL_ENV=production` is a **runtime task env** (gates auth-cookie `secure`+domain in `authOptions.ts`). `NEXT_PUBLIC_VERCEL_URL=koalagains.com` + `NEXT_PUBLIC_VERCEL_ENV=production` are **build args** (consumed by shared `getBaseUrl()`). |
| Cache | `REDIS_URL` (new) | ElastiCache endpoint for the shared `cacheHandler` ([§5.10](#5-application--code-changes)); Secrets Manager / plain env |
| Misc | `POLYGON_API_KEY`, `AUTOMATION_SECRET`, `NEXT_PUBLIC_*` | `NEXT_PUBLIC_*` are build-time (baked at `next build`); set them in CI build args, not the task |

**Key win:** replace static `AWS_ACCESS_KEY_ID/SECRET` for the app's own S3/CloudFront/Lambda
access with the **ECS task role** (least-privilege IAM policy), eliminating long-lived keys.
The `flush-cloudfront-cache` workflow can keep using `KOALA_AWS_*` or move to OIDC.

`NEXT_PUBLIC_*` values are inlined at build time — they must be passed as Docker build args in
CI, not as task secrets.

---

## 7. Replacing Vercel crons

`vercel.json` defines 4 crons. Replace each with an **EventBridge Scheduler** rule that
triggers a tiny **invoker Lambda**, which does an authenticated HTTPS `POST` to the same app
endpoint (`Authorization: <AUTOMATION_SECRET>`). Using a Lambda (vs. EventBridge API
Destinations directly) gives retries, logging, and a place to attach the secret header.

| Schedule (cron) | Path | EventBridge `schedule_expression` |
|---|---|---|
| `*/3 * * * *` | `/api/koala_gains/tickers-v1/generate-ticker-v1-request` | `rate(3 minutes)` |
| `0 23 * * 1-5` | `/api/koala_gains/tickers-v1/generate-daily-top-gainers` | `cron(0 23 ? * MON-FRI *)` |
| `0 23 * * 1-5` | `/api/koala_gains/tickers-v1/generate-daily-top-losers` | `cron(0 23 ? * MON-FRI *)` |
| `*/3 * * * *` | `/api/koala_gains/etfs-v1/generate-etf-v1-request` | `rate(3 minutes)` |

Notes:
- Each cron endpoint **must validate `AUTOMATION_SECRET`** before doing work (verify it does
  today; Vercel crons are otherwise open). This becomes the auth boundary on AWS.
- Point the Lambda at the **internal app URL** (CloudFront or directly the ALB via a private
  path) so cron traffic doesn't pay the public edge round-trip; simplest is the public
  `https://koalagains.com` host with the secret header.
- EventBridge Scheduler timezone defaults to UTC — the current Vercel `0 23` is UTC, so keep
  UTC to preserve timing.

---

## 8. CI/CD changes

New workflow: **`.github/workflows/insights-ui-deploy-aws.yml`** (replaces the Vercel deploy
workflow `koalagains-deploy-full-ssg.yml` at cut-over). Pipeline:

1. **Auth to AWS** via GitHub OIDC (preferred) or `KOALA_AWS_*` secrets.
2. **Build & push image** to ECR, tagged with the git SHA (build context = repo root because
   of the `@dodao/web-core` workspace dependency — see Dockerfile notes).
3. **Upload static assets** (`.next/static`, `public/`) to the S3 assets bucket under a
   build-id prefix (retain old builds for skew safety — see [§9](#9-deploy-skew-on-aws)).
4. **`terraform apply`** with `-var image_tag=<sha>` (or update the ECS service to the new
   task def revision) → triggers a rolling Fargate deploy.
5. **Wait for service stability** (`aws ecs wait services-stable`) and hit `/api/health`.
6. **Targeted CloudFront invalidation** only if needed (the existing
   `flush-cloudfront-cache.yml` workflow and `invalidateCloudFrontPaths()` helper are kept).

The lint/typecheck/build gates in `main.yml` (`insights_ui_job`) are unchanged — they already
run `pnpm lint`, `pnpm prettier-check`, `pnpm compile`, `pnpm build`. We add a Docker build
validation step there if desired.

The existing `koalagains-deploy-full-ssg.yml` (Vercel FULL_SSG) is deleted at cut-over.

---

## 9. Deploy-skew on AWS

This is the **highest-risk** part of the move. Today, Vercel Skew Protection + CloudFront keep
old JS chunks reachable for 7 days so CloudFront-cached HTML (referencing build N's hashed
chunks) keeps working after a deploy to build N+1. We must reproduce that on AWS:

**Strategy — static assets in S3, retained across deploys:**

1. Configure `assetPrefix`/serve `/_next/static/*` and `/public/*` from the **S3 assets
   bucket** via a CloudFront behavior, *not* from the container.
2. On each deploy, CI uploads the new build's `.next/static` to S3 **without deleting old
   builds** (hashed filenames never collide). Old chunks remain fetchable → CloudFront-cached
   HTML from build N keeps resolving its chunks after build N+1 ships.
3. A lifecycle policy expires asset objects after N days (e.g. 14) — longer than the CloudFront
   HTML TTL (6 days) — so we keep at least one TTL window of back-compat, matching today's
   7-day skew window.
4. Set a stable per-build `deploymentId` so the RSC client-cache invalidates correctly on
   navigation (mirrors Next's deployment-id mechanism).
5. ECS rolling deploy keeps old tasks serving until new tasks are healthy, so SSR HTML and its
   assets stay consistent during the swap.

The cacheable-prefix behaviors (`/stocks/*`, `/etfs/*`, `/industry-tariff-report/*`,
`/tariff-reports*`) and their 6-day TTL stay exactly as documented in
`cloudfront-deploy-skew.md` — only the origin behind them changes.

---

## 10. Database migration

If the Postgres DB is currently hosted off-AWS (e.g. a managed provider), migrate to **RDS**:

1. Provision RDS Postgres (matching major version) in private subnets via Terraform.
2. Run `prisma migrate deploy` (or `prisma db push`) against the new instance to create
   schema, OR restore from a `pg_dump` of production.
3. **Dump → restore** during a maintenance window: `pg_dump` source → `pg_restore` into RDS;
   verify row counts on the largest tables (tickers, reports, prompt_versions).
4. Repoint `DATABASE_URL` (Secrets Manager) at the RDS endpoint with
   `sslmode=verify-full` and a sane `connection_limit`.
5. If the DB already lives in this AWS account, only network/SG wiring changes — no data move.

Keep the old DB read-only as a fallback until the AWS deployment is verified.

---

## 11. Cut-over runbook

Order of operations for a low-risk switch (DNS stays on CloudFront the whole time; only the
CloudFront origin changes, so the public hostname never moves):

1. **Pre-reqs merged:** §5 code changes (standalone output, headers, health endpoint,
   Puppeteer) shipped and live on Vercel (all are Vercel-safe).
2. **Provision AWS (staging origin):** `terraform apply` everything *except* repointing the
   production CloudFront. Bring up VPC, RDS, ECR, ECS, ALB, S3, secrets, scheduler (crons
   **disabled** initially).
3. **Build & deploy image**, run DB migration ([§10](#10-database-migration)), seed/verify.
4. **Smoke test via the ALB / a temporary CloudFront** (or a `staging.koalagains.com` record):
   auth flows, `/stocks/*`, `/etfs/*`, tariff pages, Puppeteer scrape, an AI report job, S3
   upload, CloudFront invalidation helper.
5. **Import the production CloudFront distribution** into Terraform state
   (`terraform import aws_cloudfront_distribution.main EZI5H8FKNE9R1`) and reconcile config so
   `plan` is clean.
6. **Swap origins:** point the production CloudFront default behavior at the ALB and the
   static behavior at S3. Apply. CloudFront keeps serving cached pages throughout; new
   misses hit AWS.
7. **Enable EventBridge crons**; disable Vercel crons (remove from `vercel.json`).
8. **Monitor** ALB 5xx, ECS health, RDS connections, CloudWatch logs for ~24–48h.
9. **Decommission Vercel** once stable: delete the Vercel project/cron, remove
   `koalagains-deploy-full-ssg.yml`, drop `@vercel/*` deps.

---

## 12. Rollback plan

- **Fast rollback (origin):** repoint the CloudFront default behavior back to the Vercel
  origin (Vercel project kept warm until decommission in step 9). Single Terraform apply or
  console change; propagation is minutes.
- **App rollback:** redeploy the previous ECR image tag / previous ECS task def revision
  (`aws ecs update-service --task-definition <prev>`).
- **DB rollback:** the old database is kept read-only/available until sign-off; repoint
  `DATABASE_URL` back if needed.
- Keep the Vercel deployment alive for **at least one CloudFront TTL window (6–7 days)** after
  cut-over before decommissioning.

---

## 13. Cost considerations

Rough monthly shape (us-east-1, illustrative — model with the AWS pricing calculator before
committing):

| Item | Driver | Note |
|---|---|---|
| ECS Fargate | vCPU-hrs × tasks | 2× (0.5 vCPU / 1 GB) baseline ≈ low tens of $/mo; scales with traffic |
| ALB | hours + LCUs | ~$16/mo + LCU |
| RDS Postgres | instance class + storage | `db.t4g.micro/small` Multi-AZ; biggest knob |
| NAT Gateway | hours + GB | ~$32/mo/AZ — consider 1 NAT or VPC endpoints to cut cost |
| CloudFront | unchanged | already in use; no new cost |
| ElastiCache | node-hrs | `cache.t4g.micro` for the shared cache handler (skip if option (b) chosen) |
| S3 assets | tiny | static chunks only |
| Lambda + EventBridge | negligible | cron invokers |
| Secrets Manager | $0.40/secret/mo | a handful |

**Cost levers:** single NAT gateway (or VPC endpoints for S3/ECR/Secrets to avoid NAT),
Fargate Spot for non-critical capacity, Aurora Serverless v2 min-ACU scaling, right-size
tasks. The migration's main motivation (per `cloudfront-deploy-skew.md`) was Vercel ISR/function
cost — Fargate gives predictable flat compute cost instead of per-invocation billing.

---

## 14. Phased delivery checklist

- [ ] **Phase 0 — App prep (Vercel-safe, mergeable now):** `output: 'standalone'`, move
      `vercel.json` headers into `next.config.ts`, add `/api/health`, swap `waitUntil`→`after()`
      ([§5.5](#5-application--code-changes)), wire the shared `cacheHandler`
      ([§5.10](#5-application--code-changes)), confirm `VERCEL_ENV` cookie handling
      ([§5.6](#5-application--code-changes)), align Node version, Dockerfile + local container run.
- [ ] **Phase 1 — Terraform foundation:** state backend, VPC, ECR, Secrets Manager, RDS,
      **ElastiCache**, IAM roles.
- [ ] **Phase 2 — Compute:** ALB, ECS cluster/service/task def, autoscaling, CloudWatch,
      S3 assets bucket, first image deploy to staging.
- [ ] **Phase 3 — Edge:** import CloudFront, add S3 + ALB origins/behaviors, OAC, ACM,
      Route 53 (staging host first).
- [ ] **Phase 4 — Crons & CI:** EventBridge Scheduler + invoker Lambda, GitHub Actions
      build/push/apply workflow.
- [ ] **Phase 5 — DB migration & staging validation:** dump/restore, full smoke test.
- [ ] **Phase 6 — Cut-over:** swap production CloudFront origin, enable AWS crons, disable
      Vercel crons, monitor.
- [ ] **Phase 7 — Decommission Vercel:** delete project, remove Vercel workflow & deps.

---

## 15. Open questions

These need product/platform answers before the Terraform skeleton becomes `apply`-ready:

1. **Compute model final call:** **Lightsail single-node** ([§3a](#3a-the-single-node-simplification),
   cheapest/simplest) vs. **ECS Fargate** (HA/autoscaling, current skeleton) vs. OpenNext
   serverless? Gated by the 300s-route timeout (Q9) and HA needs. Affects the entire Terraform
   tree and whether ElastiCache (Q8) is needed at all.
2. **AWS account & region:** which account/region hosts this? (CloudFront/ACM certs must be in
   `us-east-1`.) Is there an existing networking/landing-zone to slot into?
3. **Database:** is Postgres already on AWS, or do we migrate ([§10](#10-database-migration))?
   RDS vs. Aurora Serverless v2? Multi-AZ?
4. **CloudFront:** confirm we **import & reuse** `EZI5H8FKNE9R1` (recommended) vs. stand up a
   new distribution + DNS swap.
5. **Auth provider for CI:** GitHub OIDC role (recommended) vs. continue with `KOALA_AWS_*`
   long-lived keys?
6. **Static-asset/skew strategy:** confirm the S3-retained-assets approach in
   [§9](#9-deploy-skew-on-aws) vs. accepting a brief skew window on deploy.
7. **NAT vs. VPC endpoints** for egress cost.
8. **Multi-instance cache** ([§5.10](#5-application--code-changes)): shared ElastiCache
   `cacheHandler` (option a) vs. dropping `unstable_cache` (option b)? Required before running
   `desired_count ≥ 2`.
9. **Long-running generation routes** ([§5.11](#5-application--code-changes)): minimal
   direct-to-ALB-with-300s-timeout now, or invest in the async-job refactor?

---

*See [`insights-ui/deploy/aws/`](../../insights-ui/deploy/aws/) for the Terraform skeleton and
Dockerfile that accompany this plan.*
