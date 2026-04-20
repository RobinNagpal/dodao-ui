# Representative ETFs Per Group — Past Returns Prompt

Purpose: a short list of 3-4 real ETFs per group for drafting, testing, and validating the "Past Returns for ETFs" prompt (prompt key: `Past Returns for ETFs`).

- Groups come from `insights-ui/src/etf-analysis-data/etf-analysis-categories.json`
- 5 analysis factors per group come from `insights-ui/src/etf-analysis-data/etf-analysis-factors-performance-and-returns.json`
- Each ETF below is present in the KoalaGains DB under spaceId `koala_gains`
- Category strings shown are the exact `EtfStockAnalyzerInfo.category` value returned by `/api/koala_gains/etfs-v1/exchange/{exchange}/{symbol}`
- Verified on 2026-04-20 via `GET https://koalagains.com/api/koala_gains/etfs-v1/exchange/{exchange}/{symbol}?allowNull=true`

---

## 1. Broad Equity (`broad-equity`)

Diversified equity funds — cap/style/geography variants. Factors emphasize long-term CAGR, short-term returns, consistency, benchmark tracking, and peer standing.

| Symbol | Exchange | Name | Category |
|---|---|---|---|
| SPY | NYSEARCA | State Street SPDR S&P 500 ETF | Large Blend |
| VTI | NYSEARCA | Vanguard Total Stock Market ETF | Large Blend |
| IWM | NYSEARCA | iShares Russell 2000 ETF | Small Blend |
| VEA | NYSEARCA | Vanguard FTSE Developed Markets ETF | Foreign Large Blend |

Coverage rationale: US large blend (index-tracked core), total-market broader tilt, US small-cap, and developed-markets international — exercises cap, geography, and passive-tracking dimensions.

---

## 2. Sector & Thematic Equity (`sector-thematic-equity`)

Single-sector/theme equity. Factors emphasize long-term CAGR, short-term returns, consistency, peer standing, and drawdown/recovery.

| Symbol | Exchange | Name | Category |
|---|---|---|---|
| XLK | NYSEARCA | State Street Technology Select Sector SPDR ETF | Technology |
| XLE | NYSEARCA | State Street Energy Select Sector SPDR ETF | Equity Energy |
| XLF | NYSEARCA | State Street Financial Select Sector SPDR ETF | Financial |
| XLV | NYSEARCA | State Street Health Care Select Sector SPDR ETF | Health |

Coverage rationale: four major SPDR sector funds covering high-beta growth (tech), cyclical/commodity (energy), cyclical/rates-sensitive (financials), and defensive (health) — good spread of cyclicality and drawdown behavior.

---

## 3. Leveraged & Inverse Trading (`leveraged-inverse`)

Daily-rebalanced leveraged/inverse products. Factors emphasize short-term returns, benchmark tracking, peer standing, drawdown/recovery, and daily-leverage fidelity/decay.

| Symbol | Exchange | Name | Category |
|---|---|---|---|
| TQQQ | NASDAQ | ProShares UltraPro QQQ | Trading--Leveraged Equity |
| SQQQ | NASDAQ | ProShares UltraPro Short QQQ | Trading--Inverse Equity |
| SOXL | NYSEARCA | Direxion Daily Semiconductor Bull 3X ETF | Trading--Leveraged Equity |
| SPXU | NYSEARCA | ProShares UltraPro Short S&P500 | Trading--Inverse Equity |

Coverage rationale: +3x broad-tech (TQQQ), -3x broad-tech (SQQQ), +3x single-sector (SOXL for volatility/decay stress-testing), -3x broad market (SPXU) — exercises both leveraged and inverse paths and sector-concentrated decay.

---

## 4. Fixed Income — Core & Government (`fixed-income-core`)

Investment-grade government/corporate/MBS/TIPS. Factors emphasize long-term CAGR, benchmark tracking, peer standing, income vs price return, and rate-environment resilience.

| Symbol | Exchange | Name | Category |
|---|---|---|---|
| AGG | NYSEARCA | iShares Core U.S. Aggregate Bond ETF | Intermediate Core Bond |
| TLT | NASDAQ | iShares 20+ Year Treasury Bond ETF | Long Government |
| SHY | NASDAQ | iShares 1-3 Year Treasury Bond ETF | Short Government |
| TIP | NYSEARCA | iShares TIPS Bond ETF | Inflation-Protected Bond |

Coverage rationale: aggregate (all-duration index), long-duration (rate-sensitive), short-duration (cash proxy), and inflation-linked — spans the duration curve and real vs nominal, so factor behavior under rising and falling rate regimes is visible.

