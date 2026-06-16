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

## 2. Per-URL teardown (30 URLs in the failed-revalidation set)

Numbers below come from a server-rendered curl of each URL on 2026-06-16. "Visible
words" is the page text after stripping `<script>`/`<style>`/tags. Rows 1–10 are the
first batch the user sent; rows 11–20 were a follow-up; rows 21–30 came in a third
batch. All 30 URLs sit in the same failed-revalidation bucket.

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
|21 | NYSE/AGBK            | Banks                                    | 2026-06-12T20:43:20.568Z | 2026-06-12T21:48:33.601Z |   3 days        | 8,456         | 1,302 KB  | yes               |
|22 | NYSE/WHK             | Oil & Gas Industry                       | 2026-06-12T20:35:11.489Z | 2026-06-12T23:17:20.642Z |   3 days        | 6,821         | 1,261 KB  | yes               |
|23 | KOSPI/326030         | Healthcare: Biopharma & Life Sciences    | 2025-12-01T14:37:21.217Z | 2026-03-19T17:29:30.955Z |  88 days        | 2,492         | 1,243 KB  | no                |
|24 | NYSE/AADX            | Aerospace and Defense                    | 2026-06-12T20:35:11.516Z | 2026-06-12T22:46:35.925Z |   3 days        | 7,893         | 1,285 KB  | yes               |
|25 | NYSE/ANDG            | Capital Markets & Financial Services     | 2026-06-12T20:44:38.309Z | 2026-06-12T21:45:08.940Z |   3 days        | 7,833         | 1,304 KB  | yes               |
|26 | NASDAQ/KLRA          | Healthcare: Biopharma & Life Sciences    | 2026-06-12T20:43:20.544Z | 2026-06-12T22:07:26.451Z |   3 days        | 8,963         | 1,306 KB  | yes               |
|27 | NYSE/PS              | Capital Markets & Financial Services     | 2026-06-12T20:43:20.516Z | 2026-06-12T22:33:35.887Z |   3 days        | 8,518         | 1,292 KB  | yes               |
|28 | NASDAQ/DORM          | Automotive                               | 2025-10-24T14:10:06.983Z | 2025-12-26T15:17:23.209Z | 171 days        | 4,836         | 1,297 KB  | no                |
|29 | ASX/SHN              | Metals, Minerals & Mining                | 2026-02-20T14:31:35.349Z | 2026-02-20T15:57:54.607Z | 115 days        | 5,706         | 1,310 KB  | no                |
|30 | NYSEAMERICAN/LSF     | Food, Beverage & Restaurants             | 2025-10-03T17:04:32.501Z | 2025-11-04T09:52:54.952Z | 223 days        | 2,494         | 1,259 KB  | no                |

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
21. **NYSE/AGBK** — Brazilian bank, June-12 cohort. The first **Banks** vertical in
    the sample. Hispanic / Latin-America-exposed US-listed name; competes with
    English-language Yahoo/Bloomberg pages plus Portuguese-language sources, which
    is a known "ambiguous primary-language" indexing signal worth checking.
22. **NYSE/WHK** — Oil & Gas, June-12 cohort. Belongs to a *second* NASDAQ-/NYSE-
    spanning June-12 cron pulse at 2026-06-12T20:35:11.\* (alongside CBRS at .531
    and AADX at .516). Three URLs sharing that earlier batch fingerprint exactly
    8 minutes before the main 20:43:20 burst.
23. **KOSPI/326030** (SK Biopharmaceuticals) — fifth Korean URL in the sample, fifth
    Healthcare Biopharma in the Korean cohort. 2,492 words at 88 days — at the same
    thin-content floor as the other Korean URLs. Confirms the
    "every Korean URL in the failing set is microcap Healthcare Biopharma" cluster.
24. **NYSE/AADX** — Aerospace & Defense, June-12 cohort. Sibling to NASDAQ/ELMT in
    the same vertical. Structurally odd: 17 `<h3>` tags vs the typical 10 for the
    June-12 cohort, which suggests the AADX page rendered an expanded sub-section
    breakdown (likely Competition or Financial-Statement-Analysis sub-cards). Worth
    a one-off comparison to confirm whether a different template path is in play.
25. **NYSE/ANDG** — Capital Markets, June-12 cohort. Has its own minute on the cron
    (2026-06-12T20:44:38.309Z), distinct from the 20:43:20 and 20:35:11 pulses.
    Suggests at least *three* sub-batches inside the June-12 run, not two.
