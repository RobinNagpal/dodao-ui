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

# DNS validation record for the Lightsail certificate. The cert covers exactly one domain
# (var.direct_domain_name), so there is exactly one validation option. We index it directly
# rather than using for_each: for_each keys derived from the cert's *computed*
# domain_validation_options aren't known until apply, which fails the first apply with
# "Invalid for_each argument" (keys cannot be determined until apply).
locals {
  lightsail_cert_dvo = tolist(aws_lightsail_certificate.app.domain_validation_options)[0]
}

resource "aws_route53_record" "lightsail_cert_validation" {
  zone_id         = data.aws_route53_zone.main.zone_id
  name            = local.lightsail_cert_dvo.resource_record_name
  type            = local.lightsail_cert_dvo.resource_record_type
  records         = [local.lightsail_cert_dvo.resource_record_value]
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
