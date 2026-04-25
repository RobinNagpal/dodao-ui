-- Drop scenario-level priced-in / expected-price fields from stock_scenarios.
-- These signals now live exclusively on stock_scenario_stock_links so each
-- ticker carries its own outlook. ETF scenarios still keep the scenario-level
-- versions (they remain in etf_scenarios).

DROP INDEX IF EXISTS "stock_scenarios_space_id_priced_in_bucket_idx";

ALTER TABLE "stock_scenarios"
  DROP COLUMN IF EXISTS "priced_in_bucket",
  DROP COLUMN IF EXISTS "expected_price_change",
  DROP COLUMN IF EXISTS "expected_price_change_explanation",
  DROP COLUMN IF EXISTS "price_change_timeframe_explanation";
