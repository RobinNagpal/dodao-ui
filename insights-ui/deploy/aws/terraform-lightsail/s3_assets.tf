# OPTIONAL static-asset offload (deploy-skew safety, plan §10). Enable with
# enable_static_asset_offload=true. CI uploads each build's /_next/static + public/ here
# WITHOUT deleting prior builds; hashed names never collide, so CloudFront-cached HTML from an
# older build keeps resolving its chunks after a new Lightsail deployment.

resource "aws_s3_bucket" "assets" {
  count  = var.enable_static_asset_offload ? 1 : 0
  bucket = "${var.name_prefix}-static-assets"
}

resource "aws_s3_bucket_public_access_block" "assets" {
  count                   = var.enable_static_asset_offload ? 1 : 0
  bucket                  = aws_s3_bucket.assets[0].id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  count  = var.enable_static_asset_offload ? 1 : 0
  bucket = aws_s3_bucket.assets[0].id

  rule {
    id     = "expire-old-build-assets"
    status = "Enabled"
    expiration {
      days = 14 # > CloudFront HTML TTL (6 days) → one window of back-compat
    }
  }
}

data "aws_iam_policy_document" "assets_oac" {
  count = var.enable_static_asset_offload ? 1 : 0
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.assets[0].arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.main.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "assets" {
  count  = var.enable_static_asset_offload ? 1 : 0
  bucket = aws_s3_bucket.assets[0].id
  policy = data.aws_iam_policy_document.assets_oac[0].json
}
