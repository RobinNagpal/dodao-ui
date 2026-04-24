# Does Comparing an ETF to Its Category or Index Affect the Purchase Decision?

Realistic assessment of when "how does this ETF stack up against its category / index" actually moves the purchase decision, scored by investor type and goal. Built on the taxonomy in `insights-ui/src/etf-analysis-data/etf-target-investor-groups.json` (6 investor types × ~54 goals).

---

## Two distinct comparisons

Every ETF can be compared two ways, and they answer different questions:

1. **Index comparison (tracking)** — Does this ETF faithfully replicate its stated benchmark? Measured via tracking error (annualized stdev of return differences), tracking difference (cumulative return gap), and premium/discount to NAV. Answers: *"Am I getting the beta I signed up for?"*
2. **Category comparison (peer group)** — Against peer ETFs targeting similar exposure, is this one cheaper, better-tracking, more liquid, or structurally different? Answers: *"Is this the right wrapper for the exposure I want?"*

Some scenarios are driven by only one. Some by both. A surprising number are driven by **neither** — the investor is buying for a reason where comparison is not the deciding input.

## When each dominates

**Index comparison dominates when:**
- ETF is a pure passive beta wrapper (VOO, BND, AGG, TLT).
- Holding period is multi-year (drift compounds).
- The investor depends on predictable beta (pension LDI, cash equitization, advisor core models).
- Tax-loss harvesting requires *avoiding* "substantially identical" index methodology.

**Category comparison dominates when:**
- Multiple funds deliver similar exposure with methodology differences (FTSE vs MSCI EM; equal-weight vs cap-weight S&P 500).
- Strategy ETFs with no natural index benchmark (JEPI covered-call, DIVO, buffered ETFs).
- Thematic ETFs competing on stock-selection rules (SOXX vs SMH vs XSD; MJ vs MSOS).
- Fee wars inside commoditized exposures (VOO/SPY/IVV; GLD/IAU/GLDM).

**Neither matters much when:**
- Daily-reset leveraged products — tracking over >5 days is undefined *by design* (TQQQ, SOXL, UVXY).
- Defined-outcome buffer ETFs — payoff is structural, not index-linked (PJAN, PFEB).
- Holding period is days, not quarters — idiosyncratic fund-level noise exceeds fee/tracking differences (short-dated tactical hedge).
- Charitable / DAF funding — you donate existing shares, no new purchase to benchmark.

---

## Scoring (0–100 relevance)

For each scenario below, a single **Comparison Relevance** score reflects how much category or index comparison moves the buy/sell decision. Each score names the **dominant comparison** (Index, Category, or Both), plus a concise rationale grounded in the investor's actual workflow.

- **85–100** — Comparison is the central input; neglecting it costs the investor materially.
- **60–84** — Comparison is a required step but not the primary driver; thesis/exposure selection comes first.
- **35–59** — Comparison matters at the margin; other considerations (yield, structure, regulatory status) dominate.
- **<35** — Comparison barely affects the decision; the purchase is driven by product structure, ultra-short holding period, or non-market considerations.

---

## Retail / Individual Investor

**Simple Broad-Market Start** (VOO, VTI, AOR) — **Relevance: 60 / Index**
At $5K–$50K position sizes, the absolute dollar impact of comparison is small (VOO 0.03% vs IVV 0.03% vs SPY 0.0945% = $5–$30/yr on $30K). But category comparison among big-3 S&P 500 wrappers is easy and habit-forming — if the beginner internalizes "always check the peer fee and the tracking number," they avoid expensive mistakes later. Index comparison matters mostly as a sanity check that the fund isn't quietly drifting from its benchmark.

**Multi-Decade Buy-and-Hold Compounding** (VTI, ITOT, VXUS) — **Relevance: 75 / Both**
Over 30 years, a 3–5bps annual fee or tracking drag compounds to 0.9–1.5% of terminal balance — meaningful on a $500K+ portfolio. Mandate stability is the additional index dimension: an ETF that silently changes benchmarks has broken the thesis. Both comparisons are core cost-efficiency inputs.

**Growth-Tilted Accumulation** (VUG, QQQ, VWO) — **Relevance: 55 / Category**
QQQ tracks Nasdaq-100, VUG tracks CRSP US Large Growth, MGK tracks CRSP US Mega Growth — all called "growth" but with very different holdings. The retail investor is picking which *methodology* fits their growth view; strict index-tracking is assumed to be fine.

