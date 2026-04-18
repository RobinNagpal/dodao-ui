# ETF Categories and Classifications

Two complementary views of the US ETF universe:

- **Part 1 — Morningstar Categories**: the primary category taxonomy used by the KoalaGains ETF analysis pipeline. All 134 Morningstar categories grouped into 8 analysis buckets, mirroring `insights-ui/src/etf-analysis-data/etf-analysis-categories.json`. Each group corresponds to a distinct factor set in the analysis factor files.
- **Part 2 — Cross-Cutting Classifications**: orthogonal dimensions that apply across categories — how the fund is managed, how its index is constructed, how it is structured, and what strategic overlay it uses. These are not category assignments; they describe attributes that can appear in many categories (e.g., a "Dividend" strategy can live inside Large Value or Derivative Income).

---

# Part 1 — Morningstar Categories

---

## 1. Broad Equity

Diversified equity funds differentiated by market cap, style (blend/value/growth), and geography (US, foreign, global, emerging, single-region). Analysis focuses on index tracking, style purity, peer-group comparison within cap/style/region, and broad-market beta behavior.

| Category | ETF Count | Example Tickers | One-Liner |
|----------|-----------|-----------------|-----------|
| Large Blend | 281 | VOO, IVV, SPY | US large-cap funds without a growth or value tilt, anchored by S&P 500 trackers. |
| Large Value | 154 | VTV, IWD, SCHV | US large-cap funds targeting stocks with low valuation multiples. |
| Large Growth | 146 | VUG, IWF, SCHG | US large-cap funds focused on high revenue/earnings growth companies. |
| Diversified Emerging Mkts | 109 | VWO, IEMG, EEM | Funds investing broadly across developing economies (China, India, Brazil, Taiwan, etc.). |
| Foreign Large Blend | 106 | VEA, IEFA, EFA | Large-cap equities from developed economies outside the US without a style tilt. |
| Mid-Cap Blend | 90 | IJH, VO, MDY | US mid-sized companies across both growth and value styles. |
| Small Blend | 72 | IJR, VB, IWM | US small-cap stocks without a growth or value tilt. |
| Mid-Cap Value | 66 | VOE, IWS, IJJ | US mid-cap companies trading at below-market valuations. |
| Miscellaneous Region | 60 | AAXJ, BBCA, BBEU | Equity funds targeting regions that don't fit into other geographic categories. |
| Global Large-Stock Blend | 57 | VT, ACWI, IOO | Large-cap equities worldwide (US + international) without a style tilt. |
| Foreign Large Value | 54 | EFV, IVLU, FNDF | Developed-market non-US large caps trading at low valuations. |
| Small Value | 53 | VBR, IWN, AVUV | US small-cap value stocks, historically a strong long-term factor premium. |
| Mid-Cap Growth | 39 | VOT, IWP, IJK | US mid-caps with above-average growth characteristics. |
| China Region | 32 | MCHI, FXI, KWEB | Funds focused specifically on Chinese equities (A-shares, H-shares, ADRs). |
| Foreign Large Growth | 30 | EFG, IDMO, DIHP | Developed-market non-US large caps with growth characteristics. |
| Europe Stock | 21 | VGK, IEV, FEZ | Funds concentrated in European equities across the UK, Eurozone, and Switzerland. |
| Japan Stock | 20 | EWJ, DXJ, BBJP | Funds focused on Japanese equities. |
| Global Small/Mid Stock | 19 | ACWX, GWX, VSS | Small and mid-cap equities worldwide. |
| Small Growth | 18 | VBK, IWO, IJT | US small-cap growth stocks, often concentrated in tech and biotech. |
| India Equity | 16 | INDA, INDY, SMIN | Funds focused on Indian equities. |
| Global Large-Stock Value | 15 | IVAL, VYMI, GVAL | Large-cap value stocks worldwide. |
| Pacific/Asia ex-Japan Stk | 12 | AAXJ, EPP, GMF | Asian equity funds excluding Japan. |
| Global Large-Stock Growth | 12 | IHDG, MGK, IWY | Large-cap growth stocks worldwide. |
| Foreign Small/Mid Value | 12 | AVDV, DLS, ISCF | International small/mid-cap value stocks. |
| Foreign Small/Mid Blend | 9 | SCZ, VSS, GWX | International small/mid-cap stocks without a style tilt. |
| Latin America Stock | 9 | ILF, FLN, EWZ | Funds focused on Latin American equities. |
| Diversified Pacific/Asia | 4 | VPL, AIA, EPP | Broad Asia-Pacific equity funds including Japan. |
| Foreign Small/Mid Growth | 1 | ISCG | International small/mid-cap growth stocks. |

