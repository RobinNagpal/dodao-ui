# ETF prompt review — cost-efficiency-and-team — iter-1

- **Date:** 2026-04-22
- **Loop:** A (prompt refinement)
- **Category in scope:** CostEfficiencyAndTeam (`cost-efficiency-and-team`)
- **Prompt file:** `docs/ai-knowledge/insights-ui/etf-prompts/cost-efficiency-team.md`
- **Run:** 16 ETFs across all 8 groups, regenerated via
  `POST /api/koala_gains/etfs-v1/generation-requests`. All 16 completed within ~10 minutes;
  0 failed.
- **ETFs reviewed:**
  - broad-equity: `SPY` (Large Blend), `IWF` (Large Growth)
  - sector-thematic-equity: `XLK` (Technology), `XLV` (Health)
  - leveraged-inverse: `TQQQ` (Trading--Leveraged Equity), `SQQQ` (Trading--Inverse Equity)
  - fixed-income-core: `AGG` (Intermediate Core Bond), `SHY` (Short Government)
  - fixed-income-credit: `HYG` (High Yield Bond), `PFF` (Preferred Stock)
  - muni: `MUB` (Muni National Interm), `SUB` (Muni National Short)
  - alt-strategies: `JEPI` (Derivative Income), `GLD` (Commodities Focused)
  - allocation-target-date: `AOA` (Aggressive Allocation), `AOK` (Conservative Allocation)

## Overall quality

Factor taxonomy and judgment are mostly right. The group-specific lenses the prompt asks
for are applied correctly — leveraged-inverse reports name embedded swap financing and
daily-reset drag, muni reports compute tax-equivalent yield at the 32% bracket the prompt
suggests, fixed-income-core reports treat `55–81%` turnover as structural rather than a
red flag, and passive-fee tests are applied against category medians.

The problems, exactly as in the `past-returns` review, sit at the language-discipline and
output-hygiene layer — adjective inflation, number repetition, raw unformatted asset
figures, and missing-field rule violations via new phrasings ("listed as data not
provided", "logged as data not provided", "absent from the provided data"). A new pattern
specific to this category is raw integer printing of AUM and dollar volume
(e.g. `$112998218385`, `2748845514`, `$86,268,382,571`) — unreadable and an obvious
failure the prompt never explicitly prohibits.

## Per-ETF review

Grouped by issue bucket; each ETF is cited where the pattern appeared.

### SPY (broad-equity — Large Blend) — change drivers: #1, #2

- **What's good:** correctly fails nothing, correctly frames the 9 bp fee as slightly
  above absolute-cheapest peers (`0.03%`); names the issuer, inception, and tenure clearly.
- **What's missing / wrong:**
  - #2: `0.09%` fee, `0.00%` spread, and `$653.2 billion` AUM each appear 3+ times across
    summary, paragraph, strengths section, and factor blocks. Violates the "do not repeat
    the same number in more than one paragraph" rule on line 15 of the prompt.
  - #1: adjective soup — "vast margin", "substantial foundational", "cements its status",
    "completely stable", "top-tier", "concrete operational excellence", "exactly as
    described", "completely avoids", "inherently prevents", "structurally avoids".
- **Verdict:** change needed — repetition + adjective discipline.

### IWF (broad-equity — Large Growth) — change drivers: #1, #2, #5 (worst number-formatting offender of broad-equity pair)

- **What's good:** correctly flags that `0.18%` is above ultra-cheap peers; correctly
  judges the spread/volume as strong; picks the right factor bar.
- **What's missing / wrong:**
  - #5 (new issue): raw integer AUM — `$112998218385` — printed 4 times across summary,
    paragraph, factor blocks, and strengths section. `$490124312` dollar volume printed
    twice. `1139877` and `3486070` share volumes printed raw. A human reader cannot parse
    these at a glance.
  - #1: "undeniable secondary market liquidity", "razor-thin", "elite secondary market
    execution", "flawless daily operation", "elite institutional-grade" — classic
    intensifier soup.
  - #2: `0.18%` repeated 4 times; `0.03%` spread repeated 3 times.
- **Verdict:** change needed — number-formatting rule must be added; repetition + adjective
  discipline on top.

### XLK (sector-thematic-equity — Technology) — change drivers: #1, #5

- **What's good:** correctly applies the sector-fee band (`0.10-0.50%` norm), correctly
  flags that the `5%` turnover is unusually low even for passive.
- **What's missing / wrong:**
  - #5: AUM printed as `$86,268,382,571`; dollar volume as `$942,297,212`; share volume as
    `17,647,581`. Comma separators help slightly but the eye still has to count zeros.
  - #1: "exceptionally low", "profound", "practically zero", "effortlessly", "premier
    issuer", "deep capital markets support", "tremendous value-for-money",
    "industry-leading", "institutional-grade".
- **Verdict:** change needed — abbreviate to `$86.3B`, `$942M`; adjective discipline.

### XLV (sector-thematic-equity — Health) — change drivers: #1, #3

- **What's good:** good identification of a bid-ask spread anomaly (`0.54%` is flagged as
  "slightly wider than expected" — correct). Correctly frames `2%` turnover as low even
  for passive.
