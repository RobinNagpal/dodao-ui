# ETF Scenarios

Recurring market scenarios (recessions, sector crashes, commodity supercycles, rate regimes, geopolitical shocks, etc.) that move specific ETF categories. Each scenario carries a probability outlook, a priced-in assessment, an expected residual price move, and explicit lists of the ETFs most exposed to it.

The goal is not to list "every ETF that might be affected" — it is to give a reader **five winners and five losers**, each with a clear mechanical reason and an estimated % move, so the page reads like a ranked trade idea rather than a story. See `docs/insights-ui/scenario-authoring.md` for the full template and the "Five winners, five losers" convention.

## Where the data lives

- Public detail page: `/etf-scenarios/[slug]` (e.g. `/etf-scenarios/geopolitical-oil-price-spike`)
- Public listing page: `/etf-scenarios`
- Admin listing + modals: `/admin-v1/etf-scenarios`
- Database models: `EtfScenario` + `EtfScenarioEtfLink` in `insights-ui/prisma/schema.prisma`
- Source enums (TS-only, DB stores TEXT so adding enum values needs no migration): `insights-ui/src/types/etfScenarioEnums.ts`

## The `EtfScenario` model — field reference

| Field | Type | Purpose |
|---|---|---|
| `scenarioNumber` | Int | Stable human-facing number (1..N). Unique per space. |
| `title` | String | Human title, e.g. "Geopolitical Oil Price Spike". |
| `slug` | String | URL slug, unique per space. Auto-derived from title if omitted. |
| `summary` | Markdown | 4–5 paragraph narrative folding the underlying cause / mechanism, magnitude, affected industries, historical analog, and dated outlook into a single field. |
| `detailedAnalysis` | Markdown (nullable) | Long-form scenario analysis — intro, sizing & timeline, value-chain breakdown. Renders on `/etf-scenarios/<slug>/detailed-analysis` behind a "Detailed analysis" button. Generate with `docs/insights-ui/scenario-prompts/detailed-analysis.md`. Leave null if not yet authored. |
| `direction` | Enum | `UPSIDE` (boom / rally scenario) or `DOWNSIDE` (crash / stress scenario). |
| `timeframe` | Enum | `FUTURE` (not yet triggered), `IN_PROGRESS` (currently unfolding), `PAST` (already played out). |
| `probabilityBucket` | Enum | `HIGH` (>40%), `MEDIUM` (20–40%), `LOW` (<20%). |
| `probabilityPercentage` | Int (nullable) | Precise probability 0–100. Pair with the bucket. |
| `pricedInBucket` | Enum | `NOT_PRICED_IN`, `PARTIALLY_PRICED_IN`, `MOSTLY_PRICED_IN`, `FULLY_PRICED_IN`, `OVER_PRICED_IN`. How much the market has already discounted. |
| `expectedPriceChange` | Int (nullable) | Signed % average still to move across the most-exposed ETFs if the scenario plays out. Negative for DOWNSIDE, positive for UPSIDE. A `FULLY_PRICED_IN` scenario is near 0; a `NOT_PRICED_IN` scenario can be large. |
| `expectedPriceChangeExplanation` | Markdown | The range and the reasoning (e.g. "VNQ −15% / KRE −30% / REM −40% if the refi wall triggers"). |
| `priceChangeTimeframeExplanation` | Markdown | When the move starts and peaks, as narrative prose (e.g. "Trigger window Q3 2026, peak stress Q2 2027"). No separate date columns yet — narrative only. |
| `outlookAsOfDate` | Date | When the outlook was last reviewed. Bump this on every meaningful update. |
| `metaDescription` | String (nullable) | SEO meta description. |
| `archived` | Bool | Hide from the public listing without deleting. |
| `spaceId` | String | Always `koala_gains` on production. |

### `probabilityBucket` vs. `pricedInBucket` — why both

They are orthogonal. A 50%-probability scenario that is `FULLY_PRICED_IN` has no actionable edge left; a 20%-probability scenario that is `NOT_PRICED_IN` can still be a strong trade because the market hasn't discounted it. The listing page can sort by the combination of the two when we need a "ranked trade ideas" view.

## The `EtfScenarioEtfLink` model — how ETFs attach to a scenario

Each row ties one ETF to a scenario with one of two `role`s:

- `WINNER` — this ETF benefits if the scenario plays out
- `LOSER` — this ETF is hurt if the scenario plays out

**Convention: exactly 5 winners and 5 losers per scenario** (10 link rows total). The schema does not enforce this — it's an editorial rule. Pick the ETFs with the cleanest, most direct mechanical exposure — prefer targeted sector/industry ETFs (XLE, XOP, KRE) over broad diversified ones (SPY) when both would qualify. See `docs/insights-ui/scenario-authoring.md` for the rationale.

