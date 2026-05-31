output "cloudfront_domain" {
  description = "CloudFront distribution domain."
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID (for invalidations)."
  value       = aws_cloudfront_distribution.main.id
}

output "alb_dns_name" {
  description = "Internal ALB DNS name (CloudFront origin)."
  value       = aws_lb.app.dns_name
}

output "ecr_repository_url" {
  description = "ECR repository URL for the app image."
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.app.name
}

output "ecs_service_name" {
  description = "ECS service name."
  value       = aws_ecs_service.app.name
}

output "rds_endpoint" {
  description = "RDS Postgres endpoint."
  value       = aws_db_instance.postgres.endpoint
}

output "static_assets_bucket" {
  description = "S3 bucket for Next.js static assets."
  value       = aws_s3_bucket.assets.bucket
}
