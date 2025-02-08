###############################################################################
# terraform/main.tf
###############################################################################

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "5.54.1"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Optionally, you can define your backend or remote state config here.
