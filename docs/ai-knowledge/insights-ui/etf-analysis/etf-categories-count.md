# ETF Categories — Complete List with Counts

All Morningstar ETF categories used by the KoalaGains ETF analysis pipeline, grouped into 8 analysis buckets that share a common analytical framework. This taxonomy mirrors `insights-ui/src/etf-analysis-data/etf-analysis-categories.json` — each group corresponds to a distinct factor set in the analysis factor files. Counts reflect the number of ETFs assigned to each category by Morningstar.

---

## 1. Broad Equity

Diversified equity funds differentiated by market cap, style (blend/value/growth), and geography (US, foreign, global, emerging, single-region). Analysis focuses on index tracking, style purity, peer-group comparison within cap/style/region, and broad-market beta behavior.

| Category | ETF Count | One-Liner |
|----------|-----------|-----------|
| Large Blend | 281 | US large-cap funds without a growth or value tilt, anchored by S&P 500 trackers. |
| Large Value | 154 | US large-cap funds targeting stocks with low valuation multiples. |
| Large Growth | 146 | US large-cap funds focused on high revenue/earnings growth companies. |
| Diversified Emerging Mkts | 109 | Funds investing broadly across developing economies (China, India, Brazil, Taiwan, etc.). |
| Foreign Large Blend | 106 | Large-cap equities from developed economies outside the US without a style tilt. |
| Mid-Cap Blend | 90 | US mid-sized companies across both growth and value styles. |
| Small Blend | 72 | US small-cap stocks without a growth or value tilt. |
| Mid-Cap Value | 66 | US mid-cap companies trading at below-market valuations. |
| Miscellaneous Region | 60 | Equity funds targeting regions that don't fit into other geographic categories. |
| Global Large-Stock Blend | 57 | Large-cap equities worldwide (US + international) without a style tilt. |
| Foreign Large Value | 54 | Developed-market non-US large caps trading at low valuations. |
| Small Value | 53 | US small-cap value stocks, historically a strong long-term factor premium. |
| Mid-Cap Growth | 39 | US mid-caps with above-average growth characteristics. |
| China Region | 32 | Funds focused specifically on Chinese equities (A-shares, H-shares, ADRs). |
| Foreign Large Growth | 30 | Developed-market non-US large caps with growth characteristics. |
| Europe Stock | 21 | Funds concentrated in European equities across the UK, Eurozone, and Switzerland. |
| Japan Stock | 20 | Funds focused on Japanese equities. |
| Global Small/Mid Stock | 19 | Small and mid-cap equities worldwide. |
| Small Growth | 18 | US small-cap growth stocks, often concentrated in tech and biotech. |
| India Equity | 16 | Funds focused on Indian equities. |
| Global Large-Stock Value | 15 | Large-cap value stocks worldwide. |
| Pacific/Asia ex-Japan Stk | 12 | Asian equity funds excluding Japan. |
| Global Large-Stock Growth | 12 | Large-cap growth stocks worldwide. |
| Foreign Small/Mid Value | 12 | International small/mid-cap value stocks. |
| Foreign Small/Mid Blend | 9 | International small/mid-cap stocks without a style tilt. |
| Latin America Stock | 9 | Funds focused on Latin American equities. |
| Diversified Pacific/Asia | 4 | Broad Asia-Pacific equity funds including Japan. |
| Foreign Small/Mid Growth | 1 | International small/mid-cap growth stocks. |

---

## 2. Sector & Thematic Equity

Equity funds concentrated in a single sector, industry, or theme (technology, health, financials, real estate, energy, commodity-linked equities, infrastructure, etc.). Analysis focuses on sector cyclicality, concentration risk, top-holding exposure, and peer comparison within the sector or theme.

