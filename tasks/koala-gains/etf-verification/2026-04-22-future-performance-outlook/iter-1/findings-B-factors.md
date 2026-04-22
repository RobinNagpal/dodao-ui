# ETF verification findings — Loop B — factors — iter-1

- **Date:** 2026-04-22
- **Loop:** B (factors)
- **Category in scope:** FuturePerformanceOutlook
- **Files reviewed:**
  - `insights-ui/src/etf-analysis-data/etf-analysis-categories.json`
  - `insights-ui/src/etf-analysis-data/etf-analysis-factors-future-performance-outlook.json`
- **ETFs reviewed (reused from Loop A):**
  - broad-equity: SPY (Large Blend), IWF (Large Growth)
  - sector-thematic-equity: XLK (Technology), XLV (Health)
  - leveraged-inverse: TQQQ (Trading--Leveraged Equity), SQQQ (Trading--Inverse Equity)
  - fixed-income-core: AGG (Intermediate Core Bond), SHY (Short Government)
  - fixed-income-credit: HYG (High Yield Bond), PFF (Preferred Stock)
  - muni: MUB (Muni National Interm), SUB (Muni National Short)
  - alt-strategies: JEPI (Derivative Income), GLD (Commodities Focused)
  - allocation-target-date: AOA (Aggressive Allocation), AOK (Conservative Allocation)

All 8 groups use exactly 5 factors each (matches the `categoryDescription` constraint).

## Per-ETF review

### SPY (broad-equity — Large Blend)

- **Factors applied:** holdings_valuation_outlook, fundamental_trajectory, macro_regime_fit, near_term_catalysts, flows_and_positioning.
- **What's good:** Every factor contributed a differentiated read — valuation (`20.9` forward P/E), fundamentals (`18.0%` CY26 EPS growth, `88%` beat rate), regime (cash-rich mega-cap insulation from higher-for-longer), catalysts (Fed + CPI + earnings), flows (`$12.4B` weekly SPY inflow). No tautological grades.
- **What's missing / wrong:** technical_trend_setup is not assigned to this group — correct choice, because broad-equity passive should not be graded primarily on short-term trend; the prompt itself says technicals are secondary for broad-equity.
- **Verdict:** no change

### IWF (broad-equity — Large Growth)

- **Factors applied:** same as SPY.
- **What's good:** Factor set cleanly separated valuation/regime Fails from fundamental Pass — correctly surfaced the tension between strong AI-cycle earnings and hostile rate regime.
- **What's missing / wrong:** Nothing — every factor added signal.
- **Verdict:** no change

### XLK (sector-thematic-equity — Technology)

- **Factors applied:** holdings_valuation_outlook, fundamental_trajectory, sector_theme_cycle_position, technical_trend_setup, near_term_catalysts.
- **What's good:** sector_theme_cycle_position is the strongest factor here — correctly framed the AI capex supercycle as markup-phase. technical_trend_setup caught the price slipping below MA50/MA200. All 5 contributed.
- **What's missing / wrong:** macro_regime_fit is not assigned to sector-thematic-equity, but the fund is highly duration-sensitive and the report heavily referenced Fed regime in overall analysis. This is a minor gap — macro gets absorbed into sector_theme_cycle_position and the overall narrative, so not a pressing fix.
- **Verdict:** no change

### XLV (sector-thematic-equity — Health)

- **Factors applied:** same as XLK.
- **What's good:** Factor set handled the barbell (Lilly GLP-1 growth vs. managed-care value) well — sector_theme_cycle_position graded the fragmented sub-sector stages, fundamental_trajectory caught the Merck/JNJ strength vs. UNH/Abbott drawdowns.
- **What's missing / wrong:** Same minor macro_regime_fit gap — acceptable.
- **Verdict:** no change

### TQQQ (leveraged-inverse — Trading--Leveraged Equity)

- **Factors applied:** macro_regime_fit, technical_trend_setup, near_term_catalysts, flows_and_positioning, volatility_regime_context.
- **What's good:** Factor set is perfectly tuned for daily-reset leveraged funds. volatility_regime_context captured the compounding-decay concern; technical_trend_setup caught the MA50 < MA200 bearish cross; flows_and_positioning caught the `$894M` weekly outflow. All 5 unanimous Fails with distinct evidence.
- **What's missing / wrong:** holdings_valuation_outlook is correctly excluded — TQQQ's exposure is via swaps, not owned cash equities, so intrinsic holdings-valuation is secondary.
- **Verdict:** no change

### SQQQ (leveraged-inverse — Trading--Inverse Equity)

- **Factors applied:** same as TQQQ.
- **What's good:** Factor set correctly produced 5 unanimous Fails with distinct evidence (decay, broken trend, hostile catalysts, crowded fear-index readings, toxic vol regime).
- **What's missing / wrong:** Nothing.
- **Verdict:** no change

