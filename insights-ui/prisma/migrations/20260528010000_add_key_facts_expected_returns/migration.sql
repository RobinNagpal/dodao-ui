-- Add the expected forward-return estimates of the key-facts report. Each stores
-- the LLM-estimated annualized return (as a percent, e.g. 7.5 = 7.5%/yr) over the
-- given horizon. Nullable so prior reports — and ETFs the model cannot estimate —
-- simply have no value.
ALTER TABLE "etf_key_facts_reports" ADD COLUMN "expected_next_1yr_returns" DOUBLE PRECISION;
ALTER TABLE "etf_key_facts_reports" ADD COLUMN "expected_next_3yr_returns" DOUBLE PRECISION;
ALTER TABLE "etf_key_facts_reports" ADD COLUMN "expected_next_5yr_returns" DOUBLE PRECISION;
