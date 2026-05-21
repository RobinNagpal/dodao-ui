# ETF Analysis Knowledge

End-to-end reference for the ETF analysis pipeline: how to trigger reports, plus the ETF Scenarios system that ties scenarios to winner / loser / most-exposed ETFs.

## Files

- **[generate-etf-reports.md](generate-etf-reports.md)** — How to enqueue ETF analysis reports via the `etfs:trigger` script — single ETF or batch, all reports or specific types. Covers the 10-second per-ETF delay, the 50-ETF hard cap, the report-type selectors (`--all`, `--evaluation`, explicit `--categories=<csv>`), automatic per-ETF and listing-tag cache invalidation, auth, output-file format, and common failure modes.
- **[etf-scenarios.md](etf-scenarios.md)** — The ETF Scenarios system: `EtfScenario` + `EtfScenarioEtfLink` Prisma models, field reference (probability bucket, priced-in bucket, expected price change, etc.), the 5-winner / 5-loser / 5-most-exposed convention, and the three paths to add or update a scenario (admin UI, full POST upsert-by-slug with `AUTOMATION_SECRET`, bulk Markdown import).
- **[best-etf-by-time-horizon.md](best-etf-by-time-horizon.md)** — Planning notes for picking the best ETFs by holding horizon. Currently covers step (1) "High Category/Index Decision" for the 3-year and 10-year horizons — which categories/sectors to fish in, which to skip and why, and per-pick commentary on whether the upside is already priced in. The 1-year version lives in the planning workspace.

For drafting a new scenario (scratch-file workflow under `/tmp/scenarios/etfs/<slug>.md` and the required content template), see [`../scenario-authoring.md`](../scenario-authoring.md).
