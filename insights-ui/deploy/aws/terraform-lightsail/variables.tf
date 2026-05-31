variable "aws_region" {
  description = "AWS region for the Lightsail service + ECR."
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
variable "ecr_repository_name" {
  description = "ECR repository holding the app image."
  type        = string
  default     = "insights-ui"
}

variable "image_tag" {
  description = "ECR image tag (git SHA) to deploy."
  type        = string
}

# ---- Lightsail sizing --------------------------------------------------------------------
variable "service_power" {
  description = "Lightsail container service power (nano|micro|small|medium|large|xlarge). medium = 1 vCPU / 4 GB (Puppeteer headroom)."
  type        = string
  default     = "medium"
}

variable "service_scale" {
  description = "Number of nodes. KEEP AT 1 — scale>1 breaks unstable_cache/revalidateTag coherence (see plan §5.7 / Appendix A)."
  type        = number
  default     = 1

  validation {
    condition     = var.service_scale == 1
    error_message = "scale must be 1 for the Lightsail single-node design; use the Fargate tree for horizontal scale."
  }
}

# ---- Database ----------------------------------------------------------------------------
variable "create_managed_db" {
  description = "Create a Lightsail managed Postgres. false = use an existing DB via database_url."
  type        = bool
  default     = false
}

variable "db_blueprint_id" {
  description = "Lightsail managed DB blueprint (engine version)."
  type        = string
  default     = "postgres_16"
}

variable "db_bundle_id" {
  description = "Lightsail managed DB bundle (size)."
  type        = string
  default     = "micro_2_0"
}

# ---- CloudFront --------------------------------------------------------------------------
variable "existing_cloudfront_distribution_id" {
  description = "Existing CloudFront distribution to import & reuse."
  type        = string
  default     = "EZI5H8FKNE9R1"
}

variable "cacheable_path_patterns" {
  description = "Path prefixes served with the long-TTL cache behavior."
  type        = list(string)
  default     = ["/stocks/*", "/etfs/*", "/industry-tariff-report/*", "/tariff-reports*"]
}

variable "cloudfront_default_ttl" {
  description = "Default TTL (seconds) for cacheable behaviors. 6 days."
  type        = number
  default     = 518400
}

variable "enable_static_asset_offload" {
  description = "Serve /_next/static from S3 (deploy-skew safety, plan §10)."
  type        = bool
  default     = true
}

# ---- App runtime config (NON-secret) -----------------------------------------------------
variable "app_env" {
  description = "Non-secret runtime env injected into the Lightsail deployment."
  type        = map(string)
  default = {
    NODE_ENV                  = "production"
    PORT                      = "3000"
    NEXTAUTH_URL              = "https://koalagains.com"
    COOKIE_DOMAIN             = ".koalagains.com"
    PUPPETEER_EXECUTABLE_PATH = "/usr/bin/chromium"
    # Vercel-named host vars the code reads (plan §5.6). VERCEL_ENV gates auth-cookie security.
    VERCEL_ENV = "production"
  }
}

# ---- App SECRETS (sourced from Secrets Manager by CI, passed as sensitive -vars) ----------
# Lightsail has no Secrets Manager mount; CI reads SM and passes these in. Never commit values.
variable "app_secrets" {
  description = "Secret env injected into the Lightsail deployment (DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY, OAuth, lambda URLs, AUTOMATION_SECRET, KOALA_AWS_*, …)."
  type        = map(string)
  sensitive   = true
}
