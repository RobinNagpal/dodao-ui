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
- **Required top-level sections, in this exact order, with these exact `##`
  headings** (the render path keys off them so authors can scan them
  consistently across scenarios):
  1. `## Introduction` — 2–3 paragraphs.
  2. `## Market size, timeline, and probability` — 2–3 paragraphs.
  3. `## Value chain` — 8–10 paragraphs total: a short opener that maps
     the chain end-to-end for a domain newcomer, followed by **three
     paragraphs per layer** (3 layers = 9 paragraphs incl. opener) — see
     the prompt body for the per-layer paragraph contract.
- **For `stock` scenarios only**, add a 4th required section
  `## 10 Baggers` — exactly **3 paragraphs** that pick the small-cap or
  micro-cap names from inside the value-chain layers above that have the
  highest plausible multi-bagger potential under this scenario. See the
  prompt body for the per-paragraph contract. **Do not include this
  section in ETF scenarios** — ETF holdings are pre-diversified, so a
  per-name 10x call would be misleading.
- A final section `## What would change the call` is **optional** (for
  both kinds). Add it if there are concrete falsification triggers (a
  price level, a policy event, a data print) the reader should watch.
  When present, it goes **after** `## 10 Baggers` (stock) or after
  `## Value chain` (ETF).
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

Total length: **8–10 paragraphs**. Write for a reader who has zero prior
knowledge of the industry — explain the mechanics from raw input to end
customer in plain language, no jargon without a one-line gloss.

Structure:

1. **One opening paragraph** mapping the chain end-to-end at a high level
   — who creates the raw input, who transforms it, who distributes it,
   who captures the end customer, and which 3 layers you'll cover in
   detail. Name the 3 layers explicitly so the reader knows what's coming.

2. Then for **each of the 3 layers**, write exactly **three consecutive
   paragraphs** (so 3 layers × 3 paragraphs = 9 paragraphs of layer
   content; with the opener that lands at 10 total — adjust to 8 by using
   shorter paragraphs if the chain is genuinely thin):

   - **Paragraph A — What this layer does.** Explain the layer's role in
     the chain to a complete newcomer. What physical or financial
     transformation happens here? What inputs go in, what outputs come
     out, who is the customer of this layer (the next layer down, or the
     end consumer)? No tickers in this paragraph — pure mechanics.

   - **Paragraph B — Economics, players, scenario impact, and whether
     it's priced in.** Cover all four:
     1. Typical gross / operating margins for this layer with a named
        source (broker research, company filings, industry trade
        association).
     2. The 3–6 most prominent players globally, with country of
        domicile if relevant. Use `EXCHANGE:SYMBOL` in **bold** for any
        ticker named.
     3. The dollar (or unit) revenue / capex / volume this layer should
        expect from the scenario specifically — not generic industry
        size, but the slice of the scenario that flows through this
        layer. Cite source.
     4. Whether the upside or downside is **already priced in** (point
        to forward multiples vs. mid-cycle, options skew, ETF flow data,
        or recent broker target moves) or whether there is residual gap.

   - **Paragraph C — How to invest in this layer via ETFs.** Name 1–3
     ETFs that give clean exposure to this layer specifically (not the
     whole sector — be precise about why this ETF maps to this layer).
     Use `EXCHANGE:SYMBOL` in **bold**. State the layer-relevant weight
     or top-holdings overlap if known. If no clean ETF exists for this
     layer, say so plainly and name the closest single-ticker proxies
     instead.

3. After the three layer-blocks, **one closing paragraph** naming the
   layer that **extracts the most value per dollar of investor capital**
   under this scenario and why — pricing power, scarcity, regulation,
   barriers to entry, time-to-cash, or risk-adjusted return profile.

Across the section, tickers always use `EXCHANGE:SYMBOL` in bold.
Numbers cited (margins, revenue, AUM, weights) must come from a named
source with as-of date. Omit a metric silently if you cannot source it.

## 10 Baggers

(Include this section ONLY if {{scenario_kind}} is `stock`. Skip
entirely for ETF scenarios — do not emit the heading.)

Exactly **3 paragraphs** picking the small-cap or micro-cap names from
inside the value-chain layers above that have the highest plausible
multi-bagger (5–10x+) potential under this scenario. The bar is
deliberately high: only names where the math actually supports a 10x
on a 3–5 year view if the scenario plays out, not "good small-cap
exposure." Tickers in `EXCHANGE:SYMBOL` bold throughout. Soft cap on
market cap: under ~$5B at time of writing for "small cap" candidates,
under ~$500M for "micro cap" candidates — state each name's market cap
inline with as-of date and source (issuer page, exchange listing, or
broker terminal).

- **Paragraph A — The candidates.** Name 3–6 small-cap or micro-cap
  tickers from across the three value-chain layers (do not introduce
  new names that were not part of any layer). For each, state market
  cap (with as-of date and source), which value-chain layer it sits
  in, and a one-line note on what specifically inside the scenario is
  the demand-side or pricing-side catalyst for that name. If a layer
  has no genuine sub-$5B candidate, say so plainly and skip it rather
  than naming a $20B mid-cap to fill the slot.

- **Paragraph B — The 10x math.** Walk through the unit economics that
  would have to print for at least one of these names to actually
  10-bag from current levels. Pick the most likely of the candidates
  and show the chain: revenue uplift % × incremental gross margin × P/E
  or P/S re-rating multiple = implied market cap; compare implied vs.
  current market cap to derive the bagger multiple. Use sourced
  numbers for current revenue, current margin, current multiple
  (company filings, broker research). Do not invent operating leverage
  — if the chain only supports a 3–5x, say 3–5x.

- **Paragraph C — The risks specific to small-cap exposure here.**
  Cover dilution risk (small-cap names often issue equity into a
  thesis-driven rally), single-customer concentration (DoD,
  single-utility, single-OEM), cap-table overhangs, illiquidity (state
  ADV in shares or dollars if known), regulatory single-points-of-
  failure (one permit, one drug approval, one supplier qualification),
  and the broader "the layer wins, the small cap doesn't" risk where
  the large incumbent capture the rents. Conclude with whether this
  basket is **owned alongside** the large-cap layer exposure (preferred
  default) or **instead of** it (only if the small-cap is genuinely
  the highest-conviction expression).

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
- The `## 10 Baggers` section is for `stock` scenarios only. For ETF
  scenarios, end the body at `## Value chain` (or `## What would
  change the call` if you include that optional section). Do not emit
  an empty `## 10 Baggers` heading on ETF scenarios.
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
