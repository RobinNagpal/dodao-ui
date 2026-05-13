# ETF categories evaluation — decisions log

This document captures the questions we are working through about the ETF group
structure in `insights-ui/src/etf-analysis-data/etf-analysis-categories.json`,
and the decisions we have finalised so far. It is written in plain language so
anyone picking this up later understands not just _what_ we decided but _why_.

Each entry follows the same shape:

- **Question** — what we asked.
- **Decision** — what we are going with.
- **Why** — the short reasoning.
- **What this means in the code** — which group keys are affected (no JSON
  changes yet — those come in a follow-up PR).

This file is the source of truth for our group-structure decisions. Open
questions still under discussion live in the chat thread and are added here
only after they are finalised.

---

## Q1. What is the difference between "Fixed Income — Core & Government" and "Municipal Bonds"? Are all municipal bonds tax-free?

### Decision

**Keep `muni` as its own separate group.** Do not merge it into the two non-muni
bond groups.

### Why (short version)

- The other two bond groups split bonds by **risk type** (rate risk vs credit
  risk). Muni is split off by **issuer + tax treatment**. That is a different
  axis, so muni cannot sit cleanly inside either of the other two.
- Coupon income from most munis is **federally tax-exempt**, and often
  state-tax-exempt if you live in the state that issued the bond. This changes
  the entire decision a retail investor makes about whether to buy. None of the
  other bond groups have this dynamic.
- Munis are also usually wrong to hold inside an IRA / 401(k) — you give up the
  tax break for no reason. Non-muni bond funds do not have this caveat.
- The right peer for comparing a muni fund is _other muni funds_, not the
  taxable aggregate. Folding muni into core would push the analysis toward
  AGG / BND comparisons that mislead the reader.

### Are all municipal bonds tax-free?

**No — this is a common retail myth.** The accurate framing:

- Coupon interest on most munis is exempt from **federal** income tax. That is
  the headline reason people buy them.
- State tax exemption is **only** available if you live in the state that
  issued the bond. A Californian holding a California muni fund usually pays
  no California state tax on the coupons. A New Yorker holding the same
  California fund still pays New York state tax on those coupons.
- Some munis are **federally taxable** (e.g. Build America Bonds from
  2009–2010 — still outstanding).
- Some "private-activity" munis trigger the **Alternative Minimum Tax (AMT)**
  even though the interest looks tax-free on the surface.
- **Capital gains are never tax-free.** If a muni fund sells bonds at a gain,
  that gain is taxable to shareholders. The tax exemption applies only to
  _interest income_, not to selling at a profit.

### What this means in the code

- `groups[].key = "muni"` stays.
- The prompt for muni should branch by the four sub-types we already have in
  the universe:
  1.  **National muni** (Muni National Short / Interm / Long) — diversified
      across all US states, lens is duration + federal tax-equivalent yield.
  2.  **Single-state muni** (California, New York, Minnesota, Massachusetts,
      New Jersey, Ohio, Muni Single State Short) — only worth holding if you
      live in that state. Concentration risk if that state's finances
      deteriorate.
  3.  **High Yield Muni** — credit-driven, treat similarly to other credit
      funds but keep the tax wrapper in the yield comparison.
  4.  **Muni Target Maturity** — defined end-date ladder, analyse on yield
      to maturity + reinvestment risk.

---

## Q2. Can alternative strategies be grouped differently?

### Decision

**Split the current `alt-strategies` group into three groups:**

