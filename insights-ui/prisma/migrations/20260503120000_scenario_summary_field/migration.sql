-- Collapse the three narrative columns (underlying_cause, historical_analog,
-- outlook_markdown) into a single `summary` field on both stock and ETF
-- scenarios. The DB keeps the legacy columns nullable for the rest of this
-- iteration so any out-of-band readers still resolve; a follow-up migration
-- will drop them once we've verified nothing depends on them.

ALTER TABLE "etf_scenarios" ADD COLUMN "summary" TEXT;
ALTER TABLE "stock_scenarios" ADD COLUMN "summary" TEXT;

-- Backfill `summary` by concatenating the three legacy fields with blank
-- lines between them so the rendered markdown keeps paragraph breaks.
UPDATE "etf_scenarios"
SET "summary" = CONCAT_WS(E'\n\n',
  NULLIF("underlying_cause", ''),
  NULLIF("historical_analog", ''),
  NULLIF("outlook_markdown", '')
)
WHERE "summary" IS NULL;

UPDATE "stock_scenarios"
SET "summary" = CONCAT_WS(E'\n\n',
  NULLIF("underlying_cause", ''),
  NULLIF("historical_analog", ''),
  NULLIF("outlook_markdown", '')
)
WHERE "summary" IS NULL;

ALTER TABLE "etf_scenarios" ALTER COLUMN "summary" SET NOT NULL;
ALTER TABLE "stock_scenarios" ALTER COLUMN "summary" SET NOT NULL;

-- Drop NOT NULL on the legacy columns so new scenarios can be authored with
-- only `summary`. The columns themselves are retained for one release cycle.
ALTER TABLE "etf_scenarios" ALTER COLUMN "underlying_cause" DROP NOT NULL;
ALTER TABLE "etf_scenarios" ALTER COLUMN "historical_analog" DROP NOT NULL;
ALTER TABLE "etf_scenarios" ALTER COLUMN "outlook_markdown" DROP NOT NULL;
ALTER TABLE "stock_scenarios" ALTER COLUMN "underlying_cause" DROP NOT NULL;
ALTER TABLE "stock_scenarios" ALTER COLUMN "historical_analog" DROP NOT NULL;
ALTER TABLE "stock_scenarios" ALTER COLUMN "outlook_markdown" DROP NOT NULL;