---

## 2. Sector & Thematic Equity

Equity funds concentrated in a single sector, industry, or theme (technology, health, financials, real estate, energy, commodity-linked equities, infrastructure, etc.). Analysis focuses on sector cyclicality, concentration risk, top-holding exposure, and peer comparison within the sector or theme.

| Category | ETF Count | Example Tickers | One-Liner |
|----------|-----------|-----------------|-----------|
| Technology | 125 | XLK, VGT, IYW | Software, semiconductors, hardware, and IT services companies — the largest sector category. |
| Natural Resources | 60 | GNR, IGE, GUNR | Companies producing metals, agricultural goods, timber, and oil & gas. |
| Health | 55 | XLV, VHT, IYH | Healthcare providers, pharma, biotech, and medical devices companies. |
| Industrials | 44 | XLI, VIS, IYJ | Manufacturing, aerospace & defense, construction, and industrial conglomerates. |
| Real Estate | 44 | VNQ, XLRE, IYR | REITs and real estate operating companies across residential, commercial, and specialty. |
| Financial | 43 | XLF, VFH, KBE | Banks, insurance, asset managers, and other financial services firms. |
| Equity Energy | 40 | XLE, VDE, IYE | Oil & gas producers, refiners, pipeline operators, and energy services companies. |
| Miscellaneous Sector | 34 | MOO, ROBO, CIBR | Sector-focused funds that don't fit cleanly into any named sector. |
| Consumer Cyclical | 27 | XLY, VCR, IYC | Non-essential goods and services — retail, automotive, leisure, and media. |
| Communications | 19 | XLC, VOX, IYZ | Telecom, media, and interactive entertainment companies. |
| Equity Digital Assets | 18 | BITQ, BLOK, BKCH | Companies with significant exposure to blockchain and crypto industries. |
| Infrastructure | 17 | PAVE, IFRA, IGF | Toll roads, airports, utilities, and other long-life infrastructure assets. |
| Energy Limited Partnership | 17 | AMLP, MLPA, MLPX | Master Limited Partnerships, primarily in energy pipelines and storage. |
| Equity Precious Metals | 16 | GDX, GDXJ, SIL | Gold miners, silver miners, and related precious-metals producers. |
| Global Real Estate | 14 | REET, VNQI, RWO | REITs and real estate companies worldwide. |
| Consumer Defensive | 13 | XLP, VDC, IYK | Essential goods — food, beverages, household products, and tobacco. |
| Utilities | 13 | XLU, VPU, IDU | Electric, gas, and water utilities, typically held for stable dividends. |

---

## 3. Leveraged & Inverse Trading

Daily-rebalanced leveraged, inverse, or multi-asset leveraged funds. Analysis focuses on daily-reset path dependency (decay), suitability strictly as short-term trading vehicles, accuracy of the daily-leverage objective, and holding-period warnings.

| Category | ETF Count | Example Tickers | One-Liner |
|----------|-----------|-----------------|-----------|
| Trading--Leveraged Equity | 280 | TQQQ, UPRO, SOXL | Funds providing 2x or 3x daily magnified exposure to equity indexes, sectors, or single stocks. |
| Trading--Inverse Equity | 113 | SH, SQQQ, SPXU | Funds providing -1x (or more) daily exposure to equity indexes — profit when markets fall. |
| Trading--Miscellaneous | 26 | UVXY, SVXY, VIXY | Leveraged or inverse trading funds that don't fit into the named sub-types. |
| Multi-Asset Leveraged | 13 | NTSX, NTSI, NTSE | Leveraged exposure to multi-asset strategies or allocation indexes. |
| Trading--Leveraged Commodities | 10 | UCO, BOIL, UGL | 2x or 3x daily magnified exposure to commodity prices (oil, gold, natural gas). |
| Trading--Inverse Commodities | 9 | SCO, GLL, ZSL | Inverse exposure to commodity prices — profit when commodities decline. |
| Trading--Inverse Debt | 8 | TBT, TBF, TMV | Inverse exposure to Treasury or bond indexes — profit when interest rates rise. |
| Trading--Leveraged Debt | 5 | TMF, UBT, UST | 2x or 3x daily magnified exposure to Treasury or bond indexes. |

---

## 4. Fixed Income — Core & Government

