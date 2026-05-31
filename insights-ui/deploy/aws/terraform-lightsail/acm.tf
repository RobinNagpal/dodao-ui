# CloudFront certificate — MUST be in us-east-1. (No ALB cert needed: CloudFront connects to
# the Lightsail default domain, which already carries a valid *.cs.amazonlightsail.com cert.)
resource "aws_acm_certificate" "cloudfront" {
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = ["www.${var.domain_name}"]

  lifecycle {
    create_before_destroy = true
  }
}
