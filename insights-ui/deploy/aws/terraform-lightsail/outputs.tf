output "lightsail_service_url" {
  description = "Public URL of the Lightsail container service (CloudFront origin)."
  value       = aws_lightsail_container_service.app.url
}

output "lightsail_service_name" {
  description = "Lightsail container service name."
  value       = aws_lightsail_container_service.app.name
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain."
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for invalidations)."
  value       = aws_cloudfront_distribution.main.id
}

output "ecr_repository_url" {
  description = "ECR repository URL for the app image."
  value       = data.aws_ecr_repository.app.repository_url
}

output "static_assets_bucket" {
  description = "S3 bucket for static assets (null when offload disabled)."
  value       = var.enable_static_asset_offload ? aws_s3_bucket.assets[0].bucket : null
}

output "managed_db_endpoint" {
  description = "Lightsail managed DB endpoint (null when using an existing DB)."
  value       = var.create_managed_db ? aws_lightsail_database.app[0].master_endpoint_address : null
}
