# Highest-value features to implement next in your tariffs app

## How your app maps to the real tariff-information market

Your Insights-UI tariffs system is already positioned differently from most “tariff lookup” tools: it’s an AI-driven **industry impact** and **decision-support** product (executive summaries, impact evaluation, company winners/losers, global country coverage, SEO publishing), rather than a transactional customs calculator or classification workflow.

That matters, because the top 20 tariff-information use cases you researched span **two very different jobs-to-be-done**:

- **Operational compliance & shipment execution** (importers/exporters, brokers, freight forwarders, SMB e-commerce). These users need very granular, up-to-date, HS-line-level answers and often want “what do I literally pay at the border?” Government portals and trade-compliance suites focus here (commodity codes, duty/VAT rates, HS code workflows, import/export controls). For example, the UK’s “Trade Tariff” service emphasizes that you need a commodity code to pay the correct duties and taxes, and that you classify goods using detailed product attributes. citeturn6view2
- **Strategic planning & market intelligence** (multinationals planning capacity, retail buyers, consultants, investors/analysts, policymakers). These users need **comparisons, scenarios, trend detection, and translated implications** across industries and companies—exactly where your report pipeline already excels.

So the maximum-value roadmap (especially “high value + low effort”) is to **double down on strategic intelligence**, while adding *select* “trust + freshness + drill-down” capabilities that let operational users *validate and act* without turning your app into a full compliance system.

## What users already expect from tariff information products

Across government portals, multilateral datasets, and commercial platforms, the common expectation set is:

- **Compare across markets and partners** (“Exporter A → Market B vs Market C”). One large public market-access portal explicitly positions itself around access/compare/analyze/download across markets and products, covering tariffs plus non-tariff measures and trade remedies. citeturn4view3turn5view5
- **Track changes and implementation dates** (not just static “the tariff is X,” but “what changed, when did it start, what is the prior rate”). A major multilateral dataset offers “tariff actions” raw data explicitly to track changes in effectively applied duties over time; it includes initial rates, subsequent changes, trading partner detail, HS-6 classification, and implementation dates. citeturn4view0
- **Preferential vs MFN rates and trade-agreement context** (users need to know when preferences apply and how they phase over time). Public tools aimed at businesses highlight current and future-year rates (phasing schedules) and comparisons across products/countries. citeturn4view5
- **Rules of origin are confusing and differ by agreement**—users want guidance, not raw legal text. One major trade portal calls out that rules of origin vary by partner and agreement and must be consulted as product-specific rules for a given market. citeturn6view0
- **Trade remedies and non-tariff measures often matter as much as tariffs** (anti-dumping, countervailing, safeguards), and users want them connected to the same workflow. A public tool provides a trade-remedies view by product and year, explicitly covering anti-dumping, countervailing, and safeguards. citeturn5view5
- **Commercial suites sell “continuously updated content + workflow + auditability.”** For example, one enterprise platform markets a single global system backed by a “comprehensive and current trade content database,” with capabilities covering screening, import/export management, duty management, and filings. citeturn4view2 Another trade-content provider markets HS classification, duty determination, landed-cost calculations, and “up-to-date trade data across 190+ countries.” citeturn5view1

These expectations strongly align with the “missing info” you identified earlier (real-time bilateral changes, rules-of-origin complexity, multi-country simulation, services/digital expansion, and linking to non-tariff measures). The key is to implement them in a way that **leverages your existing report pipeline** and doesn’t require building a full customs-compliance product.

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["WTO Tariff & Trade Data platform interface screenshot","ITC Market Access Map tariff comparison interface screenshot","UK Trade Tariff look up commodity code duty VAT screenshot","Canada Tariff Finder compare tariffs screenshot"],"num_per_query":1}

## Highest-value and lowest-effort features to implement

### Prioritization method

I ranked features using two explicit lenses:

- **Value (0–100):** How strongly the feature serves your highest-criticality use cases *and* how much it improves trust, decision speed, differentiation, and repeat usage.
- **Effort (1–5):** Rough implementation complexity in your current architecture (pipeline scripts → saved markdown/JSON in S3 → UI renderers/pages + cache invalidation).
- **Priority index:** Value ÷ Effort, then sorted descending.

### Priority-ordered build list

