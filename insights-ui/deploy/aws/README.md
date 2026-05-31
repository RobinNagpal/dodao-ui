# insights-ui — AWS deployment (Terraform)

Terraform-managed AWS deployment for `insights-ui` (KoalaGains), as an alternative to Vercel.

> **Read the plan first:** [`docs/insights-ui/aws-migration-plan.md`](../../../docs/insights-ui/aws-migration-plan.md).
> These directories are the **skeletons** referenced by that plan. Values are placeholders and
> the stacks are **not** `apply`-ready until the plan's open questions are resolved.

## Two options

| Dir | Compute | When |
|---|---|---|
| **`terraform-lightsail/`** (primary) | **Lightsail Container Service, single node** | Default for the migration — cheapest, simplest, repo-consistent. See plan §2–§3. |
| `terraform/` | ECS Fargate + ALB + ElastiCache + VPC | Scale-up path when HA / autoscaling / >1 node is required. See plan Appendix A. |

Both share the same `Dockerfile` (standalone Next.js + Chromium; build context = **repo root**
because of the `@dodao/web-core` pnpm workspace dependency).

## Architecture (Lightsail)

CloudFront (reuse existing) → Lightsail container service (`next start`) → Postgres.
Static assets optionally offloaded to S3 (deploy-skew safety). Vercel crons replaced by
EventBridge Scheduler + an invoker Lambda. See the plan for the full diagram and rationale.

## Local build & push (manual)

```bash
# from the monorepo root (build context must be the repo root)
docker build -f insights-ui/deploy/aws/Dockerfile \
  --build-arg NEXT_PUBLIC_VERCEL_URL=koalagains.com \
  --build-arg NEXT_PUBLIC_VERCEL_ENV=production \
  -t insights-ui:dev .

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$ECR_REGISTRY"
docker tag insights-ui:dev "$ECR_REGISTRY/insights-ui:$(git rev-parse --short HEAD)"
docker push "$ECR_REGISTRY/insights-ui:$(git rev-parse --short HEAD)"
```

## Terraform usage (Lightsail)

```bash
cd insights-ui/deploy/aws/terraform-lightsail
cp terraform.tfvars.example terraform.tfvars   # fill in non-secret values (DO NOT COMMIT)
terraform init
# Secret values (app_secrets) should be sourced from Secrets Manager and passed as -var, e.g.:
terraform apply \
  -var "image_tag=$(git rev-parse --short HEAD)" \
  -var "app_secrets=$(aws secretsmanager get-secret-value --secret-id insights-ui/app-env --query SecretString --output text)"
```

**Never commit** `terraform.tfvars`, `*.tfstate`, or any file with secret values. Lightsail has
no native Secrets Manager mount, so CI reads the secret and injects it into the deployment's
`environment` at apply time.
