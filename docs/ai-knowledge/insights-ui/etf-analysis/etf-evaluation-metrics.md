# ETF Evaluation Metrics: Ranked by Impact

A ranked guide to every metric that matters when evaluating whether an ETF is worth buying. Each metric includes a relevance/impact score (10 = most critical), what it measures, why it's not as straightforward as it seems, and concrete examples showing how the metric changes real investment decisions.

---

## Tier 1: Make-or-Break Metrics (Score 9–10)

---

### 1. Tracking Difference (Annual)
**Impact Score: 10/10**

**What it measures:** The cumulative return gap between the ETF and its benchmark index over a full year. Expressed as a percentage — negative means the fund lagged the index, positive means it beat it.

**Why it's not straightforward:** Most investors look at the expense ratio to judge cost, but tracking difference captures the *actual* total drag — including trading costs, cash drag, sampling error, and securities lending revenue. An ETF with a 0.20% expense ratio but strong securities lending can have a tracking difference of only -0.05%. Another with a 0.07% expense ratio but poor execution might have a tracking difference of -0.15%. The cheaper fund actually costs you more.

**Examples:**
- **VWO** (Vanguard FTSE Emerging Markets, 0.08% expense ratio) has historically delivered a tracking difference near -0.01% to +0.03% — it often *beats* its index because Vanguard's securities lending program generates enough revenue to more than offset the expense ratio. An investor who only compared expense ratios would miss that VWO effectively costs nothing.
- **EEM** (iShares MSCI Emerging Markets, 0.68% expense ratio) has a tracking difference around -0.70% to -0.80%. But even comparing it to a cheaper iShares alternative — **IEMG** (0.09% expense ratio) — IEMG's tracking difference runs about -0.10% to -0.15%, worse than its expense ratio suggests, because the MSCI EM Investable Market Index it tracks includes small-cap stocks that are expensive to trade in frontier markets.

**Where to find it:** etf.com (Efficiency tab), fund annual report, trackingdifferences.com (European ETFs)

---

### 2. Tracking Index Methodology
**Impact Score: 10/10**

**What it measures:** The complete set of rules that determine which securities enter the ETF, how they're weighted, when they're replaced, and what constraints apply. This is not a number — it's a qualitative assessment of the index's construction logic.

**Why it's not straightforward:** Two ETFs with identical category labels ("US Large Cap Value") can have radically different portfolios because their indices define "value" differently. One index uses price-to-book; another uses a composite of P/E, P/B, P/S, and dividend yield. One applies hard cutoffs; another uses gradual banding. These methodology differences drive return divergences of 3-5% per year in the same category — far larger than any fee difference.

**Examples:**
- **SCHD** (Schwab US Dividend Equity) tracks the Dow Jones US Dividend 100 Index, which requires 10 consecutive years of dividend payments and then ranks by cash flow to total debt, ROE, dividend yield, and 5-year dividend growth rate. This multi-factor screen produces a portfolio heavily tilted toward quality and profitability. **VYM** (Vanguard High Dividend Yield) tracks the FTSE High Dividend Yield Index, which simply selects stocks with above-median forecast dividend yields. VYM ends up holding lower-quality, higher-yielding stocks that SCHD's profitability screens would reject. In 2022, this methodology difference drove a ~8% return gap between two "dividend" ETFs.
- **IWD** (iShares Russell 1000 Value) defines value using price-to-book and forecast long-term growth. **VTV** (Vanguard Value) uses the CRSP US Large Cap Value Index, which blends five factors: book-to-price, forward earnings-to-price, historic earnings-to-price, dividend-to-price, and sales-to-price. CRSP also uses "banding" — stocks near the growth/value boundary are split proportionally between growth and value indices rather than being forced into one bucket. This reduces turnover and produces different holdings at the margins.

**Where to find it:** Index provider's website (search "[Index Name] methodology PDF"), ETF prospectus, etf.com Fund Report

---

### 3. Holdings Overlap with Existing Portfolio
**Impact Score: 9/10**

**What it measures:** The percentage of portfolio weight that a new ETF shares in common with ETFs you already own. An overlap of 80% means 80% of the dollar-weighted holdings are identical — you're paying two sets of fees for largely the same exposure.

**Why it's not straightforward:** Overlap isn't just about whether two funds hold the same stocks — it's about weight. Two ETFs might both hold Apple, but if one weights it at 7% and the other at 1%, the behavioral overlap is low. Also, low ticker-level overlap doesn't guarantee diversification if the holdings have high correlation (e.g., two different semiconductor stocks move together). The real question is: does adding this ETF meaningfully change my portfolio's risk/return profile?

