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

resource "aws_lightsail_container_service" "app" {
  name        = var.name_prefix
  power       = var.service_power
  scale       = var.service_scale
  is_disabled = false

  # Serve the app directly on prod.koalagains.com over HTTPS (no CloudFront in Phase A).
  # NOTE: the certificate must be ISSUED (DNS-validated) before it attaches here. If the first
  # apply errors because the cert is still PENDING_VALIDATION, re-run apply once the validation
  # records (domains.tf) have propagated (~minutes).
  public_domain_names {
    certificate {
      certificate_name = aws_lightsail_certificate.app.name
      domain_names     = [var.direct_domain_name]
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

  depends_on = [aws_route53_record.lightsail_cert_validation]
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
