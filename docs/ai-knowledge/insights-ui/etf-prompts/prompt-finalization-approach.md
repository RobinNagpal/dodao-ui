# How we finalize an ETF analysis prompt

Reference doc capturing the approach we used to finalize the **Past Returns for ETFs** prompt (prompt id `ba7c2d75-4263-4a5e-a518-f3b31c996251`). The same loop applies to other ETF analysis categories (Cost, Efficiency & Team; Risk Analysis; Strategy; etc.).

Goal of the loop: produce a prompt that (a) only asks for analysis the input data can actually support, (b) matches factor scope to the ETF group the fund belongs to, and (c) has no redundancy with other analysis categories.

---

## Inputs you start from

1. **Category factor config** — JSON under `insights-ui/src/etf-analysis-data/`:
   - `etf-analysis-factors-performance-and-returns.json` (group-based, 5 factors per group)
   - `etf-analysis-factors-cost-efficiency-and-team.json` (asset-class-based)
   - `etf-analysis-factors-risk-analysis.json` (asset-class-based)
2. **Group / category mapping** — `etf-analysis-categories.json` maps ~130 Morningstar categories (e.g. *Large Blend*, *High Yield Bond*) to 8 groups (`broad-equity`, `sector-thematic-equity`, `leveraged-inverse`, `fixed-income-core`, `fixed-income-credit`, `muni`, `alt-strategies`, `allocation-target-date`).
3. **Prompt input schema** — `insights-ui/schemas/etf-analysis/inputs/<category>-input.schema.yaml` defines exactly which fields are passed into the prompt.
4. **Input builder** — `insights-ui/src/utils/etf-analysis-reports/etf-report-input-json-utils.ts` fills the schema fields from the Prisma model (`EtfStockAnalyzerInfo`, `EtfMorAnalyzerInfo`, `EtfFinancialInfo`, `EtfMorPeopleInfo`, `EtfMorPortfolioInfo`, `EtfMorRiskInfo`).
5. **Live prompt text** — stored in the DB, keyed by prompt name (e.g. `Past Returns for ETFs`). A frozen copy of what was used lives at `docs/ai-knowledge/insights-ui/etf-prompts/<category>.md`.

---

## The finalization loop (step-by-step)

### Step 1 — Pick representative ETFs per group

The Past Returns category uses **group-based factor selection**, so we need to cover every group in our test set. Cost/Risk categories are asset-class-based; for those, pick representatives per asset class instead.

- For each of the 8 groups, pick 3–4 real ETFs (different issuers, different subcategories inside the group where possible).
- Verify each ETF's `category` field via `https://koalagains.com/etfs/<EXCHANGE>/<SYMBOL>/financial-data` — the page surfaces `EtfStockAnalyzerInfo.category`, which is what the group-mapping logic reads.
- Write the picks to `docs/ai-knowledge/insights-ui/past-returns-prompt/etfs-per-group.md` (template — one table per group).

Example table row for the `broad-equity` group:

| Symbol | Exchange | Name | Morningstar category |
| --- | --- | --- | --- |
| SPY | NYSEARCA | SPDR S&P 500 ETF Trust | Large Blend |
| VTI | NYSEARCA | Vanguard Total Stock Market ETF | Large Blend |
| IWM | NYSEARCA | iShares Russell 2000 ETF | Small Blend |
| VEA | NYSEARCA | Vanguard FTSE Developed Markets ETF | Foreign Large Blend |

### Step 2 — Narrow to one ETF per group for a round of generation

Running the prompt against one ETF per group (8 runs) is usually enough to catch structural problems. For Past Returns we used: **IWM, XLV, SOXL, AGG, HYG, TFI, DBC, AOR** (all NYSEARCA).

Pick ETFs that exercise the group's edge cases. For example:
- `leveraged-inverse` → pick a 3x fund, not 1x, to stress the decay factor.
- `muni` → pick a national fund rather than single-state, so peer standing has a sane denominator.
- `allocation-target-date` → pick a moderate allocation (AOR) rather than an extreme target-date (2065+), so rate-sensitivity and equity-sleeve behavior are both visible.

