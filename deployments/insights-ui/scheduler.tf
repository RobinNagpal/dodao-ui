# Replacement for the 4 Vercel crons. The invoker Lambda is always created; the SCHEDULES are
# gated by enable_crons (default true — AWS owns the crons in Phase A and they are removed from
# vercel.json, so there's a single owner against the shared RDS). Set enable_crons=false only if
# you intentionally hand cron ownership back to Vercel during coexistence. See the plan.

locals {
  # Crons target the Lightsail direct host (not the apex) so they bypass CloudFront — no edge
  # cache value for these and one less hop. Matches behavior since Phase A.
  cron_base_url = "https://${var.direct_domain_name}"

  # Every entry carries an explicit `timezone` so the map stays a uniform object
  # type. Existing crons keep UTC (unchanged behavior); the nightly auto-generation
  # cron uses America/New_York so its ET window tracks EST/EDT automatically.
  crons = {
    ticker_request = {
      path     = "/api/koala_gains/tickers-v1/generate-ticker-v1-request"
      schedule = "rate(3 minutes)"
      timezone = "UTC"
    }
    daily_top_gainers = {
      path     = "/api/koala_gains/tickers-v1/generate-daily-top-gainers"
      schedule = "cron(0 23 ? * MON-FRI *)"
      timezone = "UTC"
    }
    daily_top_losers = {
      path     = "/api/koala_gains/tickers-v1/generate-daily-top-losers"
      schedule = "cron(0 23 ? * MON-FRI *)"
      timezone = "UTC"
    }
    etf_request = {
      path     = "/api/koala_gains/etfs-v1/generate-etf-v1-request"
      schedule = "rate(3 minutes)"
      timezone = "UTC"
    }
    # Nightly Claude-usage-gated stock report auto-generation. Runs only in the
    # off-hours window (the code does NOT re-check the time — the schedule owns it).
    # Every 15 min at 22:00–23:45 and 00:00–02:45 ET (last fire 2:45 AM), so the
    # final batch finishes before ~3:30 AM. The endpoint checks the Claude usage
    # gates and only creates a batch when none is in progress.
    enqueue_auto_stock = {
      path     = "/api/koala_gains/tickers-v1/enqueue-auto-stock-generation"
      schedule = "cron(0/15 22-23,0-2 * * ? *)"
      timezone = "America/New_York"
    }
    # Nightly Claude-usage-gated ETF report auto-generation. Same off-hours window
    # and gates as the stock job, but selects ETFs missing their reports (US first,
    # then Canada, then other). Offset by 7 min from the stock batch so the two
    # don't fan out to Claude at the exact same minute (they share the usage budget).
    enqueue_auto_etf = {
      path     = "/api/koala_gains/etfs-v1/enqueue-auto-etf-generation"
      schedule = "cron(7/15 22-23,0-2 * * ? *)"
      timezone = "America/New_York"
    }
  }
}

# The cron endpoints are GET handlers (matching how Vercel crons invoked them). They are
# currently unauthenticated — see the plan §7 for the optional AUTOMATION_SECRET hardening.
data "archive_file" "cron_invoker" {
  type        = "zip"
  output_path = "${path.module}/.build/cron-invoker.zip"

  source {
    filename = "index.js"
    content  = <<-JS
      // CommonJS handler (matches handler="index.handler"); Node 22 has global fetch.
      exports.handler = async (event) => {
        const url = process.env.BASE_URL + event.path;
        const r = await fetch(url, { method: "GET" });
        if (!r.ok) throw new Error(`cron $${event.path} -> $${r.status}`);
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
  timeout          = 120

  environment {
    variables = {
      BASE_URL = local.cron_base_url
    }
  }
}

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
  for_each = var.enable_crons ? local.crons : {}
  name     = "${var.name_prefix}-${each.key}"

  flexible_time_window {
    mode = "OFF"
  }

  schedule_expression          = each.value.schedule
  schedule_expression_timezone = each.value.timezone

  target {
    arn      = aws_lambda_function.cron_invoker.arn
    role_arn = aws_iam_role.scheduler.arn
    input    = jsonencode({ path = each.value.path })

    retry_policy {
      maximum_retry_attempts = 2
    }
  }
}