| Feature | Value | Effort | Priority index | Primary users |
|---|---:|---:|---:|---|
| Country-pair compare view | 92 | 1 | 92.0 | Strategy, analysts |
| Company impact screener | 90 | 1 | 90.0 | Investors, corp dev |
| “Freshness + evidence” panel | 95 | 2 | 47.5 | Everyone |
| Watchlists + alert digests | 93 | 2 | 46.5 | Strategy, procurement |
| Standardized “Tariff exposure scorecard” | 88 | 2 | 44.0 | Executives, analysts |
| Related-industry spillover navigation | 80 | 2 | 40.0 | Analysts, research |
| Schema’d export bundle (PDF/MD/JSON) | 78 | 2 | 39.0 | Consultants, teams |
| Trade-remedy and NTM overlay links | 85 | 3 | 28.3 | Strategy, compliance |
| Bilateral change feed using tariff-actions data | 94 | 4 | 23.5 | Everyone |
| Scenario simulator lite (what-if sourcing) | 90 | 4 | 22.5 | Procurement, strategy |
| Rules-of-origin “assistant layer” | 92 | 5 | 18.4 | Importers, compliance |
| Services/digital trade extension | 70 | 5 | 14.0 | Policy, services firms |

The rest of this section explains **why each top item is high value**, and **why it should be comparatively low effort for your architecture**.

### Country-pair compare view

**What to implement**  
A single UI workflow: pick **Industry → Exporter country → Importer country** (and optionally “compare against another importer market”), and render:

- Current rate(s) and preferences surfaced in your existing Tariff Updates section
- A “delta view” (what changed vs last version / last tariff index)
- A short AI explanation of *why that bilateral lane matters for this industry* and *which company archetypes benefit or lose*

**Why this is maximum value**  
“Compare across markets/partners” is a foundational expectation in existing tariff portals (it’s explicitly marketed as core functionality: compare tariffs across multiple markets; compare competitor advantage). citeturn4view3 This single feature also serves many of your top-20 use cases simultaneously (strategy, analysts, procurement, retail buyers, consultants, policymakers) without needing HS-line compliance workflows.

**Why effort is low in your app**  
You already generate **country-specific tariff updates** and have dedicated pages/renderers (TariffUpdatesPage, AllCountriesTariffUpdatesPage, CountryTariffRenderer). This is primarily **UI composition + filtering + caching**, not a new analysis pipeline.

### Company impact screener

**What to implement**  
A “Company → Tariff exposure” view that consolidates what your pipeline already produces:

- Positive vs negative impact categorization (by industry area and country)
- “Why impacted” text snippets
- Link back to the relevant industry sub-sections that justify the classification

**Why this is maximum value**  
Commercial trade tools heavily emphasize decision-grade outcomes (compliance risk reduction, unlocking duty savings, using up-to-date content). citeturn4view2turn5view1 Your differentiation is that you can translate those changes into **company-level winners/losers** for investors and strategy users—high willingness to pay and high repeat usage.

**Why effort is low**  
Your types already include company entities and impact groupings (EstablishedPlayer/NewChallenger and positive/negative impact structures). This is mostly a **new index page + aggregation layer** across stored report JSON.

### “Freshness + evidence” panel

**What to implement**  
On every tariff claim block, add a compact, consistent “evidence drawer”:

- Data vintage (last updated, coverage note)
- Links to the underlying tariff source(s) you used
- A “what changed” diff when the claim changed between report versions

**Why this is maximum value**  
Users selecting between tools often optimize for “most current” applied/preferential rates and HS code updates; even a government-affiliated guide explicitly recommends choosing tools depending on imminent transaction needs because some sources may be “most up-to-date.” citeturn7search4 Separately, multilateral datasets make “tracking changes over time” a first-class concept, including implementation dates and initial vs changed duties. citeturn4view0

In an AI-authored report context, **trust and verifiability** are not nice-to-have—they’re what turns insights into decisions.

**Why effort is low to medium**  
You already persist markdown/JSON and have cache tags and revalidation utilities. Adding a “data provenance object” per section and rendering it is moderate, but it’s not a new domain model.

### Watchlists and alert digests

**What to implement**  
Let users subscribe to:

