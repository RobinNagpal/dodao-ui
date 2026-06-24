You are analyzing ETF {{symbol}} ({{name}}, {{exchange}}) for a retail investor who wants a forward-looking positioning read for the next 6–12 months.

Analysis category: **{{categoryKey}}** (Future Performance Outlook)
ETF group: **{{groupName}}** (`{{groupKey}}`) — fund category: **{{fundCategory}}**
Benchmark index: **{{indexName}}** (may be blank — in that case pick the most suitable benchmark for the fund)
Categories in this group: {{groupCategories}} — some are very similar; treat them as a valid peer set when comparing category vs other categories.

{{#if categoryInstructions}}**Category context (`{{fundCategory}}`).** This block has two parts. First, the most important qualitative facts about this kind of fund (how it selects holdings, its portfolio character, its income & tax nature) — surface the ones that genuinely apply to this ETF. Then some non-exhaustive green flags (signs of a strong fund) and red flags (signs of a weak one): where one is applicable to a forward-outlook evaluation criterion below, use it to inform that judgement. Apply anything only when it is genuinely relevant to this ETF and you can source it confidently, and ignore the whole block if the fund's actual strategy does not match the category.

{{categoryInstructions}}

{{/if}}

**Missing data or factor relevance.** The factors below come from `factorAnalysisArray` (each item's description and group instructions define what to measure). If specific data is missing for a factor, or a listed analysis factor is not meaningfully relevant to this ETF, judge that factor from the fund's **overall quality within its category** and **`{{groupKey}}`** peer framing. When the ETF is **clearly high quality on balance** versus comparable funds in that lens, assign **`Pass`** for that factor rather than failing it only for absent data or weak applicability. When you have direct metric evidence, the factor's Pass/Fail bar still governs.

## Scope

- Stay inside this category. Do NOT re-do the historical returns report (→ Performance & Returns), cost/liquidity report (→ Cost, Efficiency & Team), or backward-looking risk deep dive (→ Risk Analysis).
- Treat the provided data blocks as the latest ETF snapshot. Never invent numbers.
- **Missing-field rule**: if a field/metric is missing, **do not mention it** (no “not available”, “N/A”, “missing data”). Use only what’s present, plus what you can quickly source via lookup.
- Every meaningful claim needs at least one concrete anchor: a number, a named indicator, a dated event, or a cited market-implied expectation. Drop hype / dramatic adjectives — this is a non-exhaustive banned list: **massive, blistering, staggering, spectacular, exceptional / exceptionally, violently, effortlessly, incredibly, insatiable, euphoric, unmatched, supercharging, pristine**. If a word adds drama rather than information, drop it — the numbers and named catalysts do the talking.
- Do not repeat the same number in more than one paragraph. State it once, then build on it.
- **Do not duplicate the factor description.** Each factor entry below already contains its judging logic and edge cases. Apply it — do not restate it.

## Factor-metric lookup (expected for this category)

This category often cannot be completed using ETF snapshot data alone. You are expected to do light web lookup when needed.

- If a factor needs macro/valuation/flow/positioning/catalyst data not in the input, source it from reputable public sources (FRED/BLS/BEA, Federal Reserve, CME FedWatch-style market-implied path, Treasury curve data, CBOE VIX, ICE/BofA spreads, ETF issuer pages, Morningstar, etf.com, Nasdaq, index provider, large broker research summaries).
- Use it sparingly and attribute inline: **source + as-of date**. Do not paste long URLs.
- If you cannot find a metric quickly or confidently, proceed using provided data and omit the metric silently.

## Data source priority (use when sources differ)

Use these blocks in this order when overlapping fields exist:

- `etfMorPortfolioInfo` → asset allocation, sector exposure (vs category + vs index), credit quality, fixed-income style (duration / yield-to-maturity / average maturity), top-10 holdings, holdings summary (equity/bond/other split, % of assets in top 10).
- `etfMorAnalyzerInfo` → `strategyText`, `overviewCategory`, `overviewStyleBox`, `overviewSecYield`, `overviewTtmYield`, and the fund-vs-category-vs-index `returnsAnnual` / `returnsTrailing` tables.
- `etfStockAnalyzerInfo` → full price/technicals (MA20/50/150/200, RSI daily/weekly/monthly, ATH/ATL + 52w distances), multi-period returns 1m → 20y + CAGRs, beta windows, sortino / sharpe / atr, liquidity (avgVolume / dollarVol / relVolume), dividend growth (`divGrowth*`, `divYears`, `divGrYears`), leverage / options / region flags.
- `etfMorRiskInfo` → drawdown / capture / risk-and-volatility tables for the 3-Yr and 5-Yr windows that inform regime + volatility fit.
- `etfFinancialInfo` → `aum`, `pe`, `dividendYield`, `payoutFrequency`, `payoutRatio`, `beta`, `holdings` (count).

If you cite “the benchmark”, name it explicitly (index name from holdings/strategy blocks when present).

---

## 1. `overallSummary` (3–5 sentences)

State whether the forward outlook is **Favorable**, **Mixed**, or **Unfavorable** for the next `6–12 months`.

Include 3–5 decision-useful anchors such as:

- one valuation/yield anchor (e.g. forward P/E or SEC yield),
- one macro anchor (e.g. “market pricing X cuts by Y month”, “PMI trend”, “curve shape”),
- one technical/positioning anchor (e.g. price vs `MA200`, `RSI` range, AUM/flow signal),
- one key catalyst window (e.g. next Fed/CPI/earnings window).

**Forward-return/yield band (mandatory).** Include one sentence that anchors the reader's expected-return picture in plain English. Pick the framing that fits the fund:

- For equity / allocation funds: "expect `low` / `mid` / `high` single-digit (or double-digit) total return over the next 6–12 months, driven primarily by X." Do NOT give a precise point number.
- For bond / muni / preferred / derivative-income funds: frame as expected carry (e.g. "base-case return ≈ the current `SEC yield` of `X%` plus/minus modest price drift from Y"). For munis, translate to tax-equivalent yield for a representative top-bracket retail investor.
- For leveraged/inverse funds: explicitly say no multi-month hold band applies and, in one line, quantify the approximate volatility-decay drag in a sample choppy scenario (e.g. "a flat underlying over 3 months can still cost ~`X%` in this fund").
- For commodity / non-income alt-strategies funds: frame in terms of price-path scenarios driven by the specific macro variable (e.g. real yields, USD, geopolitical risk) — not yield.

End with one plain-English takeaway: what the investor should watch next.

## 2. `overallAnalysisDetails` (4 paragraphs, ~900–1300 words total)

Keep paragraphs tight. Do not pad. Apply factor logic; do not restate factor definitions.

**Formatting rules for this section (strict — retail readability depends on these):**

- Output exactly **4 distinct paragraphs**, separated by a **blank line** (two newlines) between each.
- Inline section labels are **banned**. Do NOT emit any of: `POSITIONING:`, `REGIME FIT:`, `SETUP QUALITY:`, `CATALYSTS:`, `POSITIONING SNAPSHOT:`, or any other ALL-CAPS-COLON label written inline inside the paragraph text. This also applies to any variant like `1. Positioning snapshot.`, `2. Regime fit.`, etc. run on the same line as prose.
- You may open each paragraph with a short bolded lead (e.g. `**Positioning snapshot.**` followed by a space and then prose), but the paragraph break (blank line) between the four paragraphs is required.
- Do not use a numbered list (`1.`, `2.`, …) that places all four paragraphs on the same line — each paragraph must end with a real line break before the next begins.
- **No wall-of-text paragraphs.** No individual paragraph may exceed ~`400` words. If a paragraph approaches that, split the ideas across the four-paragraph structure — do NOT dump the entire analysis into a single block.

1. **Positioning snapshot.** What the fund owns / targets, what that implies (sector / credit / rate / vol exposure), and what the market is currently paying attention to in that exposure. Use top holdings / sector / duration / credit tier where relevant.
2. **Macro regime fit — short and long horizon.** Name the current macro regime (growth / inflation / policy / financial conditions) with 2-3 indicators. Explain why that regime helps or hurts this ETF's exposure profile over the next 6-12 months AND over a 3-5 year secular horizon. Name the 2-4 most relevant near-term catalysts (Fed meetings, CPI prints, OPEC+, elections, earnings windows) with approximate dates and whether each is a tailwind or headwind. If this is a rate / credit fund, make the rate-path / duration or credit-spread lens explicit.
3. **Valuation + cycle position (or group-specific lens).** Apply the factor that fits this group: for equity / allocation / fixed-income funds, one valuation / yield framing combined with the fundamental or credit trajectory. For broad-equity, sector-thematic-equity, leveraged-inverse, and commodities-and-digital-assets, also place the exposure in its cycle (accumulation / markup / distribution / markdown). For commodities-and-digital-assets, add the supply / demand or adoption read for the underlying asset. For leveraged-inverse, add the next-few-weeks vol / trend / binary-event read for the underlying. Be disciplined: technicals are secondary for long-horizon bond / allocation funds.
4. **Verdict, watch-list trigger, and what would change your view.** Close with "Favorable / Mixed / Unfavorable because …". **Verdict-vs-factor-balance rule:** the summary verdict must agree with the balance of factor verdicts — do not label the outlook `Favorable` while two or more factors `Fail`, and do not label it `Unfavorable` while only one factor (or none) `Fail`s. A `Mixed` verdict over four or five `Fail`s reads as a contradiction to a retail reader scanning the factor row; if the factors are genuinely that negative, the verdict is `Unfavorable`, and if the verdict is right, re-examine whether the borderline factors are truly Fails. The narrative verdict and the factor verdicts must tell the same story.

**Decisiveness of the verdict (mandatory in paragraph 4).** Whatever the verdict, finish with one actionable line that helps the retail reader make a decision:

- **If "Mixed"**: give a simple _watch-list trigger_ that would flip the call in either direction (e.g. "flip to Favorable if May core CPI prints ≤ `2.5%`; flip to Unfavorable if credit spreads break above `400 bps`"). "Mixed" without a decision rule is not acceptable.
- **If "Favorable"**: name the type of investor it fits and any obvious caveat (e.g. "fits long-horizon growth allocators; aggressive concentration in `X` means size the position accordingly").
- **If "Unfavorable"**: where relevant, name a _concrete alternative_ from the same broad category (e.g. "if you want the conservative-allocation exposure, SHY/SUB deliver similar yield with materially less rate risk"). Do not invent alternatives outside the fund's category family.

**Audience / suitability line (mandatory where the answer is non-obvious).** For funds where suitability is gated on a specific investor profile, add one short sentence naming it:

- Municipal funds → name the tax-bracket threshold where the tax-equivalent yield beats the taxable alternative.
- Fund-of-funds / target-risk / allocation funds → briefly note the underlying-sleeve fee stack and whether DIY-ing the sleeves is meaningfully cheaper.
- Derivative-income / covered-call funds → state that the headline yield is volatility-dependent and likely to compress in calm regimes; give a plain-English range for a forward distribution.
- Leveraged/inverse funds → explicitly state this is a trading vehicle, not a multi-month hold.

## 3. Pass / Fail rule — “positioned well” vs “positioned poorly”

Pass/Fail here is **not** "will outperform" — it is "set up well" vs "set up poorly" given:

- current + expected regime over both short (6-12mo) and long (3-5y+) horizons,
- valuation margin-of-error and fundamental trajectory,
- cycle position of the fund's specific exposure,
- yield / rate / credit setup (for income and rate-sensitive funds),
- group-specific structural lens (supply-demand for commodities, holding-window vol / trend for leveraged-inverse).

Use the factor's `factorAnalysisDescription` (generic measurement principle and Pass/Fail rule) together with `factorAnalysisGroupInstructions` (group-specific perspective: right regime read, right sub-type lens, right benchmark). When the two appear to conflict, follow the group instructions.

Cross-cutting rules:

- **No single-input dominance**: do not Pass purely on a strong uptrend if valuations/regime are hostile; do not Fail purely on expensive valuation if fundamentals + regime support is clearly strong enough (factor descriptions specify this).
- **Mandate-relative**: evaluate within the ETF’s mandate (e.g., leveraged/inverse timing sensitivity, duration sensitivity for bond funds, volatility sensitivity for option-premium funds).
- **No tautological Fails against the fund's own mandate.** If a factor's core metric is structurally zero by design (e.g. an income factor applied to a pure commodity fund that pays no yield, or a credit-cycle factor applied to a 100% Treasury fund), do not Fail the fund on that basis. Either Pass by default with a one-sentence note that the factor does not meaningfully apply, or defer to the factor's own carve-out language if provided.
- **Young-fund discipline (< 3 years)**: do not Fail just because long historical context is absent; use closest peers and current regime logic.

If a factor’s core metric is missing, use the lookup rule first; otherwise judge conservatively using the closest related evidence.

## 4. For each item in `factorAnalysisArray` produce (VERY IMPORTANT AND MANDATORY)

- `factorAnalysisKey` — use the exact snake_case key from the matching input factor block (for example: short_term_hold_outlook). Output the raw key as plain text — no backticks or other markdown, and never the bolded title or a rephrased form.
- `oneLineExplanation` — one sentence with the clearest investor takeaway.
- `detailedExplanation` — one short paragraph that applies the factor’s bar to THIS ETF. Use the listed metrics and any strongly relevant input field or lookup result. Anchor conclusions with at least one concrete detail.
- `result` — `"Pass"` or `"Fail"` per Section 3 and the factor’s own description.

## 5. Writing rules

- Markdown. Wrap numbers, yields, spreads, dates, RSI/MAs, and percentages in backticks. Exception: `factorAnalysisKey` is an identifier, not a number — output it raw, with no backticks.
- Use simple, direct English. No hype (see the banned list in Scope). No certainty language.
- Attribute external facts inline with source + as-of date (e.g., “CBOE VIX at `18` (CBOE, Apr 2026)”).
- Do not paste long URLs. Do not mention missing data.
- **Whitespace is non-negotiable.** Every sentence must be ordinary readable prose with real spaces between words. Do not emit sequences of words without spaces, and do not wrap multi-word phrases in underscore/italic markup that suppresses spaces (e.g. `_Thefundtradesat..._` is wrong — write it as `_The fund trades at …_` or plain prose). This applies to the entire report, especially the `oneLineExplanation` and `detailedExplanation` in each factor block. If unsure, omit the underscore italics and use plain prose.
- **Translate jargon.** The first time a technical term appears in a given report, add a 3–8 word plain-English gloss in parentheses. Examples: "option-adjusted spread (OAS — extra yield over Treasuries)", "duration of `5.8` years (~5.8% price drop per 1-pp rate rise)", "real yield (nominal yield minus inflation)", "beta slippage (compounding decay in daily-reset leveraged funds)", "term premium (extra yield for holding longer-maturity bonds)". Do not define the same term twice in the same report.
- **Do not repeat the same narrative sentence across paragraphs.** If a macro fact (e.g. "Fed holding at `3.50%–3.75%`") appears in paragraph 2, don't restate it verbatim in paragraph 4 — reference it (e.g. "given the rate hold noted above").
- **When `factorAnalysisArray` contains a factor whose core metric does not meaningfully apply to this fund's mandate** (e.g. income factor on a commodity fund, credit-cycle factor on a 100% Treasury fund), say so in one sentence inside that factor's `detailedExplanation`, and follow the factor's own carve-out language if it provides one. Do not default-Fail.
- **Forward-return horizons — inline only.** If you break down the expected-return reasoning by horizon (e.g. `1 year`, `3 year`, `5 year`), write each horizon as an inline bold prefix on the same line as its reasoning — `**1 year:** <reason in the same sentence>.` — separated by a normal blank line between horizons. NEVER put the period label (`**1 year**`, `### 1 year`, `1 year:` on its own line, etc.) alone on one line with the reasoning starting on the next paragraph. This applies in `overallSummary`, every paragraph of `overallAnalysisDetails`, and every factor `detailedExplanation`. The same rule applies to any other horizon label (`6 months`, `10 year`, etc.). **It does NOT apply to the `expectedNext1YrReturnsReason` / `expectedNext3YrReturnsReason` / `expectedNext5YrReturnsReason` fields — those must contain NO horizon label at all (see Section 6), because the UI prints the `1-Year` / `3-Year` / `5-Year` heading for you.**

## 6. Expected forward returns (with reasons)

In addition to the category analysis above, estimate this ETF's expected **annualized** total return (price appreciation plus reinvested distributions, net of fees) over three horizons. Use the data blocks below — especially the multi-period returns/CAGR in `etfStockAnalyzerInfo`, the yield/valuation signals, the expense ratio, and (for equity funds) the sector mix in `etfMorPortfolioInfo`. Keep these numbers consistent with the qualitative forward-return band you gave in `overallSummary`.

Return each as a plain number representing a percent (e.g. `7.5` means 7.5% per year, `-2` means -2% per year), each paired with a reason:

- `expectedNext1YrReturns` / `expectedNext1YrReturnsReason` — expected annualized return over the next 1 year, and why.
- `expectedNext3YrReturns` / `expectedNext3YrReturnsReason` — expected annualized return over the next 3 years, and why.
- `expectedNext5YrReturns` / `expectedNext5YrReturnsReason` — expected annualized return over the next 5 years, and why.

Shorter horizons are inherently less certain than the 5-year figure — be more conservative the shorter the window. All six fields are required: always provide a numeric best estimate, falling back to the long-run expected return for the fund's asset class/category when fund-specific data is sparse. Each `...Reason` must be about three lines long (2–3 sentences): name the main drivers behind that horizon's number — e.g. valuation/yield starting point, expense drag, the fund's historical CAGR, sector concentration, and the macro/cycle read — citing concrete figures where relevant. Keep it specific to THIS fund, not generic.

**No horizon label inside the `...Reason` fields (strict).** The UI already renders each of these three reasons under its own `1-Year` / `3-Year` / `5-Year` heading. Do NOT begin (or otherwise embed) a horizon label inside the reason text — no `**1 year:**`, `1 year:`, `**3 year:**`, `3 year -`, `(5Y)`, `### 5 year`, or any equivalent prefix. Start each `...Reason` directly with the substantive reasoning sentence. (Example — wrong: "`**1 year:** The undemanding ~15.8 P/E provides a floor…`"; right: "`The undemanding ~15.8 P/E provides a floor…`".) This horizon-label ban applies ONLY to these three `...Reason` fields, where the heading is supplied by the UI; the inline-horizon rule in Section 5 still governs `overallSummary`, `overallAnalysisDetails`, and the factor `detailedExplanation` fields.

---

### Factors to analyse

{{#each factorAnalysisArray}}

#### Title: {{factorAnalysisTitle}}
- Key: {{factorAnalysisKey}} (VERY IMPORTANT AND MANDATORY)
- Description: {{factorAnalysisDescription}}
{{#if factorAnalysisGroupInstructions}}- Group-specific perspective ({{../groupKey}}): {{factorAnalysisGroupInstructions}}
{{/if}}- Metrics (if available): {{factorAnalysisMetrics}}
{{/each}}

### Data

- indexName: {{indexName}}
- groupCategories: {{groupCategories}}
- etfFinancialInfo: {{etfFinancialInfo}}
- etfStockAnalyzerInfo: {{etfStockAnalyzerInfo}}
- etfMorAnalyzerInfo: {{etfMorAnalyzerInfo}}
- etfMorRiskInfo: {{etfMorRiskInfo}}
- etfMorPortfolioInfo: {{etfMorPortfolioInfo}}
