# Direct-access domain (prod.koalagains.com) for Phase A — straight to Lightsail, no CloudFront.
# Assumes the koalagains.com hosted zone exists in this AWS account.

data "aws_route53_zone" "main" {
  name         = "${var.domain_name}."
  private_zone = false
}

locals {
  # The Lightsail service URL is "https://<host>/" — strip scheme + trailing slash for DNS.
  lightsail_service_host = replace(replace(aws_lightsail_container_service.app.url, "https://", ""), "/", "")
}

# Lightsail-managed TLS certificate for the direct host.
resource "aws_lightsail_certificate" "app" {
  name        = "${var.name_prefix}-cert"
  domain_name = var.direct_domain_name
}

# DNS validation records for the Lightsail certificate.
resource "aws_route53_record" "lightsail_cert_validation" {
  for_each = {
    for o in aws_lightsail_certificate.app.domain_validation_options : o.domain_name => {
      name   = o.resource_record_name
      type   = o.resource_record_type
      record = o.resource_record_value
    }
  }

  zone_id         = data.aws_route53_zone.main.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

# prod.koalagains.com → the Lightsail container service (direct, no CloudFront).
resource "aws_route53_record" "direct" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.direct_domain_name
  type    = "CNAME"
  ttl     = 300
  records = [local.lightsail_service_host]
}
