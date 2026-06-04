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
  }

  # Remote state is REQUIRED — without it, CI starts from empty local state every run and
  # tries to recreate everything (ECR/S3/Lightsail → AlreadyExists failures on the 2nd run).
  # One-time bootstrap before first `init`: create the S3 bucket below (versioned + encrypted).
  # No DynamoDB lock table: the deploy workflow's `concurrency.group` already serializes runs
  # (and CI is the only thing that applies), so state locking would be redundant. If other
  # appliers are ever added, switch to S3-native locking with `use_lockfile = true` (TF >= 1.10)
  # instead of reintroducing DynamoDB. `encrypt = true` keeps the secrets that land in state
  # (DATABASE_URL etc.) encrypted at rest.
  backend "s3" {
    bucket  = "koalagains-terraform-state"
    key     = "insights-ui/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
