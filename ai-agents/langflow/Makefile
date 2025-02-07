###############################################################################
# Makefile
###############################################################################
.PHONY: help init build run push deploy clean generate-key

SHELL := /bin/bash

# Default region & repository info (override via environment if desired)
REGION           ?= us-east-1
ACCOUNT_ID       := $(shell aws sts get-caller-identity --query Account --output text 2>/dev/null)
DOCKER_REGISTRY  ?= $(ACCOUNT_ID).dkr.ecr.$(REGION).amazonaws.com
IMAGE_NAME       ?= langflow
IMAGE_TAG        ?= latest

# -----------------------------------------------------------------------------
# Docker targets
# -----------------------------------------------------------------------------
docker-build:
	docker build -t $(IMAGE_NAME):$(IMAGE_TAG) .

docker-tag:
	docker tag $(IMAGE_NAME):$(IMAGE_TAG) $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

docker-push: docker-tag
	@echo "Logging in to ECR: $(DOCKER_REGISTRY)"
	aws ecr get-login-password --region $(REGION) | \
		docker login --username AWS --password-stdin $(DOCKER_REGISTRY)
	docker push $(DOCKER_REGISTRY)/$(IMAGE_NAME):$(IMAGE_TAG)

# -----------------------------------------------------------------------------
# Terraform targets
# -----------------------------------------------------------------------------
terraform-init:
	terraform init

terraform-plan:
	terraform plan -var="image_tag=$(IMAGE_TAG)"

terraform-apply:
	terraform apply -var="image_tag=$(IMAGE_TAG)" -auto-approve

terraform-destroy:
	terraform destroy -auto-approve

# -----------------------------------------------------------------------------
# Compound targets
# -----------------------------------------------------------------------------
build: docker-build

push: docker-push

deploy: docker-push terraform-apply

plan: terraform-plan




help:
	@echo "Available commands:"
	@echo "  make init        - Initialize environment (create .env file)"
	@echo "  make build       - Build Docker image"
	@echo "  make run         - Run locally with .env file"
	@echo "  make clean       - Remove local resources"
	@echo "  make generate-key - Generate new secret key"

init-local:
	@if [ ! -f docker/.env ]; then \
		cp docker/.env.example docker/.env; \
		echo "Created docker/.env from example"; \
		$(MAKE) generate-key; \
	else \
		echo "docker/.env already exists"; \
	fi

build-local:
	docker build -t langflow:local -f docker/Dockerfile .

run-local:
	@if [ ! -f docker/.env ]; then $(MAKE) init-local; fi
	docker run -it --rm \
		-p 7860:7860 \
		--env-file docker/.env \
		--name langflow-local \
		langflow:local

clean-local:
	docker rmi -f langflow:local
	rm -f docker/.env

generate-key:
	@python3 -c "from secrets import token_urlsafe; print(f'LANGFLOW_SECRET_KEY={token_urlsafe(32)}')" | tee -a docker/.env >/dev/null
	@echo "Generated new secret key in docker/.env"

# Docker Compose commands
compose-build:
	docker-compose build

compose-up:
	docker-compose up

compose-down:
	docker-compose down -v

compose-logs:
	docker-compose logs -f

# Combined commands
local-start: compose-build compose-up
	local-stop: compose-down

# Database operations
db-shell:
	docker exec -it langflow-db psql -U ${DB_USER:-admin} -d ${DB_NAME:-langflow_db}
