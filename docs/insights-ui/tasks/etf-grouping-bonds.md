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

| New group key                       | US ETF count | Credit quality        | Rate behaviour     | What the retail buyer asks first                       |
| ----------------------------------- | -----------: | --------------------- | ------------------ | ------------------------------------------------------ |
| `fixed-income-investment-grade`     |      **418** | Investment grade      | Duration-bearing   | "How much rate risk can I take?"                       |
| `fixed-income-floating-rate`        |      **114** | IG and sub-IG mix     | Floating / near-zero duration | "How much credit risk for a yield that resets with rates?" |
| `fixed-income-credit-and-income`    |      **204** | Sub-IG / income       | Duration-bearing   | "Am I being paid enough for the default risk?"         |
| `muni` _(kept separate)_            |      **148** | IG-dominated (HY muni is the exception) | Duration-bearing | "What is my tax-equivalent yield? Am I holding this in a taxable account?" |
| _Total bond funds_                  |      **884** |                       |                    |                                                        |

For reference, the **old** two-group split was: `fixed-income-core` 518 +
`fixed-income-credit` 218. After the restructure, 100 ETFs move out of `core`
into the new `floating-rate` group (Securitized Bond - Focused, Ultrashort
Bond, Money Market-Taxable, Prime Money Market), and 14 ETFs move out of
`credit` into `floating-rate` (Bank Loan). That accounts for the new
`floating-rate` total of 114.

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

### `fixed-income-investment-grade` — 418 ETFs

(Renamed from the old `fixed-income-core`.) Investment grade, duration-bearing.
Main risk = rates.

| Category                              | ETFs |
| ------------------------------------- | ---: |
| Target Maturity                       |   80 |
| Intermediate Core-Plus Bond           |   52 |
| Intermediate Core Bond                |   51 |
| Short-Term Bond                       |   50 |
| Corporate Bond                        |   44 |
| Long Government                       |   25 |
| Short Government                      |   20 |
| Securitized Bond - Diversified        |   15 |
| Intermediate Government               |   14 |
| Inflation-Protected Bond              |   14 |
| Global Bond-USD Hedged                |   14 |
| Government Mortgage-Backed Bond       |   12 |
| Long-Term Bond                        |   10 |
| Global Bond                           |    9 |
| Short-Term Inflation-Protected Bond   |    7 |
| Miscellaneous Fixed Income            |    1 |
| Investment Grade _(alias, no funds yet)_ |    0 |

### `fixed-income-floating-rate` — 114 ETFs

New group. Floating-rate or near-zero duration. Coupon resets with rates.
Yield comes from credit spread plus the reset rate.

| Category                       | ETFs | Moved from        |
| ------------------------------ | ---: | ----------------- |
| Ultrashort Bond                |   69 | old `core`        |
| Securitized Bond - Focused     |   25 | old `core` _(dominated by CLO ETFs — AAA tranches stay here, sub-IG tranches go to `credit-and-income` as a data-side correction)_ |
| Bank Loan                      |   14 | old `credit`      |
| Money Market-Taxable           |    5 | old `core`        |
| Prime Money Market             |    1 | old `core`        |

### `fixed-income-credit-and-income` — 204 ETFs

(Renamed from `fixed-income-credit` so the name signals that High Yield is
the centre of gravity here.) Credit-sensitive, duration-bearing, mostly
sub-investment grade. Main risk = default.

| Category                              | ETFs |
| ------------------------------------- | ---: |
| High Yield Bond                       |   78 |
| Multisector Bond                      |   45 |
| Preferred Stock                       |   25 |
| Emerging Markets Bond                 |   23 |
| Nontraditional Bond                   |   20 |
| Convertibles                          |    6 |
| Emerging-Markets Local-Currency Bond  |    6 |
| Private Debt - General                |    1 |
| Broad Credit _(alias, no funds yet)_  |    0 |

Plus the **sub-IG CLO funds** that move in from the old `core` group (JBBB,
CLOZ, BCLO, CLOB, NCLO, RCLO — these are tagged Morningstar "Securitized
Bond - Focused" but their tranche rating is below investment grade, so they
belong here). This is a per-ETF override, not a category move — the category
itself stays in `floating-rate` for the AAA tranches.

### `muni` — 148 ETFs _(kept as a separate group, listed for completeness)_

Municipal bond funds. Split off by tax treatment, not by the two axes above.

| Category                          | ETFs | Sub-type            |
| --------------------------------- | ---: | ------------------- |
| Muni National Interm              |   43 | National IG         |
| Muni Target Maturity              |   25 | Target maturity     |
| Muni National Short               |   23 | National IG         |
| Muni National Long                |   18 | National IG         |
| High Yield Muni                   |   14 | High-yield muni     |
| Muni California Intermediate      |    5 | Single-state (CA)   |
| Muni California Long              |    5 | Single-state (CA)   |
| Muni New York Long                |    5 | Single-state (NY)   |
| Muni Single State Short           |    3 | Single-state (any)  |
| Muni Minnesota                    |    2 | Single-state (MN)   |
| Muni Massachusetts                |    2 | Single-state (MA)   |
| Muni New York Intermediate        |    1 | Single-state (NY)   |
| Muni New Jersey                   |    1 | Single-state (NJ)   |
| Muni Ohio                         |    1 | Single-state (OH)   |
