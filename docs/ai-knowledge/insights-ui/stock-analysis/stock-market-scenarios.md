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

### 1. Medicare Most-Favored-Nation (MFN) Drug Price Caps

**Underlying cause:** The Trump administration's 2025 executive order on Most-Favored-Nation prescription-drug pricing directs HHS to set Medicare reimbursement for selected high-cost brand-name drugs at no more than the lowest price paid by any comparable OECD country. Phase 1 targets Medicare Part B physician-administered drugs (oncology infusions, ophthalmology biologics, rheumatology biologics). A proposed Phase 2 extends MFN to Part D blockbusters — most notably the GLP-1 franchise (semaglutide, tirzepatide) and oral oncology (Ibrance, Verzenio). For the most-exposed brand-name makers this is a structural 30–80% price cut on affected SKUs, not a one-time rebate: ex-US reference prices for the same molecules often sit at 15–40% of the US list. US Medicare typically contributes 35–45% of global revenue for mature branded drugs, so a multi-year earnings reset — not just a single-quarter hit — is the expected shape.

**Historical analog:** Three comparable episodes. (1) The 2020 Trump MFN interim final rule cut Part B drug reimbursement to international benchmarks; it was blocked in federal court before taking effect but pharma still sold off 3–8% on the announcement (PFE -5%, MRK -6%, LLY -3% over the first three trading days). (2) The 2022 Inflation Reduction Act's Medicare negotiation program: the first ten drug list was published in August 2024 and negotiated prices took effect January 2026. Names exposed on the list saw 5–20% drawdowns in the weeks after selection (BMY's Eliquis franchise and JNJ's Xarelto / Stelara drove the moves). (3) The UK's 2019 Voluntary Pricing and Access Scheme, which capped NHS branded-drug spending growth, compressed AstraZeneca's UK branded revenue by roughly 15% over three years. The 2025 MFN order is broader in scope than (1) and has firmer statutory footing via the 2024 Medicare amendments, making it less reversible than the first attempt.

**Winners:**

- **NYSE:TEVA** (+10%, 12-18m as Medicare substitution accelerates, not priced in) — Largest pure-play global generics maker; every Medicare-covered brand that goes generic flows through Teva's manufacturing and distribution footprint first. A Phase 2 Part D extension that reaches GLP-1s and oral oncology unlocks billions in new prescription volume — sell-side 2027 EPS estimates have not yet incorporated MFN-driven substitution acceleration. Consensus could step up 6–8% on a credible Phase 2 announcement, with most of the lift landing in the Q1–Q2 after the headline. The main offset is Teva's debt load, which amplifies equity moves in either direction; beta to MFN headlines is among the highest in the cohort.
- **NYSE:AMRX** (+14%, 12m, small-cap leverage to substitution volumes, not priced in) — Amneal Pharmaceuticals. US-focused generic and biosimilar pipeline with a small revenue base, so each MFN-driven substitution mandate flows almost dollar-for-dollar to the top line — operating leverage is the entire thesis. The biosimilars portfolio (insulin, adalimumab analogues, future Stelara biosimilar) is the structural call option: Phase 2 would make biosimilar substitution the default for Part D blockbusters. Sell-side coverage is thin and consensus models still treat substitution share gains as flat, which leaves clean upside if Phase 2 lands. Highest-beta winner in the cohort by a wide margin and the most likely "double-digit move on a single headline" name.
- **NASDAQ:VTRS** (+8%, 12-18m, partially priced in) — Viatris. Inherited Mylan's US generic portfolio plus the Upjohn off-patent franchise, with biosimilars optionality (Semglee insulin, adalimumab, etcetera). 2027 EPS sensitivity is roughly 5% per 100bps of branded-to-generic substitution share gain — and Phase 2 could move that share by 200–400bps over an 18-month horizon. The market started awarding partial credit for the biosimilars pipeline after the Q3 2025 update, so a portion of this thesis is already in the multiple. Further upside hinges on Viatris actually capturing share, not just on policy tailwind — execution risk is the main caveat.
- **NASDAQ:VRTX** (+6%, 12-18m, relative outperformance vs sector, not priced in) — Vertex Pharmaceuticals. The cystic fibrosis franchise is orphan-designated end-to-end, and orphan drugs are statutorily excluded from MFN scoping under both the 2020 IFR and the 2025 EO. The trade is "sector down, Vertex flat" — MFN drags every other branded-pharma name down without touching VRTX revenue, so on broad sector-down days Vertex picks up relative alpha. The market still treats Vertex as a generic large-cap pharma name when MFN headlines hit, so the relative-value gap has not closed yet. Catalyst is each MFN headline that takes Lilly / Merck / Bristol down 4–6% while Vertex stays flat or up.
- **NYSE:MCK** (+4%, 12-18m, partially priced in) — McKesson. Drug distributors are paid on prescription volume, not list price, so MFN's lower out-of-pocket pricing translates directly to higher fill rates and more cases through the warehouse. It's a quiet positive — no single narrative catalyst, just steady volume tailwind through 2027. McKesson has already rallied on the volume-leverage thesis since the May 2025 EO, so a portion of the move is in the multiple. The remaining unpriced leg is Phase 2 specifically: Part D blockbuster substitution would lift script counts more than Part B physician-administered drugs, which is what the rally to date has been priced for.

