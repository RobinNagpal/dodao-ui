# Stocks — "Crawled — currently not indexed" pattern analysis

Google Search Console reports ~15k pages on koalagains.com sitting in **Crawled — currently
not indexed**. A revalidation run was kicked off in GSC and ~682 URLs failed the
revalidation (i.e. Google crawled them again and still chose not to index). Roughly
95–100 of those failures are the **main stock report pages** under `/stocks/{exchange}/{ticker}`.

This doc records:

1. What we already know about the page shape (`app/stocks/[exchange]/[ticker]/page.tsx`)
   and the sitemap (`app/stocks/sitemap.xml/route.ts`).
2. A per-URL teardown of 48 sample URLs flagged in the failed-revalidation set.
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

## 2. Per-URL teardown (48 URLs in the failed-revalidation set)

Numbers below come from a server-rendered curl of each URL. "Visible
words" is the page text after stripping `<script>`/`<style>`/tags. Rows 1–10 are the
first batch the user sent; 11–20 a follow-up; 21–30 a third batch; 31–39 a fourth
batch (the user asked for 10 in the fourth batch but listed only 9 URLs); 40–48 a
fifth batch (9 URLs). All 48 URLs sit in the same failed-revalidation bucket.

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
|31 | NASDAQ/MDAI          | `Healthcare: Technology & Equipment ` (trailing space)    | 2025-10-31T07:26:57.768Z | 2025-12-19T19:37:17.786Z | 178 days        | 3,324         | 1,272 KB  | no                |
|32 | NYSE/BURL            | Apparel, Footwear & Lifestyle Brands     | 2025-10-27T14:25:36.593Z | 2026-04-23T11:44:28.412Z |  53 days        | 7,912         | 1,346 KB  | no                |
|33 | NYSE/GMRS            | Healthcare: Providers & Services         | 2026-06-12T20:43:20.477Z | 2026-06-12T21:41:26.142Z |   3 days        | 9,394         | 1,308 KB  | yes               |
|34 | NASDAQ/SKYW          | Travel, Leisure & Hospitality            | 2026-06-12T18:41:45.440Z | 2026-06-12T21:11:17.365Z |   3 days        | 7,137         | 1,327 KB  | yes               |
|35 | NASDAQ/MDLN          | `Healthcare: Technology & Equipment ` (trailing space)    | 2026-06-12T20:43:20.612Z | 2026-06-12T21:26:43.380Z |   3 days        | 8,056         | 1,307 KB  | yes               |
|36 | NASDAQ/LFTO          | Advertising & Marketing                  | 2026-06-12T20:35:11.501Z | 2026-06-12T23:07:47.034Z |   3 days        | 7,781         | 1,285 KB  | yes               |
|37 | NASDAQ/SGP           | Healthcare: Biopharma & Life Sciences    | 2026-06-12T20:43:20.583Z | 2026-06-12T21:37:10.613Z |   3 days        | 8,293         | 1,305 KB  | yes               |
|38 | NYSE/NVR             | Building Systems, Materials & Infrastructure | 2025-10-28T19:03:20.787Z | 2026-02-04T14:28:04.887Z | 131 days        | 3,441         | 1,271 KB  | no                |
|39 | ASX/BMN              | Metals, Minerals & Mining                | 2026-02-20T12:46:01.484Z | 2026-02-21T03:03:21.654Z | 114 days        | 4,136         | 1,284 KB  | no                |
|40 | KOSDAQ/420570        | Chemicals & Agricultural Inputs          | 2025-12-04T12:06:06.890Z | 2026-02-19T16:04:02.766Z | 118 days        | 5,069         | 1,260 KB  | no                |
|41 | KOSPI/033270         | Healthcare: Biopharma & Life Sciences    | 2025-12-01T14:42:50.102Z | 2026-03-19T17:46:05.982Z |  90 days        | 2,456         | 1,245 KB  | no                |
|42 | KOSDAQ/001000        | Apparel, Footwear & Lifestyle Brands     | 2025-12-04T11:58:57.676Z | 2026-02-19T19:29:46.389Z | 118 days        | 4,830         | 1,271 KB  | no                |
|43 | ASX/UM1              | Metals, Minerals & Mining                | 2026-02-20T14:31:35.349Z | 2026-02-20T15:15:06.978Z | 117 days        | 5,544         | 1,258 KB  | no                |
|44 | ASX/SGH              | Industrial Services & Distribution       | 2026-02-20T12:46:01.484Z | 2026-02-20T22:34:07.594Z | 117 days        | 5,577         | 1,301 KB  | no                |
|45 | ASX/SMNOA            | Aerospace and Defense                    | 2026-02-20T14:31:35.349Z | 2026-02-20T15:48:45.159Z | 117 days        | 5,376         | 1,234 KB  | no                |
|46 | BSE/539872           | Healthcare: Biopharma & Life Sciences    | 2025-11-20T13:33:39.341Z | 2025-11-20T18:08:56.782Z | 209 days        | 2,587         | 1,190 KB  | no                |
|47 | NASDAQ/CGEN          | Healthcare: Biopharma & Life Sciences    | 2025-11-03T14:44:46.383Z | 2026-05-02T00:16:41.474Z |  46 days        | 7,674         | 1,348 KB  | **yes**           |
|48 | ASX/PTR              | Metals, Minerals & Mining                | 2026-02-20T14:31:35.349Z | 2026-02-20T16:39:21.207Z | 117 days        | 5,108         | 1,296 KB  | no                |

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
31. **NASDAQ/MDAI** — Spectral AI, ~6 months old, **3,324 words**. Carries the
    trailing-whitespace `Healthcare: Technology & Equipment ` industry. Sits
    *above* the 2.3k–2.5k thin band but well below the 4.8k–5.7k mid tier —
    a "lower-mid" data point that breaks the earlier two-tier story. So the
    older cohort isn't a clean bimodal split (see §3.A refresh).
