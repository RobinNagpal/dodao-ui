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
    # Single KoalaGains report-generation heartbeat. One generic clock (every 3 min)
    # drives everything: the /cron/heartbeat endpoint first enqueues any due
    # auto-generation batches, then advances the pending stock and ETF requests by
    # one step each. It replaces the separate ticker_request, etf_request, and
    # auto-generation crons. All scheduling policy — which entities
    # (AUTOMATED_GENERATION_ENTITY), the run window (AUTOMATED_GENERATION_WINDOW), and
    # how often + how much (AUTOMATED_GENERATION_MODE's cooldown + batch size) — is
    # read from App Settings, so it changes at runtime without touching this
    # schedule. Outside the window / during a cooldown the enqueue side does nothing.
    koala_gains_heartbeat = {
      path     = "/api/koala_gains/cron/heartbeat"
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
