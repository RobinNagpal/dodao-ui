# Retail-investor review — performance-and-returns analyses — iter-1

- **Date:** 2026-04-22
- **Lens:** a retail investor deciding whether to put money into each ETF. Are the
  numbers *explained*? Does the reader learn whether a return / yield / drawdown is
  good, bad, or typical? Does the analysis leave the reader closer to a yes/no
  decision, or just dump data?
- **Not checking:** raw numbers (assumed correct), prompt-rule violations (covered in
  findings-A), factor-assignment fit (covered in findings-B).

---

## Broad Equity

### SPY (Large Blend)

1. Gives a clear, decisive verdict upfront ("Strong performance profile"), so a retail reader knows the bottom line without wading through factor blocks.
2. The `14.26%` 10Y CAGR is contextualised as top-18th-percentile in a 1,315-fund category — that **tells** the reader the number is very good for what SPY is, rather than just quoting the figure.
3. Correctly diffuses the "-3.31% YTD" worry by framing the sell-off as a shallow pullback within a broader uptrend (cites `-5.77%` from ATH, balanced RSI).
4. Weak spot: never compares the long-run return to inflation or alternatives — a retail reader doesn't know whether `14.26%` should be seen as "market average" (which it roughly is) or "beating something they could easily buy instead."
5. The "top 18th percentile over 10 years" claim is strong but undersells why that matters: for a passive fund to beat 82% of active managers over a decade is the core case for indexing, and that argument is not made explicitly.
6. The one-paragraph `Overall analysis` is readable and well-paced — unlike some other reports — and the strengths/risks wrap-up gives the reader a clean exit point.
7. Net: if the reader has $1,000 to invest and doesn't know what to buy, this analysis does push them toward SPY as a default, which is the right nudge.

### IWF (Large Growth)

1. The `16.79%` 10Y CAGR is compared against active peers (top 20% over 5 years, top 16% over 10 years) and the Russell 1000 Growth index — the "is this number good?" question is answered.
2. The 1-year `32.77%` gain is correctly framed alongside the recent `-8.91%` YTD pullback, so the reader doesn't anchor on either number alone.
3. Explicitly names the beta (`1.17`) and ties it to the `-8.96%` 3-month drop — a rare piece of cause-and-effect that tells the reader *why* growth ETFs fall harder in corrections.
4. The entire `Overall analysis` is one huge wall of text with `<br><br>` separators — a retail reader trying to skim on a phone will not get past the first line, which kills usefulness even when the content is right.
5. Calls the CAGR "staggering" and the 1-year return "stellar", which feels promotional and doesn't help the reader compare IWF to SPY (it never says "IWF beats SPY by ~2.5 pp per year long-run because of the growth tilt — expect bigger swings in both directions").
6. Doesn't explain what "growth tilt" actually means for the holdings (concentration in a few mega-caps, higher valuation multiples, thinner dividend) — a retail reader coming in cold doesn't learn what they're buying.
7. Net: confirms IWF is a good long-term holding, but doesn't help the reader choose IWF over SPY for their specific situation.

---

## Sector & Thematic Equity

### XLK (Technology)

1. Surfaces the single most important retail-investor finding in this report: XLK tracked its sector index with a `14.53 pp` gap in 2024 — i.e. the "passive tracker" didn't track. That's a real-money concern and the analysis catches it.
2. Frames 10Y CAGR of `21.30%` against the category (top 25% of 149 funds) — good context.
3. But doesn't explain *why* the tracking broke (the 2023 SEC-imposed concentration rebalance after Apple/MSFT/NVDA grew too large), so the reader knows there's a problem but has no idea whether it's resolved or ongoing — they can't act on the finding.
4. Calls the current price action a "clear downtrend" because price is `-1.3%` below MA200 and RSI is `49.5` — that's genuinely borderline and will make retail readers more bearish than the data warrants.
5. The `50.42%` 1-year gain gets a line but isn't translated into "this is typical for a tech sector ETF in a rally" or "this is the kind of return that won't repeat" — the reader can't place the number.
6. Strengths/risks section is tight and useful: "tracking inefficiencies" and "intermediate-term momentum drag" are the real risks a retail reader should know about.
7. Net: surfaces real concerns, but leaves retail reader without a clear "still buy XLK" or "switch to VGT" recommendation — decision-useful signals present but not a decision-useful conclusion.

