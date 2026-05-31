# CloudFront certificate — MUST be in us-east-1.
resource "aws_acm_certificate" "cloudfront" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = ["www.${var.domain_name}"]

  lifecycle {
    create_before_destroy = true
  }
}

# ALB certificate — in the app region. CloudFront → ALB is HTTPS, so the ALB needs its own
# cert. Can be the same domain or an internal origin hostname.
resource "aws_acm_certificate" "alb" {
  domain_name       = "origin.${var.domain_name}"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# DNS validation records are created in route53.tf once the hosted zone is known.
