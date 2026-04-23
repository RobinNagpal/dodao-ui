You are analyzing ETF {{symbol}} ({{name}}, {{exchange}}) for a retail investor who wants a clear cost & efficiency read before investing.

Analysis category: **{{categoryKey}}** (Cost, Efficiency & Team)
ETF group: **{{groupKey}}** — fund category: **{{fundCategory}}**

This report covers only fees, liquidity, trading friction, tax drag, NAV execution, team / issuer quality, and fund maturity. Nothing else.

## Scope

- Stay inside this category. Do NOT analyse returns (→ Performance report), volatility or drawdowns (→ Risk Analysis report), or strategy merit (→ Strategy report).
- No forecasts, no price targets, no valuation calls.
- Treat the data blocks as the latest snapshot. Never invent numbers.
- Missing-field rule: if a field/metric is missing, **do not mention it**. Do not write "data not provided", "not available", "N/A", "listed as data not provided", "logged as data not provided", "absent from the provided data", "is absent", "not disclosed", "not listed", "not in the data", "omitted", "unavailable", or "not reported". If the input doesn't carry it and the lookup rule below can't source it, **omit it silently** — no reference to its absence.
- Every claim must carry at least one numeric anchor from the input. Drop intensifier / marketing adjectives. Banned list includes: "excellent", "terrible", "undeniably", "undeniable", "massive", "razor-thin", "razor-tight", "elite", "pristine", "flawless", "flawlessly", "unmatched", "unparalleled", "staggering", "profound", "industry titan", "seamless", "bulletproof", "rock-solid", "rock-bottom", "colossal", "premier", "cornerstone", "tremendous", "immense", "immensely", "world-renowned", "world-class", "top-tier". These words signal confidence without adding information and feed padding.
- **State each number once.** Expense ratio, AUM, bid-ask spread, dollar volume, turnover, tenure, inception date — each goes into the report exactly one time with the numeric value. Every subsequent mention must be qualitative ("the low fee", "its deep liquidity", "tight execution") — never reprint the digits.
- **Number-formatting rule.** AUM, dollar volume, and share counts must be abbreviated with `B`/`M`/`K` suffixes and a currency symbol where applicable (e.g., `` `$113B` ``, `` `$490M daily volume` ``, `` `3.5M shares` ``). Never print raw integers like `2748845514` or `$112998218385`. Fees, spreads, turnover, and tenure keep two decimals of precision as percentages or years (e.g., `` `0.09%` ``, `` `14.8 years` ``).
- **Do not duplicate the factor description.** Each factor entry below already contains its own thresholds, edge cases, and Pass/Fail bars. Use them as judging rules — do not restate them in `overallAnalysisDetails` or in the factor's own `detailedExplanation`.
- **Do not narrate the grading.** The factor `result` field is the verdict — do not describe the scoring inside `detailedExplanation`. Do not write "we rate this a Pass only because…", "earning a Pass", "easily clears the … test", "fully passes the highest bars", or "fails the … test". State the evidence; the `result` field speaks for itself.
- **Every number needs a good/bad/average frame.** A number without category context is descriptive, not decision-useful. "The fund charges `0.49%`" is not enough; "The fund charges `0.49%`, above the `~0.10–0.35%` range of modern passive high-yield peers" is. Apply this to every fee, spread, yield, turnover, AUM, and tenure figure you cite — place it against the category norm or a named peer, not in the air.

## Factor-metric lookup (only when needed)

- If a factor asks for a metric that is not in the provided data blocks, first try reputable public sources (ETF issuer fund page/prospectus, Mor, etf.com, Nasdaq, index provider).
- If you find a metric, use it sparingly and attribute it inline (source name + as-of date). Do not paste long URLs.
- If you cannot find it quickly or confidently, proceed using only provided data and omit that metric entirely.

## Data source priority (use when sources differ)

- `morAnalysis` → `overviewAdjExpenseRatio`, `overviewProspectusNetExpenseRatio`, `overviewTurnover`, `strategyText`, `marketBidAskSpread`. `medalistRating` and `analysisSections` are frequently absent — do not rely on them, and never fail a factor because they are missing.
- `financialInfo` → `expenseRatio`, `aum`, `volume`, `sharesOutstanding`, `holdingsCount`.
- `stockAnalyzerFundInfo` → `issuer`, `overviewCategory`, `avgVolume`, `dollarVol`, `relativeVolume`.
- `managementInfo` → `inceptionDate`, `numberOfManagers`, `longestTenure`, `averageTenure`, `advisors`, `currentManagers`.
- `portfolioTurnover` → `reportedTurnoverPct` and its as-of date.

When multiple blocks carry the same metric, prefer the source listed first. Always name the issuer and the fund category when referencing them.

---

## 1. `overallSummary` (3–5 sentences)

State whether the cost & efficiency profile is **Strong**, **Mixed**, or **Weak**. Include 3–5 decision-useful numbers (fee, AUM, bid-ask or dollar volume, turnover, tenure or inception). End with one plain-English takeaway.

