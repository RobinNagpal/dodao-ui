# Stock Market Scenarios — Single-Stock Winners and Losers

Recurring policy, macro, and industry scenarios that meaningfully move specific _stocks_ (not whole sectors or asset classes — see [`../etf-analysis/etf-market-scenarios.md`](../etf-analysis/etf-market-scenarios.md) for the ETF-level version). Each entry covers the scenario's underlying cause, a dated historical analog with observed drawdowns, the named stock winners and losers (ticker-qualified as `EXCHANGE:SYMBOL`), and an **Outlook** block with probability, catalysts, and most-exposed names.

## Research process — read this BEFORE drafting a new scenario

The goal is named, dated, and numerically defended impact. Vague themes ("AI boom benefits chips") are not scenarios — they are tags. Every scenario in this catalog must carry a concrete catalyst, a dated analog, and per-stock impact estimates with timeframes. Authors who skip these steps produce content that looks plausible but cannot survive the next quarterly re-review.

**Cap each bucket at 5.** Five winners, five losers, five most-exposed. If you have ten plausible names, the ranking work _is_ the value-add — pick the five with the strongest, most-defensible exposure and explain why those five and not the others. A bucket with twelve names tells the reader you didn't finish the analysis.

**Work iteratively, in four phases.** Each phase is a stop-worthy save point. Finish one, commit / push / re-import the markdown, then move to the next. This keeps the diff small and lets you ship partial scenarios for review without holding work back until everything is perfect.

### Phase 1 — Scenario research (no per-stock detail yet)

The goal of Phase 1 is the **scenario skeleton**: the catalyst, a dated analog, the outlook, and the country scoping. **Do not name winners / losers / most-exposed yet** — leave those sections empty (or as TODOs). Phase 1 should be defensible on its own; if you cannot fill these in, the scenario is not ready.

1. **Pin the catalyst.** What specific decision or event triggers the move? Examples: an executive order with a docket number, an FOMC dot-plot shift, a CMS NPRM, a tariff schedule update, an FDA approval / refusal, a court ruling. The catalyst must have a verifiable source — link to the federal register entry, the central bank statement, the company filing, the court order, the rulemaking docket. If the catalyst is "expected but not yet confirmed", say so explicitly and reflect it in the probability number.
2. **Find a dated historical analog.** Locate at least one prior episode where the same kind of catalyst hit the same kinds of names. Pull the trading-day reaction: what did the most-exposed names do in the 5 / 30 / 90 days after the analog event? Cite numbers — `PFE -5%, MRK -6%, LLY -3% over the first three trading days` is useful; `pharma sold off` is not. If you cannot find an analog, this probably is not yet a scenario — write it up as a "watch" instead, or hold off.
3. **Draft the Outlook block.** Probability bucket (`High` >40%, `Medium` 20–40%, `Low` <20%) with a percentage band, timeframe (`3-6m` / `6-12m` / `12-18m` / `18-36m`), priced-in status (`not priced in` / `partially` / `mostly` / `fully` / `over-priced`), and a "signals to watch" sub-list. Update the `**Outlook (as of YYYY-MM-DD):**` line whenever you touch the outlook block.
4. **Scope the countries.** List in `**Countries:**` only the countries where a tagged ticker meaningfully trades. If you tag European pharma via US ADRs (`NASDAQ:AZN`, `NYSE:GSK`), keep the scenario `**Countries:** US` — the exchange is what matters, not the domicile. The import rejects links where the exchange's country is not in `**Countries:**`.

**Save point:** commit Phase 1 as "scenario skeleton — catalyst + analog + outlook" and re-run `pnpm import:stock-scenarios` if the row should be visible to admins for review. The buckets are still empty; that's fine.

### Phase 2 — Top 5 winners

Now and only now do you start naming names. The rule is: identify _every_ plausible winner first (long-list, may be 10–20), then rank by defensibility of upside, then keep the top 5.

