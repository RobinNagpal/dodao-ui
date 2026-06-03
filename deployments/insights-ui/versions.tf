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

  # Remote state is REQUIRED — without it, CI starts from empty local state every run and
  # tries to recreate everything (ECR/S3/Lightsail → AlreadyExists failures on the 2nd run).
  # One-time bootstrap before first `init`: create the S3 bucket + DynamoDB lock table below
  # (e.g. via a tiny separate bootstrap stack or the AWS console). `encrypt = true` keeps the
  # secrets that land in state (DATABASE_URL etc.) encrypted at rest.
  backend "s3" {
    bucket         = "koalagains-terraform-state"
    key            = "insights-ui/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "koalagains-terraform-locks"
    encrypt        = true
  }
}
