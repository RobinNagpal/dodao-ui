###############################################################################
# Makefile
###############################################################################
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
