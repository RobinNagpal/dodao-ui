# ETF Analysis Knowledge

End-to-end reference for the ETF analysis pipeline: how to trigger reports, the market-scenarios catalog, and the scenarios-page implementation plan.

## Files

- **[generate-etf-reports.md](generate-etf-reports.md)** — How to enqueue ETF analysis reports via the `etfs:trigger` script — single ETF or batch, all reports or specific types. Covers the 10-second per-ETF delay, the 50-ETF hard cap, the report-type selectors (`--all`, `--evaluation`, explicit `--categories=<csv>`), automatic per-ETF and listing-tag cache invalidation, auth, output-file format, and common failure modes.
- **[etf-market-scenarios.md](etf-market-scenarios.md)** — Catalog of 31 recurring sector/asset-class market scenarios with underlying causes, historical analogs, ETF winners/losers, and dated outlook blocks. The source content powering the public ETF Scenarios page.
- **[etf-scenarios-implementation-checklist.md](etf-scenarios-implementation-checklist.md)** — Implementation plan for the ETF Scenarios feature: DB table, REST API, public listing + detail pages, admin CRUD. Backed by the catalog above.
- **[etf-category-index-comparison-relevance.md](etf-category-index-comparison-relevance.md)** — Assessment of when index vs category comparison actually moves the purchase decision, with 0–100 relevance scores across the 6 investor types × ~54 goals in `etf-target-investor-groups.json`. Identifies scenarios where comparison is central (cash equitization, RIA core models, TLH pairs), where it's marginal (short-duration bills, muni sleeves), and where it's the wrong frame entirely (buffered ETFs, leveraged products, DAF funding).
