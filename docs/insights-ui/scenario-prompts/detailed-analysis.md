# Prompt — Scenario "Detailed Analysis" section

Use this prompt to generate the `detailedAnalysis` markdown for either an
ETF scenario (`EtfScenario.detailedAnalysis`) or a stock scenario
(`StockScenario.detailedAnalysis`). The result renders on
`/(etf|stock)-scenarios/<slug>/detailed-analysis` behind the "Detailed
analysis" button on the scenario detail page.

## When to use this

- The base scenario row already exists in the DB (the parser-driven sections
  — underlying cause, historical analog, outlook, winners, losers — are
  already populated).
- You want to add a longer-form, narrative companion that goes beyond
  ranking trade ideas: market sizing, time horizon, value-chain map,
  sample tickers per layer.
- You're authoring or refreshing this section deliberately. If you don't
  have a strong, sourced read yet, **leave the field null** rather than
  shipping a thin placeholder.

## Inputs to fill in before sending

Replace the bracketed slots in the prompt below with the scenario you're
authoring. Keep the structure intact — the rendered page assumes the three
section headings.

- `{{scenario_kind}}` → `ETF` or `stock`
- `{{scenario_title}}` → e.g. `Geopolitical Oil Price Spike`
- `{{scenario_slug}}` → e.g. `geopolitical-oil-price-spike`
- `{{direction}}` → `UPSIDE` or `DOWNSIDE`
- `{{timeframe}}` → `FUTURE` / `IN_PROGRESS` / `PAST`
- `{{probability}}` → e.g. `MEDIUM (~30%)`
- `{{outlook_as_of}}` → e.g. `2026-04-21`
- `{{countries}}` → for stock scenarios only, e.g. `USA, Canada`
- `{{underlying_cause_md}}` → paste the existing `underlyingCause` body
- `{{historical_analog_md}}` → paste the existing `historicalAnalog` body
- `{{outlook_md}}` → paste the existing `outlookMarkdown` body
- `{{winners_block}}` → bullet list of the 5 winners with their
  `EXCHANGE:SYMBOL`, expected price change, and 1-line role explanation
- `{{losers_block}}` → same shape, 5 losers

## Output contract

- Plain markdown — no front matter, no code fences around the whole document.
- **Three top-level sections, in this exact order, with these exact `##`
  headings** (the render path keys off them so authors can scan them
  consistently across scenarios):
  1. `## Introduction` — 2–3 paragraphs.
  2. `## Market size, timeline, and probability` — 2–3 paragraphs.
  3. `## Value chain` — 2–3 paragraphs followed by a layer-by-layer breakdown.
- A 4th section `## What would change the call` is **optional**. Add it if
  there are concrete falsification triggers (a price level, a policy event,
  a data print) the reader should watch.
- No invented numbers. Every dollar figure, percentage, basis-point spread,
  or share count must come from the inputs above OR a reputable source you
  can name inline (FRED/BLS/BEA, central-bank statements, IEA, USGS, EIA,
  IMF, World Bank, large-broker research, company filings, ETF issuer
  pages). Cite source + as-of date inline; no long URLs.
- Tickers use `EXCHANGE:SYMBOL` in **bold**, matching the parser convention
  used elsewhere in this codebase (e.g. `**NYSE:CVX**`, `**TSX:CNQ**`,
  `**NYSEARCA:XLE**`).
- Do not repeat content already in `underlyingCause` / `historicalAnalog` /
  `outlookMarkdown` verbatim. Reference them; this section adds depth, not
  redundancy.

## The prompt

