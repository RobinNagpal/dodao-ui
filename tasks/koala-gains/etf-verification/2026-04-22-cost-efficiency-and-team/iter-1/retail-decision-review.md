# Retail-investor decision review — Cost, Efficiency & Team — iter-1

- **Date:** 2026-04-22
- **Lens:** is this analysis good enough for a retail investor to use the report
  as a buy / don't-buy decision input? Focus is on (1) whether a cited number
  is framed as good/bad/average for this kind of ETF, (2) whether the report
  names alternatives the reader might actually choose instead, (3) whether it
  surfaces the decision-critical context a retail buyer actually cares about.
  Numeric accuracy is assumed; not re-checked here.

## Cross-cutting patterns

- **Peer naming is the biggest gap.** Almost every report says "cheapest in
  category" or "slightly above ultra-low-cost peers" without naming the peers.
  A Large-Growth investor reading IWF needs to hear "VUG charges `0.04%` and
  tracks a nearly identical benchmark"; a gold buyer reading GLD needs to hear
  "IAU `0.25%` / SGOL `0.17%` / GLDM `0.10%` are the direct alternatives". The
  Pass verdict is meaningless without the alternative the reader would
  actually consider.
- **Distribution yield is systematically missing** for funds where yield IS the
  reason to buy — HYG, PFF, JEPI, SHY, MUB, SUB. For those investors the fee is
  a secondary input; the SEC yield / distribution rate is primary, and its
  absence is the single biggest decision-usefulness gap.
- **Concentration risk under-surfaced.** Preferred stock (PFF) is ~80%
  financials; XLK is ~40% MSFT/NVDA/AAPL; allocation ETFs (AOA/AOK) never
  state the actual equity/bond split. For sector/thematic/preferred/allocation
  funds, the asset-mix sentence is more decision-useful than any fee comment.
- **All-in cost quantification.** For leveraged (TQQQ/SQQQ), the prose names
  "embedded swap financing" and "volatility drag" as concepts but never
  quantifies them. "Headline `0.82%` plus roughly `5%` SOFR plus vol-drag ≈
  6–10% annual hold cost" would be decisive; abstract "significant drag"
  language is not.

## Per-ETF review

### SPY (broad-equity — Large Blend)

The analysis correctly places `0.09%` as cheap and flags that some peers
(`0.03%`) are cheaper — good good/bad framing on fee. The 33-year tenure point
is factual but unhelpful (for SPY the tenure IS the fund age; there's no
meaningful comparison). The biggest miss for a retail decision is that VOO
and IVV are not named — for a buy-and-hold investor, SPY at `9 bps` is strictly
worse than either for a 20-year hold, and SPY's one edge (option-chain depth
and institutional liquidity) is never stated. A new retail reader would walk
away thinking SPY is the obvious core holding; the report should make clear
it's the obvious **trading** holding and the others are better for buy-and-hold.
Overall, relevant and mostly accurate, but conspicuously silent on the single
question most Large-Blend retail buyers face (SPY vs VOO vs IVV).

### IWF (broad-equity — Large Growth)

The report explicitly calls out that IWF's `0.18%` is higher than "some peers
at under `0.05%`" — this is good good/bad framing in kind. What's missing is
naming the peer (VUG at `0.04%` tracks CRSP Growth, very similar exposure).
Quantifying the fee gap matters: `15 bps` over 30 years on a tax-advantaged
retirement account compounds to roughly 4% of ending balance — that's decisive
for a long-horizon retail investor and it's left as an abstract "cost-obsessed
investors should note". The `0.03%` bid-ask plus `$490M` daily volume framing
is relevant and useful for someone comparing trading costs. Asset-mix
concentration in mega-cap tech (Apple, Microsoft, Nvidia dominate the Russell
1000 Growth index) is not mentioned — for a Large-Growth buyer that IS the
portfolio, and it belongs in this report. Overall, closer to decision-useful
than SPY but still missing the specific peer swap-in.

### XLK (sector-thematic-equity — Technology)

Correctly frames `0.08%` as near-zero for sector exposure and names the
`0.10–0.50%` category range — good good/bad context. Completely misses that
XLK's S&P 500 IT sector methodology gives roughly `40%` combined weight to
three names (Apple, Microsoft, Nvidia), which is the defining feature of XLK
vs VGT (broader holdings, `0.09%`) or QQQ (Nasdaq 100, not a pure tech proxy,
`0.20%`). For a retail tech buyer this concentration is the single most
important decision input and it's absent. The `5%` turnover is framed as low
for passive but not against the category norm (important — when S&P
reshuffles IT/communications weights, XLK has trading spikes). The
`active_fee_value` factor on a pure passive fund reads as padding. Overall,
the fee and liquidity framing is adequate; the structural concentration gap
makes this report weak as a buy/don't-buy input.

