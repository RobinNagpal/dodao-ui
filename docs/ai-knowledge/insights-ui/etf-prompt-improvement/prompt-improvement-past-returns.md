# Prompt Improvement Summary — All 11 ETFs

**Date**: 2026-04-16

Condensed review of the 11 per-ETF prompt improvement files. For each ETF, the 6-7 most important gaps or issues are listed — focusing on missing data, wrong analysis framing, and misleading outputs that a retail investor would find confusing or harmful.

---

## Bond ETFs

### AAA (Alternative Access First Priority CLO Bond ETF)

1. **No yield/income data** — retail investors buy bond ETFs for income, yet distribution yield, SEC yield, and income-vs-price return breakdown are completely absent from the prompt input schema.
2. **No asset-class awareness** — the prompt treats every ETF identically; a CLO bond ETF returning 6.51% CAGR is excellent for its class but the prompt frames it with equity-style "wealth creation" language.
3. **Technical analysis is meaningless** — the fund trades in a $24.33-$25.14 range (3.3% band); MA crossovers and RSI are noise for a bond ETF driven by rates and credit spreads.
4. **+-2pp comparison threshold too coarse for bonds** — underperforming by 1pp on a 5-6% return means giving up ~17% of available return, yet it's labeled "In Line."
5. **Pass/Fail too binary for young funds** — long_term_cagr gets Pass despite having zero of its defined metrics (5Y/10Y/15Y/20Y); the model substituted 3Y data, which is misleading.
6. **Percentile rank data severely underutilized** — percentile dropped from 8 (top decile, 2021) to 96 (bottom 4%, 2025); this dramatic deterioration is never highlighted.
7. **Missing benchmark identity** — indexName is null yet the output repeatedly references "the index" without identifying it; retail investors have no idea what they're being compared to.

### AGG (iShares Core U.S. Aggregate Bond ETF)

1. **4 out of 5 factors Fail for a near-perfect index tracker** — AGG tracks within 0.01-0.47pp of its index across every period, yet gets 4 Fails because factors judge absolute return quality, not tracking quality.
2. **Factors conflate ETF performance with asset class performance** — AGG's low absolute returns are the Bloomberg Agg's low returns, not an ETF failure; the prompt cannot distinguish between the two.
3. **Yield (~4.2-4.5%) never mentioned** — over 20 years, most of AGG's 87% total return came from income, not price appreciation; this is invisible in the analysis.
4. **Price return vs total return confusion** — stockAnalyzerReturns 5Y shows 0.30% CAGR (possibly price-only) while price change shows -12.93%; the ~13pp gap is unexplained income.
5. **Returns consistency penalizes the asset class, not the fund** — 2022's -13.06% loss is called inconsistent, but the index lost -12.99%; the ETF tracked perfectly through the crash.
6. **Technical analysis borderline useless** — AGG trades in a 5.5% annual range; being $0.72 below the 200-day MA is normal daily fluctuation, not a signal.

### HYG (iShares iBoxx $ High Yield Corporate Bond ETF)

1. **Normal passive bond tracking lag wrongly marked Fail** — HYG trails its index by 0.5-1.0pp across all periods, but this is industry-standard for high-yield bond ETFs due to OTC trading costs and expense ratio; the prompt has no concept of expected tracking cost.
2. **Yield (~5-6%) is the entire product, never mentioned** — over 10 years, HYG's price actually declined (-1.60%) while total return was +5.25% CAGR; roughly 6.85% annually came from income.
3. **No context for what "good" CAGR means for high-yield bonds** — the factor passes 3.71% 5Y CAGR without addressing whether this barely beats inflation in real terms.
4. **Short-term returns factor mixes backward-looking (1Y) with current momentum (1M/3M)** — 1Y of 9.88% drives a Pass, but actual current momentum is flat to negative.
5. **Percentile data (40th-60th range) tells a useful "median is OK for passive" story** — being median among 600+ competitors (mostly active managers) while charging low fees is a positive, not mentioned.
6. **Missing critical bond data** — no expense ratio (explains tracking gap), effective duration (explains rate sensitivity), credit quality breakdown, or spread-to-worst (the key driver of HY returns beyond treasuries).

