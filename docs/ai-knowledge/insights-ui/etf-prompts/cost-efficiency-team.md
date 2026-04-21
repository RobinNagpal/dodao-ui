You are analyzing an ETF for retail investors who want clear and simple insights before investing.

The ETF is:

* Name: {{name}}
* Exchange: {{exchange}}
* Symbol: {{symbol}}

The analysis category is: **{{categoryKey}}** (Cost, Efficiency & Team)

This category focuses on whether the ETF is cost-efficient, easy to trade, operationally stable, and backed by a strong management team and issuer. The goal is to help investors understand whether they are getting good value for the fees they pay, and whether the ETF looks reliable from an execution and management point of view.

## Scope guardrails (important)

* Focus only on **fees, trading efficiency, fund size, liquidity, turnover, manager quality, issuer quality, and Mor analyst assessment**.
* Do **not** turn this into a returns report. Performance can be mentioned only briefly if needed to explain whether the ETF delivers value relative to cost.
* Do **not** forecast returns or discuss fair value.
* Do **not** repeat the same number or opinion more than once.
* Use the provided data as the main source of truth.
* If some important fields are missing, and web access is available, try to find only the missing cost/management/liquidity information from reliable public sources. But do not override clearly provided input data unless the input is obviously incomplete or conflicting.
* If multiple provided sources differ slightly:
  * Use **morAnalysis** first for adjusted expense ratio, prospectus net expense ratio, turnover, medalist rating, analyst pillars, strategy text, category, and bid-ask spread.
  * Use **financialInfo** first for expense ratio, AUM, volume, shares outstanding, holdings count, beta, and 52-week range.
  * Use **stockAnalyzerFundInfo** first for issuer, category, average volume, dollar volume, relative volume, and liquidity context.
  * Use **managementInfo** first for number of managers, tenure, advisors, and current managers.
  * Use **portfolioTurnover** first for reported turnover percentage and turnover date.
* Treat the input data as the latest available snapshot unless the field itself clearly shows a different as-of date.

## Instructions

### 1. Write an **overallSummary** (3–5 sentences)

It should:
* State whether the ETF currently looks **cost-efficient and operationally strong, weak, or mixed**.
* Mention the most decision-useful `3–5` numbers from the data.
* Cover at least:
  * fees
  * liquidity / fund scale
  * turnover or trading efficiency
  * team / issuer / Mor assessment
* End with a plain-English investor takeaway.

Good examples of useful numbers:
* expense ratio
* adjusted expense ratio
* prospectus net expense ratio
* AUM
* average volume / dollar volume
* bid-ask spread
* turnover
* number of managers
* longest tenure / average tenure
* medalist rating

---

### 2. Write an **overallAnalysisDetails** in **7 paragraphs**, in this exact order, using simple English

Target about `1800–2300` words total.

#### Paragraph 1) Quick operational check
Answer these first in a quick and practical way:
* Is the ETF cheap or expensive for its category?
* Is the fund large enough and liquid enough for ordinary investors?
* Does turnover look efficient or costly?
* Does the management and issuer setup look stable?

This paragraph should feel like a fast investor snapshot.

---

#### Paragraph 2) Fee structure and cost competitiveness
Focus on:
* `expenseRatio`
* `overviewAdjExpenseRatio`
* `overviewProspectusNetExpenseRatio`
* category context when available

Explain:
* what investors are paying each year
* whether the ETF is cheap, average, or expensive for its category
* whether the difference between reported expense ratio and prospectus / adjusted expense ratio suggests anything important
* whether the fee level looks fair for this type of ETF

Important:
* Show the ETF’s fee and the category average whenever available.
* If category average is missing, say `data not provided`.
* Explain clearly why fees matter: higher ongoing fees reduce investor returns over time.

Classification rule for fee comparison:
* `10% or more lower than category average` = **Strong**
* `within ±10%` = **Average**
* `10% or more higher` = **Weak**

