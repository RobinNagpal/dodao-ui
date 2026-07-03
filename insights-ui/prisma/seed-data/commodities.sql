-- =============================================================================
-- Seed data for the "commodities" table (KoalaGains).
--
-- Safe to run on pgAdmin AND on the prod DB. Idempotent: re-running updates the
-- descriptive columns and never creates duplicates (keyed on the unique
-- (space_id, slug) index `commodities_space_id_slug_key`). It only touches the
-- descriptive columns — generated report content (summary, meta_description) and
-- all child tables (key facts, category analyses, cached scores, generation
-- requests) are left untouched.
--
-- Universe: the tradable, reasonably-popular commodities from Yahoo Finance's
-- commodities page. Index/rate futures (ES, YM, NQ, RTY, ZB/ZN/ZF/ZT), the
-- "micro" duplicates (MGC, SIL), and very-low-liquidity contracts (propane B0,
-- oats ZO, rough rice ZR, lumber LBS, orange juice OJ) are intentionally excluded.
--
-- Columns:
--   commodity_group : one of Energy | Metals | Agriculture | Livestock
--                     (must match the group words used in application code).
--   price_symbol    : Yahoo Finance front-month futures ticker.
--   exchange        : listing exchange of the futures contract (best-effort).
--   unit            : the contract's physical trading unit (from the CME/ICE
--                     contract spec). Prices are quoted per this unit.
--   currency        : USD for every US-listed futures contract below.
--
-- `id` is generated with gen_random_uuid() (built into PostgreSQL 13+; on older
-- servers run `CREATE EXTENSION IF NOT EXISTS pgcrypto;` first). `updated_at` has
-- no DB default, so it is set explicitly.
-- =============================================================================

BEGIN;

INSERT INTO "commodities" (
  "id", "slug", "name", "commodity_group", "price_symbol", "exchange", "unit", "currency", "space_id", "created_at", "updated_at"
) VALUES
  -- Energy
  (gen_random_uuid()::text, 'wti-crude-oil',   'Crude Oil (WTI)',   'Energy',      'CL=F', 'NYMEX', 'barrel',      'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'brent-crude-oil', 'Crude Oil (Brent)', 'Energy',      'BZ=F', 'ICE',   'barrel',      'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'natural-gas',     'Natural Gas',       'Energy',      'NG=F', 'NYMEX', 'MMBtu',       'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'gasoline-rbob',   'RBOB Gasoline',     'Energy',      'RB=F', 'NYMEX', 'gallon',      'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'heating-oil',     'Heating Oil',       'Energy',      'HO=F', 'NYMEX', 'gallon',      'USD', 'koala_gains', now(), now()),

  -- Metals
  (gen_random_uuid()::text, 'gold',            'Gold',              'Metals',      'GC=F', 'COMEX', 'troy ounce',  'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'silver',          'Silver',            'Metals',      'SI=F', 'COMEX', 'troy ounce',  'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'platinum',        'Platinum',          'Metals',      'PL=F', 'NYMEX', 'troy ounce',  'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'palladium',       'Palladium',         'Metals',      'PA=F', 'NYMEX', 'troy ounce',  'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'copper',          'Copper',            'Metals',      'HG=F', 'COMEX', 'pound',       'USD', 'koala_gains', now(), now()),

  -- Agriculture
  (gen_random_uuid()::text, 'corn',            'Corn',              'Agriculture', 'ZC=F', 'CBOT',  'bushel',      'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'wheat',           'Wheat (KC HRW)',    'Agriculture', 'KE=F', 'CBOT',  'bushel',      'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'soybeans',        'Soybeans',          'Agriculture', 'ZS=F', 'CBOT',  'bushel',      'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'soybean-meal',    'Soybean Meal',      'Agriculture', 'ZM=F', 'CBOT',  'short ton',   'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'soybean-oil',     'Soybean Oil',       'Agriculture', 'ZL=F', 'CBOT',  'pound',       'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'coffee',          'Coffee',            'Agriculture', 'KC=F', 'ICE',   'pound',       'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'sugar',           'Sugar #11',         'Agriculture', 'SB=F', 'ICE',   'pound',       'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'cotton',          'Cotton',            'Agriculture', 'CT=F', 'ICE',   'pound',       'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'cocoa',           'Cocoa',             'Agriculture', 'CC=F', 'ICE',   'metric ton',  'USD', 'koala_gains', now(), now()),

  -- Livestock
  (gen_random_uuid()::text, 'live-cattle',     'Live Cattle',       'Livestock',   'LE=F', 'CME',   'pound',       'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'lean-hogs',       'Lean Hogs',         'Livestock',   'HE=F', 'CME',   'pound',       'USD', 'koala_gains', now(), now()),
  (gen_random_uuid()::text, 'feeder-cattle',   'Feeder Cattle',     'Livestock',   'GF=F', 'CME',   'pound',       'USD', 'koala_gains', now(), now())
ON CONFLICT ("space_id", "slug") DO UPDATE SET
  "name"            = EXCLUDED."name",
  "commodity_group" = EXCLUDED."commodity_group",
  "price_symbol"    = EXCLUDED."price_symbol",
  "exchange"        = EXCLUDED."exchange",
  "unit"            = EXCLUDED."unit",
  "currency"        = EXCLUDED."currency",
  "updated_at"      = now();

COMMIT;
