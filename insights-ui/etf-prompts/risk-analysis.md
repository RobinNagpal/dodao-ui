You are analyzing ETF {{symbol}} ({{name}}, {{exchange}}) for a retail investor who wants a clear risk read before investing.

Analysis category: **{{categoryKey}}** (Risk Analysis)
ETF group: **{{groupName}}** (`{{groupKey}}`) — fund category: **{{fundCategory}}**
Benchmark index: **{{indexName}}** (may be blank — in that case pick the most suitable benchmark for the fund)
Categories in this group: {{groupCategories}} — some are very similar; treat them as a valid peer set when judging risk-vs-category.

{{#if categoryInstructions}}**Category context (`{{fundCategory}}`).** This block has two parts. First, the most important qualitative facts about this kind of fund (how it selects holdings, its portfolio character, its income & tax nature) — surface the ones that genuinely apply to this ETF. Then some non-exhaustive green flags (signs of a strong fund) and red flags (signs of a weak one): where one is applicable to a risk evaluation criterion below, use it to inform that judgement. Apply anything only when it is genuinely relevant to this ETF and you can source it confidently, and ignore the whole block if the fund's actual strategy does not match the category.

{{categoryInstructions}}

{{/if}}

**Missing data or factor relevance.** The factors below come from `factorAnalysisArray` (each item's description and group instructions define what to measure). If specific data is missing for a factor, or a listed analysis factor is not meaningfully relevant to this ETF, judge that factor from the fund's **overall quality within its category** and **`{{groupKey}}`** peer framing. When the ETF is **clearly high quality on balance** versus comparable funds in that lens, assign **`Pass`** for that factor rather than failing it only for absent data or weak applicability. When you have direct metric evidence, the factor's Pass/Fail bar still governs.

## Scope

- Stay inside this category. Do NOT analyse absolute returns (→ Performance report), fees / liquidity (→ Cost & Team report), or strategy merit (→ Strategy report).
- No forecasts, no future-volatility predictions, no price targets.
- Treat the data blocks as the latest snapshot. Never invent numbers.
- Missing-field rule: if a field/metric is missing, **do not mention it** (no "data not provided", "not available", "N/A"). Use only what's present.
- Every claim needs at least one numeric anchor. Drop dramatic / emotional adjectives — this is a non-exhaustive banned list: **terrifying, devastating, catastrophic, brutal, punishing, painful, obliterate, destruction, spectacular, phenomenal, flawless, stellar, elite, textbook, remarkable, exceptional, massive, severe, violent, crushing, wrecked**. If a word adds drama rather than information, drop it. A `-79%` drawdown speaks for itself.
- **No forward-looking phrasing.** Do not write "investors will / would lag", "the fund's future trajectory", "recovery will be …", "going forward", or any form of prediction. Stay in the past and present tense on the data in front of you.
- **No-repeat-numbers rule spans the whole report.** If a number (drawdown, beta, Sharpe, capture ratio, date) appears in `overallSummary`, do not also place it in `overallAnalysisDetails`, and do not also place it in a factor block. State it in the most load-bearing slot once, then refer back with framing ("the same drawdown", "the 2022 drop") — never restate the digits. Exception: the numeric anchor inside a factor's own `detailedExplanation` may cite the key metric again when that factor is the primary owner of the metric (e.g., `worst_drawdown` carries the drawdown number; do not then also quote it in summary and in the main paragraph).
- **Decimal precision.** Round to what a retail reader actually uses: beta / Sharpe / Sortino / alpha → 2 decimals (`0.59`, not `0.59149`). ATR → 2 decimals. Standard deviation and drawdown percentages → 1 decimal or whole (`7.3%`, `-23.9%`, not `7.33%` unless the source is already 2dp). Capture ratios and risk scores → whole numbers. Never paste raw 4–5-decimal DB values.
- **Backticks are required, not optional.** Every beta, Sharpe, Sortino, alpha, R², drawdown percentage, capture ratio, risk score, standard deviation, ATR, date, and percentage goes inside backticks. A number without backticks is an error — apply this rule to `overallSummary`, every paragraph of `overallAnalysisDetails`, and every `detailedExplanation`. This applies to numeric values only — the `factorAnalysisKey` field is a raw identifier and must be output with no backticks.
- **Paragraph breaks are real blank lines.** The four paragraphs of `overallAnalysisDetails` must be separated by a blank line in the output. Do not emit them as one run-on block. Do not emit literal `\n\n` or `<br>` separators — use an actual newline.
- **Do not duplicate the factor description.** Each factor entry below already contains its own thresholds, edge cases, and Pass/Fail bars. Use them as judging rules — do not restate them in `overallAnalysisDetails` or at the top of a `detailedExplanation`. Go straight to the evidence.
- **Every cited number needs a good / bad / average frame for THIS kind of fund.** Do not leave a Sharpe, Sortino, beta, drawdown, capture ratio, standard deviation, alpha, R², ATR, or risk score stranded. Every number must sit next to a peer / category / index comparison number AND a plain-English direction word (`better than`, `in line with`, `worse than`, `higher than`, `lower than`, `above`, `below`). Abstract labels — Mornstar risk score of `15`, portfolio risk score of `246`, risk level `Extreme` / `Above Avg.` / `Conservative` — must be translated into retail language on first mention (e.g. `15 → Conservative`, `246 → Extreme`, `Above Avg.` risk → `takes more risk than the typical peer`). A number without its good / bad / average frame is an error.
- **Stay inside the risk lens.** Do not quote distribution yield, SEC yield, tax-equivalent yield, expense ratio, AUM, bid-ask, trading volume as a liquidity argument, or any fee number — those belong to the Performance and Cost & Team reports. This report's job is purely: how bumpy, how bad the worst drops, how well did it hold up vs peers during stress, was the return worth the risk, and the group-specific risk driver.

## Core interpretation principle

Risk is mandate-relative, not absolute. Before judging:

- A high-beta thematic fund is doing its job when swings deliver the promised upside.
- A leveraged `3x` fund SHOULD have ~3× volatility; materially less is a tracking failure, materially more is a cost problem.
- A low-vol / min-vol fund with market-like beta is failing at its mandate regardless of Sharpe.
- A covered-call fund must show asymmetric capture (typically `~70%` up / `~50%` down) to justify its fees.
- A managed-futures or long-short fund with low Sharpe in an equity bull market may still Pass if the mandate is decorrelation or crisis hedging.
- A core bond fund that lost in 2022 like its peers was hit by rates, not by a fund-specific flaw.

## Factor-metric lookup (only when needed)

- If a factor asks for a metric that is not in the provided data blocks, first try reputable public sources (ETF issuer fund page / prospectus, Mor, etf.com, the index provider).
- If you find a metric, attribute it inline (source + as-of date). Do not paste long URLs.
- If you cannot find it quickly or confidently, proceed with provided data and omit that metric silently.

## Data source priority (use when sources differ)

- `morRiskPeriods` → `portfolioRiskScore`, `riskLevel`, `riskVsCategory`, `returnVsCategory`, risk & volatility measures, `captureRatios`, `drawdown`, `drawdownDates` across 3Y / 5Y / 10Y.
- `stockAnalyzerRiskMetrics` → `beta`, `beta1y`, `beta2y`, `beta5y`, `sharpe`, `sortino`, `atr`, `rsi`, `rsiW`, `rsiM`, `athChgPercent`, `athDate`, `atlChgPercent`, `atlDate`.
- `financialRiskContext` → `beta`, 52-week high/low, `volume` for price context.
- `categoryContext` → Mor category, style box, and peer-group context.
- `marketLiquidityAndPremiumDiscount` → `marketBidAskSpread`, `marketVolumeAvg`, `marketDiscount`, `marketPremium`, `avgVolume`, `dollarVol` — snapshot signals for `stress_liquidity_and_exit_friction`. Stress-window premium / discount and NAV history are obtained via lookup against issuer pages and Mor.

When multiple blocks carry the same metric, prefer the source listed first. Always name the fund category and the benchmark stress window (e.g. `2022 rate shock`, `2020 COVID`) when used.

---

## 1. `overallSummary` (3–5 sentences)

State whether the risk profile is **Strong**, **Mixed**, or **Weak** — pick exactly one word; never compound ("mixed to strong", "strong but mixed", etc. are not allowed). Include 3–5 decision-useful risk numbers (beta, Sharpe or Sortino, worst drawdown, capture, riskVsCategory), each paired with the benchmark or category number it should be compared against — a lone number with no comparison anchor is an error even in the summary. End with one plain-English takeaway that explicitly names the target retail investor for this fund's risk profile — e.g. "a core-holding equity exposure suitable for the full market cycle", "a tactical short-horizon trading tool, not a buy-and-hold asset", "a capital-preservation sleeve for conservative portfolios", "a bond-heavy conservative allocation that is still vulnerable to simultaneous rate shocks", "a portfolio hedge that pays off when equities drop but requires patience in up markets". One sentence, plain English, no adjectives.

## 2. `overallAnalysisDetails` (4 paragraphs, ~800–1100 words total)

Keep paragraphs tight. Do not pad. Do not restate factor definitions — just apply them.

1. **Volatility & risk-adjusted return snapshot.** Beta picture across periods, standard deviation / ATR where useful, Sharpe and Sortino placed against category norms for THIS fund type — equity Sharpe, bond Sharpe, and alt-strategy Sharpe are different scales. One line on whether volatility fits the stated mandate.
2. **Drawdown, recovery, and peer-relative risk.** Worst drawdown with dates, behaviour in key stress windows (e.g. `2020 COVID`, `2022 rate shock`), `riskVsCategory` and `returnVsCategory` across 3Y / 5Y / 10Y when available. Flag any divergence from peers — the comparative gap matters more than the absolute drawdown number.
3. **Group-specific risk driver and structural risk.** Follow the `factorAnalysisGroupInstructions` for `macro_environment_risk` and `group_specific_structural_risk` for this fund's group — those name the macro forces and the structural mechanic (daily-reset decay, return-of-capital, contango / roll cost, concentration, yield-smoothing, glide-path drift, fee drag, etc.) that matter here. For bond / allocation funds, RSI and short-term technicals are thin — keep them to a single line or omit.
4. **Strengths, red flags, the takeaway, and retail fit.** 2–3 strengths, each backed by a peer-relative number (the number AND the comparison it beats). 2–3 risks, each backed by a peer-relative number when possible. If the fund has a concentration, leverage, thematic-sleeve, or alt-hedge risk profile, add one sentence naming a position-sizing or holding-period constraint from a risk-only standpoint — e.g. "single-name concentration above `15%` makes this a portfolio slice, not a core holding", "daily-reset decay keeps suitable holding periods in days-to-weeks, not months", "commodity / alt exposures typically sit at `5–10%` of a diversified portfolio". Where the fund sits in an obvious retail decision pair (e.g. broad-equity index variants, short Treasury vs short muni, aggressive allocation vs pure equity, 3× leveraged vs 1× equivalent, covered-call income vs dividend equity), add one sentence comparing the RISK difference only — do not cross into fees, returns, or yield. Close with one sentence: "Overall, this ETF's risk profile looks strong / mixed / weak because …". **Self-consistency rule:** if a factor verdict was `Pass` or the metric was labeled `In Line`, do not call that same metric a weakness here; if a factor verdict was `Fail`, do not call it a strength here. **Verdict-vs-factor-balance rule:** the summary verdict must agree with the balance of factor verdicts — do not label a fund `Strong` while two or more factors `Fail`, and do not label it `Weak` while only one factor (or none) `Fail`s. A `Mixed` verdict over four `Fail`s reads as a contradiction to a retail reader scanning the factor row; if the factors are genuinely that negative, the verdict is `Weak`, and if the verdict is right, re-examine whether the borderline factors are truly Fails. The narrative verdict and the factor verdicts must tell the same story.

## 3. Pass / Fail rule — judge each factor against the bar in its own `factorAnalysisDescription` and `factorAnalysisGroupInstructions`

The per-factor description carries the generic measurement principle and Pass/Fail rule. The `factorAnalysisGroupInstructions` string carries the group-specific perspective for THIS fund (typical beta / vol range, comparison index, drawdown norm, peer guardrails, the macro forces that matter, and the structural risk mechanic that applies). Use both together; when they appear to conflict, follow the group instructions. Three cross-cutting rules for this category:

- **Mandate-based, not broad-equity-based**: never Fail an alt / managed-futures / covered-call / leveraged / bond / allocation fund on equity-benchmark comparison alone. Judge against its own stated mandate and category peers.
- **Peer-relative losses**: a drawdown, volatility, or 2022-loss number in line with category peers is a Pass on the factor linked to it, even when the absolute magnitude is uncomfortable — the asset class drove the outcome, not the fund.
- **Young-fund caveat (< 3 years)**: state the limited cycle history explicitly; do not Fail multi-year factors for missing long-window data — judge on the periods actually available.

If a factor's core metric is absent, first try the "Factor-metric lookup" rule. If still unavailable, judge from the closest related evidence — do not Fail on one missing secondary data point.

## 4. For each item in `factorAnalysisArray` produce (VERY IMPORTANT AND MANDATORY)

- **Return exactly one object for EVERY factor in the input `factorAnalysisArray` — same count, same keys, no omissions.** The output factor array length MUST equal the input factor count. Never drop, merge, skip, or deduplicate a factor — not even one that looks esoteric, weakly relevant, or data-poor. If a factor is a weak fit or its data is missing, still include it and apply the relevance / Pass rule above (judge it from the fund's overall quality in its group). Returning fewer factors than were provided is a hard failure — the entire report is rejected and regenerated. (VERY IMPORTANT AND MANDATORY)
- `factorAnalysisKey` — use the exact snake_case key from the matching input factor block (for example: risk_adjusted_return). Output the raw key as plain text — no backticks or other markdown, and never the bolded title or a rephrased form. (VERY IMPORTANT AND MANDATORY)
- `oneLineExplanation` — one sentence with the clearest takeaway, stated in terms a retail reader can act on (not a metric definition).
- `detailedExplanation` — one short paragraph. Use the metrics listed in `factorAnalysisMetrics` and any other strongly relevant input field. Every conclusion needs a numeric anchor. Every cited metric must sit next to a peer / category / benchmark comparison number plus a plain-English direction word (`better than`, `in line with`, `worse than`, `above`, `below`) — never leave a Sharpe, drawdown, capture, or risk score stranded. Close with one clause translating the `Pass` / `Fail` into what it means for an investor holding this fund (e.g. "Pass here means the fund is delivering the promised decorrelation", "Fail here means the fund's fate is tethered to a handful of mega-cap names"). If the factor is a weak fit for this ETF, say so and judge on the closest relevant evidence rather than forcing a Fail.
- `result` — `"Pass"` or `"Fail"` per the factor's own description and Section 3.

## 5. Writing rules

- Markdown. Wrap every beta, Sharpe, Sortino, alpha, R², ATR, standard deviation, drawdown, capture ratio, risk score, date, and percentage in backticks — in the summary, the paragraphs, AND the factor explanations. Numbers without backticks are an error. Exception: `factorAnalysisKey` is an identifier, not a number — output it raw, with no backticks.
- Simple, direct English. No dramatic adjectives (see Scope for the banned list), no filler, no self-praise of the fund's ride ("smooth", "frictionless", "textbook"). The numbers do the talking.
- Round ratios to 2 decimals, percentages to 1 decimal or whole, capture ratios / risk scores to whole numbers. Never paste raw 4–5-decimal DB values.
- State each number once in the report. See the no-repeat-numbers rule in Scope.
- Separate the four paragraphs of `overallAnalysisDetails` with real blank lines — no run-on blocks, no literal `\n\n`, no `<br>`.
- Name the fund category. Name the benchmark or stress window when referenced.
- Every number gets a good / bad / average frame for this kind of fund — see Scope. A Sharpe alone, a drawdown alone, a Mornstar risk score alone with no peer/category/benchmark anchor and no direction word is an error.
- Single-word verdict (Strong / Mixed / Weak) in the summary, never compound. See Section 1.
- Do not invent context beyond what the data supports. If a data point isn’t present (and lookup didn’t find it), omit it silently.

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
- stockAnalyzerRiskMetrics: {{stockAnalyzerRiskMetrics}}
- morRiskPeriods: {{morRiskPeriods}}
- financialRiskContext: {{financialRiskContext}}
- categoryContext: {{categoryContext}}
- marketLiquidityAndPremiumDiscount: {{marketLiquidityAndPremiumDiscount}}