| Category | ETF Count | One-Liner |
|----------|-----------|-----------|
| Technology | 125 | Software, semiconductors, hardware, and IT services companies — the largest sector category. |
| Natural Resources | 60 | Companies producing metals, agricultural goods, timber, and oil & gas. |
| Health | 55 | Healthcare providers, pharma, biotech, and medical devices companies. |
| Industrials | 44 | Manufacturing, aerospace & defense, construction, and industrial conglomerates. |
| Real Estate | 44 | REITs and real estate operating companies across residential, commercial, and specialty. |
| Financial | 43 | Banks, insurance, asset managers, and other financial services firms. |
| Equity Energy | 40 | Oil & gas producers, refiners, pipeline operators, and energy services companies. |
| Miscellaneous Sector | 34 | Sector-focused funds that don't fit cleanly into any named sector. |
| Consumer Cyclical | 27 | Non-essential goods and services — retail, automotive, leisure, and media. |
| Communications | 19 | Telecom, media, and interactive entertainment companies. |
| Equity Digital Assets | 18 | Companies with significant exposure to blockchain and crypto industries. |
| Infrastructure | 17 | Toll roads, airports, utilities, and other long-life infrastructure assets. |
| Energy Limited Partnership | 17 | Master Limited Partnerships, primarily in energy pipelines and storage. |
| Equity Precious Metals | 16 | Gold miners, silver miners, and related precious-metals producers. |
| Global Real Estate | 14 | REITs and real estate companies worldwide. |
| Consumer Defensive | 13 | Essential goods — food, beverages, household products, and tobacco. |
| Utilities | 13 | Electric, gas, and water utilities, typically held for stable dividends. |

---

## 3. Leveraged & Inverse Trading

Daily-rebalanced leveraged, inverse, or multi-asset leveraged funds. Analysis focuses on daily-reset path dependency (decay), suitability strictly as short-term trading vehicles, accuracy of the daily-leverage objective, and holding-period warnings.

| Category | ETF Count | One-Liner |
|----------|-----------|-----------|
| Trading--Leveraged Equity | 280 | Funds providing 2x or 3x daily magnified exposure to equity indexes, sectors, or single stocks. |
| Trading--Inverse Equity | 113 | Funds providing -1x (or more) daily exposure to equity indexes — profit when markets fall. |
| Trading--Miscellaneous | 26 | Leveraged or inverse trading funds that don't fit into the named sub-types. |
| Multi-Asset Leveraged | 13 | Leveraged exposure to multi-asset strategies or allocation indexes. |
| Trading--Leveraged Commodities | 10 | 2x or 3x daily magnified exposure to commodity prices (oil, gold, natural gas). |
| Trading--Inverse Commodities | 9 | Inverse exposure to commodity prices — profit when commodities decline. |
| Trading--Inverse Debt | 8 | Inverse exposure to Treasury or bond indexes — profit when interest rates rise. |
| Trading--Leveraged Debt | 5 | 2x or 3x daily magnified exposure to Treasury or bond indexes. |

---

## 4. Fixed Income — Core & Government

Investment-grade government, corporate, mortgage, TIPS, securitized, and target-maturity bond funds, plus money market. Analysis focuses on duration/rate sensitivity, yield, benchmark tracking, and resilience across interest-rate environments.

| Category | ETF Count | One-Liner |
|----------|-----------|-----------|
| Target Maturity | 86 | Bond funds that mature in a specific year, returning principal like an individual bond. |
| Ultrashort Bond | 68 | Bond funds with very short duration (<1 year), near cash-equivalent risk. |
| Intermediate Core-Plus Bond | 52 | Intermediate-duration investment-grade bonds with modest allocation to below-investment-grade. |
| Intermediate Core Bond | 51 | Intermediate-duration investment-grade bonds spanning Treasuries, corporates, and MBS. |
| Short-Term Bond | 50 | Investment-grade bonds with 1–3 year effective duration. |
| Corporate Bond | 44 | Investment-grade bonds issued by US corporations. |
| Securitized Bond - Focused | 25 | Funds concentrated in a specific securitized bond type (MBS, ABS, or CMBS). |
| Long Government | 25 | Long-duration US government bonds (typically 10+ year maturity). |
| Short Government | 20 | Short-duration US government bonds (typically 1–3 year maturity). |
| Securitized Bond - Diversified | 15 | Funds holding a mix of MBS, ABS, and CMBS across securitized bond types. |
| Inflation-Protected Bond | 14 | TIPS funds that adjust principal with inflation to protect real purchasing power. |
| Global Bond-USD Hedged | 14 | International bond funds with currency exposure hedged back to US dollars. |
| Intermediate Government | 14 | Intermediate-duration US government bonds (typically 3–10 year maturity). |
| Government Mortgage-Backed Bond | 12 | Funds holding agency MBS (Fannie Mae, Freddie Mac, Ginnie Mae). |
| Long-Term Bond | 10 | Investment-grade bonds with long effective duration (10+ years). |
| Global Bond | 9 | International bond funds with unhedged foreign currency exposure. |
| Short-Term Inflation-Protected Bond | 7 | Short-duration TIPS with lower rate sensitivity than standard TIPS funds. |
| Money Market-Taxable | 5 | Taxable money market funds holding short-term commercial paper and repos. |
| Prime Money Market | 1 | Money market funds holding higher-yielding commercial paper and CDs. |
| Miscellaneous Fixed Income | 1 | Bond funds that don't fit into other fixed-income categories. |

