# Static assets bucket. The app's next.config sets `assetPrefix` to this bucket's URL, so the
# browser loads /_next/static/* directly from S3 — works WITHOUT CloudFront (Phase A) and keeps
# working once CloudFront fronts the app (Phase B). CI uploads each build's assets here WITHOUT
# deleting prior builds (hashed names never collide → deploy-skew safety).
#
# assetPrefix value (set as a build arg in CI):
#   https://<name_prefix>-static-assets.s3.<region>.amazonaws.com

resource "aws_s3_bucket" "assets" {
  bucket = "${var.name_prefix}-static-assets"
}

# Public read (the bucket is a public asset CDN origin). Block ACLs but allow the bucket policy.
resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = false
  restrict_public_buckets = false
}

# Only /_next/static/* is served from S3 (via assetPrefix). Files in /public are served by the
# Next server at the site root — assetPrefix does NOT rewrite them — so they don't belong here.
data "aws_iam_policy_document" "assets_public_read" {
  statement {
    sid       = "PublicReadStatic"
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.assets.arn}/_next/static/*"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_policy" "assets" {
  bucket     = aws_s3_bucket.assets.id
  policy     = data.aws_iam_policy_document.assets_public_read.json
  depends_on = [aws_s3_bucket_public_access_block.assets]
}

# Allow cross-origin asset loads (the app is on prod.koalagains.com / koalagains.com, assets on S3).
resource "aws_s3_bucket_cors_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  cors_rule {
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["https://${var.direct_domain_name}", "https://${var.domain_name}", "https://www.${var.domain_name}"]
    allowed_headers = ["*"]
    max_age_seconds = 86400
  }
}

# Retain old build assets long enough for any cached HTML to keep resolving its chunks.
resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    id     = "expire-old-build-assets"
    status = "Enabled"
    # Empty filter = apply to every object (the bucket holds only /_next/static build assets).
    # Required by the provider; without it the rule emits a deprecation warning that becomes a
    # hard error in a future AWS provider version.
    filter {}
    # Comfortably exceed the 6-day CloudFront HTML TTL + deploy cadence (object age based, so
    # leave wide margin). There is no Vercel-Skew-Protection equivalent — chunk retention is the
    # only safeguard against a cached page referencing an expired chunk.
    expiration {
      days = 30
    }
  }
}