- **What's missing / wrong:**
  - #1: "Massive", "extremely strong", "completely eliminating", "extremely lean",
    "decades of proven institutional operation".
  - #3: `active_fee_value` factor mostly restates what the factor tests ("While this factor
    tests if active or complex funds justify their higher fees, this ETF is the standard
    passive alternative...") — directly violates line 16 of the prompt ("Do not duplicate
    the factor description").
- **Verdict:** change needed — adjective discipline; factor-restatement ban needs to bite
  harder.

### TQQQ (leveraged-inverse — Trading--Leveraged Equity) — change drivers: #1, #2

- **What's good:** explicitly names swap financing costs, daily-reset volatility drag,
  and the "short-term tactical only" framing — exactly what the leveraged lens asks for.
  Correctly passes `leverage_cost_drag` while calling out that the `0.82%` headline is not
  the all-in cost.
- **What's missing / wrong:**
  - #2: `0.02%` bid-ask spread appears in summary, paragraph, strengths section, and
    `fund_size_liquidity` and `leverage_cost_drag` factor blocks — 5 places. `0.82%`
    repeated 4 times. `$25.4 billion` AUM repeated 3 times.
  - #1: "razor-thin", "razor-tight", "pristine liquidity", "industry-leading liquidity",
    "flawlessly delivers", "industry titan", "bulletproof", "tremendous scale",
    "extraordinary stability".
- **Verdict:** change needed — repetition + adjective discipline.

### SQQQ (leveraged-inverse — Trading--Inverse Equity) — change drivers: #5 (worst number-formatting offender overall), #1, #2

- **What's good:** correctly calls the profile "mixed" rather than the default "strong",
  explicitly names volatility drag and daily-reset compounding. Correctly labels it as a
  tactical instrument.
- **What's missing / wrong:**
  - #5: AUM `2748845514` printed **5 times** across summary, paragraph, strengths,
    `fund_size_liquidity` and `fund_track_record_and_stability` factors, **without any
    currency symbol**. Dollar volume `2463772602` printed 4 times, share volume
    `58888437` printed twice. This is the single clearest evidence the prompt needs an
    explicit number-formatting rule.
  - #2: `0.02%` spread repeated 3 times; `0.95%` expense ratio repeated 4 times; `-3x`
    mandate description repeated 4 times.
  - #1: "razor-thin", "exceptional", "razor-thin bid-ask spread" (twice), "massive",
    "immense trading activity", "pristine trading liquidity".
- **Verdict:** change needed — number formatting is the top priority here.

### AGG (fixed-income-core — Intermediate Core Bond) — change drivers: #3, #1, #2

- **What's good:** cleanly separates fee, liquidity, turnover, and team paragraphs;
  correctly frames `81%` turnover as structural for bond funds; correctly applies the
  fixed-income-core NAV premium/discount lens.
