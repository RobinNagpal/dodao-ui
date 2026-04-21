You are analyzing an ETF for retail investors who want clear and simple insights before investing.

The ETF is:

* Name: {{name}}
* Exchange: {{exchange}}
* Symbol: {{symbol}}

The analysis category is: **{{categoryKey}}** (Risk Analysis)

This category focuses on the ETF’s risk profile. The goal is to help investors understand how volatile the ETF is, how much downside it has shown, whether it recovers well after declines, and whether the returns earned have been reasonable for the amount of risk taken.

## Scope guardrails (important)

* Focus only on **volatility, drawdowns, downside protection, capture ratios, risk-adjusted returns, and category-relative risk**.
* Do **not** turn this into a general performance report.
* Do **not** do a cost or management review here.
* Do **not** forecast future volatility or future returns.
* Do **not** repeat the same risk number or opinion more than once.
* Use the provided data as the main source of truth.
* If some important fields are missing, and web access is available, try to find only the missing risk-related information from reliable public sources. But do not override clearly provided input data unless the input is obviously incomplete or conflicting.
* If multiple provided sources differ slightly:
  * Use **morRiskPeriods** first for category-relative risk, portfolio risk score, risk level, risk vs category, return vs category, volatility measures, capture ratios, and drawdown data.
  * Use **stockAnalyzerRiskMetrics** first for beta, Sharpe ratio, Sortino ratio, ATR, RSI, ATH/ATL data, and related dates.
  * Use **financialRiskContext** first for beta, 52-week high/low, and volume context.
  * Use **categoryContext** first for category name, style box, and peer group context.
* Treat the input data as the latest available snapshot unless a field clearly shows a different as-of period.

## Core interpretation principle

Do **not** judge risk in isolation.

Always ask:
* Is this ETF more risky or less risky than its category?
* Are investors being compensated for that risk?
* Does the ETF protect capital better or worse than peers during weak markets?
* Is the downside behavior acceptable for this type of ETF?

A volatile ETF should not automatically be judged harshly if:
* that volatility is normal for its category, and
* its risk-adjusted results are still strong.

Likewise, a low-volatility ETF should not automatically be praised if:
* its downside protection is weak, or
* its returns per unit of risk are poor.

## Instructions

### 1. Write an **overallSummary** (3–5 sentences)

It should:
* State whether the ETF’s overall risk profile currently looks **strong, weak, or mixed**.
* Mention the most decision-useful `3–5` risk numbers.
* Cover both:
  * absolute risk
  * category-relative risk
* End with a plain-English investor takeaway.

Good examples of useful numbers:
* beta
* Sharpe ratio
* Sortino ratio
* drawdown
* upside / downside capture ratio
* risk score
* risk level
* ATR
* distance from ATH or ATL

---

### 2. Write an **overallAnalysisDetails** in **7 paragraphs**, in this exact order, using simple English

Target about `1800–2300` words total.

#### Paragraph 1) Quick risk check
Answer these first in a quick and practical way:
* Is this ETF low risk, moderate risk, or high risk?
* Is it riskier or safer than its category?
* Has it historically protected investors well during declines?
* Do the risk-adjusted return numbers look strong or weak?

This paragraph should feel like a fast investor snapshot.

---

#### Paragraph 2) Volatility profile
Focus on:
* `beta`
* `beta1y`
* `beta2y`
* `beta5y`
* `atr`
* risk and volatility measures from `morRiskPeriods`

Explain:
* how much the ETF tends to move relative to the broader market or benchmark
* whether volatility looks stable across different periods or not
* whether recent volatility seems unusually high or normal
* whether the ETF’s volatility fits its category

Important:
* Explain beta in simple words:
  * above `1` means the ETF tends to move more than the market
  * below `1` means it tends to move less than the market
* Explain ATR in simple words:
  * ATR shows how much the price tends to swing over short periods

Do not judge a high beta as automatically bad. Compare it to category context when possible.

---

#### Paragraph 3) Risk-adjusted returns
Focus on:
* `sharpe`
* `sortino`
* `portfolioRiskScore`
* `morAnalyzerRiskReturn`
* `returnVsCategory`

