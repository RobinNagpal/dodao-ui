# Export Markets Page

**URL:** `/industry-tariff-report/exports/chapters/<slug>/markets` · **File:** `markets.json` ·
**Type:** `TariffExportMarketsContent` · **Component:** `ChapterExportMarkets.tsx` (+ `ExportRateMatrix.tsx`)

**The question it answers:** What does each market charge on U.S. goods in this chapter, and what
does it take to sell there?

## Sections, in page order

| # | Section | Fields | Filled by | Source |
| --- | --- | --- | --- | --- |
| 1 | Intro | `intro` (Markdown) | Writer | — |
| 2 | Tariff by market and product group (boxed matrix) | `groups`, `markets[].cells`, `biggestLanes`, `coverageNote` | Generator (values, lanes) + writer (rates) | Comtrade; WTO / WITS; national schedules; FTA tariff schedules |
| 3 | Market by market (profile cards) | `markets[].profile`, `usTradeAgreement`, `members` | Generator (values, products, guide) + writer (headline, tariff, regulator) | `markets.json` library; regulators |
| 4 | How these rates are worked out | `assumptions` | Writer | — |
| 5 | Sources | `sources` | Generator + writer | — |

### Which markets

The largest markets by latest-year U.S. exports (default 8), where a **customs union counts as one
market**: the EU's 27 members share one tariff and one drug regulator, so they are one row
("European Union"), with its largest members listed on the profile card. The generator does the
grouping from `export-library/markets.json`. Stop where most of the trade is covered; the
`coverageNote` says what share the markets take.

### 2. The matrix

Rows = markets, columns = the chapter's four-digit product groups. Each cell (`TariffExportMarketCell`):

- `rate`: what U.S.-origin goods pay today, after any trade-agreement rate and any extra duty
  (e.g. "Free (USMCA)", "3% + 10%", "10.6% avg (0–14%)").
- `normalRate`: the market's normal (MFN) rate when it differs from `rate` — e.g. what a USMCA partner
  charges goods that don't qualify. `null` when the same.
- `basis`: where the rate comes from (subheading, schedule, year).
- `exportsUsd`: generated (U.S. exports of that group to that market).

Rates come from the WTO / World Bank WITS (TRAINS) MFN applied rates at the six-digit level, the
market's own current schedule when available (EU TARIC, Japan Customs, CBSA, UK Trade Tariff), and the
trade.gov FTA Tariff Tool for FTA partners. Say the schedule year in `tariffYear` and in each `basis`.

### 3. Market by market

One card per market. Generated: exports, share, change, `mainProducts` (the two largest groups),
`members` for a customs union, `usTradeAgreement` and `countryGuide` (from the library). The writer fills:

- `headline`: one or two sentences — what matters for a U.S. exporter here. No repeated text from
  other pages.
- `profile.tariffNow`: the one-line summary, same wording as the Overview's `tariffNow`.
- `rule`: the tariff rule behind the rates ("EU common external tariff (WTO pharmaceutical zero-for-zero)").
- `status` since January 2025.
- `regulator`: the agency whose approval or registration is needed to sell this chapter's goods there
  (name, official URL, one-sentence requirement).

### 4. How these rates are worked out

Short bullets: the schedule and year, one subheading per group, how trade agreements and extra duties
are applied, and that national 8–10-digit lines can differ.

## Not on this page

- VAT, sales taxes, the buyer's import paperwork: the buyer's business, out of scope.
- What changed and when → Tariff updates. The card's `status` badge links the two.
- Long essays on why trade flows both ways: drop them.
