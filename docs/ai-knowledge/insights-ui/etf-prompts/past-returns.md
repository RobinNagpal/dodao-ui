You are analyzing an ETF for retail investors who want clear and simple insights before investing.

The ETF is:

* Name: {{name}}
* Exchange: {{exchange}}
* Symbol: {{symbol}}

The analysis category is: **{{categoryKey}}** (Performance & Returns)

This category focuses only on how the ETF has performed across different time periods, how consistent those returns have been, how it compares with its category and benchmark, and what the technical data says about its current position.

## Scope guardrails (important)

* Focus on **returns, performance consistency, benchmark comparison, momentum, and risk context** only.
* Do **not** do deep strategy analysis here. That belongs to the Strategy report.
* Do **not** do deep discussion of expense ratio, portfolio manager quality, or operational efficiency here. That belongs to the Cost, Efficiency & Team report.
* Do **not** forecast future returns or give price targets.
* Do **not** repeat the same numbers again and again. Mention a number once clearly, then build on it.
* Use the provided data as the main source of truth.
* If some important data is missing, and web access is available, try to find only the missing performance-related information from reliable public sources. But do not override clearly provided input data unless the input is obviously incomplete or conflicting.
* If multiple provided sources differ slightly:
  * Use **morReturns** first for fund vs category vs index comparison.
  * Use **stockAnalyzerReturns** first for period returns, CAGR, and YTD return snapshot.
  * Use **stockAnalyzerTechnicals** first for moving averages, RSI, price vs highs/lows, and momentum context.
  * Use **financialSummary** for AUM, beta, volume, holdings count, and 52-week range context.
  * Use **morOverview** for category, style box, index name, strategy text, NAV, and total assets context.
* Treat the provided dataset as the latest available snapshot. Do not randomly anchor the write-up to old calendar years unless the input explicitly gives those period labels.

## Instructions

### 1. Write an **overallSummary** (3–5 sentences)

It should:
* State whether the ETF’s performance profile currently looks **strong, weak, or mixed**.
* Mention the most decision-useful `3–5` numbers from the inputs.
* Include both **absolute performance** and **relative performance**.
* End with a plain-English takeaway for investors.

Good examples of useful numbers:
* `1Y`, `3Y`, `5Y`, or `YTD` return
* `3Y` or `5Y` CAGR
* fund vs category gap
* fund vs index gap
* current RSI
* price vs `MA50` / `MA200`
* beta
* AUM or volume if relevant for context

---

### 2. Write an **overallAnalysisDetails** in **7 paragraphs**, in this exact order, using simple English

Target about `1800–2300` words total.

#### Paragraph 1) Quick performance check
Answer these first in a quick and useful way:
* Has the ETF performed well recently?
* Is the ETF beating or lagging its category?
* Is it beating or lagging its benchmark/index?
* Does the technical data show strength, weakness, or mixed momentum right now?

This paragraph should feel like a fast investor snapshot.

---

#### Paragraph 2) Recent return picture
Focus on shorter periods such as:
* `1M`
* `3M`
* `6M`
* `YTD`
* `1Y`

Explain:
* Whether recent returns are strong or weak
* Whether the ETF is accelerating or cooling down
* Whether recent gains/losses look broad-based or just short-term noise

Use the clearest numbers available from `stockAnalyzerReturns` and `morReturns`.

---

#### Paragraph 3) Medium- and long-term compounding
Focus on:
* `3Y`
* `5Y`
* `10Y`
* and CAGR values when available

Explain:
* Whether the ETF has created solid wealth over time
* Whether its performance looks durable or uneven
* Whether shorter-term weakness is part of a longer strong record, or whether long-term returns are also weak

Keep this grounded in actual return figures. Do not drift into predictions.

---

#### Paragraph 4) Relative performance vs category and benchmark
This is one of the most important paragraphs.

Compare the ETF against:
* its **category**
* its **index / benchmark**

For each important period that is available, explicitly show:
* the ETF return
* the category return
* the index return
* the gap in percentage points

Use wording like:
* ABOVE category
* BELOW category
* IN LINE with category
* ABOVE benchmark
* BELOW benchmark
* IN LINE with benchmark

Classification rule for return comparisons:
* `>= 2 percentage points better` = **Strong**
* `within ±2 percentage points` = **In Line**
* `>= 2 percentage points worse` = **Weak**

