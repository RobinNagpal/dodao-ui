-- Add the applicable-investor-types output of the key-facts report. Stores the
-- LLM-selected investor-type keys (0-4) as a JSON string array. Nullable so
-- reports generated before this column simply render no investor types.
ALTER TABLE "etf_key_facts_reports" ADD COLUMN "applicable_investor_types" JSONB;
