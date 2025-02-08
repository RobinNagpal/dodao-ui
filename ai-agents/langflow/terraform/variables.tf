###############################################################################
# terraform/variables.tf
###############################################################################

variable "aws_region" {
  type    = string
  default = "us-east-1"
  description = "AWS region to deploy into."
}

variable "postgres_url" {
  type    = string
  sensitive = true
  description = "URL for your existing Postgres database."
}

variable "langflow_superuser" {
  type    = string
  description = "Username for Langflow superuser."
}

variable "langflow_superuser_password" {
  type      = string
  sensitive = true
  description = "Password for Langflow superuser."
}

variable "langflow_secret_key" {
  type      = string
  default   = "replace_with_generated_key"
  sensitive = true
  description = "Secret key used by Langflow to encrypt sensitive data."
}