1. **Source the long-list.** Sell-side sector notes published after the analog event (Citi, Goldman, Morgan Stanley, JPM, Bernstein, BofA), 10-K / 10-Q segment reporting, government rulemaking dockets (proposed vs finalized vs implemented), earnings-call transcripts, options-implied vol / skew on the analog event. Avoid blog speculation, threadboi tweets, anonymous Reddit sentiment, AI-summary recyclers, headlines without a primary source.
2. **Convert exposure to a price-change estimate.** For each candidate, estimate `expectedPriceChange` and `expectedPriceChangeExplanation`:
   - Start with **revenue exposure × consensus EPS sensitivity** from the 10-K / sell-side note.
   - **Cross-check against the analog episode's actual drawdown / rally** for that ticker.
   - **Bound by probability:** if the scenario is `Medium (20–40%)`, the estimate is roughly `prob × full-impact`. Stating a +25% target on a 25%-probability scenario is double-counting.
   - **Round to integers.** Don't claim precision you don't have.
   - The **explanation** should cite the band (`+8 to +14%`), the timeframe (`12–18m`), and the catalyst that drives it (`Phase 2 Part D extension`).
3. **Rank and trim to 5.** Drop candidates that are diversified-conglomerate-style ("technically exposed but the segment is 4% of revenue"), drop ones whose entire upside is already in consensus, drop ones with credible offsetting headwinds. Keep the 5 cleanest exposures.
4. **Write the bullets.** One bullet per winner, in bullet form (see "Per-stock bullet form" below) so the per-stock fields are captured.

**Save point:** commit Phase 2 as "winners bucket — top 5 with price targets" and re-import. Losers and most-exposed are still pending; that's fine.

### Phase 3 — Top 5 losers

Same workflow as Phase 2, applied to losers. Long-list every plausible loser, rank by defensibility of downside, keep the top 5. The price-change estimates here are negative; otherwise the rules in Phase 2 apply identically. If the scenario is `UPSIDE` overall, the losers list may be shorter than 5 (or empty) — but if you have downside names worth tagging, prefer five.

**Save point:** commit Phase 3 as "losers bucket — top 5 with price targets" and re-import.

### Phase 4 — Top 5 most exposed (right now)

The most-exposed bucket is **not** "winners + losers combined". It is "the 5 names whose share price is most-immediately sensitive to the **next** catalyst on the calendar". A name can be:

- A subset of the losers list (most common — the losers with the nearest-dated trigger).
- A name that's also in the winners list, if the next-catalyst leg is the one that proves the bet.
- A name that's not in either bucket, if the exposure is real but the directional case is too noisy for a defensible target.

Each most-exposed bullet **must** include the same per-stock fields as winners / losers — the next-leg price-change estimate, the catalyst that drives it, and the rationale. A most-exposed bucket that's just `NYSE:LLY, NYSE:NVO, NYSE:MRK` with no detail is not done — readers can't tell which one to watch first.

Place this as a **top-level** `**Most exposed:**` section (not inside the Outlook paragraph) so the parser captures the per-stock detail:

```
**Most exposed:**

- **NYSE:LLY** (-8%, next leg on Phase 2 GLP-1 announcement) — Consensus already cut 15% on Phase 1; the unpriced leg is Phase 2 Part D inclusion.
- **NYSE:NVO** (-8%, same Phase 2 trigger, plus EUR/USD amplifier) — ...
```

**Save point:** commit Phase 4 as "most-exposed bucket — top 5 with next-leg targets" and re-import. Scenario is now complete.

### Re-review cadence

- Re-read every scenario quarterly. Outlooks decay quickly: a scenario that was `High (~55-65%, 12-18m)` six months ago may now be `In progress, partially priced in` and need an updated **Most exposed** bucket.
- Update the `**Outlook (as of YYYY-MM-DD):**` line every time you touch the outlook block.
- If a scenario has fully played out, change the `**Outlook**` to "already happened" / "fully priced in" — the parser will reclassify the timeframe to `PAST`.
- When a most-exposed name's next-leg catalyst has fired, that name typically rotates _out_ of most-exposed (it's now priced in) and the next nearest-dated name rotates in.

## Format conventions (required by `src/utils/stock-scenario-markdown-parser.ts`)

