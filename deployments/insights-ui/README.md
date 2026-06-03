# insights-ui — AWS deployment (Lightsail + Terraform)

Terraform-managed AWS deployment for `insights-ui` (KoalaGains). Replaces Vercel via a phased,
parallel roll-out. Full rationale: [`docs/insights-ui/aws-migration-plan.md`](../../docs/insights-ui/aws-migration-plan.md).

## Rollout phases

| Phase | What runs | Gates |
|---|---|---|
| **A — now (parallel)** | AWS app reachable directly at **`prod.koalagains.com`** (no CloudFront). Vercel keeps serving `koalagains.com`. **Crons run from AWS** (EventBridge) and are removed from `vercel.json` in this PR. | `manage_cloudfront=false`, `enable_crons=true` |
| **B — CloudFront** | Point CloudFront at the Lightsail service once Phase A is verified. | `manage_cloudfront=true` |
| **C — cut-over** | Decommission Vercel. | — |

## Architecture (Phase A)

```
prod.koalagains.com ──(Route53 CNAME)──► Lightsail Container Service (next start + Chromium)
                                                 │
browser ──(assetPrefix)──► S3 (/_next/static)    └──► existing RDS Postgres (public + SSL)
```

- **Static** assets are served from a public **S3** bucket via Next.js `assetPrefix` — no
  CloudFront needed.
- **Database** is the existing **RDS** (public access + SSL); Terraform provisions nothing for it.
- **Secrets** are injected into the Lightsail deployment env from **Secrets Manager** by CI.

## Files

`*.tf` — versions/providers/variables, `container.tf` (ECR + Lightsail service + deployment),
`domains.tf` (prod.koalagains.com cert + DNS), `s3_static.tf` (public static bucket),
`cloudfront.tf` (Phase B, gated), `scheduler.tf` (crons, gated), `outputs.tf`. Plus the
`Dockerfile` (build context = repo root).

## Deploy

CI (`.github/workflows/insights-ui-deploy-aws.yml`) **auto-deploys on merge to `main`** when
`insights-ui/**` or `shared/web-core/**` changes (also runnable manually). It runs the steps
below; Vercel keeps deploying via its own flow until cut-over.

### What CI does

```bash
# 1. create ECR repo + S3 bucket first
terraform init
terraform apply -target=aws_ecr_repository.app -target=aws_s3_bucket.assets \
  -var "image_tag=$(git rev-parse --short HEAD)"

# 2. build + push image (assetPrefix points at the S3 bucket)
ASSET_PREFIX="https://insights-ui-static-assets.s3.us-east-1.amazonaws.com"
docker build -f deployments/insights-ui/Dockerfile \
  --build-arg NEXT_PUBLIC_VERCEL_URL=prod.koalagains.com \
  --build-arg NEXT_PUBLIC_VERCEL_ENV=production \
  --build-arg NEXT_PUBLIC_ASSET_PREFIX="$ASSET_PREFIX" \
  -t "$ECR_REGISTRY/insights-ui:$(git rev-parse --short HEAD)" .
docker push "$ECR_REGISTRY/insights-ui:$(git rev-parse --short HEAD)"

# 3. upload static to S3 (no --delete: keep old builds for skew safety)
aws s3 sync ./_assets/static "s3://insights-ui-static-assets/_next/static" \
  --cache-control "public,max-age=31536000,immutable"

# 4. full apply (creates the Lightsail deployment version). Secrets go through a
#    *.auto.tfvars.json file — NOT inline -var (a JSON object can't parse into map(string) via
#    -var, and inline would leak secrets into the process table).
SECRETS_JSON=$(aws secretsmanager get-secret-value --secret-id insights-ui/app-env --query SecretString --output text)
jq -n --argjson s "$SECRETS_JSON" --arg tag "$(git rev-parse --short HEAD)" \
  '{app_secrets: $s, image_tag: $tag}' > secrets.auto.tfvars.json
terraform apply           # auto-loads *.auto.tfvars.json
rm -f secrets.auto.tfvars.json
```

**Never commit** `terraform.tfvars`, `*.tfstate`, or secret values.

## Notes

- The Lightsail cert for `prod.koalagains.com` must reach **ISSUED** (DNS validation) before it
  attaches to the service — if the first apply errors on that, re-run after the validation
  records propagate (~minutes).
- Crons run from AWS (`enable_crons=true`) and are removed from `vercel.json` in this PR, so AWS
  is the single owner — no double-run against the shared RDS. Deploy AWS before/with merging the
  `vercel.json` change so there's no gap (and avoid merging right before the `23:00 UTC` daily
  jobs).
- The AWS app sets `CLOUDFRONT_DISTRIBUTION_ID=EZI5H8FKNE9R1` so cron/save writes invalidate the
  CloudFront that still fronts the live `koalagains.com` (no stale-until-TTL for apex users).
- Schema migrations must be **expand-only** while Vercel + AWS share the RDS.
- Add `prod.koalagains.com` to the Google/Discord/Twitter OAuth redirect URIs so auth works on
  the direct host.
- Remote Terraform state (S3 backend in `versions.tf`) must be bootstrapped once before `init`.
