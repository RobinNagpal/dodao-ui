# Replacement for the 4 Vercel crons. EventBridge Scheduler → invoker Lambda → authenticated
# HTTPS POST to the app cron endpoints. See plan §7.

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

# --- Invoker Lambda ---
data "archive_file" "cron_invoker" {
  type        = "zip"
  output_path = "${path.module}/.build/cron-invoker.zip"

  source {
    filename = "index.mjs"
    content  = <<-JS
      export const handler = async (event) => {
        const url = process.env.BASE_URL + event.path;
        const r = await fetch(url, {
          method: "POST",
          headers: { "Authorization": process.env.AUTOMATION_SECRET, "Content-Type": "application/json" },
        });
        if (!r.ok) throw new Error(`cron ${event.path} -> ${r.status}`);
        return { status: r.status };
      };
    JS
  }
}

data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "cron_invoker" {
  name               = "${var.name_prefix}-cron-invoker"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume.json
}

resource "aws_iam_role_policy_attachment" "cron_invoker_logs" {
  role       = aws_iam_role.cron_invoker.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
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
      BASE_URL = local.cron_base_url
      # The cron endpoints validate this. Sourced from app_secrets (same value as the app).
      AUTOMATION_SECRET = lookup(var.app_secrets, "AUTOMATION_SECRET", "")
    }
  }
}

# --- EventBridge Scheduler ---
data "aws_iam_policy_document" "scheduler_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["scheduler.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "scheduler" {
  name               = "${var.name_prefix}-scheduler"
  assume_role_policy = data.aws_iam_policy_document.scheduler_assume.json
}

data "aws_iam_policy_document" "scheduler_invoke" {
  statement {
    actions   = ["lambda:InvokeFunction"]
    resources = [aws_lambda_function.cron_invoker.arn]
  }
}

resource "aws_iam_role_policy" "scheduler_invoke" {
  name   = "${var.name_prefix}-scheduler-invoke"
  role   = aws_iam_role.scheduler.id
  policy = data.aws_iam_policy_document.scheduler_invoke.json
}

resource "aws_scheduler_schedule" "cron" {
  for_each = local.crons
  name     = "${var.name_prefix}-${each.key}"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression          = each.value.schedule
  schedule_expression_timezone = "UTC"

  target {
    arn      = aws_lambda_function.cron_invoker.arn
    role_arn = aws_iam_role.scheduler.arn
    input    = jsonencode({ path = each.value.path })

    retry_policy {
      maximum_retry_attempts = 2
    }
  }
}
