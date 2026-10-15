output "site_url" {
  description = "Where the site is served."
  value       = "https://${var.domain_name}"
}

output "web_bucket" {
  description = "S3 bucket for the static export — set as the DODAO_HOME_S3_BUCKET GitHub Actions variable."
  value       = aws_s3_bucket.web.bucket
}

output "cloudfront_distribution_id" {
  description = "Set as the DODAO_HOME_CLOUDFRONT_DISTRIBUTION_ID GitHub Actions variable."
  value       = aws_cloudfront_distribution.web.id
}

output "cloudfront_domain_name" {
  description = "The distribution's *.cloudfront.net hostname (useful for testing before DNS propagates)."
  value       = aws_cloudfront_distribution.web.domain_name
}

output "deployer_access_key_id" {
  description = "Set as the DODAO_HOME_AWS_ACCESS_KEY_ID GitHub Actions secret."
  value       = var.create_deployer_access_key ? aws_iam_access_key.deployer[0].id : null
}

output "deployer_secret_access_key" {
  description = "Set as the DODAO_HOME_AWS_SECRET_ACCESS_KEY GitHub Actions secret."
  value       = var.create_deployer_access_key ? aws_iam_access_key.deployer[0].secret : null
  sensitive   = true
}