**Losers:**

- **NYSE:LLY** (-18%, 12-18m if Phase 2 Part D includes GLP-1s, partially priced in) — Eli Lilly. Mounjaro / Zepbound list at ~$1,060 in the US versus ~$275 in Germany; the GLP-1 franchise is the single largest target by addressable Medicare revenue, and Lilly's revenue mix is the most concentrated of the large-cap pharma names. Sell-side has already cut consensus 2026 EPS by 12–18% to reflect Phase 1 scope and EO political durability. The unpriced leg is a credible Phase 2 announcement that explicitly names semaglutide / tirzepatide for Part D MFN scoping — that would add another 5–10% downside as analysts re-price the back end of the franchise. Litigation tail-hedge (First Amendment / non-delegation) limits but does not remove the risk; IRA-precedent rulings make a broad injunction unlikely.
- **NYSE:NVO** (-18%, 12-18m, partially priced in) — Novo Nordisk ADR. Ozempic / Wegovy run the same 70–80% transatlantic price gap as Mounjaro / Zepbound, so any Phase 2 Part D inclusion of GLP-1s hits Novo and Lilly in lockstep on the addressable-revenue math. The ADR adds an EUR/USD amplifier on top: if Novo's hedging programs unwind on the policy news, USD investors take additional currency drag of 2–4% beyond the headline. Consensus has cut numbers similarly to LLY but Phase 2-specific GLP-1 scenarios are not yet in the base case for either name. Trades headline-by-headline alongside LLY — the typical correlation in MFN-news windows is 0.85+.
- **NYSE:MRK** (-14%, 12-18m, Phase 2 includes Keytruda, not priced in) — Merck. Keytruda is the world's #1 drug by revenue and sits squarely in the Phase 2 oncology / immuno-oncology target set, with US Medicare contributing roughly 30% of Keytruda revenue. The Street has not baked in MFN-specific Keytruda re-pricing — most models use the existing Keytruda 2028 patent-cliff curve as the only major step-down. Phase 2 inclusion would compound the patent cliff with a margin reset on the front half of the cliff window, accelerating the earnings-decline slope by 3–5 percentage points per year. The HHS Phase 2 list publication is the discrete catalyst that would re-rate the stock 5–10% lower in the days following.
- **NYSE:BMY** (-12%, 12m, Eliquis already in IRA negotiation, partially priced in) — Bristol-Myers Squibb. Eliquis is in Round 1 of the IRA Medicare negotiation, with the negotiated price effective January 2026 — that hit is in numbers already. MFN compounds the IRA hit by re-pricing Eliquis below the negotiated number on Medicare Part D claims, and forces a re-rating of the franchise's terminal value once Eliquis-class follow-ons enter the pipeline. The IRA piece is mostly absorbed; the MFN-specific compounding leg is what's still unpriced and is the cleaner near-dated catalyst. Multiple cushion is thin given the dividend payout ratio and the Celgene-pipeline overhang, so further EPS cuts translate near-1:1 into share-price moves.
- **NYSE:ABBV** (-12%, 12-18m, partially priced in) — AbbVie. Skyrizi and Rinvoq are the two drugs picking up the revenue load post-Humira biosimilars; both are Part D blockbusters, both MFN-eligible, and both are scoped explicitly in the Phase 2 working drafts that have leaked from HHS rulemaking comments. Consensus has the Humira-cliff transition mostly modeled, but Phase 2 inclusion of Skyrizi / Rinvoq would compress the 2027–2030 ramp and reset the dividend coverage math. Mature dividend means the equity has limited valuation cushion when expected EPS gets cut. The unpriced leg is specifically Phase 2 inclusion of immunology Part D drugs — Phase 1 is already in numbers.

**Most exposed:**

