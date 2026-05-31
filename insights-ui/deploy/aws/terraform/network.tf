# VPC with public subnets (ALB + NAT) and private subnets (ECS tasks + RDS).
# Using the community VPC module keeps this concise; swap for raw aws_vpc/aws_subnet if you
# prefer to avoid the module dependency (matches ai-agents/* raw-resource style).

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  azs             = slice(data.aws_availability_zones.available.names, 0, var.az_count)
  public_subnets  = [for i in range(var.az_count) : cidrsubnet(var.vpc_cidr, 4, i)]
  private_subnets = [for i in range(var.az_count) : cidrsubnet(var.vpc_cidr, 4, i + 8)]
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.8"

  name = "${var.name_prefix}-vpc"
  cidr = var.vpc_cidr

  azs             = local.azs
  public_subnets  = local.public_subnets
  private_subnets = local.private_subnets

  enable_nat_gateway   = true
  single_nat_gateway   = var.single_nat_gateway
  enable_dns_hostnames = true
  enable_dns_support   = true
}

# VPC endpoints (optional cost lever) let ECS pull from ECR / read Secrets / reach S3 without
# routing through the NAT gateway. Enable to cut NAT data-processing cost.
# module "vpc_endpoints" {
#   source  = "terraform-aws-modules/vpc/aws//modules/vpc-endpoints"
#   version = "~> 5.8"
#   vpc_id  = module.vpc.vpc_id
#   ...
# }
