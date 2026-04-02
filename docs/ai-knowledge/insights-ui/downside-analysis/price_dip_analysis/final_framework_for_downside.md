# How to Evaluate Downside Risk in Stocks — A Complete Framework

*Written for anyone, including those new to finance. No jargon without explanation.*

---

## What This Framework Answers

**"A stock I own (or want to buy) has dropped significantly. How much further can it fall?"**

This is the question every investor faces after a stock declines 20%, 40%, or 80%. The framework below is what we used to evaluate 31 stocks across different industries. It combines four dimensions of analysis, each answering a different question:

| Dimension | Question It Answers |
|-----------|-------------------|
| **1. Scenario Modeling** | "What could go wrong (or right), and what's the probability?" |
| **2. Stress Test Matrix** | "Which specific business driver matters most for this stock?" |
| **3. Precedent Drawdown** | "Has this type of decline happened before, and how did it end?" |
| **4. Competitive Landscape** | "Can anyone take this company's customers?" |

You don't need all four for every stock, but the more you use, the better your answer.

---

## Step 0: Before You Start — Gather the Basics

Before analyzing downside, collect these data points. You can find all of them on free sites like stockanalysis.com, yahoo finance, or macrotrends.net.

### What the Company Does
- What does it sell? To whom?
- What is its **exact sub-industry**? (Not "tech" — say "enterprise barcode scanners for warehouses" or "pasture-raised egg production")

### Price History
- **Current price**
- **All-time high (ATH)** and **52-week high**
- **How far it's fallen** (% decline from ATH and from 52-week high)

### Key Financial Numbers (Don't Worry — We'll Explain Each)

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

### Key Ratios (The Market's Scorecard)

These ratios compare the stock price to the company's fundamentals. Think of them as "how expensive or cheap is this stock relative to what the company actually earns?"

| Ratio | What It Means (Plain English) | Good | Okay | Expensive |
|-------|------------------------------|------|------|-----------|
| **PE ratio** | "How many years of earnings am I paying for?" | <15x | 15–25x | >25x |
| **EV/EBITDA** | "How many years of operating profit does the whole company cost?" | <10x | 10–15x | >15x |
| **Debt/EBITDA** | "How many years would it take to pay off all debt from operating profit?" | <2x | 2–3x | >3x |
| **FCF yield** | "If I buy the whole company, what % of my purchase price comes back as cash each year?" | >7% | 4–7% | <4% |
| **ROIC** | "For every dollar invested in the business, how many cents of profit does it generate?" | >12% | 8–12% | <8% |

*Note: These ranges are general benchmarks. Software companies often trade at higher PEs. REITs use different metrics (P/FFO). Banks use P/Book. Adjust for the industry.*

---

## Step 1: Scenario Modeling — "What Could Happen?"

This is the core of the framework. You're building 3–5 realistic futures for the company — **grounded in what actually happens to the company's products and services, not abstract financial metrics.**

### The Key Principle

Every company's stock price is ultimately driven by what happens to its products and services. A "bear case" isn't "revenue declines 15%" — that's the *output*. The bear case is the *story*: "Competitor X launches a cheaper alternative, steals 20% of Product A's customers in the mid-market, and Product B's growth slows because the TAM is saturating." The financial numbers follow from the story.

**If you can't tell a specific, plausible story about what happens to each major product/service, you don't understand the stock well enough to assign probabilities.**

### How to Do It

**A. Identify the company's top 2–3 revenue-generating products or services.** Not "segments" in the vague corporate sense — the actual products customers buy. Be specific:

| Company | Don't Say | Say Instead |
|---------|-----------|-------------|
| SE | "E-commerce segment" | "Shopee marketplace (GMV $127B), SeaMoney lending ($9.2B loan book), Garena/Free Fire gaming ($1.9B bookings)" |
| BROS | "Coffee revenue" | "Drive-thru beverages in Western US (1,136 stores, $2.1M AUV), new market expansion (East Coast via Clutch acquisition)" |
| ZBRA | "Enterprise products" | "Mobile computers for warehouses (40-50% market share), barcode scanners, enterprise software/services (recurring)" |
| DUOL | "Subscription revenue" | "Duolingo Plus/Max subscriptions (15M paid subs), English test (Duolingo English Test), ad-supported free tier (135M MAU)" |
| ZTS | "Companion animal" | "Apoquel/Cytopoint derm franchise (~$2B), Simparica Trio parasiticide, livestock vaccines" |

**B. For each product/service, understand the competitive dynamics.** Who is the direct competitor for this specific product? What could go wrong? What could go right?

**C. Build 4 scenarios by constructing a real story for EACH product/service.** The scenario is the *combination* of what happens across all 2–3 products. Each scenario should read like a plausible news story you could see in 12 months.

