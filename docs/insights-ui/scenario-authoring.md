# Authoring Stock & ETF Market Scenarios

How Claude Code (or a human editor) should draft a new market scenario before importing it through the admin UI. The DB (`StockScenario` / `EtfScenario`) is the source of truth — this doc covers only the drafting workflow and the content template.

## Use a scratch file under `/tmp/scenarios/`

Build the scenario iteratively in a scratch markdown file. This keeps drafts out of the repo, gives you a stable handle to edit and re-run research against, and matches the format the admin paste-import expects so the final step is just copy → paste.

**Path convention:**

- Stocks: `/tmp/scenarios/stocks/<scenario-slug>.md`
- ETFs:   `/tmp/scenarios/etfs/<scenario-slug>.md`

Where `<scenario-slug>` is the kebab-cased title (matches `slugifyScenarioTitle` in `insights-ui/src/utils/scenario-slug.ts` and the `slug` column on the row).

Workflow:

1. `mkdir -p /tmp/scenarios/{stocks,etfs}` once per machine — these dirs are scratch-only, never committed.
2. Create the file and fill in what you know now. It's fine for sections to start as TODOs.
3. Iterate — re-read the file, add numbers / sources / per-stock bullets, fix the historical analog, etc. Multiple passes are expected: the first pass typically nails the cause + winners/losers, later passes add the magnitude data and per-stock price targets.
4. When the file is complete, paste it into the admin import modal at `/admin-v1/stock-scenarios` or `/admin-v1/etf-scenarios`. Existing scenarios are upserted by `scenarioNumber`, so re-pasting an updated draft updates the live row in place.
5. The scratch file can be discarded afterwards. If you want to come back and revise, regenerate the file from the admin "view markdown" output (or just re-draft from scratch — it's cheap).

The same workflow applies whether you're creating a brand-new scenario or iteratively refining an existing one.

## Required template

A scenario is not done until every section below is populated with concrete numbers, dates, and named industries. Vague language ("could be impacted", "may benefit") is a sign the draft isn't ready.

```markdown
### N. <Scenario title>

**Summary:** <4–5 paragraphs. Fold the cause, the historical analog, and the outlook
  into a single narrative. Cover ALL of:>
  - **Dates:** when the scenario started (event / announcement / regime shift), and the
    end date or the window through which the impact is expected to play out.
  - **What exactly changed:** the specific policy / rate / tariff / regulation / supply
    shock — quoted from the primary source where possible (statute number, executive
    order, central-bank statement, earnings guidance, etc.).
  - **Background:** the 1–2 paragraph backstory a reader needs to understand why this
    change matters — prior status quo, the constituency pushing for it, the trigger.
  - **Magnitude (in numbers):** dollar amounts, percentage points, basis points, units
    affected, share of market / GDP / revenue. If the scenario has a headline number
    (e.g., "$200B in tariffs", "75bps cuts", "30% MFN price drop"), state it explicitly.
  - **Affected industries and the size of impact on each:** name each industry and
    quantify (e.g., "auto OEMs: -8% to -12% gross margin", "US generics distributors:
    -3% to -5% revenue", "domestic steel: +15% realized prices"). This is where the
    scenario earns its keep — generic "tech will be hit" without numbers is not enough.
  - **Who benefits unfavorably / who loses unfavorably:** call out asymmetric outcomes
    where one group disproportionately gains or loses (e.g., "favors integrated payers
    over standalone PBMs", "asymmetrically hurts contract manufacturers vs. brand
    pharma"). Specific stocks and ETFs go in the Winners / Losers sections below — this
    paragraph is for the industry- or category-level asymmetry.
  - **Historical analog:** name a comparable past episode (year, scope, outcome). Cite
    the magnitude of that prior move so the current scenario can be sized against it.
  - **Outlook (with `as of YYYY-MM-DD`):** the probability bucket (`high probability` /
    `medium probability` / `low probability`, or an explicit range like `30–40%`), the
    timeframe (`already happened` / `in progress` / `future`), and what would change the
    call. The parser reads the percentage, the timeframe phrasing, and the as-of date
    from this paragraph.

**Winners**
- **EXCHANGE:SYMBOL** (+N%, <timeframe + priced-in bucket>) — <1–2 sentences on why
  this name is positioned to outperform under this scenario. Include exposure %,
  pricing-power lever, or earnings sensitivity if known.>
- ... (exactly 5 names — see "Five winners, five losers" convention below)

**Losers**
- **EXCHANGE:SYMBOL** (-N%, <timeframe + priced-in bucket>) — <as above, but downside>
- ... (exactly 5 names)

**10 Baggers**    <!-- Stock scenarios only. Optional: omit for ETF scenarios
  and for stock scenarios where no plausible 10x candidate exists. -->
- **EXCHANGE:SYMBOL** (+N%, <timeframe + priced-in bucket>) — <1–2 sentences on
  why this small/micro-cap could 5–10x under this scenario. Reference the
  value-chain layer it sits in (e.g., upstream miner, contract manufacturer)
  and the specific catalyst that would re-rate it.>
- ... (exactly 5 names; the % can exceed +100, e.g. +500 to +900 for a 10x.
  Use NOT_PRICED_IN as the bucket — if a name is already partially priced in
  for a 10x, it doesn't belong here.)

**Countries:** USA, Canada    <!-- Stock scenarios only. Comma-separated list of
  SupportedCountries. Omit for ETF scenarios. -->

**Detailed analysis:** <Optional. Long-form markdown rendered on
  `/(etf|stock)-scenarios/<slug>/detailed-analysis`. Skip the section entirely
  if you don't have it yet — leaving the field unset is preferred to writing a
  thin or speculative version. Use the dedicated prompt template at
  `docs/insights-ui/scenario-prompts/detailed-analysis.md` to generate this.>
```

### Five winners, five losers (and up to five 10 baggers) — convention, not a hard limit

The schema does **not** enforce a count on link rows, and the public detail
page renders every link the parser stores. By convention, every scenario
should ship with **exactly five winners and five losers** — no more, no less.
Stock scenarios may additionally ship with **up to five 10 baggers**:

- A short, ranked list reads like a trade idea; a long tail reads like noise.
- The intent is editorial relevance, not coverage. If you're reaching for a
  sixth name, drop the weakest existing one instead.
- Broad diversified ETFs / index ETFs (SPY, QQQ, VTI) are usually the weakest
  link when a more targeted sector / industry ETF would qualify.
- Same rule applies to stock scenarios — pick the cleanest 5+5.
- 10 Baggers is **stock-only and optional**: include up to 5 small/micro caps
  with plausible 5–10x upside drawn from the value-chain layers in the
  detailed analysis. ETF scenarios never carry this list — ETF holdings are
  pre-diversified, so a per-name 10x call would be misleading. Skip the
  section entirely if no candidate clears the bar.

Claude Code (and any human author) MUST respect this convention when drafting
or revising a scenario, even though no code path will reject a 7-winner list.
The same convention is reiterated as a comment at the top of
`insights-ui/src/scripts/import-etf-scenarios.ts` and
`insights-ui/src/scripts/import-stock-scenarios.ts`.

### Stock vs ETF: where priced-in / expected-move lives

Stock scenarios carry priced-in bucket and expected price change **only at the
per-ticker level** — there is no scenario-level priced-in field on
`StockScenario`. Each winner/loser/most-exposed bullet states its own bucket and
expected % move; the scenario as a whole does not have a single combined value.
ETF scenarios still carry these at the scenario level on `EtfScenario`. Don't
write a "Priced-in" or "Expected move" line above the Winners list for a stock
draft — the parser ignores it and the schema has no column for it.

### Per-stock bullet syntax (Winners / Losers / 10 Baggers)

The bullet line is parsed by `BULLET_LINE_PATTERN` in `insights-ui/src/utils/stock-scenario-markdown-parser.ts` (and the matching ETF parser). To carry a per-stock price target and explanation:

- Use `EXCHANGE:SYMBOL` qualified form, in bold, e.g. `**NYSE:TEVA**`, `**TSX:CNQ**`.
- Optional `(±N%, <free-text explanation>)` parenthetical right after — the
  integer is the expected price change in percent. Winners / losers stay
  inside ±100. **10 Baggers** widen the upper bound to +2000 so a 10-bagger
  (+900%) or stretch 20-bagger (+2000%) fits; the ETF parser stays at ±100.
  The free text usually carries the timeframe and a priced-in phrase.
- Optional ` — <role explanation>` after an em-dash, hyphen, or colon — 1–2 sentences on the company-specific thesis.
- Priced-in phrases recognized in either the parenthetical or the role explanation: `over-priced in`, `fully priced in`, `mostly priced in`, `partially priced in`, `not priced in`. Exactly one phrase per bullet — pick the bucket honestly.

Example:

```markdown
- **NYSE:TEVA** (-12%, 6–9 months, partially priced in) — Largest US generics
  exposure; MFN drug-pricing rule directly compresses the 60% of revenue tied to
  Medicare-reimbursed generics.
```

### Outlook phrasing the parser keys off

- **Probability bucket** — explicit `high probability` / `medium probability` / `low probability`, OR a percent / range (`~35%`, `25–35%`). The parser maps `>40%` → HIGH, `20–40%` → MEDIUM, `<20%` → LOW.
- **Timeframe** — `already happened` / `already absorbed` / `already priced` / `played out` → PAST; `in progress` / `ongoing` / `late-stage` / `currently underway` → IN_PROGRESS; anything else → FUTURE.
- **Outlook date** — `as of YYYY-MM-DD` anywhere in the body. If absent, the importer falls back to the date you pick in the modal.

### Direction (UPSIDE / DOWNSIDE)

Inferred from the title keywords first (`boom`, `rally`, `surge`, `breakout` → UPSIDE; `crash`, `crisis`, `shock`, `selloff`, `downturn`, etc. → DOWNSIDE), then from winner-vs-loser ticker counts. Pick a title that telegraphs the direction; don't rely on the count tiebreak.

## Quality bar

A scenario is ready to import when:

- Every required section is populated (no TODOs, no `<...>` placeholders).
- The summary section names specific dates and at least one headline number.
- Every per-industry impact in the summary has a numerical range (% margin, % revenue, $ amount, basis points — pick what fits).
- Winners and losers each have **exactly 5** names with `EXCHANGE:SYMBOL` qualifiers; bullet form (with `(±N%, ...)` per stock) is preferred over inline form. See "Five winners, five losers" above.
- For stock scenarios where 10 Baggers is included: **up to 5** small/micro-cap names, drawn from the value-chain layers of the detailed analysis, each with NOT_PRICED_IN bucket and a +500 to +2000% bullet. Skip the section entirely if no candidate clears the bar.
- The historical analog folded into the summary is a real, datable episode — not a hand-wave.
- The outlook paragraph (also folded into the summary) is dated and states both probability and timeframe in language the parser recognizes.
- Detailed analysis is either absent (acceptable) or follows the structure in `docs/insights-ui/scenario-prompts/detailed-analysis.md` — never a thin one-paragraph stub.

If any of these are missing, keep iterating in the scratch file before pasting into the admin modal.
