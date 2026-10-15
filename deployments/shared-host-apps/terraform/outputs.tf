output "static_ip" {
  description = "The shared host's address every record here points at."
  value       = local.static_ip
}

output "tidbitshub_name_servers" {
  description = "Set these as tidbitshub.org's nameservers at the registrar (replacing ns1/ns2.vercel-dns.com)."
  value       = data.aws_route53_zone.tidbitshub.name_servers
}

output "records" {
  description = "Every A record this stack manages."
  value = concat(
    [aws_route53_record.simulations.fqdn],
    [for record in aws_route53_record.tidbitshub : record.fqdn],
  )
}
