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
- [ ] **Better cross-linking**:
  - From an industry tariff page, link to the relevant **stock** and **ETF**
    reports (companies + funds with exposure to that industry / those
    countries).
  - From a country tariff page, link to the industries most affected.
  - Internal linking helps both UX and the GSC "Crawled — currently not indexed"
    issue tracked in `stocks.md` SEO Fixes.
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
