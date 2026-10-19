provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project   = "shared-host-apps"
      ManagedBy = "terraform"
    }
  }
}
