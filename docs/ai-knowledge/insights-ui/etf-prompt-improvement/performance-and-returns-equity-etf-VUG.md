# Prompt Improvement Analysis: PerformanceAndReturns — Equity ETF (VUG)

**ETF**: Vanguard Growth ETF (VUG)  
**Category**: PerformanceAndReturns  
**Asset Class**: Equity — Large Growth (Passive Index Tracking)  
**Date**: 2026-04-16

---

## What This ETF Is

VUG is a large ($317.9B) passive ETF tracking the CRSP US Large Cap Growth Index. It holds `155` growth-oriented large-cap stocks. Compared to VOO (S&P 500 broad market), VUG is more concentrated in high-growth companies (heavier tech), which means higher returns in good times and bigger drops in bad times. Beta = `1.21` confirms this.

---

## What the Output Got Right

This is a solid output overall — arguably the second-best after VOO:
- Clear summary with "mixed" verdict that makes sense
- Good balance between strong long-term record and weak short-term momentum
- Benchmark comparison is well done — correctly shows Strong vs category, In Line vs index
- Factor scoring is the same as VOO (3 Pass, 2 Fail) and feels appropriate
- The writing is relatively concise and uses fewer filler words than most previous outputs

---

## Issue 1: Higher Volatility Is Expected for Growth — But the Prompt Doesn't Adjust for It

### What's wrong
VUG dropped `-9.26%` YTD and `-33.15%` in 2022. These look scary in isolation, but for a growth ETF with beta `1.21`, this is exactly expected behavior. The prompt applies the same evaluation framework regardless of whether an ETF has beta 0.04 (AAA) or beta 1.21 (VUG).

The output handles this reasonably well (mentions beta 1.21 "fully explains the deeper pullbacks"), but the factor scoring doesn't adjust:
- `short_term_returns` = Fail for YTD of -9.26%. But VOO (beta 1.0) had YTD of -3.40% and also got Fail. VUG's drop is proportionally expected given its higher beta. Should both get the same grade?
- `price_trend_momentum` = Fail for being -12.50% from ATH. But growth stocks are more volatile — being -12% from ATH during a correction is normal for a 1.21-beta fund.

### What to fix
Add a beta-awareness rule: *"When evaluating short-term returns and momentum, consider the ETF's beta. A high-beta fund (>1.1) will naturally have larger drawdowns during corrections. A -10% pullback for a 1.2-beta fund is equivalent to a -8% pullback for a 1.0-beta fund. Adjust severity of language and factor scoring accordingly."*

---

## Issue 2: VUG Beats Category by 3pp Over 5 Years — But the Category Comparison Misses WHY

### What's right
The output correctly identifies that VUG beats its "Large Growth" category by significant margins:
- 1Y: +2.99pp (Strong)
- 3Y: +2.81pp (Strong)
- 5Y: +3.01pp (Strong)

### What's missing
This is the same story as VOO but in the growth space: **passive indexing beats most active growth managers.** The category has ~1,100 funds. VUG's percentile ranks tell it clearly:

Trailing: 34th (1Y), 28th (3Y), 24th (5Y), 20th (10Y), 16th (15Y)

Same pattern as VOO — the longer you hold, the more active managers it beats. At 15 years, it beats 84% of all large growth funds. The output never highlights this pattern.

### What to fix
Same as VOO — add percentile trajectory analysis and passive investing context.

---

## Issue 3: The Output Format Is Inconsistent — Paragraph Labels in Brackets

### What's wrong
The VUG output uses `[Paragraph 1]`, `[Paragraph 2]` etc. as inline labels. The VOO output used natural paragraph breaks with no labels. The AGG/TLT outputs had `**bold headers**`. The HYG output had no headers at all.

This inconsistency across ETFs means the prompt doesn't enforce a clear output format.

### What to fix
Add explicit formatting rules: *"Do not include paragraph labels like '[Paragraph 1]' or section numbers in the overallAnalysisDetails. Write naturally flowing paragraphs. Each paragraph should transition smoothly to the next."*

---

## Issue 4: The -33.15% Drop in 2022 Gets the Same Treatment as AGG's -13% Drop

### What's wrong
Both VUG (2022: -33.15%) and AGG (2022: -13.06%) experienced their worst years in 2022. But these are fundamentally different:
- AGG's -13% was historically unprecedented for core bonds and destroyed the "safe haven" expectation
- VUG's -33% was a severe but historically normal growth stock correction (similar to 2008)

The prompt gives no guidance on how to contextualize drawdowns relative to the asset class's historical norms. A -33% year for a growth fund is painful but has happened before and recovery has been fast (VUG gained +46.83% the very next year). A -13% year for an aggregate bond fund was a once-in-40-years shock.