- Industries
- Country pairs
- Companies
- “Major change triggers” (e.g., new trade remedy, tariff rate jump above threshold)

Send a daily/weekly email digest or in-app notification feed.

**Why maximum value**  
Real-world vendors position trade content as “constantly changing,” and sell relief from constant manual monitoring. citeturn4view2turn5view2 Your own “missing info” list ranks real-time bilateral changes as one of the hardest/highest-importance problems; alerts are the UX layer that converts your research into an operational advantage.

**Why effort is moderate (but still a top pick)**  
You already have generation APIs, caching, and structured storage in S3. Alerts are mainly: a change-detection job + subscriptions + notifications. You can start extremely small: “watch this industry + country; notify if report version changed.”

### Standardized “Tariff exposure scorecard”

**What to implement**  
Add a single standardized scorecard at the top of each report:

- “Tariff shock intensity” (rate change magnitude + breadth)
- “Trade-lane concentration” (how concentrated the affected lanes are)
- “Company vulnerability” (share of key players likely impacted)

These are not perfect econometric estimates; they’re standardized heuristics to compare industries and time periods *within your app*.

**Why maximum value**  
One reason market-access portals win is they enable quick comparison and prioritization across markets and products (“identify prospective markets,” “compare across markets”). citeturn4view3 A scorecard makes your long-form report scannable and supports the investor/analyst workflow of triage.

**Why effort is moderate**  
This is mostly **prompt + schema changes** and a small amount of computed metadata persisted alongside your markdown.

### Related-industry spillover navigation

**What to implement**  
You already maintain “related industry connections” in `TariffIndustryDefinition`. Use that to show:

- “Upstream and downstream industries affected”
- Quick links to those industries’ tariff updates pages
- A short spillover explanation generated once and cached

**Why maximum value**  
Many tariff questions are really supply-chain adjacency questions (e.g., steel → autos). Public and commercial tools don’t usually help with “industry adjacency” because they’re product-code centered. Your industry-first framing makes this an easy differentiation.

**Why effort is low to moderate**  
No new data sources required; it’s a navigation graph and a thin AI summary layer.

## Medium-effort features that unlock major differentiation

These are not “least effort,” but they are high-leverage because they directly address the hardest gaps you identified and align with what serious tariff tools already do.

### Bilateral change feed using “tariff actions” data

**What to implement**  
Ingest a tariff-actions dataset into your backend and expose:

- A filterable “what changed this week” feed by country pair and HS6 bucket mapped to your industries
- Implementation dates and prior/current rates
- “Industry implication” summaries generated by your pipeline

**Why it’s strategically powerful**  
The tariff-actions dataset concept is designed specifically to track changes over time, including initial and changed duties, HS6 detail, trading partner detail, and implementation dates. citeturn4view0 This gives you a defensible “freshness backbone,” which is essential if you want to expand beyond purely narrative AI.

**Why effort is higher**  
It’s a true data ingestion + mapping project, especially mapping HS6 → your 40+ industries. But once built, it also enables better citations and better “diff” experiences.

### Trade-remedy and NTM overlay

**What to implement**  
Start with a lightweight version:

- On each country-pair page, add a “Trade remedies and NTMs can dominate cost” callout
- Provide a structured link panel into a trade-remedy explorer by product and year

**Why it’s high value**  
A market-access platform offers a dedicated trade-remedies workflow that identifies anti-dumping, countervailing, and safeguard measures by product and year. citeturn5view5 Those measures can be as consequential as the tariff line itself, and your “missing info” list elevated “linkage between tariffs and non-tariff measures” as a major gap.

**Why effort is medium-high**  
You can do this as “deep links + curated summaries” first, then later ingest datasets.

### Scenario simulator lite

**What to implement**  
A lightweight “what-if” tool for strategy users:

- Choose baseline lane(s) and alternative source country lanes
- Apply tariff deltas + a few relevant assumptions (shipping cost delta, pass-through %)
- Output a sensitivity plot and narrative summary

**Why it’s high value**  
WITS explicitly provides tariff-cut and simulation tooling reporting pre/post rates at HS6 across importer-exporter combinations. citeturn5view4 Enterprise trade platforms also sell lane simulation and duty-impact simulation. citeturn4view2 This is a high-value bridge between “insights” and “decision.”

