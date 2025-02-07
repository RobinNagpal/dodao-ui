# docker/Dockerfile

FROM python:3.10-slim

# Set a working directory
WORKDIR /app

# Install Langflow
RUN pip install --no-cache-dir langflow

# Expose the default Langflow port
EXPOSE 7860

# Copy (optional) or create an entrypoint script if needed.
# For simplicity, we run langflow directly.

CMD ["python", "-m", "langflow", "run"]
