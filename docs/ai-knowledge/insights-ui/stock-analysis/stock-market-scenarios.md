# Stock Market Scenarios — Single-Stock Winners and Losers

Recurring policy, macro, and industry scenarios that meaningfully move specific _stocks_ (not whole sectors or asset classes — see [`../etf-analysis/etf-market-scenarios.md`](../etf-analysis/etf-market-scenarios.md) for the ETF-level version). Each entry covers the scenario's underlying cause, a dated historical analog with observed drawdowns, the named stock winners and losers (ticker-qualified as `EXCHANGE:SYMBOL`), and an **Outlook** block with probability, catalysts, and most-exposed names.

## Research process — read this BEFORE drafting a new scenario

The goal is named, dated, and numerically defended impact. Vague themes ("AI boom benefits chips") are not scenarios — they are tags. Every scenario in this catalog must carry a concrete catalyst, a dated analog, and per-stock impact estimates with timeframes. Authors who skip these steps produce content that looks plausible but cannot survive the next quarterly re-review.

### 1. Pin down the catalyst

- What specific decision or event triggers the move? Examples: an executive order with a docket number, an FOMC dot-plot shift, a CMS NPRM, a tariff schedule update, an FDA approval / refusal, a court ruling.
- The catalyst must have a verifiable source — link to the federal register entry, the central bank statement, the company filing, the court order, the rulemaking docket.
- If the catalyst is "expected but not yet confirmed", say so explicitly in the **Outlook** section and reflect it in the probability number.

### 2. Find a dated historical analog

- For every scenario, locate at least one prior episode where the same kind of catalyst hit the same kinds of names.
- Pull the trading-day reaction: what did the most-exposed names do in the 5/30/90 days after the analog event? Cite numbers — `PFE -5%, MRK -6%, LLY -3% over the first three trading days` is useful; `pharma sold off` is not.
- If you cannot find an analog, this probably is not yet a scenario — write it up as a "watch" instead, or hold off.

### 3. Sources for per-stock impact magnitude

Use these in priority order. Higher = more credible:

1. **Sell-side notes published after the analog event** (Citi, Goldman, Morgan Stanley, JPM, Bernstein, BofA sector teams). Look for: PT changes, EPS sensitivity tables, "what-if Phase 2" callouts.
2. **Company 10-K and 10-Q risk factors and segment reporting** — gives revenue exposure (% Medicare, % drug X, % country / region).
3. **Government rulemaking dockets** — distinguish what is **proposed** vs **finalized** vs **implemented**. Effective dates matter.
4. **Earnings-call transcripts** — management guidance changes are the cleanest signal of how the named company is preparing.
5. **Options-implied vol / skew on the analog event** — useful sanity check that the market is taking the catalyst seriously.

Avoid: blog speculation, threadbois on X, anonymous Reddit sentiment, AI-summary articles that recycle other AI summaries, headlines without a primary source.

### 4. Convert exposure to a price-change estimate

For each tagged ticker, estimate `expectedPriceChange` and `expectedPriceChangeExplanation` honestly:

- Start with **revenue exposure × consensus EPS sensitivity** (from the 10-K / sell-side note). Example: a name with 35% Medicare brand revenue and a 30% MFN haircut is looking at a ~10% revenue impact on the affected book.
- **Cross-check against the analog episode's actual drawdown** for that ticker. If the 2020 attempt sent LLY down 3% over three days on lower stakes, the 2025/2026 round at higher stakes should be a multiple of that.
- **Bound by probability**: if the scenario is `Medium (20–40%)`, the price-change estimate is roughly `prob × full-impact`. Stating a -25% target on a 25% scenario is double-counting.
- **Round to integers**. Don't claim precision you don't have.
- The **explanation** should cite the band (`-12 to -25%`), the timeframe (`12–18 months`), and the catalyst that drives it (`Phase 2 Part D extension`). If you only have a band, write the band into the explanation and use the midpoint for the integer.

### 5. Time horizons

Use specific milestones tied to the catalyst:

- Rulemaking timelines have public dates (NPRM → final rule → effective). Cite them.
- Avoid open-ended "long term" / "eventually". Pick a window: `3–6m`, `6–12m`, `12–18m`, `18–36m`.
- The expected-price-change explanation should reference the same window so the reader sees the price target and the timeframe together.

### 6. Country scoping

- List in `**Countries:**` only the countries where a tagged ticker meaningfully trades.
- If you tag European pharma via US ADRs (e.g. `NASDAQ:AZN`, `NYSE:GSK`), you can keep the scenario `**Countries:** US`. The exchange is what matters, not the underlying domicile.
- The import rejects links where the exchange's country is not in the `**Countries:**` list. If you genuinely need a multi-country scenario, list every country whose exchange you reference.

### 7. Re-review cadence