### TLT (iShares 20+ Year Treasury Bond ETF)

1. **No passive vs active distinction** — TLT's job is to mirror the index; the output calls its performance "undeniably weak" and "massive wealth destruction" when the ETF did its job perfectly (tracking within 1.12pp).
2. **Price return vs total return conflation creates ~6pp discrepancy** — stockAnalyzerReturns shows 1Y = -2.54% (price-only), morReturns shows 1Y = +3.40% (total); the output cites both in different places without explaining.
3. **Emotionally dramatic tone is misleading** — "catastrophic," "abysmal," "severely disappointing," "technically broken" — all for an index tracker that matched its benchmark; this implies management failure when it's an asset class movement.
4. **No interest rate / duration context** — a retail investor has no idea WHY TLT lost -31% in 2022; the rate/price inverse relationship is basic context, not strategy analysis.
5. **ATH comparison is meaningless** — the ATH of $179.70 was set during COVID (near-zero rates); being -51.83% below it is normal repricing, not a "red flag"; using this as a benchmark is deeply misleading.
6. **Persistent bottom-quartile ranking (74-75th percentile across all periods) never surfaced** — the +-2pp rule says "In Line" but percentile data shows TLT consistently loses to 75% of its peers; this contradiction is a critical missed insight.

---

## Equity ETFs

### EAGL (Eagle Capital Select Equity ETF)

1. **No active vs passive awareness** — EAGL is actively managed and tries to beat the market; the key question ("did the manager's stock picks add value?") is never framed that way; the -10pp gap vs index means active management destroyed value.
2. **3 of 5 factors just say "no data" for this young fund** — long_term_cagr, returns_consistency, and price_trend_momentum are effectively useless with <3 years of history; the analysis generates many words saying very little.
3. **Category/style box mismatch not detected** — categorized as "Large Blend" but style box says "Large Value"; comparing to S&P 500 during a growth-led rally is apples-to-oranges; a value index comparison would show a smaller gap.
4. **Concentration (34 holdings) mentioned but not connected to performance** — one bad pick can cost 3% of the portfolio; the -10pp underperformance could be explained by 2-3 bad picks, but this isn't analyzed.
5. **Beta 0.81 described as making the fund "less predictable"** — this is backwards; lower beta means less volatile; the output confuses lower correlation with unpredictability.
6. **indexName is null** — the output compares to an unnamed "index" (appears to be S&P 500); retail investors reading "trails its index by 10pp" have no idea what "its index" is.

### HDV (iShares Core High Dividend ETF)

1. **morReturns "Index" row may not match actual benchmark** — HDV tracks Morningstar Dividend Yield Focus Index, but the "Index" numbers match the Russell 1000 Value (same as IWD); comparing HDV to an index it doesn't track produces misleading -3 to -6pp underperformance.
2. **"Feast or famine" defensive pattern penalized as inconsistency** — HDV outperforms in down markets (2022: +7.06% vs category -5.90%) and underperforms in bull markets; this is a feature of the 0.59-beta defensive strategy, not inconsistency.
3. **Dividend yield (~3.5-4%) missing from a fund literally named "High Dividend"** — price-only 1Y = 20.48%, total 1Y = 24.40%; the ~4pp gap is dividends, never mentioned.
4. **Beta 0.59 not connected to return pattern** — this single number explains everything (captures ~59% of upside and downside), but the output treats beta as just a risk stat rather than the performance driver.
5. **Momentum factor scoring inconsistent** — IWD and HDV have nearly identical technical profiles (above MA200, below MA50, RSI ~50) but get opposite scores (IWD Pass, HDV Fail); the prompt lacks clear breakpoints.
6. **+-2pp labels produce confusing patchwork for market-condition-dependent funds** — Strong YTD, Weak 1Y, Weak 3Y, In Line 5Y; the underlying pattern is simple (defensive fund) but the labels obscure it.

