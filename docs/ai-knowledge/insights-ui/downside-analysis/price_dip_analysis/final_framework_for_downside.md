# How to Evaluate Downside Risk in Stocks — A Complete Framework

*Written for anyone, including those new to finance. No jargon without explanation.*

---

## What This Framework Answers

**"A stock I own (or want to buy) has dropped significantly. How much further can it fall?"**

This framework combines five steps of analysis, each answering a different question:

| Step | Question It Answers |
|------|-------------------|
| **0. Gather the Basics** | "What does this company do, and what are the key financial facts?" |
| **1. Scenario Modeling** | "What could go wrong (or right), and what's the probability?" |
| **2. Stress Test Matrix** | "Which specific business driver matters most for this stock?" |
| **3. Precedent Drawdown** | "Has this type of decline happened before, and how did it end?" |
| **4. Competitive Landscape** | "Can anyone take this company's customers?" |
| **5. Combine & Score** | "What's the final weighted expected price and rating?" |

---

## Where to Find the Data

All data is available free. Use these specific URLs (replace `[TICKER]` and `[name]` with the stock's ticker and company name):

| Data Needed | URL | What You Get |
|------------|-----|--------------|
| Income statement, balance sheet, cash flow | `stockanalysis.com/stocks/[TICKER]/financials/` | Revenue, net income, EBITDA, debt, cash, shares outstanding |
| Key ratios (PE, EV/EBITDA, margins, ROIC) | `stockanalysis.com/stocks/[TICKER]/financials/ratios/` | All valuation and profitability ratios |
| 10-year PE history | `macrotrends.net/stocks/charts/[TICKER]/[name]/pe-ratio` | Historical PE for valuation regime check |
| 10-year EV/EBITDA history | `macrotrends.net/stocks/charts/[TICKER]/[name]/ev-ebitda` | Historical EV/EBITDA for regime check |
| Current price, 52-week range, market cap | `finance.yahoo.com/quote/[TICKER]/` | Real-time price data |

**Rule: All valuation ratios MUST be calculated at the current stock price at time of writing. Never use stale ratios from a prior price level.** If stockanalysis.com shows a PE based on yesterday's close and the stock moved 5%+ today, recalculate: PE = Current Price / TTM EPS.

---

## Step 0: Gather the Basics

**Goal:** Collect every data point you need before analysis begins.

**Inputs:** Ticker symbol, access to the URLs above.

**Steps:**

1. Look up the company and write one sentence on what it sells, to whom, and in which geography.
2. Identify the **exact sub-industry** (not "tech" — say "Southeast Asian e-commerce marketplace + fintech lending + mobile gaming").
3. Record: current price, ATH, 52-week high, % decline from each.
4. Record the key financials table below using stockanalysis.com.
5. Record the key ratios table below. **Recalculate any ratio if the price has moved materially from the source's reference price.**

### Key Financial Numbers

| What to Find | Why It Matters | Where to Find |
|-------------|---------------|---------------|
| **Revenue** (total sales) | Is the business growing or shrinking? | Income statement |
| **Revenue growth** (% YoY) | Speed of growth/decline | Income statement |
| **Net income** (profit after all expenses) | Is the company making money? | Income statement |
| **EBITDA** (earnings before interest, taxes, depreciation) | Operating profitability before accounting adjustments | Income statement |
| **Free cash flow (FCF)** | Actual cash the business generates after spending on equipment | Cash flow statement |
| **Total debt** | How much the company owes | Balance sheet |
| **Cash on hand** | How much cash it has | Balance sheet |
| **Shares outstanding** | How many shares exist (more shares = each share is worth less) | Key statistics |

### Key Ratios

| Ratio | What It Means (Plain English) | Good | Okay | Expensive |
|-------|------------------------------|------|------|-----------|
| **PE ratio** | "How many years of earnings am I paying for?" | <15x | 15-25x | >25x |
| **EV/EBITDA** | "How many years of operating profit does the whole company cost?" | <10x | 10-15x | >15x |
| **Debt/EBITDA** | "How many years would it take to pay off all debt from operating profit?" | <2x | 2-3x | >3x |
| **FCF yield** | "If I buy the whole company, what % of my purchase price comes back as cash each year?" | >7% | 4-7% | <4% |
| **ROIC** | "For every dollar invested in the business, how many cents of profit does it generate?" | >12% | 8-12% | <8% |

*Note: These ranges are general benchmarks. Software companies often trade at higher PEs. REITs use P/FFO. Banks use P/Book. Adjust for the industry.*

**Output:** A filled-in data sheet with all numbers, ratios, and price history ready for Steps 1-5.

---

## Step 1: Scenario Modeling — "What Could Happen?"

**Goal:** Build 4 realistic futures for the company, each grounded in specific product-level stories, and calculate a probability-weighted expected price.

**Inputs:** Company's top 2-3 revenue-generating products/services, competitive dynamics for each, current financial metrics from Step 0.

**Steps:**

1. **Identify the top 2-3 revenue-generating products or services.** Not vague segments — the actual products customers buy.

| Company | Don't Say | Say Instead |
|---------|-----------|-------------|
| SE | "E-commerce segment" | "Shopee marketplace (GMV $127B), SeaMoney lending ($9.2B loan book), Garena/Free Fire gaming ($1.9B bookings)" |
| BROS | "Coffee revenue" | "Drive-thru beverages in Western US (1,136 stores, $2.1M AUV), new market expansion (East Coast via Clutch acquisition)" |
| ZBRA | "Enterprise products" | "Mobile computers for warehouses (40-50% market share), barcode scanners, enterprise software/services (recurring)" |
| DUOL | "Subscription revenue" | "Duolingo Plus/Max subscriptions (15M paid subs), English test (Duolingo English Test), ad-supported free tier (135M MAU)" |
| ZTS | "Companion animal" | "Apoquel/Cytopoint derm franchise (~$2B), Simparica Trio parasiticide, livestock vaccines" |

2. **For each product/service, understand the competitive dynamics.** Who is the direct competitor? What could go wrong? What could go right?

3. **Build 4 scenarios by constructing a real story for EACH product/service.** Each scenario is the combination of what happens across all products.

| Scenario | What It Means | Typical Probability |
|----------|---------------|-------------------|
| **Bull case** | Most products beat expectations | 10-20% |
| **Base case** | Products perform roughly as guided | 25-35% |
| **Bear case** | 1-2 key products face real problems | 30-40% |
| **Severe bear** | Multiple products deteriorate simultaneously + macro amplifies | 15-25% |

4. **Include 2-3 sub-scenarios under each case.** Different combinations of product outcomes that lead to the same overall result.

5. **For each scenario, estimate a price range.** Use: Price = EPS x PE, or Price = (EBITDA x EV/EBITDA - Net Debt) / Shares.

6. **For each scenario's ratio impacts, apply the overlap discount.** When multiple negative (or positive) factors hit simultaneously, they don't add linearly. **Use 60% of the raw ratio-impact sum for ALL scenarios. Do not vary this number.**

   > Example: If EV/EBITDA compression = -29%, EPS decline = -15%, lending provision spike = -10%, raw sum = -54%. Apply 60%: -54% x 0.60 = -32%. Price impact = -30 to -35%.

7. **Calculate the weighted expected price.** MUST show this math explicitly:

   > **Weighted Expected Price = (Bull midpoint x Bull prob) + (Base midpoint x Base prob) + (Bear midpoint x Bear prob) + (Severe midpoint x Severe prob)**
   >
   > Example for SE at $79:
   > - Bull midpoint $122.50 x 10% = $12.25
   > - Base midpoint $85.00 x 25% = $21.25
   > - Bear midpoint $51.00 x 40% = $20.40
   > - Severe midpoint $34.00 x 25% = $8.50
   > - **Weighted Expected Price = $62.40**
   >
   > Implied further move from $79: -21%

**Rules:**
- Probabilities MUST sum to 100%.
- Use probability ranges in the narrative (e.g., "30-40%") but pick a single point estimate for the weighted calculation.
- Every scenario MUST name a specific competitor, product, customer, or event. "Macro deteriorates" is not a scenario.
- Trace the causal chain: Product story -> Revenue/margin impact -> Valuation change -> Price.
- Include a time horizon (default: next 12 months).
- The weighted expected price calculation MUST appear in the report, not just the result. The reader must be able to verify the math.

**Output:** 4 scenarios with sub-scenarios, price ranges, probabilities, and a weighted expected price with the calculation shown.

### Worked Example: Sea Limited (SE) at $79

**Top 3 revenue drivers:**
1. **Shopee** (e-commerce, ~60% of revenue, $127B GMV)
2. **SeaMoney** (fintech/lending, ~21% of revenue, $9.2B loan book growing 80% YoY)
3. **Garena** (gaming, ~10% of revenue, Free Fire)

---

**Bull Case (10-15% probability) — Price target: $115-130**

*Sub-scenario B1: "TikTok Shop stumbles on regulation"*
- Indonesia/Vietnam tighten social commerce regulations (already proposed in Indonesia)
- Shopee regains 3-5pp of GMV share, EBITDA margin improves to 3-4%
- SeaMoney NPLs stay at 1.1%, lending profit grows 40%+
- Free Fire 2.0 content cycle extends engagement

*Sub-scenario B2: "Lending becomes the growth engine"*
- Shopee GMV grows 25% (as guided, nothing special)
- But SeaMoney cross-sells insurance + banking to Shopee's merchant base -> revenue diversification
- Credit quality holds because SEA employment is strong
- Market re-rates SE as a fintech platform, not just e-commerce

---

**Base Case (25-30% probability) — Price target: $79-91**

*Sub-scenario Ba1: "Guidance met, nothing changes"*
- Shopee GMV +25%, take rate stable, EBITDA "no lower than 2025"
- SeaMoney revenue +40% but provisions rise proportionally -> flat EBITDA contribution
- Garena bookings flat post-content burst
- Market says "show me the profit" — stock treads water

*Sub-scenario Ba2: "Shopee beats but lending worries offset"*
- Shopee GMV +30% (beats guidance), gaining in LatAm markets
- But SeaMoney NPLs tick up to 1.5%, provisions +30% — analysts raise credit risk flag
- Net effect: revenue beats, but margin concern keeps multiple at 16-18x

---

**Bear Case (35-40% probability) — Price target: $50-65**

*Sub-scenario Be1: "TikTok Shop takes Shopee's lunch in Indonesia"*
- TikTok Shop gains 5-8pp of GMV share in Indonesia (SE's largest market, 40% of Shopee GMV)
- Shopee increases S&M subsidies to defend -> EBITDA margins go back toward zero
- Revenue grows 15-20% but costs grow faster
- SeaMoney performs fine but can't offset Shopee margin erosion

*Sub-scenario Be2: "Lending cycle turns"*
- Shopee holds share (TikTok Shop growth stalls)
- But SEA consumer credit weakens: NPLs rise from 1.1% to 2.0-2.5%
- $9.2B loan book x 1.5pp NPL increase = $138M additional provisions
- Market panics about "the next Ant Financial" — multiple compresses to 12-14x

*Sub-scenario Be3: "Both hit simultaneously"*
- Shopee loses share AND SeaMoney NPLs spike
- Garena bookings decline QoQ as Free Fire engagement fades
- All three engines stall -> stock re-tests 2022 lows

---

**Severe Bear (15-20% probability) — Price target: $35-48**

*Sub-scenario S1: "Regulatory crackdown + credit crisis"*
- Indonesia bans foreign e-commerce platforms or imposes punitive taxes
- SEA-wide consumer credit contraction (rate hikes, unemployment spike)
- SeaMoney forced to slow lending, write down loan book
- Garena faces gaming regulation in key markets

*Sub-scenario S2: "Cash burn spiral"*
- To fight TikTok Shop, Shopee reverts to heavy subsidies (2019-era cash burn)
- $4.5B FCF turns to near-zero as SE prioritizes market share defense
- Market treats SE as "back to growth at any cost" — multiple collapses to 8-10x EBITDA

---

**Why this approach is better than "revenue declines 20%":**
- Each sub-scenario points to a **specific competitor, product, or event** you can monitor
- You can check quarterly: "Is TikTok Shop actually gaining share?" "Are NPLs rising?" "Is Free Fire engagement holding?"
- The financial numbers (revenue growth, margins, multiples) are **outputs** of the story, not inputs
- Different sub-scenarios within the same case can have different monitoring triggers

### Worked Example: AutoZone (AZO) at $3,115

**Top 3 revenue drivers:**
1. **DIY retail** (Do-It-Yourself, ~75% of domestic revenue — consumers buying parts to fix their own cars)
2. **DIFM / commercial** (Do-It-For-Me, ~30% of revenue — professional mechanics buying parts for customer repairs)
3. **International** (Mexico + Brazil, ~15% of revenue, growing faster than US)

---

**Bull Case (20-25% probability) — Price target: $3,600-3,900**

*"Recession drives repair over replace"*
- US recession pushes consumers to repair aging cars instead of buying new ones
- 12.6-year average car age -> massive installed base needing parts
- DIY same-store sales accelerate +4-6% (consumers trading down from dealer service)
- DIFM grows as independent mechanics gain share from dealers
- Tariffs on Chinese auto parts benefit AZO (domestic inventory advantage)

---

**Base Case (35-40% probability) — Price target: $3,100-3,400**

*"Steady as she goes"*
- DIY grows 1-3% (normal range), DIFM grows 5-8% (continuing share gains)
- International grows 10%+ but is still a small contributor
- LIFO charges normalize ($200M -> $100M) as supply chain deflation arrives
- Buyback machine continues ($5B+/year), EPS grows 8-12%

---

**Bear Case (25-30% probability) — Price target: $2,600-2,900**

*Sub-scenario Be1: "Tariff cost absorption kills margins"*
- US tariffs on auto parts (25%+ on Chinese imports) hit AZO's COGS
- AZO can pass through 60-70% but absorbs the rest -> gross margin contracts 100-150 bps
- Revenue fine, but earnings miss for 2-3 quarters
- Multiple compresses from 18x to 15x -> stock falls 15-20%

*Sub-scenario Be2: "Amazon cracks auto parts"*
- Amazon expands same-day delivery for auto parts in 20+ markets
- DIY customers (less brand-loyal, price-sensitive) shift 3-5% of purchases online
- DIFM business is immune (mechanics need parts in 30 minutes, not 2 hours)
- Slow bleed, not collapse — 2-3% annual revenue headwind

---

**Severe Bear (10-15% probability) — Price target: $2,200-2,500**

*"EV adoption accelerates faster than expected"*
- Federal EV subsidies + cheap Chinese EVs -> new car sales boom
- Average car age drops from 12.6 to 11 years over 3 years
- DIY volume declines 5-8% as newer cars need less repair
- This is the 15-20 year structural risk arriving early — unlikely but not impossible

---

**Notice the difference:** AZO's bull case is a *specific economic story* (recession -> repair over replace), not "revenue grows 5%." The bear case isn't "margins compress" — it's "tariffs on Chinese auto parts force AZO to absorb costs it normally passes through."

### How to Check If Your Scenarios Are Good Enough

Ask yourself these 3 questions for each scenario:

1. **"Could I write a headline for this?"** If your bear case is "revenue declines and margins compress," that's not a scenario — it's a financial outcome. A real scenario: "TikTok Shop captures 8% of Indonesian e-commerce GMV, forcing Shopee into a subsidy war." That's a headline.

2. **"Can I monitor this in real time?"** Each sub-scenario should point to something you can track quarterly: a competitor's store count, a market share report, an NPL ratio, an FDA decision. If you can't monitor it, you can't update your probabilities.

3. **"Does this story have a specific competitor, customer, product, or event?"** Vague scenarios ("macro deteriorates") are useless. Name the competitor. Name the product. Name the market. Specificity forces intellectual honesty.

---

## Step 2: Stress Test Matrix — "Which Variable Matters Most?"

**Goal:** Isolate the 2 most important business drivers and show how the stock price changes across a range of combinations. Justify the base multiple used.

**Inputs:** Key financial metrics from Step 0, scenario ranges from Step 1, historical multiple data from macrotrends.net.

**Steps:**

1. **Pick the 2 most important variables.** Usually:
   - **Revenue** (or a driver like GMV, subscribers, units shipped)
   - **Margin** (gross, EBITDA, or operating margin)
   Sometimes the second variable is a **valuation multiple** (PE or EV/EBITDA) if sentiment/re-rating is the main risk.

2. **Justify the base multiple.** MUST state:
   - The base EV/EBITDA (or PE) multiple used in the matrix
   - Why you chose it (sector median, 5-year historical average, or peer comparison)
   - What the current stock price implies at that multiple
   
   > Example for SE: "Base multiple: 16x EV/EBITDA. Rationale: SE's 3-year median is 17x, Southeast Asian internet peers (Grab, GoTo) trade at 12-18x. Current price of $79 implies ~$3.0B EBITDA at 15x or ~$2.5B at 18x."

3. **Valuation regime check.** Before building the matrix:
   - Compare the stock's average PE (or EV/EBITDA) over the **last 5 years** vs. the **prior 5 years** (use macrotrends.net)
   - If the multiple expanded **>25%**, decompose the price rise into earnings growth vs. multiple expansion
   - The portion explained by business improvement (faster growth, higher margins, stronger market position) is the **new justified floor**. The rest is air that can revert.
   - For the severe-case corner of the matrix, use the **pre-expansion average multiple** — not just the bottom of the recent range
   - If both the multiple AND margins are at historical highs, flag **double reversion risk** — both can compress simultaneously

   > Example — AZO: Average PE was ~16x in 2016-2020, expanded to ~20x+ in 2021-2025. Some justified (DIFM growth engine, aging fleet). But severe floor of 18x may be too generous — 15-16x is a more honest severe case, dropping floor from $2,070 to ~$1,840.

4. **Define a realistic range for each variable.** Use 4 columns (worst, below-guide, guidance, above-guide) and 4 rows (different margin or multiple levels).

5. **Calculate the stock price at each intersection.**
   > For most companies: Price = ((Revenue x Margin x EV/EBITDA) - Net Debt) / Shares Outstanding
   > For simple earnings-driven stocks: Price = EPS x PE
   > For REITs: Price = FFO/share x P/FFO
   > For BDCs: Price = Book Value x P/Book

6. **Read the matrix.** Key questions:
   - Where is the current price? (What the market already expects)
   - What's the floor? (Worst-case corner)
   - Which axis moves the price more? (The variable to watch)

**Rules:**
- MUST state and justify the base multiple before presenting the matrix.
- MUST perform the valuation regime check. If data unavailable, state "regime check skipped — insufficient historical data" and explain.
- The severe-case corner MUST use a defensible trough multiple, not an arbitrary round number.

**Output:** A justified base multiple, a completed price matrix, and a statement of which variable matters more and where the current price sits.

### Worked Example: ZBRA at $202

Using Revenue x EBITDA Margin at 12x EV/EBITDA:

| | Margin 14% | Margin 16% | Margin 18% | Margin 20% |
|---|---|---|---|---|
| Rev $5.0B | **$120** | $143 | $167 | $190 |
| Rev $5.4B | $133 | $158 | $184 | $209 |
| Rev $5.9B | $149 | $177 | **$205** <- current | $232 |

**Reading this:** Current price implies $5.9B revenue at 18% margin. Moving from 18% to 14% margin (same revenue) drops the stock from $205 to $149 (-27%). Moving revenue from $5.9B to $5.0B (same margin) drops it to $167 (-19%). **Margin matters 1.4x more than revenue for ZBRA.**

---

## Step 3: Precedent Drawdown — "Has This Happened Before?"

**Goal:** Ground your analysis in real historical episodes, not just models.

**Inputs:** Current stock decline data, knowledge of similar companies and past crises.

**Steps:**

1. **Find 3-5 historical episodes** where the same type of problem hit this stock or similar companies.

| Current Problem | Look For |
|----------------|----------|
| Tariff/margin pressure | Same stock's reaction to past tariffs, or peer stocks in tariff-affected industries |
| Growth deceleration | Other growth stocks that decelerated (Netflix 2022, Meta 2022, Peloton 2021) |
| Leverage stress | Similar leveraged companies in past downturns (2008, 2020) |
| New competition | Past competitive disruptions in the same industry |

2. **Measure the peak-to-trough decline** in each historical episode.

3. **Assess comparability:** Is the current situation more severe, less severe, or about the same?

| Factor | Current vs. Past |
|--------|-----------------|
| Is revenue growing or declining? | Growing = less severe |
| Is leverage higher or lower? | Higher = more severe |
| Is the company profitable? | Yes = less severe |
| Is the competitive threat new/unprecedented? | Yes = less comparable |

4. **Determine if the stock has already overshot or has room to match the precedent.**
   - Fallen MORE than precedent -> decline may be overdone -> less further downside
   - Fallen LESS -> room to fall further

**Rules:**
- MUST include at least one precedent from the same stock's own history (if available).
- MUST include at least one precedent from a peer/comparable company.
- For each precedent, state whether the moat was intact during that drawdown. Precedents where the moat was intact (Netflix 2022, Meta 2022) do NOT apply to stocks whose moats are currently being eroded.

**Output:** A precedent table with 3-5 episodes, peak-to-trough declines, and an assessment of whether current decline has room to match or has already overshot.

---

## Step 4: Competitive Landscape & Moat — "Can Anyone Take Their Customers?"

**Goal:** Assess competitive position, score the moat, and quantify revenue at risk from competition.

**Inputs:** Sub-industry identification, competitor research, market share data.

**Steps:**

**4A. Identify the exact sub-industry.** Be specific. Not "technology" — say "enterprise barcode scanners for warehouse workers" or "drive-thru specialty coffee in the western U.S."

**4B. Find the company's market share and top 3-5 direct competitors.**

**4C. Assess the competitive moat.** A moat prevents competitors from taking customers.

| Moat Type | What It Means | Strength | Example |
|-----------|--------------|----------|---------|
| **Regulatory monopoly** | Government charter or license prevents competition | Very Strong | AGM (only ag mortgage GSE) |
| **Physical/location** | Can't be replicated physically | Very Strong | CRH (quarries take 7-10 years to permit) |
| **Switching costs** | Customers face high costs/pain to switch | Strong | ZBRA (enterprise software ecosystem) |
| **Network effects** | Product gets better as more people use it | Moderate-Strong | ZG (more users -> more agents -> more data) |
| **Brand/culture** | Customers buy because of emotional connection | Moderate | BROS (drive-thru coffee culture) |
| **Cost advantage** | Produces at lower cost than competitors | Moderate | TGLS (Colombian labor advantage) |
| **None / Low switching costs** | Customers can easily switch | Weak | FRSH (mid-market SaaS) |

**4D. Identify the bear case competitive scenario.** What specific threat could erode the moat in 2-3 years?

**4E. Score moat strength (0-5).** 5/5 = monopoly or irreplaceable position, 0/5 = no moat, existential competitive risk.

**4F. Quantify competitive revenue risk from the top 2 direct competitors.**

This is the step most investors skip. Don't just say "competition is a risk." Calculate how much revenue competitors could realistically take.

**Revenue risk rules by moat strength:**
- **Moat 0-2:** MUST include a dollar revenue-at-risk estimate. Follow the chain below.
- **Moat 3:** Include a dollar revenue-at-risk estimate if competitive threat is a core scenario in Step 1. Otherwise, a qualitative assessment is acceptable.
- **Moat 4-5:** State "competitive displacement risk is minimal due to [moat type]" and skip quantification.

**How to quantify (for moat 0-3):**

1. Identify the top 2 most direct competitors — the ones most likely to take THIS company's customers.
2. Estimate the competitor's growth trajectory: growth rate, markets entered, share trend.
3. Calculate revenue at risk:
   ```
   Competitor takes X percentage points of market share
   -> That equals $Y in lost revenue
   -> At the current valuation multiple, $Y revenue loss = Z% stock price decline
   -> Timeline: when does this happen?
   ```
4. Check if it's already happening: declining same-store sales, competitor customer wins, management acknowledging competitor on earnings calls, segment deceleration.

**Example — Dutch Bros (BROS) vs. 7 Brew:**

```
7 Brew opened 280+ stores in 2025, entering BROS's Arizona/Texas markets
-> 7 Brew could overlap with ~200-300 BROS stores by 2028
-> In overlapping markets, 2-4% same-store-sales drag is realistic
-> 200-300 stores x $2.1M AUV x 3% drag = $12.6M-$18.9M per year
-> At 25x EV/EBITDA, that's roughly $315-475M in enterprise value, or ~$4-6/share
-> Timeline: 2-3 years as 7 Brew expands westward
-> Evidence: BROS guided SSS growth down to 3-5% from 5.6%
```

**Example — Upwork (UPWK) vs. AI coding tools:**

```
AI coding tools (GitHub Copilot, Cursor, Devin) reduce demand for freelance developers
-> Software development is 34% of Upwork's GSV (~$1.6B)
-> Web & Mobile Development category already shrank 13% YoY in 2025
-> If AI reduces freelance dev demand by 20-30% over 3 years: $320-480M GSV loss
-> At 17% take rate: $54-82M revenue at risk (7-10% of total revenue)
-> Timeline: already happening — 11 of 12 Upwork categories showed YoY declines in 2025
```

### Revenue Risk Severity Scale

| Revenue at Risk (% of total) | Severity | What It Means for the Stock |
|------------------------------|----------|---------------------------|
| **<3%** | Low | Noise. Doesn't materially change the downside assessment. |
| **3-8%** | Moderate | Adds 5-10pp to bear case probabilities. Monitor but don't panic. |
| **8-15%** | High | Meaningfully increases downside. Should be a core scenario in Step 1. |
| **15-25%** | Very High | The competitive threat IS the investment thesis. Must be the #1 factor. |
| **>25%** | Existential | The business model may not survive in current form. |

### What We Found Across 12 Stocks

| Stock | Revenue at Risk | % of Revenue | Severity | Key Finding |
|-------|----------------|-------------|----------|-------------|
| UPWK | $97-140M | 12-18% | High | Already declining. AI is not theoretical — 11/12 categories down. Most urgent. |
| DUOL | $120-240M | 12-23% | High-Very High | AI chatbots threaten intermediate+ learners (15-25% of paid subs). Already evident in growth deceleration. |
| CELH | $315-525M | 13-21% | High-Very High | Monster "Flrt" + Ghost/KDP target exact same demographic. Largest dollar risk after SE. |
| HSAI | $56-87M | 13-20% | High | Camera-only budget EVs + RoboSense closing gap. Offset by robotics diversification. |
| SLNO | $15-25M near-term | 8-13% | Moderate | GLP-1 off-label use. ARD-101 paused (threat diminished). Own safety profile is bigger risk. |
| FRSH | $75-105M | 8-12% | Moderate-High | CX business vulnerable to AI-native tools. ITSM (Freshservice) is more defensible. |
| SE | $1.1-1.4B | 6-8% | Moderate | TikTok Shop gaining in Vietnam (68%->56% Shopee share). Largest dollar amount. |
| ELF | $35-60M | 2.7-4.6% | Moderate | NYX acceleration, but ultra-cheap import threat diminishing (tariffs). |
| PRKS | $37-56M | 2.2-3.3% | Moderate | Epic Universe cannibalized regional parks, not Orlando directly (counterintuitive). |
| BROS | $35-70M | 2-4% | Low-Moderate | 7 Brew overlap currently limited to Texas/Arizona. Western expansion is 2-3 years away. |
| PCTY | $23-45M | 1.4-2.8% | Low | Paychex+Paycor merger integration may actually benefit PCTY short-term. |
| INVZ | $10-50M (trajectory) | Caps growth | Existential | Hesai Thailand factory (2027) removes INVZ's geopolitical positioning advantage. |

### How Moat Strength Changes the Analysis

| Moat Strength | What It Means for Downside | Adjustment |
|---------------|---------------------------|------------|
| **5/5** | Monopoly/irreplaceable. Competition is irrelevant. All risk is financial/macro. | Reduce bear case probabilities by ~10pp |
| **4/5** | Strong moat. Downside is cycle/valuation, not competition. | No adjustment needed |
| **3/5** | Moderate moat. Competition adds risk beyond financials. | Increase bear case probabilities by ~5pp |
| **2/5** | Weak moat. "Cheap" may reflect permanent impairment. | Increase bear case probabilities by ~10pp |
| **1/5** | Barely any moat. Competitive risk is the dominant factor. | Bear + severe bear should be 55%+ combined |
| **0/5** | No moat. Existential competitive risk. Business model may not survive. | Bear + severe bear should be 60%+ combined |

**Output:** Moat type, moat score (0-5), revenue at risk ($ and % for moat 0-3), and whether competitive erosion is already visible in results.

---

## Step 5: Combine & Score

**Goal:** Synthesize all steps into a final assessment with a weighted expected price and ratings dashboard.

**Inputs:** Outputs from Steps 1-4.

**Steps:**

1. **Show the weighted expected price calculation.** This is MANDATORY — never state a weighted price without showing the math.

   > Weighted Expected Price = (Bull mid x Bull prob) + (Base mid x Base prob) + (Bear mid x Bear prob) + (Severe mid x Severe prob)

2. **Fill in the Ratings Dashboard** (scores explained below).

3. **Apply the Decision Matrix** to determine the conclusion.

### Decision Matrix

| Step 1 (Scenarios) | Step 2 (Stress Test) | Step 3 (Precedent) | Step 4 (Moat) | **Conclusion** |
|--------------------|--------------------|-------------------|--------------|----------------|
| Low expected downside | Current price near floor | Overshot precedent | Strong moat (4-5/5) | **Least further downside — likely near bottom** |
| Low expected downside | Current price near floor | Overshot precedent | Weak moat (0-1/5) | **Caution — "cheap" may be permanent** |
| High expected downside | Current price far from floor | Room to match precedent | Strong moat (4-5/5) | **Moderate downside — moat provides floor** |
| High expected downside | Current price far from floor | Room to match precedent | Weak moat (0-1/5) | **Most further downside — avoid or size small** |

### The Two Patterns That Predict Least Downside

**Pattern 1 (Strongest signal):** Irreplaceable competitive position + temporary financial headwind.
- The franchise is permanent. The headwind is not.
- Examples: AZO (LIFO charges reverse), AGM (ag credit cycle normalizes), CRH (valuation resets from stretched to fair), PGR (earnings normalize from unsustainably good)

**Pattern 2 (Valid but weaker):** Bad news is known, priced, and reflected in depressed multiples + moat intact.
- The market tends to overshoot when the catalyst is public information.
- Examples: VITL (egg deflation public), ARE (lab oversupply public), ELF (tariff exposure public)
- **Caution:** This pattern breaks when the moat is also weak. DUOL and FRSH appeared to fit this pattern but their moat strength (1/5) means the "bad news" may be structural, not temporary.

**Output:** Weighted expected price with calculation shown, ratings dashboard, and a final conclusion referencing the decision matrix.

---

## Common Mistakes to Avoid

1. **Don't anchor on "how much it's already fallen."** A stock down 85% can still fall another 50%. (Example: Luminar fell 99% and went bankrupt.) The decline percentage tells you nothing about the future without analyzing WHY it fell and whether the cause is temporary or permanent.

2. **Don't confuse "cheap ratios" with "safe."** A stock trading at 5x PE is cheap — but it might be cheap for a very good reason (declining revenue, eroding moat, structural disruption). The competitive landscape step catches this.

3. **Don't assume precedent will repeat exactly.** Netflix crashed 76% in 2022 and recovered. That doesn't mean every stock that falls 76% will recover. Netflix's moat was intact. Check if the moat is intact before applying the precedent.

4. **Don't ignore leverage.** A company with 6x Debt/EBITDA will experience 2-3x the stock decline of a company with 1x Debt/EBITDA for the same fundamental shock. Debt amplifies everything — both gains and losses.

5. **Don't assign fake precision.** "35% probability of a $145 price target" sounds precise but isn't. Use ranges: "30-40% probability of $130-155." The scenario structure is valuable; the exact numbers are approximations.

---

## Stock Report Template (MANDATORY)

Every stock analysis MUST follow this structure with these EXACT headers. Do not rename, reorder, or omit any section.

### Section 1: Analysis

The MANDATORY headers for Section 1 are:
1. **"What This Company Does & Why the Stock Dropped"**
2. **"How Much Further Can It Fall?"**
3. **"Competitive Position & Moat"**
4. **"What to Watch"**

The MANDATORY tables are:
1. **"Table 1 — Scenario Summary"**
2. **"Table 2 — Ratings Dashboard"**
3. **"Table 3 — Key Metrics to Monitor"**

---

#### What This Company Does & Why the Stock Dropped

*2-3 paragraphs. Plain English. A non-finance reader should understand this.*

- What the company sells, to whom, and why it matters
- The company's top 2-3 revenue-generating products/services with approximate revenue contribution
- What caused the stock decline — the specific event(s), not "market conditions"
- How much it's fallen and from when

#### How Much Further Can It Fall?

*2-3 paragraphs summarizing the scenario analysis results.*

- The probability-weighted expected price and what it implies (further downside or upside from current)
- MUST show the weighted calculation: (Bull mid x prob) + (Base mid x prob) + (Bear mid x prob) + (Severe mid x prob) = $X
- The bear case story in 2-3 sentences — what specifically goes wrong, for which product, caused by whom
- The bull case story in 2-3 sentences — what specifically goes right
- The stress test finding: which variable matters most and where the floor is

**Table 1 — Scenario Summary**

| Scenario | Story (1 sentence) | Price Range | Probability |
|----------|-------------------|-------------|-------------|
| Bull | [Specific product-level story] | $XX-$XX | XX% |
| Base | [Specific product-level story] | $XX-$XX | XX% |
| Bear | [Specific product-level story] | $XX-$XX | XX% |
| Severe | [Specific product-level story] | $XX-$XX | XX% |
| **Weighted Expected** | **(Bull mid x prob) + (Base mid x prob) + (Bear mid x prob) + (Severe mid x prob)** | **$XX** | |

#### Competitive Position & Moat

*2-3 paragraphs on competitive dynamics.*

- Exact sub-industry and market position (rank, share)
- Moat type and moat strength rating (X/5, where 5 = strongest, 0 = no moat)
- The top 2 direct competitors and what they're doing
- Revenue at risk from competition ($ and % of total revenue) — required for moat 0-3; for moat 4-5 state "competitive displacement risk is minimal"
- Whether the competitive threat is already showing up in recent results

**Table 2 — Ratings Dashboard**

| Rating | Score | What It Means |
|--------|-------|---------------|
| Moat Strength | X/5 | [One-line explanation] |
| Financial Health | X/5 | [Based on leverage, FCF, profitability] |
| Precedent Position | X/5 | [5 = overshot all precedents, 1 = room to fall] |
| Overall Downside Risk | X/5 | [5 = least risk, 1 = most risk] |

*All ratings: 5 = best / safest, 1 = worst / most dangerous.*

#### What to Watch

*1-2 paragraphs on the 2-3 most important monitorable triggers.*

**Table 3 — Key Metrics to Monitor**

| What to Watch | Current Value | Bull Signal | Bear Signal | Next Data Point |
|---------------|--------------|-------------|-------------|-----------------|
| [Metric 1] | [Value] | [Threshold] | [Threshold] | [Date/event] |
| [Metric 2] | [Value] | [Threshold] | [Threshold] | [Date/event] |
| [Metric 3] | [Value] | [Threshold] | [Threshold] | [Date/event] |

---

### Section 2: Raw Information

Everything that supports the analysis. This section can be as long as needed — it's reference material.

**MUST include:**

- **Current Ratio Snapshot:** All key ratios with values and status. MUST be at current price at time of writing.
- **Detailed Scenario Breakdowns:** Complete 4-scenario breakdown with sub-scenarios, ratio-by-ratio impact tables, and price calculations
- **Stress Test / Sensitivity Matrix:** Full 2D grid with all price intersections, base multiple justification, and valuation regime check findings
- **Precedent Drawdowns:** 3-5 historical episodes with peak-to-trough data and comparability
- **Sources:** Links to earnings releases, stockanalysis.com, yahoo finance, macrotrends.net, and any other sources used

---

### Formatting Rules

1. **No repetition between Analysis and Raw Information.** Analysis summarizes and interprets. Raw Information provides evidence.
2. **Analysis tables: max 6 columns, max 8 rows.** Larger tables belong in Raw Information.
3. **Every number in Analysis must appear with context.** Not "$75M revenue at risk" — say "$75M revenue at risk (8% of total), primarily from AI-native CX tools replacing the Freshdesk product."
4. **Ratings are always X/5 with 5 = best.** Moat Strength 5/5 = monopoly. Moat Strength 0/5 = no moat.
5. **The Analysis must stand alone.** A reader who never opens Raw Information should still make an informed decision.
6. **All valuation ratios MUST be at the current stock price.** If the stock has moved materially since the source's reference date, recalculate.
7. **The weighted expected price calculation MUST be shown in full** in "How Much Further Can It Fall?" — not just the result.
8. **Overlap discount is 60% for all scenarios.** When summing multiple ratio impacts, multiply the raw sum by 0.60. Do not vary this.

---

## Quick Reference Checklist

Before submitting a report, verify:

```
[ ] Step 0: All ratios at CURRENT price (not stale)
[ ] Step 0: Sub-industry identified specifically (not "tech" or "healthcare")
[ ] Step 1: 4 scenarios with 2-3 sub-scenarios each
[ ] Step 1: Every scenario names a specific competitor, product, or event
[ ] Step 1: Probabilities sum to 100%
[ ] Step 1: Weighted expected price shown with FULL calculation
[ ] Step 1: Overlap discount = 60% of raw ratio-impact sum
[ ] Step 2: Base multiple stated and JUSTIFIED (sector median, historical avg, or peer comp)
[ ] Step 2: Valuation regime check performed (5yr vs prior 5yr)
[ ] Step 2: Stress test matrix completed with floor identified
[ ] Step 3: At least 3 precedents (including own history if available)
[ ] Step 3: Each precedent notes whether moat was intact during drawdown
[ ] Step 4: Moat scored 0-5 with type identified
[ ] Step 4F: Revenue risk quantified in $ for moat 0-3
[ ] Step 4F: For moat 4-5, stated "competitive displacement risk is minimal"
[ ] Step 5: Decision matrix applied
[ ] Section 1 uses EXACT headers: "What This Company Does & Why the Stock Dropped",
    "How Much Further Can It Fall?", "Competitive Position & Moat", "What to Watch"
[ ] Tables titled EXACTLY: "Table 1 — Scenario Summary", "Table 2 — Ratings Dashboard",
    "Table 3 — Key Metrics to Monitor"
[ ] Weighted price calculation shown in Table 1 row AND in narrative
```
