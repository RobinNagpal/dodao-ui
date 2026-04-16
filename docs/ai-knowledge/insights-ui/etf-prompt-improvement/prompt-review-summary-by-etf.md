# Prompt Review Summary — Top 6-7 Improvement Points Per ETF

**Date**: 2026-04-16
**Source**: Individual prompt improvement analysis files for 11 ETFs in PR #1310 (branch: etf-prompts)

Each ETF below lists the 6-7 most impactful lines that are missing from the prompt or could be improved — focusing on missing financial data, irrelevant analysis factors, misleading thresholds, and other gaps.

---

## AAA — Alternative Access First Priority CLO Bond ETF (Bond — CLO)

1. **No yield/income data in prompt input** — bond ETF investors buy primarily for income (~6-7% yield), but the schema has zero yield fields and the output never mentions yield.
2. **No asset-class awareness** — the prompt treats a CLO bond ETF identically to an equity ETF; technical analysis (MA crossovers, RSI) is nearly meaningless for a fund trading in a 3.3% price range.
3. **±2pp comparison threshold is too coarse for bonds** — a 1pp gap on a 5-6% bond return represents ~17% of total return, yet the prompt labels it "In Line."
4. **Pass/Fail is too binary for young funds with missing data** — long_term_cagr gets "Pass" despite having zero of its defined metrics (no 5Y/10Y/15Y/20Y data); should be "Insufficient Data."
5. **Percentile rank data severely underutilized** — percentile dropped from 8th (top decile, 2021) to 96th (bottom 4%, 2025), but this deteriorating trajectory is never highlighted.
6. **Missing benchmark identity** — indexName is null yet the output compares to an unnamed "index" throughout, leaving retail investors with no idea what they're being compared to.
7. **Category name shows as coded value "S1"** instead of the full category name — data pipeline mapping issue affects all bond ETFs.

---

## AGG — iShares Core U.S. Aggregate Bond ETF (Bond — Core)

1. **4 out of 5 factors Fail for a near-perfectly-tracking $137B index ETF** — AGG tracks its index within 0.01-0.47pp across every period, yet gets 4 Fails because factors judge absolute return quality instead of tracking precision.
2. **No distinction between "ETF performance" and "asset class performance"** — the 0.30% 5Y CAGR is called "abysmal," but AGG actually beat its index; the low return is the bond market's return, not a fund failure.
3. **Yield/income data completely missing** — AGG yields ~4.2-4.5%; most of its 20-year total return (86.97%) came from income, not price appreciation, but income is never mentioned.
4. **Price return vs total return confusion** — stockAnalyzerReturns shows 5Y price change of -12.93% while 5Y total return is +1.51%; the ~14pp gap is income, but the prompt never reconciles these conflicting numbers.
5. **Returns consistency factor judges absolute smoothness, not tracking accuracy** — the 2022 -13% loss is penalized, but AGG tracked its index within 0.07pp through the crash; that's excellent consistency.
6. **Technical analysis (MA crossovers, RSI) is borderline useless for a core bond index ETF** — price moves are driven by interest rate expectations, not momentum patterns.

---

## HYG — iShares iBoxx $ High Yield Corporate Bond ETF (Bond — High Yield)

1. **Normal benchmark lag for passive bond ETFs wrongly marked as Fail** — HYG trails its index by 0.5-1.0pp, which is industry-standard for high-yield bond ETFs due to OTC trading costs and expense ratio (0.49%); the prompt treats this as failure.
2. **Yield/income data missing** — HYG yields ~5-6%, which is literally the main reason investors buy it; 10Y total return was 5.25% while price actually declined 1.60%, meaning ~6.85%/yr came from income.
3. **No context for what "good" CAGR means for this asset class** — the prompt doesn't tell the model that 5.25% 10Y CAGR is normal for high-yield bonds; without context, a retail investor can't judge this number.
4. **All 5 analysis factors are equity-oriented** — bond ETFs need tracking precision, income/yield level, credit cycle resilience, and liquidity/trading quality instead of equity momentum and absolute CAGR factors.
5. **Short-term returns factor mixes backward-looking 1Y return with current momentum (1M/3M)** — 1Y = 9.88% gets Pass, but current momentum (1M=-0.14%, 3M=-0.16%) is clearly flat; the factor description is ambiguous.
6. **Percentile rank shows HYG is a median performer (~40-60th) among 600+ peers** — this is actually expected and fine for a passive index tracker in an active-manager-heavy category, but the prompt doesn't provide this context.
7. **ATH from 2007 pre-crisis ($106.47) is irrelevant** — an 18-year-old ATH set during the credit bubble is not a meaningful reference point for current analysis.

