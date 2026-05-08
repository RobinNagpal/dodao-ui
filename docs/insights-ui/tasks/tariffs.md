# Tariff Reports — KoalaGains (Tasks)

## Refresh + simplify the tariff reports

Why this matters: the tariff reports drive a lot of organic traffic. They are one of
our highest-visibility pages, so they're the most expensive thing to leave stale.
Refresh content + ship a simpler, friendlier UX so first-time visitors can get the
answer they came for in seconds.

Existing surface (for reference, not to be redesigned blindly):
- Public reports: `app/tariff-reports/`
- Industry-scoped reports: `app/industry-tariff-report/[industryId]/`
  - `tariff-updates/`
  - `all-countries-tariff-updates/`
- Generation API: `app/api/industry-tariff-reports/[industry]/generate-tariff-updates`
  + `generate-all-countries-tariff-updates`
- Sitemap: `app/industry-tariff-report/sitemap.xml`

### Refresh the content

- [ ] **Audit the current report set**:
  - Pull every published tariff URL (from the sitemap + DB).
  - Tag each by **last-refreshed date**, **traffic** (top-N first), and **factual
    drift risk** (any tariff rate / policy / executive-order change since the
    report was generated).
  - Prioritize the refresh queue by `traffic × drift_risk`, not just calendar age.
- [ ] **Re-run generation against the latest tariff state**:
  - Confirm the generation pipeline pulls tariff rates / policy text from a
    current source (not a snapshot frozen at generation time).
  - Regenerate the top-traffic reports first; then sweep the long tail on the
    off-hours runner.
  - Capture a `lastRefreshedAt` field on each report so we can show "Updated
    YYYY-MM-DD" on the page and rank/filter by it.
- [ ] **Establish an ongoing refresh cadence**:
  - Schedule a recurring refresh (likely daily for top-traffic, weekly for the
    rest) on the Claude-Code off-hours runner — share infra with the stock + ETF
    refresh pipeline rather than building a separate cron.
  - Trigger an immediate refresh when a known upstream signal fires (e.g. a USTR
    press release, EO change, or scraping-lambdas detector flag).
- [ ] **Source-of-truth + citations**:
  - Every numeric claim in a refreshed report should cite a verifiable source
    (USTR / White House / official gazette / etc.) inline, with the date.
  - Stale or unsourced claims are removed during the refresh, not just left in.

### Simplify the UX

Goal: a reader who lands on a tariff page should know **what's tariffed, by how much,
since when, and what changed recently** within ~10 seconds, before they scroll. Today
the page is dense and long; we need a much higher signal-to-noise ratio at the top.

- [ ] **Top-of-page snapshot block** (above the fold, no scroll required):
  - One-line "what this report covers" headline (industry + countries).
  - Headline tariff numbers — current rate, rate as of N months ago, delta.
  - "Last updated YYYY-MM-DD" badge.
  - 3 key bullets: "What's new", "Who's affected", "What to watch".
- [ ] **Cut the body length**:
  - Identify boilerplate / repeated paragraphs across reports and remove or
    consolidate them into shared explainer pages linked once.
  - Replace dense tables with 1–2 focused charts where a chart conveys the same
    info faster.
  - Aim for a target word-count band per report (e.g. 800–1500 words) instead
    of unbounded length.
