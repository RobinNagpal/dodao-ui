# Prompt Improvement Analysis: PerformanceAndReturns — Equity ETF (IWD)

**ETF**: iShares Russell 1000 Value ETF (IWD)  
**Category**: PerformanceAndReturns  
**Asset Class**: Equity — Large Value (Passive Index Tracking)  
**Date**: 2026-04-16

---

## What This ETF Is

IWD is a large ($72.4B), well-established passive ETF tracking the Russell 1000 Value Index. It holds `870` value-oriented large/mid-cap stocks. This is the "standard" large-cap value ETF, similar to how VOO is the standard for the S&P 500.

Compared to our other equity ETFs:
- VOO = Large Blend (S&P 500) — the broadest benchmark
- VUG = Large Growth — high beta, tech heavy
- IWD = Large Value — lower beta (0.86), dividend/defensive stocks
- EAGL = Active concentrated value — 34 stocks, actively managed

IWD gives us a good contrast: a passive value ETF during a period where growth dramatically outperformed value.

---

## What the Output Got Right

This is one of the better outputs across all ETFs:
- Clear, balanced summary that accurately calls the profile "moderately strong"
- Correctly identifies the persistent -1.5pp benchmark drag across all periods
- Smart observation: momentum is above MA200 (bullish long-term) but below MA50 (short-term cooling)
- Factor scoring: 4 Pass, 1 Fail — the Fail is for benchmark comparison, which is defensible
- The writing is clean and readable without filler words
- Good use of the 52-week range and beta for context

---

## Issue 1: IWD Trails Its Benchmark by 1.3-1.7pp — But Why?

### What's right
The output correctly identifies that IWD persistently trails the Russell 1000 Value Index:
- 3Y: -1.38pp
- 5Y: -1.66pp
- 10Y: -1.63pp

And it correctly labels `benchmark_comparison` as Fail despite the gaps being within ±2pp, because the pattern is persistent and always negative.

### What's missing
The output says "for a fund aiming to track a specific benchmark, this persistent drag is a structural flaw" but never explains what causes it. For a passive index ETF, the typical causes are:
- Expense ratio (IWD charges ~0.19%)
- Sampling methodology (not holding every stock in the index)
- Cash drag (holding some cash for redemptions)

~1.5pp annual drag is high for a passive ETF. Most S&P 500 ETFs (VOO, SPY) have tracking differences under 0.1pp. A 1.5pp drag on a value ETF suggests either high expenses or poor index replication.

### What to fix
For passive ETFs that trail their benchmark consistently, the prompt should say: *"If a passive index ETF trails its benchmark by a consistent amount across multiple periods, note this tracking difference and suggest that investors check the expense ratio and index replication methodology. A persistent tracking gap of >0.5pp for equity ETFs is notable."*

---

## Issue 2: Value vs Growth Style Context — The Biggest Missing Story

### What's wrong
IWD returned `29.14%` over 1 year. That sounds great. But in the same period, VUG (growth) returned `32.97%` and VOO (blend) returned `31.28%`. The retail investor looking at IWD needs to know: **how has the value style performed relative to growth?**

The morReturns data actually hints at this:
- 2020: IWD = `2.67%`, while VUG (growth) was +40%. Value massively lagged during COVID recovery.
- 2022: IWD = `-7.72%` while VUG was -33%. Value protected much better during the crash.
- 2016: IWD = `17.09%` — a strong value year

The analysis never discusses style rotation. For a value ETF, this is THE most important context a retail investor needs. "Should I be in value or growth right now?" is the #1 question, and the prompt doesn't equip the model to answer it.

### What to fix
Add: *"For style-specific ETFs (Large Value, Large Growth, Small Value, Small Growth), briefly explain how the style has performed recently relative to the broader market. A value ETF underperforming a growth ETF during a tech rally is expected — not a fund flaw. Conversely, if value is outperforming, note that the style rotation is favorable."*

Note: this should be kept brief since the prompt says "do not do deep strategy analysis." But basic style context is performance context, not strategy analysis.

---

## Issue 3: The ±2pp Rule Interacts Interestingly with IWD

### What's happening
IWD's benchmark gaps are all between -1.3pp and -1.7pp — technically "In Line" by the ±2pp rule. The output correctly labels them "In Line" in the relative comparison paragraph. But then the `benchmark_comparison` factor gives a **Fail** because the pattern is persistent.

This is actually GOOD judgment by the model — it recognized that "In Line by the rule but always trailing" deserves a Fail. But the prompt didn't tell it to do this. The model made a judgment call that could go either way on another run.

### What to fix
Make this rule explicit: *"If the ETF trails its benchmark in every available period (even if each gap is within ±2pp), note this as a persistent pattern. For passive index ETFs, persistent trailing across all periods indicates structural tracking drag and should be scored as Fail for benchmark comparison."*

This was also flagged in the TLT analysis. IWD confirms it's a real pattern.

---

## Issue 4: Percentile Ranks Show IWD Is a Median Performer — An Important Story

### The data
IWD's trailing percentile ranks: 37th (1Y), 45th (3Y), 57th (5Y), 60th (10Y), 47th (15Y)