| New group key             | What goes in it                                                                                                                                                                                                                                          | Why this is a coherent group                                                                                                                                                                                                                                                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`commodities-and-digital-assets`** | Commodities Focused, Commodities Broad Basket, Commodities Precious Metals, Gold, Silver, Natural Gas, Crude Oil, Carbon Credits, Digital Assets, Long BTC, Long ETH, Long XRP, Long SOL, Long Cryptocurrency Basket, the long/short crypto pairs, Single Currency, Long USD, Long CAD, and the long/short currency pairs | All of these are **direct exposures to a thing** — a commodity, a coin, or a currency. The decision question is "should I own this thing, and how much?" — not "did a manager run a process well?". Tax wrappers (K-1 for some commodity funds) and roll-yield/contango (futures-based commodities) are the universal concerns. |
| **`strategy-funds`**      | Systematic Trend, Long-Short Equity, Multistrategy, Equity Market Neutral, Macro Trading, Event Driven, Relative Value Arbitrage, Multialternative, Volatility, Downside Hedge                                                                            | These are **hedge-fund-style** funds where a manager runs a process to generate uncorrelated returns. The decision question is "did the strategy deliver on its mandate (lower vol, downside protection, diversification)?" — measured against an HFR sub-index, not the S&P. |
| **`derivative-income`**   | Derivative Income, Defined Outcome, Equity Hedged                                                                                                                                                                                                          | These are **payoff-engineered** funds — covered call income, put-write, collared equity, buffered ETFs. The decision question is "what is my buffer / cap / dividend yield, through what date, and what do I give up?". By far the largest sub-bucket (~600 of the 828 ETFs in current `alt-strategies`). |

The old `alt-strategies` group key goes away.

### Why

- The current `alt-strategies` group contains 828 US ETFs that share almost
  nothing in common. The largest sub-bucket (payoff-engineered, ~600 funds) has
  a completely different decision framework from the hedge-fund-style funds
  (~50 funds), which in turn has nothing in common with commodities (~85),
  crypto (~100), or currency (~15).
- A single prompt cannot cover gold, Bitcoin, a managed-futures trend follower,
  a buffered S&P 500 fund, and a long-CAD currency fund without being so
  generic it stops being useful.
- We merged commodities + digital assets + currency into one group because the
  decision framework is the same (direct exposure to a thing, no manager
  strategy in the way), and commodities by itself is ~85 funds while
  currency is only ~15 — too small to stand alone.

### What this means in the code

- Replace `groups[].key = "alt-strategies"` with three new keys:
  `commodities-and-digital-assets`, `strategy-funds`, `derivative-income`.
- Reassign every category currently tagged `group: "alt-strategies"` to one of
  the three new keys per the table above.
- Each new group needs its own prompt + factor JSON.
- The prompt-improvement runbook
  (`docs/insights-ui/etf-prompt-improvement/run-prompt-analysis.md`) and the
  sample-ETFs file
  (`insights-ui/src/etf-analysis-data/sample-etfs.json`) need an entry for each
  new group.

---

## Q3. Why is JAAA in "Fixed Income — Core & Government" when it invests in corporates? What is the real difference between Core & Government and Credit & Income? Are two bond groups enough?

### Decision

**Add a third non-muni bond group for floating-rate / structured-credit funds.**
That gives us four bond groups total once muni is included.

We are dividing the non-muni bond universe along **two axes at once**:

1.  **Credit quality** — investment grade vs sub-investment grade.
2.  **Interest-rate behaviour** — duration-bearing (price moves when rates
    move) vs floating-rate (price barely moves when rates move, because the
    coupon resets).

Putting both axes together gives three coherent groups:

| New group key                  | Old name closest to it          | Axis profile                                       |
| ------------------------------ | ------------------------------- | -------------------------------------------------- |
| `fixed-income-investment-grade` | `fixed-income-core` (renamed)   | Investment grade **and** duration-bearing          |
| `fixed-income-floating-rate`    | _new_                           | Floating-rate / near-zero duration (any credit)    |
| `fixed-income-credit`           | `fixed-income-credit` (kept)    | Sub-investment grade and/or income-driven, duration-bearing |

### What goes in each group

#### `fixed-income-investment-grade` (renamed from `fixed-income-core`)

These funds hold investment-grade bonds where the **dominant risk is interest
rates**. If rates rise, prices fall; if rates fall, prices rise. Coupons are
fixed.

- Short Government, Intermediate Government, Long Government
- Short-Term Bond, Intermediate Core Bond, Intermediate Core-Plus Bond,
  Long-Term Bond