- [ ] **Improve in-page navigation**:
  - Sticky table of contents / section jump nav (the report types are
    long — readers should be able to jump to "Rates", "Recent changes", "By
    country", etc.).
  - Anchor links so each subsection has its own URL fragment for sharing.
- [ ] **Better cross-linking** — broken out into its own task below
  ("Link tariff pages (internal linking pass)") so the work has a single
  owner and a single PR. Covers tariff → tariff, tariff → stock, tariff →
  ETF, and the inbound stock/ETF → tariff direction in one pass.
- [ ] **Mobile pass**:
  - The biggest share of incoming traffic from search lands on mobile — verify
    headline numbers, charts, and the snapshot block all render cleanly on a
    phone before shipping.
- [ ] **Reader actions**:
  - Add a lightweight "subscribe for updates on this industry / country" CTA
    that ties into the click-count login gate (`stocks.md` Login improvements).
  - Optional "share" / "copy link" affordance for the most-shared sections.

### Operational + measurement

- [ ] **Track the impact**:
  - Capture before/after baselines for: organic sessions, average time on page,
    bounce rate, scroll depth, and indexed-URL count for the tariff sitemaps.
  - Monitor Search Console for tariff URLs after the refresh — watch for the
    same "Crawled — currently not indexed" pattern that hit the
    business-and-moat sitemap.
- [ ] **Sitemap hygiene**:
  - Make sure `industry-tariff-report/sitemap.xml` only lists URLs whose content
    has been refreshed and meets a minimum quality bar (mirror the `isComplete`
    pattern in `etfs.md` 1.6).
  - Add `lastmod` dates that actually reflect the refresh (not the build time).
- [ ] **Open questions**:
  - Should we keep the existing URLs and refresh in place (preserves SEO juice
    + avoids redirects), or slug-rename to a cleaner scheme? Default: refresh
    in place; only rename if the content materially changes shape.
  - Per-country vs per-industry primary view — readers seem to come in from
    both. Confirm with analytics which surface deserves the polished UX first.

## Link tariff pages (internal linking pass)

Why this matters: tariff pages are some of the highest-traffic, highest-intent
landing pages on KoalaGains, but each one is currently a dead-end for readers
and for crawlers. Search Console is reporting a "Crawled — currently not
indexed" pattern (see `stocks.md` SEO Fixes) on adjacent surfaces, which
internal linking is the cheapest, most direct lever to fix. A reader who lands
on `/industry-tariff-report/automobiles/tariff-updates` from organic search
should be one click away from the related industry, related country, related
stocks, and related ETF surfaces — and crawlers should see those links so the
neighbouring URLs get discovered and indexed.

Treat this as a **standalone, single-PR task** rather than a bullet under
"Simplify the UX". The cross-linking sub-bullet there is now superseded by
this section.

### In-scope surfaces

These are the pages that need link blocks added or improved. Keep the list
explicit so reviewers can tick each off:

- `app/tariff-reports/page.tsx` — listing page (`/tariff-reports`).
- `app/industry-tariff-report/[industryId]/page.tsx` — industry cover.
- `app/industry-tariff-report/[industryId]/tariff-updates/` — section page.
- `app/industry-tariff-report/[industryId]/understand-industry/` — section page.
- `app/industry-tariff-report/[industryId]/industry-areas/` — section page.
- `app/industry-tariff-report/[industryId]/final-conclusion/` — section page.
- `app/industry-tariff-report/chapters/[slug]/` (and its section sub-routes) —
  slug-based chapter pages (only those without `oldUrl`).
- The deprecated routes (`all-countries-tariff-updates`,
  `evaluate-industry-areas/*`) are out of scope — they keep their cover-page
  body and a canonical pointer, no new internal links needed (see
  `../tariffs/post-merge-url-checklist.md`).

### Outbound links to add (from a tariff page)

- [ ] **Related industries (spillover)** — use the `relatedIndustries` field
  already present on `TariffIndustryDefinition`. Render a "Related industry
  tariff reports" rail with 3–6 links to other
  `/industry-tariff-report/<id>` pages. Place it on the cover and on
  `final-conclusion` (the two surfaces a reader hits at the start and end of
  the report).
- [ ] **Related country tariff context** — for the most-referenced exporter /
  importer countries in each report, link out to the relevant
  `tariff-updates` section anchors on neighbouring industry reports
  (e.g. an automobiles report that talks about Mexico → link to the Mexico
  section on the steel report). Cap at the top 3–5 countries by mention
  weight to avoid link spam.
- [ ] **Stocks: impacted companies** — for every company already returned by
  the impact pipeline (`EstablishedPlayer` / `NewChallenger` with positive or
  negative impact), link to that company's KoalaGains stock report when one
  exists. Skip silently when no stock page is available — do **not** render a
  dead link or a placeholder.
- [ ] **ETFs with exposure** — link from the industry cover to the most
  relevant ETF reports (industry-themed and country-themed) using the same
  ETF index that powers the ETFs listing page. Mirror the pattern stocks.md
  uses for stock → ETF links so the two stay consistent.
- [ ] **Tariff-reports listing breadcrumb** — every section page should have a
  breadcrumb / back-link to `/tariff-reports` and to the industry cover.
  Today the user has to use the browser back button.

### Inbound links to add (to a tariff page)

- [ ] **Stock report → tariff report** — on every stock report whose primary
  industry matches a tariff report, surface a "Tariff exposure" link block
  that points to that industry's tariff cover and (where useful) the
  `tariff-updates` section anchor for the country most relevant to that
  stock.
- [ ] **ETF report → tariff report** — same pattern from ETF reports whose
  exposure overlaps an industry that has a tariff report. Use the existing
  industry mapping that powers the ETFs listing rather than introducing a
  new field.
- [ ] **Home / hub pages** — confirm the home page and any hub/landing
  surfaces link to `/tariff-reports` (and to a curated handful of
  high-traffic industry covers). One click from home to the most popular
  tariff reports.

### Implementation guardrails

- [ ] **Reuse before creating** — there is already a "Related" rail / link
  block pattern on stocks and ETFs (see the `Reuse Before Creating` rule in
  the repo `CLAUDE.md`). Reuse that component; do **not** introduce a new
  bespoke one for tariffs.
- [ ] **Render server-side** — links must be in the server-rendered HTML so
  Googlebot sees them on first crawl. No client-only `useEffect` rails.
- [ ] **Cache invalidation** — the new link blocks pull from the same JSON the
  page already loads, so the existing `tariff_report:<INDUSTRYID>` cache tag
  (see `../tariffs/post-merge-url-checklist.md` cache section) covers them.
  If a link block reads from a *different* source (e.g. ETF index, stock
  index), tag the fetch with that source's tag too so a stock/ETF refresh
  also refreshes the tariff page's link block.
- [ ] **Stable anchors** — when linking to a section anchor (e.g. the Mexico
  block inside `tariff-updates`), the anchor id must come from the country /
  area slug, not a generated index. Otherwise the inbound link rots the next
  time the report regenerates.
- [ ] **Avoid orphaned links** — guard each outbound link by checking the
  target exists before rendering. A 404 from an internal link hurts more
  than no link at all.
- [ ] **Sitemap untouched** — this task does not add new URLs; the existing
  sitemap rules in the post-merge checklist still hold.

### Measurement

- [ ] **Before/after baselines** — record indexed-URL count for the tariff
  sitemaps and average internal-link count per tariff page **before** the
  PR lands.
- [ ] **GSC follow-up** — 2 weeks after the PR is in production, re-check the
  "Crawled — currently not indexed" report for tariff URLs and the
  `inurl:industry-tariff-report` slice of the indexed-URL count. Document
  the delta in `../tariffs/` and link from this task entry.
- [ ] **Engagement** — confirm clicks on the new link rails are non-trivial
  (analytics: rail-click events / page-views). If a rail sees ~zero clicks,
  treat it as dead weight and remove it rather than letting it linger.

### Open questions

- Where should the "Related industries" rail render — inline in the body, in
  a sidebar, or as a footer block? Pick whichever the existing stock/ETF
  reports already use, for consistency.
- Do we want a "Related tariff reports" rail on stock and ETF reports, or
  just a single inline "Tariff exposure" link? The latter is cheaper and
  lower-noise; default to that unless engagement data later justifies a full
  rail.
