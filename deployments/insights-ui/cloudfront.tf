# PHASE B ONLY (manage_cloudfront = true). Everything here is gated off by default so Phase A
# is purely the parallel, direct prod.koalagains.com deployment with Vercel still serving
# koalagains.com via the existing CloudFront.
#
# When flipping to Phase B, import the existing distribution first so we reuse it (keeps the
# domain, DNS, and the flush-cloudfront-cache workflow):
#   terraform import 'aws_cloudfront_distribution.main[0]' EZI5H8FKNE9R1
# then reconcile until `plan` is clean. IMPORTANT: replicate ALL existing behaviors (incl. the
# per-stocks-page GET API endpoints from the deploy-skew doc Phase 5) so the reconcile doesn't
# delete them. Static assets are NOT a CloudFront concern — the browser loads them straight
# from S3 via assetPrefix, so there is no S3 origin/behavior here.

locals {
  cf_count         = var.manage_cloudfront ? 1 : 0
  lightsail_origin = "lightsail-app"
}

# CloudFront cert (us-east-1) for the apex once CloudFront fronts the app.
resource "aws_acm_certificate" "cloudfront" {
  count             = local.cf_count
  provider          = aws.us_east_1
  domain_name       = var.domain_name
  validation_method = "DNS"

  subject_alternative_names = ["www.${var.domain_name}"]

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "cf_cert_validation" {
  for_each = var.manage_cloudfront ? {
    for dvo in aws_acm_certificate.cloudfront[0].domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  } : {}

  zone_id         = data.aws_route53_zone.main.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 60
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "cloudfront" {
  count                   = local.cf_count
  provider                = aws.us_east_1
  certificate_arn         = aws_acm_certificate.cloudfront[0].arn
  validation_record_fqdns = [for r in aws_route53_record.cf_cert_validation : r.fqdn]
}

resource "aws_cloudfront_cache_policy" "long_ttl" {
  count = local.cf_count
  name  = "${var.name_prefix}-long-ttl"
  # min == default == max so CloudFront caches even though the force-dynamic origin sends
  # `Cache-Control: no-store, max-age=0`. min_ttl=0 would honor that header and cache NOTHING
  # (see cloudfront-deploy-skew.md) — the whole point of the 6-day edge cache would evaporate.
  default_ttl = var.cloudfront_default_ttl
  max_ttl     = var.cloudfront_default_ttl
  min_ttl     = var.cloudfront_default_ttl

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config { cookie_behavior = "none" }
    headers_config { header_behavior = "none" }
    query_strings_config { query_string_behavior = "all" }
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true
  }
}

data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}

resource "aws_cloudfront_distribution" "main" {
  count           = local.cf_count
  enabled         = true
  is_ipv6_enabled = true
  comment         = "insights-ui (koalagains.com) — Lightsail origin"
  aliases         = [var.domain_name, "www.${var.domain_name}"]
  price_class     = "PriceClass_All"

  origin {
    domain_name = var.direct_domain_name # prod.koalagains.com → Lightsail (HTTPS)
    origin_id   = local.lightsail_origin

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id         = local.lightsail_origin
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  dynamic "ordered_cache_behavior" {
    for_each = toset(var.cacheable_path_patterns)
    content {
      path_pattern             = ordered_cache_behavior.value
      target_origin_id         = local.lightsail_origin
      viewer_protocol_policy   = "redirect-to-https"
      allowed_methods          = ["GET", "HEAD", "OPTIONS"]
      cached_methods           = ["GET", "HEAD"]
      compress                 = true
      cache_policy_id          = aws_cloudfront_cache_policy.long_ttl[0].id
      origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cloudfront[0].arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

# Apex/www → CloudFront (Phase B). Until then, koalagains.com keeps resolving to Vercel's
# CloudFront via the existing (unmanaged) records.
# allow_overwrite repoints the EXISTING apex/www records (today → Vercel's CloudFront) to the
# new distribution. This is the actual production cut-over moment — applying Phase B flips the
# live site. Without allow_overwrite, Route53 CREATE fails (records already exist).
resource "aws_route53_record" "apex" {
  count           = local.cf_count
  zone_id         = data.aws_route53_zone.main.zone_id
  name            = var.domain_name
  type            = "A"
  allow_overwrite = true
  alias {
    name                   = aws_cloudfront_distribution.main[0].domain_name
    zone_id                = aws_cloudfront_distribution.main[0].hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "www" {
  count           = local.cf_count
  zone_id         = data.aws_route53_zone.main.zone_id
  name            = "www.${var.domain_name}"
  type            = "A"
  allow_overwrite = true
  alias {
    name                   = aws_cloudfront_distribution.main[0].domain_name
    zone_id                = aws_cloudfront_distribution.main[0].hosted_zone_id
    evaluate_target_health = false
  }
}
