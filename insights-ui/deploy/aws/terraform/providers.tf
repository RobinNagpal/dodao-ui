provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "insights-ui"
      App         = "koalagains"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# CloudFront and its ACM certificate must live in us-east-1, regardless of app region.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = {
      Project     = "insights-ui"
      App         = "koalagains"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