Explain:
* whether the ETF has delivered enough return for the risk taken
* whether the downside-adjusted return profile looks efficient or weak
* whether the ETF seems to reward investors fairly for the bumps they had to tolerate

Important:
* Sharpe ratio = return earned per unit of total risk
* Sortino ratio = return earned per unit of downside risk
* Higher is generally better, but judge in context

If category-relative return and risk comparisons are available, explain:
* whether the ETF is taking more risk for better results
* or taking more risk without enough payoff

---

#### Paragraph 4) Drawdown and recovery behavior
Focus on:
* `drawdown`
* `drawdownDates`
* `athChgPercent`
* `athDate`
* `atlChgPercent`
* `atlDate`

Explain:
* how bad the worst decline has been
* whether the ETF tends to suffer deep losses or more controlled declines
* whether it has recovered well after major drops
* whether current price position versus ATH/ATL gives useful context about recent stress

Important:
* Explain drawdown in simple words:
  * drawdown means how far the ETF fell from a peak before recovering
* A shallower drawdown is usually better
* But always interpret drawdown relative to category and ETF type

If recovery timing is visible, mention it.  
If not, explain what the available dates still suggest.

---

#### Paragraph 5) Upside and downside capture
Focus on:
* `captureRatios`
* `riskVsCategory`
* `returnVsCategory`

Explain:
* how much of the market’s upside the ETF tends to capture
* how much of the market’s downside it tends to absorb
* whether the ETF has a favorable balance between upside participation and downside control

Important:
* Ideal pattern:
  * reasonably strong upside capture
  * lower downside capture
* If downside capture is very high, explain that the ETF tends to fall a lot when markets fall
* If upside capture is weak, explain that the ETF may lag in strong markets

This paragraph should clearly answer:
* does the ETF give investors an efficient risk trade-off?

---

#### Paragraph 6) Risk score vs category
Focus on:
* `riskScore`
* `riskLevel`
* `riskVsCategory`
* `returnVsCategory`
* `riskPeriods`

Explain:
* how the ETF ranks against category peers across `3-year`, `5-year`, and `10-year` periods when available
* whether it is consistently above-average risk, below-average risk, or mixed
* whether category-relative returns justify that positioning

Important:
* This paragraph should tie together category comparison across time.
* If different periods show different signals, explain that clearly.
* If long-term periods are missing, use the available periods without inventing anything.

A good conclusion here should answer:
* “Compared with similar ETFs, is this one taking too much risk, a reasonable amount of risk, or unusually well-controlled risk?”

---

#### Paragraph 7) Key strengths, key red flags, and final decision framing
List:
* `2–3` biggest strengths, each backed by a number
* `2–3` biggest risks or concerns, each backed by a number when available

Then end with a balanced takeaway:
* “Overall, this ETF’s risk profile looks strong / mixed / weak because …”

Do not forecast what the ETF will do next.
Do not turn this into a general return discussion.

---

### 3. For each factor in the factorAnalysisArray

For every factor below:

* Use the exact **factorAnalysisKey** from the input.
* Write a **oneLineExplanation** in 1 sentence with the clearest takeaway.
* Write a **detailedExplanation** in 1 paragraph.
  * Use the metrics listed in `factorAnalysisMetrics` where possible.
  * Also use any other strongly relevant fields from:
    * `stockAnalyzerRiskMetrics`
    * `morRiskPeriods`
    * `financialRiskContext`
    * `categoryContext`
  * Explain clearly why the evidence supports the decision.
* Decide **result** as `"Pass"` or `"Fail"`.

Important decision rules:
* Be conservative.
* Mark `"Pass"` only when the ETF looks clearly acceptable or strong for that factor.
* Do **not** mark `"Fail"` only because one field is missing.
* If direct data for a factor is missing, use the closest relevant evidence.
* If a factor is not very relevant for this ETF, keep the same key, explain that limitation in the description, and judge it using the closest relevant risk evidence rather than forcing a weak rating.

---

### 4. Comparison rules

For every important opinion, compare the ETF to its category whenever possible.

#### Volatility comparisons
Use category-relative language such as:
* ABOVE category risk
* BELOW category risk
* IN LINE with category risk

Interpret generally like this:
* clearly higher risk than category = **Weak**
* roughly similar risk = **In Line**
* clearly lower risk with acceptable returns = **Strong**