32. **NYSE/BURL** — Burlington Stores, only **53 days old**, **7,912 words**, and
    **no Management Team section**. This is the most important anomaly in the
    whole sample: it proves a pre-Management-Team-template page can produce ~8k
    words of analysis. So the §3.A "structural ceiling" hypothesis was wrong as
    stated — the LLM clearly *can* go long without that section. What's special
    about BURL? Mid-cap retailer with rich coverage (Yahoo, MarketWatch, Seeking
    Alpha all have ample data), so the prompt presumably had a lot to work with.
    That means content depth correlates with *data richness*, not just template
    version. Reinforces the "thin content on Korean / ASX microcaps" pattern as
    a data-availability issue, not a prompt-template issue.
33. **NYSE/GMRS** — June-12 cohort, new Healthcare sub-vertical (**Healthcare:
    Providers & Services**). At **9,394 words**, GMRS is still the longest report
    in the 48-URL sample, edging out PICS and NASDAQ/CGEN. Lands inside the main 20:43:20.\*
    burst (at the very early end, .477Z).
34. **NASDAQ/SKYW** — June-12 cohort but on a *different* cron tick: `2026-06-12T
    18:41:45.440Z`, ~2 hours before the main 20:35 and 20:43 pulses. Single Travel
    vertical. Suggests **at least four** sub-batches inside the June-12 day, not
    three.
35. **NASDAQ/MDLN** — June-12 cohort, Medline. Carries the trailing-whitespace
    industry too. Lands at the *very late end* of the 20:43:20 burst (.612Z) —
    pushes the burst window from 111 ms (.482–.593) out to 135 ms (.477–.612).
36. **NASDAQ/LFTO** — June-12 cohort, sits inside the *earlier* 20:35:11 pulse
    (.501Z). Combined with WHK (.489), AADX (.516), and CBRS (.531), that pulse
    now contains 4 URLs.
37. **NASDAQ/SGP** — SpyGlass Pharma, June-12 cohort. Adds another Healthcare
    Biopharma to the cluster (11 of 39 now in Biopharma).
38. **NYSE/NVR** — NVR Inc., ~4 months old, **3,441 words**, no Mgmt Team. Same
    "lower-mid" data point as MDAI: above thin band, below mid band. Notable as
    a *non-microcap* (NVR is a large-cap homebuilder) — so the failing set isn't
    purely a microcap problem. NVR likely fails for other reasons: extremely
    competitive query landscape (every mortgage / homebuilder portal covers it).
39. **ASX/BMN** — Bannerman Energy, ASX uranium developer. Shares `datePublished`
    (2026-02-20T12:46:01.484Z) **to the millisecond** with ASX/CTM and ASX/ELD —
    now a **three-way ms-identical cluster** in *that* ASX pulse too (the other
    pulse at 14:31:35.349Z also has three ms-identical URLs: VTX, AHX, SHN).
