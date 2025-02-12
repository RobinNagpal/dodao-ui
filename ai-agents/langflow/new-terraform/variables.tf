variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region to deploy into."
}

variable "aws_availability_zone" {
  type        = string
  default     = "us-east-1a"
  description = "AWS availability zone for the Lightsail instance."
}

variable "instance_blueprint_id" {
  type        = string
  default     = "ubuntu_24_04"  # Adjust as needed (check available Lightsail blueprints)
  description = "Blueprint ID for the Lightsail instance."
}

variable "instance_bundle_id" {
  type        = string
  default     = "medium_3_0"      # Adjust based on performance/cost requirements
  description = "Bundle ID for the Lightsail instance."
}

variable "lightsail_key_pair" {
  type        = string
  description = "Key pair name for SSH access to the Lightsail instance (optional)."
  default     = ""  # Leave empty if not using SSH
}

variable "postgres_url" {
  type        = string
  sensitive   = true
  description = "URL for your existing Postgres database."
}

variable "langflow_superuser" {
  type        = string
  description = "Username for Langflow superuser."
}

variable "langflow_superuser_password" {
  type        = string
  sensitive   = true
  description = "Password for Langflow superuser."
}

variable "langflow_secret_key" {
  type        = string
  default     = "replace_with_generated_key"
  sensitive   = true
  description = "Secret key used by Langflow to encrypt sensitive data."
}

variable "openai_api_key" {
  type        = string
  sensitive   = true
  description = "API key for OpenAI."
}

variable "certbot_email" {
  type        = string
  description = "Email address for Let's Encrypt notifications."
  default = "robinnagpal.tiet@gmail.com"
}
