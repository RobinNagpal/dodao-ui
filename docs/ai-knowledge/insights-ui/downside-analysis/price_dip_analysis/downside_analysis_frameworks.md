## Downside Analysis Frameworks — Comparison Guide

Seven holistic frameworks used by investors and analysts to estimate how much further a stock can decline. Each framework considers multiple dimensions of a business — financials, valuation, market conditions, and competitive dynamics — rather than focusing on a single metric.

---

## 1. Scenario-Based Ratio Modeling

**What it is:** Build 3–5 business-specific scenarios (bull, base, mild bear, severe bear), then for each scenario estimate how key financial ratios (PE, EV/EBITDA, Debt/EBITDA, ROIC, FCF yield, etc.) would change, and translate each ratio move into an expected % price impact. Assign probabilities to each scenario to get a probability-weighted expected price.

**How it works:**
1. Identify 8–12 key ratios across valuation, profitability, leverage, liquidity, and yield
2. Define realistic business scenarios with specific triggers (e.g., "tariffs escalate to Vietnam, gross margin drops 3pp, EBITDA misses 10%")
3. For each scenario, estimate the direction and magnitude of each ratio change
4. Apply price sensitivity per unit of ratio change (e.g., +1x EV/EBITDA ≈ 7% price change)
5. Sum the overlapping price impacts (typically 50–65% of the raw sum to account for overlap)
6. Assign probabilities and compute weighted expected price

**Inputs needed:** Current ratios, business context, industry knowledge, price sensitivity estimates per ratio unit, scenario descriptions with probabilities.

**Strengths:**
- Considers the full picture — valuation, leverage, profitability, cash flow, and shareholder yield simultaneously
- Business-specific: each scenario is grounded in what could actually happen to the company
- Probability-weighted output is more useful than a single point estimate
- Easy to update as new information arrives (adjust probabilities, not the whole model)
- Communicable: non-experts can understand "if X happens, stock goes to Y"

**Weaknesses:**
- Probability assignments are subjective — the biggest source of error
- Price sensitivity per ratio unit is approximate and varies by sector and market regime
- Overlapping effects between ratios are hard to isolate (a margin miss affects PE, ROIC, FCF yield, and leverage simultaneously)
- Can create false precision — a "probability-weighted expected price" of $163 implies more accuracy than exists

**Reliability:** Moderate to high. This is the framework used in our ZBRA/DUOL/VITL/ZG/EQPT analyses. It produces realistic ranges rather than point estimates, and the scenario structure forces you to think through specific business triggers rather than abstract "what if multiples compress."

**Ease of use:** Moderate. Requires understanding of financial ratios and the ability to construct plausible business scenarios. No complex math or modeling software needed. **Best framework for individual investors who know the business well.**

---

## 2. Sum-of-the-Parts (SOTP) Bear Case

**What it is:** Value each business segment, asset class, or revenue stream independently using segment-appropriate multiples or DCF, then sum the parts. For downside analysis, apply "trough" or "distressed" multiples to each segment. This reveals which parts of the business the market is paying for and which provide a valuation floor.

**How it works:**
1. Break the company into distinct segments (by revenue type, geography, or business unit)
2. Assign a trough valuation multiple to each segment based on comparable pure-play companies or historical lows
3. Sum segment values to get enterprise value
4. Subtract net debt, add cash, divide by shares outstanding for per-share value
5. Compare to current price — the gap is your estimated downside (or upside)

**Example:** For Zillow: value Residential at 4x segment EBITDA (trough for advertising), Rentals at 8x (high-growth SaaS comparable), Mortgages at 1x revenue (fintech distressed). Sum = EV. Subtract debt. Compare to market cap.

**Inputs needed:** Segment-level revenue and EBITDA, comparable company multiples for each segment, net debt, share count.

**Strengths:**
- Reveals hidden value or overvaluation in specific segments
- Identifies what the market is "paying for" and what's getting zero credit
- Natural framework for conglomerates, multi-segment companies, or companies in transition
- The "asset floor" (sum of parts at trough multiples) is a genuine estimate of worst-case value
- Useful for identifying breakup value or acquisition floor

**Weaknesses:**
- Segment-level financials aren't always disclosed (especially for private segments or pre-IPO revenue streams)
- Corporate overhead and shared costs are hard to allocate across segments
- Assumes segments could theoretically be separated, which may not be true
- Trough multiples for each segment require independent research
- Doesn't account for negative synergies if the company were actually broken up