Investment-grade government, corporate, mortgage, TIPS, securitized, and target-maturity bond funds, plus money market. Analysis focuses on duration/rate sensitivity, yield, benchmark tracking, and resilience across interest-rate environments.

| Category | ETF Count | Example Tickers | One-Liner |
|----------|-----------|-----------------|-----------|
| Target Maturity | 86 | BSCR, IBDR, IBTH | Bond funds that mature in a specific year, returning principal like an individual bond. |
| Ultrashort Bond | 68 | BIL, SGOV, ICSH | Bond funds with very short duration (<1 year), near cash-equivalent risk. |
| Intermediate Core-Plus Bond | 52 | TOTL, FIXD, BOND | Intermediate-duration investment-grade bonds with modest allocation to below-investment-grade. |
| Intermediate Core Bond | 51 | AGG, BND, SCHZ | Intermediate-duration investment-grade bonds spanning Treasuries, corporates, and MBS. |
| Short-Term Bond | 50 | BSV, VCSH, MINT | Investment-grade bonds with 1–3 year effective duration. |
| Corporate Bond | 44 | LQD, VCIT, IGIB | Investment-grade bonds issued by US corporations. |
| Securitized Bond - Focused | 25 | MBB, VMBS, SPMB | Funds concentrated in a specific securitized bond type (MBS, ABS, or CMBS). |
| Long Government | 25 | TLT, VGLT, SPTL | Long-duration US government bonds (typically 10+ year maturity). |
| Short Government | 20 | SHY, VGSH, SCHO | Short-duration US government bonds (typically 1–3 year maturity). |
| Securitized Bond - Diversified | 15 | JMBS, GNMA, CMBS | Funds holding a mix of MBS, ABS, and CMBS across securitized bond types. |
| Inflation-Protected Bond | 14 | TIP, SCHP, VTIP | TIPS funds that adjust principal with inflation to protect real purchasing power. |
| Global Bond-USD Hedged | 14 | BNDX, IAGG, IHY | International bond funds with currency exposure hedged back to US dollars. |
| Intermediate Government | 14 | IEI, VGIT, SCHR | Intermediate-duration US government bonds (typically 3–10 year maturity). |
| Government Mortgage-Backed Bond | 12 | MBB, VMBS, GNMA | Funds holding agency MBS (Fannie Mae, Freddie Mac, Ginnie Mae). |
| Long-Term Bond | 10 | BLV, VCLT, SPLB | Investment-grade bonds with long effective duration (10+ years). |
| Global Bond | 9 | BWX, IGOV, BWZ | International bond funds with unhedged foreign currency exposure. |
| Short-Term Inflation-Protected Bond | 7 | STIP, VTIP, TIPX | Short-duration TIPS with lower rate sensitivity than standard TIPS funds. |
| Money Market-Taxable | 5 | TFLO, USFR, CSHI | Taxable money market funds holding short-term commercial paper and repos. |
| Prime Money Market | 1 | PMMF | Money market funds holding higher-yielding commercial paper and CDs. |
| Miscellaneous Fixed Income | 1 | — | Bond funds that don't fit into other fixed-income categories; very niche. |

---

## 5. Fixed Income — Credit & Income

Credit-driven and income-focused non-muni bond funds: high yield, bank loan, preferred stock, convertibles, emerging-market debt, multisector, nontraditional, and private debt. Analysis focuses on credit quality, default risk, spread behavior, and downside during credit stress.

| Category | ETF Count | Example Tickers | One-Liner |
|----------|-----------|-----------------|-----------|
| High Yield Bond | 78 | HYG, JNK, USHY | Below-investment-grade ("junk") corporate bonds with higher yields and default risk. |
| Multisector Bond | 43 | FBND, AGGY, SCYB | Bond funds mixing Treasuries, investment-grade corporates, high yield, and emerging-market debt. |
| Preferred Stock | 25 | PFF, PGX, PFFD | Funds holding preferred shares — hybrid instruments between equity and debt. |
| Emerging Markets Bond | 23 | EMB, VWOB, EMB | Government and corporate debt from developing economies, in hard or local currency. |
| Nontraditional Bond | 20 | FTSM, JPST, NEAR | Flexible bond funds that can short duration, use derivatives, and invest across credit. |
| Bank Loan | 14 | BKLN, SRLN, FTSL | Floating-rate senior loans to non-investment-grade corporations. |
| Emerging-Markets Local-Currency Bond | 6 | EMLC, LEMB, EBND | EM sovereign debt denominated in local currency, carrying currency risk. |
| Convertibles | 5 | CWB, ICVT, FCVT | Convertible bonds that can be exchanged for equity under certain conditions. |
| Private Debt - General | 1 | PRIV | Funds investing in private (non-publicly-traded) corporate debt. |