### XLV (Health)

1. The defensive-fund thesis is crystal clear: `-2.04%` NAV in 2022 while the category lost `-15.16%`, vs `14.51%` in 2025 when the category gained `20.85%`. That trade-off is the headline a retail reader needs to decide whether XLV fits their portfolio.
2. Explicitly quantifies the cost: trailing 1Y return of `9.68%` vs category's `33.62%` — shows the reader what they're giving up in up years.
3. Beta of `0.64` is cited and tied directly to drawdown behaviour — one of the better cause-and-effect explanations in the sample.
4. But the "Mixed" verdict is wishy-washy: given the defensive-by-design framing, the verdict should be "Strong for the risk level, Weak for current momentum" — instead the reader gets an ambiguous "mixed" that doesn't commit.
5. Never says what a retail investor should do with a defensive health ETF — e.g. "use as a 5-10% allocation to dampen portfolio volatility, don't expect it to beat QQQ in bull markets." That practical framing would make the analysis actionable.
6. Doesn't flag the category-specific risk (pharma patent cliffs, policy exposure) even though "Health" is an unusual sector with idiosyncratic risks.
7. Net: good framing of the trade-off but lands on "mixed" instead of a clear use-case recommendation.

---

## Leveraged & Inverse Trading

### TQQQ (Trading--Leveraged Equity)

1. Opens with a clear "Mixed" and frames TQQQ as a "tactical trading tool" — appropriate and correct for retail readers, many of whom do not know what they're walking into.
2. The decay story is told with specific numbers: `198.26%` gain in 2023, `-79.08%` drop in 2022. Both ends of the whip are shown, which is what retail readers need.
3. `10Y CAGR of 36.02%` is dangerous without strong context — the analysis does note "5-year CAGR sits lower at `12.52%`" to hint at path dependency, but doesn't spell out "you cannot rely on the 10Y number because the reset-math means your 10Y outcome depends on the *path* the index takes, not just the endpoint."
4. The closing "fulfills its mandate as an aggressive growth amplifier despite the risks of holding leverage long-term" is too soft — a retail reader shouldn't walk away thinking TQQQ is an "aggressive growth amplifier," they should walk away thinking "do not hold this for more than a few weeks."
5. Beta of `3.53` is named but not translated ("expect 3x the intraday swing of the Nasdaq 100; in a 20% drawdown of QQQ, expect ~60%+ in TQQQ"). Without that translation retail readers can't price the risk.
6. Correctly highlights `-27.87%` from ATH as the current position — useful.
7. Net: the data is all there, but the narrative softens the danger enough that a casual reader might come away more bullish than they should.

### SQQQ (Trading--Inverse Equity)

1. The brutal honesty is the best part: `-99.95%` total 10-year loss is stated plainly. That's exactly what a retail reader must see.
2. The framing "succeeds strictly as a short-term tactical tool but guarantees deep losses if used as a buy-and-hold investment" is clear and correct.
3. Correctly explains path dependency with the `-87.82%` 3Y and `-93.53%` 5Y progression — retail readers learn that holding inverse funds is structurally broken.
4. But doesn't explain *when* an inverse fund makes sense — should a retail reader ever buy SQQQ? The answer is "almost never" for the target audience, and saying that directly would be more useful than the "tactical trading tool" framing.
5. Beta `-3.42` is mentioned but not translated into practical terms — retail readers don't know what it feels like to own a `-3.42` beta asset in daily terms.
6. Doesn't explain that SQQQ fees are paid even while the fund decays — retail readers might not realise they're paying ~1% per year to lose money mechanically.
7. Net: honest about the outcome, but could be more prescriptive about who should *never* buy this.

---

## Fixed Income — Core & Government

### AGG (Intermediate Core Bond)