**Reliability:** Moderate to high for multi-segment companies. Less useful for single-product companies (like VITL). Wall Street sell-side analysts frequently use SOTP for conglomerates and companies with mixed-growth segments.

**Ease of use:** Moderate. Requires segment-level data and knowledge of comparable pure-play companies. The math is simple but the research is substantial. **Best for multi-segment companies where one division may be masking problems in another.**

---

## 3. Stress Test / Sensitivity Matrix

**What it is:** Systematically vary 2–3 key value drivers (revenue growth, margins, multiple) across a range of outcomes and calculate the stock price at each intersection. The result is a matrix showing the stock price under dozens of combined scenarios, making it easy to see where the "floor" is and how sensitive the stock is to each driver.

**How it works:**
1. Identify the 2–3 variables that matter most (e.g., revenue growth rate and EBITDA margin)
2. Define a range for each variable (e.g., revenue growth from -5% to +15%, margin from 10% to 20%)
3. Build a 2D matrix: each cell = estimated stock price at that combination of inputs
4. Highlight the current price, analyst consensus, and bear case
5. Identify the "break-even" combinations and worst-case corners

**Example matrix (simplified):**

| | Margin 10% | Margin 15% | Margin 20% |
|---|---|---|---|
| Revenue -5% | $12 | $18 | $24 |
| Revenue 0% | $15 | $22 | $29 |
| Revenue +10% | $20 | $30 | $40 |
| Revenue +20% | $26 | $38 | $51 |

**Inputs needed:** 2–3 key financial drivers, a valuation approach to translate them into price (usually EV/EBITDA or PE), current share count and net debt.

**Strengths:**
- Shows the full range of outcomes at a glance
- Reveals which variable matters more (if price is more sensitive to margin than growth, focus your analysis there)
- Objective: once you pick the drivers and ranges, the output is mechanical
- Easy to communicate — executives and non-analysts can read a matrix
- Forces you to consider extreme combinations you might not otherwise think about

**Weaknesses:**
- Limited to 2–3 variables (a third dimension makes the table unreadable)
- Assumes the chosen variables are the right ones — if the real risk is something you didn't vary (e.g., competitive disruption), the matrix misses it
- Does not assign probabilities to the scenarios — all cells appear equally likely
- The valuation methodology (EV/EBITDA, PE) applied to each cell is itself an assumption
- Can produce unrealistically extreme corners (e.g., -5% revenue AND 10% margin simultaneously might be implausible)

**Reliability:** Moderate to high. Widely used by investment banks in pitch books and research reports. The matrix format is the standard way to present "upside/downside" in sell-side research. The reliability depends entirely on choosing the right 2–3 variables.

**Ease of use:** Easy to moderate. Requires a spreadsheet and basic financial math. **The most visual and communicable framework — best for presentations and quick decision-making.**

---

## 4. Precedent Drawdown + Catalyst Mapping

**What it is:** Study how the stock (or close peers) behaved during past downturns that resemble the current situation, then map current catalysts to historical parallels. This combines quantitative drawdown data with qualitative catalyst matching to estimate plausible downside.

**How it works:**
1. Identify the current risk (e.g., "margin compression from input cost inflation")
2. Find 3–5 historical episodes where the same or similar risk hit this company or close peers
3. Measure the peak-to-trough drawdown in each historical episode
4. Assess how the current situation compares to each historical episode (worse? better? similar severity?)
5. Estimate the plausible drawdown range by adjusting historical drawdowns for current-specific factors (valuation starting point, leverage, competitive position)
6. Apply the adjusted drawdown range to the current peak or price level

**Example:** ZBRA experienced a -16% revenue decline in 2023 and the stock fell ~50% peak-to-trough. The current tariff + memory cost situation is similar in severity. But ZBRA's leverage is higher now (3.0x vs. 2.5x then) and starting valuation is lower. Adjusted drawdown estimate: 40–55% from the recent high.

**Inputs needed:** Historical price data for the stock and peers, knowledge of past crises/catalysts, understanding of how current vs. past conditions compare, current valuation and leverage context.

**Strengths:**
- Grounded in what actually happened, not what a model predicts
- Naturally accounts for market psychology and behavioral overreaction patterns
- Captures sector-specific dynamics (e.g., how equipment rental stocks behave in recessions)
- The catalyst mapping forces you to understand why declines happen, not just that they happen
- Useful for identifying whether the current decline is "normal" or "extreme" relative to historical patterns

