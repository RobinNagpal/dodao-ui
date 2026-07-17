# ECR repo for the app image. Self-managed so the stack is complete.
# First-run ordering: CI runs `terraform apply -target=aws_ecr_repository.app` (and the S3
# bucket) before the docker build/push, then the full apply creates the deployment version.
resource "aws_ecr_repository" "app" {
  name                 = var.ecr_repository_name
  image_tag_mutability = "IMMUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 20 images"
      selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 20 }
      action       = { type = "expire" }
    }]
  })
}

# BuildKit layer cache for the CI docker build (`--cache-to/--cache-from type=registry`).
# Kept in its OWN repo, deliberately MUTABLE: the cache lives under a single rewritten tag,
# which the app repo's IMMUTABLE policy would reject on the second push. Keeping app images
# immutable matters (a git-SHA tag must always mean the same bits) — so the cache goes here
# instead of relaxing that guarantee. Nothing deploys from this repo; it is CI scratch space.
resource "aws_ecr_repository" "buildcache" {
  name                 = "${var.ecr_repository_name}-buildcache"
  image_tag_mutability = "MUTABLE"

  # Cache blobs are rewritten every build and never deployed — scanning them is pure cost.
  image_scanning_configuration {
    scan_on_push = false
  }
}

# BuildKit replaces the cache tag each run, orphaning the previous blobs. Without this they
# accumulate forever (the cache is GBs per build).
resource "aws_ecr_lifecycle_policy" "buildcache" {
  repository = aws_ecr_repository.buildcache.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Expire untagged cache blobs after 7 days"
      selection    = { tagStatus = "untagged", countType = "sinceImagePushed", countUnit = "days", countNumber = 7 }
      action       = { type = "expire" }
    }]
  })
}

resource "aws_lightsail_container_service" "app" {
  name        = var.name_prefix
  power       = var.service_power
  scale       = var.service_scale
  is_disabled = false

  # Serve the app on the direct host (prod.koalagains.com) AND the apex/www (koalagains.com,
  # www.koalagains.com). Apex+www are needed so CloudFront → Lightsail works: AllViewer forwards
  # the viewer Host, and awselb 404s any vhost not in this list.
  # NOTE: each certificate must be ISSUED (DNS-validated) before it attaches here. If the first
  # apply errors because a cert is still PENDING_VALIDATION, re-run apply once the validation
  # records (domains.tf) have propagated (~minutes).
  public_domain_names {
    certificate {
      certificate_name = aws_lightsail_certificate.app.name
      domain_names     = [var.direct_domain_name]
    }
    certificate {
      certificate_name = aws_lightsail_certificate.app_apex.name
      domain_names     = [var.domain_name, "www.${var.domain_name}"]
    }
  }

  private_registry_access {
    ecr_image_puller_role {
      is_active = true
    }
  }

  tags = {
    Environment = var.environment
  }

  depends_on = [
    aws_route53_record.lightsail_cert_validation,
    aws_route53_record.lightsail_cert_validation_apex,
    aws_route53_record.lightsail_cert_validation_www,
  ]
}

# Allow the service's ECR puller role to read the app repository.
data "aws_iam_policy_document" "ecr_pull" {
  statement {
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [aws_lightsail_container_service.app.private_registry_access[0].ecr_image_puller_role[0].principal_arn]
    }
    actions = ["ecr:BatchGetImage", "ecr:GetDownloadUrlForLayer"]
  }
}

resource "aws_ecr_repository_policy" "pull" {
  repository = aws_ecr_repository.app.name
  policy     = data.aws_iam_policy_document.ecr_pull.json
}

resource "aws_lightsail_container_service_deployment_version" "app" {
  service_name = aws_lightsail_container_service.app.name

  container {
    container_name = "app"
    image          = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"
    # DATABASE_URL (existing public RDS, sslmode=require) is supplied via app_secrets.
    environment = merge(var.app_env, var.app_secrets)
    ports = {
      "3000" = "HTTP"
    }
  }

  public_endpoint {
    container_name = "app"
    container_port = 3000

    health_check {
      healthy_threshold   = 2
      unhealthy_threshold = 3
      timeout_seconds     = 5
      interval_seconds    = 15
      path                = "/api/health"
      success_codes       = "200-299"
    }
  }

  # The puller role's ECR access (aws_ecr_repository_policy.pull) is only graph-linked through the
  # service, not this resource — without an explicit dep Terraform can create this deployment (and
  # have Lightsail try to pull the image) before the grant exists → "access denied" image pull.
  depends_on = [aws_ecr_repository_policy.pull]
}
