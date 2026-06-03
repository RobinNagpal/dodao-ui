# §17 — Public log viewer using CloudWatch (NO extra Lightsail/EC2 instance).
#
# The app ships structured JSON logs (with a `level` field) to a CloudWatch Log Group; a
# CloudWatch Dashboard with a Logs Insights widget + a `level` dropdown variable renders them.
# The dashboard is then shared PUBLICLY (no login) — see note at the bottom (one console step;
# AWS has no Terraform resource for the public-share toggle yet).

locals {
  obs_count = var.enable_observability ? 1 : 0
}

resource "aws_cloudwatch_log_group" "app" {
  count             = local.obs_count
  name              = var.log_group_name
  retention_in_days = var.log_retention_days
}

# IAM policy granting the app's IAM user (the KOALA_AWS_* identity) permission to ship logs.
# Attach it to that user (var.app_iam_user_name) or out-of-band via the output ARN.
resource "aws_iam_policy" "app_logging" {
  count = local.obs_count
  name  = "${var.name_prefix}-app-logging"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["logs:CreateLogStream", "logs:PutLogEvents", "logs:DescribeLogStreams"]
      Resource = ["${aws_cloudwatch_log_group.app[0].arn}:*"]
    }]
  })
}

resource "aws_iam_user_policy_attachment" "app_logging" {
  count      = var.enable_observability && var.app_iam_user_name != "" ? 1 : 0
  user       = var.app_iam_user_name
  policy_arn = aws_iam_policy.app_logging[0].arn
}

# Public log dashboard: a Logs Insights table filtered by the `level` dropdown variable, plus a
# stacked count-by-level bar. The `LEVEL_PLACEHOLDER` token is replaced by the selected value.
resource "aws_cloudwatch_dashboard" "logs" {
  count          = local.obs_count
  dashboard_name = var.log_dashboard_name

  dashboard_body = jsonencode({
    variables = [{
      type         = "pattern"
      pattern      = "LEVEL_PLACEHOLDER"
      id           = "level"
      label        = "Level"
      inputType    = "select"
      defaultValue = "error"
      values = [
        { label = "error", value = "error" },
        { label = "warn", value = "warn" },
        { label = "info", value = "info" },
        { label = "debug", value = "debug" },
      ]
    }]
    widgets = [
      {
        type = "log", x = 0, y = 0, width = 24, height = 6
        properties = {
          region = var.aws_region
          title  = "Count by level (LEVEL_PLACEHOLDER)"
          view   = "bar"
          query  = "SOURCE '${var.log_group_name}' | filter level = \"LEVEL_PLACEHOLDER\" | stats count(*) by bin(5m)"
        }
      },
      {
        type = "log", x = 0, y = 6, width = 24, height = 18
        properties = {
          region = var.aws_region
          title  = "Logs (LEVEL_PLACEHOLDER)"
          view   = "table"
          query  = "SOURCE '${var.log_group_name}' | fields @timestamp, level, msg, @message | filter level = \"LEVEL_PLACEHOLDER\" | sort @timestamp desc | limit 200"
        }
      },
    ]
  })
}

output "log_group_name" {
  description = "CloudWatch Log Group the app ships logs to."
  value       = var.enable_observability ? aws_cloudwatch_log_group.app[0].name : null
}

output "app_logging_policy_arn" {
  description = "Attach this to the app's IAM user (KOALA_AWS_*) so it can PutLogEvents."
  value       = var.enable_observability ? aws_iam_policy.app_logging[0].arn : null
}

# ---------------------------------------------------------------------------------------------
# PUBLIC SHARING (one-time, manual — no Terraform resource exists for it):
#   CloudWatch console → Dashboards → "${var.log_dashboard_name}" → Actions → Share dashboard →
#   "Share publicly" → confirm. You get a public URL anyone can open with NO login.
#   (Programmatic alternative: the `cloudwatch` dashboard-sharing API / a small bootstrap script.)
# Security: a public dashboard exposes whatever the widget queries return — keep the queries
# scoped to this log group, scrub PII/secrets at the log layer, and keep retention short.
# ---------------------------------------------------------------------------------------------