### AGG (fixed-income-core — Intermediate Core Bond)

- **Factors applied:** holdings_valuation_outlook, macro_regime_fit, rate_path_and_duration_positioning, credit_cycle_and_spreads, near_term_catalysts.
- **What's good:** rate_path_and_duration_positioning (`5.78y` duration) and credit_cycle_and_spreads (IG OAS `81 bps`) are the two highest-signal factors here — correctly split into Pass (duration compromise) and Fail (tight spreads on the `24.26%` IG corporate sleeve). All 5 factors added distinct signal.
- **What's missing / wrong:** Nothing.
- **Verdict:** no change

### SHY (fixed-income-core — Short Government)

- **Factors applied:** same as AGG.
- **What's good:** 4 of 5 factors (holdings_valuation_outlook, macro_regime_fit, rate_path_and_duration_positioning, near_term_catalysts) are high-signal.
- **What's missing / wrong:** `credit_cycle_and_spreads` passes tautologically for a 100%-Treasury fund — the report's own text admits this: "Being 100% allocated to U.S. Treasuries, the fund entirely bypasses the risks associated with late-cycle corporate spread widening... passing the credit cycle factor by default." This contributes no signal for Treasury-only funds. However, the same factor is highly meaningful for other fixed-income-core categories in this group (Intermediate Core Bond, Corporate Bond, Securitized, etc.), so the group-level inclusion is still correct — it just reads as an automatic Pass for government-only categories. Low-priority; no change.
- **Verdict:** no change

### HYG (fixed-income-credit — High Yield Bond)

- **Factors applied:** macro_regime_fit, rate_path_and_duration_positioning, credit_cycle_and_spreads, near_term_catalysts, income_and_yield_sustainability.
- **What's good:** credit_cycle_and_spreads is the central factor and correctly Failed on `328 bps` OAS in the tightest historical quintile. income_and_yield_sustainability properly Passed (SEC `6.59%` > TTM distribution `5.86%` → earned yield).
- **What's missing / wrong:** Nothing.
- **Verdict:** no change

### PFF (fixed-income-credit — Preferred Stock)

- **Factors applied:** same as HYG.
- **What's good:** rate_path_and_duration_positioning correctly penalized PFF's effective long/perpetual duration profile. income_and_yield_sustainability properly Passed (fully-earned SEC `6.34%`, payout ratio `63.23%`).
- **What's missing / wrong:** Nothing.
- **Verdict:** no change

### MUB (muni — Muni National Interm)

- **Factors applied:** holdings_valuation_outlook, rate_path_and_duration_positioning, credit_cycle_and_spreads, near_term_catalysts, income_and_yield_sustainability.
- **What's good:** holdings_valuation_outlook pulled in tax-equivalent math (`4.98%` at `32%` bracket). rate_path_and_duration_positioning correctly Failed on `6.57y` duration in a stalling-cuts regime. income_and_yield_sustainability Passed cleanly (no ROC, organic carry).
- **What's missing / wrong:** `credit_cycle_and_spreads` passes near-tautologically on a `22.28%` AAA + `61.34%` AA mix. Same as SHY's case, but the group includes High Yield Muni (`14` funds per categories.json) where the factor is essential — so group-level inclusion stays correct.
- **Verdict:** no change

### SUB (muni — Muni National Short)

- **Factors applied:** same as MUB.
- **What's good:** 4 of 5 factors high-signal (especially rate_path_and_duration_positioning on `1.85y` duration, and income_and_yield_sustainability capturing the reinvestment-risk lens).
- **What's missing / wrong:** Same tautological credit_cycle_and_spreads Pass for `30.06%` AAA + `54.48%` AA. Same rationale — leave as-is.
- **Verdict:** no change

### JEPI (alt-strategies — Derivative Income)

- **Factors applied:** macro_regime_fit, near_term_catalysts, income_and_yield_sustainability, flows_and_positioning, volatility_regime_context.
- **What's good:** Factor set is *perfectly* matched to a covered-call income fund. income_and_yield_sustainability caught the `-8.49%` 3-yr dividend growth (shrinking premium). volatility_regime_context correctly Failed on compressed VIX. flows_and_positioning caught the crowded-long retail setup. All 5 factors delivered distinct signal.
- **What's missing / wrong:** Nothing.
- **Verdict:** no change

### GLD (alt-strategies — Commodities Focused)

