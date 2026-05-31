# insights-ui — AWS deployment (Lightsail + Terraform)

Terraform-managed AWS deployment for `insights-ui` (KoalaGains). Replaces Vercel via a phased,
parallel roll-out. Full rationale: [`docs/insights-ui/aws-migration-plan.md`](../../docs/insights-ui/aws-migration-plan.md).

## Rollout phases

| Phase | What runs | Gates |
|---|---|---|
| **A — now (parallel)** | AWS app reachable directly at **`prod.koalagains.com`** (no CloudFront). Vercel keeps serving `koalagains.com`. Crons stay on Vercel. | `manage_cloudfront=false`, `enable_crons=false` |
| **B — CloudFront** | Point CloudFront at the Lightsail service once Phase A is verified. | `manage_cloudfront=true` |
| **C — cut-over** | Move crons to EventBridge, decommission Vercel. | `enable_crons=true` |

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

## Deploy (what CI does)

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

# 4. full apply (creates the Lightsail deployment version), secrets from Secrets Manager
terraform apply \
  -var "image_tag=$(git rev-parse --short HEAD)" \
  -var "app_secrets=$(aws secretsmanager get-secret-value --secret-id insights-ui/app-env --query SecretString --output text)"
```

**Never commit** `terraform.tfvars`, `*.tfstate`, or secret values.

## Notes

- The Lightsail cert for `prod.koalagains.com` must reach **ISSUED** (DNS validation) before it
  attaches to the service — if the first apply errors on that, re-run after the validation
  records propagate (~minutes).
- During coexistence keep `enable_crons=false` so the 3-minute generators don't double-run
  against the shared RDS (Vercel still owns them).
- Add `prod.koalagains.com` to the Google/Discord/Twitter OAuth redirect URIs so auth works on
  the direct host.