- Corporate Bond (investment grade only)
- Government Mortgage-Backed Bond
- Securitized Bond - Diversified
- Inflation-Protected Bond, Short-Term Inflation-Protected Bond
- Target Maturity (taxable)
- Global Bond, Global Bond-USD Hedged
- Investment Grade
- Miscellaneous Fixed Income

**Similarity inside the group:** every fund here has meaningful duration
(typically 2–20 years), is rated investment grade, and the main decision the
retail buyer makes is "how much rate risk can I take?".

#### `fixed-income-floating-rate` (new)

These funds hold floating-rate or very-short-duration instruments. The coupon
resets periodically (usually every 1–3 months), so rate hikes do not push prices
down much. Yield comes from credit spread + the reset rate (SOFR / fed funds).

- Bank Loan
- Securitized Bond - Focused (this category is currently 17-out-of-25 CLO
  ETFs by count and dominated by them by AUM — JAAA alone is $26.7B)
- Ultrashort Bond
- Money Market-Taxable
- Prime Money Market

**Similarity inside the group:** near-zero duration, yield resets with rates,
credit risk lives in the underlying loans (which are mostly corporate). This is
where JAAA actually belongs — it is an AAA-rated CLO fund but the underlying
assets are corporate bank loans, and it behaves like a floating-rate income
fund, not like a Treasury fund.

We also need to **move sub-investment-grade CLO funds out of this group into
`fixed-income-credit`**: JBBB (Janus Henderson B-BBB CLO ETF), CLOZ (Eldridge
BBB-B), BCLO (iShares BBB-B), CLOB (VanEck AA-BB), NCLO, RCLO. These have
sub-IG ratings on the tranche itself and behave more like high-yield income
than like floating-rate IG.

#### `fixed-income-credit` (kept, scope tightened)

These funds hold credit-sensitive bonds where the **dominant risk is default /
spread widening**, not duration. They are duration-bearing (not floating-rate)
and most are below investment grade. Yield comes from compensation for credit
risk.

- High Yield Bond (~78 ETFs — the largest single category here)
- Preferred Stock
- Convertibles
- Multisector Bond
- Nontraditional Bond
- Emerging Markets Bond
- Emerging-Markets Local-Currency Bond
- Broad Credit
- Private Debt - General
- _Moved in from `fixed-income-core`:_ sub-IG CLO funds whose underlying tranche
  is rated below BBB- (JBBB, CLOZ, BCLO, CLOB, NCLO, RCLO).

**Similarity inside the group:** credit risk is the primary lens, default rates
and spread cycle drive returns, equity correlation rises in stress. The
decision question for the retail buyer is "am I being paid enough for the
default risk I'm taking?".

### Why we need the third group (in plain language)

The two-group split was forcing a square peg into a round hole:

- The old `fixed-income-core` was supposed to be "safe IG bonds" but ended up
  including AAA CLOs (JAAA, $26.7B) whose underlying assets are corporate bank
  loans. The fund's rating is AAA but the underlying economic exposure is
  closer to the Bank Loan funds that sit in `fixed-income-credit`. Worse, even
  some sub-IG CLO funds (JBBB, CLOZ) ended up in `fixed-income-core` because
  the Morningstar "Securitized Bond - Focused" category was assigned wholesale.
- The old name "Core & Government" was also misleading because the description
  silently included IG corporates, MBS, and securitized — but readers see
  "Government" in the name and expect Treasuries.
- Adding the floating-rate group fixes the JAAA problem cleanly: AAA CLOs and
  bank loans go in the floating-rate group, sub-IG CLOs join the credit group,
  and the renamed investment-grade group becomes what its name actually
  promises.

### Similarities between the three groups

All three are bond funds, so they share:

- Income-orientation (most retail buyers hold bonds for yield).
- Sensitivity to credit conditions (even Treasuries are sensitive in extreme
  stress — see March 2020).
- Distribution character matters (monthly vs quarterly payouts).
- Tax discussion centres on whether the buyer should hold this in a taxable
  vs tax-deferred account (different answer for each group).

But the **dominant decision lens differs sharply**:

- **Investment grade** → "How much rate risk can I take?"
- **Floating rate** → "How much credit risk am I taking for a yield that
  resets with rates?"
