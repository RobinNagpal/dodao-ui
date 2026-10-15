# simulations.koalagains.com → the shared host, where Caddy terminates TLS and proxies to the
# simulations service on 127.0.0.1:7074. No CloudFront.
#
# The zone already holds a CNAME for this name pointing at Vercel, created by hand (it is in no
# Terraform state). Route 53 does not allow an A record beside a CNAME of the same name, so this
# apply fails until that CNAME is deleted — see README.md, "Replacing the Vercel CNAME".
data "aws_route53_zone" "koalagains" {
  name         = var.koalagains_zone_name
  private_zone = false
}

resource "aws_route53_record" "simulations" {
  zone_id = data.aws_route53_zone.koalagains.zone_id
  name    = var.simulations_host
  type    = "A"
  ttl     = 300
  records = [local.static_ip]
}
