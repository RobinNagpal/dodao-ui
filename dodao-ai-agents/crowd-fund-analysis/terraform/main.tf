provider "aws" {
  region = "us-east-1" # Change to your preferred AWS region
}

resource "aws_lightsail_container_service" "cf_service" {
  name  = "cf-analysis-service"
  power = "medium" # Options: nano, micro, small, medium, large, xlarge
  scale = 1       # Number of container instances
  tags = {
    Environment = "Production"
  }
}

resource "aws_lightsail_container_service_deployment_version" "cf_deployment" {
  service_name = aws_lightsail_container_service.cf_service.name

  container {
    container_name = "cf-analysis-container"
    image          = "729763663166.dkr.ecr.us-east-1.amazonaws.com/crowd-fund-analysis:latest" # Replace with your ECR repo URL
    command = []

    environment = {
      # FLASK_ENV           = "production"
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
