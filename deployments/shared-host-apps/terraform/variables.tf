variable "aws_region" {
  description = "Region for the provider and the state buckets. Route 53 itself is global."
  type        = string
  default     = "us-east-1"
}

variable "shared_host_state_bucket" {
  description = <<-EOT
    S3 bucket holding the shared Lightsail host's Terraform state (courtpot's
    deployment/terraform/shared-host stack): shared-host-tfstate-<account-id>. Read-only — this
    stack only learns the static IP from it. Ignored when static_ip is set.
  EOT
  type        = string
  default     = null
}

variable "static_ip" {
  description = <<-EOT
    The shared host's static IP, to use instead of reading the shared-host state — e.g. when that
    state bucket lives in an account these credentials cannot read. Leave null to read it from
    the state, which keeps the records right if the address ever changes.
  EOT
  type        = string
  default     = null
}

variable "koalagains_zone_name" {
  description = "Existing public hosted zone that simulations_host lives in."
  type        = string
  default     = "koalagains.com"
}

variable "simulations_host" {
  description = "Hostname of the simulations app. Must match its api_host in the shared host's apps map."
  type        = string
  default     = "simulations.koalagains.com"
}

variable "tidbitshub_domain" {
  description = "Domain served by academy-ui: apex, www (redirects to apex) and every <space> subdomain."
  type        = string
  default     = "tidbitshub.org"
}