40. **KOSDAQ/420570** (J2KBIO) — **first non-Biopharma Korean URL** in the sample
    (Chemicals & Agricultural Inputs, K-beauty raw-materials supplier). 5,069 words,
    118 days old. Lands in the *mid* word band, not the thin band — breaks the
    earlier "every Korean URL is thin-content Biopharma" claim. Shares
    `datePublished` 2025-12-04T12:06:06.890Z with KOSDAQ/001000 (.676Z) — a **6th
    independent Korean cron pulse**, ~7 minutes after KOSDAQ/001000.
41. **KOSPI/033270** (Korea United Pharm) — sixth Korean Biopharma URL. 2,456
    words, 90 days old (right at the 3-month boundary). Lands inside the
    **2025-12-01T14:42:50.\*Z** Korean cron cluster (.102Z, within 87 ms of
    KOSDAQ/260660's .015Z and 146 ms of KOSPI/017180's .956Z). This pulse now
    contains **3 URLs ms-clustered to within 150 ms** — the cleanest non-ASX
    millisecond cluster. Note Korea United Pharm is **not** a microcap — it's
    a $700M-ish Korean large-cap — so the "every failing Korean ticker is
    microcap" thread is now weaker.
42. **KOSDAQ/001000** (Silla Textile) — **second non-Biopharma Korean URL**
    (Apparel, Footwear & Lifestyle Brands). 4,830 words, 118 days old, mid tier.
    Shares `datePublished` 2025-12-04T11:58:57.676Z bucket with KOSDAQ/420570
    (within ~7 minutes). Reinforces 420570's break of the "Korean = Biopharma"
    cluster — we now have **2/8 Korean URLs outside Biopharma** (8 if you include
    033270, 260660, 092040, 261780, 017180, 326030, 420570, 001000).
43. **ASX/UM1** (Unity Metals) — Australian mining microcap. Shares
    `datePublished` 2026-02-20T14:31:35.349Z **to the millisecond** with ASX/VTX,
    ASX/AHX, and ASX/SHN — extends that pulse to **a 4-way millisecond-identical
    cluster**.
44. **ASX/SGH** (SGH Limited) — Industrial Services & Distribution, $7B-ish ASX
    mid-cap (Seven Group Holdings). 5,577 words. Shares `datePublished`
    2026-02-20T12:46:01.484Z **to the millisecond** with ASX/CTM, ASX/ELD, and
    ASX/BMN — extends *that* ASX pulse to **a 4-way millisecond-identical
    cluster** as well. Important: SGH is *not* a microcap, so the ASX cohort isn't
    100% microcap; the common denominator is "ASX-listed", not "ASX microcap".
45. **ASX/SMNOA** (Structural Monitoring Systems) — Aerospace & Defense ASX
    microcap. Shares `datePublished` 2026-02-20T14:31:35.349Z **to the
    millisecond** with VTX, AHX, SHN, UM1 — extends that pulse to **5 URLs
    ms-identical**.
46. **BSE/539872** (Bajaj Healthcare) — **first BSE (India) URL in the sample**.
    2,587 words, 209 days old, no Mgmt Team — sits at the thin-tier ceiling.
    First evidence that the failing set extends beyond US/ASX/Korea into
    India-listed small/mid-caps. Watch for a BSE-specific cluster as more
    samples arrive. Sole BSE example so far → can't draw a Cluster yet, but
    extends the "non-US under-linked exchanges" hypothesis.
47. **NASDAQ/CGEN** (Compugen) — **the most important counter-example in the
    full sample.** 7,674 words, **has Mgmt Team**, but `datePublished` is
    2025-11-03 and `dateModified` is 2026-05-02 (only 46 days ago). So this is
    an *older* URL whose report was **regenerated with Management Team** on May
    2, and it's *still failing indexing* on June 17. That falsifies the strong
    version of the "backfill Management Team will fix older URLs" hypothesis:
    8k words plus Mgmt Team is not sufficient on its own. CGEN is a clinical-
    stage US biotech — small float, low retail interest, competing against
    biotech-specialist publications. The likely residual cause is either (a)
    not enough time since re-modify for Google to re-crawl + re-evaluate (May 2
    → Jun 17 = 46 days; Google's "demoted to not-indexed" decision typically
    takes longer to revisit), or (b) Healthcare Biopharma micro/small-cap simply
    has structural disadvantages in indexing that content depth alone doesn't
    overcome. Either way: backfilling Mgmt Team is necessary but not sufficient.
