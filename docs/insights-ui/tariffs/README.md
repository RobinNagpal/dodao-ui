# Tariffs Knowledge

Reference docs for the tariffs analysis subsystem on KoalaGains. For active / planned tariff features see [`../tasks/todo-tasks.md`](../tasks/todo-tasks.md).

## Files

- **[tariffs-functionality.md](tariffs-functionality.md)** — Comprehensive overview of the tariffs analysis subsystem: pipeline, data structures, UI components, S3 storage, admin flow, and the multi-step report-generation flow across 40+ industries.
- **[tariff-usecases.md](tariff-usecases.md)** — Catalog of real-world tariff use cases (importers/exporters, supply-chain managers, SMEs, e-commerce sellers, etc.) with criticality scoring; informs feature prioritization.
- **[post-merge-url-checklist.md](post-merge-url-checklist.md)** — Smoke-test checklist of every public tariff URL (active + deprecated) for two industries, plus cache-tag/revalidation expectations. Run after a Prisma-migration deploy.
- **[chapter-content-refresh.md](chapter-content-refresh.md)** — Runbook for refreshing an Approach-2 HTS chapter (`src/tariff-data/chapters/<slug>.json` + `exports/<slug>/`) or building a new one: which official source to check for each kind of fact (HTS revisions, Federal Register, CBP CSMS, USTR 301, BIS 232, eCFR, Comtrade/Census, foreign gazettes), how to record sources/dates/`sourceIds`, cross-page consistency rules, the `pnpm tariff:validate-chapters` validator, and the per-chapter CloudFront flush after deploy.
