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

resource "aws_lightsail_container_service" "cf_service" {
  name = "cf-analysis-service"
  power = "micro" # Options: nano, micro, small, medium, large, xlarge
  scale = 1       # Number of container instances
  tags = {
    Environment = "Production"
  }
  is_disabled = false

  private_registry_access {
    ecr_image_puller_role {
      is_active = true
    }
  }
}

# resource "aws_lightsail_static_ip" "cf_static_ip" {
#   name = "cf-analysis-service-ip"
# }
#
# resource "aws_lightsail_static_ip_attachment" "cf_static_ip_attachment" {
#   static_ip_name = aws_lightsail_static_ip.cf_static_ip.name
#   instance_name  = aws_lightsail_container_service.cf_service.name
# }

resource "aws_lightsail_container_service_deployment_version" "cf_deployment" {
  service_name = aws_lightsail_container_service.cf_service.name

  container {
    container_name = "cf-analysis-container"
    image = "729763663166.dkr.ecr.us-east-1.amazonaws.com/crowd-fund-analysis:latest" # Replace with your ECR repo URL
    command = []

    environment = {
      OPENAI_API_KEY      = var.openai_api_key
      SCRAPINGANT_API_KEY = var.scrapingant_api_key
      SERPER_API_KEY      = var.serper_api_key
      SCRAPIN_API_KEY     = var.scrapin_api_key
      GOOGLE_CSE_ID       = var.google_cse_id
      GOOGLE_API_KEY      = var.google_api_key
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

# resource "aws_lightsail_domain" "domain_test" {
#   domain_name = "dodao.io"
#
# }
#
# resource "aws_lightsail_domain_entry" "domain_entry" {
#   domain_name = aws_lightsail_domain.domain_test.domain_name
#   name        = "crowd-fund-analysis"
#   type        = "CNAME"
#   target      = aws_lightsail_container_service.cf_service.url
# }
#
# resource "aws_lightsail_certificate" "cf-analysis-cert" {
#   name        = "cf-analysis-cert"
#   domain_name = "crowd-fund-analysis.dodao.io"
# }

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

variable "openai_api_key" {
  description = "API key for OpenAI."
  type        = string
}

variable "scrapingant_api_key" {
  description = "API key for ScrapingAnt."
  type        = string
}

variable "serper_api_key" {
  description = "API key for SERPER."
  type        = string
}

variable "scrapin_api_key" {
  description = "API key for SCRAPIN."
  type        = string
}

variable "google_cse_id" {
  description = "Google Custom Search Engine ID."
  type        = string
}

variable "google_api_key" {
  description = "API key for Google."
  type        = string
}

output "public_url" {
  value       = aws_lightsail_container_service.cf_service.url
  description = "Public URL of the Lightsail container service."
}
