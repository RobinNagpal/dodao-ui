# ETF prompt review — future-performance-outlook — iter-1

- **Date:** 2026-04-22
- **Loop:** A (prompt)
- **Category in scope:** FuturePerformanceOutlook
- **ETFs reviewed:**
  - broad-equity: SPY (Large Blend), IWF (Large Growth)
  - sector-thematic-equity: XLK (Technology), XLV (Health)
  - leveraged-inverse: TQQQ (Trading--Leveraged Equity), SQQQ (Trading--Inverse Equity)
  - fixed-income-core: AGG (Intermediate Core Bond), SHY (Short Government)
  - fixed-income-credit: HYG (High Yield Bond), PFF (Preferred Stock)
  - muni: MUB (Muni National Interm), SUB (Muni National Short)
  - alt-strategies: JEPI (Derivative Income), GLD (Commodities Focused)
  - allocation-target-date: AOA (Aggressive Allocation), AOK (Conservative Allocation)

## Per-ETF review

### SPY (broad-equity — Large Blend)

- **What's good:** Clear Favorable verdict anchored in forward P/E (`20.9`), delayed-cut regime, and MA200 context. Overall analysis is formatted as 4 distinct paragraphs with different angles (positioning, regime, valuation+technicals, catalysts). Factor passes/fails are internally consistent with the narrative, each citing concrete numbers (e.g. `18.0%` CY 2026 EPS growth, `97.4M` avg volume) and dated external sources.
- **What's missing / wrong:** The Fed funds range `3.50%–3.75%` appears in multiple paragraphs, violating the "Do not repeat the same number in more than one paragraph" rule. Catalyst paragraph repeats `28–29` FOMC and `12` May CPI without attributing either to a source.
- **Verdict:** no change

### IWF (broad-equity — Large Growth)

- **What's good:** Mixed verdict is well-defended — rich multiples (`32.36` TTM P/E), hostile rate regime, and broken technicals (`-5.46%` vs MA200) are each weighed against strong AI-driven fundamentals. Factor results correctly bifurcate: fundamentals Pass, valuation/regime/technicals Fail.
- **What's missing / wrong:** The 4-paragraph Section 2 collapses into one wall of text on line 14 with inline headers ("POSITIONING:", "REGIME FIT:", "SETUP QUALITY:", "CATALYSTS:") instead of blank-line paragraph breaks. This is a readability regression vs. SPY.
- **Verdict:** change needed — prompt should enforce paragraph breaks.

### XLK (sector-thematic-equity — Technology)

- **What's good:** Each factor gets a distinct anchor: forward P/E `34.00`, weekly RSI `47.4`, `$800B` AI capex. Technical and valuation failures are reconciled with a Pass on fundamentals/sector cycle, which is internally coherent. Mixed verdict is well-justified.
- **What's missing / wrong:** Catalyst paragraph hints at tailwind while section 3 summary calls same events "rich valuation and broken technical trend require massive, continuous earnings beats" — slight narrative tension but acceptable.
- **Verdict:** no change

### XLV (sector-thematic-equity — Health)

- **What's good:** Excellent barbell framing (Lilly GLP-1 vs. managed-care). CMS 2027 Medicare Advantage rate update at `2.48%` is a crisp real-world anchor. 4-paragraph structure with labeled paragraph headers works well.
- **What's missing / wrong:** Two factor sections (`holdings_valuation_outlook`, `fundamental_trajectory`) render with spaces stripped between words ("XLVtradesatareasonable..."). This is a model-level output bug but the prompt could guard against it by explicitly requiring whitespace/readable prose in each factor body.
- **Verdict:** change needed — prompt should add an explicit readability guardrail (no collapsed whitespace in italics / body).

### TQQQ (leveraged-inverse — Trading--Leveraged Equity)

- **What's good:** Correctly identifies volatility decay / daily reset as the dominant structural concern. CBOE VIX `19` post-March spike, `$894M` weekly outflow, and 5-yr beta `3.53` are all decision-useful anchors. Unfavorable verdict lines up with all five factor Fails.
- **What's missing / wrong:** Doesn't explicitly name the expected decay for a 6–12m hold (e.g. compounded drag estimate) — but this borders on prediction, which the prompt correctly forbids. Summary repeats the CBOE VIX story twice.
- **Verdict:** no change

### SQQQ (leveraged-inverse — Trading--Inverse Equity)

- **What's good:** Strong anti-recommendation framing ("strictly a short-term tactical hedge, not a 6–12 month position") aligns with mandate-relative discipline in Section 3. Anchors include `-67.82%` 1-yr return, monthly RSI `26.68`, `100%` CME FedWatch hold probability.
- **What's missing / wrong:** `3.50%–3.75%` Fed range and `core PCE 2.7%` both appear in multiple paragraphs. Same duplication issue as SPY.
- **Verdict:** no change

### AGG (fixed-income-core — Intermediate Core Bond)

- **What's good:** Properly rate/credit-framed. Numbered paragraph headers (`1. **Positioning snapshot.**` etc.) preserve 4-paragraph structure cleanly. IG OAS at `81 bps` is a strong credit-tightness anchor. Duration `5.78 y` correctly assessed as "reasonable compromise" given un-inverted curve.
- **What's missing / wrong:** Minor: valuation factor claims "no margin over 10-year Treasury" but 4.36% SEC vs. 4.32% 10-yr is roughly flat, not negative — phrasing is slightly imprecise.
- **Verdict:** no change

### SHY (fixed-income-core — Short Government)