```
You are writing the "Detailed Analysis" section for the {{scenario_kind}}
market scenario "{{scenario_title}}" (slug: {{scenario_slug}}).

Direction: {{direction}}. Timeframe: {{timeframe}}. Probability: {{probability}}.
Outlook reviewed: {{outlook_as_of}}. Countries in scope: {{countries}}.

The reader has already read the short summary on the scenario detail page,
which contains the underlying cause, historical analog, dated outlook
paragraph, and the curated lists of 5 winners / 5 losers. Your job is to
add a longer-form companion piece that goes beyond a ranked trade idea —
sizing the opportunity, mapping the value chain, naming sample tickers at
each layer.

Existing scenario sections you can reference but should not duplicate
verbatim:

UNDERLYING CAUSE:
{{underlying_cause_md}}

HISTORICAL ANALOG:
{{historical_analog_md}}

OUTLOOK ({{outlook_as_of}}):
{{outlook_md}}

WINNERS (5):
{{winners_block}}

LOSERS (5):
{{losers_block}}

Write the response as plain markdown with these three top-level sections,
in this exact order and with these exact `##` headings:

## Introduction

2–3 paragraphs giving a general introduction to the scenario aimed at a
reader who knows the headline but not the mechanism. Frame what the
scenario is, why it matters now (vs. five years ago), and which industry
or asset class is most directly in the line of fire. Do not re-state the
underlying-cause section verbatim — synthesize it for someone newly
encountering the topic.

## Market size, timeline, and probability

2–3 paragraphs covering ALL of:
- The dollar (or unit) size of the affected market — TAM / industry
  revenue / addressable AUM / commodity tonnage — with named sources and
  an as-of date for each headline number.
- The expected timeline from trigger to peak impact (months, quarters, or
  years), and any known catalyst dates (policy decisions, earnings prints,
  contract expiries, regulatory deadlines) that bracket the window.
- The probability call: restate the bucket and percentage from the outlook,
  and explain what assumption is doing the work in that estimate. If the
  market-implied probability (from rates, options, or a prediction market)
  is available and differs from your call, name it.

## Value chain

Open with 2–3 paragraphs describing the value chain of the affected
industry — who creates the raw input, who transforms it, who distributes
it, who captures the end customer. Then list **3–4 layers** of the chain
in order, and for each layer state:
- What the layer does, in one sentence.
- Whether this layer is favorably or unfavorably exposed under the
  scenario, with a one-sentence mechanical reason.
- 2–4 **sample tickers** in `EXCHANGE:SYMBOL` form (bold) that sit at this
  layer of the chain in this scenario's context. These can overlap with
  the curated winners/losers, but should also surface adjacent names not
  in the 5+5 list.

After the per-layer breakdown, finish the section with one sentence
naming the layer that **extracts the most value** in this scenario and
why (pricing power / scarcity / regulation / barriers to entry).

## What would change the call

(Optional — include only if there are concrete falsification triggers.)

A short paragraph or bullet list of specific signals — a price level
crossed, a policy decision, a data print, a court ruling — that would
either confirm the thesis or invalidate it.

Constraints:
- Every dollar / percent / bps / unit figure must come from a named source
  (FRED, BLS, BEA, IEA, USGS, EIA, IMF, World Bank, central-bank
  statement, company filing, broker research, ETF issuer page) with an
  as-of date stated inline. No invented numbers. No long URLs.
- Tickers always use `EXCHANGE:SYMBOL` in bold (e.g. `**NYSEARCA:XLE**`,
  `**TSX:CNQ**`).
- Do not output front matter, do not wrap the whole document in a code
  fence. The output is the markdown body of the `detailedAnalysis` field.
- If you cannot source a number confidently, omit the metric silently —
  do not write "data not available" or "TBD".
```

## Where the result goes

- Paste the output into the `Detailed analysis` textarea in the admin
  upsert modal at `/admin-v1/etf-scenarios` or `/admin-v1/stock-scenarios`,
  OR include it as the `detailedAnalysis` field in the `POST /api/etf-scenarios`
  / `POST /api/stock-scenarios` upsert body.
- The detail page detects a non-null `detailedAnalysis` and renders the
  "Detailed analysis" button that links to
  `/(etf|stock)-scenarios/<slug>/detailed-analysis`.
- Bump `outlookAsOfDate` when you ship a meaningful refresh of this
  section, same as for any other scenario edit.