**Weaknesses:**
- History doesn't repeat exactly — each downturn has unique characteristics
- Survivorship bias: you only have data for companies that survived past drawdowns
- Small sample sizes: a company may have only 2–3 relevant historical episodes
- Newer companies (like EQPT, IPO'd January 2026) have no stock-specific drawdown history
- Requires subjective judgment about how "similar" the current situation is to past episodes

**Reliability:** Moderate. Institutional investors and macro funds routinely use historical analogues ("this looks like the 2015 energy crash" or "this is the 2018 tariff playbook"). The reliability depends on the quality of the analogue selection. Works best when combined with a fundamental framework.

**Ease of use:** Easy to moderate. Requires historical research but no complex modeling. **Best for cyclical and macro-sensitive stocks where past episodes provide clear templates.**

---

## 5. Integrated Fundamental Scorecard

**What it is:** Score a company across 15–25 fundamental metrics spanning valuation, profitability, leverage, growth, and quality. Compare the composite score to historical ranges and peer averages. A deteriorating score signals further downside; a score near historical lows signals the bottom may be near.

**How it works:**
1. Select 15–25 metrics across 5–6 categories:
   - **Valuation:** PE, EV/EBITDA, PS, P/FCF, FCF yield
   - **Profitability:** ROE, ROIC, gross margin, net margin
   - **Leverage:** Debt/EBITDA, interest coverage, Net Debt/Equity
   - **Growth:** Revenue growth, EPS growth, FCF growth
   - **Quality:** SBC dilution, earnings quality (FCF vs. net income), asset turnover
   - **Sentiment:** Analyst revisions, short interest, insider transactions
2. Score each metric on a 1–5 scale (1 = deep value/strong, 5 = expensive/weak)
3. Compute a weighted composite score
4. Compare to the stock's own historical composite (is it at its worst score ever? improving? deteriorating?)
5. Compare to peers — a stock scoring 4.2 in a sector averaging 2.8 has relative downside risk

**Inputs needed:** 15–25 financial metrics, historical values for context, peer data, weighting scheme.

**Strengths:**
- Comprehensive: no single metric can mislead you when you're looking at 20+ simultaneously
- Trend-aware: tracks whether the business is improving or deteriorating across all dimensions
- Peer-relative: reveals if the stock is weak vs. its sector or if the whole sector is weak
- Reduces anchoring bias: forces you to look at metrics you might otherwise ignore
- The composite score is a single number that's easy to track over time

**Weaknesses:**
- Weighting the metrics is subjective — should PE count as much as ROIC? More? Less?
- A composite score can mask a critical red flag (e.g., a stock scores "okay" overall but has 8x Debt/EBITDA)
- Backward-looking: all metrics are based on trailing data
- Requires updating quarterly as new financials come in
- The score has no direct translation to a price target — it tells you "this is risky" but not "the stock will fall 20%"

**Reliability:** Moderate to high as a risk-ranking tool. Quantitative hedge funds (AQR, Two Sigma) use multi-factor models that are essentially sophisticated versions of this scorecard. Simpler versions are used by fundamental investors for portfolio screening. Less useful for predicting exact price declines, but good at ranking "which stocks have the most downside risk."

**Ease of use:** Moderate. Requires data collection and a spreadsheet, but the scoring is mechanical once set up. **Best for comparing downside risk across multiple stocks in a portfolio or watchlist.**

---

## 6. Reverse DCF + Implied Expectations Gap

**What it is:** Instead of building a DCF to estimate intrinsic value, reverse-engineer the DCF to determine what growth, margin, and ROIC assumptions are already baked into the current stock price. Then assess whether those implied assumptions are realistic, optimistic, or pessimistic. The downside = the gap between what's priced in and what's likely to happen in a bear case.

**How it works:**
1. Start with the current stock price and back into the implied enterprise value
2. Using a standard DCF framework, solve for the revenue growth rate, margin, and ROIC that justify the current price
3. Compare these implied assumptions to: (a) the company's own guidance, (b) analyst consensus, (c) historical performance, (d) industry base rates
4. If the implied assumptions are optimistic relative to realistic expectations, quantify the gap
5. Build a "realistic" DCF with more conservative assumptions → the difference between implied value and realistic value is the estimated downside

**Example:** At $94, DUOL's stock implies ~25% revenue growth for 5 years and 30% EBITDA margin. But management guided 15–18% growth and 25% margin. The gap between implied and guided = ~20–30% downside if guidance is met but no upside surprise.

**Inputs needed:** Current stock price, share count, net debt (to get EV), a DCF framework, WACC estimate, and the ability to solve for implied growth/margin.

**Strengths:**
- Answers the most important question: "What does the market already expect?"
- Avoids the classic DCF trap of guessing future cash flows — instead, it tests the current price's assumptions
- Highlights when a stock is priced for perfection (even small misses cause big declines)
- Works for any stock regardless of sector or business model
- Elegant: one framework answers both "how much upside?" and "how much downside?"

**Weaknesses:**
- Still requires a DCF model (with all its sensitivity to WACC and terminal value)
- The "implied assumptions" depend on what DCF structure you use — different models extract different implied growth rates
- Only as good as your assessment of what's "realistic" — if you're wrong about future margins, the gap estimate is wrong
- Doesn't account for sentiment/multiple compression independent of fundamentals
- Computationally more complex than multiple-based analysis

**Reliability:** Moderate to high. Michael Mauboussin (Columbia Business School / Counterpoint Global) is the leading proponent, and his "expectations investing" framework is widely respected. Studies suggest reverse DCF is more useful than traditional DCF because it benchmarks against market expectations rather than trying to predict the future independently.

**Ease of use:** Moderate to difficult. Requires building (or using) a DCF model and solving for implied inputs. Conceptually elegant but mathematically demanding. **Best for investors with DCF modeling skills who want to understand what's already priced in.**

---

## 7. Multi-Factor Risk Decomposition

**What it is:** Decompose the stock's total risk into distinct, measurable factors — macro (GDP, rates, inflation), sector (construction spending, housing volume, egg prices), company-specific (leverage, competitive position, execution), and market structure (liquidity, short interest, lockup expiration). Estimate the downside contribution from each factor independently, then combine them into a total downside estimate.

**How it works:**
1. Identify 5–8 independent risk factors relevant to the stock
2. For each factor, estimate: (a) the probability of the negative scenario, (b) the magnitude of price impact if it occurs, (c) whether it's correlated with other factors
3. Calculate standalone downside from each factor
4. Adjust for correlations (some factors are correlated — a recession hits both demand AND credit markets)
5. Sum the adjusted factor contributions for a total downside estimate
6. Stress test by running the "all factors go wrong simultaneously" scenario

**Example for EQPT:**
| Factor | Probability | Impact if Negative | Standalone Downside |
|--------|------------|-------------------|-------------------|
| Construction spending slowdown | 40% | -15% | -6% |
| Leverage/credit stress | 30% | -20% | -6% |
| Used equipment value decline | 25% | -10% | -2.5% |
| Post-IPO lockup selling | 70% | -8% | -5.6% |
| Interest rate stays elevated | 60% | -5% | -3% |
| Competitor pricing pressure | 20% | -8% | -1.6% |
| **Summed (with 40% correlation haircut)** | | | **~-15%** |

**Inputs needed:** Identification of key risk factors, probability estimates for each, price sensitivity to each factor, correlation estimates between factors.

**Strengths:**
- Treats each risk as independent and measurable — prevents "hand-wavy" scenario descriptions
- Reveals which factors contribute the most downside risk (helps prioritize monitoring)
- Correlation adjustment prevents double-counting (a common error in scenario analysis)
- Can be updated factor-by-factor as new information arrives
- Naturally produces a "risk attribution" — useful for hedging specific risks

**Weaknesses:**
- Factor identification and probability estimation are subjective
- Correlations between factors are hard to estimate and can spike during crises (correlation goes to 1.0 in a crash)
- Assumes risks are somewhat independent, which may not hold in a systemic event
- Mathematically more complex than scenario modeling
- Requires regular re-estimation as macro conditions change
- Can underestimate tail risk if you miss a factor or underestimate correlations

**Reliability:** Moderate to high. This is essentially how professional risk managers at hedge funds and multi-strategy firms think about portfolio risk. The Barra risk model and Bloomberg risk analytics use factor decomposition. For individual stocks, it's less commonly applied but very powerful when done well.

**Ease of use:** Difficult. Requires identifying the right factors, estimating probabilities and sensitivities, and understanding correlation. **Best for sophisticated investors managing a portfolio of positions who need to understand where their risk is concentrated.**

---

## Comparison Matrix

| Framework | Holistic? | Ease of Use | Reliability | Best For | Time Horizon |
|-----------|-----------|-------------|-------------|----------|-------------|
| **Scenario-Based Ratio Modeling** | Yes — covers valuation, leverage, profitability, cash flow | Moderate | Moderate–High | Individual stock deep-dives | 6–18 months |
| **Sum-of-the-Parts Bear Case** | Yes — values each segment independently | Moderate | Moderate–High | Multi-segment companies | 1–3 years |
| **Stress Test / Sensitivity Matrix** | Partial — covers 2–3 key drivers deeply | Easy–Moderate | Moderate–High | Quick visual analysis, presentations | 6–18 months |
| **Precedent Drawdown + Catalyst Mapping** | Yes — combines historical, fundamental, and macro | Easy–Moderate | Moderate | Cyclical/macro-sensitive stocks | 3–18 months |
| **Integrated Fundamental Scorecard** | Yes — 15–25 metrics across all categories | Moderate | Moderate–High | Ranking/comparing multiple stocks | Ongoing |
| **Reverse DCF + Implied Expectations** | Yes — tests all assumptions embedded in the price | Moderate–Difficult | Moderate–High | Stocks priced for perfection | 1–3 years |
| **Multi-Factor Risk Decomposition** | Yes — decomposes into independent risk factors | Difficult | High (when done well) | Portfolio risk management | 3–12 months |

---

## Which Are Easiest to Use?

**Ranked from easiest to hardest:**

1. **Stress Test / Sensitivity Matrix** — Pick 2–3 drivers, build a table, read the answer. A spreadsheet and 30 minutes.
2. **Precedent Drawdown + Catalyst Mapping** — Look at what happened before, ask "is this time similar?" Requires research but no math.
3. **Scenario-Based Ratio Modeling** — Requires ratio knowledge and business judgment, but the math is simple. This is what we used for our 5-stock analysis.
4. **Integrated Fundamental Scorecard** — Mechanical once set up, but initial setup takes time to collect 20+ metrics and define scoring.
5. **Sum-of-the-Parts Bear Case** — Requires segment data and comparable company research.
6. **Reverse DCF + Implied Expectations** — Requires a DCF model and the ability to solve for implied inputs.
7. **Multi-Factor Risk Decomposition** — Requires factor identification, probability estimation, and correlation math.

---

## Which Are Most Reliable?

**Ranked from most to least reliable:**

1. **Scenario-Based Ratio Modeling** — The combination of multiple ratios, business-specific scenarios, and probability weighting produces the most balanced and realistic downside estimates. It's what institutional fundamental investors actually do.
2. **Reverse DCF + Implied Expectations** — Highly reliable because it tests what's already priced in rather than predicting the future. If the market implies 25% growth and guidance is 15%, the math is clear.
3. **Integrated Fundamental Scorecard** — Reliable for ranking relative risk across stocks. Less reliable for predicting exact price declines.
4. **Sum-of-the-Parts Bear Case** — Reliable when segment data is good. Provides a genuine valuation floor.
5. **Stress Test / Sensitivity Matrix** — Reliable for the 2–3 variables tested, but can miss risks outside the matrix.
6. **Multi-Factor Risk Decomposition** — Theoretically the most complete, but reliability depends heavily on factor selection and correlation estimates. Garbage in, garbage out.
7. **Precedent Drawdown + Catalyst Mapping** — Least reliable as a standalone tool because history doesn't repeat exactly. Best used as a complement to fundamental frameworks.

---

## Recommendation

**For individual investors doing deep-dives on specific stocks:** Use **Scenario-Based Ratio Modeling** (Framework 1) as the primary approach, supplemented by a **Stress Test Matrix** (Framework 3) for the 2–3 most important variables. This is the approach used in our ZBRA, DUOL, VITL, ZG, and EQPT analyses.

**For comparing downside risk across a watchlist:** Use an **Integrated Fundamental Scorecard** (Framework 5) to rank stocks, then do deep-dives on the ones that score worst.

**For sophisticated investors with DCF skills:** Start with a **Reverse DCF** (Framework 6) to understand what's priced in, then use **Scenario-Based Ratio Modeling** (Framework 1) to estimate the gap between implied expectations and likely outcomes.

**For portfolio managers:** Use **Multi-Factor Risk Decomposition** (Framework 7) to understand where risk is concentrated across positions, supplemented by **Precedent Drawdown** (Framework 4) for historical context.

The single best framework for most investors is **Scenario-Based Ratio Modeling** — it's holistic, business-grounded, moderate in difficulty, and produces actionable probability-weighted price targets. It's what we've been using throughout this analysis series, and it naturally incorporates elements of the other frameworks (stress testing key variables, checking leverage thresholds, referencing historical parallels).
