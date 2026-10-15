# The shared Lightsail host (Caddy + one systemd service per app) belongs to neither project; it
# is defined in github.com/RobinNagpal/courtpot under deployment/terraform/shared-host. This stack
# only points DNS at it, reading its static IP from that stack's state, read-only — never writing
# it — exactly as courtpot's own api-origin.tf does.
data "terraform_remote_state" "shared_host" {
  count   = var.static_ip == null ? 1 : 0
  backend = "s3"

  config = {
    bucket = var.shared_host_state_bucket
    key    = "shared-host/terraform.tfstate"
    region = var.aws_region
  }
}

locals {
  static_ip = var.static_ip != null ? var.static_ip : data.terraform_remote_state.shared_host[0].outputs.static_ip
}
