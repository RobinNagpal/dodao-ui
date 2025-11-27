# =========================
# Config (override via env)
# =========================
SLS ?= npx serverless
TSX ?= npx tsx
MARKET_CAP ?= Over 1B
PRICE_CHANGE ?= Over 1%
LIMIT ?= 15
ORIGIN ?= http://localhost:3000

# ==============
# Phony targets
# ==============
.PHONY: help print-config install test-local invoke-screener invoke-options

help:
	@echo ""
	@echo "Stock Screener Scraper - Available Commands:"
	@echo ""
	@echo "  make install          Install dependencies"
	@echo "  make test-local       Run local test script (fastest way to test)"
	@echo "  make invoke-screener  Invoke via serverless local"
	@echo "  make invoke-options   Test OPTIONS preflight"
	@echo ""
	@echo "Environment Variables:"
	@echo "  MARKET_CAP    Market cap filter (default: 'Over 1B')"
	@echo "  PRICE_CHANGE  Price change filter (default: 'Over 1%')"
	@echo "  LIMIT         Number of stocks to return (default: 15)"
	@echo ""
	@echo "Examples:"
	@echo "  make test-local"
	@echo "  make invoke-screener"
	@echo "  make invoke-screener MARKET_CAP='Over 10B' PRICE_CHANGE='Over 2%'"
	@echo ""

print-config:
	@echo "SLS          = $(SLS)"
	@echo "TSX          = $(TSX)"
	@echo "MARKET_CAP   = $(MARKET_CAP)"
	@echo "PRICE_CHANGE = $(PRICE_CHANGE)"
	@echo "LIMIT        = $(LIMIT)"
	@echo "ORIGIN       = $(ORIGIN)"

# Install dependencies
install:
	npm install

# Run the simple local test script
test-local:
	@echo "Running local test..."
	$(TSX) src/test-local.ts

# Helper macro to avoid repetition
define INVOKE_INLINE
	@echo "Invoking via router: $(1) ..."
	@$(SLS) invoke local -f api -d "$$($(TSX) scripts/generate-events.ts --route $(1) --market-cap '$(MARKET_CAP)' --price-change '$(PRICE_CHANGE)' --limit $(LIMIT) --origin $(ORIGIN))"
endef

# Invoke the screener endpoint
invoke-screener:
	$(call INVOKE_INLINE,screener)

# OPTIONS preflight example
invoke-options:
	$(call INVOKE_INLINE,options)

