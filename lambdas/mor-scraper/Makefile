# =========================
# Config (override via env)
# =========================
TSX ?= npx tsx
ETF_URL ?= 
NNOV_URL ?= 

# ==============
# Phony targets
# ==============
.PHONY: help print-config install \
        test-local test-local-nnov \
        test-overview test-analysis test-returns test-holdings test-strategy \
        test-all

help:
	@echo ""
	@echo "ETF Quote Scraper - Available Commands:"
	@echo ""
	@echo "  make install              Install dependencies"
	@echo "  make test-local           Scrape all sections for VV (default)"
	@echo "  make test-local-nnov      Scrape all sections for NNOV"
	@echo ""
	@echo "  make test-overview        Scrape only overview section"
	@echo "  make test-analysis        Scrape only analysis section"
	@echo "  make test-returns         Scrape only returns section"
	@echo "  make test-holdings        Scrape only holdings section"
	@echo "  make test-strategy        Scrape only strategy section"
	@echo ""
	@echo "  make test-all             Run all section tests sequentially"
	@echo ""
	@echo "Environment Variables:"
	@echo "  ETF_URL      ETF quote URL (default: VV)"
	@echo "  NNOV_URL     Alternative ETF URL (default: NNOV)"
	@echo "  DEBUG_DUMP   Set to 1 to dump page innerText to debug-innertext.txt"
	@echo ""
	@echo "NOTE: The target site has aggressive bot detection. If you get a CAPTCHA"
	@echo "      error, wait a few minutes between test runs or use a different IP."
	@echo ""
	@echo "Examples:"
	@echo "  make test-local"
	@echo "  make test-local ETF_URL=..."
	@echo "  make test-overview"
	@echo "  make test-analysis ETF_URL=$(NNOV_URL)"
	@echo "  DEBUG_DUMP=1 make test-local"
	@echo ""

print-config:
	@echo "TSX      = $(TSX)"
	@echo "ETF_URL  = $(ETF_URL)"
	@echo "NNOV_URL = $(NNOV_URL)"

# Install dependencies
install:
	npm install

# Run full scrape (all sections)
test-local:
	@echo "Scraping all sections for: $(ETF_URL) ..."
	$(TSX) src/test-local.ts --url $(ETF_URL)

# Run full scrape for NNOV
test-local-nnov:
	@echo "Scraping all sections for: $(NNOV_URL) ..."
	$(TSX) src/test-local.ts --url $(NNOV_URL)

# Individual section tests
test-overview:
	@echo "Scraping overview for: $(ETF_URL) ..."
	$(TSX) src/test-local.ts --url $(ETF_URL) --section overview

test-analysis:
	@echo "Scraping analysis for: $(ETF_URL) ..."
	$(TSX) src/test-local.ts --url $(ETF_URL) --section analysis

test-returns:
	@echo "Scraping returns for: $(ETF_URL) ..."
	$(TSX) src/test-local.ts --url $(ETF_URL) --section returns

test-holdings:
	@echo "Scraping holdings for: $(ETF_URL) ..."
	$(TSX) src/test-local.ts --url $(ETF_URL) --section holdings

test-strategy:
	@echo "Scraping strategy for: $(ETF_URL) ..."
	$(TSX) src/test-local.ts --url $(ETF_URL) --section strategy

# Run all individual section tests
test-all: test-overview test-analysis test-returns test-holdings test-strategy
	@echo "All section tests complete."