### Per-link fields

| Field | Type | Purpose |
|---|---|---|
| `symbol` | String | Ticker, uppercase (e.g. `XOP`). Required. |
| `exchange` | String (nullable) | Populated automatically by the API if the ticker is a known ETF in our `Etf` table. Do **not** pass it manually in the POST payload. |
| `etfId` | String (nullable) | Populated automatically. Unresolved symbols render as a plain span in the UI; resolved ones render as a clickable link to `/etfs/<exchange>/<symbol>`. |
| `role` | Enum | `WINNER` / `LOSER`. |
| `sortOrder` | Int | 0-indexed within the role. Controls display order. |
| `roleExplanation` | Markdown (nullable) | **Why this specific ETF is a winner / loser / most-exposed** — the mechanical reason, not the scenario narrative. |
| `expectedPriceChange` | Int (nullable) | Signed % expected move for this specific ETF if the scenario plays out. |
| `expectedPriceChangeExplanation` | Markdown (nullable) | Size of the move for this ETF and over what timeframe. |

### How the detail page renders the links

`EtfScenarioDetailView` shows a two-column grid (Winners / Losers). Each link renders as a card with the ticker pill, expected price change, role explanation, and price-change explanation when those per-link fields are populated. Cards link out to `/etfs/<exchange>/<symbol>` when the ETF is resolved to our `Etf` table.

## Endpoints

All mutating endpoints are guarded by either:
- `withLoggedInAdmin` — requires an admin session cookie (admin-v1 UI uses this path), **or**
- `withAdminOrToken` — admin session **or** `token=<AUTOMATION_SECRET>` query param **or** `x-automation-token` header (used for scripted updates from scheduled jobs and bot workflows).

The automation secret lives in the discord-claude-bot `.env` as `AUTOMATION_SECRET`.

### Read endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/etf-scenarios` | Admin-only flat list of scenarios for this space. |
| GET | `/api/etf-scenarios/[id]` | Admin single scenario by id (UUID / slug — we use slug as id for deterministic upserts). |
| GET | `/api/[spaceId]/etf-scenarios/listing` | Public listing with filters (`direction`, `timeframe`, `probabilityBucket`, `search`, `page`, `pageSize`, `includeArchived`). |
| GET | `/api/[spaceId]/etf-scenarios/[slug]` | Public detail including `winners` and `losers` arrays. `?allowNull=true` returns `null` instead of throwing for missing slugs. |

### Write endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/etf-scenarios` | admin-or-token | **Upsert by slug.** Accepts the full scenario payload and replaces all links atomically. This is the primary path used by automation. |
| PUT | `/api/etf-scenarios/[id]` | admin-or-token | Partial update of a scenario row (no link changes). |
| DELETE | `/api/etf-scenarios/[id]` | admin-or-token | Hard-delete a scenario (cascades to its links). |
| POST | `/api/etf-scenarios/[id]/links` | admin-session only | Add or update a single link row. Upsert on `(scenarioId, symbol, role)`. |
| DELETE | `/api/etf-scenarios/[id]/links?symbol=<S>&role=<R>` | admin-session only | Remove a single link row. |
| POST | `/api/etf-scenarios/import` | admin-session only | Bulk import from a Markdown document (used for initial seeding — parser lives in `src/utils/etf-scenario-markdown-parser.ts`). |

## How to add a new scenario

There are three paths. Pick the one that fits the situation.

### Path 1 — Admin UI (fastest for a one-off)

1. Go to `/admin-v1/etf-scenarios`.
2. Click "Create Scenario" → the `UpsertEtfScenarioModal` opens.
3. Fill in every field. The form has inputs for all `EtfScenario` columns including the priced-in bucket, expected change, the two explanation markdowns, and the optional `detailedAnalysis` long-form section. Leave the slug blank to auto-derive from the title.
4. Save. The modal creates the row but does **not** attach ETF links.
5. Open "Manage Links" on the new row → use the add form to attach 5 winners and 5 losers (convention; no schema enforcement). Each link form lets you set `roleExplanation`, `expectedPriceChange`, and `expectedPriceChangeExplanation` at the same time.

### Path 2 — Full POST (preferred for scripted or bulk work)

Upsert-by-slug via `POST /api/etf-scenarios?token=<AUTOMATION_SECRET>`. This is the path the bot uses and the one you should reach for when updating many scenarios programmatically. Payload shape:

