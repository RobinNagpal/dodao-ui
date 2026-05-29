-- Add the per-horizon rationale text for the key-facts expected returns. Each
-- stores the LLM's ~3-line explanation of the corresponding expected return.
-- Nullable so prior reports simply have no reason text.
ALTER TABLE "etf_key_facts_reports" ADD COLUMN "expected_next_1yr_returns_reason" TEXT;
ALTER TABLE "etf_key_facts_reports" ADD COLUMN "expected_next_3yr_returns_reason" TEXT;
ALTER TABLE "etf_key_facts_reports" ADD COLUMN "expected_next_5yr_returns_reason" TEXT;
