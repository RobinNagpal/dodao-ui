-- Remove XETRA ETFs with under €100M in assets that have no report.
--
-- After the ISIN fold (20261023000000_etf_isin_alternative_listings) these are XETRA-only funds with
-- no LSE twin, nothing generated and too small to be worth generating. On 2026-10-24 this matched
-- 624 rows, none of them referenced by a favourite, note, credit spend, generation request,
-- scenario link, similar-ETF entry or another fund's alternative listings.
--
-- The set is recomputed at deploy time and anything that has picked up a report or a reference
-- since then is kept. XETRA `aum` is the screener's "Assets" column, a plain number of euros
-- ("27339531"); rows whose AUM is missing or not a plain number are kept. Funds that own an
-- alternative listing are kept too, so that listing keeps redirecting to them.
--
-- The removed rows are copied to the "etf_archive" schema first (Prisma does not manage it), so
-- they can be restored without the RDS snapshot. Drop that schema in a later migration.
SET lock_timeout = '10s';

-- Rows that reference an ETF must not appear between choosing the set and deleting it: their
-- foreign keys would cascade them away (or, for report_spends and scenario links, leave them
-- pointing at nothing). SHARE mode makes those writes wait until this migration commits.
LOCK TABLE "favourite_etfs", "etf_notes", "etf_generation_requests", "report_spends", "etf_scenario_etf_links" IN SHARE MODE;

CREATE TEMP TABLE "_etf_small_xetra" AS
SELECT e."id", e."space_id", e."symbol", e."exchange"
FROM "etfs" e
JOIN "etf_financial_info" f ON f."etf_id" = e."id"
WHERE e."exchange" = 'XETRA'
  AND (CASE WHEN f."aum" ~ '^[0-9]+(\.[0-9]+)?$' THEN f."aum"::numeric END) < 100000000
  AND e."alternative_listings" = '[]'::jsonb
  -- No report of any kind.
  AND e."last_report_generated_at" IS NULL
  AND NOT EXISTS (SELECT 1 FROM "etf_cached_scores" c WHERE c."etf_id" = e."id")
  AND NOT EXISTS (SELECT 1 FROM "etf_category_analysis_results" c WHERE c."etf_id" = e."id")
  AND NOT EXISTS (SELECT 1 FROM "etf_analysis_category_factor_results" c WHERE c."etf_id" = e."id")
  AND NOT EXISTS (SELECT 1 FROM "etf_key_facts_reports" c WHERE c."etf_id" = e."id")
  AND NOT EXISTS (SELECT 1 FROM "etf_vs_competition" c WHERE c."etf_id" = e."id")
  AND NOT EXISTS (SELECT 1 FROM "etf_future_returns" c WHERE c."etf_id" = e."id")
  -- Nothing a user or another fund points at.
  AND NOT EXISTS (SELECT 1 FROM "etf_generation_requests" g WHERE g."etf_id" = e."id")
  AND NOT EXISTS (SELECT 1 FROM "favourite_etfs" x WHERE x."etf_id" = e."id")
  AND NOT EXISTS (SELECT 1 FROM "etf_notes" x WHERE x."etf_id" = e."id")
  AND NOT EXISTS (SELECT 1 FROM "report_spends" r WHERE r."report_kind" = 'Etf' AND r."report_target_id" = e."id")
  AND NOT EXISTS (SELECT 1 FROM "etf_scenario_etf_links" l
                  WHERE l."etf_id" = e."id" OR (l."space_id" = e."space_id" AND l."symbol" = e."symbol" AND l."exchange" = e."exchange"))
  AND NOT EXISTS (SELECT 1 FROM "etfs" o
                  WHERE o."alternative_listings" @> jsonb_build_array(jsonb_build_object('exchange', e."exchange", 'symbol', e."symbol")));

-- 624 matched when this was written. Far more means the data changed shape (e.g. AUM stored in
-- another unit): stop rather than delete it.
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM "_etf_small_xetra";
  IF n > 700 THEN
    RAISE EXCEPTION 'Small XETRA ETF removal: % rows matched, expected about 624', n;
  END IF;
END $$;

CREATE SCHEMA IF NOT EXISTS "etf_archive";
CREATE TABLE "etf_archive"."etfs_20261024" AS
  SELECT e.* FROM "etfs" e JOIN "_etf_small_xetra" t ON t."id" = e."id";
CREATE TABLE "etf_archive"."etf_financial_info_20261024" AS
  SELECT c.* FROM "etf_financial_info" c JOIN "_etf_small_xetra" t ON t."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_stock_analyzer_info_20261024" AS
  SELECT c.* FROM "etf_stock_analyzer_info" c JOIN "_etf_small_xetra" t ON t."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_price_history_20261024" AS
  SELECT c.* FROM "etf_price_history" c JOIN "_etf_small_xetra" t ON t."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_mor_analyzer_info_20261024" AS
  SELECT c.* FROM "etf_mor_analyzer_info" c JOIN "_etf_small_xetra" t ON t."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_mor_risk_info_20261024" AS
  SELECT c.* FROM "etf_mor_risk_info" c JOIN "_etf_small_xetra" t ON t."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_mor_people_info_20261024" AS
  SELECT c.* FROM "etf_mor_people_info" c JOIN "_etf_small_xetra" t ON t."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_mor_portfolio_info_20261024" AS
  SELECT c.* FROM "etf_mor_portfolio_info" c JOIN "_etf_small_xetra" t ON t."id" = c."etf_id";
CREATE TABLE "etf_archive"."etf_similar_etfs_20261024" AS
  SELECT s.* FROM "etf_similar_etfs" s JOIN "_etf_small_xetra" t
    ON s."space_id" = t."space_id" AND s."symbol" = t."symbol" AND s."exchange" = t."exchange";

-- Similar-ETF suggestions on other funds that name a removed fund would link to a missing page.
DELETE FROM "etf_similar_etfs" s
USING "_etf_small_xetra" t
WHERE s."space_id" = t."space_id" AND s."symbol" = t."symbol" AND s."exchange" = t."exchange";

-- Their financial data, analyzer info, MOR data and price history cascade with them.
DELETE FROM "etfs" e USING "_etf_small_xetra" t WHERE e."id" = t."id";

DROP TABLE "_etf_small_xetra";