Annual percentiles bounce around: 25th (2016, great), 79th (2017, terrible), 46-68th (most other years)

### What this means
IWD is consistently a **median performer** in the Large Value category — sometimes slightly above, sometimes slightly below, but never elite and never terrible. This is expected for a passive index fund in a category with many active managers.

But the interesting insight: unlike VOO (which beats 80-90% of Large Blend peers over 10-15 years), IWD only beats about 40-50% of Large Value peers. This suggests that **passive indexing works better in the Large Blend/Growth space than in the Value space.** Active value managers may add more value than active blend managers.

The output doesn't surface this at all.

### What to fix
Same recurring issue — mandate percentile analysis. For IWD specifically, comparing the "passive advantage" across style categories would be genuinely useful for retail investors.

---

## Issue 5: Price Trend — Actually Well Done Here

### What's right
The output does a good job with IWD's technical position:
- Above MA200 and MA150 = long-term uptrend confirmed
- Below MA50 = short-term cooling
- RSI = 50.79 = perfectly neutral
- Only -4.49% from ATH = still healthy

This is the best technical analysis across all our ETFs because the signals are actually meaningful for an equity ETF with real price movement and genuine trend behavior.

### What's still missing
The output doesn't note that IWD's technical picture is significantly healthier than VOO and VUG (both below MA200). This relative momentum comparison would be useful — value is currently holding up better than growth/blend in the recent pullback.

---

## Issue 6: Dividend Yield Missing — More Important for Value ETFs

### What's wrong
IWD yields roughly ~2.0-2.5% in dividends. For a value ETF, this is a meaningful part of the return story. The stockAnalyzerReturns shows 1Y total return = `29.14%` and 1Y price change = `26.90%`, so roughly 2.2pp came from dividends.

Value investors typically care more about dividends than growth investors. Missing the yield data is more impactful for IWD than for VUG.

### What to fix
Same as all ETFs — add yield data to schema. For value ETFs specifically, the prompt should mention that a significant portion of returns comes from dividends.

---

## Issue 7: Category Code "LV" Not Resolved

morReturns shows `Category Name` as `"LV"` instead of "US Fund Large Value." Same pipeline issue.

---

## Are the Analysis Factors Right for IWD?

IWD is a well-established passive equity ETF with full data history. Let's check each factor:

| Factor | Works for IWD? | Notes |
|--------|---------------|-------|
| **long_term_cagr** | Yes, well | 5Y/10Y/15Y/20Y data all available. Double-digit CAGR = clearly Pass. |
| **short_term_returns** | Yes, well | 1M slightly negative, but YTD/6M positive, 1Y very strong. Model gives Pass — reasonable. |
| **returns_consistency** | Yes, well | Full annual history shows moderate swings. Pass is correct. |
| **benchmark_comparison** | Yes, best factor | Catches the persistent -1.5pp drag. Fail is well-justified. |
| **price_trend_momentum** | Yes, good | Above MA200 = uptrend, below MA50 = cooling. Pass is correct. |

**IWD is the ETF type the factors were designed for.** Full history, equity, passive, clear benchmark. The factors work well here. The main gap is not in the factors themselves but in the missing context (style rotation, dividend yield, active vs passive comparison).

---

## What IWD Teaches Compared to EAGL

These two ETFs are both in the "value" space but highlight very different issues:

| Aspect | EAGL (Active Value) | IWD (Passive Value) |
|--------|-------------------|-------------------|
| Factors useful? | 3/5 useless (no data) | 5/5 useful |
| Benchmark comparison | -10pp (terrible active picks) | -1.5pp (normal tracking drag) |
| Category rank | 92nd percentile (bottom) | ~40-60th percentile (median) |
| Fund age | ~1 year | 20+ years |
| Concentration | 34 stocks (very high) | 870 stocks (diversified) |
| Style box mismatch | Yes (Blend vs Value) | No (Value = Value) |
| Active management value | Clearly negative | N/A (passive) |

The contrast shows that the prompt needs very different analysis paths for active vs passive funds, and for young vs established funds.

---

## Missing Data for IWD

1. **Dividend yield** (~2.0-2.5%) — Important for value ETFs
2. **Expense ratio** (~0.19%) — Explains most of the tracking drag
3. **Style comparison context** — How value is doing vs growth/blend
4. **Tracking error** (not just tracking difference) — Measures consistency of tracking

---

## Summary of Findings

| Priority | Issue | New or Recurring? |
|----------|-------|-------------------|
| **P1** | Value vs growth style context missing — THE question for style ETFs | New — first time style rotation matters |
| **P1** | Persistent -1.5pp tracking drag not explained (expense ratio is the likely cause) | New variant — same pattern as bond ETFs but smaller |
| **P1** | Passive indexing less effective in value space (50th percentile) vs blend (10th percentile) | New insight from comparing IWD vs VOO |
| **P2** | Dividend yield more important for value ETFs than growth | Recurring — but more impactful for value |
| **P2** | Relative momentum vs other styles not compared (value holding up better than growth) | New |
| **P2** | ±2pp rule + persistent trailing = model made good judgment call, but should be explicit rule | Recurring |
| **P3** | Category code "LV" not resolved | Recurring |
