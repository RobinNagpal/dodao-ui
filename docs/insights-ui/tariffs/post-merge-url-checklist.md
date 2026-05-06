# Post-Merge URL Checklist — Tariff Reports (PR #1426)

After merging PR #1426 (Prisma migration + chapter routing), walk through every URL
below for two representative industries to confirm data still loads from Prisma,
SEO is correct, and the deprecated routes show the cover page with a canonical
back to the cover.

Two industries chosen for coverage:

- **Pharmaceuticals** — `industryId = pharmaceuticals` (3 headings × 2 sub-headings)
- **Automobiles** — `industryId = automobiles` (3 headings × 2 sub-headings)

For each URL: verify HTTP 200 (or expected 301), main content renders, browser
tab title and `<meta name="description">` come from `seoDetails`, and (where
relevant) the `<link rel="canonical">` matches the column noted below.

## Production base URL

`https://koalagains.com`

## Active section pages (each must render, sitemap-listed)

| # | Path | Expected canonical |
|---|------|--------------------|
| 1 | `/tariff-reports` | `/tariff-reports` (listing page) |
| 2 | `/industry-tariff-report/pharmaceuticals` | self |
| 3 | `/industry-tariff-report/pharmaceuticals/tariff-updates` | self |
| 4 | `/industry-tariff-report/pharmaceuticals/understand-industry` | self |
| 5 | `/industry-tariff-report/pharmaceuticals/industry-areas` | self |
| 6 | `/industry-tariff-report/pharmaceuticals/final-conclusion` | self |
| 7 | `/industry-tariff-report/automobiles` | self |
| 8 | `/industry-tariff-report/automobiles/tariff-updates` | self |
| 9 | `/industry-tariff-report/automobiles/understand-industry` | self |
| 10 | `/industry-tariff-report/automobiles/industry-areas` | self |
| 11 | `/industry-tariff-report/automobiles/final-conclusion` | self |

## Deprecated routes (kept for backward compatibility)

These routes still respond 200 but render the **industry cover** body.
The `<link rel="canonical">` MUST point to the cover URL, not the section URL.
None of these should appear in `sitemap.xml`.

| # | Path | Expected canonical |
|---|------|--------------------|
| 12 | `/industry-tariff-report/pharmaceuticals/all-countries-tariff-updates` | `/industry-tariff-report/pharmaceuticals` |
| 13 | `/industry-tariff-report/pharmaceuticals/evaluate-industry-areas` | `/industry-tariff-report/pharmaceuticals` |
| 14 | `/industry-tariff-report/pharmaceuticals/evaluate-industry-areas/0-0` | `/industry-tariff-report/pharmaceuticals` |
| 15 | `/industry-tariff-report/pharmaceuticals/evaluate-industry-areas/0-1` | `/industry-tariff-report/pharmaceuticals` |
| 16 | `/industry-tariff-report/pharmaceuticals/evaluate-industry-areas/1-0` | `/industry-tariff-report/pharmaceuticals` |
| 17 | `/industry-tariff-report/pharmaceuticals/evaluate-industry-areas/1-1` | `/industry-tariff-report/pharmaceuticals` |
| 18 | `/industry-tariff-report/pharmaceuticals/evaluate-industry-areas/2-0` | `/industry-tariff-report/pharmaceuticals` |
| 19 | `/industry-tariff-report/pharmaceuticals/evaluate-industry-areas/2-1` | `/industry-tariff-report/pharmaceuticals` |
| 20 | `/industry-tariff-report/automobiles/all-countries-tariff-updates` | `/industry-tariff-report/automobiles` |
| 21 | `/industry-tariff-report/automobiles/evaluate-industry-areas` | `/industry-tariff-report/automobiles` |
| 22 | `/industry-tariff-report/automobiles/evaluate-industry-areas/0-0` | `/industry-tariff-report/automobiles` |
| 23 | `/industry-tariff-report/automobiles/evaluate-industry-areas/0-1` | `/industry-tariff-report/automobiles` |
| 24 | `/industry-tariff-report/automobiles/evaluate-industry-areas/1-0` | `/industry-tariff-report/automobiles` |
| 25 | `/industry-tariff-report/automobiles/evaluate-industry-areas/1-1` | `/industry-tariff-report/automobiles` |
| 26 | `/industry-tariff-report/automobiles/evaluate-industry-areas/2-0` | `/industry-tariff-report/automobiles` |
| 27 | `/industry-tariff-report/automobiles/evaluate-industry-areas/2-1` | `/industry-tariff-report/automobiles` |

## Sitemap and APIs

| # | Path | Expectation |
|---|------|-------------|
| 28 | `/industry-tariff-report/sitemap.xml` | Contains the 5 section URLs for every seeded industry; **must NOT** contain `all-countries-tariff-updates` or `evaluate-industry-areas` |
| 29 | `/api/industry-tariff-reports/pharmaceuticals` | 200, JSON with `reportCover`, `tariffUpdates`, `understandIndustry`, `industryAreas`, `industryAreasSections`, `finalConclusion`, `reportSeoDetails` |
| 30 | `/api/industry-tariff-reports/pharmaceuticals/seo` | 200, `seoDetails.reportCoverSeoDetails`, `tariffUpdatesSeoDetails`, etc. |
| 31 | `/api/industry-tariff-reports/automobiles` | same shape as #29 |
| 32 | `/api/industry-tariff-reports/automobiles/seo` | same shape as #30 |

## Chapter pages (slug-based, only for chapters seeded *without* `oldUrl`)

If a chapter row has `oldUrl` set, visiting `/industry-tariff-report/chapters/<slug>`
must 301 to `/industry-tariff-report/<oldUrl>`. Otherwise the placeholder renders.

Quick spot-check (replace `<slug>` with a real seeded slug from the listing page):

- `/industry-tariff-report/chapters/<slug>`
- `/industry-tariff-report/chapters/<slug>/tariff-updates`
- `/industry-tariff-report/chapters/<slug>/understand-industry`
- `/industry-tariff-report/chapters/<slug>/industry-areas`
- `/industry-tariff-report/chapters/<slug>/final-conclusion`

## Cache behaviour to confirm

Every server fetch in the industry pages tags the response with
`tariff_report:<INDUSTRYID-UPPERCASE>` (see `src/utils/tariff-report-tags.ts`).

- **No time-based revalidation is configured** — the cache holds indefinitely
  and is invalidated only via `revalidateTariffReport(industryId)` (calls
  `revalidateTag(...)`). That helper currently fires from
  `src/scripts/report-file-utils.ts` after admin writes.
- After a content edit through the admin tooling, refresh the public pages and
  confirm the change appears immediately. If you ever want a TTL, add
  `revalidate: <seconds>` inside `next: { tags: [...] }` in the page fetch
  options or `export const revalidate` on the route segment.
