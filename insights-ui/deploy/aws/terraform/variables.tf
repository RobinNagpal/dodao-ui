variable "aws_region" {
  description = "AWS region for the app (ECS/RDS/ALB)."
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Deployment environment name."
  type        = string
  default     = "production"
}

variable "name_prefix" {
  description = "Prefix for resource names."
  type        = string
  default     = "insights-ui"
}

variable "domain_name" {
  description = "Public domain served by CloudFront."
  type        = string
  default     = "koalagains.com"
}

# ---- Image / deploy ----------------------------------------------------------------------
variable "image_tag" {
  description = "ECR image tag (git SHA) to deploy."
  type        = string
}

# ---- Networking --------------------------------------------------------------------------
variable "vpc_cidr" {
  description = "CIDR block for the VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "az_count" {
  description = "Number of AZs to span."
  type        = number
  default     = 2
}

variable "single_nat_gateway" {
  description = "Use a single NAT gateway (cheaper) instead of one per AZ."
  type        = bool
  default     = true
}

# ---- ECS sizing --------------------------------------------------------------------------
variable "task_cpu" {
  description = "Fargate task CPU units (256 = 0.25 vCPU)."
  type        = number
  default     = 1024
}

variable "task_memory" {
  description = "Fargate task memory (MiB)."
  type        = number
  default     = 2048
}

variable "desired_count" {
  description = "Baseline number of ECS tasks."
  type        = number
  default     = 2
}

variable "min_capacity" {
  description = "Autoscaling minimum task count."
  type        = number
  default     = 2
}

variable "max_capacity" {
  description = "Autoscaling maximum task count."
  type        = number
  default     = 6
}

# ---- RDS ---------------------------------------------------------------------------------
variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.small"
}

variable "db_allocated_storage" {
  description = "RDS allocated storage (GiB)."
  type        = number
  default     = 50
}

variable "db_multi_az" {
  description = "Enable Multi-AZ for RDS."
  type        = bool
  default     = true
}

variable "db_name" {
  description = "Initial database name."
  type        = string
  default     = "insights_ui_db"
}

variable "db_username" {
  description = "RDS master username."
  type        = string
  default     = "insights_admin"
}

# ---- CloudFront --------------------------------------------------------------------------
variable "existing_cloudfront_distribution_id" {
  description = "Existing CloudFront distribution to import & reuse (EZI5H8FKNE9R1). Empty = create new."
  type        = string
  default     = "EZI5H8FKNE9R1"
}

variable "cacheable_path_patterns" {
  description = "Path prefixes served with the long-TTL cache behavior."
  type        = list(string)
  default = [
    "/stocks/*",
    "/etfs/*",
    "/industry-tariff-report/*",
    "/tariff-reports*",
  ]
}

variable "cloudfront_default_ttl" {
  description = "Default TTL (seconds) for cacheable behaviors. 6 days, matching current setup."
  type        = number
  default     = 518400
}

# ---- Cron / automation -------------------------------------------------------------------
variable "automation_secret_name" {
  description = "Secrets Manager name holding AUTOMATION_SECRET used to authorize cron endpoints."
  type        = string
  default     = "insights-ui/automation-secret"
}

# ---- App secrets -------------------------------------------------------------------------
# The Secrets Manager secret CONTAINER is managed here (secrets.tf); the secret VALUE is
# written out-of-band (CI/console). This is the ARN the task definition references.
variable "app_secrets_name" {
  description = "Secrets Manager name holding the app's runtime env JSON."
  type        = string
  default     = "insights-ui/app-env"
}
