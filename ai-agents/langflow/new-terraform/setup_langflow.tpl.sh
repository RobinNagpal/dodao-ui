#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

# Create directories for scripts and logs
mkdir -p /home/ubuntu/scripts /home/ubuntu/logs
chown ubuntu:ubuntu /home/ubuntu/logs

# Create the setup script with logging
cat <<SCRIPT_EOF > /home/ubuntu/scripts/setup_langflow.sh
#!/bin/bash
set -e
export DEBIAN_FRONTEND=noninteractive

# Redirect all output to a log file with a timestamp
LOG_FILE="/home/ubuntu/logs/setup.log"
exec > >(tee -a "\$LOG_FILE") 2>&1
echo -e "\n[\$(date)] Starting Langflow setup"

# Update and install dependencies (run as root)
apt-get update -y
apt-get install -y python3 python3-pip python3-venv git nginx certbot python3-certbot-nginx

# Clone the dodao-ui repository (if not already present)
if [ ! -d "/home/ubuntu/dodao-ui" ]; then
  git clone https://github.com/RobinNagpal/dodao-ui.git /home/ubuntu/dodao-ui
fi

# Ensure required directories for Langflow flows and components exist
mkdir -p /home/ubuntu/dodao-ui/ai-agents/langflow-flows/langflow-bundles/flows
mkdir -p /home/ubuntu/dodao-ui/ai-agents/langflow-flows/langflow-bundles/components
chown -R ubuntu:ubuntu /home/ubuntu/dodao-ui

# Configure initial Nginx (HTTP only)
rm -f /etc/nginx/sites-enabled/*
cat <<NGINX_EOF > /etc/nginx/sites-available/langflow
server {
  listen 80;
  server_name ${langflow_domain};
  location / {
    proxy_pass http://127.0.0.1:7860;
    proxy_set_header Host $$host;
    proxy_set_header X-Real-IP $$remote_addr;
    proxy_set_header X-Forwarded-For $$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $$scheme;
  }
}
NGINX_EOF

ln -s /etc/nginx/sites-available/langflow /etc/nginx/sites-enabled/
systemctl restart nginx

# Obtain SSL certificate with retries
max_retries=5
retry_count=0
until [ \$retry_count -ge \$max_retries ]; do
  certbot --nginx --non-interactive --agree-tos --redirect -m ${certbot_email} -d ${langflow_domain} && break
  retry_count=$((retry_count + 1))
  sleep 60
done

# Setup Python virtual environment
python3 -m venv /home/ubuntu/langflow-env
chown -R ubuntu:ubuntu /home/ubuntu/langflow-env

# Install Langflow (run as ubuntu user)
sudo -u ubuntu bash -c "\
  source /home/ubuntu/langflow-env/bin/activate && \
  pip install --upgrade pip && \
  pip install langflow"

# Configure systemd service for Langflow
cat <<EOF_SERVICE > /etc/systemd/system/langflow.service
[Unit]
Description=Langflow Service
After=network.target

[Service]
User=ubuntu
Environment="LANGFLOW_AUTO_LOGIN=False"
Environment="LANGFLOW_SUPERUSER=${langflow_superuser}"
Environment="LANGFLOW_SUPERUSER_PASSWORD=${langflow_superuser_password}"
Environment="LANGFLOW_SECRET_KEY=${langflow_secret_key}"
Environment="LANGFLOW_DATABASE_URL=${postgres_url}"
Environment="OPENAI_API_KEY=${openai_api_key}"
Environment="LANGFLOW_LOAD_FLOWS_PATH=/home/ubuntu/dodao-ui/ai-agents/langflow-flows/langflow-bundles/flows"
Environment="LANGFLOW_COMPONENTS_PATH=/home/ubuntu/dodao-ui/ai-agents/langflow-flows/langflow-bundles/components"
ExecStart=/home/ubuntu/langflow-env/bin/langflow run --host 127.0.0.1 --port 7860
Restart=always
RestartSec=10
WorkingDirectory=/home/ubuntu

[Install]
WantedBy=multi-user.target
EOF_SERVICE

# Enable and start the Langflow service
systemctl daemon-reload
systemctl enable langflow.service
systemctl start langflow.service

echo -e "[\$(date)] Setup completed successfully"
SCRIPT_EOF

# Make the setup script executable and run it (as root)
chmod +x /home/ubuntu/scripts/setup_langflow.sh
/home/ubuntu/scripts/setup_langflow.sh