26. **NASDAQ/KLRA** — Healthcare Biopharma, June-12 cohort. Lands inside the main
    20:43:20.\* cluster (at .544Z). Adds to the Healthcare Biopharma count
    (now 10/30).
27. **NYSE/PS** — Capital Markets, June-12 cohort. Lands at 20:43:20.**516**Z —
    the *earliest* timestamp inside the main June-12 burst. That extends the
    burst window slightly (now .482 → .593 = 111 ms across **10 URLs**, see
    expanded cluster table).
28. **NASDAQ/DORM** — Automotive, ~5.7 months old, **4,836 words**. Only mid-tier
    older page in the sample without a Management Team section. Sits between the
    ~2.5k thin tier and the ASX ~5k tier. Sole Automotive vertical → probably a
    one-off rather than part of a cluster.
29. **ASX/SHN** — Australian mining microcap, ~4 months old. Shares
    `datePublished` (2026-02-20T14:31:35.349Z) **to the millisecond** with ASX/VTX
    and ASX/AHX — a **three-way millisecond-identical cluster** that's the
    cleanest cron fingerprint in the sample.
30. **NYSEAMERICAN/LSF** — first NYSEAMERICAN URL in the sample. Laird Superfood,
    ~7 months old, 2,494 words — thin tier. NYSEAMERICAN is mapped to US
    (`countryExchangeUtils.ts`) so it rolls into the US bucket for the sitemap,
    but it's a thinly-traded board with weaker external link signal than NYSE/NASDAQ
    proper. Worth checking whether the failing set is over-indexed on
    NYSEAMERICAN / OTCMKTS specifically.

### Date-published batch cluster (expanded across all three batches)

```
ASX cron @ 2026-02-20T12:46:01.484Z (identical to ms): ASX/CTM, ASX/ELD
ASX cron @ 2026-02-20T14:31:35.349Z (identical to ms): ASX/VTX, ASX/AHX, ASX/SHN  ← 3-way ms-identical
Korean cron @ 2025-12-01T14:3*-14:4* (8-min window, 5 URLs):
  14:34:20.089Z → KOSDAQ/092040
  14:35:53.724Z → KOSDAQ/261780
  14:37:21.217Z → KOSPI/326030
  14:42:49.956Z → KOSPI/017180
  14:42:50.015Z → KOSDAQ/260660  ← within 59 ms of 017180
NASDAQ/NYSE cron @ 2026-06-12T20:35:11.* (~42 ms window, 3 URLs):
  .489Z → NYSE/WHK
  .516Z → NYSE/AADX
  .531Z → NASDAQ/CBRS
NASDAQ/NYSE cron @ 2026-06-12T20:43:20.* (111 ms window, 10 URLs):
  .482Z → NASDAQ/MOBI
  .486Z → NASDAQ/ODTX
  .516Z → NYSE/PS
  .524Z → NASDAQ/ELMT
  .529Z → NASDAQ/NHP
  .540Z → NASDAQ/ALMR
  .544Z → NASDAQ/KLRA
  .564Z → NASDAQ/MMED
  .568Z → NYSE/AGBK
  .593Z → NASDAQ/PICS
NASDAQ/NYSE outlier @ 2026-06-12T20:44:38.309Z → NYSE/ANDG (own minute)
```

Four independent cron pulses (ASX cohort × 2, Korean cohort, NASDAQ/NYSE June-12
cohort × 2 sub-pulses) each emit `datePublished` at the same instant across
multiple URLs. ASX/VTX, ASX/AHX, and ASX/SHN share `datePublished` to the
**millisecond** (3 URLs). The June-12 20:43:20 cron fires **10 URLs inside 111 ms**.
The cron schedules are fine; what's wrong is that we *expose the cron's clock* as
the per-Article `datePublished` and as the OG `publishedTime` in
`generateMetadata` (`createdTime = data.createdAt?.toISOString()`). Across
thousands of URLs, this becomes a structural mass-publication footprint that
Google can cluster on.

## 3. Cross-URL patterns (root-cause candidates)

### A. Thin visible content on older pages

Across the 30 URLs, **the 16 pages that have been live ≥ 3 months** split into
two tiers:

