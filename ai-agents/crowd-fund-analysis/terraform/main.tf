terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.54.1"
    }
  }
}
provider "aws" {
  region = "us-east-1" # Change to your preferred AWS region
}

resource "aws_lightsail_certificate" "ai_insights_certificate" {
  name        = "ai-insights-certificate"
  domain_name = "ai-insights.dodao.io"
}


resource "aws_lightsail_container_service" "cf_service" {
  name = "cf-analysis-service"
  power = "micro" # Options: nano, micro, small, medium, large, xlarge
  scale = 1       # Number of container instances
  tags = {
    Environment = "Production"
  }
  is_disabled = false

  public_domain_names {
    certificate {
      certificate_name = aws_lightsail_certificate.ai_insights_certificate.name
      domain_names = [
        "ai-insights.dodao.io",
        # maybe another domain name
      ]
    }
  }
  private_registry_access {
    ecr_image_puller_role {
      is_active = true
    }
  }
}

resource "aws_lightsail_container_service_deployment_version" "cf_deployment" {
  service_name = aws_lightsail_container_service.cf_service.name

  container {
    container_name = "cf-analysis-container"
    image = "729763663166.dkr.ecr.us-east-1.amazonaws.com/crowd-fund-analysis:latest" # Replace with your ECR repo URL
    command = []

    environment = {
      OPENAI_API_KEY        = var.openai_api_key
      SCRAPINGANT_API_KEY   = var.scrapingant_api_key
      SERPER_API_KEY        = var.serper_api_key
      SCRAPIN_API_KEY       = var.scrapin_api_key
      GOOGLE_CSE_ID         = var.google_cse_id
      GOOGLE_API_KEY        = var.google_api_key
      AWS_ACCESS_KEY_ID     = var.aws_access_key_id
      AWS_SECRET_ACCESS_KEY = var.aws_secret_access_key
      AWS_DEFAULT_REGION    = var.aws_default_region
      S3_BUCKET_NAME        = var.s3_bucket_name
      LINKEDIN_EMAIL        = var.linkedin_email
      LINKEDIN_PASSWORD     = var.linkedin_password
    }

    ports = {
      "5000" = "HTTP"
    }
  }

  public_endpoint {
    container_name = "cf-analysis-container"
    container_port = 5000

    health_check {
      healthy_threshold   = 2
      unhealthy_threshold = 2
      timeout_seconds     = 5
      interval_seconds    = 10
      path                = "/"
      success_codes       = "200-499"
    }
  }
}


data "aws_iam_policy_document" "default" {
  statement {
    effect = "Allow"

    principals {
      type = "AWS"
      identifiers = [
        aws_lightsail_container_service.cf_service.private_registry_access[0].ecr_image_puller_role[0].principal_arn
      ]
    }

    actions = [
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
    ]
  }
}

resource "aws_ecr_repository_policy" "default" {
  repository = "crowd-fund-analysis"
  policy     = data.aws_iam_policy_document.default.json
}

variable "image_tag" {
  description = "The tag of the Docker image to deploy."
  type        = string
}

variable "openai_api_key" {}
variable "scrapingant_api_key" {}
variable "serper_api_key" {}
variable "scrapin_api_key" {}
variable "google_cse_id" {}
variable "google_api_key" {}
variable "aws_access_key_id" {}
variable "aws_secret_access_key" {}
variable "aws_default_region" {}
variable "s3_bucket_name" {}
variable "linkedin_email" {}
variable "linkedin_password" {}

output "public_url" {
  value       = aws_lightsail_container_service.cf_service.url
  description = "Public URL of the Lightsail container service."
}
