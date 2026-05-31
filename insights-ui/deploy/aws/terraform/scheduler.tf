# Replacement for the 4 Vercel crons (vercel.json). Each EventBridge Scheduler rule invokes a
# small Lambda that does an authenticated HTTPS POST to the corresponding app cron endpoint.
# See migration plan §7.

locals {
  cron_base_url = "https://${var.domain_name}"

  crons = {
    ticker_request = {
      path     = "/api/koala_gains/tickers-v1/generate-ticker-v1-request"
      schedule = "rate(3 minutes)"
    }
    daily_top_gainers = {
      path     = "/api/koala_gains/tickers-v1/generate-daily-top-gainers"
      schedule = "cron(0 23 ? * MON-FRI *)"
    }
    daily_top_losers = {
      path     = "/api/koala_gains/tickers-v1/generate-daily-top-losers"
      schedule = "cron(0 23 ? * MON-FRI *)"
    }
    etf_request = {
      path     = "/api/koala_gains/etfs-v1/generate-etf-v1-request"
      schedule = "rate(3 minutes)"
    }
  }
}

# Inline invoker Lambda: reads AUTOMATION_SECRET from Secrets Manager and POSTs to the path
# passed in the event payload. (Package real source under ./lambda/cron-invoker in CI.)
data "archive_file" "cron_invoker" {
  type        = "zip"
  output_path = "${path.module}/.build/cron-invoker.zip"

  source {
    filename = "index.mjs"
    content  = <<-JS
      import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
      const sm = new SecretsManagerClient({});
      let cachedSecret;
      export const handler = async (event) => {
        if (!cachedSecret) {
          const res = await sm.send(new GetSecretValueCommand({ SecretId: process.env.AUTOMATION_SECRET_ARN }));
          cachedSecret = res.SecretString;
        }
        const url = process.env.BASE_URL + event.path;
        const r = await fetch(url, {
          method: "POST",
          headers: { "Authorization": cachedSecret, "Content-Type": "application/json" },
        });
        if (!r.ok) throw new Error(`cron ${event.path} -> ${r.status}`);
        return { status: r.status };
      };
    JS
  }
}

resource "aws_lambda_function" "cron_invoker" {
  function_name    = "${var.name_prefix}-cron-invoker"
  role             = aws_iam_role.cron_invoker.arn
  runtime          = "nodejs22.x"
  handler          = "index.handler"
  filename         = data.archive_file.cron_invoker.output_path
  source_code_hash = data.archive_file.cron_invoker.output_base64sha256
  timeout          = 60

  environment {
    variables = {
      BASE_URL              = local.cron_base_url
      AUTOMATION_SECRET_ARN = aws_secretsmanager_secret.automation.arn
    }
  }
}

resource "aws_scheduler_schedule" "cron" {
  for_each = local.crons

  name = "${var.name_prefix}-${each.key}"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression          = each.value.schedule
  schedule_expression_timezone = "UTC" # match the current UTC Vercel crons

  target {
    arn      = aws_lambda_function.cron_invoker.arn
    role_arn = aws_iam_role.scheduler.arn
    input    = jsonencode({ path = each.value.path })

    retry_policy {
      maximum_retry_attempts = 2
    }
  }
}