But do not blindly reward low volatility if returns per unit of risk are poor.

#### Risk-adjusted return comparisons
If Sharpe / Sortino / category-relative return data is available:
* higher risk-adjusted return than peers = **Strong**
* similar = **In Line**
* weaker = **Weak**

#### Drawdown comparisons
If peer comparison is available:
* shallower drawdown than category = positive
* similar drawdown = neutral
* deeper drawdown = negative

#### Capture ratio interpretation
General guide:
* upside capture strong + downside capture controlled = favorable
* upside weak + downside high = unfavorable
* both high or both low = mixed, explain carefully

#### Risk score vs category
Use multi-period comparison when available:
* consistently below-average risk vs category = favorable
* consistently above-average risk vs category = concern
* mixed across periods = mixed conclusion

If a benchmark or category comparison is unavailable, do not invent one. Use practical judgment from the numbers provided.

---

### 5. Missing data rules

* If a data point is missing, write `data not provided`.
* Never invent numbers.
* If multiple similar fields exist, use the closest one.
* If reliable web access is available, you may fill only missing risk-related context from trustworthy public sources.
* Prefer provided inputs over web data whenever both are available.
* If peer comparison is missing, still analyze the ETF on an absolute basis using the available values.

---

### 6. Writing rules

* Use markdown format.
* Wrap all important numbers, percentages, ratios, beta values, drawdowns, capture ratios, and risk scores in backticks.
* Use simple English.
* Be factual and direct.
* Give clear opinions, but do not sound dramatic.
* Explain technical terms briefly when needed.
* Share enough numbers to justify every conclusion.
* Do not over-praise or over-criticize the ETF.
* Keep the tone natural and human.

---

### Here are the factors you must analyze:
{{#each factorAnalysisArray}}

* Title: {{factorAnalysisTitle}}
  Description: {{factorAnalysisDescription}}
  Key: {{factorAnalysisKey}}
  Metrics (if available): {{factorAnalysisMetrics}}
{{/each}}

---

### Factor-specific guidance

#### 1) Volatility & Standard Deviation
Main goal:
* Judge how unstable or smooth the ETF’s price behavior is.

Look especially at:
* `beta`
* `beta1y`
* `beta2y`
* `beta5y`
* `atr`
* `riskAndVolatilityMeasures`

Do not judge this factor only from one beta number. Use multiple volatility signals if available.

---

#### 2) Risk-Adjusted Returns
Main goal:
* Judge whether the ETF has earned enough return for the risk investors had to take.

Look especially at:
* `sharpe`
* `sortino`
* `portfolioRiskScore`
* `morAnalyzerRiskReturn`

A risky ETF can still pass if it has clearly strong risk-adjusted returns.  
A low-risk ETF should not pass automatically if its reward per unit of risk is weak.

---

#### 3) Maximum Drawdown & Recovery
Main goal:
* Judge how painful the ETF’s worst declines have been and how well it has bounced back.

Look especially at:
* `drawdown`
* `drawdownDates`
* `athChgPercent`
* `athDate`
* `atlChgPercent`
* `atlDate`

A fund with deep drawdowns or slow recovery should be viewed more cautiously.

---

#### 4) Upside/Downside Capture Ratios
Main goal:
* Judge whether the ETF participates well in market upside without taking too much downside.

Look especially at:
* `captureRatios`
* `riskVsCategory`
* `returnVsCategory`

A good setup is usually:
* healthy upside capture
* lower downside capture

If the ETF captures a lot of downside without delivering clearly better upside, that is a concern.

---

#### 5) Risk Score vs Category
Main goal:
* Judge how the ETF’s full risk profile compares with similar funds across time.

Look especially at:
* `riskScore`
* `riskLevel`
* `riskVsCategory`
* `returnVsCategory`
* `riskPeriods`

Consistency matters here.  
If the ETF looks risky across several periods without enough return advantage, this factor should usually be weak.

---

### Data you can use (provided below)

* Stock Analyzer Risk Metrics: {{stockAnalyzerRiskMetrics}}
* Mor Risk Periods: {{morRiskPeriods}}
* Financial Risk Context: {{financialRiskContext}}
* Category Context: {{categoryContext}}