- **NYSE:LLY** (-8%, next leg on Phase 2 GLP-1 inclusion announcement, partially priced in) — Eli Lilly. Consensus has already cut ~15% since the May 2025 EO to reflect Phase 1 risk, but the next discrete leg — an HHS Phase 2 announcement that explicitly names semaglutide / tirzepatide for Part D MFN scoping — is still ahead. That is the highest near-dated sensitivity in the cohort: a Phase 2 list publication moves Lilly first because no other US name has comparable GLP-1 Medicare exposure. Watch the HHS rulemaking docket and the CMS Part D NPRM for the catalyst, plus any leaked working-draft list that names tirzepatide. Expect a 5–10% same-day move on the announcement and a longer 12-month re-rating that rolls further into the back-end of the franchise.
- **NYSE:NVO** (-8%, same Phase 2 trigger, plus EUR/USD amplifier, partially priced in) — Novo Nordisk ADR. Trades headline-for-headline with LLY on GLP-1 mix; the same Phase 2 Part D announcement that hits LLY hits NVO with very similar magnitude. The additional leg is the EUR/USD amplifier when the ADR re-prices and Novo's hedging programs unwind, adding 2–4% of FX-driven drag on top of the policy headline. Consensus has cut numbers but not at the Phase 2 specific level for GLP-1 inclusion. Will move on the same headlines as LLY, often within minutes — typical correlation in MFN-news windows is 0.85+ and there is no reasonable scenario where one moves and the other does not.
- **NYSE:MRK** (-7%, Keytruda Phase 2 inclusion, not priced in) — Merck. The Street has not baked MFN re-pricing of Keytruda specifically into models — most are still anchored to the 2028 patent-cliff curve as the only major Keytruda step-down. Any HHS Phase 2 list that names Keytruda is a clean 5–10% leg from current prices, with most of the move landing same-week. MFN compounds the existing patent cliff by cutting margins on the front half of the cliff window, which the cliff models do not assume. This is the cleanest "list publication = stock down" trade in the cohort given how little MFN-specific Keytruda risk is currently in the multiple.
- **NYSE:BMY** (-6%, Eliquis MFN stack on top of IRA, partially priced in) — Bristol-Myers Squibb. The IRA negotiated Eliquis price effective January 2026 is already in the BMY tape and consensus models. A Phase 2 announcement that re-prices Eliquis below the IRA number compounds the hit and resets the franchise terminal value beyond the IRA assumptions — an outcome no model currently runs. The IRA piece is in price; the MFN compounding leg is not. Watch the HHS Phase 2 list and any joint IRA / MFN guidance docs from CMS for the trigger; expect a 4–7% same-day move if Eliquis appears on a Phase 2 list.
- **NYSE:JNJ** (-5%, Stelara / Darzalex / Imbruvica, mostly priced in) — Johnson & Johnson. Stelara LOE was already priced into the late-2025 sell-off; consensus has the biosimilar-driven revenue decline modelled with reasonable accuracy. MFN brings that decline forward 2–4 quarters and forces a re-rating of the J&J MedCo segment that the diversified-conglomerate tag had been masking. Most of the directional move is in the multiple already; what's left is timing and depth of the decline curve, not direction. Lowest near-dated MFN sensitivity of the five most-exposed names — the most likely candidate to rotate out of this bucket once Phase 1 implementation lands.

**Outlook (as of 2026-04-25):** Phase 1 implementation is already in progress — the HHS rulemaking on Part B MFN reimbursement is through public comment and first payment-model adjustments land in mid-2026. High probability (~55–65%) that the most-severe sub-cases — broad Phase 2 Part D extension including GLP-1 inclusion — reach implementation over the next 12–18 months and remain in force. The executive order is in effect, statutory backing is firmer than the 2020 attempt, and 2026 is a midterm year in which visible drug-price reductions are politically rewarded. The main tail risk is judicial: pharma is litigating on First Amendment / non-delegation grounds, but the IRA Medicare negotiation has already survived analogous challenges, so a broad injunction against MFN looks unlikely. **Priced-in status:** partially. Consensus 2026 EPS has been cut 8–15% for LLY / MRK / BMY / JNJ since the May 2025 EO, but the Phase 2 Part D extension is not yet in base-case street models — a credible Phase 2 announcement could add another 5–10% downside leg. **Signals to watch:** HHS Phase 1 drug list publication, CMS Part B payment-model NPRM timing, pharma Q2/Q3 2026 revenue-guidance revisions, litigation docket in D.D.C. and the Fifth Circuit, any bipartisan Senate pushback on Phase 2 scope.

**Countries:** US
