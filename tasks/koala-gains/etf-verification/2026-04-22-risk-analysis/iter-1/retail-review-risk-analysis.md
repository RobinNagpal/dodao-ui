# Retail-reader review — risk-analysis — 16 ETFs

- **Date:** 2026-04-22
- **Lens:** Imagine a retail investor reading the report cold, with no other context,
  trying to decide "should I put money in this ETF?" For each ETF, does the analysis
  actually help them decide? When a number is stated, is it framed as good / bad / average
  for this type of fund? Are the tradeoffs clear? Is the "for whom and when" question
  answered?
- **What this review does NOT do:** does not cross-check numbers. Assumes all quoted
  figures are correct. Focuses purely on the decisional usefulness of the analysis.

## Broad-equity

### SPY (Large Blend)
- **Good:** The `Strong` verdict is clear and matches the data; every number is anchored
  to peer context ("`0.80` Sharpe beats the `0.72` category median", "`-23.87%` tracks
  the index perfectly"). The `100`/`100` capture framing tells a retail reader
  immediately that this fund is doing its one job as a passive index proxy.
- **Bad:** `-23.87%` is repeated three times (summary, paragraph 2, factor block) — by
  the third mention it reads as padding. The overall analysis is rendered as a wall of
  text because the paragraph breaks came through as literal `\n\n` characters, which
  hurts skimmability. No explicit "this is appropriate as a core 60-80% holding" line
  — the role is implied, not spelled out. A retail reader deciding between SPY, VOO, and
  VTI would find nothing here to help them choose.

### IWF (Large Growth)
- **Good:** The asymmetric-capture framing (5Y downside `114` vs category `123`, 10Y
  upside `110` vs `106`) gives the retail reader a clean "active-growth-index is beating
  its active peers" signal. The 2022 drop `-30.75%` is explicitly shallower than both
  the benchmark `-32.54%` and the category `-32.44%`, which is exactly the "is the fund
  or the asset class to blame?" framing a retail investor needs.
- **Bad:** The entire overall-analysis section is one giant paragraph (~540 words) with
  no visual breaks, which is brutal for a retail reader trying to scan. Zero backticks
  on numbers, so the digits sink into the prose. The 1Y beta of `1.26` is noted but not
  translated into retail language — something like "expect to feel this fund's drops
  ~26% harder than the broad market". No framing of when a retail investor would pick
  IWF over SPY, which is the obvious decision point for this fund.

## Sector & thematic equity

### XLK (Technology)
- **Good:** Strong overall verdict combined with a clean `Fail` on concentration is
  honest retail framing — "the return is real, so is the single-name risk". The 2022
  drop of `-31.23%` vs the category's `-40.97%` is a crisp "fell ~10pp less than peers"
  data point. The specific top-name breakdown (NVDA `15.45%`, Apple `12.62%`, Microsoft
  `9.77%`) makes the concentration tangible rather than theoretical.
- **Bad:** Dramatic language ("spectacular", "elite", "textbook") slips through and
  undermines the clinical tone — a retail reader looking for objective analysis sees
  marketing. The concentration `Fail` is correctly diagnosed but the analysis stops
  short of the actionable retail question: "should I cap XLK at 5% / 10% / 15% of my
  portfolio?" The stray `[1.1]` citation marker inside the concentration paragraph looks
  like a broken footnote and hurts credibility.

### XLV (Health)
- **Good:** Strong/defensive framing with a 5Y beta of `0.64` and `-15.65%` recent
  drawdown vs the health-category `-29.28%` — a retail reader sees concretely that this
  fund fell roughly half as far as peers. The concentration Pass on Eli Lilly at `~14%`
  (below the 15% red-flag line) is appropriate nuance rather than a blanket green light.
- **Bad:** Doesn't answer the "for whom" question — a retail reader comparing XLV to
  biotech-heavy alternatives or to just owning a broad healthcare exposure has no clear
  guidance. The Eli Lilly concentration is called "borders on meaningful" but no
  monitoring rule is offered ("if LLY stumbles on drug-trial news, the whole fund moves
  with it"). Same stray citation artifact (`[1.6]`) as XLK.

## Leveraged & inverse

### TQQQ (3× Leveraged Equity)
- **Good:** The `Mixed` verdict with the opening "tactical trading instrument rather
  than long-term investment" is exactly the warning a retail reader needs — it arrives
  in the first sentence instead of buried. The `-79.03%` 2022 drawdown placed next to
  the underlying `-24.88%` makes the volatility-drag concept visible without needing a
  math lecture. The `303`/`389` capture asymmetry shows the 3× mandate working on the
  way up but biting harder on the way down, which is the core retail takeaway.
- **Bad:** The `risk_adjusted_return` factor is a dedicated block that just says "these
  metrics don't apply" — it wastes a slot without giving the retail reader anything
  actionable. No concrete holding-period guidance ("days to weeks, not months") despite
  that being the #1 retail question for these products. No framing of who TQQQ is even
  FOR — a bullish tactical trader vs a naive YOLO buyer — so the warning lacks a
  contrasting "here's when it IS rational".

### SQQQ (3× Inverse Equity)
- **Good:** The `Mixed` verdict coupled with "mathematical certainty of wealth
  destruction if held long-term" is the clearest retail warning among all 16 reports —
  a reader cannot miss it. The `-99.96%` cumulative decay number is more decisive than
  any prose could be. The "day-trading and tactical hedging" label answers "what is this
  fund FOR" in three words.
- **Bad:** "Obliteration", "destruction", "inescapable reality", "mathematical certainty
  of portfolio destruction" — disaster language stacked too high, numbs the retail
  reader by the fifth mention. The `risk_adjusted_return` factor is again a "metrics
  don't apply" filler block. No counter-example of when a retail investor might
  legitimately use SQQQ (short-term portfolio hedge) — the ban is absolute when nuance
  would help.

## Fixed income — core

### AGG (Intermediate Core Bond)
- **Good:** Strong "portfolio ballast" framing with near-zero equity beta (`0.27`)
  telling the retail reader exactly why they'd own this alongside stocks. The `-17.19%`
  2022 drawdown explicitly placed next to the category's `-17.16%` correctly reframes
  what looks like disaster as asset-class event — a retail reader isn't panicked into
  selling. R² of `99.94` against the index confirms this is a true-to-label passive
  exposure.
- **Bad:** **Nine factor blocks including four Fails (`volatility_measures`,
  `risk_adjusted_returns`, `drawdown_analysis`, `risk_vs_category`) that contradict the
  canonical five Passes on the exact same data** — a retail reader reading top-to-bottom
  sees "Fail, Fail, Fail, Pass, Pass, Pass" and loses all confidence in the analysis.
  No yield-to-maturity or current distribution-yield framing despite that being the core
  bond-fund retail question. Negative Sharpe `-0.11` is mentioned but not translated
  into plain English ("bond investors haven't been paid for the risk during this rate
  cycle").

### SHY (Short Government)
- **Good:** Strong / highly defensive verdict with `-5.35%` worst drawdown vs category
  `-7.00%` gives a retail reader a concrete "this one fell less than peers even in the
  worst rate shock in a generation" data point. Negative Sharpe framed as a structural
  feature of the rate cycle (cash yields temporarily outpacing short-bond yields), not a
  fund flaw — prevents retail confusion. "Cash-alternative or capital-preservation
  vehicle" explicitly names the use case.
- **Bad:** No backticks on any numbers, so digits blur into prose in a report that's
  already heavy on numbers. Self-contradiction between factor block (5Y Sharpe `-0.98`
  vs category `-0.83` labeled "In Line" under the 0.5pp band) and the strengths
  paragraph (same gap called "minor weakness") — retail reader can't tell which framing
  is right. Does not answer the most important retail question: "should I hold SHY or
  just hold cash / a high-yield savings account?" No current yield / 30-day SEC yield
  number despite that being THE bond-fund retail decision metric.

## Fixed income — credit

### HYG (High Yield)
- **Good:** Mixed verdict with the honest "bumpier ride than peers" framing — the 5Y
  std dev `7.33%` vs category `6.31%` gives the retail reader a concrete "feels more
  volatile" signal. The 2022 drop `-14.86%` vs peer `-13.72%` correctly flags as
  fractionally worse, not catastrophically so. Morningstar "High" 5Y risk with only
  "Average" return is a clean retail warning about the uncompensated volatility.
- **Bad:** **Ten factor blocks with FIVE Fails from duplicate keys plus FIVE Passes on
  the same data** — this is the single worst usability problem across all 16 reports;
  a retail reader reading linearly sees half the report saying "Fail" and half saying
  "Pass" and cannot reconcile them. No distribution-yield or yield-to-maturity framing
  despite that being the entire reason to own a high-yield fund. The 2008 `-25.26%`
  loss is cited but not contextualized as "next credit shock expectation" in plain
  retail language.

### PFF (Preferred Stock)
- **Good:** The `Weak` verdict is bold and decisive — in 16 reports this is one of
  only two Mixed-or-worse calls and the retail reader immediately knows to think twice.
  Every factor reinforces the same story (above-avg risk, below-avg return). Specific
  evidence (`-19.36%` 2022 vs peer `-16.41%`, 3Y Sharpe `0.09` vs `0.56` category) is
  anchored and peer-relative.
- **Bad:** Dramatic language ("radically trailing", "bleed more capital") feels out of
  place in a clinical analysis and undermines the weak verdict's credibility. Does not
  tell the retail reader what preferred-stock alternative (or credit-sleeve alternative
  entirely) IS worth holding, leaving the decision open-ended. No distribution-yield
  framing — preferred stocks are held for income and the report does not weigh
  distribution yield against the drawdowns it spent paragraphs describing.

## Municipal bonds

### MUB (Muni National Interm)
- **Good:** Strong mandate-fit framing with `-11.56%` drawdown vs category `-12.33%`
  gives the retail reader a concrete "this fund held up slightly better than peers in
  2022" signal. Short-term weakness (3Y risk Above Avg, return Below Avg) is honestly
  flagged instead of glossed over. High credit quality + Moderate duration style-box
  framing is clear enough for a retail reader to understand the risk profile.
- **Bad:** Summary verdict "mixed to strong" hedges — a retail reader wants Strong or
  Mixed, not both. **Completely missing tax-equivalent yield framing** — for a muni
  fund this is THE retail decision number (a 4% muni yield at a 35% federal bracket is
  `6.15%` tax-equivalent), and without it a retail reader cannot decide between MUB and
  AGG. Does not name the target retail investor (high-bracket, taxable-account holders
  specifically).

### SUB (Muni National Short)
- **Good:** Clean Strong verdict with `-4.13%` 10Y drawdown vs category `-4.57%` gives
  a retail reader a clear "this fund protected capital in the worst rate shock in
  decades" signal. Short-duration protection is explicitly named as the mechanism
  ("long-duration funds lost `-25%` to `-31%` in 2022, SUB capped at `-4.13%`"). Below
  Avg. return is framed as an "expected trade-off" rather than a hidden weakness.
- **Bad:** No backticks on numbers. The critical retail question — "why SUB over SHY
  (short Treasury)?" — is never addressed; these are the two obvious candidates for a
  conservative-cash sleeve and the report does not help the reader choose. No
  tax-equivalent yield framing despite the entire retail reason for muni exposure being
  tax efficiency. Does not mention the tradeoff of AMT / state-tax treatment for this
  national-muni exposure.

## Alternative strategies

### JEPI (Derivative Income)
- **Good:** Strong verdict with the 5Y capture asymmetry `64`/`60` framed cleanly as
  "covered-call strategy doing its job". The `-13.12%` 2022 drawdown vs category
  `-16.72%` and index `-24.88%` gives the retail reader a visceral "this fund halved
  the index's pain" data point. The explicit tradeoff statement ("investors will
  heavily lag during sustained equity bull runs") is rare honesty in retail product
  analysis.
- **Bad:** Nine factor blocks (due to duplicate legacy keys) produce visible redundancy
  that clutters the narrative. Dramatic language ("spectacular", "phenomenally
  resilient", "exceptionally") makes the analysis read like sponsored content. **No
  distribution-yield framing** — JEPI is an INCOME fund, the `7-9%` distribution yield
  is the entire retail value proposition, and the analysis does not mention it once.
  No comparison to QYLD / SPYI / a dividend-aristocrats alternative for the retail
  "which income fund?" decision.

### GLD (Commodities Focused)
- **Good:** Strong verdict with negative downside capture (`-34` 5Y, `-42` 3Y)
  explicitly framed as "structurally gains ground during benchmark down-months" —
  perfect retail articulation of what "portfolio hedge" means. The protection ratio
  `0.70` vs the index's `-22.48%` 5Y drawdown gives a concrete numeric anchor for the
  decorrelation claim. 10Y Sharpe `0.78` vs category `0.38` is a clean "has rewarded
  the volatility over the long run" data point.
- **Bad:** Does not address the core retail question for gold — is this an inflation
  hedge, a store of value, or a geopolitical hedge? The Sharpe comparison to
  "Commodities Focused" category doesn't help the retail reader because they don't
  know what Sharpe to expect from gold specifically. The 27-month drawdown duration
  is cited as a risk but not translated to "you'd need patience to hold through two
  years of nothing happening". No position-sizing suggestion despite gold conventionally
  being a `5-10%` portfolio sleeve.

## Allocation & target-date

### AOA (Aggressive Allocation)
- **Good:** Strong verdict with an equity beta of `0.77` clearly framing this as an
  80/20 mandate that dampens pure-equity volatility. The 2022 `-23.01%` drawdown
  explicitly contextualised as a rare stock-bond correlation failure, not a fund
  defect, stops retail-panic narratives. Morningstar "Below Avg." risk paired with
  "Above Avg." return across multi-year windows is the cleanest possible retail signal
  — better returns AND less risk than peers.
- **Bad:** No comparison to a pure-equity alternative like SPY (the DIY retail
  question: "why not just hold SPY and take the volatility?"). No comparison to the
  simpler self-built `80% SPY / 20% AGG` portfolio either, which is what most retail
  allocators would compare to. 3Y alpha of `3.03` is cited as a strength but the
  retail reader doesn't know what alpha range is "good" for an allocation fund —
  `+1` / `+3` / `+5`?

### AOK (Conservative Allocation)
- **Good:** Honest `Mixed` verdict that does not sugarcoat the bond-heavy 2022
  exposure. The `-17.53%` drawdown vs category `-14.22%` is a `3.31pp` deeper drop,
  explicitly flagged as "materially worse" — the retail reader gets a clean warning.
  The Above-Avg-risk / Above-Avg-return tradeoff is framed as acceptable ("extra risk
  is utilized effectively") rather than buried.
- **Bad:** Does not compare to AGG (all-bond) — the retail reader deciding between
  AOK and a pure bond fund for a conservative sleeve gets no help. Describes the
  structural weakness as "sensitivity to bond market volatility" without translating
  that into a concrete retail signal ("when rates rise, you still lose money even
  though you hold mostly bonds"). No distribution-yield framing despite this being a
  conservative-income-seeking retail audience. The Mixed verdict leaves the retail
  reader without clear "own this / don't own this" guidance.

---

## Themes across all 16 reports

**Strong across the board:**
- Peer-relative framing of drawdowns is consistently good — almost every report places
  the fund's drop next to the category drop, which is what a retail reader needs.
- Group-specific lenses landed correctly — leveraged funds warn about decay, bond
  funds contextualise 2022 as a rate event, covered-call funds get the asymmetric
  capture frame, commodities get the decorrelation frame.
- Verdicts (Strong / Mixed / Weak) are bold and decisive when warranted (SPY, PFF,
  AOK) rather than hedged.

**Consistently weak for the retail investor:**
- **Yield / distribution-yield framing is absent across nearly every income-relevant
  fund** — bond funds (AGG, SHY, HYG, MUB, SUB), preferred stock (PFF), covered-call
  income (JEPI) all omit the current yield number that is THE primary retail decision
  metric for income-seeking investors. This is the single largest usability gap.
- **"For whom" framing is inconsistent** — some reports (TQQQ, SQQQ, SPY) name the
  target retail user clearly; others (IWF, XLV, GLD, AOA) leave it implicit.
- **"Instead of what" framing is almost always missing** — retail investors deciding
  to buy an ETF have obvious alternatives (SPY vs VOO vs VTI, SHY vs SUB vs cash, AOK
  vs AGG, JEPI vs QYLD, TQQQ vs deep ITM call). The reports rarely bridge to those
  alternatives.
- **Duplicate factor blocks with contradictory Pass/Fail verdicts** (AGG 9 factors,
  HYG 10, JEPI 9) are catastrophic for retail trust in the analysis — this is a data
  pipeline issue, not a prose issue, but it destroys reader confidence.
- **Literal `\n\n` and one-paragraph-wall rendering** (SPY, IWF) reduce scannability
  below what a retail reader will tolerate.
- **Tax framing is missing where it matters** — muni funds without tax-equivalent
  yield, dividend-income funds without qualified-dividend framing.

## Net takeaway

The analyses are strong at "is this fund doing its mandate correctly?" and weak at "is
this fund a good fit for my portfolio and my situation?". The former is a professional
analyst's question; the latter is the retail investor's. The reports would be
materially more useful with three additions across all 16: (1) current yield where
relevant, (2) explicit target retail user and position-sizing guidance, (3) a one-line
"vs the obvious alternative" comparison.
