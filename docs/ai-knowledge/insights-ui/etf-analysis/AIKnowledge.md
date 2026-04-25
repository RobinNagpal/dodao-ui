# ETF Analysis Knowledge

End-to-end reference for the ETF analysis pipeline: how to trigger reports.

## Files

- **[generate-etf-reports.md](generate-etf-reports.md)** — How to enqueue ETF analysis reports via the `etfs:trigger` script — single ETF or batch, all reports or specific types. Covers the 10-second per-ETF delay, the 50-ETF hard cap, the report-type selectors (`--all`, `--evaluation`, explicit `--categories=<csv>`), automatic per-ETF and listing-tag cache invalidation, auth, output-file format, and common failure modes.

ETF market scenarios live in the `EtfScenario` Prisma model (see `insights-ui/prisma/schema.prisma`) and are managed through the admin UI at `/admin-v1/etf-scenarios` — there is no longer a markdown catalog or implementation checklist.
