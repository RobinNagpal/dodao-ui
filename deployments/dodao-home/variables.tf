variable "app_name" {
  description = "Prefix for every resource name."
  type        = string
  default     = "dodao-home"
}

variable "aws_region" {
  description = "Region for the S3 bucket (CloudFront and its certificate are global / us-east-1)."
  type        = string
  default     = "us-east-1"
}

variable "domain_name" {
  description = "Apex domain. Its Route 53 hosted zone must already exist — this stack only reads it."
  type        = string
  default     = "dodao.io"
}

variable "create_deployer_access_key" {
  description = <<-EOT
    Create an access key for the CI deployer user and expose it as (sensitive)
    outputs. Set to false if you prefer to mint the key yourself in the IAM
    console; the key created here is also stored in the terraform state.
  EOT
  type        = bool
  default     = true
}