**Examples:**
- **VTI** (Total US Stock Market) and **VOO** (S&P 500) have ~85% holdings overlap by weight. The 15% that VTI adds is mid-cap and small-cap stocks, which represent such a small weight that VTI and VOO behave nearly identically. An investor holding both is paying for false diversification — they'd be better served by owning VTI alone and adding a dedicated small-cap ETF if they want that exposure.
- **QQQ** (Nasdaq-100) and **XLK** (Technology Select Sector SPDR) appear similar but have only ~45% overlap. QQQ includes non-tech Nasdaq-listed companies (Costco, PepsiCo, Amgen, Starbucks) and weights by market cap within the Nasdaq-100. XLK is pure GICS-defined Information Technology from the S&P 500 and at times has given massive weight to Apple and Microsoft (historically 40%+ combined due to a capping methodology quirk). An investor thinking "I already have tech through QQQ" would actually get meaningfully different exposure from XLK.

**Where to find it:** etfrc.com Fund Overlap Tool (free, visual Venn diagram), Morningstar portfolio X-ray

---

### 4. Expense Ratio
**Impact Score: 9/10**

**What it measures:** The annual percentage of fund assets deducted to cover management fees, administrative costs, and operational expenses. Charged daily against NAV — you never see a bill; it's silently deducted from returns.

**Why it's not straightforward:** The expense ratio is the most-cited cost metric, and for good reason — it compounds relentlessly. A 0.50% annual expense ratio on a $100,000 investment costs $500 in year one, but over 30 years with 8% returns, it drains approximately $95,000 from your portfolio versus a 0.03% fund. However, the expense ratio alone can mislead. It doesn't include trading costs inside the fund, bid-ask spreads, or tax drag. And for active ETFs, a higher expense ratio might be justified if the manager consistently delivers alpha net of fees.

