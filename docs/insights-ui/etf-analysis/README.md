# ETF Analysis Knowledge

End-to-end reference for the ETF analysis pipeline: how to trigger reports, plus the ETF Scenarios system that ties scenarios to winner / loser / most-exposed ETFs.

## Files

- **[generate-etf-reports.md](generate-etf-reports.md)** — How to enqueue ETF analysis reports via the `etfs:trigger` script — single ETF or batch, all reports or specific types. Covers the 10-second per-ETF delay, the 50-ETF hard cap, the report-type selectors (`--all`, `--evaluation`, explicit `--categories=<csv>`), automatic per-ETF and listing-tag cache invalidation, auth, output-file format, and common failure modes.
- **[etf-generation-failures-rca.md](etf-generation-failures-rca.md)** — Root-cause analysis of why ETF generation requests end up `Failed` (or never finish). Traces the poll → trigger → in-process background → save/advance chain and identifies the primary defect: the 5-minute stale-step guard treats slow-but-successful LLM calls as failures, cascades the failure to `FINAL_SUMMARY`, and (with no abort on the orphaned task) leaves requests marked `Failed` even though every report was generated. Covers five secondary causes (no LLM timeout, chain-vs-poll double-trigger, inconsistent dependency gating, the strict factor-count guard, and config-state hard failures), a suggested fix order, and how to confirm each in production.
- **[etf-scenarios.md](etf-scenarios.md)** — The ETF Scenarios system: `EtfScenario` + `EtfScenarioEtfLink` Prisma models, field reference (probability bucket, priced-in bucket, expected price change, etc.), the 5-winner / 5-loser / 5-most-exposed convention, and the three paths to add or update a scenario (admin UI, full POST upsert-by-slug with `AUTOMATION_SECRET`, bulk Markdown import).

For drafting a new scenario (scratch-file workflow under `/tmp/scenarios/etfs/<slug>.md` and the required content template), see [`../scenario-authoring.md`](../scenario-authoring.md).
