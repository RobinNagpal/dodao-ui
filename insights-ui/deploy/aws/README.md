# insights-ui — AWS deployment (Terraform)

Terraform-managed AWS deployment for `insights-ui` (KoalaGains), as an alternative to Vercel.

> **Read the plan first:** [`docs/insights-ui/aws-migration-plan.md`](../../../docs/insights-ui/aws-migration-plan.md).
> This directory is the **skeleton** referenced by that plan. Values are placeholders and the
> stack is **not** `apply`-ready until the open questions in the plan (§15) are resolved.

## What's here

| Path | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build of the Next.js `standalone` server (build context = **repo root**, because of the `@dodao/web-core` pnpm workspace dependency) |
| `.dockerignore` | Keep the image small |
| `terraform/` | The AWS infrastructure (VPC, ECR, RDS, ALB, ECS Fargate, S3, CloudFront, EventBridge crons, IAM) |

## Target architecture (summary)

CloudFront → (S3 for `/_next/static`, ALB for everything else) → ECS Fargate (`next start`)
→ RDS Postgres. Secrets in Secrets Manager. Vercel crons replaced by EventBridge Scheduler +
an invoker Lambda. See the plan for the full diagram and rationale.

## Local build & push (manual)

```bash
# from the monorepo root (build context must be the repo root)
docker build -f insights-ui/deploy/aws/Dockerfile -t insights-ui:dev .

# tag & push to ECR (after `terraform apply` has created the repo)
aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$ECR_REGISTRY"
docker tag insights-ui:dev "$ECR_REGISTRY/insights-ui:$(git rev-parse --short HEAD)"
docker push "$ECR_REGISTRY/insights-ui:$(git rev-parse --short HEAD)"
```

## Terraform usage

```bash
cd insights-ui/deploy/aws/terraform
cp terraform.tfvars.example terraform.tfvars   # fill in real values (DO NOT COMMIT)
terraform init                                  # configures the S3 remote backend
terraform plan  -var "image_tag=$(git rev-parse --short HEAD)"
terraform apply -var "image_tag=$(git rev-parse --short HEAD)"
```

**Never commit** `terraform.tfvars`, `*.tfstate`, or any file containing secrets. Secret
*values* are written to Secrets Manager out-of-band (CI or console); Terraform only manages
the secret containers and wiring.
