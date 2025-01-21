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
ENV GIT_COMMIT_HASH=unknown
ENV GIT_COMMIT_MESSAGE="Default commit message"

# Set build-time environment variables
ARG BUILD_GIT_COMMIT_HASH
ARG BUILD_GIT_COMMIT_MESSAGE

# Persist commit information into runtime environment
RUN echo "GIT_COMMIT_HASH=${BUILD_GIT_COMMIT_HASH}" >> /etc/environment \
    && echo "GIT_COMMIT_MESSAGE='${BUILD_GIT_COMMIT_MESSAGE}'" >> /etc/environment

# Set environment variables for Flask
ENV FLASK_ENV=development

# Command to run the Flask app
ENTRYPOINT ["poetry", "run", "python", "cf_analysis_agent/app.py"]