---

## 6. Municipal Bonds

All municipal bond funds — national, state-specific, high-yield muni, and muni target-maturity. Analysis focuses on tax-equivalent yield, issuer credit quality, duration, and state or sector concentration.

| Category | ETF Count | Example Tickers | One-Liner |
|----------|-----------|-----------------|-----------|
| Muni National Interm | 43 | MUB, VTEB, ITM | National intermediate-duration muni bond funds, federally tax-exempt income. |
| Muni Target Maturity | 25 | BSMR, IBMQ, IBMK | Muni bond funds that mature in a specific year, like individual munis. |
| Muni National Short | 23 | SUB, SHM, VTES | National short-duration muni bond funds with lower rate sensitivity. |
| Muni National Long | 17 | MLN, TFI, ITML | National long-duration muni bond funds with higher yields and rate sensitivity. |
| High Yield Muni | 14 | HYD, HYMB, HYMU | Below-investment-grade muni bonds with higher yields and default risk. |
| Muni California Intermediate | 5 | CMF, PWZ, CXA | California muni bonds, offering CA state + federal tax exemptions. |
| Muni California Long | 5 | CXA, PWZ | Long-duration California muni bonds with dual tax exemptions for CA residents. |
| Muni New York Long | 5 | NYF, PZT, INY | Long-duration New York muni bonds with dual tax exemptions for NY residents. |
| Muni Single State Short | 3 | State-specific niche funds | Short-duration single-state muni funds for various states. |
| Muni Minnesota | 2 | FMNX-like niche funds | Minnesota muni bonds with dual tax exemptions for MN residents. |
| Muni Massachusetts | 2 | State-specific niche funds | Massachusetts muni bonds with dual tax exemptions for MA residents. |
| Muni New York Intermediate | 1 | INY | Intermediate-duration New York muni bonds. |
| Muni New Jersey | 1 | State-specific niche fund | New Jersey muni bonds with dual tax exemptions for NJ residents. |
| Muni Ohio | 1 | State-specific niche fund | Ohio muni bonds with dual tax exemptions for OH residents. |

---

## 7. Alternative Strategies

Non-traditional strategy funds: derivative income, defined outcome, hedge-fund-style strategies (long-short, market-neutral, event-driven, multi-strategy, macro, managed futures, relative-value arbitrage), commodity exposure, digital assets, and single-currency funds. Analysis focuses on whether the strategy delivered on its mandate (lower volatility, downside protection, uncorrelated returns) rather than absolute return vs a pure-equity benchmark.

| Category | ETF Count | Example Tickers | One-Liner |
|----------|-----------|-----------------|-----------|
| Defined Outcome | 337 | BJAN, PJAN, FJUL | Buffer/capped ETFs using options to define gain and loss bands over a set period. |
| Derivative Income | 202 | JEPI, JEPQ, XYLD | Covered-call and option-writing strategies that sell upside for income. |
| Digital Assets | 91 | IBIT, FBTC, ETHA | Spot and derivative crypto ETFs (Bitcoin, Ethereum) and related digital-asset funds. |
| Equity Hedged | 55 | HEQT, JHEQ, CBOE | Equity strategies with systematic hedges (protective puts, collars) to dampen volatility. |
| Commodities Focused | 51 | GLD, SLV, USO | Funds concentrated in a single commodity or narrow commodity group. |
| Commodities Broad Basket | 30 | DBC, PDBC, GSG | Funds tracking diversified commodity futures baskets across energy, metals, and agriculture. |
| Systematic Trend | 13 | DBMF, KMLM, CTA | Managed-futures funds that follow price trends across asset classes. |
| Long-Short Equity | 13 | BTAL, FTLS, DBEH | Funds holding long positions in some stocks while shorting others to reduce beta. |
| Multistrategy | 8 | QAI, MBXIX, NALT | Funds combining multiple hedge-fund-style strategies in a single portfolio. |
| Single Currency | 7 | UUP, FXE, FXY | Funds providing exposure to a single foreign currency vs the US dollar. |
| Event Driven | 6 | MNA, MRGR, ARB | Strategies targeting merger arbitrage, spin-offs, and other corporate events. |
| Macro Trading | 3 | GMOM, DBMF-like, WRN | Funds making directional bets on currencies, rates, and commodities based on macro views. |
| Equity Market Neutral | 2 | BTAL, QMN | Long/short equity funds designed to have zero net market exposure. |
| Relative Value Arbitrage | 1 | Niche single fund | Funds exploiting price differences between related securities. |
| Multialternative | 1 | Niche single fund | Funds combining multiple alternative strategies into a single vehicle. |
| Commodities Precious Metals | 1 | GLTR | Funds providing exposure to gold, silver, platinum, or palladium futures. |