1. Strong framing: the narrative consistently points out that AGG's low absolute returns reflect the bond market, not the fund, and cites the tight tracking gap (`0.01 pp` vs the Bloomberg US Aggregate over 10 years) to back it up.
2. The 2022 `-13.06%` drawdown is contextualised as in-line with both the index and category average — this is exactly the "is this loss normal?" framing retail readers need.
3. But then the factor list Fails `price_trend_momentum`, `short_term_returns`, and `returns_consistency` — a retail reader scanning the Pass/Fail bullets will see 3 red Fails and assume AGG is a problem, which directly contradicts the narrative saying "flawlessly executes."
4. The `4.36%` SEC yield is named but not compared to money-market / T-bill yields, which is the retail reader's actual alternative right now — they can't decide if locking duration is worth the spread.
5. Never addresses the core retail question: "if I put $10,000 in AGG today, what return should I expect over the next 5 years?" (The answer is roughly the starting yield minus duration losses if rates rise — that framing is missing.)
6. Doesn't explain *why* a retail investor would hold AGG vs. just a 60/40 fund or a simple Treasury ladder. The "core allocation" case is assumed, not argued.
7. Net: the content is correct, but the Pass/Fail verdicts and the narrative point in opposite directions, leaving the reader confused about the actual call.

### SHY (Short Government)

