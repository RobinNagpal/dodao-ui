variable "aws_region" {
  description = "AWS region for the Lightsail service, ECR, and the static-assets bucket."
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

# Eventual public apex (served by CloudFront in Phase B+). Vercel serves this today.
variable "domain_name" {
  description = "Eventual public apex served by CloudFront."
  type        = string
  default     = "koalagains.com"
}

# Direct-access host for the AWS deployment, reachable WITHOUT CloudFront (Phase A). Runs in
# parallel with Vercel (which keeps serving koalagains.com via CloudFront) until cut-over.
variable "direct_domain_name" {
  description = "Subdomain pointing straight at the Lightsail service (no CloudFront)."
  type        = string
  default     = "prod.koalagains.com"
}

# ---- Rollout gates — both default OFF so Phase A is just the parallel, direct deployment ----
variable "manage_cloudfront" {
  description = "Phase B: manage CloudFront and point it at the Lightsail service. Keep false while running in parallel with Vercel."
  type        = bool
  default     = false
}

variable "enable_crons" {
  description = "Create the EventBridge cron schedules. On by default — crons are owned by AWS now and removed from vercel.json, so there is a single owner (no double-run against the shared RDS)."
  type        = bool
  default     = true
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
  description = "Lightsail container service power. medium = 1 vCPU / 4 GB (Puppeteer headroom)."
  type        = string
  default     = "medium"
}

variable "service_scale" {
  description = "Number of nodes. KEEP AT 1 — scale>1 breaks unstable_cache/revalidateTag coherence."
  type        = number
  default     = 1

  validation {
    condition     = var.service_scale == 1
    error_message = "scale must be 1 for the single-node design (single coherent in-process cache)."
  }
}

# ---- Database ----------------------------------------------------------------------------
# Postgres already lives in RDS (public access + SSL). Terraform provisions nothing for it —
# pass the full DATABASE_URL (with sslmode) via app_secrets.

# ---- CloudFront (Phase B only) -----------------------------------------------------------
variable "existing_cloudfront_distribution_id" {
  description = "Existing CloudFront distribution to import & reuse in Phase B."
  type        = string
  default     = "EZI5H8FKNE9R1"
}

variable "cacheable_path_patterns" {
  description = "Path prefixes served with the long-TTL cache behavior (Phase B)."
  type        = list(string)
  # Pages AND the per-stocks-page GET API endpoints the existing distribution caches
  # (deploy-skew doc Phase 5). Keep in lockstep with CACHED_PATH_PREFIXES in
  # src/utils/cloudfront-cache-utils.ts so the import reconcile doesn't drop live behaviors.
  default = [
    "/stocks/*",
    "/etfs/*",
    "/industry-tariff-report/*",
    "/tariff-reports*",
    "/api/koala_gains/tickers-v1/exchange/*",
    "/api/koala_gains/tickers-v1/country/*",
  ]
}

variable "cloudfront_default_ttl" {
  description = "Default TTL (seconds) for cacheable behaviors. 6 days."
  type        = number
  default     = 518400
}

# ---- Observability (public CloudWatch dashboard, §17 — no extra instance) ------------------
variable "enable_observability" {
  description = "Create the CloudWatch log group + public log dashboard."
  type        = bool
  default     = true
}

variable "log_group_name" {
  description = "CloudWatch Log Group the app ships structured JSON logs to."
  type        = string
  default     = "/insights-ui/app"
}

variable "log_retention_days" {
  description = "CloudWatch Logs retention."
  type        = number
  default     = 14
}

variable "log_dashboard_name" {
  description = "Name of the CloudWatch dashboard (shared publicly via the console)."
  type        = string
  default     = "insights-ui-logs"
}

variable "app_iam_user_name" {
  description = "IAM user (the KOALA_AWS_* identity) to attach the log-shipping policy to. Empty = attach manually via the output policy ARN."
  type        = string
  default     = ""
}

# ---- App runtime config (NON-secret) -----------------------------------------------------
# NEXTAUTH_URL points at the DIRECT host during Phase A. Switch to https://koalagains.com when
# CloudFront fronts the app at cut-over (and add prod.koalagains.com to OAuth redirect URIs).
variable "app_env" {
  description = "Non-secret runtime env injected into the Lightsail deployment."
  type        = map(string)
  default = {
    NODE_ENV                  = "production"
    PORT                      = "3000"
    NEXTAUTH_URL              = "https://prod.koalagains.com"
    COOKIE_DOMAIN             = ".koalagains.com"
    PUPPETEER_EXECUTABLE_PATH = "/usr/bin/chromium"
    # Vercel-named host vars the code reads. VERCEL_ENV gates auth-cookie security.
    VERCEL_ENV = "production"
    # So AWS cron/save writes invalidate the SAME CloudFront that fronts Vercel today — without
    # this, koalagains.com users see stale content for up to the 6-day TTL after each cron run.
    CLOUDFRONT_DISTRIBUTION_ID = "EZI5H8FKNE9R1"
    # Lambda report-generation callbacks should return to this AWS host in Phase A.
    REPORT_GENERATION_CALLBACK_BASE_URL = "https://prod.koalagains.com"
    # The app's pino→CloudWatch transport ships structured JSON logs here (§17).
    CLOUDWATCH_LOG_GROUP = "/insights-ui/app"
    AWS_REGION_LOGS      = "us-east-1"
  }
}

# ---- App SECRETS (sourced from Secrets Manager by CI, passed as sensitive -vars) ----------
# Lightsail has no Secrets Manager mount; CI reads SM and passes these in. Never commit values.
# Must include DATABASE_URL (pointing at the existing public RDS, sslmode=require).
variable "app_secrets" {
  description = "Secret env injected into the deployment (DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY, OAuth, lambda URLs, AUTOMATION_SECRET, KOALA_AWS_*, …)."
  type        = map(string)
  sensitive   = true
  default     = {}
}
