# Static assets bucket. CI uploads each build's `.next/static` + `public/` here WITHOUT
# deleting prior builds (hashed filenames never collide). Old chunks stay fetchable so
# CloudFront-cached HTML from a previous build keeps resolving its assets after a new deploy
# (deploy-skew safety — plan §9). Lifecycle expires objects after the window below.

resource "aws_s3_bucket" "assets" {
  bucket = "${var.name_prefix}-static-assets"
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket                  = aws_s3_bucket.assets.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "assets" {
  bucket = aws_s3_bucket.assets.id

  rule {
    id     = "expire-old-build-assets"
    status = "Enabled"
    # 14 days > CloudFront HTML TTL (6 days), so at least one TTL window of back-compat.
    expiration {
      days = 14
    }
  }
}

# Bucket policy: allow only the CloudFront distribution (via OAC) to read objects.
data "aws_iam_policy_document" "assets_oac" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.assets.arn}/*"]
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
  bucket = aws_s3_bucket.assets.id
  policy = data.aws_iam_policy_document.assets_oac.json
}
