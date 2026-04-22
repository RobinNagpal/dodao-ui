You are analyzing ETF {{symbol}} ({{name}}, {{exchange}}) for a retail investor who wants a forward-looking positioning read for the next 6–12 months.

Analysis category: **{{categoryKey}}** (Future Performance Outlook)
ETF group: **{{groupKey}}** — fund category: **{{fundCategory}}**

This report is explicitly forward-looking but **NOT predictive**. You must not give a price target or a return forecast. The deliverable is: is the ETF **favorably positioned** or **poorly positioned** given the current regime, expected macro path, and upcoming catalysts — and what should the investor watch.

## Scope

- Stay inside this category. Do NOT re-do the historical returns report (→ Performance & Returns), cost/liquidity report (→ Cost, Efficiency & Team), or backward-looking risk deep dive (→ Risk Analysis).
- Treat the provided data blocks as the latest ETF snapshot. Never invent numbers.
- **Missing-field rule**: if a field/metric is missing, **do not mention it** (no “not available”, “N/A”, “missing data”). Use only what’s present, plus what you can quickly source via lookup.
- Every meaningful claim needs at least one concrete anchor: a number, a named indicator, a dated event, or a cited market-implied expectation. Avoid hype adjectives.
- Do not repeat the same number in more than one paragraph. State it once, then build on it.
- **Do not duplicate the factor description.** Each factor entry below already contains its judging logic and edge cases. Apply it — do not restate it.

## Factor-metric lookup (expected for this category)

This category often cannot be completed using ETF snapshot data alone. You are expected to do light web lookup when needed.

- If a factor needs macro/valuation/flow/positioning/catalyst data not in the input, source it from reputable public sources (FRED/BLS/BEA, Federal Reserve, CME FedWatch-style market-implied path, Treasury curve data, CBOE VIX, ICE/BofA spreads, ETF issuer pages, Morningstar, etf.com, Nasdaq, index provider, large broker research summaries).
- Use it sparingly and attribute inline: **source + as-of date**. Do not paste long URLs.
- If you cannot find a metric quickly or confidently, proceed using provided data and omit the metric silently.

## Data source priority (use when sources differ)

Use these blocks in this order when overlapping fields exist:

- `etfMorPortfolioInfo` → asset allocation, sector exposure, credit quality, fixed-income style (duration/maturity/yield-to-maturity), holdings summary.
- `etfMorAnalyzerInfo` → Mor overview (SEC/TTM yield, turnover, category/style box), holdings.topHoldings, `strategyText`, and any available analysis sections.
- `etfStockAnalyzerInfo` → price/technicals (MA20/50/150/200, RSI daily/weekly/monthly, 52w/ATH/ATL distances), liquidity (avgVolume, dollarVol), flags (options/leverage).
- `etfMorRiskInfo` → drawdown/capture/risk tables that inform regime + volatility fit.
- `etfFinancialInfo` → AUM, expense ratio, P/E, dividend yield, volume, beta.

If you cite “the benchmark”, name it explicitly (index name from holdings/strategy blocks when present).

---

## 1. `overallSummary` (3–5 sentences)

State whether the forward outlook is **Favorable**, **Mixed**, or **Unfavorable** for the next `6–12 months`.

Include 3–5 decision-useful anchors such as:
- one valuation/yield anchor (e.g. forward P/E or SEC yield),
- one macro anchor (e.g. “market pricing X cuts by Y month”, “PMI trend”, “curve shape”),
- one technical/positioning anchor (e.g. price vs `MA200`, `RSI` range, AUM/flow signal),
- one key catalyst window (e.g. next Fed/CPI/earnings window).

End with one plain-English takeaway: what the investor should watch next.

## 2. `overallAnalysisDetails` (4 paragraphs, ~900–1300 words total)

Keep paragraphs tight. Do not pad. Apply factor logic; do not restate factor definitions.

**Formatting rules for this section (strict):**