48. **ASX/PTR** (PTR Minerals) — ASX mining microcap (battery materials
    explorer). Shares `datePublished` 2026-02-20T14:31:35.349Z **to the
    millisecond** with VTX, AHX, SHN, UM1, SMNOA — extends that pulse to **6
    URLs ms-identical** (the largest ms-identical ASX cluster in the sample).

### Date-published batch cluster (expanded across all five batches)

```
ASX cron @ 2026-02-20T12:46:01.484Z (4-way identical to ms): ASX/CTM, ASX/ELD, ASX/BMN, ASX/SGH
ASX cron @ 2026-02-20T14:31:35.349Z (6-way identical to ms): ASX/VTX, ASX/AHX, ASX/SHN, ASX/UM1, ASX/SMNOA, ASX/PTR
Korean cron @ 2025-12-01T14:3*-14:4* (8-min window, 6 URLs):
  14:34:20.089Z → KOSDAQ/092040
  14:35:53.724Z → KOSDAQ/261780
  14:37:21.217Z → KOSPI/326030
  14:42:49.956Z → KOSPI/017180
  14:42:50.015Z → KOSDAQ/260660  ← within 59 ms of 017180
  14:42:50.102Z → KOSPI/033270   ← within 87 ms of 260660 (3-way ms-cluster in this minute)
Korean cron @ 2025-12-04T11:5*-12:0* (7-min window, 2 URLs):
  11:58:57.676Z → KOSDAQ/001000
  12:06:06.890Z → KOSDAQ/420570
NASDAQ/NYSE cron @ 2026-06-12T18:41:45.440Z → NASDAQ/SKYW (isolated, 2 h before main pulses)
NASDAQ/NYSE cron @ 2026-06-12T20:35:11.* (~42 ms window, 4 URLs):
  .489Z → NYSE/WHK
  .501Z → NASDAQ/LFTO
  .516Z → NYSE/AADX
  .531Z → NASDAQ/CBRS
NASDAQ/NYSE cron @ 2026-06-12T20:43:20.* (135 ms window, 13 URLs):
  .477Z → NYSE/GMRS
  .482Z → NASDAQ/MOBI
  .486Z → NASDAQ/ODTX
  .516Z → NYSE/PS
  .524Z → NASDAQ/ELMT
  .529Z → NASDAQ/NHP
  .540Z → NASDAQ/ALMR
  .544Z → NASDAQ/KLRA
  .564Z → NASDAQ/MMED
  .568Z → NYSE/AGBK
  .583Z → NASDAQ/SGP
  .593Z → NASDAQ/PICS
  .612Z → NASDAQ/MDLN
NASDAQ/NYSE outlier @ 2026-06-12T20:44:38.309Z → NYSE/ANDG (own minute)
Isolated: NASDAQ/CGEN @ 2025-11-03T14:44:46.383Z, BSE/539872 @ 2025-11-20T13:33:39.341Z (singletons in the sample)
```

Six independent cron pulses (ASX cohort × 2, Korean cohort × 2, NASDAQ/NYSE
June-12 cohort × 3 sub-pulses + 1 outlier) each emit `datePublished` at the same
instant across multiple URLs. ASX 12:46 now has **4 URLs ms-identical**; ASX 14:31
now has **6 URLs ms-identical** (largest cluster in the sample). The Korean
14:42:50 cluster also has **3 URLs within 150 ms**. The June-12 20:43:20 cron still
fires **13 URLs inside 135 ms** — 27% of the 48-URL sample comes from this one
cron tick.

**Caveat on impact:** this is a *plausible* signal of automated mass-publication,
not a confirmed Google ranking factor. The trivial fix (round `datePublished` to
date-only, matching what WordPress / Ghost / Medium do) is worth doing as a cheap
hygiene cleanup but should not be prioritized above the thin-content lever.

## 3. Cross-URL patterns (root-cause candidates)

### A. Thin visible content on older pages

Across the 48 URLs, **the 27 pages that have been live ≥ 3 months** *plus* two
anomalies (NYSE/BURL: 53 days, no Mgmt Team; NASDAQ/CGEN: re-modified 46 days
ago *with* Mgmt Team) spread across these tiers:

