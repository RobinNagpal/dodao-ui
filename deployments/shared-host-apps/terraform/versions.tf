terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }

  # DNS only — the Lightsail host itself is not in this stack (see shared-host.tf). Kept in the
  # same state bucket as deployments/insights-ui, under its own key. No CI applies this stack.
  backend "s3" {
    bucket  = "koalagains-terraform-state"
    key     = "shared-host-apps/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
