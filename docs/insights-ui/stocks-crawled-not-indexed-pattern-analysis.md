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

## 2. Per-URL teardown (20 URLs in the failed-revalidation set)

Numbers below come from a server-rendered curl of each URL on 2026-06-16. "Visible
words" is the page text after stripping `<script>`/`<style>`/tags. Rows 1–10 are the
first batch the user sent; rows 11–20 were sent in a follow-up message and all sit in
the same failed-revalidation bucket.

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
|11 | ASX/AHX              | Healthcare: Biopharma & Life Sciences    | 2026-02-20T14:31:35.349Z | 2026-02-20T21:24:24.484Z | 115 days        | 5,702         | 1,242 KB  | no                |
|12 | ASX/ELD              | Agribusiness & Farming                   | 2026-02-20T12:46:01.484Z | 2026-02-21T01:51:15.418Z | 114 days        | 5,174         | 1,295 KB  | no                |
|13 | NASDAQ/CAI           | Healthcare: Biopharma & Life Sciences    | 2025-11-03T15:27:52.470Z | 2025-11-07T11:02:17.184Z | 220 days        | 2,547         | 1,224 KB  | no                |
|14 | KOSDAQ/092040        | Healthcare: Biopharma & Life Sciences    | 2025-12-01T14:34:20.089Z | 2025-12-01T16:06:43.242Z | 196 days        | 2,297         | 1,242 KB  | no                |
|15 | KOSDAQ/261780        | Healthcare: Biopharma & Life Sciences    | 2025-12-01T14:35:53.724Z | 2025-12-01T18:36:01.360Z | 196 days        | 2,465         | 1,240 KB  | no                |
|16 | KOSPI/017180         | Healthcare: Biopharma & Life Sciences    | 2025-12-01T14:42:49.956Z | 2026-03-19T17:46:06.057Z |  88 days        | 2,442         | 1,238 KB  | no                |
|17 | NASDAQ/MOBI          | `Healthcare: Technology & Equipment ` (trailing space)    | 2026-06-12T20:43:20.482Z | 2026-06-12T21:09:33.579Z |   3 days        | 7,182         | 1,273 KB  | yes               |
|18 | NASDAQ/ODTX          | Healthcare: Biopharma & Life Sciences    | 2026-06-12T20:43:20.486Z | 2026-06-12T21:11:13.095Z |   3 days        | 8,713         | 1,299 KB  | yes               |
|19 | NASDAQ/ALMR          | `Healthcare: Technology & Equipment ` (trailing space)    | 2026-06-12T20:43:20.540Z | 2026-06-12T22:12:15.036Z |   3 days        | 7,318         | 1,282 KB  | yes               |
|20 | NASDAQ/PICS          | Software Infrastructure & Applications   | 2026-06-12T20:43:20.593Z | 2026-06-12T21:38:24.832Z |   3 days        | 9,319         | 1,314 KB  | yes               |

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
11. **ASX/AHX** — Australian small-cap animal-health business, 5.7k words, ~4 months
    old. Same shape as the ASX miners in rows 1–2: visible content is fine, but the
    ticker is microcap-obscure and our internal link graph to Australian biopharma is
    thin. Shares `datePublished` (2026-02-20T14:31:35.349Z) **to the millisecond** with
    ASX/VTX — confirms the ASX cron-batch fingerprint (§3.D).
12. **ASX/ELD** — Australian agribusiness, 5.2k words, ~4 months old. Shares
    `datePublished` (2026-02-20T12:46:01.484Z) **to the millisecond** with ASX/CTM,
    again confirming the ASX batch fingerprint. Sole "Agribusiness & Farming" example
    in the 20-URL sample so far.
13. **NASDAQ/CAI** — Caris Life Sciences, 2.5k words, ~7 months old. Same thin-content
    pattern as KNSL / STAG / TVRD: long enough in the sitemap to have been indexed,
    but visible word count sits at the same ~2.5k floor. Reinforces the "older +
    missing Management Team" cluster (§3.A).
14–16. **KOSDAQ/092040, KOSDAQ/261780, KOSPI/017180** — three Korean Healthcare
    Biopharma tickers all published on 2025-12-01 within 8 minutes of each other
    (14:34:20, 14:35:53, 14:42:49). Combined with KOSDAQ/260660 from the first batch
    (also 2025-12-01T14:42:50), this is a **4-URL Korean batch** all in the same
    industry, with visible word counts at the floor (2,297–2,465). This is the
    sharpest single cluster in the 20-URL sample — every Korean URL in the sample
    is microcap Healthcare Biopharma, from the same cron batch, with the thinnest
    visible content.