### XLV (sector-thematic-equity — Health)

Honestly flags the `0.54%` bid-ask as "wider than expected for large funds" —
real critical thinking, not rubber-stamping, which is useful. What's missing
is quantifying that 54 bps: on a `$10,000` round-trip it's a real `$54` hidden
cost for a retail trader, notably worse than the mega-sector norm of 5–15 bps.
Doesn't name VHT (Vanguard Healthcare, `0.09%`, broader) or FHLC (`0.08%`) as
peers with similar fee structures but different index methodologies — those
are the direct retail alternatives. The `62` holdings number is stated but the
concentration in UnitedHealth / Lilly / J&J is not — Health has meaningful
top-holding weight that drives the fund's short-term behavior. The `2%`
turnover point is accurate but feels like trivia without being tied to tax
outcomes for taxable accounts. Overall, better critical thinking than most
reports on execution but weaker on the peer comparison retail needs.

### TQQQ (leveraged-inverse — 3x Nasdaq)

Strongest aspect: explicitly names the daily-reset mechanism, volatility drag,
and that the `0.82%` expense ratio understates the true cost — this is the
single most important retail message for a leveraged fund and the report
delivers it. Correctly labels the product "tactical instrument not a long-term
investment" without soft-selling. The critical gap is that none of the
cost-stack is quantified: retail needs a rough "headline `0.82%` + roughly `5%`
overnight financing cost inside the swaps + vol-drag that can compound to
several more percent per year" so they can see the real hold cost is 7–10% in
a normal regime. Also missing: a concrete historical example (TQQQ's 2022
decline far exceeded 3x QQQ's decline) — one real number beats ten
abstractions. Doesn't compare to QLD (2x Nasdaq) or UPRO (3x S&P 500) —
meaningful for anyone shopping leveraged equity. Overall, correct framing in
prose but not quantitative enough to actually deter a naïve retail buyer.

### SQQQ (leveraged-inverse — -3x Nasdaq)

Correctly labels the overall profile "Mixed" rather than the default "Strong"
— one of only two in the batch to show that discipline, and it's the right
call for an inverse leveraged product. Correctly names volatility drag and
daily-reset compounding. The critical gap is the single number that would
make a retail investor actually stop and think: SQQQ's long-term chart shows
near-total capital erosion for any multi-year holder (cumulative decline of
roughly `99%+` before reverse splits), and this cumulative-destruction point
is completely absent. Without it the "not suitable for long holds" language
lands as a soft warning rather than a hard stop. Doesn't compare to PSQ (-1x
Nasdaq, `0.95%`) or SH (-1x S&P) as lower-leverage hedging alternatives —
retail shopping inverse exposure needs those options named. Overall, directionally
correct but undersells the actual decay math that retail would find persuasive.

### AGG (fixed-income-core — Intermediate Core Bond)

Strong on context: correctly frames `81%` turnover as structural for core bond
funds — retail would otherwise read that as alarming. Rock-bottom `0.03%` fee
is well-placed against category (0.05–0.30% norm). The soft spot is the
`0.52%` quoted market bid-ask — for a `$137B` mega-fund that's unusually wide,
and the report calls it "slight execution friction" when in fact for a retail
buyer a round-trip costs roughly 50 bps, which is notable if they plan to
rebalance periodically. Doesn't compare to BND (Vanguard core bond, `0.03%`,
nearly identical exposure) — retail's direct alternative and arguably a
better-constructed index. No mention of effective duration (~6 years) or SEC
yield, both of which are the primary decision inputs for a bond investor.
Overall, the cost framing is good but the analysis reads as if it were
written for someone already sold on AGG — it doesn't help a prospective buyer
choose between core bond ETFs.

### SHY (fixed-income-core — Short Government)

Correctly frames `55%` turnover as mechanically expected for a 1-3 year
Treasury roll — useful context a retail investor wouldn't intuit. Fee is
stated at `0.15%` but not placed against VGSH (Vanguard short Treasury,
`0.03%`) or BIL (SPDR 1-3M T-bills, `0.1353%`) — both meaningful alternatives
for someone parking cash, and SHY being `11–12 bps` more expensive than VGSH
matters a lot when the total yield is only ~4%. The biggest decision-
usefulness gap is that the SEC yield (~`4%`) is never stated — the entire
reason a retail investor buys SHY is the yield, and they cannot compare SHY
to a high-yield savings account or a money-market fund without seeing it.
Duration (~`1.85 years`) is also omitted, which is the core risk characteristic
of short Treasuries. Overall, the fund-operations framing is fine but the
investment-decision framing is very thin — a retail reader comes away
knowing the ETF is stable but not whether it's actually the right product
for their cash-alternative need.

### HYG (fixed-income-credit — High Yield Bond)

