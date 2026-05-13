# Bonds — new group mapping

The old bond setup had two non-muni groups: `fixed-income-core` and
`fixed-income-credit`. That two-way split was forcing AAA CLO funds (JAAA —
$26.7 B AUM) into `core` even though their underlying assets are corporate
bank loans, not government bonds. We are moving to **three non-muni bond
groups** (four total, including muni which stays separate).

## The main point we are dividing on

Bonds split cleanly on **two axes at the same time**:

1. **Credit quality** — is the borrower safe (investment grade) or risky
   (sub-investment grade / income-driven)?
2. **Interest-rate behaviour** — does the coupon stay fixed (so prices fall
   when rates rise — "duration risk"), or does the coupon reset with rates
   (so prices barely move when rates change — "floating rate")?

The three groups come from putting both axes together:

| New group key                       | Credit quality        | Rate behaviour     | What the retail buyer asks first                       |
| ----------------------------------- | --------------------- | ------------------ | ------------------------------------------------------ |
| `fixed-income-investment-grade`     | Investment grade      | Duration-bearing   | "How much rate risk can I take?"                       |
| `fixed-income-floating-rate`        | IG and sub-IG mix     | Floating / near-zero duration | "How much credit risk for a yield that resets with rates?" |
| `fixed-income-credit-and-income`    | Sub-IG / income       | Duration-bearing   | "Am I being paid enough for the default risk?"         |
| `muni` _(kept separate)_            | IG-dominated (HY muni is the exception) | Duration-bearing | "What is my tax-equivalent yield? Am I holding this in a taxable account?" |

## In simple English — why three groups instead of two

Two bonds can both be rated AAA and behave completely differently when rates
move. A 30-year Treasury and an AAA CLO are both top-rated, but:

- The 30-year Treasury **loses money when rates rise** (long duration, fixed
  coupon).
- The AAA CLO **does not lose much when rates rise** (the coupon resets every
  3 months, so it just earns more).

Lumping both into one "investment-grade" group misleads the retail reader.
The floating-rate group fixes that — every fund in there has its coupon reset
with the market, so rate hikes do not hurt much.

The third group (credit-and-income) is the home for funds where **default
risk** is the headline, not rate risk. High Yield is the biggest member;
preferreds, convertibles, EM debt, multisector, nontraditional all share the
same decision framework ("am I being paid enough for the risk of the borrower
not paying me back?").

## Category-to-group mapping

### `fixed-income-investment-grade`

(Renamed from the old `fixed-income-core`.) Investment grade, duration-bearing.
Main risk = rates.

- Short Government
- Intermediate Government
- Long Government
- Short-Term Bond
- Intermediate Core Bond
- Intermediate Core-Plus Bond
- Long-Term Bond
- Corporate Bond
- Government Mortgage-Backed Bond
- Securitized Bond - Diversified
- Inflation-Protected Bond
- Short-Term Inflation-Protected Bond
- Target Maturity
- Global Bond
- Global Bond-USD Hedged
- Investment Grade
- Miscellaneous Fixed Income

### `fixed-income-floating-rate`

New group. Floating-rate or near-zero duration. Coupon resets with rates.
Yield comes from credit spread plus the reset rate.

- Bank Loan _(moved out of credit)_
- Securitized Bond - Focused _(moved out of core — this category is dominated
  by CLO ETFs; the AAA tranches stay here, the sub-IG tranches go to
  `fixed-income-credit-and-income` as a data-side correction)_
- Ultrashort Bond _(moved out of core)_
- Money Market-Taxable _(moved out of core)_
- Prime Money Market _(moved out of core)_

### `fixed-income-credit-and-income`

(Renamed from `fixed-income-credit` so the name signals that High Yield is
the centre of gravity here.) Credit-sensitive, duration-bearing, mostly
sub-investment grade. Main risk = default.

- High Yield Bond (largest member — 78 ETFs)
- Multisector Bond
- Preferred Stock
- Convertibles
- Nontraditional Bond
- Emerging Markets Bond
- Emerging-Markets Local-Currency Bond
- Broad Credit
- Private Debt - General
- Sub-IG CLO funds (JBBB, CLOZ, BCLO, CLOB, NCLO, RCLO) — these are tagged
  Morningstar "Securitized Bond - Focused" but their tranche rating is below
  investment grade, so they belong here. May need a manual override per ETF.

### `muni` _(kept as a separate group, listed for completeness)_

Municipal bond funds. Split off by tax treatment, not by the two axes above.

- Muni National Short
- Muni National Interm
- Muni National Long
- Muni California Intermediate
- Muni California Long
- Muni New York Long
- Muni New York Intermediate
- Muni Single State Short
- Muni Minnesota
- Muni Massachusetts
- Muni New Jersey
- Muni Ohio
- High Yield Muni
- Muni Target Maturity