- **Credit & Income** → "Am I being paid enough for the default risk?"

That difference is why three groups are correct rather than two.

### What this means in the code

- Rename `groups[].key = "fixed-income-core"` to
  `fixed-income-investment-grade`. Update its description to drop the
  misleading "Government" framing.
- Add a new group with key `fixed-income-floating-rate`.
- Keep `fixed-income-credit`.
- Re-tag categories per the lists above:
  - Move `Bank Loan` from `fixed-income-credit` to `fixed-income-floating-rate`.
  - Move `Securitized Bond - Focused` from `fixed-income-core` to
    `fixed-income-floating-rate`.
  - Move `Ultrashort Bond`, `Money Market-Taxable`, `Prime Money Market` from
    `fixed-income-core` to `fixed-income-floating-rate`.
  - Move sub-IG CLO funds (data-side correction, not a category move — we may
    need a manual override or a new sub-IG-CLO Morningstar category if one
    exists) into `fixed-income-credit`.
- Each new group needs its own prompt + factor JSON.
- Update the prompt-improvement runbook and `sample-etfs.json` to include the
  new groups.

---

## Q4. Should we have a separate group for High Yield?

### Decision

**No, do not split High Yield out.** Keep it as the dominant member of the
credit group. Rename `fixed-income-credit` → `fixed-income-credit-and-income`
so the name makes it obvious that High Yield is the core of this group.

### Why

- There are not enough High Yield categories to justify a standalone group.
  Looking at the live API counts inside the current `fixed-income-credit`
  bucket: High Yield Bond is 78 funds (the largest single category), and the
  next-largest credit categories are Multisector Bond (45), Preferred Stock
  (25), Emerging Markets Bond (23), Nontraditional Bond (20), Convertibles (6).
  If we split HY off, the residual ~120 funds across preferreds, EM debt,
  convertibles, multisector, nontraditional, and private debt do not form a
  coherent named group — they would just be "the credit funds that are not
  HY", which is not a decision bucket the reader recognises.
- All of these credit-driven categories share the **same decision framework**:
  - Am I being paid enough spread for the default risk I am taking?
  - Where are we in the credit cycle?
  - How correlated will this be with equities in stress?
  - What is the recovery rate history?
  That is true for HY corporates, EM debt, preferreds, convertibles,
  multisector, nontraditional, and the sub-IG CLOs we are moving in from the
  old core group. Splitting HY off would force two prompts to repeat almost
  the same content with different titles.
- The cleaner fix is **naming**, not splitting. Renaming the group to
  `fixed-income-credit-and-income` signals to the reader that High Yield is
  the centre of gravity of this group without fragmenting the universe.

### What this means in the code

- Rename `groups[].key = "fixed-income-credit"` → `fixed-income-credit-and-income`.
- Update the group `name` and `description` to lead with High Yield as the
  representative category, then list preferreds, EM debt, convertibles,
  multisector, nontraditional, and sub-IG CLOs as the other members.
- No category re-assignment beyond what Q3 already required.

---

## Q5. Should we create a new group for "concentrated equity" funds?

### Decision

**No, do not create a `concentrated-equity` group.** Treat concentration as a
**property / badge** on existing equity funds, and branch the prompt on it.

### Why

- **Concentration is a continuous property, not an asset class.** Where does
  the line sit — 50 holdings? 30? Top-10 weight > 40% or > 50%? An asset class
  is a discrete bucket; "concentrated" is a slider.
- **The peer comparison should stay inside the asset class.** Akre Focus
  (AKRE — 21 holdings, $6.5 B AUM, Morningstar Large Growth) is meaningful to
  read alongside other US Large Growth funds, because that is the comparison
  the retail buyer wants ("how does this compare to QQQ or VUG?"). Pulling
  AKRE into a "concentrated" bucket alongside a concentrated international
  fund (BNY Mellon Concentrated International — BKCI) and a concentrated value
  fund (American Century Focused Large Cap Value — FLV) gives the reader a
  bucket of funds that share a *style*, not a market — and the comparison set
  becomes useless.
