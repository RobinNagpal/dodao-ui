# =========================
# Config (override via env)
# =========================
SLS ?= npx serverless
TSX ?= npx tsx
ORIGIN ?= http://localhost:3000

# ==============
# Phony targets
# ==============
.PHONY: help print-config install test-single-slide test-concatenate invoke-generate-slide invoke-concatenate invoke-options deploy deploy-prod

help:
	@echo ""
	@echo "Remotion Automated Lambda - Available Commands:"
	@echo ""
	@echo "  make install              Install dependencies"
	@echo "  make test-single-slide    Run local single slide test"
	@echo "  make test-concatenate     Run local concatenation test"
	@echo "  make invoke-generate-slide  Invoke generate-slide via serverless local"
	@echo "  make invoke-concatenate   Invoke concatenate-videos via serverless local"
	@echo "  make invoke-options       Test OPTIONS preflight"
	@echo "  make deploy               Deploy to AWS (dev stage)"
	@echo "  make deploy-prod          Deploy to AWS (prod stage)"
	@echo ""

print-config:
	@echo "SLS    = $(SLS)"
	@echo "TSX    = $(TSX)"
	@echo "ORIGIN = $(ORIGIN)"

# Install dependencies
install:
	npm install

# Run local test scripts
test-single-slide:
	@echo "Running single slide test..."
	$(TSX) scripts/test-single-slide.ts

test-concatenate:
	@echo "Running concatenation test..."
	$(TSX) scripts/test-concatenate.ts

# Helper macro for inline invocation
define INVOKE_INLINE
	@echo "Invoking via router: $(1) ..."
	@$(SLS) invoke local -f api -d "$$($(TSX) scripts/generate-events.ts --route $(1) --origin $(ORIGIN))"
endef

# Invoke endpoints
invoke-generate-slide:
	$(call INVOKE_INLINE,generateSlide)

invoke-concatenate:
	$(call INVOKE_INLINE,concatenateVideos)

# OPTIONS preflight example
invoke-options:
	$(call INVOKE_INLINE,options)

# Deploy commands
deploy:
	$(SLS) deploy

deploy-prod:
	$(SLS) deploy --stage prod