### Step 3 — Fetch Morningstar data for each pick

Before generating, make sure the DB has fresh Morningstar data. Four `kind`s are required for Past Returns:
- `quote`
- `risk`   (this is the source of `riskPeriods` → `marketVolatilityMeasures`)
- `people`
- `portfolio`

Trigger via:

```
POST https://koalagains.com/api/koala_gains/etfs-v1/exchange/<EX>/<SYM>/fetch-mor-info?token=<AUTOMATION_SECRET>
Body: { "kind": "quote" | "risk" | "people" | "portfolio" }
```

**Do NOT** call `fetch-financial-info` from this loop — it's a separate, slower ingest pipeline with different side effects.

The `AUTOMATION_SECRET` lives in the bot's `.env`.

### Step 4 — Trigger generation requests

For each pick, create a generation request with only the category you're testing flipped on:

```
POST https://koalagains.com/api/koala_gains/etfs-v1/generation-requests?token=<AUTOMATION_SECRET>
Body: {
  "symbol": "<SYM>",
  "exchange": "<EX>",
  "regeneratePerformanceAndReturns": true,
  "regenerateCostEfficiencyAndTeam": false,
  "regenerateRiskAnalysis": false
}
```

This avoids burning LLM calls on categories you aren't iterating on.

### Step 5 — Review each run against the category's scope

Fetch invocations for the prompt ID (prompt `ba7c2d75-…` for Past Returns) and match them to the 8 ETFs. For each invocation, write 8–10 bullet lines under these headings:
- **Good things** — where the prompt worked
- **Weaknesses** — hallucinations, missing context, wrong scope
- **Factor relevance** — did the 5 factors actually fit this ETF? (particularly: did a leveraged-inverse ETF get factors that make sense for a short-term trading vehicle?)
- **Prompt improvements** — rules / guardrails that would have helped
- **Other observations**

Save per-ETF reviews plus a cross-cutting "prompt improvements" list to:
`docs/ai-knowledge/insights-ui/etf-prompt-improvement/<category>-review-<YYYY-MM-DD>.md`
(Example: `past-returns-review-2026-04-20.md`.)

### Step 6 — Inspect input data for gaps or scope leaks

Open each ETF's `/etfs/<EX>/<SYM>/financial-data` page side-by-side with the input builder in `etf-report-input-json-utils.ts`. Two things to look for:

- **Missing data** — the page shows a field that would meaningfully change the analysis but isn't in the prompt input. For Past Returns we added `high52wChg/low52wChg/high52wDate/low52wDate`, `divYears`, and `divGrYears`.
- **Scope leak** — the input includes data that properly belongs to a different analysis category. For Past Returns we had added a `downsideAndDrawdownContext` block sourced from `morRiskInfo.riskPeriods.marketVolatilityMeasures`; after review, **drawdown severity is a Risk Analysis concern, not a Past Returns one**, so the block was removed. A factor using that data (`downside_protection`) was deleted along with it.

Rule of thumb: **if data is the canonical evidence for a factor that lives in another analysis category, don't duplicate it here** — the final summary step stitches the three category outputs together. Duplication only invites the LLM to repeat itself.

### Step 7 — Re-scope factors per group

Each group must have **exactly 5 factors**. After removing a factor, something has to replace it. Constraints:
1. The replacement must be supported by data already in the input schema.
2. The replacement must fit the group's character (sector ETFs care about trend position; allocation funds care about risk-adjusted returns; leveraged ETFs care about leverage fidelity and technical entry).
3. Prefer adding a factor that has zero overlap with the other two categories' factors.

For Past Returns the final swap set was:

