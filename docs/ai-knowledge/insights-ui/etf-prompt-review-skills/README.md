# ETF Prompt Review Skills

Skills (repeatable procedures) for reviewing and improving the LLM prompts used to generate ETF analysis on KoalaGains.

## Background

The KoalaGains platform generates AI-powered ETF analysis across 3 categories (Performance & Returns, Cost Efficiency & Team, Risk Analysis) with 5 factors each. The prompts that drive this analysis need continuous review because:

- The same prompt is used for very different ETF types (equity, bond, commodity, income/derivative)
- Factors designed for equity ETFs often produce misleading results for other asset classes
- Input data gaps (missing yield, unresolved category codes, null index names) cause blind spots
- Thresholds (e.g., ±2pp comparison) need asset-class-specific calibration

## Skills

### Skill 1: [Select Random ETFs by Asset Class & Review Prompts](skill-1-select-and-review-etfs.md)

**Purpose**: Pick 4 diverse ETFs from each of the 6 asset classes, fetch their data, review the LLM-generated analysis output, and write per-ETF improvement documents.

**Outputs**:
- Per-ETF review documents (one per ETF per category) at `docs/ai-knowledge/insights-ui/etf-prompt-improvement/`
- Cross-ETF summary document identifying patterns and priorities

**When to run**: After prompt changes, after adding new ETFs to the database, or periodically to check analysis quality on a fresh set of ETFs.

---

## Output Location

All review documents are written to:
```
docs/ai-knowledge/insights-ui/etf-prompt-improvement/
```

## Key Review Questions

Every skill should evaluate:
1. **What can be improved in the prompt?** — Missing instructions, unclear thresholds, ambiguous factor descriptions
2. **What are the good things?** — What the output does well, correct insights, useful framing
3. **What are the weaknesses?** — Misleading conclusions, wrong tone, data ignored
4. **Are the analysis factors relevant for this specific ETF?** — Bond ETFs need different factors than equity ETFs
5. **Other observations** — Data pipeline issues, format inconsistencies, benchmark mismatches

## Related Files

- Factor definitions: `insights-ui/src/etf-analysis-data/etf-analysis-factors.json`
- Input preparation: `insights-ui/src/utils/etf-analysis-reports/etf-report-input-json-utils.ts`
- Input schemas: `insights-ui/schemas/etf-analysis/inputs/`
- Output schema: `insights-ui/schemas/etf-analysis/outputs/etf-category-analysis-output.schema.yaml`
- Analysis API: `insights-ui/src/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/analysis/route.ts`
- Morningstar data API: `insights-ui/src/app/api/[spaceId]/etfs-v1/exchange/[exchange]/[etf]/mor-info/route.ts`
- Previous reviews: `docs/ai-knowledge/insights-ui/etf-prompt-improvement/`