- **Factors applied:** same as JEPI.
- **What's good:** macro_regime_fit (real-yield opportunity cost), flows_and_positioning (washed-out Q1 outflows + CFTC de-positioning), volatility_regime_context (gold-as-diversifier in a geopolitical vol regime), and near_term_catalysts (FOMC + CPI + geopolitics) all delivered strong signal.
- **What's missing / wrong:** **`income_and_yield_sustainability` Fails tautologically for a physical-gold commodity ETF with `0.00%` yield.** The report's own reasoning admits this: "GLD is fundamentally designed to provide exposure to the price of gold bullion and does not engage in any yield-generating activities... carries a `0.00%` TTM yield and a `0.00%` SEC yield... holding an asset with zero yield represents a massive opportunity cost." This is a tautology — the factor isn't grading sustainability of income, it is restating that the fund isn't an income fund. The same problem will hit other non-income categories in the `alt-strategies` group: `Commodities Focused` (51 funds), `Commodities Broad Basket` (30), `Digital Assets` (91), `Equity Market Neutral` (2), `Systematic Trend` (13), `Single Currency` (7), `Macro Trading` (3), `Long-Short Equity` (13), `Multistrategy` (8), `Event Driven` (6), `Multialternative` (1), `Relative Value Arbitrage` (1), `Commodities Precious Metals` (1).
- **Verdict:** **change needed** — extend the factor description to explicitly handle non-income-mandate funds within the alt-strategies group so they don't auto-fail on zero yield.

### AOA (allocation-target-date — Aggressive Allocation)

- **Factors applied:** holdings_valuation_outlook, fundamental_trajectory, macro_regime_fit, rate_path_and_duration_positioning, near_term_catalysts.
- **What's good:** Factor set correctly covers the dual-sleeve structure (equity valuation + fundamentals on the 80% equity sleeve; rate path on the 18% bond sleeve) plus the macro and catalyst overlay. All 5 factors delivered distinct signal.
- **What's missing / wrong:** Nothing critical. flows_and_positioning could arguably be useful for allocation funds, but with only 5 slots and near_term_catalysts being more universally applicable, the tradeoff is right.
- **Verdict:** no change

### AOK (allocation-target-date — Conservative Allocation)

- **Factors applied:** same as AOA.
- **What's good:** rate_path_and_duration_positioning correctly dominated on a 70%-bond sleeve. holdings_valuation_outlook captured the dual lens (bond carry uncompetitive with Fed funds; equity forward P/E rich). All 5 factors contributed.
- **What's missing / wrong:** Nothing.
- **Verdict:** no change

## Group-level summary

| Group | Factors | All 5 useful for sampled ETFs? |
| --- | --- | --- |
| broad-equity | holdings_valuation_outlook, fundamental_trajectory, macro_regime_fit, near_term_catalysts, flows_and_positioning | Yes |
| sector-thematic-equity | holdings_valuation_outlook, fundamental_trajectory, sector_theme_cycle_position, technical_trend_setup, near_term_catalysts | Yes |
| leveraged-inverse | macro_regime_fit, technical_trend_setup, near_term_catalysts, flows_and_positioning, volatility_regime_context | Yes |
| fixed-income-core | holdings_valuation_outlook, macro_regime_fit, rate_path_and_duration_positioning, credit_cycle_and_spreads, near_term_catalysts | Yes for IG mix (AGG); credit_cycle_and_spreads is a low-signal auto-Pass for pure-Treasury (SHY) — group-level OK |
| fixed-income-credit | macro_regime_fit, rate_path_and_duration_positioning, credit_cycle_and_spreads, near_term_catalysts, income_and_yield_sustainability | Yes |
| muni | holdings_valuation_outlook, rate_path_and_duration_positioning, credit_cycle_and_spreads, near_term_catalysts, income_and_yield_sustainability | Yes for IG munis; credit_cycle_and_spreads is a low-signal auto-Pass for AAA/AA-heavy MUB/SUB — but essential for High Yield Muni — group-level OK |
| alt-strategies | macro_regime_fit, near_term_catalysts, income_and_yield_sustainability, flows_and_positioning, volatility_regime_context | Yes for income strategies (JEPI); `income_and_yield_sustainability` auto-Fails tautologically for non-income mandates (GLD) — **fix applied** |
| allocation-target-date | holdings_valuation_outlook, fundamental_trajectory, macro_regime_fit, rate_path_and_duration_positioning, near_term_catalysts | Yes |

## Final changes

- `insights-ui/src/etf-analysis-data/etf-analysis-factors-future-performance-outlook.json` — extended `income_and_yield_sustainability.factorDescription` to explicitly carve out non-income-mandate funds in the `alt-strategies` group (commodity-focused, digital-asset, managed-futures, market-neutral, macro, long-short, single-currency, etc.) so they pass by default instead of auto-failing on `0%` yield. The existing Pass/Fail logic for income-mandate funds (credit, preferred, muni, derivative-income) is preserved unchanged.
- `insights-ui/src/etf-analysis-data/etf-analysis-categories.json` — **no change**. Group membership and category-to-group mapping are correct across all 16 sampled ETFs.
- All 8 groups continue to use exactly 5 factors each.
