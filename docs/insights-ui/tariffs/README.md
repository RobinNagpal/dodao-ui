# Tariffs Knowledge

Reference docs for the tariffs analysis subsystem on KoalaGains. For active / planned tariff features see [`../tasks/optional_tariff_features.md`](../tasks/optional_tariff_features.md).

## Files

- **[tariffs-functionality.md](tariffs-functionality.md)** — Comprehensive overview of the tariffs analysis subsystem: pipeline, data structures, UI components, S3 storage, admin flow, and the multi-step report-generation flow across 40+ industries.
- **[tariff-usecases.md](tariff-usecases.md)** — Catalog of real-world tariff use cases (importers/exporters, supply-chain managers, SMEs, e-commerce sellers, etc.) with criticality scoring; informs feature prioritization.
- **[post-merge-url-checklist.md](post-merge-url-checklist.md)** — Smoke-test checklist of every public tariff URL (active + deprecated) for two industries, plus cache-tag/revalidation expectations. Run after a Prisma-migration deploy.
