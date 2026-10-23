-- One true record per ETF share class.
--
-- The same share class (same ISIN) is often listed more than once: on LSE and XETRA, or on one
-- exchange in two currencies (e.g. LSE GBP and USD lines). Each listing was its own `etfs` row
-- with its own reports. This migration keeps one row per (space_id, isin), records the other
-- listings in `alternative_listings`, moves user data onto the kept row and deletes the rest.
--
-- Kept row per ISIN: has a report > created earliest (by day) > higher trading volume > id.
-- Rows without a valid ISIN are left alone (a NULL isin never conflicts).
--
-- Runs as one transaction: any failure leaves the database exactly as it was.

BEGIN;

-- AlterTable
ALTER TABLE "etfs" ADD COLUMN     "alternative_listings" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "isin" TEXT;

-- 1. Backfill isin from the stock-analyzer data (only well-formed ISINs).
UPDATE "etfs" e
SET "isin" = upper(trim(a."isin_number"))
FROM "etf_stock_analyzer_info" a
WHERE a."etf_id" = e."id"
  AND upper(trim(a."isin_number")) ~ '^[A-Z]{2}[A-Z0-9]{9}[0-9]$';

-- 2. Duplicates and the row each one folds into.
CREATE TEMP TABLE "_etf_duplicates" AS
WITH ranked AS (
  SELECT e."id", e."space_id", e."isin", e."exchange", e."symbol",
         row_number() OVER (
           PARTITION BY e."space_id", e."isin"
           ORDER BY EXISTS (SELECT 1 FROM "etf_cached_scores" s WHERE s."etf_id" = e."id") DESC,
                    date_trunc('day', e."created_at"),
                    f."volume" DESC NULLS LAST,
                    e."id"
         ) AS rn
  FROM "etfs" e
  LEFT JOIN "etf_financial_info" f ON f."etf_id" = e."id"
  WHERE e."isin" IS NOT NULL
)
SELECT d."id", d."space_id", d."exchange", d."symbol",
       p."id" AS "primary_id", p."exchange" AS "primary_exchange", p."symbol" AS "primary_symbol"
FROM ranked d
JOIN ranked p ON p."space_id" = d."space_id" AND p."isin" = d."isin" AND p.rn = 1
WHERE d.rn > 1;

-- 3. The duplicates become alternative listings of the kept row.
UPDATE "etfs" p
SET "alternative_listings" = x."listings"
FROM (
  SELECT "primary_id",
         jsonb_agg(jsonb_build_object('exchange', "exchange", 'symbol', "symbol") ORDER BY "exchange", "symbol") AS "listings"
  FROM "_etf_duplicates"
  GROUP BY "primary_id"
) x
WHERE p."id" = x."primary_id";

-- 4. Notes and favourites move to the kept row.
--    Notes: a user's note texts from the duplicates are appended to their note on the kept row
--    (or combined into one note when the kept row has none), so no text is lost.
--    Favourites: if the user already favourited the kept row, that one wins; otherwise the
--    earliest duplicate favourite moves over.
CREATE TEMP TABLE "_etf_note_merge" AS
SELECT d."primary_id", n."space_id", n."user_id",
       string_agg(n."notes", E'\n\n' ORDER BY n."created_at", n."id") AS "dup_text",
       (array_agg(n."id" ORDER BY n."created_at", n."id"))[1] AS "keep_id"
FROM "etf_notes" n
JOIN "_etf_duplicates" d ON d."id" = n."etf_id"
GROUP BY d."primary_id", n."space_id", n."user_id";

UPDATE "etf_notes" n
SET "notes" = n."notes" || E'\n\n' || m."dup_text", "updated_at" = CURRENT_TIMESTAMP
FROM "_etf_note_merge" m
WHERE n."etf_id" = m."primary_id" AND n."space_id" = m."space_id" AND n."user_id" = m."user_id";

UPDATE "etf_notes" n
SET "notes" = m."dup_text", "updated_at" = CURRENT_TIMESTAMP
FROM "_etf_note_merge" m
WHERE n."id" = m."keep_id"
  AND NOT EXISTS (SELECT 1 FROM "etf_notes" k WHERE k."etf_id" = m."primary_id" AND k."space_id" = m."space_id" AND k."user_id" = m."user_id");

DELETE FROM "etf_notes" n
USING "_etf_duplicates" d, "_etf_note_merge" m
WHERE n."etf_id" = d."id" AND m."primary_id" = d."primary_id" AND m."space_id" = n."space_id" AND m."user_id" = n."user_id"
  AND (n."id" <> m."keep_id"
       OR EXISTS (SELECT 1 FROM "etf_notes" k WHERE k."etf_id" = m."primary_id" AND k."space_id" = m."space_id" AND k."user_id" = m."user_id"));

