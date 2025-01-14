output "instance_public_ip" {
  value       = aws_lightsail_static_ip.static_ip.ip_address
  description = "The public IP address of the Lightsail instance"
}

output "instance_name" {
  value       = aws_lightsail_instance.ai_agent.name
  description = "The name of the Lightsail instance"
}

output "static_ip_name" {
  value       = aws_lightsail_static_ip.static_ip.name
  description = "The name of the static IP attached to the instance"
}
