# Secret CONTAINERS only. Secret VALUES are injected out-of-band (CI or console) so they
# never land in Terraform state or git. The ECS task references these by ARN.

# App runtime env (DATABASE_URL, NEXTAUTH_SECRET, OPENAI_API_KEY, OAuth secrets, lambda URLs…)
# Stored as a JSON object; the task definition maps individual keys via `secrets` (ecs.tf).
resource "aws_secretsmanager_secret" "app_env" {
  name        = var.app_secrets_name
  description = "insights-ui runtime environment (values managed out-of-band)"
}

# AUTOMATION_SECRET that authorizes the EventBridge cron invoker against the app endpoints.
resource "aws_secretsmanager_secret" "automation" {
  name        = var.automation_secret_name
  description = "Shared secret for cron endpoint authorization"
}

# RDS master password — generated here, stored in Secrets Manager, referenced by rds.tf.
resource "random_password" "db" {
  length  = 32
  special = false
}

resource "aws_secretsmanager_secret" "db_password" {
  name        = "${var.name_prefix}/db-password"
  description = "RDS master password for insights-ui"
}

resource "aws_secretsmanager_secret_version" "db_password" {
  secret_id     = aws_secretsmanager_secret.db_password.id
  secret_string = random_password.db.result
}