17–20. **NASDAQ/MOBI, NASDAQ/ODTX, NASDAQ/ALMR, NASDAQ/PICS** — same June-12 cohort
    as rows 7–10. Likely just not yet crawled, but they tighten the
    `datePublished`-cluster fingerprint considerably: combined with rows 7, 9, 10
    we now have **seven NASDAQ URLs** published within a **111 ms window** at
    2026-06-12T20:43:20.* (.482, .486, .524, .529, .540, .564, .593). MOBI / ALMR
    also share the "Healthcare: Technology & Equipment " trailing-whitespace industry
    name with MMED — three rows in the sample carry the same bad data.

### Date-published batch cluster (expanded across both batches)

```
ASX cron @ 2026-02-20T12:46:01.484Z (identical to ms): ASX/CTM, ASX/ELD
ASX cron @ 2026-02-20T14:31:35.349Z (identical to ms): ASX/VTX, ASX/AHX
Korean cron @ 2025-12-01T14:3*-14:4*: KOSDAQ/092040, KOSDAQ/261780, KOSPI/017180, KOSDAQ/260660
NASDAQ cron @ 2026-06-12T20:43:20.* (111 ms window):
  .482Z → NASDAQ/MOBI
  .486Z → NASDAQ/ODTX
  .524Z → NASDAQ/ELMT
  .529Z → NASDAQ/NHP
  .540Z → NASDAQ/ALMR
  .564Z → NASDAQ/MMED
  .593Z → NASDAQ/PICS
NASDAQ outlier  @ 2026-06-12T20:35:11.531Z → NASDAQ/CBRS (8 min before the main NASDAQ batch)
```

Three independent crons (ASX cohort, Korean cohort, NASDAQ June-12 cohort) each
emit `datePublished` at the same instant across multiple URLs. The two ASX pairs
even share `datePublished` to the **millisecond**. The NASDAQ June-12 cron fires
seven URLs inside 111 ms. The cron schedules are fine; what's wrong is that we
*expose the cron's clock* as the per-Article `datePublished` and as the OG
`publishedTime` in `generateMetadata` (`createdTime = data.createdAt?.toISOString()`).
Across thousands of URLs, this becomes a structural mass-publication footprint that
Google can cluster on.

## 3. Cross-URL patterns (root-cause candidates)

### A. Thin visible content on older pages

Across the 20 URLs, **the 12 pages that have been live ≥ 3 months** split cleanly
into two tiers:

| Tier | Visible words | Count | URLs |
|------|---------------|-------|------|
| Thin (≤ 2,550 words) | 2,297–2,547 | 8 | NYSE/KNSL, NYSE/STAG, KOSDAQ/260660, NASDAQ/TVRD, NASDAQ/CAI, KOSDAQ/092040, KOSDAQ/261780, KOSPI/017180 |
| ASX cohort (4.9k–5.7k words) | 4,913–5,702 | 4 | ASX/CTM, ASX/VTX, ASX/AHX, ASX/ELD |

Pages generated *more recently* (the June-12 cohort, rows 7–10 and 17–20) are
6.9–9.3k words because they include the Management Team section. None of the older
pages have it.

The thin-tier word count is suspiciously consistent: 8 URLs land in a ~250-word
band (2,297–2,547). That looks like a **structural ceiling** — without Management
Team, the page is just (Summary + Business & Moat + Financial Statement Analysis +
Past Performance + Future Growth + Fair Value) summary cards, and the LLM tends to
produce roughly the same word budget for each. Adding Management Team lifts pages
straight into the 6.9–9.3k range.

**Implication**: legacy stock reports are at the thin-content boundary; the missing
Management Team section is one of the cuts that pushes them under. Backfilling the
section on every pre-June-12 report is the single highest-impact lever the sample
points to.

### B. HTML weight ≫ visible content (every page)

Every page ships ~1.28–1.30 MB of HTML for 2.5k–8.2k visible words. That works out
to **165–520 bytes of HTML per visible word**. Most of that is the inlined RSC payload
+ chart.js / radar chart bootstrap, not analysis text. Google still indexes large
pages, but the ratio is a CWV / page-experience signal and a duplicate-template signal
(every URL on the site has the same shell).

### C. Identical OG / Twitter / Article-schema image on every URL

`https://koalagains.com/koalagain_logo.png` is the only image in `openGraph.images`,
`twitter.images`, and the Article-schema `image` array on all 20 URLs. From Google's
crawl, every stock URL on the site has the same image identifier. No image search
discovery, no per-URL uniqueness signal, and `Article` schema with no per-article
image is a weak structured-data signal.

### D. `datePublished` exposed at sub-second cron precision

Confirmed strongly across the 20-URL sample (see expanded cluster table in §2):

- ASX/CTM and ASX/ELD share `datePublished` **to the millisecond**.
- ASX/VTX and ASX/AHX share `datePublished` **to the millisecond**.
- 7 of the 8 NASDAQ June-12 URLs share `datePublished` to the **same second**
  (2026-06-12T20:43:20.\*Z, inside a 111 ms window).
