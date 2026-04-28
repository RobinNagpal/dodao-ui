-- Add countries[] to etf_scenarios so ETF scenarios can be country-scoped
-- the same way stock scenarios already are. Existing rows are all US-based,
-- so backfill them to ['US'] before any code reads the column.
ALTER TABLE "etf_scenarios" ADD COLUMN "countries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "etf_scenarios" SET "countries" = ARRAY['US']::TEXT[] WHERE cardinality("countries") = 0;
