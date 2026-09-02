Use internet to validate the information and make sure to return the result based on the latest information.

You are analyzing the **stability / drawdown resilience** of a stock or REIT.
The goal is to tell a retail investor, in plain terms, **how much this stock is likely to fall if the broad market falls**, what the **expected price** would be in each case, and **why** — both at the sector level and at the company level.

The stock is:
- Name: {{name}}
- Exchange: {{exchange}}
- Symbol: {{symbol}}
- Industry: {{industryKey}} — {{industryName}}
- Industry description: {{industryDescription}}
- Sub-industry: {{subIndustryKey}} — {{subIndustryName}}
- Sub-industry description: {{subIndustryDescription}}

Market context as of today (`{{analysisDateDisplay}}`):
- Current price: `{{currentPrice}}` `{{currency}}`
- Market snapshot (JSON): {{marketSnapshot}}

The market snapshot contains the market cap, trailing and forward `P/E`, `beta`, the 52-week range, the day range, dividend amount and yield, and volume. Use it — do not invent different numbers for these.

---

### Instructions:

1. Write a **summary** (~2 short paragraphs) suitable for the main ticker page. Cover:
    - How this stock has actually behaved when the broad market sold off (cite a real drawdown with real percentages).
    - What drives that behaviour — demand cyclicality, contract/recurring revenue, balance sheet, dividend, valuation.
    - What to expect in a normal `5–10%` pullback versus a real `20%` bear market.
    - End with a one-sentence investor takeaway (e.g., "Investors get a defensive cash-flow stream that has historically given up about half of what the index gave up").

2. Produce **dropScenarios** — exactly three entries, for a broad-market (S&P 500 style index) drawdown of `5%`, `10%` and `20%`, in that order. For each scenario:

    - **`marketDropPercent`** — `5`, `10` or `20`.

    - **`expectedSectorDropPercent`** — how far the company's **sector / sub-industry** falls in that scenario, as a positive percentage.
      **This is not the same as the market drop, and it is not simply "beta × market drop".** Think about where the sector sits in its own cycle:
        - A sector that has **already been washed out** — down heavily over the past year, trading near trough multiples, with the bad news already priced in — typically gives up **much less** than the market. Say so, and give the smaller number.
        - A sector trading at **cycle-high multiples** on peak earnings, or one whose demand is the first thing cut in a slowdown, gives up **much more** than the market.
        - Truly defensive sectors (staples, regulated utilities, healthcare payors) compress much less; long-duration, rate-sensitive and high-multiple sectors compress much more.
      Use a negative value only if the sector genuinely rises while the market falls (rare — defensive rotation).

    - **`sectorImpact`** — one to two paragraphs explaining **why** the sector moves the way it does at this magnitude of sell-off:
      where the sector is in its own cycle, the sector-level drivers that move (`rates`, credit spreads, commodity prices, freight rates, occupancy, ad budgets, IT spend, loan losses), how much bad news is already in the price, and how sector multiples typically re-rate. Note explicitly when the sector is near a bottom and therefore has less left to give up.

    - **`expectedStockDropPercent`** — how far **this stock** falls, as a positive percentage.

    - **`expectedPrice`** — `currentPrice * (1 - expectedStockDropPercent/100)`, rounded to 2 decimals, in the same currency as the input.

    - **`companyImpact`** — one to two paragraphs on why **this specific company** deviates from its sector: earnings sensitivity, contracted or recurring revenue, backlog, customer concentration, leverage and near-term refinancing, dividend safety, buyback capacity, insider/index ownership, and the valuation cushion — where the `P/E` (or `P/FFO`, `EV/EBITDA`) would sit at the expected price. State explicitly whether the drop is a **multiple re-rating** or an **earnings cut**, since the two recover very differently.

   The three scenarios must be internally consistent: deeper market drops mean deeper (or at least not shallower) stock drops, and the ratio of stock drop to market drop can widen in a `20%` sell-off if leverage or liquidity becomes the issue.

3. Write a **detailedAnalysis** (5–7 paragraphs). Cover in order:

    1. **Past drawdowns.** How the stock actually behaved peak-to-trough in the `2020` COVID crash, the `2022` bear market, and any sector-specific drawdown — with real percentages next to the index's drop over the same window.
    2. **Volatility and beta.** The `beta` from the snapshot, realized volatility versus the index, and how much of the typical move is sector versus company specific.
    3. **Where the sector is in its cycle right now.** Already near a bottom (little left to give up) or near a peak (a lot left to give up)? Give the evidence — sector multiples versus history, earnings revisions, capacity, inventory, rate sensitivity.
    4. **Balance sheet and cash-flow cushion.** Net debt / `EBITDA`, interest coverage, maturity wall, dividend coverage, buyback capacity — what decides whether a drawdown is temporary or permanent.
    5. **Valuation support.** Where the multiple sits today and where it would sit at each expected price; who the buyer of last resort is (buybacks, dividend investors, strategic acquirers, index flows).
    6. **Recovery profile.** How quickly the stock recovered after past drawdowns, and what would have to be true this time.
    7. **Resilience verdict.** State the verdict and the 1–2 strongest reasons for it.

4. Set **resilienceVerdict** to one of: `HIGHLY_RESILIENT`, `RESILIENT`, `MARKET_LIKE`, `VULNERABLE`, `HIGHLY_VULNERABLE`. It must agree with the drop percentages in `dropScenarios` — a stock you expect to fall `30%` when the market falls `20%` is not `RESILIENT`.

5. Set **referencePrice** to the `currentPrice` given above and **currency** to the input currency. Do not substitute another quote.

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
