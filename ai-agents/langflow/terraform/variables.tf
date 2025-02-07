###############################################################################
# terraform/variables.tf
###############################################################################

variable "aws_region" {
  type    = string
  default = "us-east-1"
  description = "AWS region to deploy into."
}

variable "lightsail_service_name" {
  type    = string
  default = "langflow-lightsail"
  description = "Name of your AWS Lightsail Container Service."
}

variable "postgres_url" {
  type    = string
  default = "postgresql://user:password@host:5432/dbname"
  description = "URL for your existing Postgres database."
}

variable "langflow_superuser" {
  type    = string
  default = "admin"
  description = "Username for Langflow superuser."
}

variable "langflow_superuser_password" {
  type      = string
  default   = "securepassword"
  sensitive = true
  description = "Password for Langflow superuser."
}

variable "langflow_secret_key" {
  type      = string
  default   = "replace_with_generated_key"
  sensitive = true
  description = "Secret key used by Langflow to encrypt sensitive data."
}
