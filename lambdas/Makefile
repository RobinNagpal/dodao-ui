# Makefile for serverless functions

# Global variables
PYTHON = python3
PIP = pip
NPM = npm
YARN = yarn
SERVERLESS = npx serverless
CHALICE = chalice

# Colors for terminal output
GREEN = \033[0;32m
YELLOW = \033[0;33m
RED = \033[0;31m
NC = \033[0m # No Color

# Help command
.PHONY: help
help:
	@echo "$(GREEN)DoDAO Serverless Functions Makefile$(NC)"
	@echo "$(YELLOW)Usage:$(NC)"
	@echo "  make $(GREEN)<command>$(NC)"
	@echo ""
	@echo "$(YELLOW)Available commands:$(NC)"
	@echo "  $(GREEN)help$(NC)                      Show this help message"
	@echo ""
	@echo "$(YELLOW)Python (Chalice) Functions:$(NC)"
	@echo "  $(GREEN)setup-pull-google-news$(NC)    Setup Python environment and install dependencies for pull-google-news"
	@echo "  $(GREEN)deploy-pull-google-news$(NC)   Deploy pull-google-news function"
	@echo ""
	@echo "$(YELLOW)TypeScript Functions:$(NC)"
	@echo "  $(GREEN)setup-ts-all$(NC)              Install dependencies for all TypeScript functions"
	@echo "  $(GREEN)setup-pull-news$(NC)           Install dependencies for pull-news-from-google"
	@echo "  $(GREEN)setup-email-list$(NC)          Install dependencies for email-list"
	@echo "  $(GREEN)setup-unzipper$(NC)            Install dependencies for unzipper-service"
	@echo ""
	@echo "  $(GREEN)build-ts-all$(NC)              Build all TypeScript functions"
	@echo "  $(GREEN)build-pull-news$(NC)           Build pull-news-from-google function"
	@echo "  $(GREEN)build-email-list$(NC)          Build email-list function"
	@echo "  $(GREEN)build-unzipper$(NC)            Build unzipper-service function"
	@echo ""
	@echo "  $(GREEN)deploy-ts-all$(NC)             Deploy all TypeScript functions"
	@echo "  $(GREEN)deploy-pull-news$(NC)          Deploy pull-news-from-google function"
	@echo "  $(GREEN)deploy-email-list$(NC)         Deploy email-list function"
	@echo "  $(GREEN)deploy-unzipper$(NC)           Deploy unzipper-service function"
	@echo ""
	@echo "  $(GREEN)lint-ts-all$(NC)               Lint all TypeScript functions"
	@echo "  $(GREEN)lint-pull-news$(NC)            Lint pull-news-from-google function"
	@echo "  $(GREEN)lint-email-list$(NC)           Lint email-list function"
	@echo "  $(GREEN)lint-unzipper$(NC)             Lint unzipper-service function"
	@echo ""
	@echo "  $(GREEN)clean-ts-all$(NC)              Clean build artifacts for all TypeScript functions"
	@echo "  $(GREEN)clean-pull-news$(NC)           Clean build artifacts for pull-news-from-google function"
	@echo "  $(GREEN)clean-email-list$(NC)          Clean build artifacts for email-list function"
	@echo "  $(GREEN)clean-unzipper$(NC)            Clean build artifacts for unzipper-service function"

# Python (Chalice) Functions
.PHONY: setup-pull-google-news
setup-pull-google-news:
	@echo "$(GREEN)Setting up pull-google-news...$(NC)"
	cd chalice && $(PYTHON) -m venv venv_3_11 && \
	source venv_3_11/bin/activate && \
	$(PIP) install setuptools==57.5.0 && \
	$(PIP) install -r pull-google-news/requirements.txt

.PHONY: deploy-pull-google-news
deploy-pull-google-news:
	@echo "$(GREEN)Deploying pull-google-news...$(NC)"
	cd chalice/pull-google-news && $(CHALICE) deploy

# TypeScript Functions - Setup
.PHONY: setup-ts-all
setup-ts-all: setup-pull-news setup-email-list setup-unzipper

.PHONY: setup-pull-news
setup-pull-news:
	@echo "$(GREEN)Setting up pull-news-from-google...$(NC)"
	cd pull-news-from-google && $(NPM) install

.PHONY: setup-email-list
setup-email-list:
	@echo "$(GREEN)Setting up email-list...$(NC)"
	cd email-list && $(NPM) install

.PHONY: setup-unzipper
setup-unzipper:
	@echo "$(GREEN)Setting up unzipper-service...$(NC)"
	cd unzipper-service && $(NPM) install

# TypeScript Functions - Build
.PHONY: build-ts-all
build-ts-all: build-pull-news build-email-list build-unzipper

.PHONY: build-pull-news
build-pull-news:
	@echo "$(GREEN)Building pull-news-from-google...$(NC)"
	cd pull-news-from-google && $(NPM) run compile

.PHONY: build-email-list
build-email-list:
	@echo "$(GREEN)Building email-list...$(NC)"
	cd email-list && $(NPM) run compile || echo "$(YELLOW)No compile script found, skipping...$(NC)"

.PHONY: build-unzipper
build-unzipper:
	@echo "$(GREEN)Building unzipper-service...$(NC)"
	cd unzipper-service && $(NPM) run compile

# TypeScript Functions - Deploy
.PHONY: deploy-ts-all
deploy-ts-all: deploy-pull-news deploy-email-list deploy-unzipper

.PHONY: deploy-pull-news
deploy-pull-news: build-pull-news
	@echo "$(GREEN)Deploying pull-news-from-google...$(NC)"
	cd pull-news-from-google && $(SERVERLESS) deploy

.PHONY: deploy-email-list
deploy-email-list: build-email-list
	@echo "$(GREEN)Deploying email-list...$(NC)"
	cd email-list && $(SERVERLESS) deploy

.PHONY: deploy-unzipper
deploy-unzipper: build-unzipper
	@echo "$(GREEN)Deploying unzipper-service...$(NC)"
	cd unzipper-service && $(SERVERLESS) deploy

# TypeScript Functions - Lint
.PHONY: lint-ts-all
lint-ts-all: lint-pull-news lint-email-list lint-unzipper

.PHONY: lint-pull-news
lint-pull-news:
	@echo "$(GREEN)Linting pull-news-from-google...$(NC)"
	cd pull-news-from-google && $(NPM) run lint || echo "$(YELLOW)No lint script found, skipping...$(NC)"

.PHONY: lint-email-list
lint-email-list:
	@echo "$(GREEN)Linting email-list...$(NC)"
	cd email-list && $(NPM) run lint || echo "$(YELLOW)No lint script found, skipping...$(NC)"

.PHONY: lint-unzipper
lint-unzipper:
	@echo "$(GREEN)Linting unzipper-service...$(NC)"
	cd unzipper-service && $(NPM) run lint || echo "$(YELLOW)No lint script found, skipping...$(NC)"

# TypeScript Functions - Clean
.PHONY: clean-ts-all
clean-ts-all: clean-pull-news clean-email-list clean-unzipper

.PHONY: clean-pull-news
clean-pull-news:
	@echo "$(GREEN)Cleaning pull-news-from-google...$(NC)"
	rm -rf pull-news-from-google/dist pull-news-from-google/.serverless

.PHONY: clean-email-list
clean-email-list:
	@echo "$(GREEN)Cleaning email-list...$(NC)"
	rm -rf email-list/dist email-list/.serverless

.PHONY: clean-unzipper
clean-unzipper:
	@echo "$(GREEN)Cleaning unzipper-service...$(NC)"
	rm -rf unzipper-service/dist unzipper-service/.serverless

# Default target
.DEFAULT_GOAL := help
