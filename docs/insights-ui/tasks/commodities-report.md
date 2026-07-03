# Commodities — New Report Type (plan)

A **commodity** is a real raw material that is dug up, grown, or pumped and traded in
global markets (gold, crude oil, natural gas, copper, wheat, coffee, cattle…). Its price
mostly moves on **supply and demand**. This doc is the starting plan for a Commodities
report on KoalaGains, looked at on its own.

---

## 1. Sections (8 total)

| # | Section | Scored? | What it says |
|---|---------|---------|--------------|
| 1 | **Overview / Key Facts** | no | Type, main uses, top producing countries, trading unit, main ways to invest |
| 2 | **Supply & Demand** | yes | What actually moves the price |
| 3 | **Price & Value** | yes | Is it cheap or expensive vs its own history |
| 4 | **Volatility & Risk** | yes | How wild the price is and what can shock it |
| 5 | **How to Get Exposure** | yes | Futures curve, roll cost, ETFs, physical, storage |
| 6 | **Future Outlook** | yes | Where supply/demand and forecasts point next |
| 7 | **Similar Commodities** | no | Compare vs close peers (gold↔silver, WTI↔Brent) |
| 8 | **Final Summary** | no | One plain-English verdict |

**5 scored sections (2–6)** + 3 supporting sections (1, 7, 8).

---

## 2. Analysis factors (~25 total, ~5 per scored section)

Each factor gets a title, a short explanation, the metric behind it, and a pass/fail score.

- **Supply & Demand:** production/output trend · global inventories & stockpiles · demand drivers · spare capacity / new supply coming · seasonality
- **Price & Value:** price vs 5/10-yr range · inflation-adjusted (real) price · cost-of-production floor · price vs substitute commodity · distance from all-time high
- **Volatility & Risk:** historical volatility · worst drawdowns · geopolitical / weather risk · US-dollar sensitivity · correlation to inflation & to stocks
- **How to Get Exposure:** futures curve shape (contango / backwardation) · roll-yield cost · best ETF/ETN proxies · physical & storage cost · tracking gap vs spot
- **Future Outlook:** forward supply/demand balance · official agency forecast · analyst price targets · bull vs bear scenario · key catalysts to watch

---

## 3. Charts

- **Long-term price chart** (spot, log scale)
- **Inflation-adjusted (real) price chart**
- **Futures curve chart** — price by expiry month, shows contango vs backwardation *(new chart type)*
- **Supply vs demand bars** — yearly production vs consumption
- **Inventory / stockpile chart**
- **Volatility / drawdown chart**
- **Seasonality chart** — average return by month
- **"Ways to invest" table** — ETFs/ETNs tracking it + expense ratio

---

## 4. Data we need + where to get it

Commodities have **no balance sheet / income statement**. Their "financials" are prices +
physical supply-demand data. Sources by data type:

| Data we need | Where to get it |
|--------------|-----------------|
| **Spot + historical prices** | FRED (free, long history), EODHD, Commodities-API, API Ninjas |
| **Futures curve** (forward prices by expiry) | Databento (CME/ICE), OilPriceAPI (curves), API Ninjas |
| **Energy supply/demand/inventory** (oil, gas) | **EIA** (free, official — production, stocks, storage) |
| **Agriculture supply/demand** (grains, softs) | **USDA** (free, official — WASDE reports, crop data) |
| **Metals supply/demand + stocks** | World Gold Council (gold), Silver Institute, USGS, LME/COMEX warehouse stocks |
| **Positioning** (who is long/short) | **CFTC** Commitments of Traders (free) |
| **One-stop bundle** (EIA + USDA + CFTC together) | Commodity Fundamentals API, EODHD |

**Simple recommendation:** one **price/futures-curve API** (EODHD or Databento) + free
**official fundamentals** (EIA for energy, USDA for agriculture, CFTC for positioning,
World Gold Council/USGS for metals).

---

## 5. Where to get the list of commodities

- **Wikipedia — "List of traded commodities"** (grouped by category, with exchange + ticker) — easiest starting list
- **Bloomberg Commodity Index (BCOM) subindices** — the standard investable set
- **CME Group / ICE product lists** — official exchange-traded contracts
- **FRED / EODHD supported-symbol list** — matches whatever price API we pick

**Suggested launch set (~20):** WTI, Brent, natural gas, gasoline · gold, silver,
platinum, palladium · copper, aluminium, nickel, zinc · wheat, corn, soybeans, coffee,
sugar, cotton, cocoa · live cattle, lean hogs.
