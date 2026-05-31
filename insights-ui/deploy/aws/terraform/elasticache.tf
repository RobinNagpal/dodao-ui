# Shared cache backing the Next.js `cacheHandler`, so `unstable_cache` / `revalidateTag` stay
# coherent across multiple Fargate tasks (plan §5.10). Omit this file ONLY if option (b) —
# dropping unstable_cache in favor of CloudFront-only caching — is chosen.

resource "aws_elasticache_subnet_group" "cache" {
  name       = "${var.name_prefix}-cache"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "cache" {
  name        = "${var.name_prefix}-cache"
  description = "ElastiCache — only reachable from ECS tasks"
  vpc_id      = module.vpc.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group_rule" "cache_from_ecs" {
  type                     = "ingress"
  from_port                = 6379
  to_port                  = 6379
  protocol                 = "tcp"
  security_group_id        = aws_security_group.cache.id
  source_security_group_id = aws_security_group.ecs.id
}

resource "aws_elasticache_replication_group" "cache" {
  replication_group_id = "${var.name_prefix}-cache"
  description          = "Next.js shared cache handler store"

  engine         = "redis"
  engine_version = "7.1"
  node_type      = var.cache_node_type
  port           = 6379

  num_cache_clusters         = var.cache_multi_az ? 2 : 1
  automatic_failover_enabled = var.cache_multi_az
  multi_az_enabled           = var.cache_multi_az

  subnet_group_name  = aws_elasticache_subnet_group.cache.name
  security_group_ids = [aws_security_group.cache.id]

  at_rest_encryption_enabled = true
  transit_encryption_enabled = false # set true + use rediss:// if TLS to cache is required
}