- **What's missing / wrong:**
  - #3 (missing-field rule): `mor_assessment` factor says _"a specific formal medalist
    rating and individual pillar grades are listed as data not provided"_. Separately,
    `premium_discount_nav` says _"Although explicit premium and discount drift data is
    absent"_. Both directly violate line 13 of the prompt ("if a field/metric is missing,
    **do not mention it** — no 'data not provided', 'not available', 'N/A'"). The
    variants "listed as data not provided", "absent from the provided data", "is absent"
    are not explicitly listed in the banned phrasings, so the rule is leaking.
  - #1: "rock-bottom", "unshakeable", "elite institutional issuer", "profound stability",
    "unparalleled daily trading activity", "pristine structural stability".
  - #2: `$137 billion` AUM repeated 3 times; `0.03%` fee repeated 3 times; `$1.2 billion`
    daily volume repeated 3 times.
- **Verdict:** change needed — missing-field rule must cover the new phrasings; repetition
  + adjective discipline on top.

### SHY (fixed-income-core — Short Government) — change drivers: #3, #1

- **What's good:** correctly frames `55%` turnover as structurally expected for a
  1-to-3-year Treasury roll; correctly ties NAV stability to sovereign-bond liquidity.
- **What's missing / wrong:**
  - #3: `premium_discount_nav` factor says _"While an exact historical premium/discount
    metric is absent from the provided data"_ — same missing-field leak as AGG.
  - #1: "razor-thin", "formidable", "essentially seamless", "mature operational footprint",
    "pristine structural stability", "deep institutional credibility".
- **Verdict:** change needed — missing-field rule; adjective discipline.

### HYG (fixed-income-credit — High Yield Bond) — change drivers: #3, #4, #1

- **What's good:** cleanly **Fails** `expense_ratio` and `active_fee_value` on the
  correct grounds (`0.49%` is uncompetitive vs modern passive peers). Names the 2020
  NAV-discount blowout as expected for the asset class. This is a good illustration that
  the prompt's grading rubric is working — not every factor is rubber-stamped "Pass".
  Total factor Fail count in this run: 2 on HYG, 1 on JEPI (`portfolio_turnover`). Every
  other factor on every other ETF passes, which matches reality.
- **What's missing / wrong:**
  - #3: `mor_assessment` factor says _"Although a specific overall `medalistRating` was
    logged as `data not provided`"_ — same family of missing-field leak.
  - #4 (factor restatement): `portfolio_turnover` factor opens with _"Evaluating exactly
    how often a fund trades its internal holdings is crucial for understanding hidden,
    unlisted costs"_ — this is the factor's own description. `management_quality` opens
    with _"Long-term operational stability relies heavily on the quality and depth of the
    team running the fund"_ — same issue. Directly violates line 16.
  - #1: "world-renowned", "elite", "top-tier institutional trading", "powerful
    combination", "industry-leading corporate backing".
- **Verdict:** change needed — same three buckets as others, plus tighter factor-restatement
  enforcement.

### PFF (fixed-income-credit — Preferred Stock) — change drivers: #1, #2

- **What's good:** correctly places `0.45%` in the cheapest quintile of the Preferred
  Stock category even though it's expensive in absolute terms; correctly names Jennifer
  Hsui and the 13.7-year tenure.
- **What's missing / wrong:**
  - #1: "flawless retail liquidity", "titan in its category", "aggressively", "effectively
    a `0.00%` bid-ask spread", "highly efficient liquidity bridge", "rock-solid
    operational stability", "cycle-tested", "seasoned management oversight".
  - #2: `0.45%` repeated 5 times; `$13.4 billion` AUM repeated 4 times; `$73 million`
    dollar volume repeated 4 times.
- **Verdict:** change needed — repetition + adjective discipline.

### MUB (muni — Muni National Interm) — change drivers: #6 (format: single run-on paragraph)

- **What's good:** TEY framing with 32% bracket is included (correct per prompt). Name
  drop of actual top holdings (Texas University Revenues, Atlanta Water, NY Thruway) is
  good texture.
- **What's missing / wrong:**
  - #6 (structure): `overallAnalysisDetails` is **one giant paragraph** — the prompt
    explicitly says "4 paragraphs" on line 40. The content covers all four topics, but
    they're mashed into a single block. Makes the output much harder to skim.
  - Otherwise adjective usage is closer to tolerance than other reports — so this is
    really just the structural issue.