- **What's good:** Correctly treats `1.88 y` duration as the defining virtue of the fund. Real-yield math (`~1.1%` real yield vs. `2.6%` core CPI) is a concrete anchor. Favorable verdict is defensible for a "cash-like" holding in a sticky-rate regime.
- **What's missing / wrong:** Overall analysis Section 2 is formatted as one long paragraph per subsection rather than distinct blocks — hard to scan but readable. `3.50%–3.75%` Fed target repeated in 3+ paragraphs.
- **Verdict:** no change

### HYG (fixed-income-credit — High Yield Bond)

- **What's good:** Crisp Mixed verdict — SEC yield `6.59%` carry vs. OAS `328 bps` tightness. Section 3 properly reconciles "short duration Pass + credit-cycle Fail" without collapsing to a single verdict on either axis. Distribution sustainability Pass (SEC > TTM dividend) is a correct reading of income quality.
- **What's missing / wrong:** The March OAS tight (`~284 bps`) and current (`328 bps`) are both mentioned but the prompt could emphasize using a single spread snapshot consistently to avoid apparent contradiction.
- **Verdict:** no change

### PFF (fixed-income-credit — Preferred Stock)

- **What's good:** Recognizes preferred-stock duration correctly (perpetual-like) and grades the fund Unfavorable on rate/credit grounds while passing income sustainability. Sector mix (`82.48%` utilities) and payout ratio `63.23%` are useful anchors.
- **What's missing / wrong:** Section 2 (the 4-paragraph overall analysis) is rendered as **one unbroken block of text** on line 14 — paragraphs fully collapse. This is the most severe formatting failure in the sample. Also duplicates `3.50%–3.75%` and `4.30%` across 4+ paragraphs.
- **Verdict:** change needed — prompt should enforce blank-line paragraph breaks.

### MUB (muni — Muni National Interm)

- **What's good:** Correctly computes `4.98%` tax-equivalent yield at `32%` bracket — the most direct muni anchor. Credit cycle Pass is defensible given `22.28%` AAA + `61.34%` AA mix.
- **What's missing / wrong:** Section 2 entirely collapses to one paragraph (same failure mode as PFF). No explicit muni-to-Treasury ratio framing beyond `78%` mentioned — but prompt doesn't mandate it. Factor paragraphs are notably short (~2 sentences each) vs. the "short paragraph" ideal, bordering on terse.
- **Verdict:** change needed — paragraph-break enforcement + suggest minimum factor prose depth.

### SUB (muni — Muni National Short)

- **What's good:** Strong reinvestment-risk framing (the right headwind for ultra-short munis). Tax-equivalent math at `32%` bracket (`3.70%`) and `0.08` 5-yr beta are decision-useful. 4 distinct paragraphs with blank-line separators — readable format.
- **What's missing / wrong:** TCJA/tax-policy catalyst is a nice addition but lacks a source attribution (should be "(source, date)").
- **Verdict:** no change

### JEPI (alt-strategies — Derivative Income)

- **What's good:** Correctly identifies the core structural issue: low-vol regime hurts covered-call premium harvesting. `-8.49%` 3-yr dividend growth rate is a clever, non-obvious anchor for yield-compression concern. Factor set appropriately covers volatility-regime.
- **What's missing / wrong:** Summary cites VIX "14–16 range" while GLD/others cite VIX `19` — internal inconsistency across reports in the same batch. Prompt should anchor to a single as-of VIX read.
- **Verdict:** no change (inconsistency is model-batch artifact, not prompt-fixable without further constraint).

### GLD (alt-strategies — Commodities Focused)

- **What's good:** Correctly frames gold via real yields + dollar + geopolitical hedge — the three right axes. Q1 outflow (`$12B` in March), `21-tonne` Asian inflow, and CFTC de-positioning are excellent contrarian setup anchors. Technical "12.84% above MA200" framing is crisp.
- **What's missing / wrong:** `income_and_yield_sustainability` factor is applied and Fails solely on "0% yield" — this factor fundamentally doesn't fit a commodity ETF; the judgment is tautological and adds little. **This is a Loop B factor-assignment concern, not a prompt-file concern** — noted for the factors review.
- **Verdict:** no change (to the prompt).

### AOA (allocation-target-date — Aggressive Allocation)

- **What's good:** Correctly weights underlying-equity-sleeve drivers as the dominant return engine for an 80/20 fund. `88%` S&P beat rate and CY 2026 `~18%` EPS growth anchor the Favorable case. 4-paragraph structure preserved.
- **What's missing / wrong:** Equity forward P/E `20.9x` and historical averages (`19.9x`, `18.9x`) appear in both Section 2 and the `holdings_valuation_outlook` factor — duplication.
- **Verdict:** no change

### AOK (allocation-target-date — Conservative Allocation)

- **What's good:** Clean numbered-paragraph format. Correctly identifies the core misalignment: 70% bond sleeve in a rising-long-end-yield regime with sticky inflation. SEC yield `3.32%` vs. Fed funds `3.50–3.75%` framing is a sharp carry-disadvantage anchor.
- **What's missing / wrong:** Repeats `3.3%` CPI and `4.30%` 10-yr across four paragraphs. Otherwise solid.
- **Verdict:** no change

## Final changes

- `docs/ai-knowledge/insights-ui/etf-prompts/future-performance-outlook.md` — add explicit paragraph-break enforcement to Section 2 (blank line between each of the 4 paragraphs; do not collapse them into inline-labeled prose), and add a readability guardrail against whitespace-collapsed output in the factor blocks.

Notes for Loop B (factor review) — not acted on here:
- `alt-strategies` group: `income_and_yield_sustainability` is a poor fit for commodity-focused ETFs like GLD (always Fails tautologically on `0%` yield). Consider gating the factor on "fund has an income mandate" or splitting the `alt-strategies` group into income-producing vs. non-income-producing subgroups.
