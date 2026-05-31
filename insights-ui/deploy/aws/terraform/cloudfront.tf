# CloudFront distribution. To REUSE the existing distribution (EZI5H8FKNE9R1) rather than
# create a new one (recommended — preserves the domain, Route 53 wiring, and the existing
# flush-cloudfront-cache workflow), import it into state BEFORE the first apply:
#
#   terraform import aws_cloudfront_distribution.main EZI5H8FKNE9R1
#
# then reconcile this config until `terraform plan` is clean. See migration plan §11.

# Origin Access Control so CloudFront can read the private S3 assets bucket.
resource "aws_cloudfront_origin_access_control" "assets" {
  name                              = "${var.name_prefix}-assets-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

locals {
  alb_origin_id = "alb-app"
  s3_origin_id  = "s3-assets"
}

resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "insights-ui (koalagains.com)"
  aliases         = [var.domain_name, "www.${var.domain_name}"]
  price_class     = "PriceClass_All"

  # --- Origin 1: ALB (dynamic app) ---
  origin {
    domain_name = aws_lb.app.dns_name
    origin_id   = local.alb_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    # Origin lock: the secret header the ALB listener rule requires (alb.tf).
    custom_header {
      name  = "X-Origin-Verify"
      value = random_password.origin_verify.result
    }
  }

  # --- Origin 2: S3 (static assets) ---
  origin {
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.assets.id
  }

  # Default behavior → app (dynamic). Caching disabled; the app sets its own Cache-Control.
  default_cache_behavior {
    target_origin_id       = local.alb_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id          = data.aws_cloudfront_cache_policy.disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer.id
  }

  # Static assets → S3, long cache (hashed filenames are immutable).
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    cache_policy_id        = data.aws_cloudfront_cache_policy.optimized.id
  }

  # Cacheable app prefixes (stocks/etfs/tariffs) → app origin, 6-day TTL (unchanged).
  dynamic "ordered_cache_behavior" {
    for_each = var.cacheable_path_patterns
    content {
      path_pattern           = ordered_cache_behavior.value
      target_origin_id       = local.alb_origin_id
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["GET", "HEAD", "OPTIONS"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true

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

# Long-TTL cache policy matching the current 6-day setup.
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

# AWS-managed policies.
data "aws_cloudfront_cache_policy" "disabled" {
  name = "Managed-CachingDisabled"
}

data "aws_cloudfront_cache_policy" "optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_origin_request_policy" "all_viewer" {
  name = "Managed-AllViewer"
}
