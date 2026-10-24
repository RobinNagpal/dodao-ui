-- Remove XETRA ETFs with under $100M in assets that have no report.
--
-- After the ISIN fold (20261023000000_etf_isin_alternative_listings) these are XETRA-only funds with
-- no LSE twin, nothing generated and too small to be worth generating. On 2026-10-23 this matched
-- 625 rows, none of them referenced by a favourite, note, credit spend, generation request,
-- scenario link, similar-ETF entry or another fund's alternative listings.
--
-- The set is recomputed at deploy time and anything that has picked up a report or a reference
-- since then is kept. XETRA `aum` is stored as a plain number of euros ("27339531"); rows whose
-- AUM is missing or not a plain number are kept.
SET lock_timeout = '10s';

CREATE TEMP TABLE "_etf_small_xetra" AS
SELECT e."id", e."space_id", e."symbol", e."exchange"
FROM "etfs" e
JOIN "etf_financial_info" f ON f."etf_id" = e."id"
WHERE e."exchange" = 'XETRA'
  AND f."aum" ~ '^[0-9]+(\.[0-9]+)?$'
  AND f."aum"::numeric < 100000000
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

-- Similar-ETF suggestions on other funds that name a removed fund would link to a missing page.
DELETE FROM "etf_similar_etfs" s
USING "_etf_small_xetra" t
WHERE s."space_id" = t."space_id" AND s."symbol" = t."symbol" AND s."exchange" = t."exchange";

-- Their MOR/financial data, analyzer info and price history cascade with them.
DELETE FROM "etfs" e USING "_etf_small_xetra" t WHERE e."id" = t."id";

DROP TABLE "_etf_small_xetra";
