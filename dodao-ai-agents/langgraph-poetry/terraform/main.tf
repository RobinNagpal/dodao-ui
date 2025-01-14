provider "aws" {
  region = "us-east-1" # AWS region for deployment
}

resource "aws_lightsail_instance" "ai_agent" {
  name              = "ai-agent-instance"
  blueprint_id      = "ubuntu_22_04" # Use a valid Lightsail blueprint
  bundle_id         = "nano_2_0"    # $5 plan
  availability_zone = "us-east-1a" 
  key_pair_name     = var.key_pair_name

  user_data = <<-EOF
              #!/bin/bash
              sudo apt updatesudo
              sudo apt install -y python3-pip curl
              curl -sSL https://install.python-poetry.org | python3 -
              export PATH="$HOME/.local/bin:$PATH"
              mkdir -p /home/ubuntu/ai_agent
              cd /home/ubuntu/ai_agent
              tar -xzf /home/ubuntu/project.tar.gz
              poetry install
              poetry run python app.py
              EOF
}

resource "aws_lightsail_static_ip" "static_ip" {
  name = "ai-agent-static-ip"
}

resource "aws_lightsail_static_ip_attachment" "ip_attachment" {
  instance_name  = aws_lightsail_instance.ai_agent.name
  static_ip_name = aws_lightsail_static_ip.static_ip.name
}