---

## 5. Fixed Income — Credit & Income (`fixed-income-credit`)

Credit-driven/income-focused non-muni bonds. Factors emphasize long-term CAGR, consistency, peer standing, drawdown/recovery, and income vs price return.

| Symbol | Exchange | Name | Category |
|---|---|---|---|
| HYG | NYSEARCA | iShares iBoxx $ High Yield Corporate Bond ETF | High Yield Bond |
| BKLN | NYSEARCA | Invesco Senior Loan ETF | Bank Loan |
| PFF | NASDAQ | iShares Preferred & Income Securities ETF | Preferred Stock |
| EMB | NASDAQ | iShares JP Morgan USD Emerging Markets Bond ETF | Emerging Markets Bond |

Coverage rationale: high-yield corporate (classic credit-spread product), floating-rate bank loan (rate-hedged credit), preferred stock (hybrid equity/fixed-income income), EM USD-denominated debt (sovereign credit + FX) — covers the main credit/income sub-classes and distinct drawdown drivers.

---

## 6. Municipal Bonds (`muni`)

All muni variants. Factors emphasize long-term CAGR, consistency, peer standing, income vs price return, and rate-environment resilience.

| Symbol | Exchange | Name | Category |
|---|---|---|---|
| MUB | NYSEARCA | iShares National Muni Bond ETF | Muni National Interm |
| SUB | NYSEARCA | iShares Short-Term National Muni Bond ETF | Muni National Short |
| TFI | NYSEARCA | State Street SPDR Nuveen ICE Municipal Bond ETF | Muni National Long |
| HYD | BATS | VanEck High Yield Muni ETF | High Yield Muni |

Coverage rationale: short/intermediate/long national muni for duration coverage, plus high-yield muni for credit-driven behavior — exercises duration and credit dimensions within the tax-advantaged muni universe.

---

## 7. Alternative Strategies (`alt-strategies`)

Non-traditional strategies (defined outcome, derivative income, LS/market-neutral, commodity, digital, currency). Factors emphasize short-term returns, consistency, peer standing, income vs price return, and downside-protection delivery.

| Symbol | Exchange | Name | Category |
|---|---|---|---|
| JEPI | NYSEARCA | JPMorgan Equity Premium Income ETF | Derivative Income |
| DBC | NYSEARCA | Invesco DB Commodity Index Tracking Fund | Commodities Broad Basket |
| BITO | NYSEARCA | ProShares Bitcoin ETF | Digital Assets |
| QAI | NYSEARCA | NYLI Hedge Multi-Strategy Tracker ETF | Multistrategy |

Coverage rationale: covered-call income (JEPI), broad commodity basket (DBC), crypto exposure (BITO), and multi-strategy hedge-replication (QAI) — four distinct alt-strategy mandates so "delivered on its mandate" framing can be tested per-category.

---

## 8. Allocation & Target-Date (`allocation-target-date`)

Prescribed asset-mix funds. Factors emphasize long-term CAGR, consistency, peer standing, drawdown/recovery, and downside-protection delivery.

| Symbol | Exchange | Name | Category |
|---|---|---|---|
| AOA | NYSEARCA | iShares Core 80/20 Aggressive Allocation ETF | Global Moderately Aggressive Allocation |
| AOR | NYSEARCA | iShares Core 60/40 Balanced Allocation ETF | Global Moderate Allocation |
| AOM | NYSEARCA | iShares Core 40/60 Moderate Allocation ETF | Global Moderately Conservative Allocation |
| AOK | NYSEARCA | iShares Core 30/70 Conservative Allocation ETF | Global Conservative Allocation |

Coverage rationale: the iShares Core allocation ladder (80/20, 60/40, 40/60, 30/70) gives a clean aggressive -> conservative gradient sharing the same manager and methodology, so glide-path / downside-protection factor behavior is directly comparable.

---

## How to reproduce / verify

```bash
# Replace SYMBOL / EXCHANGE below. Returns JSON with stockAnalyzerInfo.category.
curl -s "https://koalagains.com/api/koala_gains/etfs-v1/exchange/NYSEARCA/SPY?allowNull=true" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); s=d.get('stockAnalyzerInfo') or {}; print(d.get('symbol'), '|', d.get('exchange'), '|', s.get('category'))"
```

The `category` string returned by that endpoint must match one of the `categories[].name` entries in `etf-analysis-categories.json`, which in turn maps to a `group` key.