---

## 5. Fixed Income — Credit & Income

Credit-driven and income-focused non-muni bond funds: high yield, bank loan, preferred stock, convertibles, emerging-market debt, multisector, nontraditional, and private debt. Analysis focuses on credit quality, default risk, spread behavior, and downside during credit stress.

| Category | ETF Count | One-Liner |
|----------|-----------|-----------|
| High Yield Bond | 78 | Below-investment-grade ("junk") corporate bonds with higher yields and default risk. |
| Multisector Bond | 43 | Bond funds mixing Treasuries, investment-grade corporates, high yield, and emerging-market debt. |
| Preferred Stock | 25 | Funds holding preferred shares — hybrid instruments between equity and debt. |
| Emerging Markets Bond | 23 | Government and corporate debt from developing economies, in hard or local currency. |
| Nontraditional Bond | 20 | Flexible bond funds that can short duration, use derivatives, and invest across credit. |
| Bank Loan | 14 | Floating-rate senior loans to non-investment-grade corporations. |
| Emerging-Markets Local-Currency Bond | 6 | EM sovereign debt denominated in local currency, carrying currency risk. |
| Convertibles | 5 | Convertible bonds that can be exchanged for equity under certain conditions. |
| Private Debt - General | 1 | Funds investing in private (non-publicly-traded) corporate debt. |

---

## 6. Municipal Bonds

All municipal bond funds — national, state-specific, high-yield muni, and muni target-maturity. Analysis focuses on tax-equivalent yield, issuer credit quality, duration, and state or sector concentration.

| Category | ETF Count | One-Liner |
|----------|-----------|-----------|
| Muni National Interm | 43 | National intermediate-duration muni bond funds, federally tax-exempt income. |
| Muni Target Maturity | 25 | Muni bond funds that mature in a specific year, like individual munis. |
| Muni National Short | 23 | National short-duration muni bond funds with lower rate sensitivity. |
| Muni National Long | 17 | National long-duration muni bond funds with higher yields and rate sensitivity. |
| High Yield Muni | 14 | Below-investment-grade muni bonds with higher yields and default risk. |
| Muni California Intermediate | 5 | California muni bonds, offering CA state + federal tax exemptions. |
| Muni California Long | 5 | Long-duration California muni bonds with dual tax exemptions for CA residents. |
| Muni New York Long | 5 | Long-duration New York muni bonds with dual tax exemptions for NY residents. |
| Muni Single State Short | 3 | Short-duration single-state muni funds for various states. |
| Muni Minnesota | 2 | Minnesota muni bonds with dual tax exemptions for MN residents. |
| Muni Massachusetts | 2 | Massachusetts muni bonds with dual tax exemptions for MA residents. |
| Muni New York Intermediate | 1 | Intermediate-duration New York muni bonds. |
| Muni New Jersey | 1 | New Jersey muni bonds with dual tax exemptions for NJ residents. |
| Muni Ohio | 1 | Ohio muni bonds with dual tax exemptions for OH residents. |

---

## 7. Alternative Strategies

Non-traditional strategy funds: derivative income, defined outcome, hedge-fund-style strategies (long-short, market-neutral, event-driven, multi-strategy, macro, managed futures, relative-value arbitrage), commodity exposure, digital assets, and single-currency funds. Analysis focuses on whether the strategy delivered on its mandate (lower volatility, downside protection, uncorrelated returns) rather than absolute return vs a pure-equity benchmark.