- **Verdict:** change needed — paragraph-break enforcement.

### SUB (muni — Muni National Short) — change drivers: #1, minor #2

- **What's good:** explicit TEY calculation (`2.51%` SEC yield → `3.69%` TEY at 32%
  bracket) — exactly the muni lens the prompt requires. Correctly names AMT exclusion.
- **What's missing / wrong:**
  - #1: "closely tailored", "robust", "seamless", "substantial", "negligible execution
    spread", "significantly reduces organizational risk", "severely stress tests",
    "validates the strategy's stability", "permanently removes any viable closure risk".
  - #2: `14.8 Years` tenure repeated 4 times.
- **Verdict:** change needed — adjective discipline.

### JEPI (alt-strategies — Derivative Income) — change drivers: #1, #7 (meta-narration)

- **What's good:** clean `portfolio_turnover` **Fail** with the right rationale (`172%`
  forces short-term-income tax treatment, structurally tax-inefficient). The ELN/equity-
  linked-note mechanism is named — the correct alt/options lens. Tax-drag framing for
  taxable accounts is called out.
- **What's missing / wrong:**
  - #7 (meta-narration, new issue): `tax_efficiency_distributions` factor says _"We rate
    this a Pass only because the distribution character is fully disclosed and standard
    for ELN-based options strategies, but it remains a glaring inefficiency"_. The model
    is narrating its own grading meta-reasoning, which leaks the scoring process into
    user-facing prose. Similar pattern seen in multiple reports ("earning a Pass",
    "easily clears the passive fee test").
  - #1: "dominant market execution", "premier global asset manager", "elite institutional
    oversight", "glaring inefficiency", "flawlessly".
- **Verdict:** change needed — ban meta-narration about Pass/Fail grading in the prose;
  adjective discipline.

### GLD (alt-strategies — Commodities Focused) — change drivers: #1, #5

- **What's good:** correctly applies the alt/commodity tax lens — 28% collectibles tax
  rate on long-term gains, grantor-trust 1099 (not K-1) distinction. Correctly names the
  21.4-year single-team tenure and matches it to the fund's lifespan.
- **What's missing / wrong:**
  - #5: AUM printed as `$156,705,199,332` in `fund_size_liquidity` factor block (alongside
    `$156.7 billion` elsewhere). Same fund, two formats in the same report.
  - #1: "staggering", "razor-thin", "unmatched market depth", "elite", "leagues above any
    theoretical closure risk threshold", "pristine, multi-decade market history",
    "absolute stability", "uninterrupted institutional backing".
- **Verdict:** change needed — number formatting + adjective discipline.

### AOA (allocation-target-date — Aggressive Allocation) — change drivers: #1, #2

- **What's good:** correctly flags the `February 2026` category reclassification while
  noting the mandate and benchmark are unchanged — good nuance. Correctly frames `0.15%`
  as bottom-quintile for allocation funds.
- **What's missing / wrong:**
  - #1: "massive", "seamless", "deeply binds to NAV", "institutional-grade management
    stability".
  - #2: `0.15%` fee repeated 5 times; `13.3 Years` tenure repeated 3 times; `$2.8B` AUM
    repeated 3 times.
- **Verdict:** change needed — repetition + adjective discipline.

### AOK (allocation-target-date — Conservative Allocation) — change drivers: #1, #2

- **What's good:** correctly frames the value-for-money test on `0.15%` vs typical active
  allocation (`0.60%+`). Notes the mild daily-volume constraint (`$4.3M`) as a limit-order
  hint without overstating it.
- **What's missing / wrong:**
  - #1: "exceptional continuity", "rigorous operational infrastructure", "strongly
    supports", "thoroughly established", "performs predictably".
  - #2: `0.15%` fee repeated 5 times; `13.3 Years` (same manager as AOA) repeated 3 times.
- **Verdict:** change needed — repetition + adjective discipline.

## Group-level summary

- **Broad-equity, sector-thematic-equity, alt-strategies:** same adjective-inflation
  problem as the `past-returns` run. Mostly content-correct, language-noisy.
