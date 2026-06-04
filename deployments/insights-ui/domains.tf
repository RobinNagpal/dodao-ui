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

# Second Lightsail cert covering the apex + www. Needed once CloudFront fronts Lightsail:
# CloudFront's Managed-AllViewer origin request policy forwards the viewer's Host header, so the
# Lightsail ELB sees Host: koalagains.com (or www.). awselb returns 404 for any vhost not in
# public_domain_names, so the cert must cover apex+www and container.tf must list them.
resource "aws_lightsail_certificate" "app_apex" {
  name                      = "${var.name_prefix}-apex-cert"
  domain_name               = var.domain_name
  subject_alternative_names = ["www.${var.domain_name}"]
}

# DNS validation records for the Lightsail certificates. Each cert's domain_validation_options is
# computed, so indexing via for_each on the cert's own output fails at plan time (keys not known).
# Workaround: build a static {domain_name => dvo} map and look up by the input variable values.
locals {
  lightsail_cert_dvo = tolist(aws_lightsail_certificate.app.domain_validation_options)[0]
  apex_cert_dvos = {
    for o in aws_lightsail_certificate.app_apex.domain_validation_options : o.domain_name => o
  }
}

resource "aws_route53_record" "lightsail_cert_validation" {
  zone_id         = data.aws_route53_zone.main.zone_id
  name            = local.lightsail_cert_dvo.resource_record_name
  type            = local.lightsail_cert_dvo.resource_record_type
  records         = [local.lightsail_cert_dvo.resource_record_value]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_route53_record" "lightsail_cert_validation_apex" {
  zone_id         = data.aws_route53_zone.main.zone_id
  name            = local.apex_cert_dvos[var.domain_name].resource_record_name
  type            = local.apex_cert_dvos[var.domain_name].resource_record_type
  records         = [local.apex_cert_dvos[var.domain_name].resource_record_value]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_route53_record" "lightsail_cert_validation_www" {
  zone_id         = data.aws_route53_zone.main.zone_id
  name            = local.apex_cert_dvos["www.${var.domain_name}"].resource_record_name
  type            = local.apex_cert_dvos["www.${var.domain_name}"].resource_record_type
  records         = [local.apex_cert_dvos["www.${var.domain_name}"].resource_record_value]
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
