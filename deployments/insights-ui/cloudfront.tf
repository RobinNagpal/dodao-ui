# koalagains.com edge layer — CloudFront distribution + ACM cert + Route53 records + IAM.
# Migrated from dodao-api-v2-deployment in mid-2026 (see docs/insights-ui/aws-deployment.md).
# Resource names + structure are kept verbatim with that repo so the state was importable
# without recreates; if you touch this, mirror the change anywhere the comment trail mentions it.

locals {
  koalagains_canonical = var.cloudfront_aliases[0]
  koalagains_www       = "www.${var.cloudfront_aliases[0]}"
  vercel_origin_id     = "vercel-insights-ui"

  # Second origin: the public /_next/static/* asset bucket (s3_static.tf). Fronting it with
  # CloudFront adds edge caching + on-the-fly gzip/brotli — S3's REST endpoint serves objects
  # uncompressed and with no CDN, which was the dominant Core Web Vitals cost on /stocks/* and
  # /etfs/* (render-blocking CSS shipped at ~5x its compressed size straight from us-east-1).
  static_assets_origin_id = "s3-insights-ui-static-assets"

  # CloudFront only accepts three allowed_methods sets: [GET,HEAD], [GET,HEAD,OPTIONS],
  # or all seven. The ordered behaviors below match cacheable URLs but must still let
  # writes through to the origin. cached_methods stays [GET,HEAD] — CloudFront never
  # caches POST/PUT/PATCH/DELETE responses, so these pass through uncached automatically.
  all_viewer_methods = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]

  # Explicit allow-list of the PUBLIC GET API endpoints that a /stocks/* page render
  # actually fetches (verified against the page source). Enumerated (not a broad
  # /api/.../tickers-v1/* wildcard) for two reasons: (1) that prefix also hosts
  # admin-protected GETs (e.g. /generation-requests, /missing-reports); each cached
  # pattern must be a public `withErrorHandlingV2` GET so the cookie-stripping
  # koalagains_one_week policy can't cache an admin 401/response publicly. (2) The
  # per-ticker mutating routes (business-and-moat, competition, management-team, …)
  # are POST+withAdmin under this same /exchange/{e}/{t}/ prefix, so a segment-
  # anchored wildcard is impossible in CloudFront — hence the base /exchange/{e}/{t}
  # fast route is deliberately NOT cached (a "/exchange/*/*" catch-all would swallow
  # that admin/mutation subtree). Every entry below is a leaf GET a page fetches.
  stocks_api_cached_paths = [
    # Per-ticker report subpages — each renders from its `{category}-data` GET.
    "/api/koala_gains/tickers-v1/exchange/*/*/business-and-moat-data",
    "/api/koala_gains/tickers-v1/exchange/*/*/financial-statement-analysis-data",
    "/api/koala_gains/tickers-v1/exchange/*/*/past-performance-data",
    "/api/koala_gains/tickers-v1/exchange/*/*/future-performance-data",
    "/api/koala_gains/tickers-v1/exchange/*/*/fair-value-data",
    # Main `/stocks/{e}/{t}` page slices (per-slice streaming — the `/full-render`
    # consolidation was reverted, so the page fetches these individually).
    "/api/koala_gains/tickers-v1/exchange/*/*/financial-info",
    "/api/koala_gains/tickers-v1/exchange/*/*/quarterly-chart-data",
    "/api/koala_gains/tickers-v1/exchange/*/*/price-history",
    "/api/koala_gains/tickers-v1/exchange/*/*/competition-tickers",
    # Country listing + industry pages.
    "/api/koala_gains/tickers-v1/country/*/tickers/industries",
    "/api/koala_gains/tickers-v1/country/*/tickers/industries/*",
  ]

  # ETF per-ETF GET API endpoints that back the public /etfs/[exchange]/[etf] page tree. Same
  # rationale as stocks_api_cached_paths above: enumerated (not a broad /api/.../etfs-v1/*
  # wildcard) because that prefix also hosts admin-protected GETs, and the base /exchange/{e}/{t}
  # fast route is deliberately left uncached (CloudFront can't segment-anchor a wildcard, so a
  # catch-all would swallow the POST+withAdmin subtree). Each entry is a public
  # (`withErrorHandlingV2`) GET a page render actually fetches (verified against the page source):
  # main → full-render + chart-data; the four
  # category subpages → their `{category}-data` GET (performance-returns also reads mor-info);
  # competition → competition; holdings → portfolio-holdings.
  etfs_api_cached_paths = [
    "/api/koala_gains/etfs-v1/exchange/*/*/full-render",
    "/api/koala_gains/etfs-v1/exchange/*/*/chart-data",
    "/api/koala_gains/etfs-v1/exchange/*/*/mor-info",
    "/api/koala_gains/etfs-v1/exchange/*/*/portfolio-holdings",
    "/api/koala_gains/etfs-v1/exchange/*/*/competition",
    "/api/koala_gains/etfs-v1/exchange/*/*/performance-returns-data",
    "/api/koala_gains/etfs-v1/exchange/*/*/cost-efficiency-team-data",
    "/api/koala_gains/etfs-v1/exchange/*/*/risk-analysis-data",
    "/api/koala_gains/etfs-v1/exchange/*/*/future-performance-outlook-data",
  ]

  # Combined cached GET API endpoints (stocks + ETFs) — one ordered_cache_behavior per pattern.
  # (Commodity pages/APIs are intentionally NOT CloudFront-cached for now — they serve from the
  # Vercel origin and rely only on the Next.js Data Cache.)
  api_cached_paths = concat(local.stocks_api_cached_paths, local.etfs_api_cached_paths)

  # Environment tag kept literal ("prod") to match the value the distribution + cert + IAM
  # policy were created with in dodao-api-v2-deployment (where local.environment derived from
  # terraform.workspace == "prod"). Changing this to var.environment ("production") would
  # surface as an in-place tag update on every apply.
  koalagains_environment_tag = "prod"
}

