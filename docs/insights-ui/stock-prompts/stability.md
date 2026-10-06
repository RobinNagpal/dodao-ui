Use internet to validate the information and make sure to return the result based on the latest information.

You are analyzing the **stability / drawdown resilience** of a stock or REIT.
The goal is to tell a retail investor, in plain terms, **how much this stock is likely to fall if the broad market falls**, what the **expected price** would be in each case, and **why** — both at the industry level and at the company level.

The stock is:
- Name: {{name}}
- Exchange: {{exchange}}
- Symbol: {{symbol}}

Industry (`{{industryKey}}`): **{{industryName}}**
{{industryDescription}}

Sub-industry (`{{subIndustryKey}}`): **{{subIndustryName}}**
{{subIndustryDescription}}

Market context as of today (`{{analysisDateDisplay}}`):
- Current price: `{{currentPrice}}` `{{currency}}`
- Price captured at (ISO 8601): `{{priceAsOf}}`
- Market snapshot (JSON): {{marketSnapshot}}

The market snapshot contains the market cap, trailing and forward `P/E`, `beta`, the 52-week range, the day range, dividend amount and yield, and volume. Use it — do not invent different numbers for these.

---

### What you are writing

Two things, from one analysis:

- **The short report** (`summary`) — 2 paragraphs, shown on the main stock page.
- **The long report** — 2 paragraphs per scenario (`sectorImpact` then `companyImpact`) plus 2 overall paragraphs (`detailedAnalysis`), shown on the stability detail page.

Stick to those paragraph counts exactly. The page renders each field as its own block, so extra paragraphs, headings, or bullet lists break the layout.

---

### Instructions:

1. **`summary` — the short report, exactly 2 paragraphs.**

    - **Paragraph 1 — the numbers.** State the price the report is based on (`{{currentPrice}}` as of `{{analysisDateDisplay}}`), then for a `5%`, a `15%` and a `30%` broad-market drop give the expected drop for this stock and the expected price. Keep it readable as prose, not a table.
    - **Paragraph 2 — the overall explanation.** Why the stock behaves that way: demand cyclicality, where its industry sits in its own cycle, balance sheet, dividend, valuation. End with a one-sentence investor takeaway (e.g., "Investors get a defensive cash-flow stream that has historically given up about half of what the index gave up").

2. **`dropScenarios` — exactly three entries**, for a broad-market (S&P 500 style index) drawdown of `5%`, `15%` and `30%`, in that order. For each:

    - **`marketDropPercent`** — `5`, `15` or `30`.

    - **`expectedSectorDropPercent`** — how far the **industry / sub-industry** falls in that scenario, as a positive percentage.
      **This is not the same as the market drop, and it is not simply "beta × market drop".** Think about where the industry sits in its own cycle:
        - An industry that has **already been washed out** — down heavily over the past year, trading near trough multiples, with the bad news already priced in — typically gives up **much less** than the market. Say so, and give the smaller number.
        - An industry trading at **cycle-high multiples** on peak earnings, or one whose demand is the first thing cut in a slowdown, gives up **much more** than the market.
        - Truly defensive industries (staples, regulated utilities, healthcare payors) compress much less; long-duration, rate-sensitive and high-multiple industries compress much more.
      Use a negative value only if the industry genuinely rises while the market falls (rare — defensive rotation).

    - **`sectorImpact`** — the scenario's **first paragraph**, exactly ONE paragraph, about **`{{industryName}}` and `{{subIndustryName}}`** (name both). Explain **why** they move the way they do at this magnitude of sell-off: where the industry is in its own cycle, the drivers that move (`rates`, credit spreads, commodity prices, freight rates, occupancy, ad budgets, IT spend, loan losses), how much bad news is already in the price, and how industry multiples typically re-rate. Say explicitly whether the sub-industry behaves differently from the broader industry, and note when the industry is near a bottom and therefore has less left to give up.

    - **`expectedStockDropPercent`** — how far **this stock** falls, as a positive percentage.

    - **`expectedPrice`** — `{{currentPrice}} * (1 - expectedStockDropPercent/100)`, rounded to 2 decimals.

    - **`companyImpact`** — the scenario's **second paragraph**, exactly ONE paragraph, about **{{name}}** specifically: earnings sensitivity, contracted or recurring revenue, backlog, customer concentration, leverage and near-term refinancing, dividend safety, buyback capacity, and the valuation cushion — where the `P/E` (or `P/FFO`, `EV/EBITDA`) would sit at the expected price. State explicitly whether the drop is a **multiple re-rating** or an **earnings cut**, since the two recover very differently.

   The three scenarios must be internally consistent: deeper market drops mean deeper (or at least not shallower) stock drops, and the ratio of stock drop to market drop can widen at `30%` if leverage or liquidity becomes the issue.

3. **`detailedAnalysis` — the overall part of the long report, exactly 2 paragraphs.**

    - **Paragraph 1 — history and volatility.** How the stock actually behaved peak-to-trough in the `2020` COVID crash, the `2022` bear market, and any industry-specific drawdown, with real percentages next to the index's drop over the same window; its `beta` from the snapshot; and how much of the typical move is industry versus company specific.
    - **Paragraph 2 — cushion, recovery and verdict.** Balance sheet (net debt / `EBITDA`, interest coverage, maturity wall), dividend coverage and buyback capacity, valuation support at the expected prices and who the buyer of last resort is, how quickly it recovered after past drawdowns, and the 1–2 strongest reasons behind the resilience verdict.

4. Set **`resilienceVerdict`** to one of: `HIGHLY_RESILIENT`, `RESILIENT`, `MARKET_LIKE`, `VULNERABLE`, `HIGHLY_VULNERABLE`. It must agree with the drop percentages in `dropScenarios` — a stock you expect to fall `45%` when the market falls `30%` is not `RESILIENT`.

5. Set **`referencePrice`** to `{{currentPrice}}`, **`referencePriceAsOf`** to `{{priceAsOf}}` verbatim (it dates every price shown to the reader), and **`currency`** to `{{currency}}`. Do not substitute another quote.

#### For output content:
- Use markdown format for output.
- All amounts, dollar values, percentages, dates, and figures should be wrapped in backticks.
- Use simple words. Feel free to use technical terms (e.g., `beta`, `P/FFO`, `multiple compression`) but explain them on first use.
- Be factual. Cite years, percentages, and dollar figures wherever possible.
- Do not invent drawdowns, credit events, or covenant breaches. If you cannot confirm a fact from a reputable source (`10-K` / `10-Q`, SEC filings, the company's IR site, established business press, exchange data), say `unable to verify`.
- These are scenario estimates, not predictions — do not present them as certainties, and do not hedge them into uselessness either.
- Any references should be inline and included as links in the JSON itself.

return output in json
output schema: see [`insights-ui/schemas/analysis-factors/stability/stability-output.schema.yaml`](../../../insights-ui/schemas/analysis-factors/stability/stability-output.schema.yaml) — the pipeline appends that file verbatim to the prompt.

---
## Saving the Result

Once you have produced the JSON object matching the output schema above, save it by
making the following HTTP request:

POST /api/koala_gains/tickers-v1/exchange/{{exchange}}/{{symbol}}/save-json-report

Request body (Content-Type: application/json):
{
  "reportType": "stability",
  "llmResponse": <your complete JSON output>
}

How the fields map:
- "reportType"   → always "stability" for this prompt (identifies which report is being saved)
- "llmResponse"  → the complete JSON object you generated, matching the output schema above

The server will validate "llmResponse" against the output schema before persisting it.
Do not modify the structure — send the exact JSON object your analysis produced.
---
