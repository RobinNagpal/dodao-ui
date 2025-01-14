variable "key_pair_name" {
  description = "Name of the SSH key pair for Lightsail instance"
}

variable "project_name" {
  description = "Name of the project"
  default     = "ai-agent-instance"
}

variable "blueprint_id" {
  description = "Lightsail blueprint ID (e.g., ubuntu_22_04)"
  default     = "ubuntu_22_04"
}

variable "bundle_id" {
  description = "Lightsail plan bundle ID (e.g., nano_2_0 for $5/month plan)"
  default     = "nano_2_0"
}

variable "availability_zone" {
  description = "AWS Lightsail availability zone"
  default     = "us-east-1a"
}