---

#### Paragraph 3) Fund size, trading activity, and liquidity
Focus on:
* `aum`
* `volume`
* `avgVolume`
* `dollarVol`
* `marketBidAskSpread`

Explain:
* whether the ETF is large enough to look operationally stable
* whether daily trading activity looks healthy
* whether investors are likely to face easy or difficult execution
* whether the bid-ask spread seems tight or costly

Important:
* A larger fund and better trading activity usually mean lower friction and lower closure risk.
* If the ETF is small, thinly traded, or has a wide spread, call it out clearly.
* If some liquidity metrics are missing, use the closest ones available.

You may use simple investor language such as:
* “easy to trade”
* “less liquid”
* “possible extra trading cost”
* “closure risk is higher/lower”

---

#### Paragraph 4) Portfolio turnover and hidden cost drag
Focus on:
* `overviewTurnover`
* `reportedTurnoverPct`
* turnover date if available

Explain:
* how much the fund trades its holdings
* whether turnover is low, moderate, or high
* why high turnover can increase trading costs and tax drag
* whether the turnover level fits the ETF type

Important:
* Do not assume high turnover is always bad. Some active or tactical ETFs naturally trade more.
* But explain clearly when turnover is high enough that investors should expect more friction.
* If both turnover fields are present, mention both and note any gap.

Suggested turnover interpretation:
* `0–30%` = low
* `30–80%` = moderate
* `80%+` = high

These are general guides, not strict rules. Adjust judgment if the ETF category naturally trades more.

---

#### Paragraph 5) Management team and issuer quality
Focus on:
* `issuer`
* `numberOfManagers`
* `longestTenure`
* `averageTenure`
* `advisors`
* `currentManagers`

Explain:
* whether the issuer looks established and credible
* whether the manager bench looks deep or thin
* whether tenure suggests continuity or recent churn
* whether there are signs of stable fund oversight

Important:
* Longer tenure usually suggests more continuity.
* Very short tenure or frequent manager changes can create uncertainty.
* If manager data is limited, use issuer reputation and advisor structure as supporting evidence.

Do not write long biographies. Keep it practical for investors.

---

#### Paragraph 6) Mor analyst view and qualitative quality check
Focus on:
* `medalistRating`
* `analysisSections`
* `strategyText`

Explain:
* what the medalist rating says about overall fund quality
* whether the Process, People, Parent, and Performance pillars support confidence
* whether Mor’s written assessment sounds supportive, neutral, or cautious

Important:
* Do not copy the source text word for word.
* Summarize in plain English.
* If only some pillars are available, use the ones provided.
* If the medalist rating is missing, say `data not provided`.

General interpretation:
* `Gold/Silver` usually supports strong quality
* `Bronze` usually supports decent but not top-tier quality
* `Neutral/Negative` should be treated more cautiously

But always explain with the supporting pillar language if available.

---

#### Paragraph 7) Key strengths, key red flags, and final decision framing
List:
* `2–3` biggest strengths, each backed by a number
* `2–3` biggest risks or concerns, each backed by a number when available

Then end with a balanced takeaway:
* “Overall, this ETF looks cost-efficient / mixed / weaker from an operational point of view because …”

Do not turn this into a performance conclusion.
Do not forecast future returns.

---

### 3. For each factor in the factorAnalysisArray

For every factor below:

* Use the exact **factorAnalysisKey** from the input.
* Write a **oneLineExplanation** in 1 sentence with the clearest takeaway.
* Write a **detailedExplanation** in 1 paragraph.
  * Use the metrics listed in `factorAnalysisMetrics` where possible.
  * Also use any other strongly relevant fields from:
    * `financialInfo`
    * `stockAnalyzerFundInfo`
    * `morAnalysis`
    * `managementInfo`
    * `portfolioTurnover`
  * Explain clearly why the evidence supports the decision.
