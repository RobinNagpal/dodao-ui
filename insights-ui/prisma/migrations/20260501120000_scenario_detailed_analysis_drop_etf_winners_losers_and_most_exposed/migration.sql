-- Drop now-unused ETF scenario narrative fields. The structured winners/losers
-- link list already covers the same ground.
ALTER TABLE "etf_scenarios"
  DROP COLUMN "winners_markdown",
  DROP COLUMN "losers_markdown";

-- Optional long-form analysis surfaced behind a "Detailed Analysis" button on
-- the scenario detail page. Nullable; only present when an editor wants the
-- expanded essay.
ALTER TABLE "etf_scenarios" ADD COLUMN "detailed_analysis" TEXT;
ALTER TABLE "stock_scenarios" ADD COLUMN "detailed_analysis" TEXT;

-- Drop the MOST_EXPOSED link role: in practice it has overlapped with the top
-- WINNER (and occasionally LOSER) entries, so we collapse to two roles only.
DELETE FROM "etf_scenario_etf_links" WHERE "role" = 'MOST_EXPOSED';
DELETE FROM "stock_scenario_stock_links" WHERE "role" = 'MOST_EXPOSED';
