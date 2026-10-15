# Alias records pointing the apex and www at CloudFront. Z2FDTNDATAQYW2 is
# CloudFront's fixed hosted zone ID (same for every distribution).
#
# allow_overwrite takes over the existing apex/www records (today they point at
# Vercel) in place, so the cut-over is a single apply with no manual DNS edit.
# If the existing records are CNAMEs (www usually is), Route 53 cannot convert a
# CNAME into an A alias — delete that CNAME first (see README, step 4).
locals {
  cloudfront_zone_id = "Z2FDTNDATAQYW2"
  record_names       = [var.domain_name, "www.${var.domain_name}"]
}

resource "aws_route53_record" "web_a" {
  for_each = toset(local.record_names)

  zone_id         = data.aws_route53_zone.main.zone_id
  name            = each.value
  type            = "A"
  allow_overwrite = true

  alias {
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = local.cloudfront_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "web_aaaa" {
  for_each = toset(local.record_names)

  zone_id         = data.aws_route53_zone.main.zone_id
  name            = each.value
  type            = "AAAA"
  allow_overwrite = true

  alias {
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = local.cloudfront_zone_id
    evaluate_target_health = false
  }
}