**Why effort is higher**  
You need consistent numeric inputs and guardrails; but a “lite” version can be user-input driven, reducing dependency on perfect underlying datasets.

## Implementation guidance grounded in your current architecture

### A practical “max value, minimal refactor” approach

You can treat most of the top-ranked work as **new read models and navigation patterns over what you already generate**:

- **Indexing layer** (new): build lightweight indexes from stored report JSON:
    - `industry → countries mentioned → impacted companies`
    - `company → industries where impacted`
    - `country pair → industries with significant changes`
- **UI composition** (incremental): new pages that consume existing JSON + renderers:
    - Country-pair compare page can reuse CountryTariffRenderer twice (baseline vs compare)
    - Company screener page can reuse your company impact components
- **Metadata and provenance**:
    - Extend your saved markdown payload to include: `data_vintage`, `sources[]`, `confidence`, and `diff_hash`
    - Display via a consistent “Evidence” component

### Data-source strategy that maximizes trust per unit effort

Without committing to rebuilding tariff databases, you can anchor your “freshness + evidence” work on widely used, credible sources:

- The multilateral tariff/trade data platform provides official tariff and import data and aggregates applied tariffs notified by members; its IDB section describes MFN applied duties, preferential duties (if available), and even import values by partner at tariff-line level. citeturn5view0
- For change tracking, its tariff-actions dataset is intentionally structured to capture initial and changed duties plus implementation dates at HS6 and by partner. citeturn4view0
- Where country APIs exist, they can seed “near-real-time” updates (e.g., the UK tariff API provides commodity codes, import/export controls, duty and VAT rates via JSON over HTTPS). citeturn4view1
- For trade agreements and phasing, public tools aimed at businesses show that users value “current and subsequent-year” rates and comparisons across countries/products. citeturn4view5

This approach lets your AI analysis stay “insightful,” while your product becomes **auditable and current enough** to support operational decisions.

## Quality, risk, and measurement guardrails

Because your product produces AI-authored, decision-oriented outputs, the highest-risk failure mode is “confident narrative without verifiable grounding.” The most valuable guardrails are therefore product-level, not just prompt-level.

- **Hard requirement: every tariff number shown should have a displayed source and a data date.** This aligns with how users choose tools for imminent transactions (they explicitly seek the most up-to-date applied and preferential rates). citeturn7search4
- **Diff-aware publishing:** if a tariff-impact claim changes between runs, explicitly label it “new vs prior,” with the relevant implementation date where available (a core element of tariff-actions tracking). citeturn4view0
- **Non-tariff awareness:** where known, warn users that trade remedies and other measures may apply, and route them to structured information (trade remedies by product/year is a first-class workflow in public market-access tooling). citeturn5view5
- **Rules-of-origin caution:** wherever preferential rates are implied, provide a rules-of-origin note that rules differ across agreements/partners and are product-specific. citeturn6view0

If you implement only one “quality investment” early, make it the “Freshness + evidence” panel—because it increases trust in *every* page you already have, and it also makes your future ingestion/simulation features much easier to justify.

## Additional optional tariff ideas

These three ideas are useful because they move the app from "tariff report" toward "decision support." They map mainly to the highest-criticality use cases in `tariff-usecases.md`: importers/exporters, procurement teams, customs brokers, small businesses, manufacturers, retail buyers, and sourcing consultants.

Realistically, these features are relevant only if the app can show sourced, product-level data. If they stay as generic AI advice, serious importers/exporters will not trust them for decisions.

### 1. Tariff reduction suggestions for a product + country

**What to show:** For a selected product or HTS code and origin country, show practical ways tariffs might be reduced: FTA eligibility, rules-of-origin checks, duty drawback, bonded warehouse / FTZ usage, alternative classification review, supplier relocation, or import timing.

**Target audience:** New importers, SMBs, e-commerce sellers, procurement teams, customs brokers.

**Why it helps:** Experienced teams may already know these options, but new users often do not. This can become a simple educational layer that explains legal ways to reduce landed cost and when to talk to a broker.

**Critical view:** Helpful as an educational checklist, but not a strong standalone product feature. Many recommendations will be common knowledge for brokers and compliance teams, and some options depend on strict legal eligibility.