- Output exactly **4 distinct paragraphs**, separated by a **blank line**. Do NOT run them together into one block with inline labels like `POSITIONING:` or `REGIME FIT:`.
- You may open each paragraph with a short bolded lead (e.g. `**Positioning snapshot.**`), but the paragraph break (blank line) between them is required.
- Do not use a numbered list (`1.`, `2.`, …) that places all four paragraphs on the same line — each paragraph must end with a real line break before the next begins.

1. **Positioning snapshot.** What the fund owns / targets, what that implies (sector/credit/rate/vol exposure), and what the market is currently paying attention to in that exposure. Use top holdings / sector / duration / credit tier where relevant.
2. **Regime fit & the dominant tailwind/headwind.** Name the current macro regime (growth/inflation/policy/financial conditions) with 2–3 indicators. Explain why that regime helps or hurts this ETF’s exposure profile. If this is a rate/credit fund, make the rate-path/duration or credit-spread lens explicit.
3. **Setup quality (valuation + technicals + flows).** One valuation/yield framing and one technical framing (trend / stretched / basing). Add one positioning/flow signal if you can source it. Be disciplined: technicals are secondary for long-horizon bond/muni/allocation funds.
4. **Catalysts and what would change your view.** Name 2–4 catalysts in the next `30–90 days`, with approximate dates and whether each is a tailwind or headwind for THIS ETF. Close with “Favorable / Mixed / Unfavorable because …”.

## 3. Pass / Fail rule — “positioned well” vs “positioned poorly”

Pass/Fail here is **not** “will outperform” — it is “set up well” vs “set up poorly” given:
- current + expected regime,
- valuation margin-of-error,
- technical/trend alignment (only where timing matters),
- catalysts and positioning/flows.

Cross-cutting rules:

- **No single-input dominance**: do not Pass purely on a strong uptrend if valuations/regime are hostile; do not Fail purely on expensive valuation if fundamentals + regime support is clearly strong enough (factor descriptions specify this).
- **Mandate-relative**: evaluate within the ETF’s mandate (e.g., leveraged/inverse timing sensitivity, duration sensitivity for bond funds, volatility sensitivity for option-premium funds).
- **Young-fund discipline (< 3 years)**: do not Fail just because long historical context is absent; use closest peers and current regime logic.

If a factor’s core metric is missing, use the lookup rule first; otherwise judge conservatively using the closest related evidence.

## 4. For each item in `factorAnalysisArray` produce

- `factorAnalysisKey` — exact key from the input, unchanged.
- `oneLineExplanation` — one sentence with the clearest investor takeaway.
- `detailedExplanation` — one short paragraph that applies the factor’s bar to THIS ETF. Use the listed metrics and any strongly relevant input field or lookup result. Anchor conclusions with at least one concrete detail.
- `result` — `"Pass"` or `"Fail"` per Section 3 and the factor’s own description.

## 5. Writing rules

- Markdown. Wrap numbers, yields, spreads, dates, RSI/MAs, and percentages in backticks.
- Use simple, direct English. No hype. No certainty language.
- Attribute external facts inline with source + as-of date (e.g., “CBOE VIX at `18` (CBOE, Apr 2026)”).
- Do not paste long URLs. Do not mention missing data.
- Every sentence must be ordinary readable prose with real spaces between words. Do not emit sequences of words without spaces or concatenated italics (e.g. `_Thefundtradesat..._` is wrong). This applies to both `oneLineExplanation` and `detailedExplanation` in each factor block.

---

### Factors to analyse

{{#each factorAnalysisArray}}
- **{{factorAnalysisTitle}}** (`{{factorAnalysisKey}}`)
  {{factorAnalysisDescription}}
  Metrics: {{factorAnalysisMetrics}}
{{/each}}

### Data

- etfFinancialInfo: {{etfFinancialInfo}}
- etfStockAnalyzerInfo: {{etfStockAnalyzerInfo}}
- etfMorAnalyzerInfo: {{etfMorAnalyzerInfo}}
- etfMorRiskInfo: {{etfMorRiskInfo}}
- etfMorPeopleInfo: {{etfMorPeopleInfo}}
- etfMorPortfolioInfo: {{etfMorPortfolioInfo}}