# tidbitshub.org moves from Vercel DNS (ns1/ns2.vercel-dns.com) to this new Route 53 zone. It
# takes effect only when the registrar's nameservers are changed to the ones in the
# `tidbitshub_name_servers` output — until then this zone answers nobody.
#
# What the Vercel zone held, from dig on 2026-10-15: A records for the apex, www and a wildcard
# (every name, so mail./em./bounce. all resolve to Vercel too), and CAA at the apex
# (letsencrypt.org, pki.goog, sectigo.com). No MX, no TXT (no SPF/DMARC/verification) at the
# apex or _dmarc. DKIM CNAMEs cannot be enumerated — see var.tidbitshub_ses_dkim_tokens.
resource "aws_route53_zone" "tidbitshub" {
  name    = var.tidbitshub_domain
  comment = "academy-ui (TidbitsHub) on the shared Lightsail host. Managed by dodao-ui deployments/shared-host-apps."
}

# Apex, www and every <space> subdomain go to the shared host. Caddy serves the apex, redirects
# www to it, and obtains a certificate for each <space> name on its first visit (on-demand TLS).
resource "aws_route53_record" "tidbitshub" {
  for_each = toset(["", "www.", "*."])

  zone_id = aws_route53_zone.tidbitshub.zone_id
  name    = "${each.key}${var.tidbitshub_domain}"
  type    = "A"
  ttl     = 300
  records = [local.static_ip]
}

# Caddy's issuers: Let's Encrypt, falling back to ZeroSSL (whose certificates Sectigo issues).
# CAA is inherited by every subdomain, wildcard included.
resource "aws_route53_record" "tidbitshub_caa" {
  zone_id = aws_route53_zone.tidbitshub.zone_id
  name    = var.tidbitshub_domain
  type    = "CAA"
  ttl     = 3600
  records = [
    "0 issue \"letsencrypt.org\"",
    "0 issue \"sectigo.com\"",
  ]
}

resource "aws_route53_record" "tidbitshub_ses_dkim" {
  for_each = toset(var.tidbitshub_ses_dkim_tokens)

  zone_id = aws_route53_zone.tidbitshub.zone_id
  name    = "${each.value}._domainkey.${var.tidbitshub_domain}"
  type    = "CNAME"
  ttl     = 1800
  records = ["${each.value}.dkim.amazonses.com"]
}