Strongest piece of critical analysis in the batch: correctly **Fails** the
`0.49%` fee and correctly Fails `active_fee_value` — specific, concrete, and
grounded (passive HY peers charge roughly half). This is exactly the kind of
decisive verdict retail needs. Names the March 2020 NAV dislocation with a
concrete `-2%` widening — useful stress context. Big gap: doesn't name the
actual cheaper peers (JNK at `0.40%`, SPHY at `0.10%`, SHYG at `0.35%`) — a
Fail verdict is half-useful without the alternative. Distribution yield
(~`6.5–7%`) is never stated, and yield is the entire reason retail buys HY.
The Morningstar-pillar chat in `mor_assessment` adds nothing a retail reader
can act on. Overall, the fee Fail is genuinely decisive and that makes this
one of the better reports — just needs the alternative ETF named and the yield
number surfaced.

### PFF (fixed-income-credit — Preferred Stock)

Correctly places `0.45%` in the cheapest quintile of preferred-stock ETFs —
honest good/bad framing for the category. Names Jennifer Hsui's `13.7-year`
tenure — useful stability signal. Big decision-usefulness gaps: (1) doesn't
state the `~6%` SEC yield that is the entire reason someone owns preferreds;
(2) doesn't mention that the preferred stock asset class is roughly `80%`
financials / banks, which is crucial concentration risk retail should weigh
(one bank crisis hits preferred hard, as 2023 demonstrated); (3) doesn't
compare to PGX (Invesco preferred, `0.50%`, different methodology) or SPFF
(Global X, `0.58%`). The `$73M` daily volume and effectively `0%` spread are
genuinely useful for trading-cost purposes. Overall, cleaner on cost framing
than on asset-class risk, which is the wrong priority for a preferred-stock
buyer — retail needs to know what they're actually getting exposed to first,
fee second.

### MUB (muni — Muni National Interm)

One of the stronger reports structurally: actually names top holdings with
their coupon rates (Texas University Revenues `0.20%` weight, Atlanta Water
`0.19%`, NY Thruway `0.16%`) — genuinely useful texture that most reports
skip. TEY framing at `32%` federal bracket is the right muni lens. Fee
context is solid — `0.05%` placed against the `0.10–0.40%` category norm.
The gap is that the actual SEC yield isn't stated, so the TEY calculation is
abstract rather than concrete ("if SEC yield is ~`2.8%`, TEY = `4.1%` at 32%
bracket, better than an intermediate Treasury ETF yielding `4.0%` pre-tax").
Doesn't compare to VTEB (Vanguard national muni, `0.05%`, nearly identical
holdings) — the direct retail alternative. The "6,346 municipal bonds and 86
other holdings" phrasing leaves the reader wondering what the 86 are. Overall,
the most retail-decision-ready of the bond reports, but still needs the yield
number that makes TEY concrete.

### SUB (muni — Muni National Short)

The single best report in the batch for retail decision-usefulness on
yield: explicitly states `2.51%` SEC yield AND the `3.69%` TEY at a 32%
bracket — this is exactly the concrete math a muni-buyer needs and it's the
only report that delivers it. AMT-exclusion is correctly flagged as relevant
for high earners. Where it stops short: doesn't name VTES (Vanguard short muni,
`0.07%`, very similar) or SHM (SPDR short muni, `0.20%`) — the direct retail
alternatives. No duration number (~`1.9 years`) which is the fund's defining
risk characteristic. The structural warning that short-muni TEY may not beat
T-bill yields for lower-bracket investors is a genuinely decisive insight,
but doesn't cite actual T-bill yields (~`4–5%`) to let the reader close the
math. Overall, the closest any report comes to "use this to make a buy
decision" and still has room to improve on peer naming.

### JEPI (alt-strategies — Derivative Income)

Strong on strategy mechanics: correctly names Equity-Linked Notes, correctly
Fails `portfolio_turnover` for tax reasons, correctly frames the ordinary-
income distribution character — all decision-critical for taxable-account
retail. `0.35%` fee is well-placed against the `0.30–0.80%` active-alternative
norm. Morningstar Silver rating is mentioned but the pillar justifications
are thin. Biggest gap: the distribution yield (~`7–8%`) is NEVER stated, and
yield is the *only* reason retail buys JEPI — everything else is secondary.
Doesn't compare to JEPQ (JPM's Nasdaq version, same `0.35%`, higher vol-
harvesting) or QYLD (Global X covered call, `0.60%`, much weaker downside
protection) — these are the direct retail decisions. The 2022 drawdown
framing (`-3.53%` vs benchmark `-19.43%`) is exactly the right kind of
concrete evidence for covered-call value — one of the best single data
points in any report. Overall, strong on mechanics and risk framing,
weak on the yield-and-peer comparison that actually drives a purchase.