**Examples:**
- **ARKK** (ARK Innovation, 0.75% expense ratio) charged 25x more than **VGT** (Vanguard Information Technology, 0.10%) but delivered massively different exposures — disruptive growth vs. established tech. The expense ratio comparison is meaningless without asking "am I getting something different for the extra cost?" (Whether ARKK's different exposure was *worth* 0.75% is a separate performance question.)
- Among near-identical S&P 500 ETFs, the expense ratio difference is the *only* meaningful differentiator. **SPY** (0.0945%) costs roughly $65 more per year per $100,000 than **VOO** (0.03%). Over 20 years, that's ~$2,000 in lost compounding. For a fund that does exactly the same thing, this is a free and easy win. SPY's higher fee is a legacy of being the first ETF — it persists due to SPY's superior options market liquidity, which matters to traders but not to buy-and-hold investors.

**Where to find it:** Any ETF screener, fund factsheet, prospectus. Note: some funds have fee waivers that temporarily reduce the expense ratio — check the prospectus for the "contractual" vs. "net" expense ratio and when waivers expire.

---

### 5. Assets Under Management (AUM) and Fund Flows
**Impact Score: 9/10**

**What it measures:** AUM is the total market value of all shares outstanding. Fund flows measure the net money entering or leaving the fund over a period (monthly, quarterly, annually). Together, they indicate the fund's viability and investor sentiment.

**Why it's not straightforward:** High AUM is generally good (lower closure risk, tighter spreads), but it's not always better. Very large AUM can be a disadvantage for small-cap or niche strategies where the fund becomes too large to efficiently trade its holdings. Fund flows are more revealing than AUM itself — a $500M ETF with 12 consecutive months of outflows is in worse shape than a $200M ETF with steady inflows. Persistent outflows can lead to closure even for mid-size funds.

**Examples:**
- **ARKK** peaked at $28B AUM in early 2021. By mid-2023, it had shrunk to ~$7B through both performance losses and investor redemptions. The AUM alone didn't signal the problem — the *flow trend* (massive outflows for 18+ months) was the warning sign. An investor checking flows monthly would have seen the bleeding long before it showed up in the AUM figure.
- **VXUS** (Vanguard Total International Stock, ~$60B AUM) has sustained positive flows for years despite periods of international underperformance. This signals strong institutional and advisor commitment — the fund is being used as a strategic allocation, not a trade. This makes closure risk essentially zero and ensures persistently tight spreads.

**Where to find it:** etf.com (Fund Flows tab), etfdb.com (Fund Flows tool), issuer website

---

## Tier 2: High-Impact Metrics (Score 7–8)

---

### 6. Bid-Ask Spread (Median, Not Snapshot)
**Impact Score: 8/10**

**What it measures:** The cost of executing a round-trip trade (buy + sell), expressed as the difference between the bid and ask prices as a percentage of the mid-price. The median spread over 30-60 days is far more useful than a single point-in-time snapshot.

**Why it's not straightforward:** The spread you see on your screen at any moment may not be representative. Spreads widen at market open, around FOMC announcements, during earnings season, and when the underlying market is closed (e.g., trading an emerging markets ETF during US hours when Asian/Latin American exchanges are closed). The *median* spread over time captures normal conditions. Also, for large orders, the quoted spread only applies to the shares at the best bid/ask — a $500K order will move through multiple price levels, increasing the effective spread.

**Examples:**
- **SPY** has a median bid-ask spread of ~0.002% ($0.01 on a ~$500 share). For a $50,000 investment, this costs $1 round-trip — essentially free. But during the March 2020 crash, SPY's spread widened to 0.10-0.30% intraday, costing 50-150x more than normal. An investor who panic-sold with a market order during peak volatility paid a real spread of $50-$150 per $50,000.
- **EMB** (iShares JP Morgan USD Emerging Markets Bond) typically has a 0.02-0.05% spread. But during EM credit stress events, the spread can blow out to 0.50-1.00% because the underlying bonds stop trading while the ETF continues to trade. In these moments, the ETF becomes a *price discovery* vehicle — its price reflects the market's real-time assessment of EM debt, while the reported NAV (based on stale bond prices) is fictitious. Buying at these moments gets you a "discount" that's actually fair value.

**Where to find it:** etf.com (Efficiency tab, "median bid-ask spread"), your broker's Level 2 order book, Bloomberg Terminal

---

### 7. Premium / Discount to NAV (30-Day Average and Extremes)
**Impact Score: 8/10**

**What it measures:** How much the ETF's market price deviates from the per-share value of its underlying holdings. Positive = premium (you're overpaying), negative = discount (you're getting a bargain, or something is wrong).

**Why it's not straightforward:** A small, persistent premium isn't necessarily bad — it can reflect high demand and efficient creation, and APs will arbitrage it away if it grows. But a sudden shift from persistent premium to persistent discount often signals investor exodus and potential closure risk. For bond ETFs, a "discount" during stress is not a genuine bargain — it means the ETF is pricing the bonds more accurately than the stale NAV, which is based on dealer marks that haven't adjusted to reality. Buying at a "discount" to NAV in this case means buying at fair value.

**Examples:**
- **HYG** (iShares iBoxx High Yield Corporate Bond) traded at a 5% discount to NAV in March 2020. Some investors rushed to "buy the discount," thinking they were getting bonds worth $100 for $95. In reality, the NAV was stale — it was based on bond prices from dealer quotes that hadn't been updated to reflect the crash. HYG's market price was the accurate price. Investors who understood this recognized there was no free lunch — the "discount" was the market repricing credit risk in real time.
- **GBTC** (Grayscale Bitcoin Trust) traded at a 40%+ discount to its Bitcoin NAV for most of 2022-2023, because it was structured as a closed-end trust (no redemption mechanism), and investor confidence in the sponsor was low. When it converted to a spot ETF in January 2024 and the redemption mechanism activated, the discount closed to near zero. Investors who bought the discount earned Bitcoin returns *plus* the discount closure — a one-time structural windfall.

**Where to find it:** Fund issuer website (daily premium/discount), etf.com, Morningstar

---

### 8. Tax Cost Ratio
**Impact Score: 8/10**

**What it measures:** The annual percentage of return lost to taxes, calculated by comparing the fund's pre-tax return with its after-tax return (assuming the highest marginal tax rate). A tax cost ratio of 0.50% means taxes reduced your return by half a percentage point per year.

**Why it's not straightforward:** Most investors compare pre-tax returns and never quantify the tax drag. But two ETFs with identical pre-tax returns can have very different after-tax returns depending on portfolio turnover, the type of income distributed (qualified dividends vs. ordinary income), and capital gains distributions. This metric is invisible in standard performance charts but can compound to a massive difference over decades.

**Examples:**
- **VNQ** (Vanguard Real Estate ETF) has a tax cost ratio around 1.0-1.5% because REIT dividends are mostly non-qualified (taxed at ordinary income rates up to 37%, not the 15-20% qualified dividend rate). An investor holding VNQ in a taxable account with a 35% marginal tax rate loses ~1.2% per year to taxes. Moving VNQ into an IRA eliminates this drag entirely. Over 20 years on a $100,000 position, that's roughly $40,000 in tax savings.
- **VTI** (Vanguard Total Stock Market) has a tax cost ratio of about 0.30-0.40%, almost entirely from qualified dividends taxed at 15%. It rarely distributes capital gains thanks to the creation/redemption mechanism. The tax cost is low enough that VTI is perfectly efficient in a taxable account. Investors who shelter VTI in an IRA while holding VNQ in a taxable account have the placement exactly backward.

**Where to find it:** Morningstar (Tax tab, "tax cost ratio"), fund annual report (look for distributions breakdown: ordinary income vs. qualified dividends vs. capital gains)

---

### 9. Portfolio Concentration (Top 10 Holding Weight)
**Impact Score: 8/10**

**What it measures:** The combined percentage weight of the 10 largest positions. A higher percentage means a smaller number of companies drive the fund's returns.

**Why it's not straightforward:** Concentration is a two-edged metric — it's not inherently bad. A concentrated fund in a bull market for its top holdings will dramatically outperform a diversified peer. The risk is asymmetric: when those top holdings fall, the loss hits disproportionately. The subtle issue is that concentration can *creep* — a fund that started diversified may become concentrated over time as certain holdings outperform and grow in weight, particularly in market-cap-weighted funds that don't rebalance weights.

**Examples:**
- **XLK** (Technology Select Sector SPDR) at various points has had Apple + Microsoft representing 40%+ of the fund. This isn't 65 tech stocks — it's essentially a leveraged bet on two companies with 63 others along for the ride. When Apple and Microsoft rallied, XLK crushed equal-weight tech alternatives. When they pulled back, XLK suffered far more than a diversified tech investor would expect. The Herfindahl-Hirschman Index (HHI) for XLK can exceed 1,500 — in antitrust terms, that's a "highly concentrated" market.
- **VTI** (Total US Stock Market) holds ~3,600 stocks, but its top 10 represent ~30% of the fund. The *effective* number of stocks (calculated as 1/HHI) is closer to 100-150, not 3,600. An investor who chose VTI over VOO for "more diversification" is getting almost identical concentration at the top, with a long tail of tiny positions that barely move the needle.

**Where to find it:** Fund factsheet, etf.com (Holdings tab), Morningstar (Portfolio tab)

---

### 10. Distribution Yield vs. SEC Yield (Bond ETFs)
**Impact Score: 7/10**

**What it measures:** Two different ways to express an ETF's income:
- **Distribution yield**: Annualizes the most recent dividend payment and divides by current price. Backward-looking.
- **SEC yield (30-day)**: A standardized, SEC-mandated calculation reflecting net income earned over the last 30 days after expenses. Forward-looking.

**Why it's not straightforward:** Distribution yield can be misleading because it reflects past payments, which may include return of capital (your own money coming back to you, not income) or one-time special distributions. SEC yield is more reliable for comparison but still has quirks — it can spike temporarily after a sharp bond selloff (because bond prices dropped, boosting the yield calculation even though nothing fundamental changed). For equity ETFs, distribution yield is fine. For bond ETFs, always compare SEC yields.

**Examples:**
- **JEPI** (JPMorgan Equity Premium Income) often shows a distribution yield of 8-11%, which looks extraordinary. But a significant portion of JEPI's distributions come from options premium (classified as short-term capital gains or return of capital), not traditional dividend income. The SEC yield is typically 3-4% — the actual income from the underlying equity portfolio. The rest is options income that comes at the cost of capped upside. An investor chasing the 10% "yield" without understanding the source is misreading the metric.
- **TLT** (iShares 20+ Year Treasury Bond) might show a distribution yield of 3.8% while its SEC yield is 4.3%. The difference exists because Treasury yields recently rose — TLT's new purchases earn more than the older bonds whose coupons set the distribution yield. The SEC yield better reflects what the portfolio will earn going forward.

**Where to find it:** Fund factsheet (both yields listed), issuer website, Morningstar

---

### 11. Tracking Error (Standard Deviation of Daily Differences)
**Impact Score: 7/10**

**What it measures:** The standard deviation of daily return differences between the ETF and its benchmark. It measures *consistency* of tracking, not cumulative cost (that's tracking difference).

**Why it's not straightforward:** Low tracking error and low tracking difference are not the same thing. A fund can have low tracking error (consistently matches the index day-to-day) but high tracking difference (consistently underperforms by a steady amount — the expense ratio drag). Conversely, a fund can have high tracking error but zero tracking difference if the daily deviations cancel out over time. For a buy-and-hold investor, tracking difference matters more. For someone using the ETF as a hedging vehicle (where daily precision matters), tracking error is critical.

**Examples:**
- **SPY** vs. **SPLG** (SPDR Portfolio S&P 500): Both track the S&P 500. SPY has marginally lower tracking error because its massive AUM and options market ecosystem make its pricing extremely efficient. But SPLG has a better tracking difference because its 0.02% expense ratio is lower than SPY's 0.0945%. A day-trader hedging with options needs SPY's precision. A retirement saver should use SPLG and pocket the better tracking difference.
- **VWO** (Vanguard FTSE Emerging Markets) has higher tracking error than **EEM** (iShares MSCI Emerging Markets) on some days because VWO uses sampling (doesn't hold every stock in the FTSE EM index), while EEM, despite tracking a different index, is more fully replicated. But VWO's tracking difference is superior over a full year because its lower expense ratio and better securities lending outweigh the daily noise.

**Where to find it:** etf.com (Efficiency tab), Morningstar, fund annual report

---

## Tier 3: Important Supporting Metrics (Score 5–6)

---

### 12. Portfolio Turnover Rate
**Impact Score: 6/10**

**What it measures:** The percentage of the fund's holdings bought or sold in a year. A 100% turnover means the fund replaced its entire portfolio over 12 months. Reported in the fund's annual report and factsheet.

**Why it's not straightforward:** High turnover doesn't automatically mean high cost — it depends on *what* is being traded. A fund that turns over 50% of a portfolio of highly liquid mega-cap stocks incurs minimal transaction costs. A fund that turns over 50% of illiquid small-cap or emerging market stocks creates significant hidden costs that show up in tracking difference. Also, turnover in an ETF wrapper is more tax-efficient than in a mutual fund because in-kind redemptions can offload low-basis shares without triggering capital gains.

**Examples:**
- **MTUM** (iShares MSCI USA Momentum) has turnover of 100-130% annually because momentum strategies, by definition, constantly rotate into recent winners and out of losers. Despite the high turnover, MTUM has distributed minimal capital gains because the ETF structure purges gains through in-kind redemptions. The turnover drives transaction costs (visible in tracking difference) but not tax costs — a distinction many investors miss.
- **AVUV** (Avantis US Small Cap Value) is actively managed with 30-40% turnover, trading small-cap stocks that cost more to trade per dollar than large-caps. Its tracking difference to its internal benchmark shows this friction. Compare to **VBR** (Vanguard Small-Cap Value) with ~15% turnover and lower transaction drag. The question is whether AVUV's active decisions add enough return to justify the higher turnover cost.

**Where to find it:** Fund annual report (SEC filing), Morningstar (Portfolio tab), etf.com

---

### 13. Duration (Bond ETFs)
**Impact Score: 6/10**

**What it measures:** The weighted average time (in years) until the bond portfolio's cash flows are received, which also serves as the approximate percentage the ETF will decline for each 1% rise in interest rates. A duration of 6 means a 1% rate hike causes roughly a 6% price drop.

**Why it's not straightforward:** Duration is an approximation that works well for small rate changes but breaks down for large moves (this non-linearity is called "convexity"). Also, duration assumes all rates across the yield curve move in parallel, which they rarely do — short rates can rise while long rates fall (a flattening curve), causing unexpected behavior. For credit bond ETFs (high yield, EM debt), spread duration — sensitivity to credit spread changes — often matters more than interest rate duration.

**Examples:**
- **TLT** (iShares 20+ Year Treasury Bond) has a duration of ~17 years. When the Fed hiked rates aggressively in 2022-2023, TLT dropped ~50% from peak — far more than naive duration math (17 x ~2.5% rate hike = ~42%) would suggest, because convexity amplifies losses on long-duration bonds at large rate moves, and rate expectations overshot.
- **BKLN** (Invesco Senior Loan) has a duration of only ~0.1 years because its floating-rate loans reset every 30-90 days. Despite holding below-investment-grade credit, BKLN is nearly immune to interest rate changes. But its *spread duration* (sensitivity to credit spreads widening) is ~4 years, meaning a credit crisis hits it hard even as Treasury duration risk is negligible. An investor who only checked interest rate duration would think BKLN was ultra-safe.

**Where to find it:** Fund factsheet, issuer website, Morningstar (Portfolio tab)

---

### 14. Credit Quality Distribution (Bond ETFs)
**Impact Score: 6/10**

**What it measures:** The breakdown of bond holdings by credit rating (AAA, AA, A, BBB, BB, B, CCC, and below). Investment grade is BBB- and above; below that is high yield / junk.

**Why it's not straightforward:** The average credit quality can mask a "barbell" distribution — a fund might show an average rating of A by holding 50% AAA and 50% BBB, or by holding 100% single-A bonds. The risk profiles are very different. The barbell portfolio has more exposure to both the safest and riskiest end of investment grade, while the pure single-A portfolio has concentrated risk at one quality level. Always look at the *distribution*, not just the average.

**Examples:**
- **AGG** (iShares Core US Aggregate Bond) shows an average credit quality of AA, which sounds ultra-safe. But its distribution is roughly 40% AAA (mostly Treasuries and agency MBS), 5% AA, 15% A, and 25% BBB, with the rest in government-backed securities. That 25% BBB allocation means a quarter of the "safe" aggregate bond fund is one notch above junk. During credit stress, the BBB tranche behaves very differently from the AAA tranche.
- **JAAA** (Janus Henderson AAA CLO) holds only the senior-most tranche of collateralized loan obligations. Despite the underlying collateral being leveraged loans (typically rated B/BB), the AAA CLO tranche has structural protections (subordination, overcollateralization) that give it AAA status. The credit quality label (AAA) is accurate but can mislead — the fund is still exposed to corporate default cycles, just with multiple layers of protection. An investor seeing "AAA" and assuming "risk-free like Treasuries" misreads the risk.

**Where to find it:** Fund factsheet, issuer website (Portfolio Characteristics section), Morningstar

---

### 15. Number of Holdings / Effective Number of Holdings
**Impact Score: 6/10**

**What it measures:** The raw count of securities in the ETF versus the *effective* number (1 / sum of squared weights, also known as the inverse Herfindahl-Hirschman Index). The effective number captures how many holdings truly matter to the portfolio's behavior.

**Why it's not straightforward:** A fund can hold 2,000 stocks but behave like it holds 50 if the top positions dominate. The raw count gives a false sense of diversification. The effective number of holdings reveals the true diversification. For equally weighted funds, the raw and effective counts are similar. For cap-weighted funds with mega-cap dominance, the effective count can be 5-10x lower than the raw count.

**Examples:**
- **VT** (Vanguard Total World Stock) holds ~9,800 stocks across 49 countries — the broadest equity ETF available. But its effective number of holdings is roughly 150-200, because US mega-caps dominate. The top 10 holdings (all US tech) represent ~18% of the fund. An investor owning VT for "maximum global diversification" is still getting a portfolio whose short-term returns are largely driven by a handful of American technology companies.
- **RSP** (Invesco S&P 500 Equal Weight) holds the same 500 stocks as SPY but gives each 0.20% weight. Its effective number of holdings is ~480 (close to the raw count), versus SPY's effective ~100-120. This means RSP's returns are genuinely driven by broad market health, not mega-cap performance. During 2022's narrow market (few stocks driving index returns), RSP significantly underperformed SPY precisely because its "true" diversification prevented it from being concentrated in the few winners.

**Where to find it:** Fund factsheet (raw count), Morningstar (raw count). Effective number requires calculation: download the holdings file and compute 1/Σ(w²). Alternatively, compare top-10 weight as a proxy — above 30% signals the effective count is far below the raw count.

---

### 16. Sector and Geographic Concentration vs. Benchmark
**Impact Score: 6/10**

**What it measures:** How much the ETF's sector and country weights deviate from a broad market benchmark. An "overweight" in technology or an "underweight" in healthcare represents an active bet relative to the market.

**Why it's not straightforward:** Every ETF makes implicit sector/geographic bets, even passive index funds. A dividend ETF will structurally overweight financials, utilities, and energy (high-dividend sectors) and underweight technology and healthcare (low-dividend sectors). This isn't a choice by the fund manager — it's a mathematical consequence of the dividend screening. Investors who don't check sector weights may inadvertently double up on sectors they already own or miss sectors they think they have.

**Examples:**
- **SCHD** (Schwab US Dividend Equity) has ~0% allocation to real estate and utilities — two sectors that investors often expect in a "dividend" fund. Its quality screens filter them out because utilities have high payout ratios with low earnings growth, and many REITs fail the cash-flow-to-debt test. An income investor who buys SCHD expecting traditional dividend sector exposure would need to add separate utility and REIT ETFs to fill the gap.
- **VEA** (Vanguard FTSE Developed Markets) has ~20% allocation to Japan, ~15% to the UK, and only ~6% to Germany. An investor who buys VEA for "European exposure" might not realize that Japan is the largest position — and that European countries are weighted by market cap, not economic size. Germany, the EU's largest economy, gets a fraction of the UK's weight because the London Stock Exchange lists more companies at higher valuations.

**Where to find it:** Fund factsheet (sector/country breakdown), Morningstar (Portfolio tab), etf.com

---

### 17. Fund Age / Inception Date
**Impact Score: 5/10**

**What it measures:** How long the ETF has been in operation. Older funds have longer track records, more proven tracking, and lower closure risk.

**Why it's not straightforward:** A new ETF isn't automatically bad — it might be the first to offer a genuinely useful strategy. But backtested performance (shown before the fund existed) is always better than live performance because it's optimized with hindsight. Any return data shown before the inception date is hypothetical and should be treated with deep skepticism. The real question isn't just how old the fund is, but how old it is relative to its category. Being the first dividend ETF (VIG, launched 2006) is different from being the 47th (launched 2023 to chase the trend).

**Examples:**
- **JEPI** (JPMorgan Equity Premium Income) launched in May 2020 and grew to $30B+ AUM within 3 years — unprecedented growth for an active ETF. But its entire track record exists within a specific market regime (post-COVID recovery, then inflation/rate hikes). Its covered call strategy has never been tested through a sustained multi-year bear market followed by a sharp V-recovery (where capped upside would severely hurt). Investors extrapolating JEPI's income and returns forward are relying on a 3-year sample in unusual conditions.
- **BITO** (ProShares Bitcoin Strategy ETF) launched in October 2021, weeks before Bitcoin's all-time high. Its first year produced a -60%+ return. Investors who saw the "first Bitcoin ETF" novelty without questioning timing bought at the worst moment. A fund's launch timing — whether it rides a trend peak or starts during a trough — shapes the experience of early investors and the narrative around the fund for years.

**Where to find it:** Any ETF screener, fund factsheet, etfdb.com

---

### 18. Average Daily Dollar Volume
**Impact Score: 5/10**

**What it measures:** The average number of shares traded per day multiplied by the share price — the total dollar value of daily trading activity. More useful than share volume because it normalizes for share price differences.

**Why it's not straightforward:** High daily volume doesn't always mean the ETF is liquid for your purposes, and low volume doesn't always mean it's illiquid. ETF liquidity is ultimately backed by the liquidity of the underlying holdings (because APs can create/redeem shares). An ETF with $1M daily volume that holds S&P 500 stocks can handle a $500K order efficiently because the AP can easily trade the underlyings. An ETF with $50M daily volume that holds illiquid frontier market bonds may struggle to handle the same order without significant market impact.

**Examples:**
- **IEFA** (iShares Core MSCI EAFE) trades ~$500M daily — highly liquid by any measure. But because it holds stocks across 20+ international markets, some in different time zones, spreads widen during US morning hours when European markets are closed and Asian markets haven't opened. The high daily volume metric masks intraday liquidity variation.
- **DFAC** (Dimensional US Core Equity) trades relatively low volume (~$30-50M daily) but holds large, highly liquid US stocks. A $200K order would execute cleanly with a tight spread because the AP can instantly hedge using the underlying holdings. An investor scared off by the low volume would miss a perfectly viable fund.

**Where to find it:** Yahoo Finance, etf.com, your broker's research page

---

### 19. Capital Gains Distribution History
**Impact Score: 5/10**

**What it measures:** Whether the ETF has distributed taxable capital gains to shareholders in prior years, and if so, how much. Ideally: zero.

**Why it's not straightforward:** Most broad index ETFs have never distributed capital gains, thanks to the in-kind creation/redemption mechanism. But not all ETFs are equally tax-efficient. Active ETFs with high turnover, bond ETFs that realize gains when bonds are sold, and funds tracking indices with frequent reconstitution can and do distribute capital gains. The capital gains distribution is particularly insidious because it taxes *all* current shareholders on gains from past activity — including investors who bought after the gains accrued.

**Examples:**
- **QUAL** (iShares MSCI USA Quality Factor) distributed a large capital gain in December 2021, surprising investors who assumed all iShares ETFs were tax-efficient. The distribution was triggered by a major index reconstitution that forced the fund to sell appreciated holdings. Investors who bought QUAL in November 2021 received — and owed taxes on — capital gains from appreciation that occurred before they owned the fund.
- **VTI** (Vanguard Total Stock Market) and virtually all Vanguard equity index ETFs have distributed zero capital gains for years. This isn't luck — Vanguard's dual share-class structure (ETF shares and Admiral shares exist in the same fund) gives the portfolio manager more flexibility to use in-kind redemptions to purge low-cost-basis lots. This structural advantage is unique to Vanguard since their patent expired and other issuers began adopting similar approaches.

**Where to find it:** Fund's distribution history page on issuer website, Morningstar (Tax tab), IRS Form 8937 for return of capital classifications

---

### 20. Securities Lending Revenue
**Impact Score: 5/10**

**What it measures:** The income the ETF earns by lending its holdings to short-sellers, and how much of that revenue is returned to shareholders versus retained by the fund manager. Reported annually in the fund's financial statements.

**Why it's not straightforward:** Securities lending can meaningfully offset (or even exceed) the expense ratio, but the benefit depends on what the fund holds and how much the manager shares. Funds holding hard-to-borrow stocks (small caps, heavily shorted names) earn more lending revenue. The split between manager and shareholders matters: Vanguard returns ~95% of lending revenue to shareholders; BlackRock typically returns 62-65%; some smaller issuers keep 50% or more. This explains why some Vanguard funds have positive tracking differences (they beat their index).

**Examples:**
- **VBR** (Vanguard Small-Cap Value) earns substantial securities lending income because small-cap value stocks are in high demand from short-sellers. Combined with Vanguard's 95% revenue share, this lending income nearly covers VBR's entire 0.07% expense ratio, producing a tracking difference close to zero. A comparable small-cap value ETF from another issuer that keeps 40% of lending revenue has a materially worse tracking difference despite a similar expense ratio.
- **GLD** (SPDR Gold Shares) does not lend its gold bullion — it sits in vaults untouched. This means GLD's tracking difference is always negative by at least its 0.40% expense ratio, with no lending offset. **IAU** (iShares Gold Trust) also doesn't lend. For physical commodity ETFs, there is no securities lending benefit, making the expense ratio a hard floor on tracking difference.

**Where to find it:** Fund annual report (N-CSR filing on SEC EDGAR), search for "securities lending income" in the financial statements. Compare "gross lending income" to "amount retained by fund" versus "amount retained by manager."

---

## Quick Reference Summary

| Rank | Metric | Impact Score | Most Critical For |
|------|--------|:----------:|-------------------|
| 1 | Tracking Difference | 10 | All ETFs |
| 2 | Index Methodology | 10 | Comparing "similar" ETFs |
| 3 | Holdings Overlap | 9 | Portfolio construction |
| 4 | Expense Ratio | 9 | All ETFs |
| 5 | AUM & Fund Flows | 9 | Fund viability |
| 6 | Bid-Ask Spread (Median) | 8 | Frequent traders, large orders |
| 7 | Premium/Discount to NAV | 8 | Bond ETFs, international ETFs |
| 8 | Tax Cost Ratio | 8 | Taxable accounts |
| 9 | Top 10 Concentration | 8 | Cap-weighted ETFs |
| 10 | Distribution vs. SEC Yield | 7 | Bond and income ETFs |
| 11 | Tracking Error | 7 | Hedging, options strategies |
| 12 | Portfolio Turnover | 6 | Active ETFs, factor ETFs |
| 13 | Duration | 6 | Bond ETFs |
| 14 | Credit Quality Distribution | 6 | Bond ETFs |
| 15 | Holdings Count (Effective) | 6 | Diversification assessment |
| 16 | Sector/Geo Concentration | 6 | Non-obvious tilts |
| 17 | Fund Age | 5 | New/thematic ETFs |
| 18 | Daily Dollar Volume | 5 | Large orders |
| 19 | Capital Gains History | 5 | Taxable accounts |
| 20 | Securities Lending Revenue | 5 | Explaining tracking difference |
