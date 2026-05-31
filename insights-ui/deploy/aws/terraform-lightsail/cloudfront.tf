# Reuse the existing distribution (EZI5H8FKNE9R1) — import it before the first apply:
#   terraform import aws_cloudfront_distribution.main EZI5H8FKNE9R1
# then reconcile until `plan` is clean. See plan §3 / §12.
#
# IMPORTANT: the live distribution also has cache behaviors for the per-stocks-page GET API
# endpoints (deploy-skew doc, Phase 5: /api/koala_gains/tickers-v1/exchange/* and /country/*).
# Replicate ALL existing behaviors here before applying, or the import reconcile will try to
# DELETE them and regress that caching.

locals {
  # The Lightsail service URL is "https://<host>/" — CloudFront needs the bare host.
  lightsail_origin_host = replace(replace(aws_lightsail_container_service.app.url, "https://", ""), "/", "")
  lightsail_origin_id   = "lightsail-app"
  s3_origin_id          = "s3-assets"
}

resource "aws_cloudfront_origin_access_control" "assets" {
  count                             = var.enable_static_asset_offload ? 1 : 0
  name                              = "${var.name_prefix}-assets-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Secret header CloudFront adds on every origin request. Lightsail has no LB listener rules, so
# enforcement (rejecting requests that lack it) must be done APP-SIDE (e.g. Next.js middleware)
# if you want a hard origin lock. The header is provided here regardless.
resource "random_password" "origin_verify" {
  length  = 40
  special = false
}

resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "insights-ui (koalagains.com) — Lightsail origin"
  aliases         = [var.domain_name, "www.${var.domain_name}"]
  price_class     = "PriceClass_All"

  origin {
    domain_name = local.lightsail_origin_host
    origin_id   = local.lightsail_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only" # Lightsail default domain has a valid TLS cert
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "X-Origin-Verify"
      value = random_password.origin_verify.result
    }
  }

  dynamic "origin" {
    for_each = var.enable_static_asset_offload ? [1] : []
    content {
      domain_name              = aws_s3_bucket.assets[0].bucket_regional_domain_name
      origin_id                = local.s3_origin_id
      origin_access_control_id = aws_cloudfront_origin_access_control.assets[0].id
    }
  }

  # Default → Lightsail app (dynamic, caching disabled; app sets its own Cache-Control).
  default_cache_behavior {
    target_origin_id         = local.lightsail_origin_id
    viewer_protocol_policy   = "redirect-to-https"
    allowed_methods          = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods           = ["GET", "HEAD"]
    compress                 = true
    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  # Static assets → S3 (when offload enabled) or Lightsail (fallback).
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = var.enable_static_asset_offload ? local.s3_origin_id : local.lightsail_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.optimized.id
  }

  # Cacheable app prefixes (stocks/etfs/tariffs) → Lightsail, 6-day TTL (unchanged).
  dynamic "ordered_cache_behavior" {
    for_each = var.cacheable_path_patterns
    content {
      path_pattern             = ordered_cache_behavior.value
      target_origin_id         = local.lightsail_origin_id
      viewer_protocol_policy   = "redirect-to-https"
      allowed_methods          = ["GET", "HEAD", "OPTIONS"]
      cached_methods           = ["GET", "HEAD"]
      compress                 = true
      cache_policy_id          = aws_cloudfront_cache_policy.long_ttl.id
      origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cloudfront.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

resource "aws_cloudfront_cache_policy" "long_ttl" {
  name        = "${var.name_prefix}-long-ttl"
  default_ttl = var.cloudfront_default_ttl
  max_ttl     = var.cloudfront_default_ttl
  min_ttl     = 0

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

data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}
