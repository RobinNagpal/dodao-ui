-- Drop the stock-scenario-level winners/losers markdown columns. The buckets
-- are maintained as structured `stock_scenario_stock_links` rows (one row per
-- stock with role WINNER / LOSER / MOST_EXPOSED), so the free-text columns
-- are redundant.
ALTER TABLE "stock_scenarios"
  DROP COLUMN "winners_markdown",
  DROP COLUMN "losers_markdown";

-- Per-stock "how much is already priced in" bucket. Some tagged stocks have
-- the scenario baked into their quote already, others do not — the scenario-
-- level `priced_in_bucket` averages that away. Default existing rows to
-- PARTIALLY_PRICED_IN and let callers refine.
ALTER TABLE "stock_scenario_stock_links"
  ADD COLUMN "priced_in_bucket" TEXT NOT NULL DEFAULT 'PARTIALLY_PRICED_IN';

CREATE INDEX "stock_scenario_stock_links_priced_in_bucket_idx"
  ON "stock_scenario_stock_links"("priced_in_bucket");