| Tier | Visible words | Count | URLs |
|------|---------------|-------|------|
| Thin (2.3k–2.6k words) | 2,297–2,587 | 12 | NYSE/KNSL, NYSE/STAG, KOSDAQ/260660, NASDAQ/TVRD, NASDAQ/CAI, KOSDAQ/092040, KOSDAQ/261780, KOSPI/017180, KOSPI/326030, NYSEAMERICAN/LSF, KOSPI/033270, BSE/539872 |
| Lower-mid (3.3k–3.5k) | 3,324–3,441 | 2 | NASDAQ/MDAI, NYSE/NVR |
| Mid (4.1k–5.7k words) | 4,136–5,706 | 13 | ASX/CTM, ASX/VTX, ASX/AHX, ASX/ELD, ASX/SHN, ASX/BMN, NASDAQ/DORM, KOSDAQ/420570, KOSDAQ/001000, ASX/UM1, ASX/SGH, ASX/SMNOA, ASX/PTR |
| **Anomaly: long, no Mgmt Team** | 7,912 | 1 | **NYSE/BURL** |
| **Anomaly: long, has Mgmt Team, recent re-modify, still failing** | 7,674 | 1 | **NASDAQ/CGEN** |

**The earlier "structural ceiling" hypothesis was too strong.** NYSE/BURL produces
**7,912 words with no Management Team section at all**, and **NASDAQ/CGEN
produces 7,674 words *with* Management Team but is *still failing indexing*** even
after a re-modify on 2026-05-02. So the LLM is not architecturally capped by the
missing section, *and* backfilling Management Team alone is not sufficient to fix
indexing on an older URL — at least not within ~46 days of the re-modify.

What still holds:

- 12 of 29 older / mid-vintage / anomaly URLs (41%) land in the 2,297–2,587 word
  band. Strong cluster — the most common outcome for pre-Management-Team pages,
  especially when the underlying company has thin coverage (Korean Biopharma
  microcaps, small US biopharms, India microcap, Korean large-cap pharma).
- Almost all thin-tier URLs are small/mid-cap names where competing finance
  portals (Yahoo, Seeking Alpha, Bloomberg, NSE/BSE India portals) already
  provide deeper coverage. KOSPI/033270 (Korea United Pharm) is the notable
  exception — it's a Korean *mid-cap*, not a microcap, yet still lands at 2,456
  words. That weakens the "thin = microcap" thread.

What changes in the takeaway:

- Backfilling the **Management Team** section on older reports is still useful
  (it pushes the *floor* up), but **NASDAQ/CGEN proves it's not sufficient on
  its own**. The bigger lever remains **per-page data richness**: more data →
  longer, more unique analysis → likely better indexing. But even data-richness
  plus Mgmt Team didn't flip CGEN's verdict within 46 days, so there's a
  *time-decay-of-the-original-not-indexed-verdict* factor we don't yet
  understand.
- Older pages where the underlying company is data-rich (mid- or large-cap, US-
  listed, well-covered) tend to produce more analysis. Older pages on microcap
  / non-US / data-poor names plateau at ~2.5k regardless. ASX SGH (mid-cap
  Industrial Services, 5,577 words at 117 days) and KOSDAQ/420570 (small-cap
  Korean Chemicals, 5,069 words at 118 days) confirm that *non-Biopharma
  non-US* tickers can break the 2.5k thin ceiling.

**Implication**: legacy stock reports cluster at the thin-content boundary
predominantly because their *inputs* are thin (Healthcare Biopharma + microcap).
Adding Management Team raises the floor; sourcing richer per-ticker data
(analyst transcripts, news feeds, SEC / KRX / BSE filings, IR materials) is what
would raise the ceiling. But CGEN proves there's a separate "time-to-recovery"
problem on top of the content problem — even a fully-rewritten older URL stays
demoted for at least 46+ days.

### B. HTML weight ≫ visible content (every page)

Every page ships ~1.22–1.38 MB of HTML for 2.3k–9.4k visible words. Empirical
breakdown of a representative page (`NASDAQ/ELMT.html`, 1,320 KB total):

