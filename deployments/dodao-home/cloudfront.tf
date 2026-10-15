locals {
  s3_origin_id = "web-s3"

  # AWS-managed policy (fixed, documented ID). Honours the Cache-Control the
  # deploy workflow puts on each object: immutable for hashed /_next/static,
  # short for HTML.
  cache_policy_caching_optimized = "658327ea-f89d-4fab-a63d-7e88639e58f6"
}

resource "aws_cloudfront_origin_access_control" "web" {
  name                              = "${var.app_name}-web-oac"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# Redirects www to the apex and maps clean URLs (/robotics) onto the exported
# objects (/robotics.html). See functions/viewer-request.js.tftpl.
resource "aws_cloudfront_function" "viewer_request" {
  name    = "${var.app_name}-viewer-request"
  runtime = "cloudfront-js-2.0"
  publish = true

  code = templatefile("${path.module}/functions/viewer-request.js.tftpl", {
    domain_name = var.domain_name
  })
}

# HSTS, so a browser that has seen the site once never tries http again.
resource "aws_cloudfront_response_headers_policy" "security" {
  name = "${var.app_name}-security-headers"

  security_headers_config {
    strict_transport_security {
      access_control_max_age_sec = 31536000
      include_subdomains         = false
      preload                    = false
      override                   = true
    }

    content_type_options {
      override = true
    }

    referrer_policy {
      referrer_policy = "strict-origin-when-cross-origin"
      override        = true
    }
  }
}

resource "aws_cloudfront_distribution" "web" {
  enabled             = true
  is_ipv6_enabled     = true
  http_version        = "http2and3"
  comment             = "${var.app_name} static site (${var.domain_name})"
  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  origin {
    origin_id                = local.s3_origin_id
    domain_name              = aws_s3_bucket.web.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.web.id
  }

  default_cache_behavior {
    target_origin_id           = local.s3_origin_id
    viewer_protocol_policy     = "redirect-to-https"
    allowed_methods            = ["GET", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    compress                   = true
    cache_policy_id            = local.cache_policy_caching_optimized
    response_headers_policy_id = aws_cloudfront_response_headers_policy.security.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.viewer_request.arn
    }
  }

  # A missing object comes back from S3 as 403 (CloudFront has no ListBucket
  # permission) or 404; both get the exported 404 page with a real 404 status.
  # The site is purely static — there is no API behind this distribution whose
  # errors this could mask.
  custom_error_response {
    error_code            = 403
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  custom_error_response {
    error_code            = 404
    response_code         = 404
    response_page_path    = "/404.html"
    error_caching_min_ttl = 60
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.web.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
