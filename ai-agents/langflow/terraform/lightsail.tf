###############################################################################
# terraform/lightsail.tf
###############################################################################

resource "aws_lightsail_certificate" "langflow_certificate" {
  name        = "langflow-certificate"
  domain_name = "langflow.dodao.io"
}

# Create the Lightsail Container Service
resource "aws_lightsail_container_service" "langflow" {
  name  = "langflow-lightsail"
  power = "micro" # can be nano, micro, small, medium, large, xlarge, 2xlarge
  scale = 1

  tags = {
    Environment = "Production"
  }
  is_disabled = false

  public_domain_names {
    certificate {
      certificate_name = aws_lightsail_certificate.langflow_certificate.name
      domain_names = [
        "langflow.dodao.io",
        # maybe another domain name
      ]
    }
  }
  # private_registry_access {
  #   ecr_image_puller_role {
  #     is_active = true
  #   }
  # }
}

# Once the service is created, we deploy a container to it
resource "aws_lightsail_container_service_deployment_version" "langflow_deployment" {
  service_name = aws_lightsail_container_service.langflow.name

  container {
    # Must match the "name" from the container endpoint you define
    container_name = "langflow-container"
    image = "langflowai/langflow:latest"
    # We can set environment variables for Langflow here
    command = ["python", "-m", "langflow", "run"]
    environment = {
      LANGFLOW_AUTO_LOGIN         = "False"
      LANGFLOW_SUPERUSER          = var.langflow_superuser
      LANGFLOW_SUPERUSER_PASSWORD = var.langflow_superuser_password
      LANGFLOW_SECRET_KEY         = var.langflow_secret_key
      LANGFLOW_DATABASE_URL       = var.postgres_url

      # Optional: override host/port if you want to run on 0.0.0.0
      # LANGFLOW_HOST = "0.0.0.0"
      # LANGFLOW_PORT = "7860"
    }
    ports = {
      "7860" = "HTTP"
    }
    # Or if you want to map port 80 to container 7860 externally:
    # ports = {
    #   "80" = "HTTP"
    # }
  }

  public_endpoint {
    container_name = "langflow-container"
    container_port = 7860

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