resource "aws_acm_certificate" "koalagains" {
  domain_name               = local.koalagains_canonical
  subject_alternative_names = slice(var.cloudfront_aliases, 1, length(var.cloudfront_aliases))
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Project     = "koalagains"
    Environment = local.koalagains_environment_tag
  }
}

resource "aws_route53_record" "koalagains_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.koalagains.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id         = data.aws_route53_zone.main.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.record]
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "koalagains" {
  certificate_arn         = aws_acm_certificate.koalagains.arn
  validation_record_fqdns = [for r in aws_route53_record.koalagains_cert_validation : r.fqdn]
}

resource "aws_cloudfront_cache_policy" "koalagains_one_week" {
  name        = "koalagains-one-week"
  comment     = "Cache /stocks/* and /etfs/* for 6 days (under Vercel Skew Protection's 7-day window)"
  default_ttl = 518400
  max_ttl     = 518400
  min_ttl     = 518400

  parameters_in_cache_key_and_forwarded_to_origin {
    enable_accept_encoding_brotli = true
    enable_accept_encoding_gzip   = true

    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

resource "aws_cloudfront_function" "www_redirect" {
  count   = var.enable_www_redirect ? 1 : 0
  name    = "koalagains-www-to-apex"
  runtime = "cloudfront-js-1.0"
  comment = "Redirect ${local.koalagains_www} to ${local.koalagains_canonical}"
  publish = true
  code    = <<-EOT
    function handler(event) {
      var request = event.request;
      var host = request.headers.host && request.headers.host.value;
      if (host === '${local.koalagains_www}') {
        var qs = '';
        for (var k in request.querystring) {
          qs += (qs ? '&' : '?') + k + '=' + request.querystring[k].value;
        }
        return {
          statusCode: 301,
          statusDescription: 'Moved Permanently',
          headers: {
            location: { value: 'https://${local.koalagains_canonical}' + request.uri + qs }
          }
        };
      }
      return request;
    }
  EOT
}

resource "aws_cloudfront_distribution" "koalagains" {
  enabled         = true
  is_ipv6_enabled = true
  comment         = "${local.koalagains_canonical} -> Vercel insights-ui"
  http_version    = "http2and3"
  price_class     = "PriceClass_100"

  aliases = var.cloudfront_aliases

  # Origin = AWS Lightsail (insights-ui). CloudFront connects to prod.koalagains.com over HTTPS
  # (the Lightsail service has a cert covering that host). AllViewer forwards the viewer Host
  # header (koalagains.com / www.koalagains.com), and the service's public_domain_names accept
  # those vhosts via a second Lightsail cert (see domains.tf — aws_lightsail_certificate.app_apex).
  # origin_id keeps its legacy string so the import + future in-place updates don't churn origins.
  origin {
    domain_name = var.aws_origin_hostname
    origin_id   = local.vercel_origin_id

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # Static-asset origin — the public /_next/static/* bucket. The bucket policy already grants
  # anonymous s3:GetObject on /_next/static/* (s3_static.tf), so a plain REST origin works with an
  # empty origin_access_identity. (Optional future hardening: switch to OAC + a private bucket.)
  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = local.static_assets_origin_id

    s3_origin_config {
      origin_access_identity = ""
    }
  }

  default_cache_behavior {
    target_origin_id       = local.vercel_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Managed-CachingDisabled
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    # Managed-AllViewer — forwards the original Host so the origin + NextAuth see koalagains.com
    # (NextAuth derives the OAuth redirect_uri from x-forwarded-host / host headers; stripping
    # Host upstream broke Google sign-in.)
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

    dynamic "function_association" {
      for_each = var.enable_www_redirect ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.www_redirect[0].arn
      }
    }
  }

  # /_next/static/* — content-hashed, immutable build assets, served from S3 through CloudFront so
  # they're edge-cached AND compressed. compress = true → gzip/brotli on the fly, which is LOSSLESS:
  # the browser inflates them back to byte-identical CSS/JS before parsing, so nothing about the
  # rendered layout changes (same mechanism already compresses the HTML via koalagains_one_week).
  # Managed-CachingOptimized has brotli+gzip enabled and a 1-year TTL — safe because the filenames
  # are content-hashed (a new build emits new names; old ones live 30 days in S3, see s3_static.tf).
  # No origin_request_policy: an S3 REST origin must NOT receive the viewer Host header.
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    target_origin_id       = local.static_assets_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Managed-CachingOptimized
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  # Homepage (`/`) — statically generated at build time + weekly ISR, so it's safe and fast to
  # serve from the edge. This pattern matches ONLY the root document; every other path falls
  # through to the behaviors below or to the CachingDisabled default. Same 6-day policy as
  # /stocks/* and /etfs/*.
  ordered_cache_behavior {
    path_pattern           = "/"
    target_origin_id       = local.vercel_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = local.all_viewer_methods
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id          = aws_cloudfront_cache_policy.koalagains_one_week.id
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

    dynamic "function_association" {
      for_each = var.enable_www_redirect ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.www_redirect[0].arn
      }
    }
  }

  # Admin-only stock "create" page (/stocks/[exchange]/[ticker]/create) must NOT be edge-cached.
  # This more-specific pattern is ordered BEFORE /stocks/* so CloudFront's first-match rule routes
  # it to Managed-CachingDisabled — otherwise the cookie-stripping 6-day policy would cache the
  # admin shell publicly. `*` spans the exchange + ticker segments.
  ordered_cache_behavior {
    path_pattern           = "/stocks/*/create"
    target_origin_id       = local.vercel_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = local.all_viewer_methods
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Managed-CachingDisabled — never cache the admin create page at the edge.
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

    dynamic "function_association" {
      for_each = var.enable_www_redirect ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.www_redirect[0].arn
      }
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/stocks/*"
    target_origin_id       = local.vercel_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = local.all_viewer_methods
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id          = aws_cloudfront_cache_policy.koalagains_one_week.id
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

    dynamic "function_association" {
      for_each = var.enable_www_redirect ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.www_redirect[0].arn
      }
    }
  }

  # Admin-only ETF "financial-data" subpage (/etfs/[exchange]/[etf]/financial-data) must NOT be
  # edge-cached. Ordered BEFORE /etfs/* so first-match routes it to Managed-CachingDisabled. Same
  # rationale as /stocks/*/create above; `*` spans the exchange + etf segments.
  ordered_cache_behavior {
    path_pattern           = "/etfs/*/financial-data"
    target_origin_id       = local.vercel_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = local.all_viewer_methods
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    # Managed-CachingDisabled — never cache the admin financial-data page at the edge.
    cache_policy_id          = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad"
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

    dynamic "function_association" {
      for_each = var.enable_www_redirect ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.www_redirect[0].arn
      }
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/etfs/*"
    target_origin_id       = local.vercel_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = local.all_viewer_methods
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id          = aws_cloudfront_cache_policy.koalagains_one_week.id
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

    dynamic "function_association" {
      for_each = var.enable_www_redirect ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.www_redirect[0].arn
      }
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/industry-tariff-report/*"
    target_origin_id       = local.vercel_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = local.all_viewer_methods
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id          = aws_cloudfront_cache_policy.koalagains_one_week.id
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

    dynamic "function_association" {
      for_each = var.enable_www_redirect ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.www_redirect[0].arn
      }
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/tariff-reports*"
    target_origin_id       = local.vercel_origin_id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = local.all_viewer_methods
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    cache_policy_id          = aws_cloudfront_cache_policy.koalagains_one_week.id
    origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

    dynamic "function_association" {
      for_each = var.enable_www_redirect ? [1] : []
      content {
        event_type   = "viewer-request"
        function_arn = aws_cloudfront_function.www_redirect[0].arn
      }
    }
  }

  # Per-stocks-page and per-ETF-page API endpoints. One behavior per path pattern (rather than a
  # broad /api/.../tickers-v1/* or /api/.../etfs-v1/* match) because admin-protected GETs live
  # under the same prefixes — see the comments on `local.stocks_api_cached_paths` and
  # `local.etfs_api_cached_paths`.
  dynamic "ordered_cache_behavior" {
    for_each = local.api_cached_paths
    content {
      path_pattern           = ordered_cache_behavior.value
      target_origin_id       = local.vercel_origin_id
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = local.all_viewer_methods
      cached_methods         = ["GET", "HEAD"]
      compress               = true

      cache_policy_id          = aws_cloudfront_cache_policy.koalagains_one_week.id
      origin_request_policy_id = "216adef6-5c7f-47e4-b989-5492eafa07d3"

      dynamic "function_association" {
        for_each = var.enable_www_redirect ? [1] : []
        content {
          event_type   = "viewer-request"
          function_arn = aws_cloudfront_function.www_redirect[0].arn
        }
      }
    }
  }

  # Never pin a transient origin error at the edge. Without these blocks CloudFront's default
  # Error Caching Minimum TTL (~10s) applies; more importantly, if Lightsail/the origin ever
  # stamps a long Cache-Control on an error, CloudFront would honor it. error_caching_min_ttl = 0
  # forces the floor to zero so a genuine 4xx/5xx (origin/container down, gateway error, or an API
  # route's real 404/500 from withErrorHandlingV2) is re-fetched on the next request instead of
  # being served stale for the 6-day koalagains_one_week TTL. response_code/response_page_path are
  # omitted so CloudFront relays the origin's own status + body.
  # NOTE: this does NOT cover a 200-status "soft" error/not-found page (force-dynamic + Suspense
  # streaming flush a 200 shell before notFound()/throw resolves). Those are 2xx to CloudFront and
  # are force-cached by the 6-day policy regardless of their no-store header — see the runbook in
  # docs/insights-ui/cloudfront-deploy-skew.md.
  custom_error_response {
    error_code            = 404
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 500
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 502
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 503
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 504
    error_caching_min_ttl = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.koalagains.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = {
    Project     = "koalagains"
    Environment = local.koalagains_environment_tag
  }
}

# A/AAAA aliases for every non-www alias. www is excluded because DNS forbids
# A/AAAA + CNAME at the same name, and the existing www record is a CNAME we
# want to take over in-place via aws_route53_record.koalagains_www_cname below.
resource "aws_route53_record" "koalagains_alias_a" {
  for_each = toset([for a in var.cloudfront_aliases : a if !startswith(a, "www.")])

  zone_id         = data.aws_route53_zone.main.zone_id
  name            = each.value
  type            = "A"
  allow_overwrite = true

  alias {
    name                   = aws_cloudfront_distribution.koalagains.domain_name
    zone_id                = aws_cloudfront_distribution.koalagains.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "koalagains_alias_aaaa" {
  for_each = toset([for a in var.cloudfront_aliases : a if !startswith(a, "www.")])

  zone_id         = data.aws_route53_zone.main.zone_id
  name            = each.value
  type            = "AAAA"
  allow_overwrite = true

  alias {
    name                   = aws_cloudfront_distribution.koalagains.domain_name
    zone_id                = aws_cloudfront_distribution.koalagains.hosted_zone_id
    evaluate_target_health = false
  }
}

# www stays as a CNAME pointing at the distribution. allow_overwrite lets Terraform take
# ownership of the existing CNAME (originally cname.vercel-dns.com) and replace its value
# in a single apply.
resource "aws_route53_record" "koalagains_www_cname" {
  count = var.enable_www_redirect ? 1 : 0

  zone_id         = data.aws_route53_zone.main.zone_id
  name            = local.koalagains_www
  type            = "CNAME"
  ttl             = 300
  records         = [aws_cloudfront_distribution.koalagains.domain_name]
  allow_overwrite = true
}

# IAM — CloudFront invalidation rights for the IAM user whose access keys back the
# (legacy Vercel) insights-ui app. The user runs CreateInvalidation from cron/save flows to
# purge edge cache alongside Next.js revalidateTag. The user itself is created out-of-band
# (referenced as a data source). After the AWS cut-over the Lightsail app uses its own
# KOALA_AWS_* identity; this attachment is preserved verbatim from dodao-api-v2-deployment
# during the migration and can be retired in a follow-up once nothing still uses it.
data "aws_iam_user" "insights_ui_vercel_project" {
  user_name = "insights-ui-vercel-project"
}

resource "aws_iam_user_policy_attachment" "insights_ui_vercel_project_policy_attach" {
  user       = data.aws_iam_user.insights_ui_vercel_project.user_name
  policy_arn = aws_iam_policy.insights_ui_project_policy.arn
}

resource "aws_iam_policy" "insights_ui_project_policy" {
  name        = "insights-ui-project-policy"
  description = "Permissions used by the insights-ui Vercel application (koalagains.com). Currently grants CloudFront invalidation rights on the koalagains distribution so runtime save flows can purge the edge cache alongside Next.js revalidateTag calls."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "CloudFrontInvalidateKoalagainsDistribution"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations",
        ]
        Resource = aws_cloudfront_distribution.koalagains.arn
      },
    ]
  })

  tags = {
    Project     = "koalagains"
    Environment = local.koalagains_environment_tag
  }
}
