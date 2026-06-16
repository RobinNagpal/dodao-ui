# Stocks — "Crawled — currently not indexed" pattern analysis

Google Search Console reports ~15k pages on koalagains.com sitting in **Crawled — currently
not indexed**. A revalidation run was kicked off in GSC and ~682 URLs failed the
revalidation (i.e. Google crawled them again and still chose not to index). Roughly
95–100 of those failures are the **main stock report pages** under `/stocks/{exchange}/{ticker}`.

This doc records:

1. What we already know about the page shape (`app/stocks/[exchange]/[ticker]/page.tsx`)
   and the sitemap (`app/stocks/sitemap.xml/route.ts`).
2. A per-URL teardown of 10 sample URLs flagged in the failed-revalidation set.
3. Patterns that show up across the 10 URLs — the candidate root causes that explain
   the cluster.
4. The follow-up experiments / data we still need before changing anything in code.

This is **only the main stock page**. The same GSC bucket also contains the per-section
sub-pages (`/business-and-moat`, `/fair-value`, etc.), which is a separate but related
investigation — see the existing item under
[`tasks/todo-tasks.md`](tasks/todo-tasks.md#stocks) about
`business-and-moat-sitemap.xml`.

---

## 1. What we already know about the page

- **Render mode**: `force-dynamic` (CloudFront-fronted), full HTML server-rendered.
  Robots meta is `index, follow` on every URL inspected. Canonical is self-referential
  and exchange-cased. Article + BreadcrumbList JSON-LD is emitted. So Google sees a
  fully indexable HTML document with structured data on every request.
- **Sitemap entry**: tickers are written to `stocks/sitemap.xml` with
  `lastmod = TickerV1.updatedAt.toISOString().split('T')[0]` (day precision). Moved /
  deleted tickers are excluded. `changefreq: weekly`, `priority: 0.6`.
- **Footer "Last updated"** is the only freshness signal visible to the crawler —
  per-category `AdminTimestamp` chips are admin-only.
- **OG / Twitter / `image` in Article schema** is the static `/koalagain_logo.png` for
  every page. There is no per-ticker hero image anywhere on the page.

## 2. Per-URL teardown (10 URLs in the failed-revalidation set)

Numbers below come from a server-rendered curl of each URL on 2026-06-16. "Visible
words" is the page text after stripping `<script>`/`<style>`/tags.

| # | URL                  | Industry (from breadcrumb)               | datePublished           | dateModified            | Age since modify | Visible words | HTML size | Mgmt-team section |
|---|----------------------|------------------------------------------|-------------------------|-------------------------|------------------|---------------|-----------|-------------------|
| 1 | ASX/CTM              | Metals, Minerals & Mining                | 2026-02-20T12:46:01.484Z | 2026-02-21T02:21:21.390Z | 114 days        | 5,265         | 1,301 KB  | no                |
| 2 | ASX/VTX              | Metals, Minerals & Mining                | 2026-02-20T14:31:35.349Z | 2026-02-20T15:00:08.127Z | 115 days        | 4,913         | 1,286 KB  | no                |
| 3 | NYSE/KNSL            | Insurance & Risk Management              | 2025-09-24T23:06:27.014Z | 2025-11-04T11:03:33.608Z | 223 days        | 2,541         | 1,261 KB  | no                |
| 4 | NYSE/STAG            | Real Estate                              | 2025-09-11T18:30:10.945Z | 2025-10-26T05:08:31.117Z | 232 days        | 2,474         | 1,263 KB  | no                |
| 5 | KOSDAQ/260660        | Healthcare: Biopharma & Life Sciences    | 2025-12-01T14:42:50.015Z | 2026-03-19T17:46:05.948Z |  88 days        | 2,457         | 1,244 KB  | no                |
| 6 | NASDAQ/TVRD          | Healthcare: Biopharma & Life Sciences    | 2025-11-03T14:54:09.596Z | 2026-03-19T17:34:20.172Z |  88 days        | 2,454         | 1,258 KB  | no                |
| 7 | NASDAQ/ELMT          | Aerospace and Defense                    | 2026-06-12T20:43:20.524Z | 2026-06-12T22:16:01.311Z |   3 days        | 8,173         | 1,289 KB  | yes               |
| 8 | NASDAQ/CBRS          | `Technology Hardware & Semiconductors ` (trailing space) | 2026-06-12T20:35:11.531Z | 2026-06-12T22:52:43.568Z |   3 days        | 7,788         | 1,285 KB  | yes               |
| 9 | NASDAQ/NHP           | Real Estate                              | 2026-06-12T20:43:20.529Z | 2026-06-12T22:20:31.199Z |   3 days        | 7,655         | 1,291 KB  | yes               |
|10 | NASDAQ/MMED          | `Healthcare: Technology & Equipment ` (trailing space)    | 2026-06-12T20:43:20.564Z | 2026-06-12T21:55:25.988Z |   3 days        | 6,917         | 1,282 KB  | yes               |

### Per-URL likely contributing reason

The "likely reason" column is a *hypothesis*, not a confirmed verdict — Google does not
tell us which factor tipped a URL out of the index. We pick the most plausible cause
based on the signal we can observe, and note where the URL fits into the wider patterns
in §3.

1. **ASX/CTM** — small-cap Australian miner, 5.3k words, ~4 months old. Likely
   thin-authority not thin-content: micro-cap with very low organic search demand, weak
   inbound links, and Yahoo/ASX page already saturating the SERP. Sub-pattern: ASX
   ticker (see §3 "exchange skew").
2. **ASX/VTX** — same shape as CTM, same industry (Metals/Mining), same ~4-month
   window. Reinforces the "ASX small-cap miner" cluster.
3. **NYSE/KNSL** — 2.5k visible words after 7+ months. Thin content for a US large-cap
   in a competitive vertical (Insurance). The ratio of HTML / visible-words is ~485
   bytes per word — high. Likely classified as low-value-add: site adds nothing the
   incumbent finance portals don't already have for KNSL.
4. **NYSE/STAG** — same shape as KNSL, REIT vertical. Same root cause hypothesis.
5. **KOSDAQ/260660** — Korean small-cap pharma, numeric ticker, mostly-English page.
   2.5k words, 3 months old. Likely tripped by (a) thin content, (b) non-Latin
   ticker / numeric symbol that's hard to link to from natural text, (c) Korea
   underrepresented in our internal link graph.
6. **NASDAQ/TVRD** — biopharma micro-cap, 2.5k words, 3 months old. Likely thin
   content; competes with Seeking Alpha + clinicaltrials.gov for the same query set.
7. **NASDAQ/ELMT**, **8. NASDAQ/CBRS**, **9. NASDAQ/NHP**, **10. NASDAQ/MMED** — all
   three days old. These look thicker (7-8k words, mgmt-team section present), but
   they were **all batch-published on 2026-06-12 within the same hour** (see
   `datePublished` cluster below). They are very likely just *not yet crawled* rather
   than rejected, but they also share two indexing-hostile signals: identical hostname
   author, identical OG image, and three of them share `datePublished` to the **second**
   (20:43:20.524, .529, .564). When the GSC report fingers a same-batch cluster, Google
   often treats them collectively as low-trust mass-published content.

### Date-published batch cluster (June-12 cohort)

```
2026-06-12T20:35:*  → NASDAQ/CBRS
2026-06-12T20:43:20.524Z → NASDAQ/ELMT
2026-06-12T20:43:20.529Z → NASDAQ/NHP
2026-06-12T20:43:20.564Z → NASDAQ/MMED
```

Three URLs published within **40 milliseconds of each other**. The cron is fine, but
exposing the cron clock as `datePublished` in Article schema is a footprint Google
clusters on.

## 3. Cross-URL patterns (root-cause candidates)

### A. Thin visible content on older pages

Of the **6 pages that have been live ≥ 3 months**, 4 sit at ~2,450–2,540 visible words:

- NYSE/KNSL (223 d) — 2,541
- NYSE/STAG (232 d) — 2,474
- KOSDAQ/260660 (88 d) — 2,457
- NASDAQ/TVRD (88 d) — 2,454

The two ASX miners are bigger (~5k words) but still in the "small for a financial
analysis page" range. Pages generated *more recently* (the June-12 cohort) are
6.9–8.2k words because they include the Management Team section. Older pages predate
that section.

**Implication**: legacy stock reports are at the thin-content boundary; the missing
Management Team section is one of the cuts that pushes them under. Backfilling the
section on older reports is plausibly the highest-impact lever.

### B. HTML weight ≫ visible content (every page)

Every page ships ~1.28–1.30 MB of HTML for 2.5k–8.2k visible words. That works out
to **165–520 bytes of HTML per visible word**. Most of that is the inlined RSC payload
+ chart.js / radar chart bootstrap, not analysis text. Google still indexes large
pages, but the ratio is a CWV / page-experience signal and a duplicate-template signal
(every URL on the site has the same shell).

### C. Identical OG / Twitter / Article-schema image on every URL

`https://koalagains.com/koalagain_logo.png` is the only image in `openGraph.images`,
`twitter.images`, and the Article-schema `image` array on all 10 URLs. From Google's
crawl, every stock URL on the site has the same image identifier. No image search
discovery, no per-URL uniqueness signal, and `Article` schema with no per-article
image is a weak structured-data signal.

### D. `datePublished` exposed at second-level cron precision

3 of the 4 newest URLs share `datePublished` to the second. Once GSC starts seeing
hundreds of URLs with the same `datePublished` timestamp, mass-publication patterns
become measurable. Same problem will repeat each time the batch generator runs.

### E. Industry / exchange skew in the failing 10

- **NASDAQ**: 5/10 (CBRS, ELMT, MMED, NHP, TVRD)
- **NYSE**: 2/10 (KNSL, STAG)
- **ASX**: 2/10 (CTM, VTX)
- **KOSDAQ**: 1/10 (260660)

Industries repeat inside just this 10-URL sample:

- **Real Estate**: 2 (STAG, NHP)
- **Healthcare: Biopharma & Life Sciences**: 2 (TVRD, 260660)
- **Metals, Minerals & Mining**: 2 (CTM, VTX)

A 10-URL sample isn't statistically meaningful on its own — but if the same industry
clusters hold across the ~95 failing main-stock URLs, that's a signal that *some
sub-set of industries* (likely the ones where competitor finance portals dominate
SERPs) are taking a disproportionate hit. **Action**: pull the full ~95-URL failed
list and bucket by `(exchange, industryKey)`.

### F. Data-quality bug: trailing whitespace in industry names

`"Technology Hardware & Semiconductors "` (CBRS) and `"Healthcare: Technology &
Equipment "` (MMED) both carry a trailing space that leaks into:

- The visible breadcrumb text
- The BreadcrumbList JSON-LD `name` field
- The `/stocks/industries/{industryKey}` link target (if `industryKey` was derived
  from `name`)

A trailing space won't cause a 404, but it's the kind of low-quality data signal that
correlates with indexing demotion. Easy fix; the root data is in either the industry
seed or the `TickerV1.industry.name` column.

### G. Non-US tickers are under-linked from the rest of the site

Three of the ten (`ASX/CTM`, `ASX/VTX`, `KOSDAQ/260660`) are non-US. The breadcrumb
links go to `/stocks/countries/Australia` and `/stocks/countries/Korea`. We do not
yet have data on how many *internal* links flow into those country pages from the
homepage / nav / featured rails. Hypothesis: non-US tickers receive a tiny fraction
of the link equity that US tickers do, which is a direct indexing-priority signal.

### H. `lastmod` granularity is one day (good) — but never re-stamped on content edits

`stocks/sitemap.xml` writes `lastmod = updatedAt.split('T')[0]`. That's correct *if*
`TickerV1.updatedAt` actually moves when the analysis content changes. If only some
report categories are regenerated but the parent `TickerV1.updatedAt` is *not* bumped,
the sitemap `lastmod` lies and Google's "is this worth re-crawling" heuristic decays
the URL. Worth verifying by sampling: pick a URL whose `categoryAnalysisResults[*]
.updatedAt` is recent and check whether `TickerV1.updatedAt` was bumped at the same
time.

---

## 4. Recommended next steps (before changing code)

The patterns above are hypotheses; turning them into a fix requires more data than
10 URLs.

1. **Pull the full failed-revalidation list** (~682 URLs from GSC). Bucket by
   `(category, exchange, industryKey, ageInDays, visibleWords, hasMgmtTeam)`. Decide
   the actual dominant cluster — it might not be the same as the 10-URL sample.
2. **Re-run the same teardown on a confirmed-indexed control group** (10 URLs that
   *are* indexed). The diff between "indexed" and "not indexed" is the real signal —
   the absolute numbers in §2 above don't tell us anything until we have a baseline.
3. **Decide which of A/B/C/D/F/H are worth fixing in code now** vs after we see the
   cluster data. Cheapest fixes:
   - **F. trailing-whitespace industry names** — pure data fix.
   - **D. cron-second datePublished** — round to date-only or to the report's actual
     publish time, not the cron tick.
   - **C. per-ticker hero image** — even a generated card with the ticker symbol +
     industry + verdict would beat the shared logo for Article schema uniqueness.
4. **Highest-impact lever (after data confirms it)**: backfill the Management Team
   section on every pre-June-12 report so all live URLs are in the same word-count
   range. This is the only lever that demonstrably increases visible content depth
   site-wide rather than per-URL.
5. **Sitemap audit**: verify `TickerV1.updatedAt` is bumped on category-report edits
   (per §3.H). If not, that's a one-line write fix with site-wide impact.

## 5. Open questions

- What is the indexed/not-indexed ratio by `(exchange, industryKey)` across the full
  failed-revalidation set? — answers §3.E.
- Do indexed URLs have a meaningfully higher visible-word count than non-indexed?
  Or is the divider somewhere else (inbound links, age, country)? — answers §3.A.
- Is `TickerV1.updatedAt` actually bumped when individual `categoryAnalysisResults`
  are regenerated? — answers §3.H.
- Where do internal links to non-US country pages come from today (homepage / nav /
  cross-section rails)? Are non-US tickers reachable in ≤ 2 clicks from the home
  page? — answers §3.G.

---

*Last updated: 2026-06-16. Sample of 10 URLs from the ~95 main-stock URLs that
failed the most recent GSC revalidation run.*