- **Morningstar does not classify by concentration.** Their taxonomy is
  market-cap × style × geography. If we invent a new group with no Morningstar
  equivalent, we lose the automatic category-to-group mapping and have to
  assign every fund manually — fragile.
- **A badge + prompt branch delivers the actual user value** (the reader sees
  the fund is concentrated, and the analysis covers the right risks) without
  any of the fragmentation cost.

### What the data shows

Sampling the live API for funds with "concentrated" or "focus" / "focused" in
the name and low holdings counts:

| Symbol | Holdings | AUM ($) | Morningstar category    |
| ------ | -------: | ------: | ----------------------- |
| AKRE   |       21 |   6.5 B | Large Growth            |
| FV     |        7 |   3.3 B | Large Blend             |
| CNEQ   |       30 | 395 M   | Large Growth            |
| FDG    |       40 | 332 M   | Large Growth            |
| FLV    |       49 | 326 M   | Large Value             |
| BCHP   |       21 | 193 M   | Large Blend             |
| BKCG   |       27 | 111 M   | Large Growth            |
| BKCI   |       35 | 127 M   | Foreign Large Blend     |
| ATFV   |       33 | 117 M   | Large Growth            |
| DHLX   |       21 |  74 M   | Large Blend             |

These funds are scattered across Large Blend, Large Growth, Large Value, and
Foreign Large Blend — different asset classes — but share a manager style
(high-conviction, low-holdings). A flag captures that shared style without
breaking peer comparison.

### What this means in the code

- Add a computed per-ETF flag `isConcentrated`, driven by what we already
  store: `holdings <= 50` **or** `top10Weight >= 0.50` (we may need to start
  capturing `top10Weight` if we do not already — TBD when implementing).
- Surface a small "Concentrated" badge on the ETF card and detail page, next
  to AUM / expense ratio.
- Branch the equity prompts: when `isConcentrated` is true, the risk section
  must cover single-name risk (top-3 holdings as % of portfolio), manager /
  key-person risk, wider performance dispersion vs the category average, and
  liquidity considerations for the underlying holdings.
- Optionally surface "Concentrated only" as a filter on the listing page.

---

## Q6. How do we group covered call ETFs? And how do we identify ETFs that use yield-enhancement strategies like securities lending?

### Decision

**Covered-call ETFs go entirely inside the new `derivative-income` group from
Q2.** No further sub-grouping inside that group.

**Securities-lending ETFs are a separate concept entirely** — they are not
covered-call funds. They are flagged at the fund level (not at the group
level), because there is no Morningstar category for "this fund uses
securities lending."

### Important clarification: covered call vs securities lending

These are two different yield-enhancement strategies that are often confused:

- **Covered call** — the ETF sells **call options** against the stocks it
  holds. It receives the **option premium** as income. The premium yield is
  large (often 8–12% annualised) but the upside above the call strike is
  capped. The fund is no longer a pure index tracker; it has explicitly
  changed its payoff profile.

- **Securities lending** — the ETF lends out its underlying **shares** to
  short-sellers / market-makers in exchange for a **lending fee**. The fee
  is small (typically 1–20 basis points, occasionally higher for hard-to-borrow
  names). The lending **does not change the payoff** of the fund — the ETF
  still owns the shares economically. It is a small efficiency boost that
  helps passive funds offset their expense ratio, which is why a Vanguard
  Total Market index fund can beat its index by 1–2 bps even after fees.

So:

- A covered-call ETF (QYLD, JEPI) is an **option-strategy fund** and lives in
  `derivative-income`.
- An index fund that does securities lending (most large iShares / Vanguard
  funds) is still a **plain index fund** and lives in its natural group
  (`broad-equity-*`, `sector-thematic-equity`, etc.).

The user's intuition that "some passive funds beat their index by a small
edge" is correct, and securities lending is one of the main reasons. But that
is a fund-level property, not a category-level one.

### How to identify these funds