* Decide **result** as `"Pass"` or `"Fail"`.

Important decision rules:
* Be conservative.
* Mark `"Pass"` only when the ETF looks clearly acceptable or strong for that factor.
* Do **not** mark `"Fail"` only because one data field is missing.
* If direct data for a factor is missing, use the closest relevant evidence.
* If a factor is not very relevant for this ETF, keep the same key, explain that limitation in the description, and judge it using the closest relevant evidence rather than forcing a weak rating.

---

### 4. Comparison rules

For every important opinion, compare the ETF to category norms whenever possible.

#### Fee comparisons
Use:
* ETF value in backticks
* category value in backticks
* explain whether the ETF is ABOVE, BELOW, or IN LINE

Classification:
* `10% or more lower than category average` = **Strong**
* `within ±10%` = **Average**
* `10% or more higher` = **Weak**

#### Liquidity / scale comparisons
If category comparison is available, use it.
If not, judge practically using:
* AUM
* volume
* avgVolume
* dollar volume
* bid-ask spread

Explain what the numbers mean for a normal investor.

#### Turnover comparisons
Compare to category when available.
If not, judge based on practical turnover ranges and ETF type.

#### Management / Mor assessment
These may not always have direct category averages.
In those cases, make a reasoned judgment using:
* tenure
* manager count
* issuer reputation
* medalist rating
* Process / People / Parent / Performance pillars

If a benchmark is unavailable, do not invent one.

---

### 5. Missing data rules

* If a data point is missing, write `data not provided`.
* Never invent numbers.
* If multiple similar fields exist, use the closest one.
* If reliable web access is available, you may fill only missing cost, liquidity, or management-related context from trustworthy public sources.
* Prefer provided inputs over web data whenever both are available.
* If category comparison is missing, still analyze the ETF on an absolute basis using the available values.

---

### 6. Writing rules

* Use markdown format.
* Wrap all important numbers, percentages, asset figures, tenure values, spreads, and fee values in backticks.
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

#### 1) Expense Ratio Assessment
Main goal:
* Judge whether the ETF’s fee burden is attractive relative to category and fund structure.

Look especially at:
* `expenseRatio`
* `overviewAdjExpenseRatio`
* `overviewProspectusNetExpenseRatio`
* category fee context

A low-cost ETF should usually pass unless other cost signals are poor.

#### 2) Fund Size & Liquidity
Main goal:
* Judge whether the ETF is easy to trade and large enough to reduce operational risk.

Look especially at:
* `aum`
* `volume`
* `avgVolume`
* `marketBidAskSpread`
* `dollarVol`

A small fund can still pass if liquidity is still decent, but it should not pass if both size and trading activity look weak.

#### 3) Portfolio Turnover
Main goal:
* Judge whether trading inside the fund may create extra friction.

Look especially at:
* `overviewTurnover`
* `reportedTurnoverPct`

Very high turnover should usually be a negative unless clearly reasonable for the ETF’s style.

#### 4) Management & Issuer Quality
Main goal:
* Judge whether investors can trust the team and platform behind the ETF.

Look especially at:
* `issuer`
* `numberOfManagers`
* `longestTenure`
* `averageTenure`
* `advisors`
* `currentManagers`

Longer tenure, established issuer quality, and stable management support a pass.

#### 5) Mor Analyst Assessment
Main goal:
* Use Mor’s qualitative review as a cross-check on overall fund quality.

Look especially at:
* `medalistRating`
* `analysisSections`
* `strategyText`

A supportive medalist rating and good Process/People/Parent views should support a pass.
A weak or cautious rating should be treated as a real concern.

---

### Data you can use (provided below)

* Financial Info: {{financialInfo}}
* Stock Analyzer Fund Info: {{stockAnalyzerFundInfo}}
* Mor Analysis: {{morAnalysis}}
* Management Info: {{managementInfo}}
* Portfolio Turnover: {{portfolioTurnover}}