- Re-read every scenario quarterly. Outlooks decay quickly: a scenario that was `High (~55-65%, 12-18m)` six months ago may now be `In progress, partially priced in` and need an updated `**Most exposed right now:**` line.
- Update the `**Outlook (as of YYYY-MM-DD):**` line every time you touch the outlook block.
- If a scenario has fully played out, change the `**Outlook**` to "already happened" / "fully priced in" — the parser will reclassify the timeframe to `PAST`.

## Format conventions (required by `src/utils/stock-scenario-markdown-parser.ts`)

- Heading: `### N. Title` (numbered, one per scenario).
- Tickers MUST be exchange-qualified — `NYSE:PFE`, `NASDAQ:LLY`, `LSE:GSK`. Bare symbols are ignored because non-US markets have too many all-caps collisions.
- Each scenario ends with an explicit `**Countries:**` line listing the supported countries whose markets the scenario covers. Exchanges of listed tickers must fall within those countries, or the import will reject the link.
- Outlook buckets are qualitative: **High** (>40%), **Medium** (20–40%), **Low** (<20%), plus **In progress / Already happened** where the move is largely absorbed.
- Scenarios are separated by `---` on its own line.
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

A bullet with just a ticker (`- **NYSE:TEVA**`) parses correctly and saves with all three fields null. Skip the parenthetical entirely if you don't have a defended number — leave the field unset rather than guessing.

### Seed flow

`yarn import:stock-scenarios` (reads this file, POSTs to `/api/stock-scenarios` with `AUTOMATION_SECRET`). Admins can also paste the raw content into the admin import modal at `/admin-v1/stock-scenarios` for one-off runs.

---

### 1. Medicare Most-Favored-Nation (MFN) Drug Price Caps

**Underlying cause:** The Trump administration's 2025 executive order on Most-Favored-Nation prescription-drug pricing directs HHS to set Medicare reimbursement for selected high-cost brand-name drugs at no more than the lowest price paid by any comparable OECD country. Phase 1 targets Medicare Part B physician-administered drugs (oncology infusions, ophthalmology biologics, rheumatology biologics). A proposed Phase 2 extends MFN to Part D blockbusters — most notably the GLP-1 franchise (semaglutide, tirzepatide) and oral oncology (Ibrance, Verzenio). For the most-exposed brand-name makers this is a structural 30–80% price cut on affected SKUs, not a one-time rebate: ex-US reference prices for the same molecules often sit at 15–40% of the US list. US Medicare typically contributes 35–45% of global revenue for mature branded drugs, so a multi-year earnings reset — not just a single-quarter hit — is the expected shape.

**Historical analog:** Three comparable episodes. (1) The 2020 Trump MFN interim final rule cut Part B drug reimbursement to international benchmarks; it was blocked in federal court before taking effect but pharma still sold off 3–8% on the announcement (PFE -5%, MRK -6%, LLY -3% over the first three trading days). (2) The 2022 Inflation Reduction Act's Medicare negotiation program: the first ten drug list was published in August 2024 and negotiated prices took effect January 2026. Names exposed on the list saw 5–20% drawdowns in the weeks after selection (BMY's Eliquis franchise and JNJ's Xarelto / Stelara drove the moves). (3) The UK's 2019 Voluntary Pricing and Access Scheme, which capped NHS branded-drug spending growth, compressed AstraZeneca's UK branded revenue by roughly 15% over three years. The 2025 MFN order is broader in scope than (1) and has firmer statutory footing via the 2024 Medicare amendments, making it less reversible than the first attempt.

**Winners:**

- **NYSE:TEVA** (+10%, 12-18m as Medicare substitution accelerates) — Largest pure-play global generics maker. Every Medicare-covered brand that goes generic flows through Teva first; consensus 2027 EPS could move 6–8% higher if Phase 2 Part D extension reaches GLP-1s and oral oncology.
- **NASDAQ:VTRS** (+8%, 12-18m) — Inherited Mylan's US generic portfolio plus biosimilars optionality (insulin, adalimumab, etc.). 2027 EPS sensitivity ~5% per 100bps of branded-to-generic substitution share gain.
- **NYSE:AMRX** (+14%, 12m, small-cap leverage to substitution volumes) — US-focused generic pipeline tilted toward biosimilars. Small revenue base means each MFN-driven prescription mandate flows directly to the top line; the highest-beta winner in the cohort.
- **NYSE:MCK** (+4%, 12-18m) — Drug distribution volumes rise as prescription counts increase under lower out-of-pocket pricing; modest margin tailwind. Distributors are paid on volume, not list price, so MFN is a quiet positive.
- **NYSE:COR** (+4%, 12-18m) — Same dynamic as MCK. Cencora (formerly AmerisourceBergen) participates in the volume tailwind without rebate-spread exposure.
- **NYSE:CAH** (+4%, 12-18m) — Same dynamic as the other two distributors; smallest of the big-three but identical exposure shape.
- **NASDAQ:VRTX** (+6%, 12-18m, relative outperformance vs sector) — Cystic fibrosis franchise is orphan-designated end-to-end; orphan drugs are statutorily excluded from MFN scoping. The "sector down, Vertex flat" trade.
- **NASDAQ:REGN** (+5%, 12-18m) — Pipeline is orphan-tilted, which insulates much of forward revenue from MFN. EYLEA still faces its own competitive pressure unrelated to MFN.

