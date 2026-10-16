# Export Overview Page

**URL:** `/industry-tariff-report/exports/chapters/<slug>` · **File:** `overview.json` ·
**Type:** `TariffExportOverviewContent` · **Component:** `ChapterExportOverview.tsx`

**The question it answers:** How much of this chapter does the U.S. sell abroad, to whom, and what?

This is the trade picture. Tariffs appear only as one short line per buyer; the detail lives on
Markets and Tariff updates.

## Sections, in page order

| # | Section | Fields | Filled by | Source |
| --- | --- | --- | --- | --- |
| 1 | Intro (2 short paragraphs) | `intro` (Markdown) | Writer | Facts from this page + Markets |
| 2 | Stat cards (4–5) | `stats` | Generator (trade stats) + writer (one tariff stat) | Comtrade; Markets |
| 3 | In short (3–4 takeaways) | `keyTakeaways` | Writer | This page + Tariff updates + Markets |
| 4 | Exports over time (chart) | `byYear`, `byYearPartners`, `byYearCaption` | Generator | Comtrade (annual) |
| 5 | This year so far | `yearToDate` | Generator | Comtrade (monthly) |
| 6 | Who buys these goods (boxed table) | `topMarkets`, `othersExportsUsd`, `othersPriorExportsUsd`, `coverageNote` | Generator (values) + writer (`tariffNow`, `status`) | Comtrade; Markets |
| 7 | What the U.S. sells | `byHeading`, `byLine` | Generator | Comtrade |
| 8 | Sources | `sources` | Generator (+ writer if a fact cites more) | — |

### 1. Intro

Two short paragraphs. First: total exports in the latest year, the change, and what makes up most of
it. Second: where tariffs matter for this chapter and where they do not, and what usually decides
access instead (e.g. a drug approval). Bold the key numbers.

### 2. Stat cards

Four or five cards, each one short figure. The generator writes the trade ones (latest-year exports,
change vs prior year, largest product group share, two largest buyers' share). The writer adds one
tariff stat, e.g. "Top buyers charging 0%: 10 of 12" or "Buyers that raised tariffs: 1 (China)".

### 3. In short

Three or four numbered takeaways a reader can act on. One idea each. Must not repeat the intro word
for word.

### 4. Exports over time

Generated: total per year, split into the two largest latest-year buyers and everyone else. The
caption names them.

### 5. This year so far

Generated from monthly data: January to the latest reported month of the current year vs the same
months last year, plus the 8 largest buyers so far. The U.S. reports monthly data to Comtrade about
two months after the month ends; refresh with `pnpm tariff:fetch-trade --flow X --ytd` and regenerate
or copy the block in. `null` hides the section.

### 6. Who buys these goods from the U.S.

The largest buyers (default 12) with latest-year value, change, share, then two tariff columns the
writer fills:

- `tariffNow`: one short phrase, e.g. "Free (EU zero-for-zero)", "Same + 10% extra on all U.S. goods".
  It must agree with the market's `profile.tariffNow` on Markets.
- `status`: `unchanged` / `lowered` / `raised` / `raisedThenRemoved` / `pending`, since January 2025.

This table lists countries (Germany, Netherlands…) because it is about who buys. Markets groups the EU
into one row because that page is about tariffs.

### 7. What the U.S. sells

Generated: exports per four-digit heading (labels from the import overview's product groups) and the
10 largest six-digit lines. The six-digit code is the start of the Schedule B number; the column says
"HS / Schedule B".

## Not on this page

- Rates by product group, the reason for a rate → Markets.
- Dated changes, retaliation history, events ahead → Tariff updates.
- Schedule B, export filing, licences → Export rules.
- "Why the U.S. both buys and sells these goods" essays: drop them, or fold one sentence into the intro.