1. Honest about the low return ceiling: `1.65%` 10Y CAGR is named and explained as "entirely dependent on prevailing interest rates."
2. The 2022 `-3.90%` vs category `-5.15%` is a great retail-level talking point — shows the fund held up better than its peers in the worst bond year in decades.
3. Explicitly calls MA/RSI "largely noise" for short-duration Treasuries, which is the right pedagogical move for retail readers who might otherwise chart the fund.
4. The "Mixed in absolute terms" verdict is unhelpful — most retail readers considering SHY are choosing between it and a high-yield savings account or T-bills, and the answer ("they're roughly equivalent; SHY has slight price risk but some upside if rates fall") is never stated.
5. `3.70%` SEC yield is shown but not compared to cash alternatives — the most decision-useful comparison for SHY is completely absent.
6. Doesn't explain the "79th percentile out of 78 funds" 1-year rank clearly — a retail reader will read that as "worst in class" when it's actually a rounding artifact (the fund is near the bottom but by tiny margins given the category's homogeneity).
7. Net: accurate but doesn't tell the retail reader whether SHY is a better cash parking place than their brokerage's money-market fund.

---

## Fixed Income — Credit & Income

### HYG (High Yield Bond)

1. Leads with the `6.59%` SEC yield, which is the right headline for an income-seeking retail reader.
2. The 2022 `-11.37%` drawdown is contextualised against the index (`-11.09%`) and category (`-10.09%`) — shows the reader the loss was broad, not HYG-specific.
3. But never explains what "high yield" actually means to a retail reader (below-investment-grade credit, meaningful default risk) — the phrase is technical jargon and the report assumes the reader knows.
4. `benchmark_comparison` Fail saying HYG trails the index by `~1 pp` over 10 years, while `long_term_cagr` (same data) says the gap is within the 1.0 pp tolerance — the two verdicts directly contradict and will leave a retail reader wondering whether HYG tracks or not.
5. Doesn't compare the `6.59%` yield to the actual retail-reader alternatives: IG corporate bonds, preferred stock, dividend ETFs, or even CDs. Without those comparisons, the yield number is impressive in a vacuum but unactionable.
6. Never flags the "default spike" risk — in a recession, high-yield funds can lose `15-25%` of NAV in addition to the rate-driven drop. Retail readers need that worst-case anchor before committing.
7. Net: gets the headline right (high yield, decent tracking, 2022 behaviour normal) but the internal factor contradictions and missing alternative-comparison hurt decision utility.

### PFF (Preferred Stock)

1. Multiple Fails (`returns_consistency`, `category_peer_standing`, `rate_environment_resilience`) flag real, earned concerns — this is one of the few reports where the Pass/Fail bullets genuinely help the retail reader.
2. The `-20.60%` 10Y price decline paired with a positive `39.66%` total return correctly frames the fund as an income-only play — good retail-level education.
3. `6.34%` SEC yield is prominent.
4. Weak spot: no tax framing. Preferred dividends are often qualified (taxed favourably) but some are not — retail readers in taxable accounts need that info and it's absent.
5. The 2022 `-18.37%` drop (worse than category `-14.82%` and index `-14.60%`) is a real red flag for the specific fund vs. the asset class — the analysis flags it clearly.
6. But doesn't compare PFF to close alternatives (PGX, SPFF, VRP) or to a simple "80% IG bonds + 20% equity" barbell that might deliver similar yield with less duration risk.
7. Net: one of the more decision-useful reports in the sample — tells the retail reader "PFF is for income, expect price decay, know that the 2022 shock was worse than peers."

---

## Municipal Bonds

### MUB (Muni National Interm)

1. The tax-equivalent yield framing (`3.39%` SEC ≈ `~4.98%` TEY at 32% bracket) is exactly what retail readers need and is usually missing from muni write-ups — this report does it well.
2. The 10Y CAGR of `1.99%` is framed correctly as "low-yielding environment of the past decade, not fund failure."
3. 2022 `-7.50%` drawdown is named — retail readers who hold munis for "safety" need to see that number.
4. But doesn't address the state-tax angle: MUB is a national muni fund, meaning its distributions are federal-tax-exempt but not state-tax-exempt in most states. A retail reader in California or New York would get better after-tax yield from a state-specific muni fund, and that's not mentioned.
5. Doesn't compare the TEY to a plain Treasury yield at the same maturity — the "buy munis or buy Treasuries?" decision is the one most retail readers are actually making.
6. The `0.05%` expense ratio is not highlighted even though it's a strong point (most active muni funds charge `0.5-1.0%`).
7. Net: nails the headline TEY framing but misses the state-tax and Treasury-comparison angles that determine whether a specific retail reader should actually buy MUB.

### SUB (Muni National Short)

1. TEY framing present (`2.52%` SEC ≈ `~3.71%` at 32% bracket) — good.
2. The `-2.15%` 2022 loss (vs index `-3.39%`) is correctly framed as "did its job during the worst rate shock in decades."
3. The "Overall analysis" is one long paragraph — a retail reader will bail.
4. Never answers the most important retail question for SUB: why buy a short-duration muni ETF over a money-market fund or a high-yield savings account paying `4-5%` right now?
5. Doesn't explain that short-duration muni yield is *below* Treasury yield in absolute terms, and the reason to prefer SUB is entirely about the federal-tax exemption — retail readers in lower brackets may not benefit.
6. The `30.47%` 3-year dividend growth figure is shown but unexplained — most retail readers won't know whether that's sustainable (it isn't; it reflected the rate cycle) and might anchor on it.
7. Net: accurate on the safety story but doesn't give the retail reader the bracket-math they need to decide if SUB actually fits their situation.

---

## Alternative Strategies

### JEPI (Derivative Income)

1. Leads with the right framing: "trades equity upside for income" — a retail reader immediately understands what the product is.
2. Specific trade-off numbers: `12.56%` in 2024 vs S&P's `24.09%`, `-3.53%` in 2022 vs `-19.43%`. This is decision-useful.
3. `8.45%` SEC yield and `0.59` beta are prominent — the two headline numbers for the strategy.
4. But the `benchmark_comparison` Fail narrative ("entirely persistent and absolutely severe total lag against standard equity market returns") directly contradicts the narrative above it, which correctly says trailing the S&P 500 *is* the point. A retail reader cannot reconcile this.
5. The `-8.49%` 3Y dividend growth is mentioned but not emphasised — this is the single most important downside for a JEPI investor (your yield can shrink), and it's buried in a risks list.
6. Doesn't explain what "equity-linked notes" are, how the fund actually generates income, or the counterparty risk baked into the structure. Retail readers don't know what machinery they're trusting.
7. Net: the thesis is conveyed, but the contradictory benchmark Fail and the buried dividend-growth red flag make the report actively misleading in places.

### GLD (Commodities Focused)

1. The 10Y CAGR of `13.79%` is strong and shown against category average — sets a clear benchmark.
2. `53.10%` 1Y price return is eye-catching and correctly paired with `-15.98%` below ATH to prevent a reader from assuming the rally will continue.
3. Beta of `0.19` and the "diversifier" thesis are well-framed.
4. Giant wall of text again — readability is poor for a retail reader skimming on mobile.
5. Crucially missing: the tax treatment. GLD is structured as a grantor trust holding physical gold, which means gains are taxed at the **collectibles rate (28% max)** in taxable accounts — not the standard 15/20% LTCG rate. That's a material retail-investor issue and it's absent.
6. Never gives a portfolio-allocation framework — how much gold should a retail portfolio hold? "5-10% for diversification" is the conventional wisdom; naming it would help the reader act on the analysis.
7. Net: strong narrative on the returns and diversifier case, but the missing tax treatment could cost a retail reader real money after they buy.

---

## Allocation & Target-Date

### AOA (Aggressive Allocation)

1. Clear `80/20` framing — a retail reader knows exactly what they're getting.
2. Top-quartile peer rank across 3Y/5Y/10Y is stated with sample sizes (142-177 funds) — the "is this fund good?" question is clearly answered.
3. 2022 `-16.23%` drawdown is explicitly contextualised against index (`-15.48%`) and category (`-14.49%`) — retail readers see the loss was the asset mix behaving normally.
4. But never explains what "aggressive allocation" feels like practically — e.g. "expect a 30-40% drawdown in a severe equity bear market, recovery usually takes 1-3 years."
5. Doesn't compare AOA to the DIY alternative (80% VTI + 20% BND, same expense ratio essentially) — a retail reader might benefit from knowing AOA is convenient but not magic.
6. The "top quartile over a decade" claim correctly frames the case for AOA over active allocation funds, but doesn't make the case for AOA vs. a simple target-date fund with similar equity weight.
7. Net: good on AOA's own record, weak on comparison to the obvious retail alternatives.

### AOK (Conservative Allocation)

1. Clear `30/70` framing.
2. 2022 `-14.16%` drawdown is specifically tied to the 70% bond sleeve — correct cause-and-effect.
3. 10-year CAGR of `4.93%` is named but not contextualised — a retail reader considering AOK for "retirement income" has no way to know whether `~5%` a year is enough to live on, outpace inflation, or match their SWR assumption.
4. Doesn't identify the target user — is AOK for a 70-year-old drawing down, or a 40-year-old building conservatively, or someone who wants a "safe" parking spot? The right retail framing differs wildly.
5. Doesn't compare to the obvious alternatives for conservative retail money: a Treasury ladder, an I-bond allocation, a money-market fund, or a 30/70 target-date fund. Those comparisons are what a conservative-allocator retail reader actually needs.
6. The 2022 `-14.16%` loss is a bigger deal for a conservative-allocation retail reader than for an aggressive one — it meant bonds and stocks both failed simultaneously — and the report doesn't drive that point home ("if you can't stomach a `14%` drawdown on your 'conservative' fund, AOK isn't conservative enough for you").
7. Net: clean on execution details, weak on the "who is this fund for and what should they compare it to" retail question.

---

## Cross-cutting takeaways for the retail reader

1. **Pass/Fail bullets sometimes contradict the narrative.** AGG, HYG, JEPI all have narrative verdicts that say "strong / mandate-aligned" while the factor bullets Fail 2-3 items. A retail reader scanning the red Fails will get the opposite impression from the headline. Loop A's prompt fix addresses this going forward.
2. **"What should I compare this to?" is the most-missed retail framing.** HYG vs IG corporates, MUB vs Treasuries, SHY vs HYSA, AOA vs DIY 80/20, GLD vs a general commodity basket — these comparisons are what a retail reader uses to act. The reports typically only compare within-category.
3. **Tax treatment is almost never mentioned.** GLD (collectibles rate), preferreds (QDI vs ordinary), munis (state-tax angle), JEPI (ordinary income) all have material retail tax consequences. Adding a one-line tax note to each report would be high-leverage.
4. **"Is this number good?" is answered well when a benchmark comparison exists but poorly for absolute context.** Retail readers don't always know that `14%` 10Y CAGR on SPY is "market beta" — that framing (vs inflation, vs cash, vs peer allocation options) is often missing.
5. **Readability matters.** IWF, JEPI, GLD, SUB all have giant single-paragraph `Overall analysis` blocks. Retail readers skim; a four-paragraph format (which the prompt already calls for) would materially increase how much they absorb.
6. **The good:** numeric anchors are strong throughout. Drawdowns are consistently contextualised against index and category. The mandate-based framing (passive in active peer group, covered-call trades upside for income, leveraged = tactical-only) is well understood. The analyses aren't wrong — they're often under-prescriptive.