**Adds value?** **Limited — mostly as an educational / SEO layer.** The strategies (FTA eligibility, rules of origin, duty drawback, FTZ, bonded warehouse, classification review, supplier shift, import timing) are well-documented across CBP, broker websites, and trade publications. We won't be the only place users can read about them. The idea has value for awareness — new importers don't know these levers exist — but applying any of them needs a customs broker, so we can't replace that step. Of the four ideas in this document, this is the weakest as a standalone interactive feature, though it can still pull SEO traffic and act as a top-of-funnel lead-in to the other three.

**Best target audience:** New importers and first-time SMB importers, e-commerce and DTC brands that recently started sourcing overseas, students or educators in supply chain / trade programs, and SEO traffic from product-specific searches like "how to reduce tariff on X from Y." Not the right fit for experienced importers, customs brokers, or large multinationals — they already know all of this.

**Review of the generated example reports (bedsheets-india, sneakers-vietnam, t-shirts-bangladesh, wooden-furniture-indonesia, toys-china):**

After reading all five, the honest problem is that they are not very useful in their current form. Here is why:

1. **Same advice, every file.** Every report lists the same 7–8 strategies: First Sale Rule, bonded warehouse, FTZ, duty drawback, tariff engineering, move sourcing to Mexico, supplier relocation. The product and country change, but the options don't. A user who reads two of these reports will immediately notice the pattern. It feels like a template with product names swapped in.

2. **The math is made up.** Every example uses "$10,000 import value" and then calculates savings from there. Real importers have their own volumes, freight costs, and supplier contracts. The numbers don't help them — they just look precise. If a user imports $2M/year or $50k/year, the math is irrelevant to them.

3. **"Move to Mexico" is listed as easy.** In almost every report, sourcing from Mexico under USMCA appears as a top option. But moving a supply chain from Vietnam, Bangladesh, or Indonesia to Mexico takes years, requires qualified suppliers, and costs far more than the duty savings for most small importers. Listing it as a simple option undermines trust.

4. **The people who need this already know it or can't use it alone.** Experienced importers and customs brokers already know these strategies. New importers need a broker to actually apply them — rules-of-origin, CBP binding rulings, first sale documentation are not things you do yourself from a webpage. So neither audience gets real value.

5. **No real data, no sources.** The duty rates cited are current as of April 2026, but there is no link to CBP, Federal Register, or any verifiable source. If a rate is wrong or expires, users acting on it could get hurt. Without sourced, verifiable data, these reports are just AI summaries — not something users would trust for actual import decisions.