**Pre-Retirement De-Risking** (AOM, BND, BSV) — **Relevance: 50 / Category**
AGG vs BND vs SCHZ are near-identical aggregate-bond wrappers. Small fee and liquidity differences. Tracking error on a long-short duration bond index is rarely the issue driving a 55-year-old's allocation decision.

**Retirement Income with Capital Preservation** (AOK, SCHD, BND) — **Relevance: 45 / Category**
SCHD's dividend-screening methodology vs VIG's 10-year dividend growth filter vs DVY's high-yield screen — these are methodology choices, not tracking contests. The investor is picking *which dividend strategy*.

**High Current Yield Income** (JEPI, HYG, PFF) — **Relevance: 50 / Category**
JEPI, JEPQ, DIVO, SPYI, XYLD are all "equity income with derivatives" — structurally different. HYG vs JNK vs USHY for high-yield. Index tracking is moot for option-overlay funds; category peer comparison is everything.

**Sector / Thematic Conviction Expression** (XLK, XLE, INDA) — **Relevance: 65 / Category**
SOXX vs SMH vs XSD all target semiconductors but differ on equal-weight vs cap-weight and equipment inclusion — those differences can be 15–30% of 1-year returns. The retail investor has a *theme view* and needs to pick the expression; index tracking is assumed.

**Leveraged or Active Trading (Retail)** (TQQQ, SOXL, SQQQ) — **Relevance: 20 / Neither**
Daily-reset decay is baked in and understood. TQQQ is not *supposed* to track 3x the QQQ over a year. Comparing to 3x QQQ over any horizon longer than a week is a misuse of the product. Category comparison (TQQQ vs SPXL) rarely decides a trade — the trade idea decides.

**Short-to-Medium-Term Savings Goal** (AOK, BSV, VTIP) — **Relevance: 40 / Category**
Comparing BSV to SCHO to SHY — all 1–3 year Treasury funds — produces small diffs. Yield-to-maturity and duration matter more than whether the fund tracks a specific short-bond index.

**Retail Crypto Allocation** (IBIT, FBTC, ETHA) — **Relevance: 75 / Both**
Spot tracking (premium/discount to NAV, especially during stress) is a live issue in this asset class. Category fee war is real: IBIT 0.25% vs FBTC 0.25% vs BITB 0.20% vs ARKB 0.21% matters on large long-term holds. This is one of the higher-comparison-relevance retail scenarios because the asset itself is commoditized among issuers.

---

## High-Net-Worth Individual / Family Office

**Tax-Efficient Public-Equity Beta Sleeve** (VTI, ITOT, IXUS) — **Relevance: 80 / Index**
At $5M–$100M+ portfolio scale, 1–2bps of annual tracking drag is $500–$20,000 per year — fully actionable. Tax efficiency (low capital-gain distributions) is an index-comparison derivative because it ties to index turnover and methodology. Both broad beta and international coverage are typical competition grounds.

**State-Tax-Exempt Muni Income** (CMF, NYF, MUB) — **Relevance: 55 / Category**
State-specific vs national muni exposure is a methodology choice (CMF California vs MUB national). Duration, credit composition, and call risk matter more than tracking a specific muni index — those are category-level attributes.

**Real-Asset and Alternatives Overlay** (GLD, PDBC, VNQ) — **Relevance: 50 / Category**
GLD vs IAU vs GLDM (1bp to 40bps fee differences, same physical gold); PDBC vs DBC (no-K-1 vs K-1 tax treatment); VNQ vs IYR for REITs. Category fee and structure comparison dominates; "tracking the gold price" is mostly given.

**Concentrated-Position Diversification** (PJAN, PFEB, USMV) — **Relevance: 30 / Neither**
Defined-outcome buffer ETFs deliver a *structural payoff* — caps, buffers, floors over a 12-month outcome period. Comparing PJAN to "the S&P 500 index" is the wrong lens; comparing to other defined-outcome products on the same underlying is about cap rate and buffer level, not tracking.

