# =========================
# Config (override via env)
# =========================
SLS ?= npx serverless
TSX ?= npx tsx
# TICKER_URL ?= https://stockanalysis.com/quote/psx/LUCK/
TICKER_URL ?= https://stockanalysis.com/stocks/SN/
VIEW ?= strict
ORIGIN ?= http://localhost:3000

# ==============
# Phony targets
# ==============
.PHONY: help print-config \
        invoke-fetchSummary \
        invoke-fetchDividends \
        invoke-fetchIncomeStatementAnnual \
        invoke-fetchIncomeStatementQuarterly \
        invoke-fetchBalanceSheetAnnual \
        invoke-fetchBalanceSheetQuarterly \
        invoke-fetchCashflowAnnual \
        invoke-fetchCashflowQuarterly \
        invoke-fetchRatiosAnnual \
        invoke-fetchRatiosQuarterly \
        invoke-fetchFinancialsAnnual \
        invoke-fetchFinancialsQuarterly \
        invoke-scrapeTickerInfo \
        invoke-optionsAll \
        invoke-all

help:
	@echo ""
	@echo "Inline event gen + invoke (no files):"
	@echo "  make invoke-<FunctionName> [TICKER_URL=...] [VIEW=normal|raw|strict]"
	@echo "  make invoke-all"
	@echo ""
	@echo "Examples:"
	@echo "  make invoke-fetchSummary"
	@echo "  make invoke-fetchIncomeStatementQuarterly VIEW=raw"
	@echo "  make invoke-fetchFinancialsAnnual TICKER_URL=https://www.macrotrends.net/stocks/charts/MSFT/microsoft"
	@echo ""

print-config:
	@echo "SLS        = $(SLS)"
	@echo "TSX        = $(TSX)"
	@echo "TICKER_URL = $(TICKER_URL)"
	@echo "VIEW       = $(VIEW)"
	@echo "ORIGIN     = $(ORIGIN)"

# Helper macro to avoid repetition
define INVOKE_INLINE
	@echo "Invoking via router: $(1) ..."
    @$(SLS) invoke local -f api -d "$$($(TSX) scripts/generate-events.ts --route $(1) --url $(TICKER_URL) --view $(VIEW) --origin $(ORIGIN))"
endef

# =========================
# Explicit invoke targets
# =========================
invoke-fetchSummary:
	$(call INVOKE_INLINE,fetchSummary)

invoke-fetchDividends:
	$(call INVOKE_INLINE,fetchDividends)

invoke-fetchIncomeStatementAnnual:
	$(call INVOKE_INLINE,fetchIncomeStatementAnnual)

invoke-fetchIncomeStatementQuarterly:
	$(call INVOKE_INLINE,fetchIncomeStatementQuarterly)

invoke-fetchBalanceSheetAnnual:
	$(call INVOKE_INLINE,fetchBalanceSheetAnnual)

invoke-fetchBalanceSheetQuarterly:
	$(call INVOKE_INLINE,fetchBalanceSheetQuarterly)

invoke-fetchCashflowAnnual:
	$(call INVOKE_INLINE,fetchCashflowAnnual)

invoke-fetchCashflowQuarterly:
	$(call INVOKE_INLINE,fetchCashflowQuarterly)

invoke-fetchRatiosAnnual:
	$(call INVOKE_INLINE,fetchRatiosAnnual)

invoke-fetchRatiosQuarterly:
	$(call INVOKE_INLINE,fetchRatiosQuarterly)

invoke-fetchFinancialsAnnual:
	$(call INVOKE_INLINE,fetchFinancialsAnnual)

invoke-fetchFinancialsQuarterly:
	$(call INVOKE_INLINE,fetchFinancialsQuarterly)

# Legacy combined (body = {url} only)
invoke-scrapeTickerInfo:
	$(call INVOKE_INLINE,scrapeTickerInfo)

# OPTIONS preflight example
invoke-optionsAll:
	$(call INVOKE_INLINE,optionsAll)

# Batch
invoke-all: \
	invoke-fetchSummary \
	invoke-fetchDividends \
	invoke-fetchIncomeStatementAnnual \
	invoke-fetchIncomeStatementQuarterly \
	invoke-fetchBalanceSheetAnnual \
	invoke-fetchBalanceSheetQuarterly \
	invoke-fetchCashflowAnnual \
	invoke-fetchCashflowQuarterly \
	invoke-fetchRatiosAnnual \
	invoke-fetchRatiosQuarterly \
	invoke-fetchFinancialsAnnual \
	invoke-fetchFinancialsQuarterly \
	invoke-scrapeTickerInfo \
	invoke-optionsAll
	@echo "✓ All invocations complete"
