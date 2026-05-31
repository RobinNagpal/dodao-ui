provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "insights-ui"
      App         = "koalagains"
      Environment = var.environment
      ManagedBy   = "terraform"
      Compute     = "lightsail"
    }
  }
}

# CloudFront + its ACM certificate must live in us-east-1.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project   = "insights-ui"
      App       = "koalagains"
      ManagedBy = "terraform"
    }
  }
}