- Heading: `### N. Title` (numbered, one per scenario).
- Tickers MUST be exchange-qualified — `NYSE:PFE`, `NASDAQ:LLY`, `LSE:GSK`. Bare symbols are ignored because non-US markets have too many all-caps collisions.
- Each scenario ends with an explicit `**Countries:**` line listing the supported countries whose markets the scenario covers. Exchanges of listed tickers must fall within those countries, or the import will reject the link.
- Outlook buckets are qualitative: **High** (>40%), **Medium** (20–40%), **Low** (<20%), plus **In progress / Already happened** where the move is largely absorbed.
- Scenarios are separated by `---` on its own line.
- **Cap each bucket at 5 names**: top 5 winners, top 5 losers, top 5 most-exposed. The parser does not enforce this — it's a content rule that keeps each scenario actionable.
- The **Most exposed** section must be a top-level `**Most exposed:**` field (peer of Winners / Losers / Outlook), in bullet form, so the parser captures per-stock price targets and rationale. Older scenarios that listed most-exposed inline inside the Outlook paragraph still parse via a legacy fallback, but new scenarios should use the top-level form.
- Re-review quarterly.

### Per-stock bullet form (recommended)

Use bullet form whenever you have per-stock detail. Inline form (`NYSE:LLY (Eli Lilly — ...)` inside a paragraph) still works for short scenarios but **cannot carry price-change estimates or timeframes**. Bullet form takes precedence when both appear in the same section.

```
**Winners:**

- **NYSE:TEVA** (+10%, 12-18m as Phase 1 substitution accelerates) — Largest pure-play generic; biggest beneficiary of Medicare branded-to-generic substitution.
- **NASDAQ:VTRS** (+8%, 12-18m) — Inherited Mylan's US generic portfolio, plus biosimilars optionality.
```

The parser splits each bullet into:

- **`expectedPriceChange`** — the signed integer in `(+N%, ...)`. Range `-100..100`. Optional.
- **`expectedPriceChangeExplanation`** — the comma-separated text inside the parenthetical. Use this for the timeframe + the rationale that defends the number. Optional.
- **`roleExplanation`** — everything after the em-dash separator (`—`). The "why this stock is a winner / loser" sentence. Optional but strongly recommended.
- **`pricedInBucket`** — detected from either the parenthetical or the role explanation, using the phrases below (case-insensitive). Defaults to `partially priced in` if no phrase is present. The matched phrase is stripped from the text so it doesn't render twice.

Supported priced-in phrases (use one per bullet, anywhere in the parenthetical or the explanation):

- `not priced in` (also: `unpriced`) → **NOT_PRICED_IN**
- `partially priced in` → **PARTIALLY_PRICED_IN** _(default)_
- `mostly priced in` → **MOSTLY_PRICED_IN**
- `fully priced in` → **FULLY_PRICED_IN**
- `over-priced` (also: `over priced in`) → **OVER_PRICED_IN**

A bullet with just a ticker (`- **NYSE:TEVA**`) parses correctly and saves with `expectedPriceChange`, `expectedPriceChangeExplanation`, and `roleExplanation` null and `pricedInBucket` = `PARTIALLY_PRICED_IN`. Skip the parenthetical entirely if you don't have a defended number — leave the field unset rather than guessing.

### Seed flow

`yarn import:stock-scenarios` (reads this file, POSTs to `/api/stock-scenarios` with `AUTOMATION_SECRET`). Admins can also paste the raw content into the admin import modal at `/admin-v1/stock-scenarios` for one-off runs.

---

### 1. Canadian Nation-Building Infrastructure Boom Under Bill C-5 Major Projects Office

