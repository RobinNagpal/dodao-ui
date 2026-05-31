# Lightsail container service: the single-node compute for insights-ui.
# Modeled on ai-agents/crowd-fund-analysis/terraform/main.tf.

data "aws_ecr_repository" "app" {
  name = var.ecr_repository_name
}

resource "aws_lightsail_container_service" "app" {
  name        = var.name_prefix
  power       = var.service_power
  scale       = var.service_scale
  is_disabled = false

  # Lets the service pull from a private ECR repository.
  private_registry_access {
    ecr_image_puller_role {
      is_active = true
    }
  }

  tags = {
    Environment = var.environment
  }
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
  repository = data.aws_ecr_repository.app.name
  policy     = data.aws_iam_policy_document.ecr_pull.json
}

locals {
  # Merge non-secret + secret env, plus the managed-DB URL when Terraform creates the DB.
  db_env = var.create_managed_db ? {
    DATABASE_URL = "postgresql://${aws_lightsail_database.app[0].master_username}:${random_password.db[0].result}@${aws_lightsail_database.app[0].master_endpoint_address}:${aws_lightsail_database.app[0].master_endpoint_port}/${aws_lightsail_database.app[0].master_database_name}?sslmode=require&connection_limit=5"
  } : {}

  container_env = merge(var.app_env, var.app_secrets, local.db_env)
}

resource "aws_lightsail_container_service_deployment_version" "app" {
  service_name = aws_lightsail_container_service.app.name

  container {
    container_name = "app"
    image          = "${data.aws_ecr_repository.app.repository_url}:${var.image_tag}"
    environment    = local.container_env
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
}
