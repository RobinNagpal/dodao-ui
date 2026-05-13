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

## Open questions (under discussion — not yet finalised)

The following are still being worked through in chat and will be added to this
document once we have a decision:

- Should we split High Yield into its own group, or keep it as the largest
  member of `fixed-income-credit`?
- Should we create a new group for **concentrated equity** funds (small number
  of holdings, top-10 weight > 50%, manager-driven)?
- How should we group **covered call** ETFs — entirely inside the new
  `derivative-income` group, or split further?
- Same question for concentrated funds more broadly.

When these are decided, append a Q4, Q5, etc. section here.