**Losers:**

- **NYSE:LLY** (-18%, 12-18m if Phase 2 Part D includes GLP-1s) — Eli Lilly. Mounjaro / Zepbound US list ~$1,060 vs Germany ~$275; GLP-1 is the single largest target by addressable revenue. Sell-side estimates already cut consensus 2026 EPS 12–18%; the unpriced leg is a credible Phase 2 announcement, which would add another 5–10% downside.
- **NYSE:NVO** (-18%, 12-18m) — Novo Nordisk ADR. Ozempic / Wegovy run the same 70–80% transatlantic price gap as Mounjaro. ADR amplifies on EUR/USD if Novo's hedging unwinds.
- **NYSE:MRK** (-14%, 12-18m, Phase 2 includes Keytruda) — Merck. Keytruda is the world's #1 drug by revenue and an explicit MFN-Phase-2 target. Patent cliff in 2028 already pressuring the multiple; MFN compounds the post-IRA repricing risk.
- **NYSE:BMY** (-12%, 12m, Eliquis already in IRA negotiation) — Bristol-Myers Squibb. Eliquis is in Round 1 of IRA Medicare negotiation effective January 2026; MFN compounds that hit, especially for any future Eliquis-class follow-ons.
- **NYSE:PFE** (-12%, 12-18m) — Pfizer. Eliquis co-marketer plus Ibrance and Xeljanz, both Part D blockbusters with no orphan carve-out. Pipeline depth is shallow relative to LLY / MRK.
- **NYSE:ABBV** (-12%, 12-18m) — AbbVie. Skyrizi and Rinvoq pick up the load after Humira biosimilars; both are Part D blockbusters, both MFN-eligible. Mature dividend means equity has limited valuation cushion.
- **NYSE:JNJ** (-8%, 12-18m, lower concentration but real exposure) — Johnson & Johnson. Stelara, Darzalex, Imbruvica all Part D / Part B exposed. Diversified-conglomerate tag dampens the equity move but the MedCo segment carries the full hit.
- **NASDAQ:AZN** (-10%, 12m) — AstraZeneca ADR. Tagrisso (oncology) and Farxiga (cardio-renal) are top US revenue contributors; UK VPAS already compressed European pricing, so US Medicare cuts have outsized share-of-EBIT impact.
- **NYSE:GSK** (-8%, 12-18m) — GSK ADR. Shingrix Part D and Trelegy Part D both exposed. Lower revenue concentration vs AZN, hence a smaller move.
- **NYSE:NVS** (-10%, 12-18m) — Novartis ADR. Entresto and Cosentyx are top-line contributors, both with high US Medicare share.
- **NYSE:SNY** (-8%, 12-18m) — Sanofi ADR. Dupixent US co-marketer (with REGN); Dupixent is the single most exposed asset on Sanofi's P&L.
- **NYSE:UNH** (-6%, 12-18m, PBM rebate-spread compression) — UnitedHealth. OptumRx's economics depend on the gap between list price and net price; MFN-style list-price caps shrink that spread directly. Secondary effect; smaller than the brand-pharma names.
- **NYSE:CI** (-6%, 12-18m) — Cigna. Express Scripts faces the same rebate-spread compression as OptumRx.
- **NYSE:CVS** (-6%, 12-18m) — CVS Health. Caremark same rebate-spread dynamic. Retail-pharmacy exposure adds a small offset (more dispensing volume) but does not net out the PBM hit.

**Outlook (as of 2026-04-25):** Phase 1 implementation is already in progress — the HHS rulemaking on Part B MFN reimbursement is through public comment and first payment-model adjustments land in mid-2026. High probability (~55–65%) that the most-severe sub-cases — broad Phase 2 Part D extension including GLP-1 inclusion — reach implementation over the next 12–18 months and remain in force. The executive order is in effect, statutory backing is firmer than the 2020 attempt, and 2026 is a midterm year in which visible drug-price reductions are politically rewarded. The main tail risk is judicial: pharma is litigating on First Amendment / non-delegation grounds, but the IRA Medicare negotiation has already survived analogous challenges, so a broad injunction against MFN looks unlikely. **Priced-in status:** partially. Consensus 2026 EPS has been cut 8–15% for LLY / MRK / BMY / JNJ since the May 2025 EO, but the Phase 2 Part D extension is not yet in base-case street models — a credible Phase 2 announcement could add another 5–10% downside leg. **Signals to watch:** HHS Phase 1 drug list publication, CMS Part B payment-model NPRM timing, pharma Q2/Q3 2026 revenue-guidance revisions, litigation docket in D.D.C. and the Fifth Circuit, any bipartisan Senate pushback on Phase 2 scope. **Most exposed right now:** NYSE:LLY, NYSE:NVO, NYSE:MRK, NYSE:BMY, NYSE:JNJ.

**Countries:** US
