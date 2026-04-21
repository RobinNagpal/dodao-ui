# ETF Reports — KoalaGains (Status + Next Tasks)

## Status (already done) ✅

- [x] All ETF financial-data is fetched and available for report generation.
- [x] Report generation pipeline is working end-to-end.
- [x] UI exists for ETF detail report page plus 3 separate category pages.
- [x] ETF categories are divided into groups in `insights-ui/src/etf-analysis-data/etf-analysis-categories.json`.
- [x] Analysis factors exist per category:
  - `insights-ui/src/etf-analysis-data/etf-analysis-factors-performance-and-returns.json`
  - `insights-ui/src/etf-analysis-data/etf-analysis-factors-cost-efficiency-and-team.json`
  - `insights-ui/src/etf-analysis-data/etf-analysis-factors-risk-analysis.json`
- [x] Price chart section is done.
- [x] Introductory paragraphs are done (including index & strategy fields).

## What we need now (new tasks)

### A) Review and finalize category grouping

- [ ] **Audit the current groups** in `etf-analysis-categories.json`.
  - Confirm each group has a clear investing “intent” (e.g., broad market, sector, dividend, growth, value, bonds, commodities).
  - Identify overlaps and ambiguous placements (ETFs that could belong to multiple groups).
  - Decide whether groups are **mutually exclusive** or **multi-tag** (ETF can appear in multiple groups).
- [ ] **Finalize a stable taxonomy**:
  - Lock group keys/names and short descriptions (used in prompts + UI).
  - Define “primary group” selection rules if multi-tag is allowed.

### B) Finalize analysis factors for each category (per group)

We will finalize factors per group for each of the 3 analysis categories:
`PerformanceAndReturns`, `CostEfficiencyAndTeam`, `RiskAnalysis`.

- [ ] **Review existing factor JSONs** (3 files above) and decide:
  - Which factors are universal (apply to all groups).
  - Which factors must be group-specific (e.g., bond duration/credit risk vs equity growth vs commodity roll yield considerations).
- [ ] **Create/confirm a mapping**: `groupKey -> { performanceAndReturnsFactors, costEfficiencyAndTeamFactors, riskAnalysisFactors }`.
  - Decide whether we store this mapping in a new JSON (recommended) vs embedding into existing category/group JSON.
- [ ] **Finalize factor naming + keys** (backward compatibility):
  - Ensure factor keys are stable and won’t break existing saved results.
  - Define a versioning approach if we plan to evolve factors.

### C) Review and finalize prompts (per group + category)

- [ ] **Finalize prompt** for:
  - Performance & Returns
  - Cost Efficiency & Team
  - Risk Analysis
- [ ] **Golden test set**:
  - Pick 2–3 ETFs per group, run prompts, and validate output quality/consistency.

### D) Build “Most famous ETFs” dataset (per group)

- [ ] **Identify the most famous ETFs** under each group.
  - Selection criteria: AUM, liquidity/volume, popularity/recognition, longevity, issuer reputation.
- [ ] **Add a JSON dataset** in codebase with:
  - `groupKey -> famousEtfs[]` (symbol, exchange, name, issuer, why-famous, optional AUM/expense ratio snapshot if available).
  - Keep it editable by humans and suitable for prompt conditioning.
- [ ] **Add minimal validation/types** for the JSON (runtime validation optional, TS types required).

### E) New report section: “Comparison with famous ETFs”

Goal: Compare the current ETF against the group’s famous ETFs and answer: “Why would we choose this ETF over those?”

- [ ] **Define input schema** for this section:
  - Current ETF summary (fees, AUM, performance, holdings concentration, tracking, risk metrics).
  - “Famous ETF set” from the JSON (and optionally their live-fetched stats if available).
  - Group context (what investors typically want from this group).
- [ ] **Define output schema** for this section:
  - Comparisons table/list (current vs each competitor).
  - “Choose this ETF if…” bullets.
  - “Prefer competitor if…” bullets.
  - Final recommendation + rationale + caveats.
- [ ] **Finalize prompt** for this section.
- [ ] **Database (Prisma) changes**:
  - Add a model to store this new section output per ETF (and per group/version).
  - Decide if results are stored as structured columns vs JSON blob + derived fields.
- [ ] **Pipeline changes**:
  - Add this as a new generation step (with dependencies on the 3 category analyses if required).
  - Add callback saving logic and status tracking.
- [ ] **UI changes**:
  - Add new section on ETF report page to display comparisons and “why choose” reasoning.

### F) Competition module (dynamic competitor picking + analysis)

Goal: A new “competition section” where competitors are selected based on same category/group and AUM proximity (and optionally liquidity, expense ratio band).

- [ ] **Competitor selection logic**:
  - Rules: same group/category, similar AUM size bands, optional issuer diversity.
  - Cap competitor count (e.g., 5–10) and define tie-breakers.
- [ ] **Generate competition analysis**:
  - Narrative + key differentiators (fees, AUM, liquidity, tracking, holdings concentration, risk).
- [ ] **Define input schema**:
  - Current ETF + selected competitors with comparable metrics.
  - Group context and scoring preferences.
- [ ] **Define output schema**:
  - Ranked competitor list + rationale.
  - Chart-ready series (for competition chart).
  - “Closest substitutes” and “best alternatives for X goal”.
- [ ] **UI**:
  - Separate page for competition analysis.
  - Competition chart similar to what we do for stocks (metric comparisons + tooltips).
  - “Similar ETFs” section on main ETF page linking to competitors.
- [ ] **Pipeline + storage**:
  - Prisma schema additions for competition analysis results.
  - Add generation step(s) + callback saving + caching.
- [ ] **Finalize prompt** for competition analysis.

### G) SEO, metadata, and sitemap automation

- [ ] **SEO/metadata review** after new sections:
  - Ensure titles/descriptions include comparison + competition keywords where appropriate.
  - Confirm structured data (JSON-LD) remains valid and updated.
- [ ] **Daily generation + sitemap updates**:
  - Generate 5–10 ETFs daily.
  - Push generated ETF URLs to sitemap (or sitemap index) automatically.
  - Add monitoring/visibility: counts, last-run timestamp, failures.