| Strategy            | How to identify                                                                                                                                                                                                                                                                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Covered call**    | Morningstar category = **Derivative Income** (204 funds in our DB). All of these go into the new `derivative-income` group automatically. Plus a smaller number in **Equity Hedged** (collared variants) — also in `derivative-income`.                                                                                                                                       |
| **Securities lending** | **No Morningstar category covers this.** The information lives in the fund's annual report / N-CSR filing as a "securities lending income" line item, or in the issuer's policy disclosures (BlackRock, Vanguard, State Street all publish theirs). To capture this in our data we would have to (a) scrape it from the annual reports via `scraping-lambdas`, or (b) buy a data feed. |
| **Other yield-enhancement** (dividend capture, futures roll optimisation, hedged share classes, currency hedging, etc.) | Mostly captured by Morningstar via specific categories (e.g. Global Bond-USD Hedged) when the strategy is the *main thing*. When it is a secondary boost on top of an index strategy, it is fund-level metadata, not category-level. |

### Why we are not sub-splitting `derivative-income`

The three Morningstar sub-categories that make up the new `derivative-income`
group — Derivative Income (covered call / option income), Defined Outcome
(buffered ETFs), Equity Hedged (collared) — already give the prompt enough
internal differentiation. The prompt can branch on which sub-category each
fund is in, instead of needing three separate top-level groups for funds that
share the same decision question ("yield in exchange for capped upside —
through what mechanism, by how much, until when").

One specific call-out: YieldMax-style **single-stock covered-call ETFs**
(NVDY, AMDY, AAPY, MSTY, TSLY etc.) sit in Derivative Income but their
underlying is a single volatile stock, not a diversified index. The prompt
should flag this sub-class explicitly so the retail reader understands the
distribution yield is option premium decay, not the underlying earning that
yield. This is a prompt concern inside `derivative-income`, not a group
concern.

### What this means in the code

- All covered-call ETFs (Derivative Income + Equity Hedged) flow into the new
  `derivative-income` group via the category-to-group map. No extra work
  needed beyond the Q2 split.
- Securities-lending exposure is **out of scope** for the group-structure
  rewrite. If we want to surface it later, the right shape is a per-ETF
  `securitiesLendingIncomeBps` field captured from the annual report, exposed
  as a filter on the listing page and a line in the Cost & Team analysis. We
  can add that as a follow-up task; it should not block the group rewrite.

---

## Q7. Should we split the `broad-equity` group? It currently contains every kind of equity (US, international, emerging, large/mid/small, growth/value/blend).

### Decision

**Yes, split `broad-equity`.** Recommended split: **three groups**, by
geography. Two-group split is also defensible and listed below as an
alternative.

### Why

The current `broad-equity` group contains **1,538 US-listed ETFs** — by far
the largest group, almost twice the size of the next largest. It mixes funds
whose decision frameworks are fundamentally different:

- A retail buyer choosing between SPY (US Large Blend) and VXUS (Foreign
  Large Blend) is making a **geographic-allocation** decision (currency
  exposure, foreign tax credit, diversification benefit, valuation
  differential).
- A retail buyer choosing between SPY and EEM (Diversified Emerging Markets)
  is making a **risk-tolerance** decision (EM has materially higher volatility
  and tail risk, currency volatility, governance discounts, political
  sensitivity).
- A retail buyer choosing between SPY and IJH (Mid-Cap Blend) is making a
  **size-factor** decision within the same geography.

The first two of those are big swings in expected risk and behaviour. The
third is a smaller tilt. So the highest-leverage split is **by geography**,
not by size or style.

### The data — current `broad-equity` composition

| Sub-bucket             | US ETF count                                                                                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **US equity**          | Large Blend (286) + Large Value (156) + Large Growth (147) + Mid-Cap Blend (91) + Mid-Cap Value (68) + Mid-Cap Growth (39) + Small Blend (74) + Small Value (54) + Small Growth (18) = **933** |
| **International developed + Global** | Foreign Large Blend (107) + Foreign Large Value (56) + Foreign Large Growth (30) + Foreign Small/Mid Blend (9) + Foreign Small/Mid Value (12) + Foreign Small/Mid Growth (1) + Europe Stock (23) + Japan Stock (19) + Pacific/Asia ex-Japan (12) + Diversified Pacific/Asia (4) + Miscellaneous Region (60) + Global Large-Stock Blend (57) + Global Large-Stock Value (15) + Global Large-Stock Growth (12) + Global Small/Mid Stock (19) = **436** |
| **Emerging markets**   | Diversified Emerging Mkts (111) + China Region (33) + India Equity (16) + Latin America Stock (9) = **169**                                                                       |

The total is exactly 1,538 — matching the group total.

### Recommended split — three groups by geography

| New group key              | What goes in it                                                                                                                                                                                                                                                                                  | Why coherent                                                                                                                                                                                                                                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`us-equity`**            | Large Blend, Large Value, Large Growth, Mid-Cap Blend, Mid-Cap Value, Mid-Cap Growth, Small Blend, Small Value, Small Growth, Total Market, Large Cap, Mid Cap, Small Cap, Extended Market, US Equity, Broad Market, High Dividend Yield                                                                                              | All US-listed companies, USD-denominated, no foreign-tax-credit complexity. Comparison universe: SPY / VTI / QQQ. Size and style are sub-tilts handled inside the prompt.                                                                                                                                          |
| **`international-developed-equity`** | Foreign Large Blend, Foreign Large Value, Foreign Large Growth, Foreign Small/Mid Blend, Foreign Small/Mid Value, Foreign Small/Mid Growth, Europe Stock, Japan Stock, Pacific/Asia ex-Japan Stk, Diversified Pacific/Asia, Miscellaneous Region, Global Large-Stock Blend/Value/Growth, Global Small/Mid Stock                                                                       | Developed-market international (with or without US in Global variants). Decision: how much non-US equity exposure do I want? Sub-question: hedged vs unhedged currency. Comparison universe: VXUS / VEA.                                                                                                            |
| **`emerging-markets-equity`** | Diversified Emerging Mkts, China Region, India Equity, Latin America Stock                                                                                                                                                                                                                       | Distinct risk profile: higher vol, currency volatility, governance discounts, political sensitivity, narrower liquidity. Decision: should I have EM at all, and how much? Single-country EM (China, India, Latin America) is a more concentrated bet inside that bucket. Comparison universe: VWO / EEM / EMXC. |

If you want to be more cautious and split into two groups instead of three,
fold emerging markets into international:

### Alternative — two groups by geography

| New group key                    | What goes in it                                                            |
| -------------------------------- | -------------------------------------------------------------------------- |
| `us-equity`                      | Same as the three-group split.                                              |
| `non-us-equity`                  | Everything in `international-developed-equity` + `emerging-markets-equity`. |

Three groups is the better answer for the retail reader because the
EM-vs-developed decision is genuinely a bigger swing in risk than the
US-vs-developed decision. But two is acceptable if you want fewer pages /
fewer sitemap entries.

### What this means in the code

- Replace `groups[].key = "broad-equity"` with three new keys (or two if you
  prefer the simpler split): `us-equity`, `international-developed-equity`,
  `emerging-markets-equity`.
- Reassign every category currently tagged `group: "broad-equity"` to one of
  the new keys per the table above.
- Each new group needs its own prompt + factor JSON.
- Update the prompt-improvement runbook and `sample-etfs.json` to include the
  new groups.

---

## Open questions (still under discussion)

None. The seven questions above cover the full group-structure rewrite. Next
steps:

1. Finalise the group-key names (especially whether `us-equity` /
   `international-developed-equity` / `emerging-markets-equity` is the right
   naming, vs e.g. `equity-us` / `equity-intl-developed` / `equity-em` for
   sort order).
2. Once names are locked, open the follow-up PR that edits
   `insights-ui/src/etf-analysis-data/etf-analysis-categories.json` per all
   seven decisions, plus the prompt files, factor JSONs,
   `sample-etfs.json`, and `run-prompt-analysis.md` runbook updates.
3. Implement the `isConcentrated` badge + prompt branch as a separate, smaller
   PR (does not block the group rewrite).
4. Capture securities-lending income as a follow-up task (out of scope for
   the group rewrite).
