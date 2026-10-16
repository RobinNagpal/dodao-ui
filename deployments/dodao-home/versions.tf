terraform {
  required_version = ">= 1.6.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.80"
    }
  }

  # Remote state in a private, versioned, SSE-encrypted S3 bucket (the state holds the deployer's
  # secret access key). The bucket is supplied at init time so nothing account-specific is
  # committed:
  #   terraform init -backend-config="bucket=<state-bucket>"
  # No lock table: this stack is applied by hand, rarely, by one person.
  backend "s3" {
    key     = "dodao-home/terraform.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}
