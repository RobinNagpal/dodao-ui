-- Repurpose the key-facts investor field from "applicable investor types" (a
-- flat list of type keys) to "applicable investor goals" (per-investor-type
-- goal keys). Rename the column; any pre-existing values are the old type-key
-- shape and are simply ignored by the new code, which expects objects.
ALTER TABLE "etf_key_facts_reports" RENAME COLUMN "applicable_investor_types" TO "applicable_investor_goals";