### IWD (iShares Russell 1000 Value ETF)

1. **Value vs growth style context completely missing** — for a value ETF, THE most important context is how value has performed relative to growth; IWD's 2020 return of 2.67% (vs growth +40%) and 2022 return of -7.72% (vs growth -33%) tell the style rotation story, but the prompt never addresses it.
2. **Persistent -1.5pp benchmark drag unexplained** — IWD trails its index in every period (never once beating it) but the output never attributes this to the 0.19% expense ratio + index replication costs; the model calls it a "structural flaw" without identifying the cause.
3. **Passive indexing less effective in value space** — IWD ranks ~40-60th percentile (median), while VOO ranks 10-20th percentile (elite) over the same periods; passive value investing beats fewer active managers than passive blend investing, a useful insight never surfaced.
4. **Dividend yield (~2.0-2.5%) more important for value ETFs** — value investors typically care more about income; the 2.2pp gap between total and price return is meaningful context.
5. **+-2pp rule + persistent trailing = model made good judgment (Fail) but by accident** — the benchmark_comparison factor correctly fails IWD despite gaps being <2pp, because the model noticed the pattern; but the prompt doesn't codify this rule, so results would be inconsistent across runs.
6. **Relative momentum vs other styles not compared** — IWD is above MA200 (uptrend) while VOO and VUG are below; value is holding up better in the current pullback, a useful cross-style insight never mentioned.

### VOO (Vanguard S&P 500 ETF)

1. **short_term_returns Fail despite 31.28% 1Y return** — the factor mixes "recent momentum" (1M/3M negative) with "trailing return" (1Y strong); these are two different signals that should be separated or the factor description clarified.
2. **price_trend_momentum Fail for a normal -5.91% correction** — for an equity ETF with beta ~1.0, a -5% to -10% pullback is standard market behavior occurring roughly once per year; marking it Fail implies something is wrong.
3. **Percentile "longer hold = better rank" story never surfaced** — VOO ranks 35th (1Y), 26th (3Y), 18th (5Y), 16th (10Y), 10th (15Y); the pattern — passive indexing beats more active managers over longer periods — is the strongest argument for index investing, barely mentioned.
4. **Passive vs active investing lesson undersold** — VOO beats its 1,400-fund category (mostly active managers) by 2-3pp consistently; the output mentions "low-cost passive investing" in passing but never explains the implication for retail investors.
5. **+-2pp threshold masks meaningful long-term compounding** — VOO's +1.42pp advantage over category at the 10Y mark compounds to ~15% cumulative extra wealth; labeled "In Line" which hides the significance.
6. **Category code "LB" not resolved** — morReturns shows "LB" instead of "US Fund Large Blend"; same data pipeline issue across all ETFs.

### VUG (Vanguard Growth ETF)

1. **No beta-adjustment in factor scoring** — VUG's beta of 1.21 means it naturally has bigger drawdowns; its -9.26% YTD and -33.15% in 2022 are proportionally expected, but scored the same as a 1.0-beta fund.
2. **Drawdown context missing across asset classes** — VUG's -33% in 2022 was severe but historically normal for growth equities (similar to 2008); AGG's -13% the same year was historically unprecedented for core bonds; the prompt gives no guidance on contextualizing drawdowns by asset class norms.
3. **Percentile "longer hold = better rank" pattern identical to VOO** — 34th (1Y), 28th (3Y), 24th (5Y), 20th (10Y), 16th (15Y); at 15 years VUG beats 84% of active growth managers; never highlighted.
4. **Output format inconsistent across ETFs** — VUG uses `[Paragraph 1]` labels, VOO uses natural paragraphs, AGG/TLT use bold headers; the prompt doesn't enforce a consistent format.
5. **52-week range of 59.8% ($316-$505) not contextualized** — this is massive compared to AGG's 5.5% range; the prompt never explains what a normal range looks like for different asset classes.
6. **VUG slightly outperforms its index in several years** — unusual for a passive ETF; likely from securities lending income; a positive signal never noted.

---

## Income/Derivative ETFs