- **Leveraged-inverse:** correctly applies the embedded-cost lens (good). Main issues are
  raw-integer number formatting (SQQQ especially) and number repetition across paragraphs.
- **Fixed-income-core:** missing-field rule is leaking via new phrasings ("listed as data
  not provided", "absent from the provided data"); `mor_assessment` factor is the single
  most common offender across the run.
- **Fixed-income-credit:** HYG usefully demonstrates the prompt can produce a **Fail** —
  the grading is not biased toward uniform "Pass". Separately, factor-description
  restatement shows up worst here.
- **Muni:** TEY rule works cleanly (32% bracket → TEY calc). MUB has a structural
  paragraph-break failure; SUB is clean on structure.
- **Allocation-target-date:** number repetition is the dominant problem; content accurate.

## Final changes

Apply six targeted tightenings to
`docs/ai-knowledge/insights-ui/etf-prompts/cost-efficiency-team.md`:

1. **Expand the banned-adjective list** with the intensifiers/marketing words that
   dominated this run: "massive", "razor-thin", "razor-tight", "elite", "pristine",
   "flawless", "flawlessly", "unmatched", "unparalleled", "staggering", "profound",
   "industry titan", "seamless", "bulletproof", "rock-solid", "rock-bottom", "colossal",
   "premier", "cornerstone", "undeniable", "undeniably", "tremendous", "immense",
   "immensely", "world-renowned", "world-class", "top-tier". Rationale: these words
   signal confidence without adding information and incentivize padding.

2. **Broaden the missing-field rule** to explicitly cover the phrasings that leaked
   through this run: "listed as data not provided", "logged as data not provided",
   "absent from the provided data", "is absent", "not disclosed", "not listed",
   "not in the data", "omitted", "unavailable", "not reported". Rule should stay: if the
   metric isn't in the input and can't be sourced via the lookup rule, **omit it
   silently** — do not reference that it's missing.

3. **Add a number-formatting rule** for AUM, dollar volume, and share count. These should
   be abbreviated with `B`/`M`/`K` suffixes and a currency symbol where applicable
   (e.g., `$113B`, `$490M daily volume`, `3.5M shares`). Never print raw integers like
   `2748845514` or `$112998218385`. Rationale: raw integers are unreadable; the prompt
   currently only says "wrap in backticks" which doesn't address formatting.

4. **Strengthen the repetition rule** to explicitly say: state each number (expense
   ratio, AUM, spread, turnover, tenure, inception) **once** in the report. Subsequent
   mentions should be qualitative ("the low fee", "its deep liquidity", "tight execution")
   — never repeat the numeric value. Rationale: SQQQ printed `2748845514` five times;
   TQQQ printed `0.02%` five times; this is pervasive and the existing rule isn't biting.

5. **Ban meta-narration about Pass/Fail grading in the prose**. Add: "Inside factor
   blocks, the `result` field is the verdict — do not narrate the scoring in the
   `detailedExplanation` prose. Do not write 'We rate this a Pass only because…',
   'earning a Pass', 'easily clears the … test', 'fully passes the highest bars',
   'fails the … test'. State the evidence and let the result field speak."

6. **Enforce the 4-paragraph structure** on `overallAnalysisDetails`. Add: "The
   `overallAnalysisDetails` output MUST be four distinct paragraphs separated by blank
   lines — one for each of the four topics above. A single run-on block is a failure even
   if the content is right." Rationale: MUB produced one giant paragraph this run.

7. **Drop the `~800–1100 words` word count** on `overallAnalysisDetails`. Actual good
   outputs in this run are ~400–600 words; the floor creates a padding incentive that
   feeds #1 (adjective inflation). Replace with "Aim for substance over length — four
   tight paragraphs, roughly 400–700 words total."

**No factor JSON changes in this pass.** The factor file
`etf-analysis-factors-cost-efficiency-and-team.json` produced a sensible per-group mix
(passive-fee vs active-fee, leverage-cost-drag, muni-TEY, premium/discount, mor-assessment)
and the grading rubric works — HYG correctly Failed on fee, JEPI correctly Failed on
turnover. The failures this run were language-level, not taxonomy-level.

**No changes to the other three category prompts** — they weren't in scope for this test
run.
