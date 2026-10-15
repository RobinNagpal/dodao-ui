# tidbitshub.org's Route 53 zone already exists (created by hand earlier; it holds the Google
# Workspace MX, the site-verification TXT, DMARC and the three SES Easy DKIM CNAMEs). The domain is
# still delegated to Vercel DNS (ns1/ns2.vercel-dns.com), so this zone answers nobody until the
# registrar's nameservers are switched to the ones in the `tidbitshub_name_servers` output.
# This stack only adds the web records and CAA; the mail records stay as they are, unmanaged.
data "aws_route53_zone" "tidbitshub" {
  name         = var.tidbitshub_domain
  private_zone = false
}

# Apex, www and every <space> subdomain go to the shared host. Caddy serves the apex, redirects
# www to it, and obtains a certificate for each <space> name on its first visit (on-demand TLS).
resource "aws_route53_record" "tidbitshub" {
  for_each = toset(["", "www.", "*."])

  zone_id = data.aws_route53_zone.tidbitshub.zone_id
  name    = "${each.key}${var.tidbitshub_domain}"
  type    = "A"
  ttl     = 300
  records = [local.static_ip]
}

# Caddy's issuers: Let's Encrypt, falling back to ZeroSSL (whose certificates Sectigo issues).
# CAA is inherited by every subdomain, wildcard included.
resource "aws_route53_record" "tidbitshub_caa" {
  zone_id = data.aws_route53_zone.tidbitshub.zone_id
  name    = var.tidbitshub_domain
  type    = "CAA"
  ttl     = 3600
  records = [
    "0 issue \"letsencrypt.org\"",
    "0 issue \"sectigo.com\"",
  ]
}