---

## TLT — iShares 20+ Year Treasury Bond ETF (Bond — Long Duration)

1. **No passive vs active ETF distinction** — TLT is a passive index tracker that matched its benchmark within 1.12pp across every period, yet the output calls it "massive wealth destruction"; the prompt can't distinguish between "ETF failed" and "asset class declined."
2. **Price return vs total return conflation — 6pp gap** — stockAnalyzerReturns shows 1Y = -2.54% (price-only) while morReturns shows 1Y = +3.40% (total return including ~4.5% yield); the output cites both without explaining the difference.
3. **Emotionally dramatic tone is misleading for index tracking ETFs** — terms like "catastrophic," "wealth destruction," "technically broken" imply management failure, when TLT did exactly what it was designed to do during a rate hike cycle.
4. **No interest rate / duration context** — a retail investor has no idea WHY TLT lost -31% in 2022; the rate/price inverse relationship for long-duration bonds is essential context, not "deep strategy analysis."
5. **ATH comparison is meaningless** — TLT's ATH of $179.70 was set during COVID (2020-03-09) when rates were near zero; calling the fund "-51.83% below ATH" is misleading because that ATH reflected an anomalous rate environment.
6. **±2pp threshold creates false "In Line" despite persistent bottom-quartile ranking** — TLT trails its benchmark in every period (always negative gap) and sits at 74-75th percentile consistently, but the ±2pp rule masks this systematic underperformance.

---

## EAGL — Eagle Capital Select Equity ETF (Equity — Active Concentrated)

