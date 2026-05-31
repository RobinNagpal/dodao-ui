terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.54"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.4"
    }
  }

  # Remote state. Bootstrap the bucket + lock table once (manually or in a separate
  # terraform/bootstrap stack), then uncomment and fill in.
  #
  # backend "s3" {
  #   bucket         = "koalagains-terraform-state"
  #   key            = "insights-ui/aws/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "koalagains-terraform-locks"
  #   encrypt        = true
  # }
}