---

## 8. Allocation & Target-Date

Funds with a prescribed asset-mix mandate — static allocation (moderate/aggressive/conservative), tactical allocation, global allocation variants, and all target-date glide-path funds. Analysis focuses on mandate adherence, tactical or glide-path execution, drawdown reduction vs pure-equity peers, and risk-adjusted returns within the allocation peer group.

| Category | ETF Count | Example Tickers | One-Liner |
|----------|-----------|-----------------|-----------|
| Tactical Allocation | 39 | GAL, RPAR, IYLD | Funds that actively shift allocation between asset classes based on market conditions. |
| Moderate Allocation | 23 | AOM, SWAN, BIGZ | Static allocation funds targeting ~50–70% equities, typically 60/40. |
| Global Moderate Allocation | 12 | AOM, IYLD, GAL | Globally diversified 60/40-style allocation funds. |
| Global Moderately Conservative Allocation | 7 | AOK, IYLD | Globally diversified conservative-leaning allocation funds (~30–50% equity). |
| Moderately Conservative Allocation | 6 | AOK, SWAN-lite | Static allocation funds with lower equity exposure (~30–50%). |
| Global Moderately Aggressive Allocation | 5 | AOR, AOA | Globally diversified equity-heavy allocation funds (~70–85% equity). |
| Global Conservative Allocation | 3 | AOK-like niche | Globally diversified conservative allocation funds (<30% equity). |
| Aggressive Allocation | 3 | AOA | Static allocation funds with very high equity exposure (>85%). |
| Miscellaneous Allocation | 3 | Niche funds | Allocation funds that don't fit standard equity-weight buckets. |
| Target-Date 2065+ | 2 | ITDI, LGLV-like | Target-date funds for investors retiring in 2065 or later, equity-heavy glide path. |
| Conservative Allocation | 2 | AOK | Static allocation funds with low equity exposure (<30%). |
| Target-Date 2040 | 1 | ITDE | Target-date funds for investors retiring around 2040. |
| Target-Date Retirement | 1 | ITDA | Target-date funds for investors already in retirement. |
| Target-Date 2060 | 1 | ITDH | Target-date funds for investors retiring around 2060. |
| Target-Date 2035 | 1 | ITDD | Target-date funds for investors retiring around 2035. |
| Target-Date 2030 | 1 | ITDC | Target-date funds for investors retiring around 2030. |
| Target-Date 2055 | 1 | ITDG | Target-date funds for investors retiring around 2055. |
| Target-Date 2050 | 1 | ITDF | Target-date funds for investors retiring around 2050. |
| Moderately Aggressive Allocation | 1 | AOR | Static allocation funds with equity-heavy mix (~70–85%). |
| Target-Date 2045 | 1 | ITDF-like | Target-date funds for investors retiring around 2045. |
| Global Allocation | 1 | GAL | Globally diversified allocation funds without a fixed equity/bond mix. |
| Global Aggressive Allocation | 1 | AOA-like | Globally diversified allocation funds with very high equity exposure (>85%). |

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

---

# Part 2 — Cross-Cutting Classifications

These dimensions describe attributes of an ETF that cut across the Morningstar category taxonomy. A single fund can simultaneously be (for example) a Large Blend Morningstar category, passively managed, market-cap weighted, and pursuing a Quality factor strategy.

---

## By Management Style

### Passive (Index-Tracking) ETFs
Replicate a predefined index with no discretion in security selection. Lowest expense ratios (0.03%–0.10%), mechanical replication, and the vast majority of ETF assets.
**Top tickers:** SPY, VOO, VTI, IVV

### Active ETFs
Portfolio managers make discretionary buy/sell decisions to outperform a benchmark. Higher expense ratios (0.30%–0.75%) in exchange for alpha potential, tactical positioning, and downside management. Category exploded after the 2019 SEC ETF Rule.
**Top tickers:** JEPI, ARKK, AVUV, JEPQ

### Semi-Transparent Active ETFs
Disclose holdings quarterly rather than daily to protect strategy from front-running. Use proprietary structures (Precidian ActiveShares, Fidelity proxy portfolio) to let market makers price shares without revealing the full portfolio.
**Top tickers:** FBCG, FBCV, FDG, CFCV