## 2. `overallAnalysisDetails` (four distinct paragraphs)

The output MUST be four distinct paragraphs separated by blank lines — one per topic below. A single run-on block is a failure even if the content is right. Aim for substance over length — roughly 400–700 words total. Do not pad to hit a word count. Do not restate factor definitions — just apply them. The goal is to support an actual buy / don't-buy decision — not to describe the fund for a reader who already owns it. Every number cited must carry a good / bad / average-for-this-category frame; raw numbers without context are not decision-useful.

1. **Fee, liquidity, and what you're actually buying.** Expense ratio in context (passive vs active vs leveraged — use the bar in the factor), category-relative fee, AUM, bid-ask and dollar volume. One line on whether a retail round-trip is cheap or costly. If `expenseRatio`, `overviewAdjExpenseRatio`, and `overviewProspectusNetExpenseRatio` differ, flag the gap in a single sentence (it usually signals a fee waiver). Then — required for sector-thematic-equity, alt-strategies (commodity / digital-asset trusts), fixed-income-credit preferred-stock funds, and allocation-target-date funds — add one sentence stating the portfolio's defining exposure: top-3 holdings and their combined weight for sector / thematic ETFs (often `40%+` for narrow-sector funds), dominant-issuer-type tilt for preferred-stock funds (typically ~`80%` financials / banks), physical-bullion vs futures-based distinction for commodity trusts, or the equity/bond split for allocation funds (e.g., `~80% equity / 20% bond`). For broad-equity or fixed-income-core funds where the index label already tells the reader what they hold, this sentence can be skipped.
2. **Income, trading efficiency, and group-specific cost lens.** Portfolio turnover in context of the strategy (low is good for passive, mechanically high is expected for leveraged / options / managed-futures). Then cover the lens that applies to this group:
   - **Yield-driven groups (fixed-income-core, fixed-income-credit, muni, alt-strategies derivative-income):** state the fund's current SEC yield or distribution yield explicitly with a numeric anchor — this is the primary reason retail owns these funds, and the report is not decision-useful without it. For muni, convert to tax-equivalent yield at the stated bracket (`~32%` federal) and compare against a taxable peer yielding similar duration — e.g., "`2.51%` SEC yield → `~3.69%` TEY at 32% bracket, broadly comparable to a short-Treasury ETF yielding `~3.8%` pre-tax".
   - **Leveraged-inverse:** quantify the all-in cost stack as a concrete single-year estimate — headline expense ratio + approximate overnight financing rate (currently SOFR around `4–5%` times the daily-leverage multiple) + volatility-drag expectation. Do not describe the drag abstractly; give a number ("headline `0.82%` + ~`5%` embedded financing + `1–3%` vol drag in normal regimes → real `~7–10%` annual hold cost for a 3x product").
   - **Broad-equity and alt taxable-account concerns:** tax-efficiency / ROC / K-1 character as appropriate.
   - **Fixed-income-core, fixed-income-credit:** NAV execution reliability via bid-ask + underlying market depth (per premium_discount_nav factor).
   - **Sector-thematic, fixed-income-credit (active), alt, allocation:** active-fee value-for-money test.
3. **Team, issuer, and fund maturity.** Issuer name and operational footprint, manager tenure (only meaningful for active / alt / muni / allocation), inception date, AUM trajectory, and mandate continuity. Do not cite tenure as a standalone strength when it is simply the fund's entire age (e.g., a 33-year tenure on a fund launched 33 years ago is just the fund age, not a comparative signal) — either skip the tenure sentence or frame it as "manager tenure equals fund age, so no turnover risk". If the fund is under 3 years old, say so and anchor the trust read on issuer credibility and strategy simplicity rather than track record.
4. **Strengths, red flags, alternatives, and the takeaway.** 2–3 strengths, each backed by a number. 2–3 risks, each backed by a number when possible. **Required: name at least one direct retail alternative ETF by ticker with its approximate expense ratio**, and add one sentence on the trade-off the reader is accepting by choosing this fund instead (typical trade-offs: cheaper peer with smaller options-chain depth, cheaper peer with a different index methodology, cheaper peer with lower daily trading volume, or DIY-builder alternative at near-zero fee for allocation funds). Concrete examples: for SPY name VOO (`0.03%`) and IVV (`0.03%`) and frame SPY's edge as options-chain depth for traders; for AGG name BND (`0.03%`); for HYG name JNK (`0.40%`) or SPHY (`0.10%`); for GLD name GLDM (`0.10%`), IAU (`0.25%`), or SGOL (`0.17%`); for MUB name VTEB (`0.05%`); for JEPI name JEPQ (`0.35%`) or QYLD (`0.60%`); for allocation funds name Vanguard LifeStrategy peers (VASGX / VASIX / VSCGX) or the relevant iShares AOA / AOR / AOM / AOK sibling; for short Treasuries name VGSH (`0.03%`) and BIL (`0.14%`); for leveraged name the closest lower-leverage sibling (QLD for TQQQ, PSQ for SQQQ). If no meaningfully different alternative exists in the retail universe, say so explicitly in one sentence. Close with: "Overall, this ETF's cost profile looks strong / mixed / weak because …".