| Region                          | Bytes      | % of total |
|---------------------------------|-----------:|-----------:|
| `<script>` tags (456 of them)   | 1,221,374  | **92.5%**  |
| `class="..."` attrs (Tailwind)  | 18,681     | 1.4%       |
| `<svg>` inline (16 small icons) | 8,519      | 0.6%       |
| `<style>` blocks                | 0          | 0.0%       |
| `data:image/...` base64         | 0          | 0.0%       |
| All HTML tags (skeleton)        | 54,651     | 4.1%       |
| Visible text (the analysis)     | 59,034     | 4.5%       |

92.5% of every page is `<script>` content — and that content is the **Next.js
React Server Components streaming payload** (`self.__next_f.push([1, "..."])`).
It contains the analysis markdown **shipped a second time** (in serialized form
for client-side hydration) plus the component-tree JSON. Charts are *not* inlined
— `chart.js` loads as a separate `<script src>` URL. Inline CSS is **0 bytes**.

**Honest assessment of SEO impact:** smaller than I implied earlier. Google's
documented HTML-content cap is ~15 MB; 1.3 MB is well inside the budget. The
CWV / hydration-cost angle is real but is a page-experience signal, not a primary
indexing signal. This belongs in the "nice-to-have hygiene" bucket, not in the
same tier as thin content. Realistic levers (lazy-loading heavy sections,
client-fetched below-fold blocks, returning to partial static rendering) all
trade off interactivity or perceived perf and probably aren't worth it just for
the size reduction.

### C. Identical OG / Twitter / Article-schema image on every URL

`https://koalagains.com/koalagain_logo.png` is the only image in `openGraph.images`,
`twitter.images`, and the Article-schema `image` array on all 48 URLs. From Google's
crawl, every stock URL on the site has the same image identifier. No image search
discovery, no per-URL uniqueness signal, and `Article` schema with no per-article
image is a weak structured-data signal.

### D. `datePublished` exposed at sub-second cron precision

Confirmed across the 48-URL sample (see expanded cluster table in §2):

- ASX/CTM, ASX/ELD, ASX/BMN, **and ASX/SGH** share `datePublished` **to the
  millisecond** (4-way identical at 2026-02-20T12:46:01.484Z).
- ASX/VTX, ASX/AHX, ASX/SHN, **ASX/UM1, ASX/SMNOA, and ASX/PTR** share
  `datePublished` **to the millisecond** (**6-way identical** at
  2026-02-20T14:31:35.349Z) — the largest ms-identical cluster in the sample.
- **13** NASDAQ + NYSE June-12 URLs share `datePublished` inside a **135 ms
  window** at 2026-06-12T20:43:20.\*Z. This single cron tick supplied **27% of
  the 48-URL sample**.
- A second June-12 sub-pulse at 2026-06-12T20:35:11.\* covers 4 more URLs;
  NASDAQ/SKYW is a third isolated June-12 timestamp at 18:41:45.440Z.
- 6 Korean URLs share `datePublished` inside an 8-minute window on 2025-12-01,
  with KOSDAQ/260660, KOSPI/017180, and **KOSPI/033270** clustered inside the
  same 150 ms window at 14:42:50.\*Z.
- A separate Korean cron 3 days later (2025-12-04T11:5\*Z / 12:0\*Z) covers
  KOSDAQ/001000 and KOSDAQ/420570 — the *first non-Biopharma* Korean URLs in
  the sample.

`generateMetadata` writes `publishedTime: createdTime ?? updatedTime`, where
`createdTime = data.createdAt?.toISOString()`. That value is the cron tick — not
the report's actual publication time.

**Honest assessment:** this is a *plausible* signal of automated mass-publication,
not a confirmed Google ranking factor. Google has never publicly documented
`datePublished` precision as an indexing signal, and large industrial publishers
batch-publish at near-identical timestamps without issue. The fix (round
`datePublished` to date-only — matching what WordPress, Ghost, Medium all do) is
cheap and worth doing as hygiene, but it should sit below the thin-content and
data-richness levers in priority.

### E. Industry / exchange skew in the failing 48

Exchange split (48-URL sample):