**Derivative-Income Yield Supplement** (JEPI, JEPQ, QYLD) — **Relevance: 45 / Category**
JEPI (active covered-call on S&P) vs JEPQ (Nasdaq version) vs QYLD vs DIVO vs SPYI — these are *strategy* ETFs competing on realized yield, distribution sustainability, and upside capture. Index comparison is meaningless (they're designed to underperform in bull markets).

**Liquid-Beta Sleeve Alongside Private Allocations** (VOO, IEFA, AGG) — **Relevance: 85 / Index**
The entire purpose is to provide predictable, frictionless beta exposure to complement illiquid private holdings. Any tracking drift shows up as unintended alpha in quarterly reports to the family-office IC. High-fidelity index match is the core spec.

**Multi-Generational Trust Portfolio Construction** (VTI, VXUS, BND) — **Relevance: 80 / Both**
50-year time horizon compounds every basis point. Mandate and benchmark stability (an ETF that changes its index breaks the trustee's documentation) is a significant index-side concern. Category fee comparison obvious at this duration.

**Charitable Giving / DAF Appreciated-Securities Funding** (appreciated existing positions) — **Relevance: 15 / Neither**
The investor is donating already-held appreciated shares. The decision is tax-driven (cost basis, appreciation, DAF rules). No new purchase comparison enters the decision.

---

## Pension / Endowment / Foundation / Sovereign Wealth Fund

**Pension Liability-Driven Investing (LDI)** (TLT, EDV, VGLT) — **Relevance: 75 / Index methodology**
Duration matching to pension liabilities requires the underlying index duration profile to align with liability duration. EDV (~25yr duration) vs TLT (~17yr) vs VGLT (~16yr) are selected *by their index duration*. Tracking error within each is secondary to picking the right duration bucket.

**Endowment / Foundation Spending-Policy Support** (VTI, AGG, IEFA) — **Relevance: 65 / Both**
Spending policies tie to trailing 3-year average AUM, so beta exposure needs to track as expected. Both tracking and category fees are standard inputs to IC memos.

**Institutional Liquid-Beta Sleeve** (VOO, IEFA, AGG) — **Relevance: 90 / Index**
At $1B+ scale, 1bp of tracking drag is $100K per year on a $1B sleeve. RFPs from pension boards explicitly rank candidates on 1/3/5-year tracking error and expense ratio. This is the highest-relevance passive-beta use case.

**IPS-Mandated ESG / SRI / Mission-Aligned Screening** (ESGU, SUSA, USSG) — **Relevance: 75 / Index methodology**
MSCI USA ESG Universal vs S&P 500 ESG vs FTSE US ESG Select use different screens (revenue thresholds, best-in-class vs exclusion, controversy scores). The *methodology* is the entire purchase thesis — the investor is buying a specific moral framework, not tracking one number.

**Institutional Real-Asset / Inflation Hedge** (GLD, BCI, VNQ) — **Relevance: 55 / Category**
Commodity index methodology (GSCI vs DJ-UBS vs equal-weight) differs meaningfully; real estate breadth (VNQ US-only vs RWO global) is a composition choice. Tracking within a chosen index is usually fine.

**Global / EM Diversification at Institutional Scale** (VWO, IEMG, SCHE) — **Relevance: 75 / Both**
FTSE Emerging Markets (VWO, no Korea) vs MSCI Emerging Markets (IEMG/SCHE, Korea included) differ by ~12% of the basket. A-share weights differ. Both the methodology choice and tracking at scale matter.

**Public/Private Allocation Rebalancing Buffer** (VOO, AGG) — **Relevance: 80 / Index**
The buffer function requires rapid, predictable beta deployment to offset private-allocation drift. Tracking fidelity is the definition of fit-for-purpose.

**Cash Equitization & Transition Management** (SPY, IEFA, AGG) — **Relevance: 95 / Index**
This is the highest-relevance scenario across the entire taxonomy. Cash equitization exists specifically to proxy index exposure during transition windows (days to weeks). SPY tends to beat IVV/VOO here despite higher fees because of options depth and intraday liquidity — a category-liquidity consideration that supplements the index priority.

---

## Insurance General Account / Bank / Corporate Treasury

**Operating-Cash Management (Ultra-Short)** (SGOV, BIL) — **Relevance: 35 / Category**
0–3 month Treasury ETFs are nearly interchangeable. Differences in fee (SGOV 0.09% vs BIL 0.136%), dividend mechanics, and platform eligibility drive selection. "Tracking the 0–3m bill index" is essentially given.

**Regulated Investment-Grade Core Fixed Income** (AGG, LQD, VCIT) — **Relevance: 55 / Index methodology**
RBC / Basel capital treatment is computed on look-through holdings, not the ETF ticker. Index methodology (aggregate mix, credit-quality composition, duration) drives capital charge and liability match. Tracking within the chosen index matters less than which index.

**HQLA-Eligible Short Government Exposure** (SHY, GOVT) — **Relevance: 45 / Regulatory structure**
Basel HQLA classification depends on the underlying securities, not tracking. The comparison that matters is which ETF delivers the lowest-capital-charge exposure that still clears HQLA look-through tests.

**Insurance General-Account After-Tax Muni Yield** (MUB, VTEB) — **Relevance: 50 / Category**
After-tax yield comparison across muni ETFs, plus duration and credit composition. Tracking is a secondary concern.

**Insurance Intermediate-Duration Liability Matching** (IEF, VCIT) — **Relevance: 70 / Index methodology**
Duration of the underlying index is the matching criterion. Treasury (IEF ~8yr) vs investment-grade corporate (VCIT ~6.5yr) vs mix affect liability fit directly. Selection is methodology-driven.

**Inflation-Protected Fixed Income (TIPS)** (TIP, SCHP, VTIP) — **Relevance: 60 / Both**
TIP (0–∞ duration) vs SCHP (similar) vs VTIP (0–5yr) differ meaningfully in breakeven exposure and duration. Both index methodology and peer fee comparison matter at insurance scale.

**Short-Corporate-Credit Yield Pickup over Treasury** (VCSH, IGSB) — **Relevance: 50 / Category**
Peer 1–5yr IG corporate ETFs with small yield pickup differences. Fee + liquidity + holdings overlap.

**Agency MBS Allocation** (MBB, VMBS) — **Relevance: 50 / Category**
Peer agency-MBS wrappers with near-identical exposures. Fee, duration, and convexity profile drive selection.

---

## Financial Advisor / RIA / Wealth Manager

**Passive Core Model-Portfolio Building Blocks** (VTI, IXUS, AGG) — **Relevance: 95 / Both**
The advisor's core competency *is* comparison. Every building block in a 60/40 or multi-factor model is the lowest-cost, tightest-tracking peer chosen after explicit head-to-head analysis. This is the single most comparison-intensive retail-adjacent scenario.

**Tax-Loss-Harvesting Partner Pairs** (VTI/ITOT, IVV/VOO) — **Relevance: 90 / Index methodology (avoiding "substantially identical")**
This is the one scenario where the advisor *wants* index methodologies to differ. VTI (CRSP US Total Market) and ITOT (S&P Total Market) deliver ~99% overlap in exposure but track *different indices* — IRS safe harbor for TLH. Comparing index methodologies is the core of the compliance decision.

**Retiree-Tier Income & Conservative Models** (AOK, VYM, SCHD) — **Relevance: 55 / Category**
Dividend and income-focused ETFs; methodology-driven selection. Tracking a specific dividend index is less important than which dividend methodology.

**Conservative-Tier Short-Duration Bond Sleeves** (BSV, VCSH) — **Relevance: 55 / Category**
Peer comparison on yield, duration, credit composition.

**Growth-Tier International & Emerging-Markets Tilt** (IEFA, VXUS, VWO) — **Relevance: 70 / Both**
MSCI vs FTSE international indexes differ on Korea, small-cap inclusion, sampling method. Material at the model-portfolio level.

**Sector / Thematic Satellite Tilt** (XLK, VFH, XBI) — **Relevance: 60 / Category**
Satellite tilts are conviction expressions — picking the right vehicle for the sector view (equal-weight vs cap-weight, pure-play vs diversified) matters more than strict tracking.

**ESG / SRI Client-Model Variant** (ESGU, SUSA) — **Relevance: 75 / Index methodology**
Client-facing ESG screens carry reputational risk — the advisor must be able to explain methodology (which companies excluded and why). Methodology comparison is front-and-center.

**Muni Sleeve for High-Bracket Client Sub-Models** (MUB, state funds) — **Relevance: 55 / Category**
State-specific vs national; duration and credit-quality variants.

**Inflation / Real-Asset Diversification Sleeve** (GLD, PDBC) — **Relevance: 50 / Category**
Peer fund structure (physical vs futures; K-1 vs 1099) is the main axis.

**Defined-Outcome / Derivative-Income for Retiree Tier** (JEPI, PJAN, buffer ETFs) — **Relevance: 30 / Structure, not comparison**
Buffer ETFs and covered-call funds deliver structural payoffs. Comparison to an index is conceptually wrong; peer comparison is about cap rate, buffer level, distribution yield — not tracking.

**Client Cash-Sweep Alternative for Higher Yield** (BIL, BOXX, SGOV) — **Relevance: 40 / Category**
Peer ultra-short ETFs compared on yield, tax treatment (BOXX tax-efficient), and platform availability.

---

## Hedge Fund / Asset Manager / Trading Desk

**Short-Term Equity Beta Wrapper** (SPY, QQQ) — **Relevance: 85 / Index + liquidity**
Hedge funds choose SPY over IVV/VOO despite higher fees specifically because options depth, creation-unit size, and arbitrage tightness are superior (category-side liquidity comparison). Tracking is commoditized among peers; liquidity differentiates.

**Sector Relative-Value Pair Trade** (XLK vs XLP) — **Relevance: 85 / Index + beta profile**
Both legs need clean, predictable exposure — if XLK suddenly shifts methodology (as happened when Visa moved out), the pair becomes unbalanced. Index methodology consistency is central.

**Credit-Spread Expression** (HYG, JNK, BKLN) — **Relevance: 75 / Index methodology**
HYG (iBoxx USD HY) vs JNK (Bloomberg HY Very Liquid) differ on call-constrained bond inclusion, liquidity filters, and fallen-angel treatment. Material for spread-based thesis.

**Rate / Duration Tactical Bet** (TLT, IEF, TBT) — **Relevance: 85 / Index duration**
Fund duration is the *object* of the trade. TLT (~17yr), IEF (~7.5yr), and their inverses (TBT, TMV) are selected by duration profile — the index specifies the bet.

**Macro Commodity Directional Bet** (USO, DBC, CPER) — **Relevance: 65 / Index methodology**
Rolling methodology (GSCI front-month vs optimized roll vs DJ-UBS rebalancing) directly affects returns — USO's contango drag in 2020 is the textbook case. Index methodology comparison is mandatory.

**Leveraged Tactical Short-Term Hedge** (TQQQ, SOXL) — **Relevance: 25 / Neither**
Daily-reset products for <5 day holds. Tracking is structural noise; category (TQQQ vs SOXL) is thesis-driven (Nasdaq vs semis). Comparison barely enters the trade decision.

**Crypto / Digital-Asset Tactical Position** (IBIT, BITO, ETHA) — **Relevance: 55 / Spot tracking + structure**
Spot vs futures (BITO futures roll drag) and spot premium/discount to NAV during stress windows are real frictions. Methodology comparison for short-term trades matters but is dominated by thesis direction.

**Volatility / VIX Tactical Expression** (VXX, UVXY) — **Relevance: 55 / Futures roll methodology**
Not strict "index tracking" (VIX is not directly investable) but product structure (1-month vs short-term VIX futures rolling rules) determines realized return. Category choice (VXX vs SVXY short-vol) is thesis.

**Single-Country / Regional Tactical Bet** (INDA, EWZ) — **Relevance: 70 / Index methodology**
Single-country MSCI vs FTSE indices differ on cap definitions, free-float adjustments, single-stock weight caps. Material for India (Reliance weight cap) and Saudi Arabia specifically.

---

## Summary table

| Investor Type | Goal | Relevance | Dominant |
|---|---|---|---|
| Retail | Simple broad-market start | 60 | Index |
| Retail | Multi-decade buy-and-hold | 75 | Both |
| Retail | Growth-tilted accumulation | 55 | Category |
| Retail | Pre-retirement de-risking | 50 | Category |
| Retail | Retirement income w/ preservation | 45 | Category |
| Retail | High current yield income | 50 | Category |
| Retail | Sector / thematic conviction | 65 | Category |
| Retail | Leveraged / active trading | 20 | Neither |
| Retail | Short-to-medium-term savings | 40 | Category |
| Retail | Retail crypto allocation | 75 | Both |
| HNW / FO | Tax-efficient equity sleeve | 80 | Index |
| HNW / FO | State-tax-exempt muni | 55 | Category |
| HNW / FO | Real-asset / alternatives overlay | 50 | Category |
| HNW / FO | Concentrated-position diversification | 30 | Neither |
| HNW / FO | Derivative-income yield supplement | 45 | Category |
| HNW / FO | Liquid-beta alongside privates | 85 | Index |
| HNW / FO | Multi-generational trust | 80 | Both |
| HNW / FO | Charitable giving / DAF | 15 | Neither |
| Pension / Endow | Pension LDI | 75 | Index (duration) |
| Pension / Endow | Endowment spending-policy support | 65 | Both |
| Pension / Endow | Institutional liquid-beta sleeve | 90 | Index |
| Pension / Endow | IPS-mandated ESG / SRI | 75 | Index (methodology) |
| Pension / Endow | Institutional real-asset / inflation | 55 | Category |
| Pension / Endow | Global / EM diversification at scale | 75 | Both |
| Pension / Endow | Public/private rebalancing buffer | 80 | Index |
| Pension / Endow | Cash equitization / transition mgmt | 95 | Index |
| Insurance / Bank | Operating-cash ultra-short | 35 | Category |
| Insurance / Bank | Regulated IG core fixed income | 55 | Index (methodology) |
| Insurance / Bank | HQLA-eligible short government | 45 | Regulatory |
| Insurance / Bank | After-tax muni yield | 50 | Category |
| Insurance / Bank | Intermediate-duration liability match | 70 | Index (methodology) |
| Insurance / Bank | TIPS inflation-protected | 60 | Both |
| Insurance / Bank | Short-corporate-credit yield pickup | 50 | Category |
| Insurance / Bank | Agency MBS allocation | 50 | Category |
| Advisor / RIA | Passive core model building blocks | 95 | Both |
| Advisor / RIA | Tax-loss-harvesting partner pairs | 90 | Index (methodology) |
| Advisor / RIA | Retiree-tier income models | 55 | Category |
| Advisor / RIA | Conservative-tier short-duration | 55 | Category |
| Advisor / RIA | Growth-tier intl / EM tilt | 70 | Both |
| Advisor / RIA | Sector / thematic satellite tilt | 60 | Category |
| Advisor / RIA | ESG / SRI client-model variant | 75 | Index (methodology) |
| Advisor / RIA | Muni sleeve high-bracket | 55 | Category |
| Advisor / RIA | Inflation / real-asset sleeve | 50 | Category |
| Advisor / RIA | Defined-outcome / derivative-income | 30 | Structure |
| Advisor / RIA | Client cash-sweep alternative | 40 | Category |
| Hedge Fund | Short-term equity beta wrapper | 85 | Index + liquidity |
| Hedge Fund | Sector relative-value pair trade | 85 | Index + beta profile |
| Hedge Fund | Credit-spread expression | 75 | Index (methodology) |
| Hedge Fund | Rate / duration tactical bet | 85 | Index (duration) |
| Hedge Fund | Macro commodity directional | 65 | Index (roll method) |
| Hedge Fund | Leveraged tactical short-term hedge | 25 | Neither |
| Hedge Fund | Crypto tactical position | 55 | Spot + structure |
| Hedge Fund | Volatility / VIX tactical | 55 | Roll methodology |
| Hedge Fund | Single-country / regional tactical | 70 | Index (methodology) |

---

## Patterns that hold across the taxonomy

1. **Size drives actionability.** A 1bp tracking difference is invisible on a $10K retail position and urgent at $100M institutional scale. Relevance scores trend upward with portfolio size within each investor type.
2. **Purpose dictates which comparison matters.** Pure-beta wrappers → index comparison. Strategy ETFs → category comparison. Structural products → neither.
3. **Holding period compounds the effect.** Multi-decade compounders and LDI portfolios care about fractional-bp drag; tactical traders tolerate large tracking errors over short windows.
4. **Regulatory context can override comparison.** Insurance / bank HQLA rules, pension duration-matching requirements, and RIA tax-loss-harvesting substantially-identical avoidance all reframe the comparison — it stops being about "which is best" and becomes "which is *compliant and fit-for-purpose*."
5. **"Comparison" is wrong as the analytical frame for ~15% of goals.** Buffered ETFs, covered-call income funds, leveraged daily-reset products, and DAF funding are structural or non-purchase decisions — reporting a tracking error or category fee delta misleads the investor.

## Implications for the KoalaGains analysis output

- **Every ETF report should state which comparison is the most decision-relevant for which investor type** rather than defaulting to "here is the tracking error and here is the peer fee." Framing the comparison by the investor's goal is more useful than a one-size-fits-all comparison block.
- **Downgrade or omit tracking error for structural / leveraged / outcome ETFs** — presenting a 3-year tracking-error number for TQQQ or PJAN is actively misleading for the reader.
- **Amplify index-methodology differences for ESG, TLH pairs, and single-country funds** — this is where most retail and advisor mistakes are made, and where category-level methodology comparison has the highest decision value.
- **For institutional / HNW reports, report category fees in basis-points per $1M** — that makes actionability explicit.