| Scenario | What It Means | Typical Probability |
|----------|---------------|-------------------|
| **Bull case** | Most products beat expectations — growth accelerates, competitors stumble, new product launches succeed | 10–20% |
| **Base case** | Products perform roughly as guided — some beat, some miss, net result is close to consensus | 25–35% |
| **Bear case** | 1–2 key products face real problems — competitor gains share, demand weakens, or margins compress | 30–40% |
| **Severe bear** | Multiple products deteriorate simultaneously + macro/leverage amplifies the damage | 15–25% |

**D. Include 2–3 specific sub-scenarios under each case.** Different combinations of product-level outcomes can lead to the same overall result. This prevents tunnel vision.

### Worked Example: Sea Limited (SE) at $79

**Top 3 revenue drivers:**
1. **Shopee** (e-commerce, ~60% of revenue, $127B GMV)
2. **SeaMoney** (fintech/lending, ~21% of revenue, $9.2B loan book growing 80% YoY)
3. **Garena** (gaming, ~10% of revenue, Free Fire)

---

**Bull Case (10–15% probability) — Price target: $115–130**

*Sub-scenario B1: "TikTok Shop stumbles on regulation"*
- Indonesia/Vietnam tighten social commerce regulations (already proposed in Indonesia)
- Shopee regains 3–5pp of GMV share, EBITDA margin improves to 3–4%
- SeaMoney NPLs stay at 1.1%, lending profit grows 40%+
- Free Fire 2.0 content cycle extends engagement

*Sub-scenario B2: "Lending becomes the growth engine"*
- Shopee GMV grows 25% (as guided, nothing special)
- But SeaMoney cross-sells insurance + banking to Shopee's merchant base → revenue diversification
- Credit quality holds because SEA employment is strong
- Market re-rates SE as a fintech platform, not just e-commerce

---

**Base Case (25–30% probability) — Price target: $79–91**

*Sub-scenario Ba1: "Guidance met, nothing changes"*
- Shopee GMV +25%, take rate stable, EBITDA "no lower than 2025"
- SeaMoney revenue +40% but provisions rise proportionally → flat EBITDA contribution
- Garena bookings flat post-content burst
- Market says "show me the profit" — stock treads water

*Sub-scenario Ba2: "Shopee beats but lending worries offset"*
- Shopee GMV +30% (beats guidance), gaining in LatAm markets
- But SeaMoney NPLs tick up to 1.5%, provisions +30% — analysts raise credit risk flag
- Net effect: revenue beats, but margin concern keeps multiple at 16–18x

---

**Bear Case (35–40% probability) — Price target: $50–65**

