# Alt-strategies — new group mapping

The old `alt-strategies` group held 828 US ETFs that did not share a decision
framework. We are splitting it into **three new groups**.

## The three groups in one sentence each

- **`commodities-and-digital-assets`** — funds that give you direct exposure
  to a _thing_: a commodity, a crypto coin, or a currency. The fund just holds
  (or tracks) the thing. There is no manager strategy in the way.
- **`strategy-funds`** — funds where a manager runs a _process_ to try to
  produce returns that are uncorrelated with the stock market. Hedge-fund-style.
- **`derivative-income`** — funds that _engineer a payoff_ with options:
  collect option premium as yield, give up some upside in return. Mechanical,
  not manager-driven.

## What is the difference between `strategy-funds` and `derivative-income`?

This is the pair people confuse, so calling it out clearly:

|                          | `strategy-funds`                                                                                                 | `derivative-income`                                                                                                                                |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **What the fund does**   | A manager makes decisions to follow a process (trend, long-short, market neutral, macro, etc.).                  | A fund mechanically sells options against its holdings (or buys options to cap downside / engineer a buffer).                                      |
| **Source of returns**    | Manager skill at running the process. Outcomes vary by skill, market conditions, and process design.             | Option premium income. Outcomes are determined by the option formula + market behaviour, not by manager skill.                                     |
| **What the retail buyer asks** | "Did the strategy actually deliver on its mandate — lower volatility, downside protection, uncorrelated returns?" | "What is my yield? What is the upside cap? What is the downside floor? Through what date? How is the distribution taxed (ordinary vs return-of-capital)?" |
| **Headline metric**      | Risk-adjusted return vs an HFR sub-index (or the S&P, if uncorrelated is the claim).                             | Distribution yield + cap rate + buffer / floor (for buffered funds).                                                                                |
| **Failure mode**         | Manager underperforms the process or the process stops working. Returns drift toward the equity benchmark.       | Underlying market rises sharply and the fund's upside is capped, so investors miss the rally.                                                       |

**Short version:** `strategy-funds` is _did a manager run a process well?_
`derivative-income` is _is the payoff formula giving me the yield I expected
with the downside I can live with?_

## Category-to-group mapping

### `commodities-and-digital-assets`

Direct exposure to a thing. No manager strategy.

- Commodities Focused
- Commodities Broad Basket
- Commodities Precious Metals
- Gold
- Silver
- Natural Gas
- Crude Oil
- Carbon Credits
- Digital Assets
- Long BTC
- Long ETH
- Long XRP
- Long SOL
- Long Cryptocurrency Basket
- Long BTC, Short CAD
- Long BTC, Short USD
- Long Cryptocurrency Basket, Short CAD
- Long ETH, Short CAD
- Long ETH, Short USD
- Long SOL, Short USD
- Long XRP, Short CAD
- Long XRP, Short USD
- Single Currency
- Long USD
- Long CAD
- Long USD, Short CAD

### `strategy-funds`

A manager runs a process. Decision question is about the strategy working.

- Systematic Trend
- Long-Short Equity
- Multistrategy
- Equity Market Neutral
- Macro Trading
- Event Driven
- Relative Value Arbitrage
- Multialternative
- Volatility
- Downside Hedge

### `derivative-income`

Payoff engineered with options. Yield in exchange for capped upside.

- Derivative Income
- Defined Outcome
- Equity Hedged

## Why these three and not five or six

We considered splitting commodities, digital assets, and currency into three
separate groups. The decision framework is the same for all three (direct
exposure to a thing), and the universe is small (currency is only ~15 ETFs),
so we merged them. We will revisit if any single sub-bucket grows large
enough to warrant its own page and prompt.

We also considered splitting `derivative-income` into covered-call vs
buffered vs collared. The Morningstar sub-categories (Derivative Income,
Defined Outcome, Equity Hedged) already give the prompt enough internal
differentiation — the prompt can branch on the sub-category without needing
three separate groups.