**What would make this valuable:**
The strongest version of this feature is probably the **import sourcing comparison** (feature #2 below), not the reduction-strategies checklist. A page that answers "where do most U.S. companies import cotton T-shirts from, and what does each country's total landed cost look like?" is something a user cannot easily find with a Google search. A checklist of tariff reduction options they can.

### 2. Import sourcing comparison for U.S. buyers

**What to show:** When a user selects a product or HTS code, show the top 5 countries the U.S. imports it from, then compare tariff rate, other import duties, average buying/import cost, trade volume, and risk notes.

**Target audience:** U.S. importers, procurement teams, retail buyers, manufacturers, sourcing consultants.

**Why it helps:** This is likely high-interest because it directly answers: "Can I source this cheaper from another country?" It turns tariff data into supplier-country comparison and landed-cost exploration.

**Critical view:** This is probably the strongest of the three ideas. It solves a real procurement question, but it needs reliable import volume, average unit value, tariff, freight, and country-risk data. Tariff alone is not enough to recommend a better sourcing country.

**Adds value?** **Yes — strong.** This answers a question users cannot easily answer with a Google search: "Which country should I source this from?" Combining tariff, import volume, average unit value, and freight in one view is a real time-saver.

**Best target audience:** U.S. importers in the $1M–$100M annual import range, procurement teams at mid-size retailers, sourcing consultants, contract manufacturers qualifying new suppliers, and private-label brands exploring supplier diversification away from China.

**Example report:** [`import-sourcing-coffee-example.md`](./import-sourcing-coffee-example.md) — what this view should look like for U.S. coffee buyers across Brazil, Colombia, Vietnam, Honduras, Mexico, etc.

### 3. Export market opportunity comparison

**What to show:** For a product and exporting country, show potential destination countries where the product may sell at a higher price, along with destination import duties, tariff barriers, demand/trade volume, and likely margin impact.

**Target audience:** Exporters, SMB manufacturers, agribusiness exporters, trade consultants, industry associations.

**Why it helps:** This helps exporters discover better markets, not just understand U.S. tariffs. Interest should be strongest from businesses trying to expand sales or shift away from low-margin markets.

**Critical view:** Useful, but harder than the import comparison. Export opportunity depends on demand, local competition, distribution access, regulations, currency, and non-tariff barriers. This should be framed as "market discovery" rather than a confident export recommendation.

**Adds value?** **Partial.** Useful as a starting point for market discovery, not as a stand-alone recommendation. Tariff differences alone don't pick an export market — demand, distribution, currency, and non-tariff barriers matter more. If we frame it as "shortlist of markets worth investigating," it adds value. If we present it as "go sell here," it will mislead users.

**Best target audience:** SMB manufacturers and agribusiness exporters exploring new markets, trade consultants building client shortlists, industry associations and export-promotion agencies, and U.S. companies trying to shift away from low-margin destinations.

**Example report:** [`export-opportunity-soybeans-example.md`](./export-opportunity-soybeans-example.md) — what this view should look like for U.S. soybean exporters across China, Mexico, EU, Japan, Indonesia, etc.

### 4. Bonded warehouse / FTZ calculator

**What to show:** A simple tool where a user enters import value, expected holding period, share of goods that may be re-exported, and rough warehouse/FTZ fees. The output shows whether using a bonded warehouse or foreign-trade zone improves cash flow or duty timing compared with paying duty at entry.

**Target audience:** Mid-size importers ($1M–$50M annual import value), finance teams modeling cash flow, businesses with seasonal inventory, and importers with a meaningful re-export share.

**Why it helps:** Most importers don't know if FTZ or bonded warehouse is worth the setup cost. A back-of-envelope calculator helps them decide whether to talk to a customs broker about it, instead of ignoring the option or jumping in blindly.

**Critical view:** A generic calculator can mislead. Real FTZ economics depend on warehouse rent, broker fees, weekly entry savings, compliance burden, and merchandise processing fees — not just duty timing. We should clearly mark this as a directional estimate, not a financial decision.

**Adds value?** **Conditional — yes only if we keep it honest.** Useful as a "should I look into this?" gate. Most importers either don't know FTZ exists or assume it's only for big players. A simple calculator that says "yes, worth investigating" or "no, your volume is too small" saves users a meeting with a broker.

**Best target audience:** Mid-size importers with annual import value above ~$1M considering FTZ setup, businesses with seasonal stock or high re-export share, e-commerce sellers with returns flow, and finance teams comparing cash-flow scenarios.

### 5. Duty drawback eligibility checker

**What to show:** A short questionnaire where the user describes their goods, what they do with them (re-export, destroy, use in manufacturing), and rough volume. The tool tells them which type of drawback may apply (manufacturing, unused merchandise, rejected merchandise) and a rough estimate of recoverable duties.

**Target audience:** Importers who also export — contract manufacturers, distributors with international resale, pharmaceutical and electronics companies with returns flow, and businesses near border zones.

**Why it helps:** Drawback can recover up to 99% of duties paid on goods that are later exported or destroyed, but the rules are complex and most small importers leave money on the table. A simple checker that flags eligibility and shows rough recovery numbers can prompt users to start a real claim with a broker.

**Critical view:** Drawback applies to a small share of importers — those who actually re-export or destroy goods. For pure domestic-sale importers, it's irrelevant. The eligibility rules also have time limits (typically 5 years), recordkeeping requirements, and proof-of-export documentation that a checker can't fully validate. We must be clear this is a screening tool, not a claim filing.

**Adds value?** **Limited but real for the right user.** Niche feature — most importers won't qualify. But for the subset who do (manufacturers with export sales, distributors handling returns), it can flag meaningful recoverable duties they didn't know about. Worth building as a lightweight screener, not a flagship feature.

**Best target audience:** Contract manufacturers selling to overseas buyers, distributors and resellers with international customers, pharma and electronics importers handling returns or rejects, and e-commerce sellers shipping to Canada/Mexico/EU customers from U.S. inventory.