---

## By Index Construction Strategy

### Market-Cap Weighted
Stocks weighted by market capitalization — largest companies dominate. The most common and liquid structure, self-rebalancing, but can become dangerously concentrated (top 7 stocks reached 30%+ of the S&P 500).
**Top tickers:** SPY, IVV, VOO, VTI

### Equal-Weight
Every constituent receives the same weight, reset at each rebalance. Creates a size and value tilt relative to cap-weighted peers. Tends to outperform in broad rallies, underperform when mega-caps lead.
**Top tickers:** RSP, QQQE, EWSC, RSPT

### Fundamental-Weight
Stocks weighted by economic fundamentals (revenue, earnings, dividends, book value, cash flow) rather than price. Creates a structural value tilt; rebalances toward cheaper stocks as valuations diverge.
**Top tickers:** PRF, FNDX, FNDA, FNDE

### Smart Beta (Rules-Based Factor)
Transparent, rules-based indices targeting specific factor premiums (value, momentum, quality, low volatility, size). Systematic and predetermined — sits between pure passive and active.
**Top tickers:** MTUM, QUAL, VLUE, USMV

### Multi-Factor
Combines two or more factor exposures (e.g., value + quality + momentum) in a single fund. Can use "mixing" (blend sleeves) or "integration" (require each stock to score well on multiple factors).
**Top tickers:** GSLC, LRGF, VFMF, JHML

---

## By Structure & Mechanics

### Currency-Hedged ETFs
Hold international stocks/bonds but use currency forwards to neutralize FX impact, isolating pure local-market return. Valuable when the US dollar is strengthening; costly when weakening. Hedging decision can account for 5–10% of annual return difference.
**Top tickers:** HEDJ, DXJ, HEFA, DBEF

### ETFs of ETFs (Multi-Asset / Allocation)
Hold other ETFs as underlying positions, creating a complete portfolio in a single ticker. Range from static target-risk (60/40) to tactical (actively shifting weights). Add a layer of fees, though many waive underlying ETF fees.
**Top tickers:** AOR, AOA, AOM, GAL

### Exchange-Traded Notes (ETNs)
Unsecured debt obligations of a bank that promise the return of an index minus fees — they hold no underlying assets. Perfect tracking and favorable tax treatment for some strategies, but carry issuer credit risk (Lehman ETN holders lost everything in 2008). A shrinking category.
**Top tickers:** VXX, AMJ, MLPB, OIL

### White-Label / Custom ETFs
Created by advisors or brands using third-party ETF platforms (Tidal, ETC, Alpha Architect) that handle regulatory and operational infrastructure. Setup cost dropped from tens of millions to under $500K, driving the explosion in niche and thematic ETFs.
**Top tickers:** Varies — platform providers are identified in fund prospectuses.

---

## By Strategy & Objective

Strategy overlays that appear within many Morningstar categories.

### Dividend ETFs
Select stocks by dividend yield, growth, or consistency. High-yield variants tilt toward utilities and energy; dividend-growth variants tilt toward industrials and healthcare.
**Top tickers:** SCHD, VIG, DGRO, HDV

### Dividend Aristocrats / Kings
Companies with 25+ (Aristocrats) or 50+ (Kings) consecutive years of dividend increases. Most financially disciplined companies in the market — survived every downturn without cutting.
**Top tickers:** NOBL, KNG, SDY, REGL

### Growth
Companies with above-average revenue/earnings growth, typically higher valuations. Outperform in expansions and low-rate environments; vulnerable to multiple compression when rates rise.
**Top tickers:** VUG, IWF, SPYG, QQQ

### Value
Stocks trading at discounts to fundamentals (low P/E, low P/B, high yield). Outperform during economic recoveries and inflationary periods; can underperform for extended stretches when growth dominates.
**Top tickers:** VTV, IWD, SPYV, VOOV

### Low Volatility / Min Variance
Minimize price volatility by picking low-vol stocks or optimizing portfolio-level variance. Smoother ride and better risk-adjusted returns; systematically underperform in strong bull markets.
**Top tickers:** USMV, SPLV, EFAV, EEMV

### Momentum
Select stocks with strongest recent price performance (6–12 months). High turnover and prone to sharp drawdowns during momentum reversals.
**Top tickers:** MTUM, SPMO, PDP, DWAT