Explain what this means in simple terms:
* Is the ETF adding value?
* Is it just matching the market?
* Is it underperforming despite taking similar risk?

If a category or index value is missing for a period, say `data not provided`.

---

#### Paragraph 5) Technical and momentum position
Use `stockAnalyzerTechnicals` to explain:
* price vs `MA20`, `MA50`, `MA150`, `MA200`
* RSI daily / weekly / monthly
* distance from `52-week high`, `52-week low`, `ATH`, or `ATL` when available

Answer:
* Is the ETF currently in an uptrend, downtrend, or neutral range?
* Is it overbought, oversold, or balanced?
* Does momentum support the recent return picture, or does it conflict with it?

Keep this practical. Explain what moving averages and RSI mean in very simple words when you use them.

---

#### Paragraph 6) Risk context, volatility, and fund size
Use `financialSummary` and any useful overview fields.

Cover:
* beta
* AUM / total assets
* trading volume
* holdings count
* 52-week range
* any major context from style box or category if helpful

Explain:
* whether the ETF’s return pattern comes with high or moderate volatility
* whether size and trading activity look comfortable for ordinary investors
* whether concentration or very low fund scale could make the return profile less dependable

Important:
* Do not turn this into a holdings analysis
* Only use these points to explain the performance profile better

---

#### Paragraph 7) Key strengths, key red flags, and final decision framing
List:
* `2–3` biggest strengths, each backed by a number
* `2–3` biggest risks or concerns, each backed by a number when available

Then end with a balanced takeaway:
* “Overall, this ETF’s performance profile looks strong / mixed / weak because …”

Do not forecast future returns. Do not discuss valuation.

---

### 3. For each factor in the factorAnalysisArray

For every factor below:

* Use the exact **factorAnalysisKey** from the input.
* Write a **oneLineExplanation** in 1 sentence with the clearest takeaway.
* Write a **detailedExplanation** in 1 paragraph.
  * Use the metrics listed in `factorAnalysisMetrics` where possible.
  * Also use any other strongly relevant fields from:
    * `stockAnalyzerReturns`
    * `stockAnalyzerTechnicals`
    * `morReturns`
    * `morOverview`
    * `financialSummary`
  * Explain clearly why the evidence supports the decision.
* Decide **result** as `"Pass"` or `"Fail"`.

Important decision rule:
* Be conservative.
* Mark `"Pass"` only when the ETF shows clearly respectable performance for that factor.
* Do **not** mark `"Fail"` just because one data point is missing.
* If direct data for a factor is missing, use the closest relevant evidence.
* If the factor is not very relevant for this ETF, keep the same key, explain that limitation in the description, and judge based on the closest performance-related evidence rather than forcing a bad rating.

---

### 4. Comparison rules

For every important opinion:
* Compare the ETF against its **category** and **benchmark/index** whenever possible.
* Show values in backticks.
* Show the performance gap in **percentage points** when possible.
* Explain what the difference means in plain English.

Use these labels:
* **Strong** = ETF beats comparison by `2` or more percentage points
* **In Line** = ETF is within `±2` percentage points
* **Weak** = ETF trails by `2` or more percentage points

Do not use stock-style industry benchmarking rules here.

---

### 5. Missing data rules

* If a data point is missing, write `data not provided`.
* Never invent numbers.
* If some fields are missing, use the closest related field.
* If reliable web access is available, you may fill only missing performance-related context from trustworthy sources.
* Prefer provided inputs over web data whenever both are available.
* If benchmark/category comparison is missing for some periods, still analyze the periods that are available.

---

### 6. Writing rules

* Use markdown format.
* Wrap all important numbers, percentages, dollar values, averages, RSI values, moving averages, and asset figures in backticks.
* Use simple English.
* Be factual and direct.
* Give clear opinions, but do not sound dramatic.
* Explain technical words briefly when needed.
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

### Data you can use (provided below)

* Stock Analyzer Returns: {{stockAnalyzerReturns}}
* Stock Analyzer Technicals: {{stockAnalyzerTechnicals}}
* MOR Returns: {{morReturns}}
* MOR Overview: {{morOverview}}
* Financial Summary: {{financialSummary}}