1. **No active vs passive fund awareness** — EAGL is actively managed and trying to beat the market; the prompt should frame benchmark comparison as "did active management add value?" (the 10pp shortfall means the manager's stock picks destroyed value).
2. **3 out of 5 factors are useless for a fund this young** — long_term_cagr, returns_consistency, and partially price_trend_momentum just say "no data" and Fail; for funds under 3 years, these factors should be "Insufficient Data."
3. **Category vs style box mismatch not detected** — categorized as "Large Blend" but style box shows "Large Value"; comparing to Large Blend peers/S&P 500 during a growth-led rally is apples-to-oranges.
4. **Concentration risk (34 holdings) mentioned but not connected to performance** — with 34 stocks, 2-3 bad picks can explain the entire -10pp underperformance; the analysis should explain how concentration amplifies both good and bad outcomes.
5. **indexName is null** — the output compares to an unnamed "index" (appears to be S&P 500) without ever telling the retail investor what benchmark is being used.
6. **Beta 0.81 described as making the fund "less predictable"** — this is backwards; lower beta means less volatile/more predictable; the output confuses low correlation with unpredictability.

---

## HDV — iShares Core High Dividend ETF (Equity — High Dividend Value)

1. **morReturns "Index" row may not match HDV's actual benchmark** — both HDV and IWD show identical "Index" returns (28.05% 1Y, 16.79% 3Y), suggesting a generic Russell 1000 Value index is used, not HDV's stated Morningstar Dividend Yield Focus Index; this makes the -6pp "underperformance" misleading.
2. **"Feast or famine" defensive pattern penalized as inconsistency** — HDV outperforms in down markets (2022: +7.06% vs category -5.90%) and underperforms in bull markets; this is a feature of the 0.59-beta defensive strategy, not a flaw, but returns_consistency marks it as Fail.
3. **Dividend yield missing for a fund literally named "High Dividend"** — HDV yields ~3.5-4.0%; the price change vs total return gap (~3.9pp) confirms significant income, but the analysis never mentions dividends.
4. **Beta 0.59 not connected to the return pattern** — this single number explains everything: ~59% market capture means trailing in rallies and outperforming in crashes; the output notes the beta but doesn't draw this obvious causal link.
5. **Momentum factor scoring inconsistent across ETFs** — IWD got Pass and HDV got Fail with nearly identical technical profiles (both above MA200, both below MA50, similar RSI); the prompt needs clearer breakpoint rules.
6. **±2pp labels produce a confusing patchwork for market-condition-dependent funds** — Strong/Weak/In Line alternates by period because the fund is defensive, not because it's erratic; the prompt should recognize this as a coherent pattern.

---

## IWD — iShares Russell 1000 Value ETF (Equity — Passive Value)

1. **Persistent -1.5pp benchmark tracking drag never explained** — IWD trails its index by 1.3-1.7pp across every period; this is likely the 0.19% expense ratio + tracking methodology, but the output flags it as "structural flaw" without identifying the cause.
2. **Value vs growth style context completely missing** — for a value ETF, the #1 retail investor question is "how is value doing vs growth?"; IWD's 2020 return of 2.67% vs growth's ~40% is the key context, never mentioned.
3. **Passive indexing less effective in value space** — VOO beats 90% of Large Blend peers at 15Y, but IWD only beats ~50% of Large Value peers; this suggests active value managers add more alpha than active blend managers, which is a useful insight.
4. **Dividend yield more important for value ETFs** — IWD yields ~2.0-2.5%, with the price/total return gap confirming ~2.2pp from dividends; value investors specifically care about income but it's never discussed.
5. **Model made a good judgment call on benchmark_comparison (Fail despite within ±2pp)** — but this isn't codified in the prompt rules; persistent trailing in every period should be an explicit prompt rule, not left to model discretion.
6. **Percentile trajectory shows IWD is median (~40-60th percentile)** — unlike VOO which improves to 10th percentile at 15Y, IWD stays around 50th; this difference is never surfaced.

---

## VOO — Vanguard S&P 500 ETF (Equity — Passive Large Blend)

1. **short_term_returns factor mixes momentum with trailing return** — 1M through YTD are all negative (-3.35% to -3.40%), but 1Y is +31.28%; the factor Fails, but a retail investor may find it odd that a +31% fund "fails" short-term returns.
2. **price_trend_momentum Fails for a normal -5.91% correction** — VOO is only 0.94% below its MA200; for an equity ETF with beta ~1.0, a -5% to -10% pullback happens roughly once a year and shouldn't be a "Fail."
3. **Percentile rank tells the strongest story of any ETF — barely used** — trailing percentiles go from 35th (1Y) to 10th (15Y), meaning the longer you hold VOO, the more active managers it beats; this is the definitive argument for passive investing.
4. **Passive vs active investing lesson undersold** — VOO beating 90% of ~1,400 Large Blend funds at 15 years is THE story, mentioned only in passing as "the sheer power of low-cost passive investing."
5. **±2pp threshold masks meaningful long-term compounding** — VOO beats category by 1.42pp at 10Y, labeled "In Line," but this compounds to ~15% cumulative outperformance over a decade.
6. **Technical terms re-explained in every paragraph** — beta, CAGR, and RSI definitions are repeated multiple times; the prompt should say "define technical terms once."

---

## VUG — Vanguard Growth ETF (Equity — Passive Growth)

1. **No beta-adjustment in factor scoring** — VUG (beta 1.21) drops -9.26% YTD and gets the same Fail as VOO (beta 1.0) at -3.40% YTD; a high-beta fund's larger drawdown during corrections is expected, not a failure signal.
2. **Drawdown context missing across asset classes** — VUG's -33.15% in 2022 was severe but historically normal for growth equities (similar to 2008); AGG's -13% in 2022 was historically unprecedented for core bonds; same "drawdown" framing for both is misleading.
3. **Percentile "longer hold = better rank" pattern not surfaced** — trailing: 34th (1Y) to 16th (15Y), same pattern as VOO; at 15Y, VUG beats 84% of all large growth funds, which is the key argument for passive growth investing.
4. **Output format inconsistent across ETFs** — VUG uses `[Paragraph 1]` bracket labels, VOO uses natural paragraphs, AGG/TLT use bold headers; the prompt doesn't enforce a consistent format.
5. **52-week range not contextualized** — VUG's $316-$505 range (59.8% spread) is huge but not compared to what's normal; a 5% range is typical for bonds, 30-40% for broad equity, 50%+ for growth.
6. **Slight index outperformance by passive ETF not noted** — VUG beats its CRSP index in several years (e.g., 2020: +2.92pp), likely from securities lending income; this is a positive signal that goes unmentioned.

---

## JEPI — JPMorgan Equity Premium Income ETF (Income — Covered Call / S&P 500)

1. **Benchmark comparison is fundamentally wrong for covered call strategies** — JEPI trails S&P 500 by 10-17pp and gets Fail, but trailing in bull markets is by design; the fund trades upside for ~7-8% income yield and downside protection (-3.53% in 2022 vs S&P's -19.43%).
2. **Income/yield is the entire product — never mentioned** — ~7-8% annual yield is why 99% of investors buy JEPI; the 1Y return shows 17.99% total but only 8.50% price change; roughly half the return is distributed income.
3. **All 5 analysis factors don't fit income/derivative strategies** — needs income generation consistency, downside protection measurement, upside/downside capture ratio, and total return vs category peers instead of raw equity momentum factors.
4. **Output quality degrades severely** — extreme verbosity with filler adjectives ("totally," "strictly," "mathematically," "fundamentally," "undeniably") appears dozens of times; the model compensates for analytical uncertainty with padding.
5. **Percentile rank deterioration from top quartile to bottom third not discussed** — ranked 29th percentile in 2021 (great) declining to 70th in 2025 (poor); as the category grew 5x (49 to 279 funds), newer competitors may be outperforming JEPI.
6. **Share price naturally drifts down from high distributions, making MA analysis misleading** — traditional momentum analysis doesn't account for the mechanical price reduction when ~7-8% is paid out annually.
7. **Category explosive growth (49 → 279 funds in 5 years) not captured** — JEPI was an early mover in a now-crowded space; competitive dynamics matter for investors choosing between JEPI and newer alternatives.

---

## QQQI — NEOS Nasdaq 100 High Income ETF (Income — Covered Call / Nasdaq 100)

1. **Benchmark mismatch — Nasdaq 100 strategy compared to S&P 500 index** — QQQI gets Pass on benchmark comparison because the Nasdaq 100 outperformed the S&P 500 enough that even after giving up upside via options, QQQI matched the S&P; JEPI gets Fail for the same strategy because its underlying IS the S&P; the comparison is inconsistent.
2. **Income/yield missing — ~12-14% yield is the entire product** — the 1Y return shows 34.66% total but only 16.72% price change; roughly 18pp (half) was distributed income, but the analysis presents 34.66% as if it's all growth.
3. **Price erosion masked by distributions** — 6M total return = -0.48% but 6M price change = -7.27%; the share price is declining significantly while distributions make total return look flat; this is a critical risk the output never discusses.
4. **2 out of 5 factors just say "no data → Fail" for this young fund** — long_term_cagr and returns_consistency provide no useful analysis; young funds need different evaluation criteria.
5. **Category growth context underemphasized** — Derivative Income category doubled from 127 to 279 funds in ~1 year; QQQI ranking 27th percentile (top quartile) in this rapidly growing competitive field is genuinely impressive but not highlighted.
6. **short_term_returns Pass includes 18pp of distributions in the 1Y figure** — the factor doesn't distinguish between price appreciation and income; the price-only 1Y was +16.72%, which tells a very different momentum story than +34.66%.
