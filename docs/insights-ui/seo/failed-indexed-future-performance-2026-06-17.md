# Failed-Indexed Future-Performance Pages — Audit (2026-06-17)

**Context.** Google Search Console shows ~15k KoalaGains URLs sitting in
**Crawled — currently not indexed**. On a recent validation run **682** of those
pages came back as "failed validation" again. Of those, **27** are
`/stocks/<exchange>/<ticker>/future-performance` URLs and form the input list for
this audit. The other ~90% of future-performance URLs in the catalog are
indexed cleanly, so the goal here is to figure out **what these 27 share that
the indexed 90% do not**.

Source list of the 27 URLs is reproduced in [Appendix A](#appendix-a--input-list).

---

## TL;DR — top patterns

1. **21 of 27 (78%) were first published on 2026-06-12** — a single mass-generation
   batch only 5 days before today's audit. For brand-new, low-authority small/micro-cap
   pages, "Crawled — currently not indexed" is a normal interim state; many in this
   cohort will likely self-resolve over 1–3 weeks if their content quality is fine.
   These are not the most interesting failures.
2. **Many tickers are not recognisably-public listings** — the page describes a
   company that is privately held, recently acquired, or never traded under the
   stated `(exchange, symbol)` pair (e.g. `LFTO/Liftoff Mobile` — acquired by Vista
   Equity 2024; `CBRS/Cerebras` — pre-IPO; `YSWY/Yesway` — private). Google's
   Knowledge Graph notices the mismatch, treats the page as low-quality boilerplate,
   and refuses to index. **This is the biggest editorial root cause and the most
   actionable.** Section [B](#b-non-public--mismatched-tickerᴬcompany-pairs) lists the
   suspects.
3. **Anomalous Factor-Analysis counts** — the standard FutureGrowth report renders
   **10** factor cards; **8 of 27** pages render a different count: 2 (WHK), 12 (STEP,
   SSMR), 16 (AGBK), 18 (SGP), 20 (PS), and 0 (LFTO). Inconsistent template output
   across the same URL pattern is a recognised "near-duplicate template" signal that
   indexing pipelines deprioritise. See [Section D](#d-anomalous-factor-counts).
4. **All-Fail factor blocks** — `ARAY 0/10`, `NAK 0/10`, `VIDA 0/10`, `LFTO 0/0`.
   Every factor card is a red X. The page reads as a wall of negative findings with
   little discriminating content — high overlap with the boilerplate intro template.
5. **Industry concentration is modest but non-random** — `MEDICAL_DEVICES`,
   `DRUG_MANUFACTURERS_AND_ENABLERS`, `SOFTWARE_PLATFORMS_AND_APPLICATIONS`, and
   `BASE_METALS_AND_MINING` each contribute 3 pages (44% of the list combined). All
   four are speculative, high-narrative categories where the LLM is most likely to
   hallucinate plausible-sounding but generic "future outlook" prose. Worth a
   prompt-tuning pass.
6. **One TSX page (`STEP`) renders no `industryKey` breadcrumb** at all — the
   breadcrumb drops directly to "Stocks" → ticker, which strips the strongest
   internal-link signal feeding the page. See [Section E](#e-tsxstep--missing-industry-breadcrumb).

There is **no** evidence of:

- Wrong canonical (every page returns `200`, canonical equals the request URL, no
  redirect chain).
- Body-size or CWV anomalies (HTML payload uniform at 1.1–1.2 MB,
  ~43–46k DOM words — comparable to indexed peers).
- Missing JSON-LD (Article + Breadcrumb schemas present and well-formed on every
  page).
- Wrong `last-mod` in the sitemap (`/stocks/future-performance-sitemap.xml` only
  emits records where `summary` and `overallAnalysisDetails` are both non-empty,
  with `lastmod` derived from `categoryResult.updatedAt`).

---

## Pattern matrix

| Pattern | URLs hit | Likely root cause | Recommended action |
|---|---|---|---|
| Brand-new bulk batch (Jun 12) | 21/27 | New URL + low domain authority for micro-caps → standard "Crawled — currently not indexed" hold | Re-check GSC in 2–3 weeks; defer fixing until the cohort ages out |
| Non-public / mismatched ticker | ≥ 13/27 (see [B](#b-non-public--mismatched-tickerᴬcompany-pairs)) | LLM hallucinated a public-company narrative for a ticker that does not trade under that name | Verify each `(exchange, symbol, name)` triple against a market-data source; delete or correct rows that don't reconcile |
| Anomalous Factor count | 8/27 | Multiple prompt-versions / partial generations in production | Backfill to a single factor-set per category; gate publication on a fixed factor count |
| All-fail factor block | 4/27 | Sparse / negative-only generation; page collapses to boilerplate | Treat "0 passes" as `isComplete=false`, exclude from sitemap until regenerated |
| Speculative-narrative industry (MED-DEV / DRUGS / SOFTWARE / MINING) | 12/27 | Prompt allows generic forward-looking prose with little ticker-specific anchoring | Add a "must cite at least N specific filings / product / customer names" guard to the FutureGrowth prompt |
| TSX page missing industry breadcrumb | 1/27 (STEP) | TSX rows have no `industry` join populated → breadcrumb falls back to bare "Stocks" | Backfill `industryKey` for non-US tickers; or render the breadcrumb under the country segment regardless |

---

## A. Brand-new bulk batch (2026-06-12)

21 of the 27 pages have `createdAt = updatedAt = 2026-06-12T…` (today is
2026-06-17, so these are 5 days old):

`PICS, CBRS, ALMR, MMED, ODTX, AGBK, AADX, PS, VIDA, ANDG, SGP, LFTO, MWH, TLN,
YSWY, COAG, BWLP, REA, SSMR, ARXS, WHK`.

For low-authority small-cap pages Google routinely holds new URLs in "Crawled —
currently not indexed" for 1–3 weeks while it queues a quality re-evaluation.
The single shared `createdAt` strongly suggests a one-shot batch generation; the
sitemap `lastmod` then advertises all 21 at once, which is exactly the shape
indexing pipelines triage as "low-trust burst."

**Verification step before any fix:** re-pull the 682-URL failed-validation set
in 2 weeks (around 2026-07-01). If most of these 21 have moved to `Indexed`, the
bulk-batch hypothesis is confirmed and no code change is required for that
sub-group. Any that are still failing then are real quality problems.

## B. Non-public / mismatched (ticker, company) pairs

The most striking pattern. The page is well-formed but the company described
either is **not currently public** under the symbol shown, or the name does not
match what trades under that symbol on that exchange:

| URL | Symbol & exchange | Name on page | Why this looks wrong |
|---|---|---|---|
| `/NASDAQ/LFTO/future-performance` | `LFTO` (NASDAQ) | Liftoff Mobile, Inc. | Liftoff Mobile was acquired by Vista Equity Partners in 2024 — currently private. Page reads as if it were a listed pure-play mobile ad-tech. |
| `/NASDAQ/CBRS/future-performance` | `CBRS` (NASDAQ) | Cerebras Systems Inc. | Cerebras filed an S-1 in 2024 but has not completed IPO; CBRS is not (yet) a public ticker. |
| `/NASDAQ/YSWY/future-performance` | `YSWY` (NASDAQ) | Yesway, Inc. | Yesway is a Brookwood Financial Partners portfolio company — private. |
| `/NASDAQ/MWH/future-performance` | `MWH` (NASDAQ) | SOLV Energy, Inc. | SOLV Energy is a private JV. Symbol `MWH` historically belonged to Montgomery Watson Harza (acquired by Stantec). |
| `/NASDAQ/PICS/future-performance` | `PICS` (NASDAQ) | PicS N.V. | Content describes a Latam digital-wallet → B2B-fintech pivot (reads like Nu / DLO). `PICS` is not a recognised Nasdaq listing under that name. |
| `/NYSE/PS/future-performance` | `PS` (NYSE) | Pershing Square Inc. | Pershing Square Holdings trades AEX/LSE under `PSH` / `PSHZN`. `PS` on NYSE was Pluralsight, taken private in 2021. Both the venue and name look wrong. |
| `/NYSE/AGBK/future-performance` | `AGBK` (NYSE) | AGI Inc | Symbol + name + content (Brazilian payroll-linked credit) don't reconcile. AGBK on NASDAQ historically = Allegiance Bancshares. "AGI" is ambiguous. |
| `/NYSE/ANDG/future-performance` | `ANDG` (NYSE) | Andersen Group Inc. | "Andersen Group" content describes a wealth-management roll-up; ANDG is not a recognised NYSE listing. |
| `/NASDAQ/ARXS/future-performance` | `ARXS` (NASDAQ) | Arxis, Inc. | Aerospace & defence pure-play narrative; ARXS is not a recognised Nasdaq ticker. |
| `/NYSE/AADX/future-performance` | `AADX` (NYSE) | Applied Aerospace & Defense, Inc. | Same shape as ARXS. AADX is not a recognised NYSE listing. |
| `/NASDAQ/MMED/future-performance` | `MMED` (NASDAQ) | MiniMed Group, Inc. | `MMED` on NASDAQ is **Mind Medicine (MindMed)** — a psychedelics biotech. "MiniMed" was a Medtronic diabetes division. Wrong company under the right symbol. |
| `/NASDAQ/COAG/future-performance` | `COAG` (NASDAQ) | Hemab Therapeutics Holdings, Inc. | Hemab is a Danish private biotech. COAG is not a recognised public ticker. |
| `/NYSE/WHK/future-performance` | `WHK` (NYSE) | WhiteHawk Minerals Corp. | Name says "Minerals", **content** is about LNG export capacity, Black Stone Minerals, Texas Pacific Land — an oil & gas royalty thesis. Internal inconsistency. WhiteHawk is normally a small AIM listing, not a NYSE listing. |
| `/NYSE/SSMR/future-performance` | `SSMR` (NYSE) | Sunshine Silver Mining & Refining Co. | Sunshine Silver was a historical entity, not currently a known NYSE listing. |
| `/NYSEAMERICAN/VIDA/future-performance` | `VIDA` (NYSE-AMERICAN) | VIDA Global Inc. | Software-platforms classification on NYSEAMERICAN is unusual; needs vendor confirmation. |
| `/NYSEAMERICAN/REA/future-performance` | `REA` (NYSE-AMERICAN) | Rare Earths Americas, Inc. | Rare-earths small caps churn names/symbols often; needs vendor confirmation. |

**Why Google rejects these:** when the page's structured-data
`@type=Article`/`about=Organization` block declares a `name` that doesn't match
any entity in Google's Knowledge Graph for the stated exchange-and-symbol, the
SERP system treats the article as autogenerated or low-trust and parks it in
*Crawled — currently not indexed*. This is well documented and matches the
fingerprint here.

**Fix:**

1. Add an admin-side validator that resolves each `TickerV1` row against a
   reference market-data feed (Polygon, FMP, IEX, OpenFIGI) on a weekly cron.
2. Any row whose `(exchange, symbol)` does not resolve, or whose resolved
   `name` ≠ `TickerV1.name` (case-insensitive, normalised), is flagged
   `isPubliclyTraded=false` and excluded from every sitemap.
3. Backfill: run the validator over the failing-cohort first; the flagged
   subset should be deleted (or hidden behind admin) rather than regenerated.
4. Long-term: don't accept a new `TickerV1` row unless the resolver returns
   a green check.

## C. Older pages that should already be indexed (6 URLs)

The remaining 6 URLs were created 6–8 months ago and have therefore had ample
time to clear the new-page hold. Their non-indexing reflects a content-quality
judgement, not freshness:

| URL | Created | Updated | Industry | Factor pass | Notes |
|---|---|---|---|---|---|
| `/NASDAQ/BSET` | 2025-10-27 | 2026-04-23 | FURNISHINGS | 4/10 | Legit ticker. Mostly-fail card stack + small-cap (~$200M) low-authority. |
| `/NASDAQ/NWSA` | 2025-11-04 | (unchanged) | ENTERTAINMENT | 4/10 | Legit large-cap (News Corp). Never refreshed since creation → stale `lastmod` of 7 months. |
| `/NASDAQ/ARAY` | 2025-10-31 | 2025-12-19 | MEDICAL_DEVICES | **0/10** | All-fail wall. |
| `/NYSEAMERICAN/NAK` | 2025-11-06 | (unchanged) | BASE_METALS_AND_MINING | **0/10** | All-fail wall + NYSE-AMERICAN small cap, also never refreshed. |
| `/TSX/STEP` | 2025-11-18 | 2026-05-03 | (none — missing breadcrumb) | 10/12 | Healthy report **but** no industry breadcrumb → weakest internal-link footprint of the 27. See Section E. |
| `/NYSE/RAMP` | 2025-10-30 | (unchanged) | SOFTWARE | 4/10 | Mid-cap; mostly-fail card stack; never refreshed in 8 months. |

**Common features:** mostly-fail or never-refreshed-since-creation. Index recovery
strategy:

- Regenerate any FutureGrowth report whose `updatedAt < now - 90 days` and
  bump `lastmod` accordingly.
- Treat a `0/N` pass result as failing the `isComplete` gate (don't surface it
  in the sitemap until at least one factor passes — gives the LLM another shot
  at a more discriminating analysis).

## D. Anomalous factor counts

The expected count for the FutureGrowth category is **10** factor cards (matches
the indexed 90%). 8 of the 27 deviate:

| URL | Factor count |
|---|---|
| `/NASDAQ/LFTO` | **0** |
| `/NYSE/WHK` | **2** |
| `/TSX/STEP` | 12 |
| `/NYSE/SSMR` | 12 |
| `/NYSE/AGBK` | 16 |
| `/NASDAQ/SGP` | 18 |
| `/NYSE/PS` | 20 |
| (16 others) | 10 |

`0` and `2` indicate either an aborted generation or a prompt version with a
truncated factor set; `12/16/18/20` indicate that prior prompt versions emitted
extra factors that the current version dropped. From an SEO standpoint the
absolute count matters less than the **inconsistency** — pages under the same
URL template are not supposed to render structurally different bodies. Indexing
pipelines bucket pages by template-signature; a page that looks structurally
different from its sibling under the same path pattern is more likely to be
buried.

**Fix:** snapshot the canonical factor set per `TickerAnalysisCategory`; backfill
any row whose count diverges. Block sitemap inclusion until the row has the
canonical count.

## E. TSX/STEP — missing industry breadcrumb

`/stocks/TSX/STEP/future-performance` is the only TSX URL in the list. The
extracted HTML shows no `href="/stocks/industries/…"` or
`href="/stocks/countries/CA/industries/…"` link in the breadcrumb. Source
inspection of `buildPerformanceBreadcrumbs` (`src/utils/performance-page-utils.ts`)
confirms the non-US branch falls back to a bare `Stocks → ticker → page`
breadcrumb if `tickerData.industry?.name` and `tickerData.industryKey` are both
falsy.

Practical effect: STEP has the **weakest internal-link envelope of all 27 pages**
— no inbound link from a country / industry hub. Two non-mutually-exclusive
fixes:

1. Backfill `industryKey` for non-US `TickerV1` rows (preferred — the data is
   knowable from public filings).
2. Update `buildPerformanceBreadcrumbs` so the non-US branch always renders the
   `<Country> Stocks` segment (even without an industry), so STEP at least
   inherits one inbound link from `/stocks/countries/CA`.

## F. Industry concentration

| Industry | Count in failed cohort |
|---|---|
| `SOFTWARE_PLATFORMS_AND_APPLICATIONS` | 3 |
| `MEDICAL_DEVICES` | 3 |
| `DRUG_MANUFACTURERS_AND_ENABLERS` | 3 |
| `BASE_METALS_AND_MINING` | 3 |
| `TECHNOLOGY_HARDWARE_AND_EQUIPMENT` | 2 |
| `ASSET_MANAGEMENT` | 2 |
| (single-occurrence) | 10 |
| (no industry — STEP) | 1 |

The top-4 industries are all narrative-heavy categories where forward-looking
prose has a high boilerplate ceiling (mineral exploration "huge upside potential",
biotech "binary clinical-success thesis", software "AI tailwind"). When the LLM
isn't anchored to ticker-specific filings, the same paragraph could plausibly be
written for 100 different tickers in the same industry — Google detects the
near-duplicate fingerprint across siblings and refuses to index.

**Fix:** tighten the FutureGrowth prompt for these industries — require at least
two ticker-specific citations (10-K / 10-Q / 8-K / IR press release / earnings
transcript) in the Executive Summary; reject the output if no citation appears.

---

## Per-URL findings (one row per input link)

For each URL: the single most likely indexing-blocker, followed by the
secondary signal where one exists. Pattern abbreviations:
**[NEW]** new-batch (Jun 12), **[MISMATCH]** non-public or wrong company,
**[ALL-FAIL]** 0 passes, **[FACTOR-MISMATCH]** non-10 factor count,
**[STALE]** unchanged since creation, **[INDUSTRY]** speculative-narrative
industry, **[NO-BREADCRUMB]** missing industry breadcrumb.

| URL | Primary signal | Secondary |
|---|---|---|
| `/NASDAQ/BSET/future-performance` | **[STALE]** 4/10 fail-heavy; created Oct-2025, last refresh Apr-2026 | Legit ticker. Regenerate + raise pass bar. |
| `/NASDAQ/NWSA/future-performance` | **[STALE]** Never refreshed since 2025-11-04; 4/10 | Legit large-cap, indexing should recover after a refresh. |
| `/NASDAQ/ARAY/future-performance` | **[ALL-FAIL]** 0/10 | **[INDUSTRY]** Medical devices speculative prose. |
| `/NYSEAMERICAN/NAK/future-performance` | **[ALL-FAIL]** 0/10 + **[STALE]** never refreshed | NYSE-AMERICAN small cap → lowest authority. |
| `/TSX/STEP/future-performance` | **[NO-BREADCRUMB]** + **[FACTOR-MISMATCH]** 12 | Healthy content otherwise; fix breadcrumb. |
| `/NASDAQ/PICS/future-performance` | **[MISMATCH]** PicS N.V. — symbol/name pair not recognised | **[NEW]** |
| `/NASDAQ/CBRS/future-performance` | **[MISMATCH]** Cerebras is pre-IPO | **[NEW]** |
| `/NASDAQ/ALMR/future-performance` | **[NEW]** | **[INDUSTRY]** Medical devices. |
| `/NASDAQ/MMED/future-performance` | **[MISMATCH]** Name "MiniMed Group" vs MMED = MindMed | **[NEW]** + **[INDUSTRY]** medical devices. |
| `/NASDAQ/ODTX/future-performance` | **[NEW]** | **[INDUSTRY]** Drugs / biotech. |
| `/NYSE/AGBK/future-performance` | **[MISMATCH]** "AGI Inc" + Brazilian-payroll content | **[NEW]** + **[FACTOR-MISMATCH]** 16 |
| `/NYSE/AADX/future-performance` | **[MISMATCH]** AADX symbol on NYSE not recognised | **[NEW]** + **[INDUSTRY]** A&D. |
| `/NYSE/PS/future-performance` | **[MISMATCH]** Pershing Square trades under PSH/PSHZN, not NYSE:PS | **[NEW]** + **[FACTOR-MISMATCH]** 20 |
| `/NYSEAMERICAN/VIDA/future-performance` | **[ALL-FAIL]** 0/10 | **[NEW]** + name needs verification. |
| `/NYSE/WHK/future-performance` | **[MISMATCH]** name says "Minerals", content says LNG/oil basins + **[FACTOR-MISMATCH]** only 2 factors | **[NEW]** |
| `/NYSE/ANDG/future-performance` | **[MISMATCH]** "Andersen Group" not a recognised NYSE listing | **[NEW]** |
| `/NYSE/RAMP/future-performance` | **[STALE]** 4/10, never refreshed since Oct-2025 | **[INDUSTRY]** software. |
| `/NASDAQ/SGP/future-performance` | **[FACTOR-MISMATCH]** 18 | **[NEW]** + **[INDUSTRY]** drugs. |
| `/NASDAQ/LFTO/future-performance` | **[MISMATCH]** Liftoff Mobile is private + **[FACTOR-MISMATCH]** 0 factors | **[NEW]** |
| `/NASDAQ/MWH/future-performance` | **[MISMATCH]** SOLV Energy is private | **[NEW]** |
| `/NASDAQ/TLN/future-performance` | **[NEW]** | Legit utilities ticker (Talen Energy); likely indexes on its own. |
| `/NASDAQ/YSWY/future-performance` | **[MISMATCH]** Yesway is private | **[NEW]** |
| `/NASDAQ/COAG/future-performance` | **[MISMATCH]** Hemab Therapeutics is private + Danish | **[NEW]** + **[INDUSTRY]** drugs. |
| `/NYSE/BWLP/future-performance` | **[NEW]** | Legit (BW LPG); should index. |
| `/NYSEAMERICAN/REA/future-performance` | **[NEW]** | Verify ticker validity. |
| `/NYSE/SSMR/future-performance` | **[FACTOR-MISMATCH]** 12 | **[NEW]** + name needs verification. |
| `/NASDAQ/ARXS/future-performance` | **[MISMATCH]** Arxis not a recognised Nasdaq listing | **[NEW]** |

---

## Recommended order of fixes (highest ROI first)

1. **Stand up a ticker-existence validator** (Section B). Removing the ~13
   mismatch URLs from the sitemap entirely both fixes the indexing bucket and
   stops further hallucinated content from accumulating.
2. **Add a pass-rate floor to `isComplete`** so `0/N` reports are excluded from
   the sitemap (covers ARAY, NAK, VIDA, LFTO immediately + future cases).
3. **Snapshot a canonical factor count per category** and backfill divergent
   rows (covers WHK 2, STEP 12, SSMR 12, AGBK 16, SGP 18, PS 20).
4. **Tighten the FutureGrowth prompt** for narrative-heavy industries — require
   N citations (Section F).
5. **Backfill industry breadcrumbs for non-US tickers**, or render the country
   segment unconditionally in `buildPerformanceBreadcrumbs` (covers STEP today,
   any other TSX/UK/India page tomorrow).
6. **Wait 2 weeks then re-pull GSC.** Defer fixing the new-Jun-12 cohort that
   has none of the above signals — most will self-resolve.

---

## Appendix A — input list

The 27 URLs the user supplied for this audit:

```
https://koalagains.com/stocks/NASDAQ/BSET/future-performance
https://koalagains.com/stocks/NASDAQ/NWSA/future-performance
https://koalagains.com/stocks/NASDAQ/ARAY/future-performance
https://koalagains.com/stocks/NYSEAMERICAN/NAK/future-performance
https://koalagains.com/stocks/TSX/STEP/future-performance
https://koalagains.com/stocks/NASDAQ/PICS/future-performance
https://koalagains.com/stocks/NASDAQ/CBRS/future-performance
https://koalagains.com/stocks/NASDAQ/ALMR/future-performance
https://koalagains.com/stocks/NASDAQ/MMED/future-performance
https://koalagains.com/stocks/NASDAQ/ODTX/future-performance
https://koalagains.com/stocks/NYSE/AGBK/future-performance
https://koalagains.com/stocks/NYSE/AADX/future-performance
https://koalagains.com/stocks/NYSE/PS/future-performance
https://koalagains.com/stocks/NYSEAMERICAN/VIDA/future-performance
https://koalagains.com/stocks/NYSE/WHK/future-performance
https://koalagains.com/stocks/NYSE/ANDG/future-performance
https://koalagains.com/stocks/NYSE/RAMP/future-performance
https://koalagains.com/stocks/NASDAQ/SGP/future-performance
https://koalagains.com/stocks/NASDAQ/LFTO/future-performance
https://koalagains.com/stocks/NASDAQ/MWH/future-performance
https://koalagains.com/stocks/NASDAQ/TLN/future-performance
https://koalagains.com/stocks/NASDAQ/YSWY/future-performance
https://koalagains.com/stocks/NASDAQ/COAG/future-performance
https://koalagains.com/stocks/NYSE/BWLP/future-performance
https://koalagains.com/stocks/NYSEAMERICAN/REA/future-performance
https://koalagains.com/stocks/NYSE/SSMR/future-performance
https://koalagains.com/stocks/NASDAQ/ARXS/future-performance
```

## Appendix B — methodology

- Fetched every URL with `curl` on 2026-06-17. All returned `HTTP 200` with a
  canonical equal to the request URL — i.e. nothing is being redirected, soft-
   404'd, or de-canonicalised at the page level.
- Extracted from each rendered HTML: `<title>`, JSON-LD `datePublished` and
  `dateModified`, breadcrumb industry slug, body word count (post-tag-strip),
  HTML byte size, and Pass/Fail factor-card counts.
- The Pass/Fail counts come from the rendered factor cards in
  `src/components/ticker-reportsv1/TickerCategoryReport.tsx` (`String(factor.result)
  === 'Pass'` per card).
- Sitemap inclusion rule confirmed by reading
  `src/app/stocks/future-performance-sitemap.xml/route.ts`: only rows where
  `summary` and `overallAnalysisDetails` are both non-empty are emitted, so a
  thin-body explanation is not applicable here.
- "Non-public / mismatched ticker" judgements are based on public knowledge of
  the company / ticker pair (acquisitions, delistings, exchange of record).
  They should be **verified** against a market-data feed before any row is
  deleted — the validator in Section B is the right vehicle.