### JEPI (JPMorgan Equity Premium Income ETF)

1. **Benchmark comparison is fundamentally wrong** — JEPI trails the S&P 500 by 10-17pp and gets Fail, but trailing in bull markets is by design; the covered call strategy trades upside for ~7-8% income + downside protection (only -3.53% in 2022 vs S&P's -19.43%).
2. **Income/yield (~7-8%) is the entire product, completely absent** — ~50% of JEPI's total return is distributed as cash; an investor seeing 17.99% 1Y return has no idea half is income that reduced the share price.
3. **Output quality is the worst of all 11 ETFs** — stuffed with filler adjectives ("totally," "strictly," "mathematically," "fundamentally," "absolutely," "undeniably"); the model compensates for strategy confusion with verbosity.
4. **Moving average analysis is misleading for high-distribution ETFs** — the share price naturally drifts down as income is paid out; traditional momentum analysis doesn't account for distribution-driven price erosion.
5. **Percentile rank shows deterioration from top quartile (2021-2022) to bottom third (2023-2025)** — newer competitors may be doing better; category exploded from 49 to 279 funds in 5 years; neither trend is discussed.
6. **Factors need strategy-specific versions** — upside/downside capture ratio, income consistency, and downside protection are what matter for covered call ETFs, not raw total return vs an equity index.

### QQQI (NEOS Nasdaq 100 High Income ETF)

1. **Benchmark mismatch** — QQQI is a Nasdaq 100 strategy but the "Index" comparison row appears to be the S&P 500; it gets Pass because Nasdaq outperformed S&P enough to mask the covered call drag, while JEPI (S&P-based) gets Fail; the comparison is apples-to-oranges.
2. **Income/yield (~12-14%) is the entire product, absent** — 1Y total return = 34.66% but price change = only 16.72%; ~18pp (more than half) is distributions; the analysis never mentions this.
3. **Price erosion masked by distributions** — 6-month price change = -7.27% but total return = -0.48%; the share price is declining significantly while high income makes total return look fine; this sustainability question is critical and invisible.
4. **2 of 5 factors say "no data, Fail" for this young fund** — same issue as EAGL; long_term_cagr and returns_consistency are useless with <3 years of history.
5. **Category growth (127 to 279 funds in ~1 year) not mentioned** — QQQI ranks 27th percentile (top quartile) in this rapidly growing, competitive space; being top quartile during category explosion is a stronger signal than the raw number suggests.
6. **short_term_returns Pass is misleading** — the 1Y figure of 34.66% includes ~18pp of distributions; the price-only 1Y is 16.72%; the factor score is based on inflated numbers.

---

## Cross-Cutting Issues (Affect Most or All ETFs)

| # | Issue | ETFs Affected | Fix Type |
|---|-------|---------------|----------|
| 1 | **Yield/income data missing from input schema** | All 7 bond/income ETFs + HDV | Schema + data pipeline |
| 2 | **Price return vs total return never reconciled** | All 11 (major for bonds/income, minor for equity) | Schema labeling + prompt rule |
| 3 | **No asset-class/strategy-type awareness** | All 11 — one prompt fits all | Prompt conditional logic |
| 4 | **Percentile rank data systematically underutilized** | All 11 | Prompt instructions |
| 5 | **+-2pp comparison threshold not asset-class-adjusted** | Bond + income ETFs especially | Prompt thresholds |
| 6 | **Factors designed for equity, poor fit for bonds/income** | 7 of 11 ETFs | Factor redesign or prompt conditionals |
| 7 | **Category codes not resolved to full names** | All 11 (data shows "LB", "LV", "LG", "S1", "GL", "HY", "CI", "DI") | Data pipeline fix |
| 8 | **indexName frequently null** | AAA, EAGL, JEPI, QQQI | Data pipeline fix |
| 9 | **Young fund handling** — factors Fail for missing data instead of "Insufficient Data" | AAA, EAGL, QQQI | Prompt rule |
| 10 | **Output verbosity/padding to hit word count** | Most ETFs, worst for JEPI | Prompt word count rules |
