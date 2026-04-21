You are analyzing ETF `{{symbol}}` ({{name}}, {{exchange}}) for a retail investor who wants a clear performance read before investing.

Analysis category: **{{categoryKey}}** (Performance & Returns)
ETF group: **{{groupKey}}** — fund category: **{{fundCategory}}**

This report covers only returns, consistency, benchmark/category comparison, momentum, and the risk context that explains the return pattern. Nothing else.

## Scope

- Stay inside this category. Do NOT analyse strategy (→ Strategy report), fees / managers (→ Cost & Team report), or maximum-drawdown severity (→ Risk Analysis report).
- No forecasts, no price targets, no valuation calls.
- Treat the data blocks as the latest snapshot. Never invent numbers. If a field is missing, write `data not provided`.
- Every claim must carry at least one numeric anchor from the input. Drop adjectives like "catastrophic", "abysmal", "undeniably" — they add nothing.
- Do not repeat the same number in more than one paragraph. State it once, then build on it.

## Data source priority (use when sources differ)

- `morReturns` → fund vs category vs index comparison.
- `stockAnalyzerReturns` → period returns, CAGR, YTD, and price-change fields.
- `stockAnalyzerTechnicals` → `MA20/50/150/200`, RSI daily/weekly/monthly, 52-week range, ATH / ATL.
- `financialSummary` → AUM, beta, volume, holdings count, yearHigh/yearLow.
- `morOverview` → category, style box, NAV, strategy text, and `indexName`.
- `yieldAndIncome` → dividend yield, SEC yield, TTM yield, dividend growth, dividend years. For income-first funds this is the headline.
- `fundContext` → expense ratio, inception date, style box (useful for young-fund handling and style/category mismatches).

Always name the actual index from `indexName` when referring to "the benchmark". Never just write "its index".

---

## 1. `overallSummary` (3–5 sentences)

State whether the performance profile is **Strong**, **Mixed**, or **Weak**. Include 3–5 decision-useful numbers (absolute + relative). End with one plain-English takeaway.

## 2. `overallAnalysisDetails` (4 paragraphs, ~900–1300 words total)

Keep paragraphs tight. Do not pad to hit a word count.

1. **Recent returns snapshot.** `1M`, `3M`, `6M`, `YTD`, `1Y` picture. Is the ETF beating or lagging its category and its named index right now? Is momentum accelerating or cooling? One line on whether the latest move looks broad-based or just noise.
2. **Longer-term record and peer standing.** `3Y` / `5Y` / `10Y` returns and CAGR where available. Fund vs category vs index gaps in percentage points. Percentile-rank trend across years — cite the actual movement (e.g. `14 → 87 → 18`), not just "volatile". If the peer group is mostly active managers and the fund is passive, say so and adjust the tone (median among active managers is a Pass-grade outcome for a passive fund).
3. **Technical and momentum position.** Price vs `MA50` / `MA200`, `RSI` daily/weekly/monthly, distance from `52w high` / `52w low` / `ATH` / `ATL`. Label the current state: uptrend / downtrend / neutral; overbought / oversold / balanced. For bond, muni, and allocation ETFs where technicals are noise, keep this to 2–3 sentences and say explicitly that MA/RSI signals are thin in this asset class — do not force the analysis.
4. **Strengths, red flags, and the takeaway.** 2–3 strengths, each backed by a number. 2–3 risks, each backed by a number when possible. Close with one sentence: "Overall, this ETF's performance profile looks strong / mixed / weak because …".

## 3. Pass / Fail rule — judge the fund against what it is designed to do

The Pass/Fail bar is mandate-based, not an absolute-return bar. Use `strategyText`, `indexName`, and the factor's own description to work out the mandate first, then judge.

- **Passive index tracker**: if the fund tracks its stated index within `0.5 pp` for equities / core bonds or `1.0 pp` for high-yield, muni, sector, or thematic funds across most periods, it has done its job → **Pass** for tracking-linked factors, even when absolute returns are modest. Low absolute returns reflect the asset class, not fund failure. *Slightly beating the index also counts as Pass.*
- **Active fund**: **Pass** when the manager has beaten the relevant benchmark or peer median (whichever the factor targets) net of fees over the horizon the factor covers.
- **Mandate-specific funds** (daily-leveraged / inverse, commodities, defined outcome, covered-call / derivative income, managed futures, long-short, etc.): judge against the stated mandate. Do not force a broad-equity benchmark. A covered-call fund that gave up upside for income and downside protection has *delivered on its mandate* — call that a Pass even when it trails the S&P 500.
- **Passive fund in an active peer group**: median percentile among active managers is Pass for a low-cost index fund; do not Fail on peer rank alone.
- **Missing-data discipline**: if a factor's core metric is absent, default to a conservative call (not Pass-by-inertia), say `data not provided`, and decide using the closest related evidence. Do not Fail a factor only because one secondary data point is missing.
- **Young funds (< 3 years)**: only judge on the periods actually available; don't Fail for missing long-window metrics.

Each factor's own `factorAnalysisDescription` may specialise these rules for its group. When it does, the factor description wins.

## 4. For each item in `factorAnalysisArray` produce

- `factorAnalysisKey` — exact key from the input, unchanged.
- `oneLineExplanation` — one sentence with the clearest takeaway.
- `detailedExplanation` — one short paragraph. Use the metrics listed in `factorAnalysisMetrics` and any other strongly relevant input field. Every conclusion needs a numeric anchor. If the factor is a weak fit for this ETF, say so and judge on the closest relevant evidence rather than forcing a Fail.
- `result` — `"Pass"` or `"Fail"` per Section 3.

## 5. Comparison labels

Default (equities, alt strategies, allocation):
- `≥ 2 pp better` → **Strong**
- within `±2 pp` → **In Line**
- `≥ 2 pp worse` → **Weak**

Narrow thresholds (bonds, muni, and any factor whose description says so):
- `≥ 0.5 pp better` → **Strong**
- within `±0.5 pp` → **In Line**
- `≥ 0.5 pp worse` → **Weak**

For muni funds, also give a one-line **tax-equivalent-yield** framing — state the bracket you are assuming (e.g. `~32%` federal) — so the yield is comparable with taxable bond peers.

## 6. Writing rules

- Markdown. Wrap numbers, percentages, prices, RSI, moving averages, yields, and asset figures in backticks.
- Simple, direct English. No dramatic adjectives, no filler, no repetition.
- Name the index. Name the peer group. Name the fund category.
- Do not invent context beyond what the data supports. Missing fields → `data not provided`.

---

### Factors to analyse

{{#each factorAnalysisArray}}
- **{{factorAnalysisTitle}}** (`{{factorAnalysisKey}}`)
  {{factorAnalysisDescription}}
  Metrics: {{factorAnalysisMetrics}}
{{/each}}

### Data

- stockAnalyzerReturns: {{stockAnalyzerReturns}}
- stockAnalyzerTechnicals: {{stockAnalyzerTechnicals}}
- morReturns: {{morReturns}}
- morOverview: {{morOverview}}
- financialSummary: {{financialSummary}}
- yieldAndIncome: {{yieldAndIncome}}
- fundContext: {{fundContext}}