### Quality
Select companies on profitability, earnings stability, balance sheet strength, governance. Most defensive of factor ETFs — outperform during downturns, keep pace in expansions.
**Top tickers:** QUAL, DGRW, SPHQ, JQUA

### Covered Call / Income
Hold stocks and systematically sell call options to collect premium. Distribute 7–12% yields; sacrifice strong-rally upside for consistent monthly income. Suitable for income-dependent investors, suboptimal for long-term growth.
**Top tickers:** JEPI, JEPQ, XYLD, QYLD

### 0DTE / Daily Options Income
Sell zero-days-to-expiration options for rapid theta decay. Higher income potential than traditional covered-call ETFs, but carry intraday tail risk from sharp market moves.
**Top tickers:** QDTE, XDTE, TDTE, RDTE

### Buffer / Defined Outcome
Use options to provide a known outcome range over a set period — protect against the first 9–15% of losses while capping gains. Reset annually per series. Buying mid-period means inheriting current buffer/cap levels, not the original ones.
**Top tickers:** BJAN, BAPR, PJAN, FJUL

### Put-Write / Options Income
Systematically sell put options to generate income — get paid to agree to buy stocks at lower prices. Outperform in flat-to-modestly-rising markets; suffer in sharp selloffs.
**Top tickers:** PUTW, HELO, PPUT, JHEQ

### Thematic / Megatrend
Target specific themes — AI, clean energy, genomics, space, cybersecurity, robotics. Concentration risk, high turnover, and a history of launching near peak hype. Index methodology is critical — definitions of "AI company" vary wildly across providers.
**Top tickers:** BOTZ, ICLN, ARKG, HACK

### ESG / Sustainable
Screen or weight by environmental, social, governance criteria. Range from light exclusions to aggressive portfolio reshaping. Modest performance differences vs. non-ESG, but sector exclusions create meaningful tracking differences during energy rallies.
**Top tickers:** ESGU, SUSA, VEGN, KRMA

### Tail Risk / Hedging
Hold out-of-the-money puts on broad indices — crash insurance that pays off dramatically during severe dislocations. Lose money steadily in normal markets; can gain 20–50%+ during sharp selloffs. Designed as a small allocation (2–5%) of a portfolio.
**Top tickers:** TAIL, CYA, PHDG, CAOS

---

## Quick Reference — Choosing the Right ETF Type

| Investor Goal | Most Relevant ETF Types | Top Starter Tickers |
|---------------|------------------------|---------------------|
| Core portfolio building | Broad Equity, Broad Bond, Market-Cap Weighted | VTI, VOO, BND, AGG |
| Regular income | Dividend, Covered Call, Preferred Stock, MLP | SCHD, JEPI, PFF, AMLP |
| Inflation protection | TIPS, Commodity, REIT, Gold | TIP, GLD, VNQ, DBC |
| Reduce volatility | Low Volatility, Buffer, Quality | USMV, SPLV, QUAL, BJAN |
| Tactical sector bet | Sector, Industry, Single-Country | XLK, XLE, SOXX, EWJ |
| Factor-based investing | Smart Beta, Multi-Factor, Quality, Momentum, Value | MTUM, QUAL, VTV, GSLC |
| International diversification | Developed Market, Emerging Market, Currency-Hedged | VEA, VWO, HEDJ, BNDX |
| Short-term trading / hedging | Leveraged, Inverse, Volatility | TQQQ, SH, SQQQ, UVXY |
| Cash management | Ultra-Short, Target Maturity, Money Market Alt | BIL, SGOV, MINT, BSCR |
| Thematic conviction | Thematic, ESG, Cryptocurrency | IBIT, BOTZ, ICLN, ESGU |
| Crash protection | Tail Risk, Buffer, Inverse | TAIL, CYA, BJAN, SH |
| Alternative income | 0DTE Options, Put-Write, CLO, Floating Rate | QDTE, JAAA, BKLN, PUTW |

---

# Editorial Note — On the 8-Group Design from PR #1316

An opinionated review of whether the 8 analysis groups introduced in PR #1316 are well-designed, mutually exclusive, and the right cut of the ETF universe for the KoalaGains analysis pipeline.

## Overall: Yes, it's a good design

The 8 groups are organized around **analytical framework** rather than surface-level asset class. That's the right design principle. "How should an analyst evaluate this fund?" produces more useful groupings than "what asset class does it hold?" — because a gold ETF and a Treasury ETF are both technically non-equity, but you evaluate them with completely different lenses. The PR #1316 grouping captures this distinction correctly.

Concretely, the design nails four non-obvious calls:

