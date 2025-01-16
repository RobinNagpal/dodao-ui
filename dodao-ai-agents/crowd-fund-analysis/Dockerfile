# Use Python 3.11 slim base image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Copy Poetry files
COPY poetry.lock pyproject.toml README.md /app/

# Copy the application files, including .env
COPY cf_analysis_agent /app/cf_analysis_agent

# Install Poetry
RUN pip install poetry

# Install dependencies using Poetry
RUN poetry config virtualenvs.create false \
&& poetry install


# Expose Flask's default port
EXPOSE 5000

# Set environment variables for Flask
ENV FLASK_ENV=development

# Command to run the Flask app
CMD ["poetry", "run", "python", "cf_analysis_agent/app.py"]
