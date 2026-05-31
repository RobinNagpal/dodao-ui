resource "aws_ecs_cluster" "app" {
  name = "${var.name_prefix}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/ecs/${var.name_prefix}"
  retention_in_days = 30
}

resource "aws_security_group" "ecs" {
  name        = "${var.name_prefix}-ecs"
  description = "ECS tasks — ingress only from the ALB"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_ecs_task_definition" "app" {
  family                   = var.name_prefix
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.task_cpu
  memory                   = var.task_memory
  execution_role_arn       = aws_iam_role.task_execution.arn
  task_role_arn            = aws_iam_role.task.arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"
      essential = true

      portMappings = [{ containerPort = 3000, protocol = "tcp" }]

      # Non-secret env. NEXT_PUBLIC_* are baked at build time, not here.
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3000" },
        { name = "AWS_REGION", value = var.aws_region },
        { name = "PUPPETEER_EXECUTABLE_PATH", value = "/usr/bin/chromium" },
      ]

      # Secrets pulled from Secrets Manager. Each maps a JSON key from the app_env secret.
      secrets = [
        { name = "DATABASE_URL", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:DATABASE_URL::" },
        { name = "NEXTAUTH_URL", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:NEXTAUTH_URL::" },
        { name = "NEXTAUTH_SECRET", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:NEXTAUTH_SECRET::" },
        { name = "DODAO_AUTH_SECRET", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:DODAO_AUTH_SECRET::" },
        { name = "EMAIL_TOKEN_SECRET", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:EMAIL_TOKEN_SECRET::" },
        { name = "COOKIE_DOMAIN", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:COOKIE_DOMAIN::" },
        { name = "GOOGLE_CLIENT_ID", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:GOOGLE_CLIENT_ID::" },
        { name = "GOOGLE_CLIENT_SECRET", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:GOOGLE_CLIENT_SECRET::" },
        { name = "OPENAI_API_KEY", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:OPENAI_API_KEY::" },
        { name = "GOOGLE_API_KEY", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:GOOGLE_API_KEY::" },
        { name = "POLYGON_API_KEY", valueFrom = "${aws_secretsmanager_secret.app_env.arn}:POLYGON_API_KEY::" },
        { name = "AUTOMATION_SECRET", valueFrom = "${aws_secretsmanager_secret.automation.arn}:::" },
        # …add remaining keys (DISCORD_*, TWITTER_*, *_LAMBDA_URL, SCREENER_API_URL, GEMINI_MODEL, LLM_PROVIDER)…
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "app"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "app" {
  name            = "${var.name_prefix}-svc"
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.ecs.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 3000
  }

  # Rolling deploy: keep old tasks until new ones are healthy (deploy-skew safety, plan §9).
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200

  health_check_grace_period_seconds = 60

  lifecycle {
    ignore_changes = [desired_count] # autoscaling owns this at runtime
  }

  depends_on = [aws_lb_listener.https]
}

# ---- Autoscaling -------------------------------------------------------------------------
resource "aws_appautoscaling_target" "ecs" {
  max_capacity       = var.max_capacity
  min_capacity       = var.min_capacity
  resource_id        = "service/${aws_ecs_cluster.app.name}/${aws_ecs_service.app.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "cpu" {
  name               = "${var.name_prefix}-cpu"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.ecs.resource_id
  scalable_dimension = aws_appautoscaling_target.ecs.scalable_dimension
  service_namespace  = aws_appautoscaling_target.ecs.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 60
    scale_in_cooldown  = 120
    scale_out_cooldown = 60
  }
}
