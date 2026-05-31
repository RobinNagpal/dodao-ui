output "direct_url" {
  description = "Direct-access URL (Phase A) — bypasses CloudFront."
  value       = "https://${var.direct_domain_name}"
}

output "lightsail_service_url" {
  description = "Raw Lightsail container service URL."
  value       = aws_lightsail_container_service.app.url
}

output "ecr_repository_url" {
  description = "ECR repository URL for the app image."
  value       = aws_ecr_repository.app.repository_url
}

output "static_asset_base_url" {
  description = "Base URL for static assets — set as the NEXT_PUBLIC_ASSET_PREFIX build arg."
  value       = "https://${aws_s3_bucket.assets.bucket}.s3.${var.aws_region}.amazonaws.com"
}

output "static_assets_bucket" {
  description = "S3 bucket holding /_next/static."
  value       = aws_s3_bucket.assets.bucket
}

output "cloudfront_domain" {
  description = "CloudFront domain (null until Phase B)."
  value       = var.manage_cloudfront ? aws_cloudfront_distribution.main[0].domain_name : null
}