| Category | ETF Count | One-Liner |
|----------|-----------|-----------|
| Defined Outcome | 337 | Buffer/capped ETFs using options to define gain and loss bands over a set period. |
| Derivative Income | 202 | Covered-call and option-writing strategies (JEPI, JEPQ, XYLD) that sell upside for income. |
| Digital Assets | 91 | Spot and derivative crypto ETFs (Bitcoin, Ethereum) and related digital-asset funds. |
| Equity Hedged | 55 | Equity strategies with systematic hedges (protective puts, collars) to dampen volatility. |
| Commodities Focused | 51 | Funds concentrated in a single commodity or narrow commodity group. |
| Commodities Broad Basket | 30 | Funds tracking diversified commodity futures baskets across energy, metals, and agriculture. |
| Systematic Trend | 13 | Managed-futures funds that follow price trends across asset classes. |
| Long-Short Equity | 13 | Funds holding long positions in some stocks while shorting others to reduce beta. |
| Multistrategy | 8 | Funds combining multiple hedge-fund-style strategies in a single portfolio. |
| Single Currency | 7 | Funds providing exposure to a single foreign currency vs the US dollar. |
| Event Driven | 6 | Strategies targeting merger arbitrage, spin-offs, and other corporate events. |
| Macro Trading | 3 | Funds making directional bets on currencies, rates, and commodities based on macro views. |
| Equity Market Neutral | 2 | Long/short equity funds designed to have zero net market exposure. |
| Relative Value Arbitrage | 1 | Funds exploiting price differences between related securities. |
| Multialternative | 1 | Funds combining multiple alternative strategies into a single vehicle. |
| Commodities Precious Metals | 1 | Funds providing exposure to gold, silver, platinum, or palladium futures. |

---

## 8. Allocation & Target-Date

Funds with a prescribed asset-mix mandate — static allocation (moderate/aggressive/conservative), tactical allocation, global allocation variants, and all target-date glide-path funds. Analysis focuses on mandate adherence, tactical or glide-path execution, drawdown reduction vs pure-equity peers, and risk-adjusted returns within the allocation peer group.

| Category | ETF Count | One-Liner |
|----------|-----------|-----------|
| Tactical Allocation | 39 | Funds that actively shift allocation between asset classes based on market conditions. |
| Moderate Allocation | 23 | Static allocation funds targeting ~50–70% equities, typically 60/40. |
| Global Moderate Allocation | 12 | Globally diversified 60/40-style allocation funds. |
| Global Moderately Conservative Allocation | 7 | Globally diversified conservative-leaning allocation funds (~30–50% equity). |
| Moderately Conservative Allocation | 6 | Static allocation funds with lower equity exposure (~30–50%). |
| Global Moderately Aggressive Allocation | 5 | Globally diversified equity-heavy allocation funds (~70–85% equity). |
| Global Conservative Allocation | 3 | Globally diversified conservative allocation funds (<30% equity). |
| Aggressive Allocation | 3 | Static allocation funds with very high equity exposure (>85%). |
| Miscellaneous Allocation | 3 | Allocation funds that don't fit standard equity-weight buckets. |
| Target-Date 2065+ | 2 | Target-date funds for investors retiring in 2065 or later, equity-heavy glide path. |
| Conservative Allocation | 2 | Static allocation funds with low equity exposure (<30%). |
| Target-Date 2040 | 1 | Target-date funds for investors retiring around 2040. |
| Target-Date Retirement | 1 | Target-date funds for investors already in retirement. |
| Target-Date 2060 | 1 | Target-date funds for investors retiring around 2060. |
| Target-Date 2035 | 1 | Target-date funds for investors retiring around 2035. |
| Target-Date 2030 | 1 | Target-date funds for investors retiring around 2030. |
| Target-Date 2055 | 1 | Target-date funds for investors retiring around 2055. |
| Target-Date 2050 | 1 | Target-date funds for investors retiring around 2050. |
| Moderately Aggressive Allocation | 1 | Static allocation funds with equity-heavy mix (~70–85%). |
| Target-Date 2045 | 1 | Target-date funds for investors retiring around 2045. |
| Global Allocation | 1 | Globally diversified allocation funds without a fixed equity/bond mix. |
| Global Aggressive Allocation | 1 | Globally diversified allocation funds with very high equity exposure (>85%). |

---

## Summary by Group

| Group | Categories | Total ETFs |
|-------|-----------|------------|
| 1. Broad Equity | 28 | 1,517 |
| 2. Sector & Thematic Equity | 17 | 599 |
| 3. Leveraged & Inverse Trading | 8 | 464 |
| 4. Fixed Income — Core & Government | 20 | 523 |
| 5. Fixed Income — Credit & Income | 9 | 215 |
| 6. Municipal Bonds | 14 | 147 |
| 7. Alternative Strategies | 16 | 821 |
| 8. Allocation & Target-Date | 22 | 116 |
| **Total** | **134** | **4,402** |

---

**Source:** Category list and group definitions mirror `insights-ui/src/etf-analysis-data/etf-analysis-categories.json` (introduced in PR #1316). `numberOfStocks` counts are per-category totals from Morningstar.
