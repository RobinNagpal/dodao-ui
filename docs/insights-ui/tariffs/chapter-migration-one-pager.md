# Migrating a Tariff Chapter to the Content-File Format: One-Pager

How to move an existing DB-backed HTS chapter report to the Approach-2 content-file format that
Chapters 01 and 30 use. It also covers how to make sure the content is current and correct.
Step-by-step detail lives in [chapter-content-refresh.md](chapter-content-refresh.md); this page is
the checklist.

## What changes when a chapter migrates

| | DB-backed chapter (today) | Migrated chapter |
| --- | --- | --- |
| Content | LLM-generated essays in `tariff_chapter_reports` | Facts as data in `insights-ui/src/tariff-data/chapters/<NN>-<slug>.json` (+ `exports/<NN>-<slug>/*.json`) |
| Pages | 6 essay sections | Overview: searchable rate table. Tariff updates: dated change log. Import statistics, rates by country, duty-saving rules, FAQ. Optional U.S. exports section. |
| Sources | Mostly uncited | Every dated fact links to an official primary source with its date |
| URLs | `/industry-tariff-report/chapters/<slug>/...` | **Same URLs**, so no SEO loss. Only the content source changes. |

Routing switches per page: `getChapterPrototype(slug)` returns the file, and each page renders from
it when its key (`tariffUpdates`, `understandIndustry`, …) is present. Otherwise it falls back to the
DB section, so a chapter can migrate one page at a time (the overview is required). Chapters without
a file are untouched.

## Migration checklist

1. **Slug.** Use the chapter's live slug exactly as it appears in `/industry-tariff-report/sitemap.xml`:
   `<number>-<kebab-title>` with no zero padding (e.g. `1-live-animals`, not `01-live-animals`). The
   file name is zero-padded. A mismatched slug silently serves the old page at the real URL. That
   happened once.
2. **Start from a reference file.** Copy Chapter 01 if the chapter has no export pages, or Chapter
   30 if it does. Keep every field name; the shapes are in `src/types/tariff-chapter-prototype.ts`
   and `src/types/tariff-chapter-exports.ts`.
3. **Rate table from the current HTS.** Build `overview.rateTable` from the newest HTSUS revision
   JSON on usitc.gov. Resolve the effective rates of 10-digit lines from their 8-digit parent.
4. **Every page from official sources.** Fill each page per §2 of the refresh runbook:
   - Federal Register and whitehouse.gov for proclamations and EOs; CBP CSMS for collection details.
   - USTR (Section 301) and BIS (Section 232) for trade actions.
   - ecfr.gov plus the agency (APHIS, FDA, DEA, …) for entry rules.
   - UN Comtrade / Census for trade data; the foreign official gazette for export-side tariffs.
   - **No news sites as sources.** Use news only to discover what to verify.
5. **Write chapter-specific copy in the data, not the components.** Shared components must stay
   generic. Never hard-code a chapter's numbers, countries ("Canada / Mexico") or goods ("animals")
   in a component; put them in the JSON.
6. **Register the chapter.** Add a static import to `PROTOTYPES_BY_SLUG` in
   `src/utils/tariff-reports/chapter-prototype.ts`. If it has export pages, also register it in
   `EXPORTS_BY_SLUG` in `chapter-exports.ts`. The sitemap and the `/tariff-reports` card pick it up
   from there.
7. **Validate:** from `insights-ui/`, run `pnpm tariff:validate-chapters --chapter <slug> --check-hts`.
   It must report 0 errors and no non-official-source warnings. Then `pnpm lint && pnpm prettier-check && pnpm compile`.
8. **Ship:** PR → merge → deploy, then flush only this chapter's cache:
   `/industry-tariff-report/chapters/<slug>` and `/<slug>/*` (runbook §8). Load every page on
   koalagains.com and check the "Rates as of" / "Updated" dates.

## Is the information latest and correct? Accuracy checklist

- [ ] **Current edition:** the cited HTS edition is the newest revision (`--check-hts`), and
      `tariffUpdates.now`, `industryAreas.scheduleEdition` and the `hts-now` source all name it.
- [ ] **What is collected today:** every measure in `inEffect` is still being collected today. Check
      court rulings, expiry dates and later proclamations. A Chapter 99 heading can still be printed
      in the HTS after it stops being collected (e.g. the IEEPA duties ended 2026-02-24 and the
      Section 122 surcharge expired 2026-07-23).
- [ ] **By country:** for each country in the matrix, the rate matches the in-effect rules. That
      includes FTA/USMCA treatment, exemption annexes (e.g. Section 301 note 52) and stacked duties
      (e.g. Brazil 25% + 12.5%).
- [ ] **Change log:** dated (ISO), newest first, each entry with `sourceIds`. Pending items say
      what is known and are marked `pending`.
- [ ] **Agency rules:** entry rules and bans (APHIS / FDA / DEA / FWS …) carry their status date,
      e.g. port closures, disease restrictions, proposed rules with comment deadlines.
- [ ] **Preference programs:** GSP, AGOA and similar are stated with their verified status and date.
      Never "check whether in force".
- [ ] **Consistency:** the same rate reads the same on the overview, tariff updates, rates by
      country and FAQ answers.
- [ ] **Sources resolve:** every source URL opens and says what we cite. Some agency sites block
      scripts (aphis.usda.gov returns 403 to curl; eCFR rate-limits), so check those in a browser
      or via the eCFR API.
- [ ] **Dates bumped:** `asOf` and every `lastCheckedAt` you actually re-checked.

## Definition of done

- [ ] All pages render at the existing URLs.
- [ ] The validator is clean.
- [ ] Links are checked.
- [ ] The cache is flushed.
- [ ] Other chapters are unchanged. If the PR touches shared components, compare a few DB-backed
      chapters' page text before and after deploying. Fetch them from `prod.koalagains.com` to skip
      the CDN.

**Keep it fresh:** re-run the validator at least monthly per migrated chapter (it warns after 30
days) and whenever a new HTS revision or a tariff proclamation is published.

**Known gap:** the scripts that generated the Chapter 01/30 rate tables and trade figures are not in
the repo yet. Commit a generator before migrating many chapters, so tables are rebuilt from the HTS
JSON rather than by hand.