**Underlying cause:** Mark Carney's Liberal government passed Bill C-5 (the "One Canadian Economy Act") in June 2025, creating a federal Major Projects Office (MPO) empowered to fast-track approvals for projects of national interest from the standard 10+ year permitting cycle down to roughly 2 years. The Carney cabinet has publicly floated a shortlist of 5–10 candidate projects for the 2025–2027 window with an explicit tilt toward energy sovereignty and export diversification away from the United States: a new oil pipeline to the Pacific coast, LNG Canada Phase 2 and its Coastal GasLink Phase 2 expansion, Pathways Alliance oil sands carbon capture, the Ring of Fire critical-minerals access road in Ontario, and Bruce Power nuclear refurbishment with additional Ontario SMR buildouts. The political framing is "build, baby, build" — a sharp reversal from Trudeau-era net-zero pacing. Canadian pipelines, LNG developers, oil sands producers, critical-minerals miners, nuclear fuel suppliers, and engineering / EPC firms all get a structural tailwind as the regulatory-duration discount on Canadian infrastructure compresses.

**Historical analog:** Three comparable episodes. (1) The Trans Mountain Expansion (TMX) sanction in 2019 after years of regulatory grind — the final investment decision added roughly 5–8% to ENB and TRP over the subsequent three months despite the federal buyout complication, and pulled Canadian pipeline sector multiples back toward US peer levels. (2) The 2022 US Inflation Reduction Act: permit fast-tracking for clean-energy projects added 15–25% to names like NEE and FSLR over the following 12 months as the regulatory discount compressed. (3) The 2010–2015 BC LNG first wave, which was killed by stretched approval timelines — Pacific NorthWest LNG (Petronas) was cancelled outright and LNG Canada Phase 1 FID slipped 4 years, killing roughly 30–40% of pipeline-sized project NPVs over the interim. Bill C-5 is explicitly designed to remove the duration discount that killed the 2010s Canadian project cycle.

**Winners:**

- **TSX:ENB** (+15%, 12-18m, partially priced in) — Enbridge. Canada's largest liquids-pipeline owner with the existing Mainline rights-of-way that any new Pacific-bound oil export pipeline would likely tie into. MPO designation of a specific Pacific pipeline project pulls forward 2–4 years of duration risk on a $15–20B capex program; the regulated-return model means that time compression flows almost directly to equity value. Current multiple gives partial credit for the Bill C-5 regulatory thaw since June 2025, but no specific project designation is in base-case cash-flow estimates. The unpriced leg is an MPO shortlist entry that names Enbridge as lead operator for either the Pacific pipeline or a Mainline expansion.
- **TSX:TRP** (+14%, 12-18m, partially priced in) — TC Energy. Primary operator of Coastal GasLink feeding LNG Canada Phase 1; Coastal GasLink Phase 2 to serve LNG Canada Phase 2 is an odds-on MPO candidate. TRP also owns 48% of Bruce Power, so any Ontario nuclear fast-tracking (SMR Phase 2 sanction, Bruce refurbishment extension) layers a second catalyst on top. Consensus 2027 EBITDA has started to incorporate some fast-track benefit after the Bill C-5 passage, but specific project designations would add another 4–6% leg. The equity already recovered from the 2024 South Bow spin-off drag, so the risk-reward is cleaner here than at any point in the last 18 months.
- **TSX:CVE** (+18%, 12-18m, not priced in) — Cenovus Energy. Largest participant in the Pathways Alliance oil sands carbon-capture consortium, with the highest per-share leverage to a Pathways MPO designation. A designated Pathways Alliance project unlocks 10+ years of already-committed capex acceleration, removes the political overhang that has compressed oil sands multiples versus US peers, and de-risks the Alberta federal-provincial CCUS credit structure. Street has not yet modeled Pathways completion by 2030 in any integrated oil sands name. Highest-beta Canadian oil sands name on direct project sanction.
- **TSX:WSP** (+10%, 12-18m, not priced in) — WSP Global. Montreal-headquartered engineering, design, and construction-management consultancy with deep Canadian federal and provincial government contracting history. Every MPO-designated project requires 12–24 months of early-stage engineering design, environmental permitting support, and construction management scoping — WSP is the dominant domestic bidder across all five candidate projects. Consensus has not incorporated an MPO project pipeline into the long-cycle bookings forecast. First-year contract awards would signal $1–2B of incremental multi-year bookings that translate to mid-single-digit EPS lift.
- **TSX:CCO** (+12%, 12-18m, partially priced in) — Cameco. Largest Western uranium producer, with direct exposure to Bruce Power refurbishment (via its uranium fuel contracts) and Ontario SMR buildout fuel supply. MPO nuclear designation accelerates Ontario's 4x SMR commitment at Darlington and extends the Bruce refurbishment timeline — both underwrite multi-decade Canadian-sourced uranium demand on top of the global fuel-cycle tightness. Cameco has already rallied on the broader uranium cycle, so part of this is in the multiple; the unpriced leg is Canadian-federal nuclear policy specifically.