- **NASDAQ**: 18/48 (CBRS, ELMT, MMED, NHP, TVRD, MOBI, ODTX, ALMR, PICS, CAI, KLRA, DORM, MDAI, SKYW, MDLN, LFTO, SGP, CGEN)
- **NYSE**: 10/48 (KNSL, STAG, AGBK, WHK, AADX, ANDG, PS, BURL, GMRS, NVR)
- **ASX**: 10/48 (CTM, VTX, AHX, ELD, SHN, BMN, UM1, SGH, SMNOA, PTR)
- **KOSDAQ**: 5/48 (260660, 092040, 261780, 420570, 001000)
- **KOSPI**: 3/48 (017180, 326030, 033270)
- **NYSEAMERICAN**: 1/48 (LSF)
- **BSE**: 1/48 (539872) — *new exchange in the sample*

US listings (NASDAQ + NYSE + NYSEAMERICAN) drop to 29/48 = 60% (was 72% on the
39 sample). Non-US is 19/48 = 40% (10 ASX + 8 Korean + 1 BSE). The shift
reflects this batch being heavier on ASX (4 new) and Korean (3 new) tickers; the
full failed list bucket-by-exchange would settle the actual split.

Industry distribution (sorted by count):

- **Healthcare: Biopharma & Life Sciences**: 14/48 (TVRD, 260660, AHX, CAI,
  092040, 261780, 017180, ODTX, KLRA, 326030, SGP, KOSPI/033270, BSE/539872,
  NASDAQ/CGEN) — **still the single largest cluster (29%).**
- **Metals, Minerals & Mining**: 6/48 (CTM, VTX, SHN, BMN, UM1, PTR) — all ASX.
- **Healthcare: Technology & Equipment** (with trailing space): 5/48 (MMED,
  MOBI, ALMR, MDAI, MDLN) — unchanged.
- **Aerospace and Defense**: 3/48 (ELMT, AADX, SMNOA) — first ASX entry (SMNOA).
- **Capital Markets & Financial Services**: 2/48 (ANDG, PS).
- **Real Estate**: 2/48 (STAG, NHP).
- **Healthcare: Providers & Services**: 1/48 (GMRS).
- 1 each: Insurance & Risk Management, Technology Hardware & Semiconductors
  (trailing space), Agribusiness & Farming, Software Infrastructure &
  Applications, Banks, Oil & Gas Industry, Automotive, Food/Beverage/
  Restaurants, Advertising & Marketing, Travel/Leisure/Hospitality, Apparel/
  Footwear & Lifestyle Brands (×2 incl. KOSDAQ/001000), Building Systems,
  Chemicals & Agricultural Inputs (KOSDAQ/420570), Industrial Services &
  Distribution (ASX/SGH).

**Healthcare verticals account for 20/48 (42%) of the failing sample.** Still
dominant after five batches, though slightly down from 44% on the 39-sample.

Country / cohort breakdowns:

- **Korean URLs: 6/8 are Healthcare Biopharma** (was 5/5 at 39 URLs).
  KOSDAQ/420570 (Chemicals) and KOSDAQ/001000 (Apparel) break the earlier
  100% Biopharma claim, but Biopharma is still the dominant cluster.
- **KOSPI/033270** (Korea United Pharm, mid-cap pharma) is the first non-microcap
  Korean URL in the sample, sitting at the *thin* word floor. That weakens
  "thin = Korean microcap" — a Korean mid-cap also clusters there.
- **ASX URLs: 10/10 — common factor is "ASX listing", not "ASX microcap".** ASX/SGH
  (Seven Group, $7B mid-cap) is in the failing set despite being a mid-cap.
  Industries: Mining/Energy 6, Biopharma 1, Agribusiness 1, Industrial Services
  1, Aerospace/Defense 1. The cluster is country, not sector.
- **BSE: 1 URL (Bajaj Healthcare)** — first India exchange in the sample, thin
  tier, 209 days old. Too small a count alone, but extends the "non-US
  under-linked exchanges" hypothesis to India.
- **NYSEAMERICAN: 1 URL** — unchanged. Still under-sampled.
- **NASDAQ/CGEN, NYSE/BURL, and NYSE/NVR** confirm the failing set isn't a
  pure microcap / non-US problem — large/mid-cap US tickers in competitive
  query landscapes (retail, housing, biotech) also land here.

**Action**: pull the full ~95-URL failed list and bucket by `(exchange,
industryKey, marketCapBand)`. The 48-sample hypothesis is now: (a) ~half is
Healthcare Biopharma + microcap + non-US (data-poor + under-linked); (b) ~a
quarter is ASX/Korean/BSE tickers with adequate content but limited country-page
link equity; (c) ~a quarter is competitive-query US large/mid-caps. Three
slices, three different fix paths.