*Sub-scenario Be1: "TikTok Shop takes Shopee's lunch in Indonesia"*
- TikTok Shop gains 5–8pp of GMV share in Indonesia (SE's largest market, 40% of Shopee GMV)
- Shopee increases S&M subsidies to defend → EBITDA margins go back toward zero
- Revenue grows 15–20% but costs grow faster
- SeaMoney performs fine but can't offset Shopee margin erosion

*Sub-scenario Be2: "Lending cycle turns"*
- Shopee holds share (TikTok Shop growth stalls)
- But SEA consumer credit weakens: NPLs rise from 1.1% to 2.0–2.5%
- $9.2B loan book × 1.5pp NPL increase = $138M additional provisions
- Market panics about "the next Ant Financial" — multiple compresses to 12–14x

*Sub-scenario Be3: "Both hit simultaneously"*
- Shopee loses share AND SeaMoney NPLs spike
- Garena bookings decline QoQ as Free Fire engagement fades
- All three engines stall → stock re-tests 2022 lows

---

**Severe Bear (15–20% probability) — Price target: $35–48**

*Sub-scenario S1: "Regulatory crackdown + credit crisis"*
- Indonesia bans foreign e-commerce platforms or imposes punitive taxes
- SEA-wide consumer credit contraction (rate hikes, unemployment spike)
- SeaMoney forced to slow lending, write down loan book
- Garena faces gaming regulation in key markets

*Sub-scenario S2: "Cash burn spiral"*
- To fight TikTok Shop, Shopee reverts to heavy subsidies (2019-era cash burn)
- $4.5B FCF turns to near-zero as SE prioritizes market share defense
- Market treats SE as "back to growth at any cost" — multiple collapses to 8–10x EBITDA

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

**Bull Case (20–25% probability) — Price target: $3,600–3,900**

*"Recession drives repair over replace"*
- US recession pushes consumers to repair aging cars instead of buying new ones
- 12.6-year average car age → massive installed base needing parts
- DIY same-store sales accelerate +4–6% (consumers trading down from dealer service)
- DIFM grows as independent mechanics gain share from dealers
- Tariffs on Chinese auto parts benefit AZO (domestic inventory advantage)

---

**Base Case (35–40% probability) — Price target: $3,100–3,400**

*"Steady as she goes"*
- DIY grows 1–3% (normal range), DIFM grows 5–8% (continuing share gains)
- International grows 10%+ but is still a small contributor
- LIFO charges normalize ($200M → $100M) as supply chain deflation arrives
- Buyback machine continues ($5B+/year), EPS grows 8–12%

---

**Bear Case (25–30% probability) — Price target: $2,600–2,900**

*Sub-scenario Be1: "Tariff cost absorption kills margins"*
- US tariffs on auto parts (25%+ on Chinese imports) hit AZO's COGS
- AZO can pass through 60–70% but absorbs the rest → gross margin contracts 100–150 bps
- Revenue fine, but earnings miss for 2–3 quarters
- Multiple compresses from 18x to 15x → stock falls 15–20%

*Sub-scenario Be2: "Amazon cracks auto parts"*
- Amazon expands same-day delivery for auto parts in 20+ markets
- DIY customers (less brand-loyal, price-sensitive) shift 3–5% of purchases online
- DIFM business is immune (mechanics need parts in 30 minutes, not 2 hours)
- Slow bleed, not collapse — 2–3% annual revenue headwind

---

**Severe Bear (10–15% probability) — Price target: $2,200–2,500**

*"EV adoption accelerates faster than expected"*
- Federal EV subsidies + cheap Chinese EVs → new car sales boom
- Average car age drops from 12.6 to 11 years over 3 years
- DIY volume declines 5–8% as newer cars need less repair
- This is the 15–20 year structural risk arriving early — unlikely but not impossible

---

**Notice the difference:** AZO's bull case is a *specific economic story* (recession → repair over replace), not "revenue grows 5%." The bear case isn't "margins compress" — it's "tariffs on Chinese auto parts force AZO to absorb costs it normally passes through."

### How to Check If Your Scenarios Are Good Enough

Ask yourself these 3 questions for each scenario:

1. **"Could I write a headline for this?"** If your bear case is "revenue declines and margins compress," that's not a scenario — it's a financial outcome. A real scenario: "TikTok Shop captures 8% of Indonesian e-commerce GMV, forcing Shopee into a subsidy war." That's a headline.

2. **"Can I monitor this in real time?"** Each sub-scenario should point to something you can track quarterly: a competitor's store count, a market share report, an NPL ratio, an FDA decision. If you can't monitor it, you can't update your probabilities.

3. **"Does this story have a specific competitor, customer, product, or event?"** Vague scenarios ("macro deteriorates") are useless. Name the competitor. Name the product. Name the market. Specificity forces intellectual honesty.

**E. For each scenario, estimate a price range.** Ask: "If this story plays out, where would the stock trade?"

The simplest way: take the company's expected earnings (EPS) in that scenario and multiply by a reasonable PE ratio.

> **Price = EPS × PE ratio**
>
> Example: If ZBRA earns $26 in a bear case and trades at 7x PE, the price would be $26 × 7 = $182.

**F. Multiply each price by its probability and add them up.** This gives you the "probability-weighted expected price."

> Example:
> - Bull ($270) × 15% = $40.50
> - Base ($255) × 30% = $76.50
> - Bear ($170) × 35% = $59.50
> - Severe ($100) × 20% = $20.00
> - **Total: $196.50** (this is the expected price)
>
> If the current price is $202, the expected further downside is about −3%.

### Important Caveats

- **Use probability ranges (30–40%), not exact numbers (35%).** Nobody can predict the future precisely.
- **Trace the causal chain:** Product/service story → Revenue/margin impact → Valuation change → Price. Don't skip from "tariffs escalate" directly to "stock drops 30%."
- **Include a time horizon.** "In the next 6–12 months" is more useful than an undated prediction.
- **Update as new data arrives.** The whole point of product-level scenarios is that you can monitor them. When TikTok Shop publishes GMV numbers, or when AZO reports DIY same-store sales, update your probability weights.

---

## Step 2: Stress Test Matrix — "Which Variable Matters Most?"

This step builds on Step 1 by isolating the 2 most important business drivers and showing how the stock price changes across a range of combinations.

### How to Do It

**A. Pick the 2 most important variables.** Usually these are:
- **Revenue** (or a revenue driver like same-store sales, units shipped, subscribers)
- **Margin** (gross margin, EBITDA margin, or operating margin)

Sometimes the second variable is a **valuation multiple** (PE or EV/EBITDA) if sentiment/re-rating is the main risk.

**B. Define a realistic range for each variable.** Use 4 columns (worst, below-guide, guidance, above-guide) and 4 rows (different margin or multiple levels).

**C. Calculate the stock price at each intersection.** The formula depends on the industry:

> **For most companies:** Price = ((Revenue × Margin × EV/EBITDA multiple) − Net Debt) / Shares Outstanding
>
> **For simple earnings-driven stocks:** Price = EPS × PE
>
> **For REITs:** Price = FFO/share × P/FFO multiple
>
> **For BDCs:** Price = Book Value × P/Book

**D. Valuation regime check (before reading the matrix).** The multiple range you chose in step B can silently inflate the floor if the stock re-rated upward in recent years. Quick check:

1. Compare the stock's average PE (or EV/EBITDA) over the **last 5 years** vs. the **prior 5 years**
2. If the multiple expanded **>25%**, ask: is the expansion explained by real business improvement (faster growth, higher margins, stronger market position) or by market environment (low rates, narrative shift)?
3. The portion explained by business improvement is the **new justified floor**. The rest is air that can revert.
4. For the severe-case corner of the matrix, use the **pre-expansion average multiple** — not just the bottom of the recent range
5. If both the multiple AND margins are at historical highs, flag **double reversion risk** — both can compress at the same time

**Where to get the data:** macrotrends.net or stockanalysis.com — search "[ticker] PE ratio history." Takes ~5 minutes per stock.

**Example — AZO:** Average PE was ~16x in 2016–2020, expanded to ~20x+ in 2021–2025. Some is justified (DIFM growth engine, aging fleet). But the stress test's severe floor of 18x may be too generous — 15–16x is a more honest severe case, which drops the floor from $2,070 to ~$1,840.

*(Rationale: Shiller, Campbell & Shiller, and Arnott research shows valuation multiples mean-revert over 5–10 year horizons. Stocks that re-rated without corresponding fundamental improvement are statistically likely to de-rate.)*

**E. Read the matrix.** The key questions are:
- **Where is the current price on the matrix?** This tells you what the market already expects.
- **What's the floor?** (worst-case corner) This is your maximum downside.
- **Which axis moves the price more?** If moving down one column changes the price more than moving down one row, that variable is the one to watch.

### Example (Simplified)

For ZBRA at $202, using Revenue × EBITDA Margin at 12x EV/EBITDA:

| | Margin 14% | Margin 16% | Margin 18% | Margin 20% |
|---|---|---|---|---|
| Rev $5.0B | **$120** | $143 | $167 | $190 |
| Rev $5.4B | $133 | $158 | $184 | $209 |
| Rev $5.9B | $149 | $177 | **$205** ← current | $232 |

**Reading this:** Current price implies $5.9B revenue at 18% margin. Moving from 18% to 14% margin (same revenue) drops the stock from $205 to $149 (−27%). Moving revenue from $5.9B to $5.0B (same margin) drops it to $167 (−19%). **Margin matters 1.4x more than revenue for ZBRA.**

---

## Step 3: Precedent Drawdown — "Has This Happened Before?"

This step grounds your analysis in what has actually happened in the real world, rather than what a model predicts.

### How to Do It

**A. Find 3–5 historical episodes where the same type of problem hit this stock or similar companies.**

Ask: "When has this company (or one like it) faced a similar challenge, and how much did the stock fall?"

| Current Problem | Look For |
|----------------|----------|
| Tariff/margin pressure | The same stock's reaction to past tariffs, or peer stocks in tariff-affected industries |
| Growth deceleration | Other growth stocks that decelerated (Netflix 2022, Meta 2022, Peloton 2021) |
| Leverage stress | Similar leveraged companies in past downturns (2008, 2020) |
| New competition | Past competitive disruptions in the same industry |

**B. Measure the peak-to-trough decline in each historical episode.**

**C. Ask: "Is the current situation more severe, less severe, or about the same as the precedent?"**

| Factor | Current vs. Past |
|--------|-----------------|
| Is revenue growing or declining? | Growing = less severe |
| Is leverage higher or lower? | Higher = more severe |
| Is the company profitable? | Yes = less severe |
| Is the competitive threat new/unprecedented? | Yes = less comparable |

**D. Determine if the stock has already "overshot" or has "room to match" the precedent.**

- If the stock has fallen MORE than the historical precedent → the decline may be overdone → less further downside
- If the stock has fallen LESS → there may be room to fall further

### The Key Insight This Step Provides

This step tells you whether the decline is **"normal" for this type of problem** or **"excessive."** 

After analyzing 31 stocks, we found this was the **critical tiebreaker** in ranking downside risk. Stocks that had already overshot historical precedents (like DUOL at −83% vs. Netflix's −76%) had less further downside than stocks that hadn't yet matched their precedents (like ZBRA at −43% vs. its own −68% in 2021–23).

---

## Step 4: Competitive Landscape — "Can Anyone Take Their Customers?"

This was the last dimension we added, and it **changed the ranking more than any other step.**

### Why It Matters

Steps 1–3 analyze financial metrics. They tell you "how much downside exists in the numbers." But they miss a critical question: **is the company's competitive position intact, or is it being structurally eroded?**

A stock can look cheap on every financial metric (low PE, high FCF yield, overshot precedent) and still have significant downside if a competitor is destroying its moat.

### How to Do It

**A. Identify the exact sub-industry.** Be specific. Not "technology" — say "enterprise barcode scanners for warehouse workers" or "drive-thru specialty coffee in the western U.S."

**B. Find the company's market share and top 3–5 direct competitors.**

**C. Assess the competitive moat.** A moat is what prevents competitors from taking the company's customers. There are several types:

| Moat Type | What It Means | Strength | Example |
|-----------|--------------|----------|---------|
| **Regulatory monopoly** | Government charter or license prevents competition | Very Strong | AGM (only ag mortgage GSE) |
| **Physical/location** | Can't be replicated physically | Very Strong | CRH (quarries take 7-10 years to permit) |
| **Switching costs** | Customers would face high costs/pain to switch | Strong | ZBRA (enterprise software ecosystem) |
| **Network effects** | Product gets better as more people use it | Moderate-Strong | ZG (more users → more agents → more data) |
| **Brand/culture** | Customers buy because of emotional connection | Moderate | BROS (drive-thru coffee culture) |
| **Cost advantage** | Produces at lower cost than competitors | Moderate | TGLS (Colombian labor advantage) |
| **None / Low switching costs** | Customers can easily switch | Weak | FRSH (mid-market SaaS) |

**D. Identify the bear case competitive scenario.** What specific competitive threat could erode the moat in 2–3 years?

**E. Score moat strength (0–5).** 5/5 = monopoly or irreplaceable position, 0/5 = no moat, existential competitive risk.

**F. Quantify the competitive revenue risk from the top 2 direct competitors.** This is the step most investors skip — and it's the most important. Don't just say "competition is a risk." Calculate how much revenue the top 2 competitors could realistically take.

### Step 4F: Competitive Revenue Risk (The Missing Piece)

Most competitive analysis stops at "Company X is a threat." That's not useful. You need to answer: **"How much of this company's revenue could Competitor A and Competitor B realistically take in the next 2–3 years, and what does that do to the stock price?"**

**How to do it:**

**1. Identify the top 2 most direct competitors.** Not the biggest companies in the industry — the ones most likely to take THIS company's customers. Ask: "Which competitor is actively targeting the same customers with a comparable or better product?"

**2. Estimate the competitor's growth trajectory.** How fast are they growing? How many of this company's markets are they entering? What's their market share trend?

**3. Calculate the revenue at risk.** Follow this chain:

```
Competitor takes X percentage points of market share
→ That equals $Y in lost revenue for our company
→ At the current valuation multiple, $Y revenue loss = Z% stock price decline
→ Timeline: when does this happen?
```

**4. Check if it's already happening.** Look for:
- Declining same-store sales or same-unit metrics in markets where the competitor operates
- Customer wins announced by the competitor that were previously this company's customers
- Management acknowledging the competitor on earnings calls
- Deceleration in the specific segment the competitor targets

**Example — Dutch Bros (BROS) vs. 7 Brew:**

```
7 Brew opened 280+ stores in 2025, entering BROS's Arizona/Texas markets
→ 7 Brew could overlap with ~200-300 BROS stores by 2028
→ In overlapping markets, 2-4% same-store-sales drag is realistic
→ 200-300 stores × $2.1M AUV × 3% drag = $12.6M-$18.9M per year
→ At 25x EV/EBITDA, that's roughly $315-475M in enterprise value, or ~$4-6/share
→ Timeline: 2-3 years as 7 Brew expands westward
→ Evidence: BROS guided SSS growth down to 3-5% from 5.6% (not attributed to 7 Brew specifically, but the format is getting crowded)
```

**Example — Upwork (UPWK) vs. AI coding tools:**

```
AI coding tools (GitHub Copilot, Cursor, Devin) reduce demand for freelance developers
→ Software development is 34% of Upwork's GSV (~$1.6B)
→ Web & Mobile Development category already shrank 13% YoY in 2025
→ If AI reduces freelance dev demand by 20-30% over 3 years: $320-480M GSV loss
→ At 17% take rate: $54-82M revenue at risk (7-10% of total revenue)
→ Timeline: already happening — 11 of 12 Upwork categories showed YoY declines in 2025
```

### Revenue Risk Severity Scale

| Revenue at Risk (% of total) | Severity | What It Means for the Stock |
|------------------------------|----------|---------------------------|
| **<3%** | Low | Noise. Doesn't materially change the downside assessment. |
| **3–8%** | Moderate | Adds 5-10pp to bear case probabilities. Monitor but don't panic. |
| **8–15%** | High | Meaningfully increases downside. Should be a core scenario in Framework 1. |
| **15–25%** | Very High | The competitive threat IS the investment thesis. Must be the #1 factor in your analysis. |
| **>25%** | Existential | The business model may not survive in current form. Size position accordingly. |

### What We Found Across 12 Stocks

| Stock | Revenue at Risk | % of Revenue | Severity | Key Finding |
|-------|----------------|-------------|----------|-------------|
| UPWK | $97–140M | 12–18% | High | Already declining. AI is not theoretical — 11/12 categories down. Most urgent. |
| DUOL | $120–240M | 12–23% | High–Very High | AI chatbots threaten intermediate+ learners (15-25% of paid subs). Already evident in growth deceleration. |
| CELH | $315–525M | 13–21% | High–Very High | Monster "Flrt" + Ghost/KDP target exact same demographic. Largest dollar risk after SE. |
| HSAI | $56–87M | 13–20% | High | Camera-only budget EVs + RoboSense closing gap. Offset by robotics diversification. |
| SLNO | $15–25M near-term | 8–13% | Moderate | GLP-1 off-label use. ARD-101 paused (threat diminished). Own safety profile is bigger risk. |
| FRSH | $75–105M | 8–12% | Moderate–High | CX business vulnerable to AI-native tools. ITSM (Freshservice) is more defensible. |
| SE | $1.1–1.4B | 6–8% | Moderate | TikTok Shop gaining in Vietnam (68%→56% Shopee share). Largest dollar amount. |
| ELF | $35–60M | 2.7–4.6% | Moderate | NYX acceleration, but ultra-cheap import threat diminishing (tariffs). |
| PRKS | $37–56M | 2.2–3.3% | Moderate | Epic Universe cannibalized regional parks, not Orlando directly (counterintuitive). |
| BROS | $35–70M | 2–4% | Low–Moderate | 7 Brew overlap currently limited to Texas/Arizona. Western expansion is 2-3 years away. |
| PCTY | $23–45M | 1.4–2.8% | Low | Paychex+Paycor merger integration may actually benefit PCTY short-term. |
| INVZ | $10–50M (trajectory) | Caps growth | Existential | Hesai Thailand factory (2027) removes INVZ's geopolitical positioning advantage. |

### How Moat Strength Changes the Analysis

| Moat Strength | What It Means for Downside | Adjustment |
|---------------|---------------------------|------------|
| **5/5** | Monopoly/irreplaceable. Competition is irrelevant. All risk is financial/macro. | Reduce bear case probabilities by ~10pp |
| **4/5** | Strong moat. Downside is cycle/valuation, not competition. | No adjustment needed |
| **3/5** | Moderate moat. Competition adds risk beyond financials. | Increase bear case probabilities by ~5pp |
| **2/5** | Weak moat. "Cheap" may reflect permanent impairment. | Increase bear case probabilities by ~10pp |
| **1/5** | Barely any moat. Competitive risk is the dominant factor. | Bear + severe bear should be 55%+ combined |
| **0/5** | No moat. Existential competitive risk. Business model may not survive. | Bear + severe bear should be 60%+ combined |

### What We Learned from 31 Stocks

This step revealed the single most important insight of the entire analysis:

> **"Irreplaceable competitive position + temporary financial headwind" is the safest combination.**
>
> **"Overshot historical precedent + eroding moat" is dangerous — the precedent may not apply if the product is being disrupted.**

Stocks like AZO, AGM, and CRH have moats that literally cannot be competed away (regulatory monopoly, irreplaceable physical assets). Their declines are driven by temporary factors (LIFO charges, credit cycle, valuation reset) that reverse with time. These had the least further downside.

Stocks like DUOL and FRSH looked safe on Steps 1–3 (overshot precedent, cheap on financials, strong balance sheet) but had weak moats (moat strength 1/5 — AI disruption, low switching costs). The historical precedents (Netflix, Meta recoveries) didn't apply because those companies' moats were INTACT during their crashes — DUOL and FRSH's moats are actively being challenged by AI.

---

## Putting It All Together — The Final Assessment

After completing all four steps, combine the results:

### Decision Matrix

| Step 1 (Scenarios) | Step 2 (Stress Test) | Step 3 (Precedent) | Step 4 (Moat) | **Conclusion** |
|--------------------|--------------------|-------------------|--------------|----------------|
| Low expected downside | Current price near floor | Overshot precedent | Strong moat (4–5/5) | **Least further downside — likely near bottom** |
| Low expected downside | Current price near floor | Overshot precedent | Weak moat (0–1/5) | **Caution — "cheap" may be permanent** |
| High expected downside | Current price far from floor | Room to match precedent | Strong moat (4–5/5) | **Least further downside — likely near bottom** |
| High expected downside | Current price far from floor | Room to match precedent | Weak moat (0–1/5) | **Most further downside — avoid or size small** |

### The Two Patterns That Predict Least Downside

**Pattern 1 (Strongest signal):** Irreplaceable competitive position + temporary financial headwind.
- The franchise is permanent. The headwind is not.
- Examples: AZO (LIFO charges reverse), AGM (ag credit cycle normalizes), CRH (valuation resets from stretched to fair), PGR (earnings normalize from unsustainably good)

**Pattern 2 (Valid but weaker):** Bad news is known, priced, and reflected in depressed multiples + moat intact.
- The market tends to overshoot when the catalyst is public information.
- Examples: VITL (egg deflation public), ARE (lab oversupply public), ELF (tariff exposure public)
- **Caution:** This pattern breaks when the moat is also weak. DUOL and FRSH appeared to fit this pattern but their moat strength (1/5) means the "bad news" may be structural, not temporary.

---

## Common Mistakes to Avoid

1. **Don't anchor on "how much it's already fallen."** A stock down 85% can still fall another 50%. (Example: Luminar fell 99% and went bankrupt.) The decline percentage tells you nothing about the future without analyzing WHY it fell and whether the cause is temporary or permanent.

2. **Don't confuse "cheap ratios" with "safe."** A stock trading at 5x PE is cheap — but it might be cheap for a very good reason (declining revenue, eroding moat, structural disruption). The competitive landscape step catches this.

3. **Don't assume precedent will repeat exactly.** Netflix crashed 76% in 2022 and recovered. That doesn't mean every stock that falls 76% will recover. Netflix's moat was intact. Check if the moat is intact before applying the precedent.

4. **Don't ignore leverage.** A company with 6x Debt/EBITDA will experience 2-3x the stock decline of a company with 1x Debt/EBITDA for the same fundamental shock. Debt amplifies everything — both gains and losses.

5. **Don't assign fake precision.** "35% probability of a $145 price target" sounds precise but isn't. Use ranges: "30–40% probability of $130–155." The scenario structure is valuable; the exact numbers are approximations.

---

## Quick Reference: One-Page Framework

```
1. SCENARIOS: Build 4 futures (bull / base / bear / severe)
   → First: identify top 2-3 revenue-generating products/services
   → For each scenario: tell a specific story for EACH product
   → Include 2-3 sub-scenarios per case (different product-level combos)
   → Headline test: "Could I write a news headline for this scenario?"
   → Price each scenario (EPS × PE)
   → Weight by probability ranges
   → Get expected price

2. STRESS TEST: Pick 2 key variables, build a matrix
   → Valuation regime check: avg multiple last 5yr vs prior 5yr
     If expanded >25%, use pre-expansion multiple for severe case
     If multiple AND margins both at highs → double reversion risk
   → Find current price on the matrix (what's priced in?)
   → Find the floor (worst case corner)
   → Which variable matters more?

3. PRECEDENT: Find 3–5 past similar crashes
   → Has this stock already overshot or has room to match?
   → Is the current catalyst more or less severe?

4. COMPETITIVE MOAT: Score 0–5 (5 = strongest, 0 = no moat)
   → 4-5: Competition is irrelevant. Focus on financials.
   → 3: Competition adds risk. Increase bear probabilities.
   → 0-2: Competition may be the whole story. "Cheap" ≠ "safe."

   4F. COMPETITIVE REVENUE RISK: For moat 0-2 stocks, quantify:
   → Top 2 competitors' growth trajectory and overlap
   → $ revenue at risk = market share shift × revenue per point
   → Translate to price impact via valuation multiple
   → Check: is it already showing up in recent quarters?
   → <3% = noise | 3-8% = monitor | 8-15% = core scenario | >15% = thesis risk

COMBINE: Moat + revenue risk + financial position + precedent = final assessment
   Best case: Strong moat + temporary headwind
   Worst case: Weak moat + unresolved/structural risk
```

---

## Stock Report Template

Every stock analysis should follow this two-section structure. The goal: a retail investor can read the Analysis in 5 minutes and make a decision. The Raw Information is there for anyone who wants to verify or dig deeper.

### Section 1: Analysis (1–2 A4 pages)

This is the only section most readers will read. No jargon without explanation. No repeated information across sub-sections. Every sentence should either inform or help the reader decide.

**Structure: 2–4 sub-sections + 2–3 tables**

---

#### Sub-section 1: What This Company Does & Why the Stock Dropped

*2–3 paragraphs. Plain English. A non-finance reader should understand this.*

- What the company sells, to whom, and why it matters
- The company's top 2–3 revenue-generating products/services with approximate revenue contribution
- What caused the stock decline — the specific event(s), not "market conditions"
- How much it's fallen and from when

#### Sub-section 2: How Much Further Can It Fall?

*2–3 paragraphs summarizing the scenario analysis results.*

- The probability-weighted expected price and what it implies (further downside or upside)
- The bear case story in 2–3 sentences — what specifically goes wrong, for which product, caused by whom
- The bull case story in 2–3 sentences — what specifically goes right
- The stress test finding: which variable matters most and where the floor is

**Table 1 — Scenario Summary**

| Scenario | Story (1 sentence) | Price Range | Probability |
|----------|-------------------|-------------|-------------|
| Bull | [Specific product-level story] | $XX–$XX | XX–XX% |
| Base | [Specific product-level story] | $XX–$XX | XX–XX% |
| Bear | [Specific product-level story] | $XX–$XX | XX–XX% |
| Severe Bear | [Specific product-level story] | $XX–$XX | XX–XX% |
| **Weighted Expected** | | **$XX** | |

#### Sub-section 3: Competitive Position & Moat

*2–3 paragraphs on competitive dynamics.*

- Exact sub-industry and market position (rank, share)
- Moat type and moat strength rating (X/5, where 5 = strongest, 0 = no moat)
- The top 2 direct competitors and what they're doing
- Revenue at risk from competition ($ and % of total revenue)
- Whether the competitive threat is already showing up in recent results

**Table 2 — Ratings Dashboard**

| Rating | Score | What It Means |
|--------|-------|---------------|
| Moat Strength | X/5 | [One-line explanation] |
| Financial Health | X/5 | [Based on leverage, FCF, profitability] |
| Precedent Position | X/5 | [5 = overshot all precedents, 1 = room to fall] |
| Overall Downside Risk | X/5 | [5 = least risk, 1 = most risk] |

*All ratings: 5 = best / safest, 0 = worst / most dangerous.*

#### Sub-section 4 (Optional): What to Watch

*1–2 paragraphs. Only include if there are specific, monitorable triggers.*

- The 2–3 things that will tell you whether the bear or bull case is playing out
- Specific metrics to track (e.g., "Shopee's Indonesia GMV share in Q2 earnings," "SeaMoney NPL ratio," "7 Brew store count in Arizona")
- Timeline: when you'll have enough data to update your view

**Table 3 — Key Metrics to Monitor**

| What to Watch | Current Value | Bull Signal | Bear Signal | Next Data Point |
|---------------|--------------|-------------|-------------|-----------------|
| [Metric 1] | [Value] | [Threshold] | [Threshold] | [Date/event] |
| [Metric 2] | [Value] | [Threshold] | [Threshold] | [Date/event] |
| [Metric 3] | [Value] | [Threshold] | [Threshold] | [Date/event] |

---

### Section 2: Raw Information

Everything that supports the analysis. This section can be as long as needed — it's reference material, not reading material.

**Include:**

- **Financial snapshot:** All key ratios with values and status (the full ratio table)
- **Scenario details:** The complete 4-scenario breakdown with sub-scenarios, ratio-by-ratio impact tables, and price calculations
- **Stress test matrix:** The full 2D grid with all price intersections
- **Precedent drawdowns:** The 3–5 historical episodes with peak-to-trough data and comparability assessment
- **Competitive landscape:** Detailed competitor profiles, market share data, revenue-at-risk calculations
- **Sources and links:** Earnings call transcripts, SEC filings, analyst reports, competitor data sources, market share reports
- **Data as of date:** When each data point was last updated

---

### Template Formatting Rules

1. **No repetition between Analysis and Raw Information.** The Analysis summarizes and interprets. Raw Information provides the evidence. Don't copy tables from Raw Information into Analysis — create new summary tables.
2. **Analysis tables should have ≤6 columns and ≤8 rows.** If you need more, it belongs in Raw Information.
3. **Every number in Analysis must appear with context.** Not "$75M revenue at risk" — say "$75M revenue at risk (8% of total), primarily from AI-native CX tools replacing the Freshdesk product."
4. **Ratings are always X/5 with 5 = best.** Moat Strength 5/5 = monopoly/irreplaceable. Moat Strength 0/5 = no moat, existential competitive risk. This applies to all ratings in the report.
5. **The Analysis should stand alone.** A reader who never opens Raw Information should still be able to make an informed decision.