1. **Splitting fixed income into Core vs. Credit vs. Muni is right.** Core bonds are analyzed for duration and rate sensitivity; credit bonds are analyzed for default/spread behavior; munis require tax-equivalent-yield math. Mashing them into one "Fixed Income" bucket would produce generic, less useful analysis. The three-way split forces the analyst (and the prompt) to apply the right framework.

2. **Isolating Leveraged & Inverse is essential.** These funds have daily-reset path dependency that makes long-term analysis actively misleading — they need a different evaluation story (suitability, holding-period warning, daily-leverage accuracy) rather than CAGR and drawdown. Putting them with their asset-class siblings would contaminate the analysis. Correct call.

3. **Separating Sector/Thematic from Broad Equity is useful.** The evaluation criteria genuinely differ — concentration risk, sector cyclicality, and thematic-definition quality matter for the former, while style purity and peer comparison matter for the latter. You would ask different questions of XLK vs. VOO.

4. **Allocation & Target-Date together is natural.** Both are about mandate adherence and drawdown reduction — analytically similar even though the mechanics differ (static ratio vs. glide path).

## Are the groups mutually exclusive? Yes, in practice

Each of the 134 Morningstar categories maps to exactly one group in the JSON — the taxonomy is disjoint by construction. Conceptually, a handful of edge cases sit near boundaries but don't actually cross them:

- **Energy Limited Partnership (MLPs)** sits in sector-thematic-equity, though it has income-focused characteristics. Defensible either way; keeping it with equity sectors is the Morningstar-native call.
- **Equity Precious Metals** (gold miners) is in sector-thematic-equity, while **Commodities Precious Metals** (gold futures) is in alt-strategies. Clean split — miners are equities, commodities are not.
- **Preferred Stock** is in fixed-income-credit despite being a hybrid — a fair call since coupons dominate the return profile and rate sensitivity is closer to long credit than to equity.
- **Digital Assets** (spot Bitcoin ETFs) in alt-strategies vs. **Equity Digital Assets** (blockchain stocks) in sector-thematic-equity. Correct separation by what the fund actually holds.

No category is ambiguously placed enough to cause analysis errors.

## Where I'd push back

A few things that are defensible but worth calling out as design trade-offs:

1. **"Alt-Strategies" is the group doing the most work.** It holds 16 categories and 821 ETFs, covering covered-call income (Derivative Income, 202 funds), buffer strategies (Defined Outcome, 337 funds), commodities (broad basket, focused, precious metals — 82 funds), digital assets (91 funds), hedge-fund strategies (long-short, market neutral, event-driven, macro trend), and single-currency funds. These categories share "don't benchmark to pure equity" but the actual evaluation framework differs substantially between, say, a Bitcoin ETF and a merger-arbitrage ETF. If the group ever proves too heterogeneous for a single factor set, the natural split would be: **Options-based Equity Income** (Defined Outcome + Derivative Income + Equity Hedged), **Commodities & Digital Assets**, and **Hedge-fund Strategies** (long-short, market neutral, systematic trend, event-driven, macro, multistrategy, multialternative, RV arbitrage, single currency).

2. **Defined Outcome alone is 337 ETFs — the largest single category in the entire taxonomy.** It has genuinely distinct analysis (buffer level, cap level, outcome-period timing) that doesn't apply to other alt-strategies categories. A case could be made for giving it its own group, but the trade-off is a tiny group that doesn't justify a separate factor file.

3. **Single Currency in alt-strategies is a stretch.** Currency is closer to its own asset class than to hedge-fund strategies. But with only 7 funds, a dedicated group is overkill.

4. **Target-Date subcategories fragment the data.** Morningstar splits target-dates by vintage (2030, 2035, ... 2065+), which creates 10 categories with 1-2 ETFs each. This isn't a PR #1316 design choice — it's inherited from Morningstar — but it does bloat the Allocation group. In practice the analysis for a Target-Date 2040 and Target-Date 2045 fund is essentially identical; the factor file can treat them uniformly.

## Do I like the design? Yes

It's the right shape for a report-generating system. The groups correspond to distinct factor files, which means the prompt can encode category-specific reasoning (e.g., "for alt-strategies, judge against mandate; for fixed-income-core, lead with tracking and duration") without needing 134 separate prompt paths. The split-core-from-credit-from-muni insight alone prevents a lot of bad output — it's the single most valuable design choice in the framework. If the Alt-Strategies group ever becomes a pain point in practice, splitting it is a low-cost future refactor; starting with it unified is the pragmatic call.