### F. Data-quality bug: trailing whitespace in industry names

Two industry records leak a trailing space into the rendered breadcrumb and the
BreadcrumbList JSON-LD `name` field:

- `"Technology Hardware & Semiconductors "` — 1 URL (CBRS).
- `"Healthcare: Technology & Equipment "` — 5 URLs (MMED, MOBI, ALMR, MDAI, MDLN).

So 6 of 48 sample URLs (13%) carry visibly broken industry names. The "Healthcare:
Technology & Equipment " record alone shows up on 5 different tickers, which makes
this a single broken industry record rather than scattered data errors. The
trailing space also flows into the `/stocks/industries/{industryKey}` link target
if `industryKey` was derived from `name`. A trailing space won't cause a 404, but
it's the kind of low-quality data signal that correlates with indexing demotion.
Easy fix; the root data is in either the industry seed or the
`TickerV1.industry.name` column. Batch 5 added no new trailing-space examples.

### G. Non-US tickers are under-linked from the rest of the site

19 of 48 (40%) are non-US:

- **ASX**: 10 (CTM, VTX, AHX, ELD, SHN, BMN, UM1, SGH, SMNOA, PTR) across 5
  industries (Mining/Energy 6, Biopharma 1, Agribusiness 1, Industrial Services
  1, Aerospace/Defense 1). The ASX cluster spans market caps from microcap
  explorers (PTR, UM1) up to a $7B mid-cap (SGH) — so the unifying factor is
  *country listing*, not market cap.
- **Korea (KOSDAQ + KOSPI)**: 8 (260660, 092040, 261780, 017180, 326030,
  033270, 420570, 001000). Biopharma is 6/8 (75%) — still the dominant cluster
  but no longer 100% (KOSDAQ/420570 Chemicals + KOSDAQ/001000 Apparel break it).
  Korean market caps span microcap (Silla Textile, J2KBIO) up to mid-cap
  (Korea United Pharm) — again, country, not cap.
- **BSE (India)**: 1 (Bajaj Healthcare).

The breadcrumb links go to `/stocks/countries/Australia`,
`/stocks/countries/Korea`, and `/stocks/countries/India`. We do not yet have
data on how many *internal* links flow into those country pages from the
homepage / nav / featured rails. Hypothesis: non-US country pages receive a
tiny fraction of the link equity that US tickers do, which is a direct
indexing-priority signal. The 48-URL sample now shows the failing set spans
**at least 4 non-US exchanges across 8+ industries** — the common factor must
be structural (country page link equity, language-mix signals, geo-targeting of
the apex domain), not per-industry. The Korean tickers had previously looked
like an industry+country compound problem, but with batch 5 the Korea cluster
is 75% Biopharma, not 100%, so the country-link-equity story is the more
robust read.

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
48 URLs.

1. **Pull the full failed-revalidation list** (~682 URLs from GSC). Bucket by
   `(category, exchange, industryKey, ageInDays, visibleWords, hasMgmtTeam,
   marketCapBand)`. Decide the actual dominant cluster — the 48-URL sample points
   at three distinct slices of the failing set: (a) small-cap Healthcare Biopharma
   + non-US microcaps with ~2.5k visible words (the data-poor cluster), (b)
   non-US tickers with adequate content but limited country-page link equity
   (ASX, Korean non-Biopharma, BSE), and (c) US large/mid-caps in *highly
   competitive* query landscapes (BURL, NVR, CGEN) that the page can produce
   ~8k words for but where competing finance portals dominate the SERP. Three
   slices, probably need three different fix paths.
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
   site-wide rather than per-URL. **Caveat: NASDAQ/CGEN proves this alone isn't
   sufficient** — CGEN has Mgmt Team, 7,674 words, was re-modified on 2026-05-02,
   and is *still* failing indexing on 2026-06-17. So backfilling matters, but
   expect a multi-month lag before Google revisits the demotion, and pair the
   backfill with at least one of the link-equity / per-ticker-image levers.
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

*Last updated: 2026-06-17. Sample of 48 URLs (three 10-URL batches + one 9-URL
fourth batch + one 9-URL fifth batch from the user) out of the ~95 main-stock
URLs that failed the most recent GSC revalidation run.*