| Tier | Visible words | Count | URLs |
|------|---------------|-------|------|
| Thin (2.3k–2.5k words) | 2,297–2,547 | 10 | NYSE/KNSL, NYSE/STAG, KOSDAQ/260660, NASDAQ/TVRD, NASDAQ/CAI, KOSDAQ/092040, KOSDAQ/261780, KOSPI/017180, KOSPI/326030, NYSEAMERICAN/LSF |
| Mid (4.8k–5.7k words) | 4,836–5,706 | 6 | ASX/CTM, ASX/VTX, ASX/AHX, ASX/ELD, ASX/SHN, NASDAQ/DORM |

Pages generated *more recently* (the June-12 cohort) are 6.8–9.3k words because
they include the Management Team section. None of the 16 older pages have it.

The thin-tier word count is suspiciously consistent: **10 URLs land in a 250-word
band (2,297–2,547)** — 10 of 16 older pages, 63%. That looks like a **structural
ceiling** — without Management Team, the page is just (Summary + Business & Moat
+ Financial Statement Analysis + Past Performance + Future Growth + Fair Value)
summary cards, and the LLM tends to produce roughly the same word budget for each.
Adding Management Team lifts pages straight into the 6.8–9.3k range.

The mid-tier (5 ASX URLs + NASDAQ/DORM) sits at 4.8k–5.7k. The ASX pages share
a slightly larger Summary + Business & Moat block (likely an earlier prompt
version); DORM is a one-off in Automotive.

**Implication**: legacy stock reports are at the thin-content boundary; the missing
Management Team section is one of the cuts that pushes them under. Backfilling the
section on every pre-June-12 report is the single highest-impact lever the sample
points to.

### B. HTML weight ≫ visible content (every page)

Every page ships ~1.22–1.34 MB of HTML for 2.3k–9.3k visible words. That works out
to **140–550 bytes of HTML per visible word**. Most of that is the inlined RSC
payload + chart.js / radar chart bootstrap, not analysis text. Google still
indexes large pages, but the ratio is a CWV / page-experience signal and a
duplicate-template signal (every URL on the site has the same shell).

### C. Identical OG / Twitter / Article-schema image on every URL

`https://koalagains.com/koalagain_logo.png` is the only image in `openGraph.images`,
`twitter.images`, and the Article-schema `image` array on all 30 URLs. From Google's
crawl, every stock URL on the site has the same image identifier. No image search
discovery, no per-URL uniqueness signal, and `Article` schema with no per-article
image is a weak structured-data signal.

### D. `datePublished` exposed at sub-second cron precision

Confirmed even more strongly across the 30-URL sample (see expanded cluster table
in §2):

- ASX/CTM and ASX/ELD share `datePublished` **to the millisecond**.
- ASX/VTX, ASX/AHX, **and ASX/SHN** share `datePublished` **to the millisecond**
  (3-way identical at 2026-02-20T14:31:35.349Z).
- **10** NASDAQ + NYSE June-12 URLs share `datePublished` inside a **111 ms
  window** at 2026-06-12T20:43:20.\*Z. This burst alone is a third of the sample.
- A second June-12 sub-pulse at 2026-06-12T20:35:11.\* covers 3 more URLs.
- 5 Korean URLs share `datePublished` inside an 8-minute window on 2025-12-01.

`generateMetadata` writes `publishedTime: createdTime ?? updatedTime`, where
`createdTime = data.createdAt?.toISOString()`. That value is the cron tick — not
the report's actual publication time. Once GSC sees the full ~95 URL set, the
mass-publication pattern is unambiguous. Fix: either round `datePublished` /
`publishedTime` to date-only, or derive it from the report's logical "first
published" timestamp instead of the row's `createdAt`.

### E. Industry / exchange skew in the failing 30

Exchange split (30-URL sample):

- **NASDAQ**: 12/30 (CBRS, ELMT, MMED, NHP, TVRD, MOBI, ODTX, ALMR, PICS, CAI, KLRA, DORM)
- **NYSE**: 7/30 (KNSL, STAG, AGBK, WHK, AADX, ANDG, PS)
- **ASX**: 5/30 (CTM, VTX, AHX, ELD, SHN)
- **KOSDAQ**: 3/30 (260660, 092040, 261780)
- **KOSPI**: 2/30 (017180, 326030)
- **NYSEAMERICAN**: 1/30 (LSF)

US listings dominate (20/30 = 67%); non-US is 10/30 (33%), of which 5 ASX + 5 Korean.

Industry distribution:

- **Healthcare: Biopharma & Life Sciences**: 10/30 (TVRD, 260660, AHX, CAI, 092040,
  261780, 017180, ODTX, KLRA, 326030) — **still the single largest cluster, by a
  wide margin (33%).**