**Losers:**

- **TSX:NPI** (-12%, 12-18m, partially priced in) — Northland Power. Independent power producer with heavy European offshore wind and Canadian onshore wind exposure. Carney's energy pragmatism shifts federal project-support capital and PPA priority toward nuclear, LNG, and natural-gas peaker projects; NPI's Canadian wind development pipeline loses federal co-funding flexibility relative to Bruce Power-adjacent nuclear. The multiple has partially de-rated since Bill C-5 passed, but execution risk on the Taiwan Hai Long offshore wind project layers additional downside.
- **TSX:BLX** (-8%, 12-18m, partially priced in) — Boralex. Québec-anchored independent renewable developer; federal project designations skew to nuclear, LNG, and pipelines rather than wind/solar, so federal co-funding priority falls. Québec provincial support remains intact, but the rotation out of Canadian renewables toward MPO-designated energy names is a relative-value headwind. Already trades at a discount to its 2023 multiple; partial de-rating is done but Bill C-5 locks in the sector rotation.
- **TSX:PPL** (-6%, 12-18m, partially priced in) — Pembina Pipeline. Midstream operator with pipeline scope that overlaps with the new Pacific-bound oil infrastructure but is not the odds-on operator versus Enbridge. MPO designation of Enbridge-led projects removes Pembina's optionality on the headline Pacific export corridor and funnels growth capital to competitors. Core business remains fine; the loss is in opportunity cost, not fundamentals. Moderate headline sensitivity to MPO shortlist announcements.
- **TSX:FTS** (-5%, 12-18m, partially priced in) — Fortis. Regulated utility with roughly 60% US revenue mix; underperforms on relative rotation as Canadian investors lean into project-beta names (TRP, ENB, CCO) rather than low-beta regulated utilities. Not fundamentally damaged by Bill C-5 — rate-base regulation is unaffected — but the relative-value rotation compresses the multiple versus Canadian project-exposed peers. Defensive qualities remain intact.
- **TSX:EMA** (-4%, 12-18m, partially priced in) — Emera. Nova Scotia regulated utility with Florida exposure through Tampa Electric; similar rotation dynamic to Fortis, with no direct Bill C-5 project participation. Underperforms on Canadian investor rotation toward MPO-designated names, not on fundamentals. Lowest headline sensitivity in the cohort — this is a quiet relative-value drag, not a directional loss.

**Most exposed:**

