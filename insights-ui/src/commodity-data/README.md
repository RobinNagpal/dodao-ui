# Commodity data (static JSON)

Commodity reports are **static JSON**, authored by hand (or by asking Claude to
write the analysis). There is no database, no LLM generation pipeline, and no
admin generation UI — the report pages simply read these files through the
`/api/.../commodities-v1/*` routes.

## Files

| File | What it holds |
| --- | --- |
| `commodities.json` | The commodity universe — one row of basic descriptive fields per commodity (`slug`, `name`, `commodityGroup`, `priceSymbol`, `exchange`, `unit`, `currency`). Backs the `/commodities` listing. |
| `reports/<slug>.json` | The full report for one commodity: `summary`, `metaDescription`, `keyFacts`, and the four scored `categories`. Backs `/commodities/<slug>` and its sub-report pages. |

The TypeScript shapes are the source of truth — see
[`src/types/commodity/commodity-analysis-types.ts`](../types/commodity/commodity-analysis-types.ts):

- `CommodityBasicInfo` — a `commodities.json` row.
- `CommodityReportJson` — a `reports/<slug>.json` file.

## Adding / updating a commodity report

1. Make sure the commodity has a row in `commodities.json` (all 22 launch
   commodities are already there).
2. Create `reports/<slug>.json` following the `CommodityReportJson` shape. The
   `categoryKey`s must be `SupplyAndDemand`, `PriceAndValue`, `VolatilityAndRisk`,
   `FutureOutlook`, and each factor's `factorKey` must match the factor configs in
   [`src/commodity-analysis/`](../commodity-analysis/) (e.g.
   `commodity-analysis-factors-supply-and-demand.json`).
3. Register the file: add one `import` + one map entry in
   [`commodity-reports-registry.ts`](../utils/commodity-analysis-reports/commodity-reports-registry.ts).
   (Reports are imported, not read from disk, so they bundle with the server build
   and behave identically in dev and on Vercel.)

`reports/gold.json` is a complete worked example.

## Scores & caching

- A commodity's **final score** is computed on read as the number of `Pass`
  factors across its categories (max 20 = 4 categories × 5 factors). It is not
  stored. Commodities with no report JSON show a neutral placeholder.
- The listing rides a 1-week Next.js `revalidate`; per-commodity pages carry a
  `commodity:<slug>` cache tag and the price chart (live Yahoo data) rides a
  1-day `revalidate`. After publishing a new report, redeploy or purge the tags
  via the admin **Invalidate cache** page.