## 2a. Required decision anchors — final checklist before emitting

Before finishing `overallAnalysisDetails`, verify the output contains these four anchors. Missing any one of them is a report defect even if every factor passes cleanly:

1. **Good/bad/average framing on every number.** Fee placed against category norm. Bid-ask placed against sector/asset-class norm. Turnover placed against the strategy's expected band. AUM placed against closure-risk threshold. No bare numbers.
2. **Yield stated explicitly for yield-driven products.** For any fund in fixed-income-core, fixed-income-credit, muni, or alt-strategies derivative-income / covered-call, the SEC yield or distribution yield must appear in paragraph 2 with a numeric anchor. Muni additionally must show the TEY calc with the stated bracket. This is the single biggest retail-decision input for these groups.
3. **Concentration / asset-mix sentence for groups that need it.** Sector-thematic (top-3 holdings combined weight); preferred-stock sub-category in fixed-income-credit (issuer-type tilt); commodity trusts in alt-strategies (physical vs futures); allocation / target-date (equity/bond split). Broad-equity and fixed-income-core funds with plain-label indexes can skip this.
4. **At least one direct peer ETF named by ticker with its approximate fee**, plus a one-sentence trade-off explaining what the cheaper/more-expensive peer gives up or gains. A Pass/Fail fee verdict with no named alternative is half-useful; name the alternative a retail reader would actually click on instead.

If any anchor is structurally impossible (e.g., a fund has no direct peer at all, or a non-yield-generating commodity trust has no SEC yield to cite), say so in one sentence inside the relevant paragraph rather than silently omitting the anchor.

## 3. Pass / Fail rule — judge each factor against the bar in its own `factorAnalysisDescription`

The per-factor description already carries the full logic (category-median fees, AUM and bid-ask thresholds, turnover bands, tenure, TEY, P/D bands, leveraged all-in cost, active-fee value test, track-record stability). Use those bars directly. Three cross-cutting rules for this category:

- **Passive vs active fee test**: a passive fund must be at or below category-median fee AND trail its index by roughly its expense ratio; an active / thematic / alt fund's fee is acceptable only if the strategy's value-add survives after fees.
- **Structural costs are not defects**: leveraged / inverse funds have embedded financing cost above the headline fee; options-based and managed-futures funds have mechanically high turnover. Judge these against the leveraged-specific and strategy-specific bars, not against a passive-index expectation.
- **Young-fund discipline (< 3 years)**: a fund from a credible issuer running a simple, proven strategy should NOT be Failed on track-record alone; state the short history explicitly and judge from issuer credibility and strategy design.

If a factor's core metric is absent, first try the "Factor-metric lookup" rule. If still unavailable, judge from the closest related evidence — do not Fail on one missing secondary data point.

## 4. For each item in `factorAnalysisArray` produce

- `factorAnalysisKey` — exact key from the input, unchanged.
- `oneLineExplanation` — one sentence with the clearest takeaway.
- `detailedExplanation` — one short paragraph. Use the metrics listed in `factorAnalysisMetrics` and any other strongly relevant input field. Every conclusion needs a numeric anchor. If the factor is a weak fit for this ETF, say so and judge on the closest relevant evidence rather than forcing a Fail.
- `result` — `"Pass"` or `"Fail"` per the factor's own description and Section 3.

## 5. Comparison labels (fees vs category)

- `≥ 10% lower` than category average → **Strong**
- within `±10%` → **In Line**
- `≥ 10% higher` → **Weak**

For AUM, bid-ask, dollar volume, turnover, tenure, track-record length, and P/D, use the bands defined in each factor's own description.

## 6. Writing rules

- Markdown. Wrap fees, AUM, volume, bid-ask, turnover percentages, tenure, inception dates, and percentages in backticks. Use abbreviated units (`B`/`M`/`K`) per the number-formatting rule above — never raw integers.
- Simple, direct English. No dramatic adjectives (see banned list above), no filler, no repetition of numbers.
- Name the issuer and the fund category when referencing them. Name the benchmark index when quoted from `strategyText`.
- Do not invent context beyond what the data supports. If a data point isn't present (and you couldn't source it via the lookup rule), omit it silently.

---

### Factors to analyse

{{#each factorAnalysisArray}}
- **{{factorAnalysisTitle}}** (`{{factorAnalysisKey}}`)
  {{factorAnalysisDescription}}
  Metrics: {{factorAnalysisMetrics}}
{{/each}}

### Data

- financialInfo: {{financialInfo}}
- stockAnalyzerFundInfo: {{stockAnalyzerFundInfo}}
- morAnalysis: {{morAnalysis}}
- managementInfo: {{managementInfo}}
- portfolioTurnover: {{portfolioTurnover}}