- **TSX:CVE** (+20%, next leg on Pathways Alliance MPO designation, not priced in) — Cenovus Energy. Pathways Alliance carbon capture is the highest-beta Canadian Bill C-5 candidate: consensus 2027–2030 EBITDA gives essentially zero credit for Pathways sanction, so a designation event resets the valuation floor. MPO designation plus a federal-provincial CCUS credit-structure MoU would add 15–20% to the stock in a single session and re-rate the broader oil sands cohort. Watch for the MPO shortlist publication in Q2 2026, Alberta CCUS credit finalization, and Pathways Alliance joint-venture governance announcements.
- **TSX:ENB** (+8%, next leg on Pacific oil pipeline MPO designation, partially priced in) — Enbridge. The single largest discrete Bill C-5 announcement would be federal backing of a new Pacific-bound oil export pipeline. Enbridge is the odds-on operator given its Mainline asset base and pipeline operating track record. MPO designation would trigger a clean 5–10% leg as duration risk compresses. Watch the MPO shortlist publication, cabinet-level approval votes, and any federal-provincial MoU with British Columbia on corridor routing.
- **TSX:CCO** (+10%, next leg on Bruce Power refurb plus Ontario SMR designation, partially priced in) — Cameco. Ontario's SMR buildout at Darlington and the Bruce Power refurbishment extension are two separate MPO candidates; either designation adds 5–8% to Cameco, both together would add 10–15%. Watch for OPG SMR Phase 2 approval, Bruce Power financing-structure announcements, and the MPO shortlist publication. Cameco's uranium contract-book visibility makes this the cleanest MPO nuclear beneficiary.
- **TSX:WSP** (+8%, next leg on early-stage engineering contract awards, not priced in) — WSP Global. Once MPO designations hit, first-year engineering RFPs issue within 6–12 months — WSP is the odds-on bidder for at least 3 of the 5 candidate projects. Early contract awards would signal $1–2B of incremental multi-year bookings that translate to mid-single-digit EPS lift. Watch for MPO project-by-project engineering RFPs starting Q1 2026 and early design-phase contract announcements.
- **TSX:TRP** (+6%, next leg on Coastal GasLink Phase 2 FID, partially priced in) — TC Energy. LNG Canada Phase 2 requires Coastal GasLink Phase 2 expansion; MPO designation accelerates the FID by 12–18 months. Street already has partial credit in the 2028 numbers, so an FID announcement in 2026 rather than 2027–2028 pulls forward 2028 cash flows and adds 4–6% to the stock. Watch for Shell / Petronas / PetroChina Phase 2 FID joint-venture approval and British Columbia provincial permitting updates.

**Outlook (as of 2026-04-25):** Bill C-5 is law, the Major Projects Office is staffed, and the Carney cabinet has publicly committed to an MPO shortlist of 5–10 national-interest projects by Q2–Q3 2026. High probability (~55–65%) that at least 4 of the 5 candidate projects (Pacific oil pipeline, LNG Canada Phase 2 / Coastal GasLink 2, Pathways Alliance CCUS, Ring of Fire access road, Bruce / Ontario nuclear) receive MPO designation within 12 months and reach FID within 18–24 months. Political durability is the main question: a Liberal minority dependence on NDP / Bloc votes could force concessions on oil pipeline scope, but Carney's post-tariff approval rating and cross-partisan support for Canadian energy sovereignty make broad rollback unlikely. **Priced-in status:** partially. Pipeline, LNG, and nuclear-fuel names have rallied 8–15% since Bill C-5 passed, but specific project designations are not yet in base-case estimates. **Signals to watch:** MPO shortlist publication (Q2 2026 target), cabinet-level project approval votes, federal-provincial MoUs on Pathways and the Pacific pipeline, OPG SMR Phase 2 sanction, Coastal GasLink Phase 2 FID, Ring of Fire federal funding announcement.

**Countries:** Canada

---

### 2. Canadian Immigration Cuts and Housing Demand Shock

**Underlying cause:** Starting in late 2024, the federal government reduced permanent-resident targets from the prior 485k / 500k / 500k baseline for 2025–2027 to 395k / 380k / 365k, and committed to bringing the temporary-resident share of population from roughly 7% down toward 5% by 2027 — a net reduction of 500k+ temporary residents over three years. The Carney government has affirmed those targets and signaled tighter international-student caps for the 2026–2027 intake cycles. The transmission mechanism is simple: removing 100–150k per year of PR intake and cutting temporary-resident flows is a direct demand-side shock to rental housing, new condo sales, and per-capita goods consumption. Canadian multifamily REIT NOI-growth assumptions, residential developer pre-construction sales, and Big Six bank mortgage origination volumes all reset lower — a structural level shift, not a cyclical dip. The secondary effect is a per-capita real-income boost for existing Canadians (slower wage competition, slower housing-cost growth) that lifts discretionary retail.

**Historical analog:** Two comparable episodes. (1) Australia's 2009–2010 temporary-resident caps under the Rudd government: Sydney / Melbourne rental growth decelerated from 7–9% to 2–3% over 18 months and major Australian residential REITs (Mirvac, Stockland at the time) de-rated 12–18% on multiple compression alone, even before NOI-growth forecasts were revised lower. (2) The 2016–2017 Canadian Foreign Buyer Tax / Empty Homes Tax package in Vancouver and Toronto: major condo developer names (Brookfield Residential pre-spinoff, Tridel's public vehicles) took 15–20% drawdowns over six months as the demand reset worked through pre-construction sales. The 2025–2027 national immigration cut is broader than both — it is national rather than metro-specific and stacks PR and temporary-resident cuts simultaneously.