| Group | Removed | Added |
| --- | --- | --- |
| `sector-thematic-equity` | `returns_consistency` | `technical_trend_position` |
| `leveraged-inverse` | `short_term_returns` | `technical_trend_position` |
| `alt-strategies` | `downside_protection` | `risk_adjusted_return_quality` |
| `allocation-target-date` | `downside_protection` | `risk_adjusted_return_quality` |

### Step 8 — Update the prompt text itself

Edit the live prompt (DB) using the review from step 5. Typical improvements:
- Add explicit scope guardrails at the top ("do NOT analyze X here — that belongs to the Y report").
- Add data-source priority rules when multiple input fields cover similar ground.
- Name the classification thresholds so the LLM doesn't invent its own (e.g. `>= 2pp` = **Strong**, `±2pp` = **In Line**, `<= -2pp` = **Weak**).
- Tell it how to handle missing data once, at the top, rather than per-paragraph.
- Split the `overallAnalysisDetails` output into named paragraphs with a prescribed order.

After editing the live prompt, save a frozen copy of the new version to `docs/ai-knowledge/insights-ui/etf-prompts/<category>.md`. This keeps the doc tree in sync with what the model actually sees.

### Step 9 — Close the loop

Re-run steps 4–6 on the same 8 ETFs (or a fresh 8). The review doc for the second round should be shorter — that's the signal the prompt is converging. When a review round produces no structural changes and only minor wording edits, the prompt is done.

---

## Invariants to preserve at all times

- Exactly **5 factors per group** in `etf-analysis-factors-performance-and-returns.json`. Break this and the prompt input array becomes inconsistent across ETFs in the same group.
- Every factor's `factorMetrics` must reference fields that actually appear in the prompt input JSON. If the input builder doesn't pass a metric, don't list it.
- Prompt text must use the exact `factorAnalysisKey` values from the input when emitting factor results — these are the join key back to the Prisma `AnalysisCategoryFactorResult` rows.
- Drawdown / capture-ratio data stays out of Past Returns. It lives in Risk Analysis. Don't re-introduce it without first removing the equivalent risk-analysis factor.

---

## File map

```
insights-ui/
  src/etf-analysis-data/
    etf-analysis-categories.json                   # group <-> Morningstar category mapping
    etf-analysis-factors-performance-and-returns.json
    etf-analysis-factors-cost-efficiency-and-team.json
    etf-analysis-factors-risk-analysis.json
  src/utils/etf-analysis-reports/
    etf-report-input-json-utils.ts                 # builds prompt input JSON from Prisma
  schemas/etf-analysis/inputs/
    performance-and-returns-input.schema.yaml
    cost-efficiency-and-team-input.schema.yaml
    risk-analysis-input.schema.yaml

docs/ai-knowledge/insights-ui/
  etf-prompts/
    past-returns.md                                # frozen copy of the live prompt
    prompt-finalization-approach.md                # this document
  past-returns-prompt/
    etfs-per-group.md                              # step 1 worksheet (per-group ETF picks)
  etf-prompt-improvement/
    past-returns-review-<date>.md                  # per-round review notes (step 5)
    missing-data-in-performance-prompt-input.md    # step 6 data-gap log
    prompt-improvement-past-returns.md             # cross-round prompt-change log
    asset-class-factors-review.md                  # equivalent review for cost/risk categories
```

---

## Reusing this loop for Cost, Efficiency & Team / Risk Analysis

The steps above translate 1:1, with two differences:

1. **Factor selection is asset-class-based, not group-based.** Pick representatives per asset class (`Equity`, `Fixed Income`, `Alternatives`, `Commodity`, `Asset Allocation`, `Currency`) instead of per group.
2. **Drawdown belongs in Risk Analysis.** When reviewing the Risk Analysis prompt, that scope should be *in*, and the prompt should own the `drawdown_analysis` factor (or equivalent). Past Returns is where the scope boundary gets tested most often — always verify boundary handling from both sides before declaring convergence.

Prompt IDs are in the `Prompt` table; query by `name` and store the ID alongside the review doc so the next iteration can list invocations directly.
