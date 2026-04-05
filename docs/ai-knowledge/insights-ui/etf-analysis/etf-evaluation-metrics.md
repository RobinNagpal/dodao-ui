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

### 6. Maximum Drawdown
**Impact Score: 9/10**

**What it measures:** The largest peak-to-trough percentage decline the ETF has experienced over a given period, before a new high is reached. It answers the question: "What was the absolute worst loss I would have suffered if I bought at the worst possible time?"

**Why it's not straightforward:** Standard deviation treats upside and downside volatility equally, but investors experience them very differently — nobody complains about upside volatility. Maximum drawdown captures the actual pain investors endured, not a theoretical average. Critically, two ETFs can have identical annualized returns and identical standard deviations but very different maximum drawdowns depending on *how* the losses arrived — a slow grind down and recovery looks the same statistically as a sharp crash and V-recovery, but the drawdown depths differ dramatically. Also, drawdown depth is only half the story; **recovery time** matters just as much — a 30% drawdown that recovers in 6 months is far less damaging than one that takes 4 years.

**Examples:**
- **QQQ** (Invesco Nasdaq-100) had a maximum drawdown of approximately -83% during the dot-com bust (2000-2002) and -35% during COVID (2020). An investor comparing QQQ to **SPY** (max drawdown -51% in 2008-2009 and -34% during COVID) would see that QQQ's worst case was far worse than SPY's, despite QQQ's superior long-term returns. The max drawdown reveals that QQQ's outperformance came with dramatically higher tail risk — something standard deviation alone understates because the dot-com crash was a single, extreme event.
- **USMV** (iShares MSCI USA Min Vol) had a maximum drawdown of about -20% during COVID versus SPY's -34%. But during the 2022 rate-hike selloff, USMV drew down ~-17% while SPY drew down ~-25%. The minimum volatility strategy consistently delivered 30-40% shallower drawdowns across different types of market stress (pandemic shock vs. monetary tightening), confirming it does what it promises. An investor who only looked at average returns would have missed that USMV's main value is in the drawdowns, not the upside.

**Where to find it:** Portfolio Visualizer (Backtest Portfolio tool), Morningstar (Risk tab, "worst 3-month return" as a proxy), Koyfin (drawdown chart), Yahoo Finance (interactive chart, calculate manually)

---

## Tier 2: High-Impact Metrics (Score 7–8)

---

### 7. Bid-Ask Spread (Median, Not Snapshot)
**Impact Score: 8/10**

**What it measures:** The cost of executing a round-trip trade (buy + sell), expressed as the difference between the bid and ask prices as a percentage of the mid-price. The median spread over 30-60 days is far more useful than a single point-in-time snapshot.

**Why it's not straightforward:** The spread you see on your screen at any moment may not be representative. Spreads widen at market open, around FOMC announcements, during earnings season, and when the underlying market is closed (e.g., trading an emerging markets ETF during US hours when Asian/Latin American exchanges are closed). The *median* spread over time captures normal conditions. Also, for large orders, the quoted spread only applies to the shares at the best bid/ask — a $500K order will move through multiple price levels, increasing the effective spread.

**Examples:**
- **SPY** has a median bid-ask spread of ~0.002% ($0.01 on a ~$500 share). For a $50,000 investment, this costs $1 round-trip — essentially free. But during the March 2020 crash, SPY's spread widened to 0.10-0.30% intraday, costing 50-150x more than normal. An investor who panic-sold with a market order during peak volatility paid a real spread of $50-$150 per $50,000.
- **EMB** (iShares JP Morgan USD Emerging Markets Bond) typically has a 0.02-0.05% spread. But during EM credit stress events, the spread can blow out to 0.50-1.00% because the underlying bonds stop trading while the ETF continues to trade. In these moments, the ETF becomes a *price discovery* vehicle — its price reflects the market's real-time assessment of EM debt, while the reported NAV (based on stale bond prices) is fictitious. Buying at these moments gets you a "discount" that's actually fair value.

**Where to find it:** etf.com (Efficiency tab, "median bid-ask spread"), your broker's Level 2 order book, Bloomberg Terminal

---

### 8. Premium / Discount to NAV (30-Day Average and Extremes)
**Impact Score: 8/10**