- 4 Korean URLs share `datePublished` inside an 8-minute window on 2025-12-01.

`generateMetadata` writes `publishedTime: createdTime ?? updatedTime`, where
`createdTime = data.createdAt?.toISOString()`. That value is the cron tick — not the
report's actual publication time. Once GSC sees the full ~95 URL set, the
mass-publication pattern is unambiguous. Fix: either round `datePublished` /
`publishedTime` to date-only, or derive it from the report's logical "first
published" timestamp instead of the row's `createdAt`.

### E. Industry / exchange skew in the failing 20

Exchange split (20-URL sample):

- **NASDAQ**: 10/20 (CBRS, ELMT, MMED, NHP, TVRD, MOBI, ODTX, ALMR, PICS, CAI)
- **NYSE**: 2/20 (KNSL, STAG)
- **ASX**: 4/20 (CTM, VTX, AHX, ELD)
- **KOSDAQ**: 3/20 (260660, 092040, 261780)
- **KOSPI**: 1/20 (017180)

Industry distribution:

- **Healthcare: Biopharma & Life Sciences**: 8/20 (TVRD, 260660, AHX, CAI, 092040,
  261780, 017180, ODTX) — **the single largest cluster, by a wide margin.**
- **Healthcare: Technology & Equipment** (with trailing space): 3/20 (MMED, MOBI,
  ALMR) — same trailing-whitespace industry record (§3.F) on all three rows.
- **Real Estate**: 2/20 (STAG, NHP)
- **Metals, Minerals & Mining**: 2/20 (CTM, VTX)
- **Insurance & Risk Management**, **Aerospace and Defense**, **Technology Hardware
  & Semiconductors** (trailing space), **Agribusiness & Farming**, **Software
  Infrastructure & Applications**: 1 each.

**Healthcare verticals account for 11/20 (55%) of the failing sample.** Combined
with the thin-content pattern (§3.A) and the Korean batch cluster (§2 rows 14–16),
the dominant failing archetype is **small/micro-cap Healthcare Biopharma**.

Every Korean URL in the sample is Healthcare Biopharma microcap. Every Australian
URL (4/4) is a microcap; 2 are miners and 1 is animal health and 1 is agribusiness.

**Action**: pull the full ~95-URL failed list and bucket by `(exchange, industryKey)`.
The 20-sample hypothesis is that Healthcare Biopharma + small-cap-microcap + non-US
together cover most of the failing set. If the full bucket confirms it, the fix path
narrows considerably: prioritize Management Team backfill + image schema + internal
linking on the Healthcare Biopharma + non-US slices first.

### F. Data-quality bug: trailing whitespace in industry names

Two industry records leak a trailing space into the rendered breadcrumb and the
BreadcrumbList JSON-LD `name` field:

- `"Technology Hardware & Semiconductors "` — 1 URL (CBRS).
- `"Healthcare: Technology & Equipment "` — 3 URLs (MMED, MOBI, ALMR).

So 4 of 20 sample URLs (20%) carry visibly broken industry names. The trailing
space also flows into the `/stocks/industries/{industryKey}` link target if
`industryKey` was derived from `name`. A trailing space won't cause a 404, but
it's the kind of low-quality data signal that correlates with indexing demotion.
Easy fix; the root data is in either the industry seed or the `TickerV1.industry
.name` column.

### G. Non-US tickers are under-linked from the rest of the site

8 of 20 (`ASX/CTM`, `ASX/VTX`, `ASX/AHX`, `ASX/ELD`, `KOSDAQ/260660`, `KOSDAQ/092040`,
`KOSDAQ/261780`, `KOSPI/017180`) are non-US — 40% of the sample. The breadcrumb
links go to `/stocks/countries/Australia` and `/stocks/countries/Korea`. We do not
yet have data on how many *internal* links flow into those country pages from the
homepage / nav / featured rails. Hypothesis: non-US tickers receive a tiny fraction
of the link equity that US tickers do, which is a direct indexing-priority signal.
The 4 ASX tickers in the sample fall into 3 different industries
(Mining, Biopharma, Agribusiness) so the cluster isn't industry-specific — country
under-linking is the more likely common factor for the ASX cohort.

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
20 URLs.

1. **Pull the full failed-revalidation list** (~682 URLs from GSC). Bucket by
   `(category, exchange, industryKey, ageInDays, visibleWords, hasMgmtTeam)`. Decide
   the actual dominant cluster — the 20-URL sample points strongly at small-cap
   Healthcare Biopharma + non-US, but a 20-URL sample isn't enough to commit a fix to.
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

*Last updated: 2026-06-16. Sample of 20 URLs (two 10-URL batches from the user) out
of the ~95 main-stock URLs that failed the most recent GSC revalidation run.*
