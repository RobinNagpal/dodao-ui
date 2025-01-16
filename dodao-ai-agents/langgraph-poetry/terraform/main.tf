provider "aws" {
  region = "us-east-1"
}

resource "aws_lightsail_container_service" "ai_agent_service" {
  name  = "ai-agent-service"
  power = "small"  # Choose size: nano, micro, small, medium, large
  scale = 1       # Number of containers
}

resource "aws_lightsail_container_service_deployment_version" "ai_agent_deployment" {
  service_name = aws_lightsail_container_service.ai_agent_service.name

  container {
    container_name  = "ai-agent"
    image           = var.container_image  # ECR image URI
    ports = {
      5000 = "HTTP"
    }
  }

  public_endpoint {
    container_name  = "ai-agent"
    container_port  = 5000

    health_check {
      success_codes     = "200"
      unhealthy_threshold = 2
      healthy_threshold   = 2
      path = "/"
    }
  }
}

variable "container_image" {
  description = "ECR Docker image URI"
  type        = string
}

output "public_endpoint_url" {
  value = aws_lightsail_container_service.ai_agent_service.url
}