- **Healthcare: Technology & Equipment** (with trailing space): 3/30 (MMED, MOBI,
  ALMR) — same trailing-whitespace industry record on all three rows.
- **Capital Markets & Financial Services**: 2/30 (ANDG, PS)
- **Real Estate**: 2/30 (STAG, NHP)
- **Metals, Minerals & Mining**: 3/30 (CTM, VTX, SHN)
- **Aerospace and Defense**: 2/30 (ELMT, AADX)
- 1 each: Insurance & Risk Management, Technology Hardware & Semiconductors
  (trailing space), Agribusiness & Farming, Software Infrastructure & Applications,
  Banks, Oil & Gas Industry, Automotive, Food, Beverage & Restaurants.

**Healthcare verticals account for 13/30 (43%) of the failing sample.** Even after
broadening the sample, Healthcare Biopharma is still the dominant single cluster.

Country / cohort breakdowns:

- **Every Korean URL in the sample (5/5) is Healthcare Biopharma microcap.** That's
  the sharpest single-country cluster in the whole 30-URL sample.
- **5 of 5 ASX URLs are microcap**; 3 are Mining, 1 Biopharma, 1 Agribusiness.
  Common factor is microcap, not industry.
- **NYSEAMERICAN: 1 URL** — only one US sub-board observation, but it's a thinly-
  traded board where ticker pages typically have weaker external link signal than
  NYSE/NASDAQ proper. Worth verifying whether the failing set is over-indexed on
  NYSEAMERICAN / OTCMKTS specifically.

**Action**: pull the full ~95-URL failed list and bucket by `(exchange, industryKey)`.
The 30-sample hypothesis is that Healthcare Biopharma + microcap + non-US together
cover the majority of the failing set. If the full bucket confirms it, the fix path
narrows considerably: prioritize Management Team backfill + image schema + internal
linking on the Healthcare Biopharma + non-US slices first.

### F. Data-quality bug: trailing whitespace in industry names

Two industry records leak a trailing space into the rendered breadcrumb and the
BreadcrumbList JSON-LD `name` field:

- `"Technology Hardware & Semiconductors "` — 1 URL (CBRS).
- `"Healthcare: Technology & Equipment "` — 3 URLs (MMED, MOBI, ALMR).

So 4 of 30 sample URLs (13%) carry visibly broken industry names — the share
diluted as the sample grew, but the *same two industry records* keep appearing,
which is the meaningful signal. The trailing space also flows into the
`/stocks/industries/{industryKey}` link target if `industryKey` was derived from
`name`. A trailing space won't cause a 404, but it's the kind of low-quality data
signal that correlates with indexing demotion. Easy fix; the root data is in
either the industry seed or the `TickerV1.industry.name` column.

### G. Non-US tickers are under-linked from the rest of the site

10 of 30 (`ASX/CTM`, `ASX/VTX`, `ASX/AHX`, `ASX/ELD`, `ASX/SHN`, `KOSDAQ/260660`,
`KOSDAQ/092040`, `KOSDAQ/261780`, `KOSPI/017180`, `KOSPI/326030`) are non-US — 33%
of the sample. The breadcrumb links go to `/stocks/countries/Australia` and
`/stocks/countries/Korea`. We do not yet have data on how many *internal* links
flow into those country pages from the homepage / nav / featured rails. Hypothesis:
non-US tickers receive a tiny fraction of the link equity that US tickers do,
which is a direct indexing-priority signal. The 5 ASX tickers in the sample fall
into 3 different industries (Mining × 3, Biopharma × 1, Agribusiness × 1) so the
ASX cluster isn't industry-specific — country under-linking is the likely common
factor. The 5 Korean tickers are 100% Healthcare Biopharma, which is
**both** an under-linking signal *and* an industry cluster — they share both
problems.

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
30 URLs.

1. **Pull the full failed-revalidation list** (~682 URLs from GSC). Bucket by
   `(category, exchange, industryKey, ageInDays, visibleWords, hasMgmtTeam)`. Decide
   the actual dominant cluster — the 30-URL sample points strongly at small-cap
   Healthcare Biopharma (33%) + non-US (33%) + the older "Management-Team-missing"
   tier (10 of 16 older URLs at 2.3k–2.5k words), but a 30-URL sample is still ~30%
   of the failing main-stock URLs and well short of statistical significance.
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

*Last updated: 2026-06-16. Sample of 30 URLs (three 10-URL batches from the user)
out of the ~95 main-stock URLs that failed the most recent GSC revalidation run.*