**Winners:**

- **TSX:DOL** (+8%, 12-18m, not priced in) — Dollarama. Discount retailer whose unit economics scale with per-capita disposable income, not aggregate population growth. As per-capita real income stabilizes for existing Canadians (less housing-cost inflation, less immigrant-wage wage pressure at the low end), Dollarama comp-store sales trend higher. Street models still use 2023-era population-growth forecasts in the total-addressable demand runway. Dollarama is the highest-beta Canadian retail winner on the per-capita rotation.
- **TSX:L** (+6%, 12-18m, not priced in) — Loblaw Companies. Grocery / pharmacy with pricing power that benefits from lower immigrant-wage labor-cost growth in the store footprint. Housing-cost share of consumer wallet falls, leaving more for discretionary grocery trade-up (President's Choice Black Label, prepared foods, Shoppers beauty). Some is captured in the multiple already, but not yet in per-capita-growth revenue forecasts. The rotation case is quieter than Dollarama but lower beta and larger-cap.
- **TSX:MFC** (+5%, 12-18m, partially priced in) — Manulife. Canadian life insurer with wealth-management distribution that benefits from the asset-accumulation phase for existing population as new-immigrant demand headwinds fade from Canadian real estate. Higher real per-capita wealth translates to higher wealth-management fees and more retirement-savings inflows. Rotation play rather than direct beneficiary; partial credit already in the stock since Q3 2025. Low-beta winner.
- **TSX:GIB.A** (+5%, 12-18m, not priced in) — CGI Group. IT services firm with heavy Canadian federal and provincial government contracting; benefits as government spending pivots toward digital-government efficiency programs to offset the GDP-growth slowdown from lower population growth. Consensus has not modeled a government-digitization spending cycle tied to the immigration reset. Low-beta winner with government contract visibility extending to 2028.
- **TSX:OTEX** (+5%, 12-18m, not priced in) — Open Text. Information-management software with government and enterprise footprint; rides the same digital-government efficiency rotation as CGI, with the added optionality of takeout interest if the multiple remains depressed. Not yet in consensus as an immigration-cut beneficiary. Quiet rotation name rather than a headline trade.

**Losers:**

- **TSX:CAR.UN** (-18%, 12-18m, partially priced in) — Canadian Apartment Properties REIT. Largest publicly traded Canadian multifamily REIT with rental-demand growth sensitivity the highest in the sector. Rental-rate growth decelerated from 7–9% to 2–3% through 2025, but consensus 2027 NOI still embeds 4–5% rental growth, which will miss. Partial de-rating has happened since Q3 2025 but the gap between consensus rent growth and reality remains wide. The unpriced leg is the FY 2026 rent-growth guidance cut at Q4 2025 earnings.
- **TSX:IIP.UN** (-20%, 12-18m, partially priced in) — InterRent REIT. Smaller, higher-beta multifamily REIT with Ottawa and Montreal portfolio tilt — both markets had the highest per-capita temporary-resident concentration (international students, federal government contractors) and will see the sharpest rent-growth deceleration through 2026. Highest-beta loser in the REIT cohort. Partial move has happened since Q4 2024; further quarterly rent-data disappointments drive the next leg.
- **TSX:KMP.UN** (-14%, 12-18m, partially priced in) — Killam Apartment REIT. Atlantic-Canada-focused apartment REIT with Halifax, Moncton, and PEI concentration; these markets absorbed an outsized share of secondary-migration international students and temporary foreign workers in 2022–2024. Sharp reversal on those intake channels leaves Killam with above-market rental softening. The de-rating is partly done, but the discount to replacement cost has not yet normalized.
- **TSX:BEI.UN** (-12%, 12-18m, partially priced in) — Boardwalk REIT. Calgary- and Edmonton-focused apartment REIT; Prairie immigration intake surged in 2022–2024 as temporary foreign workers flowed to oil sands and trades, and the reset hits those markets hard. Prairie-specific rental-data releases through 2026 are the catalyst for further NOI downgrades. Partial de-rating is complete but the cap-rate gap to peer markets has not yet compressed.
- **TSX:RY** (-6%, 12-18m, mostly priced in) — Royal Bank of Canada. Largest Canadian bank; residential mortgage origination volumes decelerate structurally with population growth, impacting 2026–2027 loan-book growth assumptions. Not a fundamental disaster given the HNW wealth, capital-markets, and US commercial offsets, but the Canadian mortgage growth engine resets. Street has partially modeled the slowdown; most of the Canadian-retail multiple compression is already in the stock price.

**Most exposed:**

- **TSX:IIP.UN** (-10%, next leg on Q1 2026 rental-growth disappointment, partially priced in) — InterRent REIT. The Q1 2026 rent-growth data release is the next discrete catalyst. Ottawa and Montreal market reports will confirm whether rent growth decelerates to 1–2% or stays flat — either way the 4–5% consensus embedded in 2026 NOI is wrong. Highest near-dated sensitivity in the REIT cohort. Watch Urbanation, CMHC rental market reports, and InterRent's own Q1 2026 earnings release for the trigger.
- **TSX:CAR.UN** (-8%, next leg on 2026 rent-growth guidance cut, partially priced in) — Canadian Apartment Properties REIT. The next discrete trigger is the FY 2026 rent-growth guidance at Q4 2025 earnings. Street expects 3–4%; market rent-growth data is tracking at 1–2%. A guidance cut drives a clean 5–8% leg as consensus 2026 NOI compresses. Watch CAPREIT Q4 2025 earnings and the CMHC 2025 rental market report for the setup.
- **TSX:BEI.UN** (-8%, next leg on Prairie-specific rental data, partially priced in) — Boardwalk REIT. Calgary and Edmonton rental data through H1 2026 is the next catalyst — Prairie rent growth peaked later than Toronto / Montreal, so the full immigration-reset drag shows up in 2026 data rather than 2025 data. Highest Prairie-specific exposure in the cohort. Watch CMHC Calgary / Edmonton rental reports and Boardwalk Q1 / Q2 2026 earnings commentary.
- **TSX:RY** (-4%, next leg on 2026 mortgage origination guidance, partially priced in) — Royal Bank of Canada. Q4 2025 / Q1 2026 guidance for residential mortgage origination volumes is the next catalyst. Street has most of the slowdown in numbers but not the full magnitude of the reset. Lowest-beta Canadian-retail bank to immigration shock but still moves on guidance. Watch Big Six bank earnings season for mortgage-book commentary.
- **TSX:TD** (-4%, next leg on Canadian mortgage book growth, mostly priced in) — Toronto-Dominion Bank. Same Canadian retail banking exposure as RBC, with the added AML remediation overhang limiting balance-sheet growth. Mortgage origination deceleration compounds the existing TD problem list. Most of the damage is in the multiple already; further downside is guidance-dependent. Watch TD Q1 / Q2 2026 guidance updates and AML remediation milestones.

**Outlook (as of 2026-04-25):** Immigration cuts are already in effect — the 2025 PR target reduction has flowed through, and temporary-resident intake is declining sharply. Medium-to-high probability (~45–55%) that the Carney government tightens further for the 2026–2027 intake cycles given housing-affordability political salience. The main tail risk is partial reversal under Conservative pressure post-2026, but even Conservative platforms have embraced the immigration caps, so a material reversal is unlikely. **Priced-in status:** partially. Multifamily REITs have de-rated but 2026–2027 NOI-growth assumptions still look optimistic. Canadian retail banks have partially adjusted. Retail beneficiaries (DOL, L) have barely moved. **Signals to watch:** Q1 2026 CMHC rental-market report, Urbanation pre-construction condo sales, Big Six bank mortgage-origination guidance at Q4 2025 / Q1 2026 earnings, 2026–2027 IRCC PR target announcement, international-student cap update for the 2027 intake cycle.

**Countries:** Canada