### GLD (alt-strategies — Commodities Focused)

Genuinely useful tax discussion: correctly names the `28%` collectibles rate
on long-term gains and the `1099` (not K-1) structure — most retail don't
know either of these and they directly affect after-tax returns. The
physical-trust vs futures-trust distinction is implied but not stated
explicitly (GLD is physical, PDBC is futures-based — very different tax
treatment). **Critical miss:** at `0.40%`, GLD is the *most expensive* of the
major physical-gold ETFs; IAU is `0.25%`, SGOL is `0.17%`, and GLDM (State
Street's own cheaper sibling) is `0.10%`. For a 20-year hold on gold, the
fee gap between GLD and GLDM compounds to roughly 6% of ending balance —
decisive and completely absent from the report. The zero-turnover / no-yield
framing is honest. Overall, the tax discussion is actively useful but the
report fails the single most important retail gold-buyer question: "is GLD
still worth it or should I use a cheaper gold ETF?" — the honest answer is
"buy GLDM, but GLD has more options liquidity if you trade it" and the
report never frames that trade-off.

### AOA (allocation — Aggressive Allocation)

Honestly notes the February 2026 Morningstar category reclassification
(Global Aggressive → Moderately Aggressive) while clarifying the mandate
didn't change — unusually honest signal-surfacing for a routine report.
`0.15%` fee is reasonable for one-ticker convenience but is NOT
bottom-quintile once you consider that a DIY blend of IVV (`0.03%`) + AGG
(`0.03%`) weighted roughly 80/20 costs `~0.03%` — the AOA fee captures the
convenience premium, and naming that trade-off is the decision-useful move
the report misses. **The single biggest miss: the report never states the
actual asset mix (80/20 global equity/bond) that IS the product** — a retail
reader would need to separately Google what AOA actually holds, which is
exactly the work an analysis is supposed to do for them. Doesn't compare to
VASGX (Vanguard LifeStrategy Growth) or AOR (moderate sibling) — direct
retail decisions. Tenure and issuer framing are fine but don't move the needle
on a buy decision. Overall, adequate on operations, weak on the question
"what am I actually buying and why this vs a DIY blend?"

### AOK (allocation — Conservative Allocation)

Useful practical warning: explicitly calls out the `$4.3M` daily dollar
volume as potentially thin for large orders and suggests limit orders — a
concrete retail-actionable point most allocation-report writeups skip.
`0.15%` fee framing is the same reasonable-for-convenience take as AOA. Same
structural gap: the asset mix (roughly 30% equity / 70% bond for a
conservative allocation fund) is the product, and it's never stated. The
`3%` turnover point is accurate but not decisively framed — for a DIY
comparison a retail reader needs to know that low turnover means the
rebalancing cost inside AOK is negligible and the only real DIY gain is
on the top-line fee. Doesn't name VASIX (Vanguard LifeStrategy
Conservative, `0.11%`) or AOM (iShares Moderate) — the alternatives retail
would actually consider. Track record and tenure framing are fine. Overall,
weak on the actual decision architecture ("why AOK vs build-it-yourself vs
Vanguard's conservative allocation fund"), stronger than AOA on the
practical trading warning.

---

## Summary: decision-usefulness grade by report

- **Stronger for retail decision-making:** SUB (explicit yield+TEY math),
  MUB (top-holdings texture + TEY framing), HYG (decisive fee Fail +
  stress-period number), JEPI (strategy mechanics + 2022 downside
  evidence), GLD (tax structure explained even if peer naming is missing).
- **Middle tier:** SPY, IWF, XLV, TQQQ, AGG, AOK — mostly-correct framing
  but consistently missing either peer naming or the single number that
  drives the decision.
- **Weaker for retail decision-making:** XLK (concentration risk missing),
  SQQQ (decay math missing), SHY (yield and duration missing), PFF (asset-
  class concentration missing), AOA (asset mix missing).

## Highest-impact fixes (report-level, not prompt-level)

1. **State the SEC yield / distribution yield** explicitly in every report
   for a yield-driven product (HYG, PFF, JEPI, SHY, MUB, SUB). This single
   line elevates five reports from descriptive to decisive.
2. **Name the direct retail alternative** by ticker with its fee in every
   report. "VOO `0.03%` is cheaper but less option-liquid" beats
   "some peers are cheaper" every time.
3. **State the concentration / asset-mix sentence** for sector, preferred,
   and allocation funds. What's actually in the portfolio is the first
   question a retail buyer has; it should be answered in the first paragraph.
4. **Quantify structural cost stacks for leveraged/inverse** — one sentence
   with numbers ("headline 0.82% + ~5% financing + vol drag → 7–10% real
   annual drag") beats abstract "significant embedded costs" prose.
