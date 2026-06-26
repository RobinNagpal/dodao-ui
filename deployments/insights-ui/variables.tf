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

# ---- Rollout gates ----------------------------------------------------------------------
# enable_crons defaults ON: AWS owns the crons (removed from vercel.json), so there is a single
# owner against the shared RDS.
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
  description = "Lightsail container service power. large = 2 vCPU / 8 GB (extra Puppeteer + SSR headroom)."
  type        = string
  default     = "large"
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

# ---- CloudFront -------------------------------------------------------------------------
# Cache behavior path patterns live in cloudfront.tf locals (stocks_api_cached_paths,
# etfs_api_cached_paths) — keep them in lockstep with CACHED_PATH_PREFIXES in
# src/utils/cloudfront-cache-utils.ts. TTL is hardcoded at 518400s (6 days) in the
# aws_cloudfront_cache_policy.koalagains_one_week resource.
variable "aws_origin_hostname" {
  description = "Hostname CloudFront uses as the origin. The Lightsail container service direct host (var.direct_domain_name) — kept as a distinct variable so a rollback to a different origin is a one-line change."
  type        = string
  default     = "prod.koalagains.com"
}

variable "cloudfront_aliases" {
  description = "CloudFront distribution aliases. First entry is the canonical (ACM primary domain + www-redirect target). Default matches production (apex + www)."
  type        = list(string)
  default     = ["koalagains.com", "www.koalagains.com"]
}

variable "enable_www_redirect" {
  description = "Attach a CloudFront viewer function that 301-redirects www.<canonical> -> <canonical>, and own the www CNAME record. On in production."
  type        = bool
  default     = true
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
  description = "CloudWatch Logs retention — logs older than this are auto-deleted. Valid CW values: 1,3,5,7,14,30,...; we keep just 3 days."
  type        = number
  default     = 3
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
# NEXTAUTH_URL points at the public apex now that CloudFront fronts Lightsail. The viewer Host
# header arrives as koalagains.com (CloudFront's AllViewer policy forwards it), so NextAuth's
# OAuth redirect_uri must use the same host. Direct hits to prod.koalagains.com still work —
# OAuth redirects just land users on koalagains.com (cookies are scoped to .koalagains.com).
variable "app_env" {
  description = "Non-secret runtime env injected into the Lightsail deployment."
  type        = map(string)
  default = {
    NODE_ENV                  = "production"
    PORT                      = "3000"
    NEXTAUTH_URL              = "https://koalagains.com"
    COOKIE_DOMAIN             = ".koalagains.com"
    PUPPETEER_EXECUTABLE_PATH = "/usr/bin/chromium"
    # Vercel-named host vars the code reads. VERCEL_ENV gates auth-cookie security.
    VERCEL_ENV = "production"
    # So AWS cron/save writes invalidate the SAME CloudFront that fronts Vercel today — without
    # this, koalagains.com users see stale content for up to the 6-day TTL after each cron run.
    CLOUDFRONT_DISTRIBUTION_ID = "EZI5H8FKNE9R1"
    # Lambda report-generation callbacks should return to this AWS host in Phase A.
    REPORT_GENERATION_CALLBACK_BASE_URL = "https://prod.koalagains.com"
    # "true" runs stock report generation in-process in the background on this
    # Lightsail server (no AWS Lambda hop, no CloudFront-origin timeout); the LLM
    # call is detached and saves directly. unset/"false" keeps offloading to the
    # llm-call-with-callback Lambda. See src/utils/analysis-reports/llm-callback-lambda-utils.ts.
    USE_LAMBDA_FOR_LLM_RESPONSE = "true"
    # The app's pino→CloudWatch transport ships structured JSON logs here (§17).
    CLOUDWATCH_LOG_GROUP = "/insights-ui/app"
    AWS_REGION_LOGS      = "us-east-1"
    # Generate tariff report sections in the BACKGROUND (fire-and-forget) instead
    # of synchronously, so multi-minute Gemini calls don't hit the CloudFront
    # origin timeout. The background task is in-process on this single Lightsail
    # container, so generate reports only while the container is NOT being
    # redeployed (a redeploy/crash mid-run drops the in-flight work).
    USE_LAMBDA_FOR_TARIFF_LLM_RESPONSE = "true"
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