UPDATE "etf_notes" n SET "etf_id" = d."primary_id" FROM "_etf_duplicates" d WHERE n."etf_id" = d."id";

DROP TABLE "_etf_note_merge";

DELETE FROM "favourite_etfs" df
USING "_etf_duplicates" d
WHERE df."etf_id" = d."id"
  AND (EXISTS (SELECT 1 FROM "favourite_etfs" f WHERE f."etf_id" = d."primary_id" AND f."space_id" = df."space_id" AND f."user_id" = df."user_id")
       OR EXISTS (SELECT 1 FROM "favourite_etfs" o JOIN "_etf_duplicates" od ON od."id" = o."etf_id"
                  WHERE od."primary_id" = d."primary_id" AND o."space_id" = df."space_id" AND o."user_id" = df."user_id" AND o."id" < df."id"));

UPDATE "favourite_etfs" f SET "etf_id" = d."primary_id" FROM "_etf_duplicates" d WHERE f."etf_id" = d."id";

-- 5. Credit history points at the kept row (labels keep the ticker the user actually bought).
UPDATE "report_spends" r SET "report_target_id" = d."primary_id"
FROM "_etf_duplicates" d WHERE r."report_kind" = 'Etf' AND r."report_target_id" = d."id";

-- 6. Scenario links to a duplicate point at the kept row (dropped if the scenario already has it in that role).
DELETE FROM "etf_scenario_etf_links" l
USING "_etf_duplicates" d
WHERE (l."etf_id" = d."id" OR (l."space_id" = d."space_id" AND l."symbol" = d."symbol" AND l."exchange" = d."exchange"))
  AND (EXISTS (SELECT 1 FROM "etf_scenario_etf_links" k
               WHERE k."scenario_id" = l."scenario_id" AND k."role" = l."role" AND k."symbol" = d."primary_symbol" AND k."id" <> l."id")
       OR EXISTS (SELECT 1 FROM "etf_scenario_etf_links" o JOIN "_etf_duplicates" od ON (o."etf_id" = od."id" OR (o."space_id" = od."space_id" AND o."symbol" = od."symbol" AND o."exchange" = od."exchange"))
                  WHERE od."primary_id" = d."primary_id" AND o."scenario_id" = l."scenario_id" AND o."role" = l."role" AND o."id" < l."id"));

UPDATE "etf_scenario_etf_links" l
SET "etf_id" = d."primary_id", "symbol" = d."primary_symbol", "exchange" = d."primary_exchange", "updated_at" = CURRENT_TIMESTAMP
FROM "_etf_duplicates" d
WHERE l."etf_id" = d."id" OR (l."space_id" = d."space_id" AND l."symbol" = d."symbol" AND l."exchange" = d."exchange");

-- 7. Similar-ETF entries that name a duplicate name the kept row instead (dropped if already there,
--    or if the kept row is the source itself).
DELETE FROM "etf_similar_etfs" s
USING "_etf_duplicates" d
WHERE s."space_id" = d."space_id" AND s."symbol" = d."symbol" AND s."exchange" = d."exchange"
  AND (s."source_etf_id" = d."primary_id"
       OR EXISTS (SELECT 1 FROM "etf_similar_etfs" k
                  WHERE k."source_etf_id" = s."source_etf_id" AND k."symbol" = d."primary_symbol" AND k."exchange" = d."primary_exchange")
       OR EXISTS (SELECT 1 FROM "etf_similar_etfs" o JOIN "_etf_duplicates" od ON o."space_id" = od."space_id" AND o."symbol" = od."symbol" AND o."exchange" = od."exchange"
                  WHERE od."primary_id" = d."primary_id" AND o."source_etf_id" = s."source_etf_id" AND o."id" < s."id"));

UPDATE "etf_similar_etfs" s
SET "symbol" = d."primary_symbol", "exchange" = d."primary_exchange", "updated_at" = CURRENT_TIMESTAMP
FROM "_etf_duplicates" d
WHERE s."space_id" = d."space_id" AND s."symbol" = d."symbol" AND s."exchange" = d."exchange";

-- 8. Delete the duplicates. Their reports, MOR/financial data, price history and generation
--    requests cascade with them; the kept row has its own.
DELETE FROM "etfs" e USING "_etf_duplicates" d WHERE e."id" = d."id";

DROP TABLE "_etf_duplicates";

-- CreateIndex
CREATE INDEX "etfs_alternative_listings_idx" ON "etfs" USING GIN ("alternative_listings" jsonb_path_ops);

-- CreateIndex
CREATE UNIQUE INDEX "etfs_space_id_isin_key" ON "etfs"("space_id", "isin");

COMMIT;
