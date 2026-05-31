terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.54"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
  }

  # Remote state — bootstrap the bucket + lock table once, then uncomment.
  # backend "s3" {
  #   bucket         = "koalagains-terraform-state"
  #   key            = "insights-ui/lightsail/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "koalagains-terraform-locks"
  #   encrypt        = true
  # }
}