```json
{
  "scenarioNumber": 14,
  "title": "Geopolitical Oil Price Spike",
  "slug": "geopolitical-oil-price-spike",
  "summary": "...4–5 paragraphs of markdown...",
  "detailedAnalysis": "...markdown or null...",
  "direction": "UPSIDE",
  "timeframe": "IN_PROGRESS",
  "probabilityBucket": "MEDIUM",
  "probabilityPercentage": 28,
  "pricedInBucket": "PARTIALLY_PRICED_IN",
  "expectedPriceChange": 12,
  "expectedPriceChangeExplanation": "...markdown...",
  "priceChangeTimeframeExplanation": "...markdown...",
  "outlookAsOfDate": "2026-04-21",
  "metaDescription": null,
  "archived": false,
  "links": [
    {
      "symbol": "XOP", "role": "WINNER", "sortOrder": 0,
      "roleExplanation": "Pure E&P basket — highest torque to crude.",
      "expectedPriceChange": 18,
      "expectedPriceChangeExplanation": "+15% to +25% over 3–6 months if Brent holds above $100."
    }
    // ... 4 more winners, then 5 losers (convention: exactly 5 of each)
  ]
}
```

Behavior:
- The backend resolves `exchange` and `etfId` for each link by symbol lookup against our `Etf` table — do **not** pass those fields yourself.
- The transaction deletes all existing links for the scenario and recreates them from the payload. Partial-link updates are not supported via this endpoint.
- Tags `etfScenarioBySlug:<slug>` and `etfScenarioListing` are revalidated on success, so cached pages rebuild on next visit.

For long multi-line markdown content, post from Python using `urllib.request` — it's safer than shell-escaping multi-line strings through curl:

```python
import urllib.request, json
req = urllib.request.Request(
    "https://koalagains.com/api/etf-scenarios?token=" + token,
    data=json.dumps(payload).encode(),
    headers={"Content-Type": "application/json"},
    method="POST",
)
resp = urllib.request.urlopen(req, timeout=30)
```

### Path 3 — Bulk Markdown import

Use `POST /api/etf-scenarios/import` with a Markdown document containing multiple scenarios in the parser's expected format (see `src/utils/etf-scenario-markdown-parser.ts`). Mainly useful for initial seeding. It does not populate the new `pricedInBucket` / `expectedPriceChange` / explanation fields — those stay at their defaults until you come back with Path 2 or the admin UI.

## How to update an existing scenario

- **All fields + links in one call** → `POST /api/etf-scenarios` with the full payload. Because it is upsert-by-slug it also works as an update. This is the recommended path for systematic rewrites.
- **A few scenario-level fields, no link changes** → `PUT /api/etf-scenarios/<id>`. Useful for touching `outlookAsOfDate`, tweaking `probabilityPercentage`, flipping `archived`, etc. Does not touch links.
- **A single link row** → `POST /api/etf-scenarios/<id>/links` with the link body (including `roleExplanation` / `expectedPriceChange` / `expectedPriceChangeExplanation` if you want per-link detail). This is an upsert on `(scenarioId, symbol, role)`.
- **Remove a link** → `DELETE /api/etf-scenarios/<id>/links?symbol=<S>&role=<R>`.

Always bump `outlookAsOfDate` when you make a meaningful change. The detail page shows "outlook reviewed YYYY-MM-DD" — stale dates signal rot.

## How to remove a scenario

Two options — pick based on whether you want the history gone or just hidden.

- **Soft-delete (recommended for published scenarios)**: `PUT /api/etf-scenarios/<id>` with `{"archived": true}`. The scenario drops out of the public listing immediately (unless `?includeArchived=true` is used). Any inbound link or sitemap entry still resolves. This is the non-destructive option.
- **Hard-delete**: `DELETE /api/etf-scenarios/<id>`. Cascades to the link rows via the Prisma `onDelete: Cascade` relation. Use this only for mistakes / duplicates that should leave no trace.

Both paths revalidate the listing tag and the slug tag so cached pages update.

## Operational conventions

- **5 winners, 5 losers — convention, not enforced.** Always exactly five of each. If you find yourself reaching for a sixth, drop the weakest existing one. Broad diversified ETFs (SPY, QQQ, VTI) are usually the weakest link when a more targeted ETF exists. Schema does not reject extra rows; the rule lives in `docs/insights-ui/scenario-authoring.md` and is reiterated as a comment in the import scripts.
- **`detailedAnalysis` is optional but follows a fixed structure when present.** Use the prompt at `docs/insights-ui/scenario-prompts/detailed-analysis.md` to generate it — intro, sizing & timeline, value-chain breakdown. Skip the field rather than ship a thin one-paragraph version.
- **Preserve markdown fields on surgical edits.** When a script is only patching new fields or links, it should re-send the existing markdown bodies byte-for-byte. Don't silently rewrite `summary` / `detailedAnalysis` / etc. unless the task is explicitly to revise them.
- **Use absolute dates in memory, narrative dates in copy.** Internal code + API payloads use ISO dates (`2026-04-21`). User-facing markdown uses narrative timeframes ("Q3 2026", "through 2027") — this is what `priceChangeTimeframeExplanation` is for.