**What it measures:** How much the ETF's market price deviates from the per-share value of its underlying holdings. Positive = premium (you're overpaying), negative = discount (you're getting a bargain, or something is wrong).

**Why it's not straightforward:** A small, persistent premium isn't necessarily bad — it can reflect high demand and efficient creation, and APs will arbitrage it away if it grows. But a sudden shift from persistent premium to persistent discount often signals investor exodus and potential closure risk. For bond ETFs, a "discount" during stress is not a genuine bargain — it means the ETF is pricing the bonds more accurately than the stale NAV, which is based on dealer marks that haven't adjusted to reality. Buying at a "discount" to NAV in this case means buying at fair value.

**Examples:**
- **HYG** (iShares iBoxx High Yield Corporate Bond) traded at a 5% discount to NAV in March 2020. Some investors rushed to "buy the discount," thinking they were getting bonds worth $100 for $95. In reality, the NAV was stale — it was based on bond prices from dealer quotes that hadn't been updated to reflect the crash. HYG's market price was the accurate price. Investors who understood this recognized there was no free lunch — the "discount" was the market repricing credit risk in real time.
- **GBTC** (Grayscale Bitcoin Trust) traded at a 40%+ discount to its Bitcoin NAV for most of 2022-2023, because it was structured as a closed-end trust (no redemption mechanism), and investor confidence in the sponsor was low. When it converted to a spot ETF in January 2024 and the redemption mechanism activated, the discount closed to near zero. Investors who bought the discount earned Bitcoin returns *plus* the discount closure — a one-time structural windfall.

**Where to find it:** Fund issuer website (daily premium/discount), etf.com, Morningstar

---

### 9. Tax Cost Ratio
**Impact Score: 8/10**

**What it measures:** The annual percentage of return lost to taxes, calculated by comparing the fund's pre-tax return with its after-tax return (assuming the highest marginal tax rate). A tax cost ratio of 0.50% means taxes reduced your return by half a percentage point per year.

**Why it's not straightforward:** Most investors compare pre-tax returns and never quantify the tax drag. But two ETFs with identical pre-tax returns can have very different after-tax returns depending on portfolio turnover, the type of income distributed (qualified dividends vs. ordinary income), and capital gains distributions. This metric is invisible in standard performance charts but can compound to a massive difference over decades.

**Examples:**
- **VNQ** (Vanguard Real Estate ETF) has a tax cost ratio around 1.0-1.5% because REIT dividends are mostly non-qualified (taxed at ordinary income rates up to 37%, not the 15-20% qualified dividend rate). An investor holding VNQ in a taxable account with a 35% marginal tax rate loses ~1.2% per year to taxes. Moving VNQ into an IRA eliminates this drag entirely. Over 20 years on a $100,000 position, that's roughly $40,000 in tax savings.
- **VTI** (Vanguard Total Stock Market) has a tax cost ratio of about 0.30-0.40%, almost entirely from qualified dividends taxed at 15%. It rarely distributes capital gains thanks to the creation/redemption mechanism. The tax cost is low enough that VTI is perfectly efficient in a taxable account. Investors who shelter VTI in an IRA while holding VNQ in a taxable account have the placement exactly backward.

**Where to find it:** Morningstar (Tax tab, "tax cost ratio"), fund annual report (look for distributions breakdown: ordinary income vs. qualified dividends vs. capital gains)

---

### 10. Portfolio Concentration (Top 10 Holding Weight)
**Impact Score: 8/10**

**What it measures:** The combined percentage weight of the 10 largest positions. A higher percentage means a smaller number of companies drive the fund's returns.

**Why it's not straightforward:** Concentration is a two-edged metric — it's not inherently bad. A concentrated fund in a bull market for its top holdings will dramatically outperform a diversified peer. The risk is asymmetric: when those top holdings fall, the loss hits disproportionately. The subtle issue is that concentration can *creep* — a fund that started diversified may become concentrated over time as certain holdings outperform and grow in weight, particularly in market-cap-weighted funds that don't rebalance weights.

**Examples:**
- **XLK** (Technology Select Sector SPDR) at various points has had Apple + Microsoft representing 40%+ of the fund. This isn't 65 tech stocks — it's essentially a leveraged bet on two companies with 63 others along for the ride. When Apple and Microsoft rallied, XLK crushed equal-weight tech alternatives. When they pulled back, XLK suffered far more than a diversified tech investor would expect. The Herfindahl-Hirschman Index (HHI) for XLK can exceed 1,500 — in antitrust terms, that's a "highly concentrated" market.
- **VTI** (Total US Stock Market) holds ~3,600 stocks, but its top 10 represent ~30% of the fund. The *effective* number of stocks (calculated as 1/HHI) is closer to 100-150, not 3,600. An investor who chose VTI over VOO for "more diversification" is getting almost identical concentration at the top, with a long tail of tiny positions that barely move the needle.

**Where to find it:** Fund factsheet, etf.com (Holdings tab), Morningstar (Portfolio tab)

---

### 11. Sharpe Ratio
**Impact Score: 8/10**

**What it measures:** The ETF's excess return (above the risk-free rate) divided by its standard deviation. It answers: "How much return am I getting per unit of risk?" A higher Sharpe ratio means better risk-adjusted performance. A Sharpe of 0.5 is average; above 1.0 is excellent; below 0.3 suggests the risk isn't being compensated.

**Why it's not straightforward:** The Sharpe ratio assumes returns are normally distributed, but ETF returns often aren't — they have fat tails (extreme events happen more often than a bell curve predicts) and skewness (losses can be larger than gains). A covered call ETF might show a beautiful Sharpe ratio because it collects steady premium income (low volatility, consistent small gains), but it hides the occasional large loss when the market gaps up past the call strike. The Sharpe ratio treats that truncated upside as "low risk" when it's actually a structural asymmetry. Also, the Sharpe ratio changes significantly depending on the measurement period — a 3-year Sharpe through a bull market says nothing about how the fund performs through a full cycle.

**Examples:**
- **USMV** (iShares MSCI USA Min Vol) consistently posts a higher Sharpe ratio than **SPY** over full market cycles (~0.65 vs. ~0.55 for SPY over 10+ years). This doesn't mean USMV delivers higher returns — it doesn't. It means the return *per unit of volatility* is higher. An investor who can tolerate SPY's volatility is better served by SPY's higher absolute returns. An investor who would panic-sell during a 30% drawdown is better served by USMV's superior risk-adjusted path.
- **QYLD** (Global X Nasdaq-100 Covered Call) showed a Sharpe ratio above 1.0 during parts of 2021 — seemingly outstanding risk-adjusted performance. But this was an artifact of the strategy collecting steady options premium during a calm bull market. The Sharpe ratio didn't account for the asymmetric risk: QYLD captured only ~50% of the upside while remaining exposed to most of the downside. When the Nasdaq dropped 33% in 2022, QYLD still dropped ~22%, revealing that the high Sharpe was a calm-weather mirage.

**Where to find it:** Portfolio Visualizer (Backtest Portfolio), Morningstar (Risk tab), Koyfin, any tool that calculates risk-adjusted returns. Use at least a 5-year window for meaningful comparison.

---

### 12. Upside/Downside Capture Ratio
**Impact Score: 8/10**

**What it measures:** Two paired ratios showing what percentage of the benchmark's gains the ETF captures during up months (upside capture) and what percentage of the benchmark's losses it suffers during down months (downside capture). Expressed relative to a benchmark, usually the S&P 500 or the ETF's stated benchmark. An ideal fund has upside capture above 100% and downside capture below 100%.

**Why it's not straightforward:** Many investors focus only on total return or Sharpe ratio, but capture ratios reveal the *asymmetry* of returns — the quality of the ride. A fund that captures 85% of upside but only 60% of downside will compound to a higher total return than one that captures 100% of both, because avoiding losses matters more than capturing gains mathematically (a 50% loss requires a 100% gain to break even). The subtle insight is that capture ratios are not fixed — they change across market regimes. A fund might have excellent downside capture during a garden-variety 10% correction but fail during a true crisis when correlations spike to 1.0.

**Examples:**
- **QUAL** (iShares MSCI USA Quality Factor) has historically captured ~98% of S&P 500 upside but only ~85% of the downside. This 13-percentage-point asymmetry compounds powerfully — over a 10-year period, QUAL delivered total returns comparable to or slightly above SPY with noticeably lower drawdowns. An investor who only compared absolute returns would see two funds that look similar; the capture ratios reveal that QUAL delivered those returns with a fundamentally better risk profile.
- **SCHD** (Schwab US Dividend Equity) shows ~90% upside capture and ~75% downside capture vs. the S&P 500 over most measured periods. During the 2022 downturn, SCHD dropped only ~5% while the S&P 500 dropped ~18% — a downside capture of ~28% for that specific period. But during 2023's tech-led rally, SCHD's upside capture was only ~55%. The lesson: SCHD's capture ratios shift dramatically depending on whether the market environment favors quality/dividend stocks or growth/momentum. A single capture ratio number hides this regime dependency.

**Where to find it:** Morningstar (Risk tab, "Upside/Downside Capture"), Portfolio Visualizer, Koyfin. Always check the benchmark used — capture ratios are meaningless if measured against the wrong benchmark.

---

### 13. Distribution Yield vs. SEC Yield (Bond ETFs)
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

### 14. Tracking Error (Standard Deviation of Daily Differences)
**Impact Score: 7/10**

**What it measures:** The standard deviation of daily return differences between the ETF and its benchmark. It measures *consistency* of tracking, not cumulative cost (that's tracking difference).

**Why it's not straightforward:** Low tracking error and low tracking difference are not the same thing. A fund can have low tracking error (consistently matches the index day-to-day) but high tracking difference (consistently underperforms by a steady amount — the expense ratio drag). Conversely, a fund can have high tracking error but zero tracking difference if the daily deviations cancel out over time. For a buy-and-hold investor, tracking difference matters more. For someone using the ETF as a hedging vehicle (where daily precision matters), tracking error is critical.

**Examples:**
- **SPY** vs. **SPLG** (SPDR Portfolio S&P 500): Both track the S&P 500. SPY has marginally lower tracking error because its massive AUM and options market ecosystem make its pricing extremely efficient. But SPLG has a better tracking difference because its 0.02% expense ratio is lower than SPY's 0.0945%. A day-trader hedging with options needs SPY's precision. A retirement saver should use SPLG and pocket the better tracking difference.
- **VWO** (Vanguard FTSE Emerging Markets) has higher tracking error than **EEM** (iShares MSCI Emerging Markets) on some days because VWO uses sampling (doesn't hold every stock in the FTSE EM index), while EEM, despite tracking a different index, is more fully replicated. But VWO's tracking difference is superior over a full year because its lower expense ratio and better securities lending outweigh the daily noise.

**Where to find it:** etf.com (Efficiency tab), Morningstar, fund annual report

---

### 15. Beta (Market Sensitivity)
**Impact Score: 7/10**

**What it measures:** The ETF's sensitivity to movements in its benchmark. A beta of 1.0 means the ETF moves in lockstep with the benchmark. Beta of 1.3 means it moves 30% more in both directions. Beta of 0.7 means it moves 30% less. It quantifies how much market risk the ETF takes relative to its benchmark.

**Why it's not straightforward:** Beta is often confused with volatility, but they're different. Volatility measures total price variation; beta measures *correlated* variation with a benchmark. A gold ETF might have high volatility but low (or even negative) beta to the S&P 500 because gold moves independently of stocks. Also, beta is not constant — it changes over market regimes. Most ETFs have higher beta during crashes (correlations spike, everything drops together) and lower beta during calm markets. Using a calm-period beta to estimate crash exposure understates the risk. Finally, beta explains outperformance: if a fund beats the S&P 500 by 3% in a year but has a beta of 1.3, it *should* outperform by 3% in an up market — it took more risk, not more skill.

**Examples:**
- **TQQQ** (ProShares UltraPro QQQ, 3x leveraged Nasdaq-100) has a beta to the Nasdaq-100 of approximately 3.0 by design. But its beta to the S&P 500 is higher — around 3.5-4.0 — because the Nasdaq-100 itself has a beta above 1.0 to the S&P 500. An investor using TQQQ for a "tactical bet on tech" is actually making a leveraged bet on the entire equity market with extra tech concentration. The S&P 500 beta reveals the true market risk, not just the Nasdaq tracking.
- **SPLV** (Invesco S&P 500 Low Volatility) has a beta of ~0.70 to the S&P 500 during normal markets. But during the March 2020 COVID crash, SPLV's realized beta spiked to ~0.85-0.90 because correlations increased across all stocks. The fund still provided protection (it fell less than SPY), but less protection than the stated beta implied. Investors who sized their portfolio based on normal-market beta were overexposed during the crash.

**Where to find it:** Morningstar (Risk tab), Portfolio Visualizer (factor regression), Koyfin, Yahoo Finance (Statistics tab). Always check which benchmark is used — beta to the S&P 500 is different from beta to the fund's stated benchmark.

---

### 16. Sortino Ratio
**Impact Score: 7/10**

**What it measures:** Similar to the Sharpe ratio, but divides excess return by *downside deviation* only — volatility from returns below a minimum acceptable threshold (usually 0% or the risk-free rate). It only penalizes harmful volatility (losses), not beneficial volatility (outsized gains).

**Why it's not straightforward:** The Sharpe ratio penalizes all volatility equally, which unfairly punishes funds that have occasional large positive returns (upside volatility). The Sortino ratio fixes this by ignoring upside volatility entirely. This makes it particularly useful for asymmetric strategies — growth ETFs that occasionally spike, or factor ETFs that deliver lumpy returns. A fund with a lower Sharpe but higher Sortino than a peer has more "good" volatility and less "bad" volatility, which is exactly what investors want. The trap is that the Sortino ratio can make leveraged or high-beta funds look attractive during bull markets because all their high volatility is upside volatility — the denominator (downside deviation) stays small until the inevitable drawdown arrives.

**Examples:**
- **AVUV** (Avantis US Small Cap Value) has a Sortino ratio significantly higher than its Sharpe ratio because small-cap value stocks tend to deliver lumpy, positively skewed returns — long periods of modest performance punctuated by sharp rallies during value rotations. The Sharpe ratio penalizes these spikes as "risk." The Sortino ratio correctly identifies them as the desirable kind of volatility. An investor who rejected AVUV based on its Sharpe ratio would miss that most of its volatility is on the upside.
- **JEPI** (JPMorgan Equity Premium Income) shows an unusually high Sortino ratio because its covered call overlay truncates upside volatility, and the premium income cushions small downside moves — resulting in low downside deviation. But the Sortino ratio is deceived by the same truncation that flatters the Sharpe: the fund has a hard ceiling on gains and an unprotected floor on losses. During a 30%+ crash, JEPI's downside deviation would spike and the Sortino would collapse. The ratio works best for comparing strategies with similar structures, not across fundamentally different strategy types.

**Where to find it:** Portfolio Visualizer (Backtest Portfolio or Factor Analysis), Morningstar (Risk tab on premium), some broker research platforms. Less commonly displayed than Sharpe — you may need to calculate it from monthly return data.

---

### 17. Rolling Returns (3-Year, 5-Year, 10-Year)
**Impact Score: 7/10**

**What it measures:** The annualized return over overlapping periods (e.g., every possible 3-year window), plotted over time. Instead of a single point-to-point return, rolling returns show the full range of investor experiences depending on when they bought and when they measured.

**Why it's not straightforward:** A fund's annualized return is one number that hides enormous variability. If a fund returned 10% annualized over 10 years, that could mean it returned ~10% every year (consistent) or it returned +40% in one year and -15% in several others (volatile). Rolling returns reveal this variability. They also expose **start-date and end-date sensitivity** — the single biggest trap in performance comparisons. Picking a 5-year window starting March 2009 (market bottom) will make any equity fund look spectacular. Starting from October 2007 (market peak) paints the opposite picture. Rolling returns show *all* possible entry points.

**Examples:**
- **VWO** (Vanguard FTSE Emerging Markets) has a 10-year annualized return of approximately 3-4% if measured from 2014-2024. That single number looks terrible. But the rolling 3-year return chart reveals periods of +15% annualized (2016-2017) and periods of -5% annualized (2021-2023). The "bad" 10-year return is driven by the specific start/end dates coinciding with EM underperformance. An investor who sees only the 10-year number concludes EM is a permanently bad investment; the rolling return chart shows it cycles between feast and famine.
- **SCHD** (Schwab US Dividend Equity) has a rolling 5-year return that has *never* been negative since inception — every possible 5-year holding period produced positive results. **ARKK**, by contrast, has rolling 3-year returns ranging from +80% annualized (2018-2020) to -35% annualized (2021-2023). The rolling return distribution shows that SCHD is a "narrow range of acceptable outcomes" fund while ARKK is a "wide range of extreme outcomes" fund — a difference that single-point returns completely hide.

**Where to find it:** Portfolio Visualizer (Rolling Returns tool), Morningstar Direct (institutional), Koyfin (charting). Most free tools show trailing returns at fixed endpoints — for true rolling analysis, Portfolio Visualizer is the best free option.

---

### 18. Factor Loadings (Fama-French 5-Factor Model)
**Impact Score: 7/10**

**What it measures:** The ETF's statistical exposure to the five academically documented return factors: market risk (beta), size (small vs. large), value (cheap vs. expensive), profitability (high vs. low), and investment (conservative vs. aggressive). A factor regression decomposes the fund's returns into what portion comes from each factor, plus an unexplained residual (alpha).

**Why it's not straightforward:** Factor loadings explain *why* an ETF performed the way it did and predict how it will behave in different environments — they are the X-ray of an ETF's true character. A "growth" ETF might have a negative value loading and a positive momentum loading, meaning it's actually a momentum bet disguised as a growth fund. Two "quality" ETFs might have completely different factor profiles — one emphasizing profitability, the other emphasizing low investment (conservative balance sheets). The subtlety is that factor loadings are estimated statistically from historical returns, so they change depending on the time period analyzed. A 3-year regression during a tech boom will show different loadings than a 10-year regression that includes a value rotation.

**Examples:**
- **SCHD** (Schwab US Dividend Equity) shows strong positive loadings on value (~0.25), profitability (~0.30), and negative loading on investment (~-0.15, meaning it favors companies with conservative investment spending). Its alpha residual after accounting for factors is near zero. This means SCHD's outperformance vs. the S&P 500 during value/quality rotations is *entirely* explained by its factor tilts — it's not stock-picking alpha, it's systematic factor exposure. An investor who already owns a value + quality factor portfolio would get redundant exposure from adding SCHD.
- **ARKK** (ARK Innovation) shows strong negative value loading (~-0.5), strong positive market beta (~1.4), and significant negative profitability loading (~-0.3). Translated: ARKK is a leveraged bet on expensive, unprofitable, high-beta growth stocks. Its massive outperformance in 2020 was predictable given that environment (falling rates, growth euphoria). Its collapse in 2022 was equally predictable (rising rates, profitability rotation). The factor loadings explain 80%+ of ARKK's return variation — Cathie Wood's stock selection explains relatively little after accounting for the factor tilts.

**Where to find it:** Portfolio Visualizer (Factor Analysis tool — free, outputs 5-factor regression for any ETF), Morningstar Direct (institutional). For a quick approximation, check the fund's P/E, P/B, and average market cap relative to the broad market — high P/E + high market cap = growth/large-cap tilt; low P/E + low market cap = value/small-cap tilt.

---

## Tier 3: Important Supporting Metrics (Score 5–6)

---

### 19. Portfolio Turnover Rate
**Impact Score: 6/10**

**What it measures:** The percentage of the fund's holdings bought or sold in a year. A 100% turnover means the fund replaced its entire portfolio over 12 months. Reported in the fund's annual report and factsheet.

**Why it's not straightforward:** High turnover doesn't automatically mean high cost — it depends on *what* is being traded. A fund that turns over 50% of a portfolio of highly liquid mega-cap stocks incurs minimal transaction costs. A fund that turns over 50% of illiquid small-cap or emerging market stocks creates significant hidden costs that show up in tracking difference. Also, turnover in an ETF wrapper is more tax-efficient than in a mutual fund because in-kind redemptions can offload low-basis shares without triggering capital gains.

**Examples:**
- **MTUM** (iShares MSCI USA Momentum) has turnover of 100-130% annually because momentum strategies, by definition, constantly rotate into recent winners and out of losers. Despite the high turnover, MTUM has distributed minimal capital gains because the ETF structure purges gains through in-kind redemptions. The turnover drives transaction costs (visible in tracking difference) but not tax costs — a distinction many investors miss.
- **AVUV** (Avantis US Small Cap Value) is actively managed with 30-40% turnover, trading small-cap stocks that cost more to trade per dollar than large-caps. Its tracking difference to its internal benchmark shows this friction. Compare to **VBR** (Vanguard Small-Cap Value) with ~15% turnover and lower transaction drag. The question is whether AVUV's active decisions add enough return to justify the higher turnover cost.

**Where to find it:** Fund annual report (SEC filing), Morningstar (Portfolio tab), etf.com

---

### 20. Duration (Bond ETFs)
**Impact Score: 6/10**

**What it measures:** The weighted average time (in years) until the bond portfolio's cash flows are received, which also serves as the approximate percentage the ETF will decline for each 1% rise in interest rates. A duration of 6 means a 1% rate hike causes roughly a 6% price drop.

**Why it's not straightforward:** Duration is an approximation that works well for small rate changes but breaks down for large moves (this non-linearity is called "convexity"). Also, duration assumes all rates across the yield curve move in parallel, which they rarely do — short rates can rise while long rates fall (a flattening curve), causing unexpected behavior. For credit bond ETFs (high yield, EM debt), spread duration — sensitivity to credit spread changes — often matters more than interest rate duration.

**Examples:**
- **TLT** (iShares 20+ Year Treasury Bond) has a duration of ~17 years. When the Fed hiked rates aggressively in 2022-2023, TLT dropped ~50% from peak — far more than naive duration math (17 x ~2.5% rate hike = ~42%) would suggest, because convexity amplifies losses on long-duration bonds at large rate moves, and rate expectations overshot.
- **BKLN** (Invesco Senior Loan) has a duration of only ~0.1 years because its floating-rate loans reset every 30-90 days. Despite holding below-investment-grade credit, BKLN is nearly immune to interest rate changes. But its *spread duration* (sensitivity to credit spreads widening) is ~4 years, meaning a credit crisis hits it hard even as Treasury duration risk is negligible. An investor who only checked interest rate duration would think BKLN was ultra-safe.

**Where to find it:** Fund factsheet, issuer website, Morningstar (Portfolio tab)

---

### 21. Credit Quality Distribution (Bond ETFs)
**Impact Score: 6/10**

**What it measures:** The breakdown of bond holdings by credit rating (AAA, AA, A, BBB, BB, B, CCC, and below). Investment grade is BBB- and above; below that is high yield / junk.

**Why it's not straightforward:** The average credit quality can mask a "barbell" distribution — a fund might show an average rating of A by holding 50% AAA and 50% BBB, or by holding 100% single-A bonds. The risk profiles are very different. The barbell portfolio has more exposure to both the safest and riskiest end of investment grade, while the pure single-A portfolio has concentrated risk at one quality level. Always look at the *distribution*, not just the average.

**Examples:**
- **AGG** (iShares Core US Aggregate Bond) shows an average credit quality of AA, which sounds ultra-safe. But its distribution is roughly 40% AAA (mostly Treasuries and agency MBS), 5% AA, 15% A, and 25% BBB, with the rest in government-backed securities. That 25% BBB allocation means a quarter of the "safe" aggregate bond fund is one notch above junk. During credit stress, the BBB tranche behaves very differently from the AAA tranche.
- **JAAA** (Janus Henderson AAA CLO) holds only the senior-most tranche of collateralized loan obligations. Despite the underlying collateral being leveraged loans (typically rated B/BB), the AAA CLO tranche has structural protections (subordination, overcollateralization) that give it AAA status. The credit quality label (AAA) is accurate but can mislead — the fund is still exposed to corporate default cycles, just with multiple layers of protection. An investor seeing "AAA" and assuming "risk-free like Treasuries" misreads the risk.

**Where to find it:** Fund factsheet, issuer website (Portfolio Characteristics section), Morningstar

---

### 22. Weighted Average Market Capitalization
**Impact Score: 6/10**

**What it measures:** The average market cap of the ETF's holdings, weighted by each position's portfolio weight. It reveals the true "size" of the companies you own — a single number that tells you whether the fund is really a large-cap, mid-cap, or small-cap portfolio regardless of its label.

**Why it's not straightforward:** Fund category labels ("large cap," "mid cap," "small cap") are defined differently by each index provider, and they drift over time. A fund labeled "mid-cap" 10 years ago might now hold companies that are firmly large-cap because its original holdings grew. The weighted average market cap cuts through the naming confusion. It also reveals hidden mega-cap concentration: two "total market" ETFs might both claim to hold the full market, but if one has a weighted average market cap of $500B (mega-cap dominated) and another has $200B (more mid-cap influence), they'll behave very differently.

**Examples:**
- **VTI** (Vanguard Total Stock Market) holds 3,600+ stocks including micro-caps, but its weighted average market cap is ~$650-750B — firmly mega-cap territory. The name says "total market" but the weighting means it behaves like a large-cap fund with a tiny small-cap garnish. Compare to **RSP** (S&P 500 Equal Weight), which holds only 500 stocks but has a weighted average market cap of ~$80-100B — squarely mid-cap. RSP, despite holding only large-cap stocks, *behaves* more like a mid-cap fund than VTI does a "total market" fund.
- **IWM** (iShares Russell 2000) is the flagship "small-cap" ETF with a weighted average market cap of ~$3-4B. Compare to **AVUV** (Avantis US Small Cap Value), which has a weighted average market cap of ~$2-3B — smaller, meaning AVUV provides deeper small-cap exposure. For investors who believe in the small-cap premium, the weighted average market cap tells you which fund actually delivers the small-cap exposure more purely.

**Where to find it:** Fund factsheet ("Portfolio Characteristics" section), Morningstar (Portfolio tab), issuer website

---

### 23. Portfolio Valuation Metrics (P/E, P/B, P/S)
**Impact Score: 6/10**

**What it measures:** The aggregate valuation ratios of the ETF's underlying holdings — price-to-earnings (P/E), price-to-book (P/B), and price-to-sales (P/S), weighted by portfolio position size. These tell you how "expensive" or "cheap" the overall portfolio is relative to its fundamentals.

**Why it's not straightforward:** Two ETFs in the same category can have dramatically different portfolio valuations, meaning you're paying very different prices for similar earnings. Also, low P/E doesn't always mean "cheap" — it can mean "the market expects declining earnings" (a value trap). High P/E doesn't always mean "expensive" — it can mean "the market expects rapid growth" (justified premium). The valuation metrics are most useful for *comparing* similar ETFs, not for making absolute judgments. Also, P/E ratios can be distorted by one-time items, and the choice of trailing vs. forward P/E changes the picture significantly.

**Examples:**
- **VTV** (Vanguard Value) has a portfolio P/E of ~15-17x, while **VUG** (Vanguard Growth) has a P/E of ~30-35x. An investor rotating from growth to value is buying roughly 2x more earnings per dollar invested. Whether that's a good deal depends on whether value stocks' lower earnings growth justifies the discount — but the magnitude of the valuation gap is a critical input to that decision.
- **VWO** (Vanguard FTSE Emerging Markets) often trades at a portfolio P/E of ~12-14x versus ~22x for **VTI** (Vanguard Total US Stock Market). The 40% valuation discount looks like a bargain until you realize EM companies often have lower profit margins, weaker governance, and higher political risk — the discount may be fully justified. But in periods when EM fundamentals improve, that valuation gap compresses and produces outsized returns. The P/E is the starting point for the analysis, not the conclusion.

**Where to find it:** Fund factsheet (Portfolio Characteristics), Morningstar (Portfolio tab), issuer website. Always check whether the P/E is trailing 12-month or forward — forward P/E is more useful for comparison but relies on analyst estimates.

---

### 24. Correlation with Existing Portfolio Holdings
**Impact Score: 6/10**

**What it measures:** The statistical correlation (ranging from -1.0 to +1.0) between the ETF's returns and the returns of other assets you already own. A correlation of 0.95 means the two move almost identically; 0.0 means they move independently; -0.50 means they tend to move in opposite directions.

**Why it's not straightforward:** Correlation is different from holdings overlap. Two ETFs can have zero holdings in common but 0.90+ correlation if their holdings are in the same sector or respond to the same macro factors. Conversely, two ETFs with significant holdings overlap might have lower correlation than expected if the non-overlapping portions are in different sectors. The critical insight is that **correlations are unstable** — they spike during crises (everything drops together) and decrease during calm markets (individual drivers dominate). A fund that shows 0.50 correlation with your portfolio in normal times might show 0.90 during the exact moments you need diversification most.

**Examples:**
- **GLD** (SPDR Gold Shares) has a correlation of approximately 0.0 to 0.15 with **SPY** (S&P 500) over 10+ year periods. This near-zero correlation makes gold one of the few genuine diversifiers in a stock-heavy portfolio. But during March 2020, gold initially fell *alongside* stocks (correlation spiked to 0.60+) as investors liquidated everything for cash. The diversification benefit returned within weeks, but the short-term correlation spike was exactly when an investor most needed protection.
- **BNDX** (Vanguard Total International Bond, hedged) has a correlation of ~0.0 to 0.1 with US equities and ~0.5 with **BND** (Vanguard Total US Bond Market). Adding BNDX alongside BND provides genuine incremental diversification because international interest rate cycles don't move in lockstep with US rates. An investor who assumed "bonds are bonds" and held only BND would miss this diversification benefit.

**Where to find it:** Portfolio Visualizer (Asset Correlation tool — free, outputs correlation matrix for any set of ETFs), Koyfin (correlation analysis), some broker research platforms

---

### 25. Number of Holdings / Effective Number of Holdings
**Impact Score: 6/10**

**What it measures:** The raw count of securities in the ETF versus the *effective* number (1 / sum of squared weights, also known as the inverse Herfindahl-Hirschman Index). The effective number captures how many holdings truly matter to the portfolio's behavior.

**Why it's not straightforward:** A fund can hold 2,000 stocks but behave like it holds 50 if the top positions dominate. The raw count gives a false sense of diversification. The effective number of holdings reveals the true diversification. For equally weighted funds, the raw and effective counts are similar. For cap-weighted funds with mega-cap dominance, the effective count can be 5-10x lower than the raw count.

**Examples:**
- **VT** (Vanguard Total World Stock) holds ~9,800 stocks across 49 countries — the broadest equity ETF available. But its effective number of holdings is roughly 150-200, because US mega-caps dominate. The top 10 holdings (all US tech) represent ~18% of the fund. An investor owning VT for "maximum global diversification" is still getting a portfolio whose short-term returns are largely driven by a handful of American technology companies.
- **RSP** (Invesco S&P 500 Equal Weight) holds the same 500 stocks as SPY but gives each 0.20% weight. Its effective number of holdings is ~480 (close to the raw count), versus SPY's effective ~100-120. This means RSP's returns are genuinely driven by broad market health, not mega-cap performance. During 2022's narrow market (few stocks driving index returns), RSP significantly underperformed SPY precisely because its "true" diversification prevented it from being concentrated in the few winners.

**Where to find it:** Fund factsheet (raw count), Morningstar (raw count). Effective number requires calculation: download the holdings file and compute 1/Σ(w²). Alternatively, compare top-10 weight as a proxy — above 30% signals the effective count is far below the raw count.

---

### 26. Sector and Geographic Concentration vs. Benchmark
**Impact Score: 6/10**

**What it measures:** How much the ETF's sector and country weights deviate from a broad market benchmark. An "overweight" in technology or an "underweight" in healthcare represents an active bet relative to the market.

**Why it's not straightforward:** Every ETF makes implicit sector/geographic bets, even passive index funds. A dividend ETF will structurally overweight financials, utilities, and energy (high-dividend sectors) and underweight technology and healthcare (low-dividend sectors). This isn't a choice by the fund manager — it's a mathematical consequence of the dividend screening. Investors who don't check sector weights may inadvertently double up on sectors they already own or miss sectors they think they have.

**Examples:**
- **SCHD** (Schwab US Dividend Equity) has ~0% allocation to real estate and utilities — two sectors that investors often expect in a "dividend" fund. Its quality screens filter them out because utilities have high payout ratios with low earnings growth, and many REITs fail the cash-flow-to-debt test. An income investor who buys SCHD expecting traditional dividend sector exposure would need to add separate utility and REIT ETFs to fill the gap.
- **VEA** (Vanguard FTSE Developed Markets) has ~20% allocation to Japan, ~15% to the UK, and only ~6% to Germany. An investor who buys VEA for "European exposure" might not realize that Japan is the largest position — and that European countries are weighted by market cap, not economic size. Germany, the EU's largest economy, gets a fraction of the UK's weight because the London Stock Exchange lists more companies at higher valuations.

**Where to find it:** Fund factsheet (sector/country breakdown), Morningstar (Portfolio tab), etf.com

---

### 27. Fund Age / Inception Date
**Impact Score: 5/10**

**What it measures:** How long the ETF has been in operation. Older funds have longer track records, more proven tracking, and lower closure risk.

**Why it's not straightforward:** A new ETF isn't automatically bad — it might be the first to offer a genuinely useful strategy. But backtested performance (shown before the fund existed) is always better than live performance because it's optimized with hindsight. Any return data shown before the inception date is hypothetical and should be treated with deep skepticism. The real question isn't just how old the fund is, but how old it is relative to its category. Being the first dividend ETF (VIG, launched 2006) is different from being the 47th (launched 2023 to chase the trend).

**Examples:**
- **JEPI** (JPMorgan Equity Premium Income) launched in May 2020 and grew to $30B+ AUM within 3 years — unprecedented growth for an active ETF. But its entire track record exists within a specific market regime (post-COVID recovery, then inflation/rate hikes). Its covered call strategy has never been tested through a sustained multi-year bear market followed by a sharp V-recovery (where capped upside would severely hurt). Investors extrapolating JEPI's income and returns forward are relying on a 3-year sample in unusual conditions.
- **BITO** (ProShares Bitcoin Strategy ETF) launched in October 2021, weeks before Bitcoin's all-time high. Its first year produced a -60%+ return. Investors who saw the "first Bitcoin ETF" novelty without questioning timing bought at the worst moment. A fund's launch timing — whether it rides a trend peak or starts during a trough — shapes the experience of early investors and the narrative around the fund for years.

**Where to find it:** Any ETF screener, fund factsheet, etfdb.com

---

### 28. Average Daily Dollar Volume
**Impact Score: 5/10**

**What it measures:** The average number of shares traded per day multiplied by the share price — the total dollar value of daily trading activity. More useful than share volume because it normalizes for share price differences.

**Why it's not straightforward:** High daily volume doesn't always mean the ETF is liquid for your purposes, and low volume doesn't always mean it's illiquid. ETF liquidity is ultimately backed by the liquidity of the underlying holdings (because APs can create/redeem shares). An ETF with $1M daily volume that holds S&P 500 stocks can handle a $500K order efficiently because the AP can easily trade the underlyings. An ETF with $50M daily volume that holds illiquid frontier market bonds may struggle to handle the same order without significant market impact.

**Examples:**
- **IEFA** (iShares Core MSCI EAFE) trades ~$500M daily — highly liquid by any measure. But because it holds stocks across 20+ international markets, some in different time zones, spreads widen during US morning hours when European markets are closed and Asian markets haven't opened. The high daily volume metric masks intraday liquidity variation.
- **DFAC** (Dimensional US Core Equity) trades relatively low volume (~$30-50M daily) but holds large, highly liquid US stocks. A $200K order would execute cleanly with a tight spread because the AP can instantly hedge using the underlying holdings. An investor scared off by the low volume would miss a perfectly viable fund.

**Where to find it:** Yahoo Finance, etf.com, your broker's research page

---

### 29. Capital Gains Distribution History
**Impact Score: 5/10**

**What it measures:** Whether the ETF has distributed taxable capital gains to shareholders in prior years, and if so, how much. Ideally: zero.

**Why it's not straightforward:** Most broad index ETFs have never distributed capital gains, thanks to the in-kind creation/redemption mechanism. But not all ETFs are equally tax-efficient. Active ETFs with high turnover, bond ETFs that realize gains when bonds are sold, and funds tracking indices with frequent reconstitution can and do distribute capital gains. The capital gains distribution is particularly insidious because it taxes *all* current shareholders on gains from past activity — including investors who bought after the gains accrued.

**Examples:**
- **QUAL** (iShares MSCI USA Quality Factor) distributed a large capital gain in December 2021, surprising investors who assumed all iShares ETFs were tax-efficient. The distribution was triggered by a major index reconstitution that forced the fund to sell appreciated holdings. Investors who bought QUAL in November 2021 received — and owed taxes on — capital gains from appreciation that occurred before they owned the fund.
- **VTI** (Vanguard Total Stock Market) and virtually all Vanguard equity index ETFs have distributed zero capital gains for years. This isn't luck — Vanguard's dual share-class structure (ETF shares and Admiral shares exist in the same fund) gives the portfolio manager more flexibility to use in-kind redemptions to purge low-cost-basis lots. This structural advantage is unique to Vanguard since their patent expired and other issuers began adopting similar approaches.

**Where to find it:** Fund's distribution history page on issuer website, Morningstar (Tax tab), IRS Form 8937 for return of capital classifications

---

### 30. Dividend Growth Rate
**Impact Score: 5/10**

**What it measures:** The annualized rate at which the ETF's per-share distributions have grown over time (1-year, 3-year, 5-year, and 10-year growth rates). For dividend-focused ETFs, this measures whether your income stream is growing, stagnating, or shrinking in real terms.

**Why it's not straightforward:** Most income investors focus on current yield — how much the fund pays today — and ignore whether that payment is growing. But for long-term investors, dividend growth rate determines your *future* yield on cost and whether your income keeps pace with inflation. A fund yielding 2% today with 10% annual dividend growth will yield 5.2% on your original investment in 10 years. A fund yielding 5% today with 0% growth will still yield 5% in 10 years — and inflation will have eroded its purchasing power by 25-30%. The subtlety is that dividend growth can be lumpy (one special dividend inflates the growth rate) and can be negative (dividend cuts during recessions). The 5-year growth rate smooths out noise.

**Examples:**
- **VIG** (Vanguard Dividend Appreciation) yields only ~1.8%, which looks unattractive next to **SPYD** (SPDR S&P 500 High Dividend) at ~4.5%. But VIG's 5-year dividend growth rate is ~8-10% annually, while SPYD's is ~2-3%. In 10 years, VIG's yield on cost will likely exceed SPYD's current yield, and VIG's total return (price appreciation + growing dividends) will almost certainly beat SPYD's total return. The current yield comparison is a snapshot; the dividend growth rate tells the movie.
- **SCHD** (Schwab US Dividend Equity) had a 5-year dividend growth rate of ~12-13% through 2023, which made it the darling of income investors. But a significant portion of that growth came from 2021's outsized special distributions. The 10-year dividend growth rate is closer to ~8-9%, which is still excellent but tells a different story than the cherry-picked 5-year figure. Always check multiple time horizons.

**Where to find it:** Seeking Alpha (Dividend History tab, calculates growth rates), issuer website (distribution history, calculate manually), etf.com. For precise calculation: compare the trailing 12-month dividend per share from 5 years ago to today and annualize.

---

### 31. Information Ratio
**Impact Score: 5/10**

**What it measures:** The ETF's active return (return above the benchmark) divided by its tracking error (volatility of the difference between fund and benchmark returns). It measures how efficiently the fund converts its deviations from the benchmark into excess returns. A higher information ratio means the fund is consistently adding value when it deviates, rather than just adding noise.

**Why it's not straightforward:** The information ratio is the gold standard for evaluating active ETFs and smart beta strategies, but it's meaningless for passive index trackers (which aim for zero deviation). A positive information ratio means the fund's active decisions added value on a risk-adjusted basis; a negative one means the deviations destroyed value. The ratio is highly sensitive to the choice of benchmark — an active ETF might show a great information ratio versus the S&P 500 but a poor one versus a more appropriate style benchmark. Also, like all ratios based on historical data, a high information ratio over 3 years can deteriorate rapidly if the manager's edge disappears or the market regime shifts.

**Examples:**
- **AVUV** (Avantis US Small Cap Value) has a high information ratio (~0.5-0.8) versus the Russell 2000 Value Index because its active tilts (toward higher profitability within small-cap value) have consistently added value above the passive benchmark with relatively low tracking error. This suggests the fund's deviations are deliberate and productive — not random noise. Compare to a generic active small-cap fund with a 0.1 information ratio, where the manager deviates a lot but adds almost no net value.
- **ARKK** (ARK Innovation) has had an information ratio that swung from strongly positive (2019-2020, massive outperformance) to deeply negative (2021-2023, massive underperformance). The multi-year information ratio is near zero, meaning that despite enormous deviations from any benchmark, ARKK has not consistently added value. The high tracking error generated both spectacular gains and spectacular losses — the information ratio reveals that this was volatility, not skill.

**Where to find it:** Morningstar (Risk tab on premium — listed as "information ratio"), Portfolio Visualizer (Factor Analysis), institutional platforms. For a quick proxy: divide the fund's alpha by its tracking error using data from the fund factsheet.

---

### 32. Securities Lending Revenue
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
| 6 | Maximum Drawdown | 9 | Risk tolerance assessment |
| 7 | Bid-Ask Spread (Median) | 8 | Frequent traders, large orders |
| 8 | Premium/Discount to NAV | 8 | Bond ETFs, international ETFs |
| 9 | Tax Cost Ratio | 8 | Taxable accounts |
| 10 | Top 10 Concentration | 8 | Cap-weighted ETFs |
| 11 | Sharpe Ratio | 8 | Comparing across risk levels |
| 12 | Upside/Downside Capture | 8 | Quality of return profile |
| 13 | Distribution vs. SEC Yield | 7 | Bond and income ETFs |
| 14 | Tracking Error | 7 | Hedging, options strategies |
| 15 | Beta | 7 | Understanding market sensitivity |
| 16 | Sortino Ratio | 7 | Asymmetric strategies |
| 17 | Rolling Returns | 7 | Start/end-date sensitivity |
| 18 | Factor Loadings | 7 | Smart beta, active ETFs |
| 19 | Portfolio Turnover | 6 | Active ETFs, factor ETFs |
| 20 | Duration | 6 | Bond ETFs |
| 21 | Credit Quality Distribution | 6 | Bond ETFs |
| 22 | Weighted Avg Market Cap | 6 | True size exposure |
| 23 | Portfolio Valuation (P/E, P/B) | 6 | Value vs. growth assessment |
| 24 | Correlation with Holdings | 6 | True diversification benefit |
| 25 | Holdings Count (Effective) | 6 | Diversification assessment |
| 26 | Sector/Geo Concentration | 6 | Non-obvious tilts |
| 27 | Fund Age | 5 | New/thematic ETFs |
| 28 | Daily Dollar Volume | 5 | Large orders |
| 29 | Capital Gains History | 5 | Taxable accounts |
| 30 | Dividend Growth Rate | 5 | Income ETFs, long-term yield |
| 31 | Information Ratio | 5 | Active and smart beta ETFs |
| 32 | Securities Lending Revenue | 5 | Explaining tracking difference |