### What to fix
Add: *"When discussing drawdown years, put them in historical context for that asset class. A -30% year for a growth equity ETF is severe but has precedent (2008, 2022). A -13% year for a core bond ETF was historically unprecedented. The context changes how a retail investor should interpret the loss."*

---

## Issue 5: Benchmark Tracking Shows VUG Slightly Beats Its Index — Worth Noting

### What's right but underemphasized
VUG's morReturns data shows it slightly outperforms its CRSP US Large Growth Index in several years:
- 2019: VUG `37.26%` vs Index `34.98%` (+2.28pp)
- 2020: VUG `40.16%` vs Index `37.24%` (+2.92pp)
- 2024: VUG `32.68%` vs Index `33.04%` (-0.36pp)

Over trailing periods, VUG matches or slightly beats the index. This is unusual for a passive ETF — usually there's a small drag from expenses. The slight outperformance might come from securities lending income or index replication methodology.

The output says "faithfully delivering the market return" but doesn't note the slight outperformance, which is actually a positive signal.

### What to fix
Low priority, but: *"If a passive index ETF consistently matches or slightly beats its index (rather than lagging by the expense ratio), note this as a positive sign of efficient fund management."*

---

## Issue 6: 52-Week Range Is Huge ($316-$505) — No Context

### What's wrong
VUG's 52-week range is `$316.14` to `$505.38` — a `59.8%` range from low to high. This is massive. The output mentions it briefly but doesn't compare it to what's normal.

For comparison:
- VOO: `$442.80` to `$641.81` — `44.9%` range
- AGG: `$96.15` to `$101.46` — `5.5%` range

The 59.8% range for VUG tells retail investors this fund can swing wildly. This should be contextualized.

### What to fix
Add: *"When citing the 52-week range, calculate the percentage spread (high-to-low) and explain whether this is normal for the ETF's asset class. A 5% range is typical for core bonds, 30-40% for broad equity, and 50%+ for growth/sector equity."*

---

## Issue 7: Category Code "LG" Not Resolved

morReturns shows `Category Name` as `"LG"` instead of "US Fund Large Growth." Same pipeline issue.

---

## Missing Data for VUG

1. **Dividend yield** (~0.5%) — minor for growth ETFs
2. **Expense ratio** (0.04%) — explains the tight/positive tracking
3. **Sector concentration** — VUG is very tech-heavy (~50%+), which explains both the high returns and high volatility
4. **Top holdings concentration** — How much is in the top 10 stocks? For growth ETFs, this is often 40-50%, which is a meaningful risk factor

---

## Cross-ETF Pattern: Equity vs Bond Summary (All 7 ETFs)

| Aspect | Bond ETFs (AAA, TLT, HYG, AGG) | Income (JEPI) | Equity (VOO, VUG) |
|--------|-------------------------------|---------------|-------------------|
| **Factors fit?** | Very poor | Very poor | Good |
| **±2pp threshold?** | Too coarse | Wrong benchmark | Appropriate |
| **Yield/income missing?** | Critical gap | Critical gap | Minor gap |
| **Technical analysis useful?** | Mostly useless | Misleading (distributions) | Somewhat useful |
| **Price vs total return?** | Major confusion | Major confusion | Minor confusion |
| **Tone appropriate?** | Often wrong | Bad (filler words) | Good |
| **Percentile data used?** | No | No | Partially |
| **Strategy awareness?** | No (passive vs active) | No (covered call) | Partial |
| **Output quality** | Mixed | Poor | Good |
| **Beta/volatility context?** | No | No | Mentioned but not in scoring |

The prompt was designed for equity ETFs and it shows. The fixes needed fall into two groups:
1. **Structural changes** needed for ALL ETF types: yield data, percentile usage, price vs total return, category codes
2. **Conditional logic** needed for non-equity ETFs: bond-specific factors, income-strategy awareness, passive tracker evaluation, duration/rate context

---

## Summary of Findings

| Priority | Issue | New or Recurring? |
|----------|-------|-------------------|
| **P1** | No beta-adjustment in factor scoring — 1.21-beta fund judged same as 1.0-beta | New — first high-beta ETF reveals this |
| **P1** | Percentile "longer hold = better rank" pattern not surfaced | Recurring — same as VOO |
| **P1** | Drawdown context missing — -33% for growth vs -13% for bonds are different stories | New — cross-asset-class comparison |
| **P2** | Output format inconsistent across ETFs (bracket labels vs headers vs none) | New — noticed by comparing outputs |
| **P2** | 52-week range not contextualized (59.8% range is huge but not explained) | New |
| **P2** | Slight index outperformance by passive ETF not noted | New — minor |
| **P3** | Category code "LG" not resolved | Recurring |
