# Chapter Content Refresh (Approach-2 tariff chapters)

Runbook for keeping an Approach-2 HTS chapter report current — every major tariff update captured, with its date and a link to an **official** source — and for building a new chapter in the same pattern.

Approach-2 chapters are JSON content files, not DB rows:

| File | Loader | Pages it feeds |
| --- | --- | --- |
| `insights-ui/src/tariff-data/chapters/<NN>-<slug>.json` (`TariffChapterPrototype`, `src/types/tariff-chapter-prototype.ts`) | `src/utils/tariff-reports/chapter-prototype.ts` (`PROTOTYPES_BY_SLUG`) | overview, `tariff-updates`, `understand-industry`, `industry-areas`, `tariff-engineering`, `final-conclusion` |
| `insights-ui/src/tariff-data/chapters/exports/<NN>-<slug>/{overview,tariff-updates,markets}.json` (`src/types/tariff-chapter-exports.ts`) | `src/utils/tariff-reports/chapter-exports.ts` (`EXPORTS_BY_SLUG`) | `exports`, `exports/tariff-updates`, `exports/markets` — only for chapters with meaningful U.S. exports |

Reference implementations: Chapter 01 (`01-live-animals.json`, import side only) and Chapter 30 (`30-pharmaceutical-products.json` + exports).

---

## 1. Ground rules

1. **Official sources only for facts.** Every rate, duty, date and legal claim is backed by a source on the official allowlist (`OFFICIAL_SOURCE_DOMAINS` in `src/scripts/industry-tariff-reports/validate-chapter-content.ts`): Federal Register / govinfo, whitehouse.gov, USITC/HTS, CBP + CSMS, USTR, BIS, eCFR, agency sites, Census, UN Comtrade, WTO, and foreign government / gazette sites. News, law-firm and consultancy pages are acceptable only as *context* (they show up as validator warnings) — replace them with the primary document whenever one exists. If a foreign government site is genuinely official but missing from the list, add its domain to the constant rather than ignoring the warning.
2. **Every fact has a date.** Sources carry `published` (and `signed` for EOs/proclamations); changes carry `date` + `dateLabel` ("Signed", "Effective", "Checked"). All dates are ISO `YYYY-MM-DD`.
3. **Never invent a source id.** Every `sourceIds` entry must exist in the same page's `sources` list (the validator enforces this).
4. **Newest first.** `changes[]` (import and export) is sorted by `date` descending.
5. **One edition, everywhere.** All pages of a chapter cite the same HTSUS edition (`tariffUpdates.now.edition` = `industryAreas.scheduleEdition`, rate table rows from the same JSON).

---

## 2. Where each kind of fact comes from

| Fact | Official source | How to find it |
| --- | --- | --- |
| Base rates (General / Special / Column 2), units, chapter + additional U.S. notes | HTSUS JSON per revision: `https://www.usitc.gov/sites/default/files/tata/hts/hts_<year>_revision_<n>_json.json` (or `hts_<year>_basic_edition_json.json`); browse at `hts.usitc.gov` | Find the newest revision (`pnpm tariff:validate-chapters --check-hts` probes for it). Diff the chapter's rows between `before` and `now` editions; the HTS "Change Record" PDF for each revision (linked from `hts.usitc.gov` → Release history) says which headings moved. |
| Chapter 99 extra duties (IEEPA, Section 232, Section 301 headings) | HTSUS Chapter 99 in the same JSON (`9903.xx.xx`) + the Federal Register notice that created/changed the heading | Search the HTS JSON for `9903.` lines whose text names the chapter's headings or "all products of <country>". |
| Executive orders & proclamations | `federalregister.gov` (cite as "90 FR 9117"), `whitehouse.gov/presidential-actions/` for signing date | Federal Register search: `https://www.federalregister.gov/documents/search?conditions[term]=<query>&conditions[type][]=PRESDOCU` — useful terms: `"Harmonized Tariff Schedule" duties`, `reciprocal tariff`, `Section 232 <product>`, `"International Emergency Economic Powers Act" duties <country>`, `chapter <NN>` / the heading numbers. Record both `signed` (EO date) and `published` (FR date). |
| Agency notices implementing a measure (HTS annex changes, effective dates, inclusions/exclusions) | Federal Register `type=NOTICE` / `RULE` from USTR, Commerce/BIS, CBP | Same search with `conditions[agencies][]=trade-representative-office-of-united-states` / `industry-and-security-bureau` / `u-s-customs-and-border-protection`. |
| CBP implementation guidance (which Ch. 99 code to file, stacking, in-transit rules) | CBP CSMS messages (`content.govdelivery.com/accounts/USDHSCBP/bulletins/<id>`), `cbp.gov/trade` | Search CSMS archive for the Ch. 99 code or the EO number. Use the CSMS date as `published`. |
| Section 301 (China and others) | `ustr.gov` (Section 301 pages, exclusions) + Federal Register notices | Check the List 1–4A annexes and exclusion extensions for the chapter's 8-digit lines. |
| Section 232 product actions | `bis.gov` / `commerce.gov` (investigation initiation, inclusion processes) + the proclamation in the FR | FR search `Section 232 <product>`; BIS "Section 232 Investigations" page for open investigations (record as `type: "pending"`). |
| Court rulings affecting duties (IEEPA litigation etc.) | `supremecourt.gov`, `cit.uscourts.gov`, `cafc.uscourts.gov` | Record as a `reference` change with the opinion date. |
| Admissibility / agency rules (APHIS, FDA, DEA, FSIS, FWS …) | `ecfr.gov` (cite "9 CFR 93.x", `https://www.ecfr.gov/current/title-<t>/section-<s>`), agency pages (`aphis.usda.gov`, `fda.gov`, `dea.gov`) | Set `tariffEngineering.regulationsAsOf` to the eCFR "up to date as of" date shown on the page. |
| Preference programs, drawback, Chapter 98 provisions | HTSUS General Notes + Chapter 98; `ecfr.gov` title 19 (19 CFR 181/182 USMCA, 191 drawback); `uscode.house.gov` for statute text | Cite the exact section. |
| U.S. import / export statistics | UN Comtrade (`comtradeplus.un.org`), Census / USITC DataWeb (`census.gov`, `dataweb.usitc.gov`) | Record the year and value basis (CIF / customs value / FAS) in `valueBasis`. |
| Foreign tariffs on U.S. goods (export side) | The foreign government's own publication: EU `eur-lex.europa.eu` / `policy.trade.ec.europa.eu`, Canada `canada.ca` / `gazette.gc.ca` / `cbsa-asfc.gc.ca`, Mexico `dof.gob.mx`, China `mofcom.gov.cn` / Customs Tariff Commission (`gss.mof.gov.cn`) / `customs.gov.cn`, UK `gov.uk`, Japan `customs.go.jp`, Switzerland `admin.ch`; WTO tariff data (`wto.org`) or WITS for MFN rates | Use the gazette / regulation date as `published`; news wires only when no government text exists yet (and replace on the next refresh). |

---

## 3. How to record a fact

### Source object (`TariffUpdateSource`, used by import `tariffUpdates`/`industryAreas` and every export page)

```jsonc
{
  "id": "eo-14194",                         // short, stable, kebab-case; never reused for a different document
  "publisher": "Federal Register",
  "citation": "90 FR 9117",                 // what readers see on the link
  "document": "Executive Order 14194",
  "title": "Imposing Duties To Address the Situation at Our Southern Border",
  "signed": "2025-02-01",                   // null when not a signed instrument
  "published": "2025-02-07",                // required, ISO
  "url": "https://www.federalregister.gov/documents/2025/02/07/2025-02407/..."
}
```

Id conventions: `eo-<number>`, `proc-<number>`, `fr-<doc-number>`, `csms-<id>`, `hts-before` / `hts-now` for the two editions, `<cc>-<topic>` for foreign measures (e.g. `ca-sor-2025-181`).

### Change entry (`changes[]`)

`id` unique; `type` = `baseRate` | `extraDuty` | `reference` | `pending` (import) or `retaliation` | `tradeDeal` | `reference` (export); `date` + `dateLabel` say which date it is (Signed / Effective / Checked); `before` → `now` rates as the reader sees them; `sourceIds` non-empty. A `pending` entry (open investigation, announced but not in force) may carry a future date — the validator warns but does not fail.

### In-effect duty (`inEffect[]`)

One per Chapter 99 measure that reaches the chapter today: `country`, `measure`, `ch99Code`, `before`, `now`, `exemption`, `whatItMeans`, `sourceIds` (the instrument **and** `hts-now`).

### Dates to bump on every refresh

`asOf` (file root), `tariffUpdates.lastCheckedAt`, `understandIndustry.lastCheckedAt`, `industryAreas.lastCheckedAt`, `tariffEngineering.lastCheckedAt` + `regulationsAsOf`, `finalConclusion.lastCheckedAt`, each export page's `page.lastCheckedAt`. Only bump a date for a page you actually re-checked.

---

## 4. Cross-page consistency

A single tariff change usually touches several pages. When you add or change an extra duty, update all of these in the same edit:

1. **`tariffUpdates`** — `inEffect[]` row, a dated `changes[]` entry, the source in `sources[]`, the `stats` counts, and `now` edition if the HTS revision moved.
2. **`industryAreas` matrix** — the affected `countries[].rule` (`extraPct`, `ch99Code`, `usmcaCode`, `label`, `sourceIds`), every `cells[heading].with/withoutUsmca` total + breakdown, `biggestLanes[].totals`, `scheduleEdition`, and add the source to `industryAreas.sources` (its `sourceIds` resolve against that page's own list).
3. **Overview** — `rateTable.rows[].additionalDuties` / `stats` / `workedExamples` that quote a total rate, and `notes` if the chapter notes changed.
4. **`finalConclusion`** — `keyTakeaways` and every FAQ `answer` quoting a rate or date (search the file for the old percentage and Ch. 99 code). FAQ `link` must be a section that exists.
5. **`tariffEngineering`** — levers whose savings depend on the duty (e.g. USMCA qualification, Chapter 98, drawback).
6. **Export side** (if registered) — `exports/tariff-updates` `inEffect`/`changes`/`byCountry`, and `exports/markets` `cells[].rate` + `profile.tariffNow`, `exports/overview` `topMarkets[].tariffNow`/`status`.

A quick check: grep the chapter's JSON files for the old rate string and the Ch. 99 code; every hit must be updated or deliberately historical (a `before` value).

---

## 5. Refresh an existing Approach-2 chapter

1. **Start a worktree** for the task (see `CLAUDE.md`), e.g. `tariff-ch30-refresh-2026-11`.
2. **Baseline:** `cd insights-ui && pnpm tariff:validate-chapters --chapter <slug> --check-hts`. Note stale dates, newer HTS revision, non-official hosts.
3. **HTS edition:** if a newer revision exists, download it, diff the chapter's rows (General/Special/Column 2/units/new or removed lines) against the cited `now`, and read the revision's change record. Update `overview.rateTable`, `tariffUpdates.lines`, `tariffUpdates.now` (+ `hts-now` source), `industryAreas.scheduleEdition`, and the Ch. 99 lines that reference this chapter.
4. **New measures since `lastCheckedAt`:** run the Federal Register searches from §2 filtered to `publication_date[gte]=<lastCheckedAt>`; check CSMS, USTR 301 and BIS 232 pages for the same window; check courts for rulings on the duties in `inEffect`. For each hit that reaches the chapter, record it per §3 and propagate per §4.
5. **Pending items:** re-check every `pending` change (investigation concluded? proclamation signed?) and convert it to `extraDuty` / remove it.
6. **Export side:** re-check each foreign measure in `exports/tariff-updates` against the foreign official source; replace news-wire sources with the government text when it is out.
7. **Trade data:** when a new full year is available in Comtrade/Census, update `understandIndustry`, the matrix `importsUsd`, overview `tradeSnapshot` and export `overview`/`markets`.
8. **Bump the dates** you re-checked (§3).
9. **Validate:** `pnpm tariff:validate-chapters --chapter <slug> --check-hts` → 0 errors; resolve or consciously accept each warning.
10. **Quality checks + PR:** `pnpm lint && pnpm prettier-check && pnpm compile`, commit, push, open the PR.
11. **After deploy: flush the cache** (§8).

## 6. Build a new chapter in this pattern

1. Copy the closest reference file (Chapter 01 for a chapter with no exports, Chapter 30 for one with exports) to `src/tariff-data/chapters/<NN>-<slug>.json`; the slug is `<chapterNumber>-<kebab-title>` without zero-padding (e.g. `1-live-animals`), the file name is zero-padded.
2. Fill `chapter`, then build the overview rate table from the HTSUS JSON (resolve `effective*` rates from the 8-digit parent, `*InheritedFrom`, `ancestorPath`, `searchText`, `dutiable`).
3. Work through §2 for every page: `tariffUpdates` (two-edition comparison + in-effect measures + change log), `understandIndustry` (Comtrade), `industryAreas` (country × heading matrix from the in-effect rules), `tariffEngineering` (eCFR rules + levers), `finalConclusion` (FAQs from real search suggestions, answered only from facts on the other pages). Optional page keys can be added incrementally — a missing key means that page has not been built.
4. Register it in `PROTOTYPES_BY_SLUG` (`src/utils/tariff-reports/chapter-prototype.ts`) with a static import. For export pages, create `exports/<NN>-<slug>/{overview,tariff-updates,markets}.json` and register in `EXPORTS_BY_SLUG`.
5. Run the validator (it also warns about content files that exist on disk but are not registered), quality checks, PR, deploy, flush.

---

## 7. Validation script

```bash
cd insights-ui
pnpm tariff:validate-chapters                         # every registered chapter
pnpm tariff:validate-chapters --chapter 1-live-animals
pnpm tariff:validate-chapters --max-age-days 14       # freshness window (default 30)
pnpm tariff:validate-chapters --check-hts             # network: is the cited HTS edition the newest on usitc.gov?
pnpm tariff:validate-chapters --strict                # warnings fail the run too
pnpm tariff:validate-chapters --today 2026-12-31      # evaluate dates as of another day
```

Source: `insights-ui/src/scripts/industry-tariff-reports/validate-chapter-content.ts`. It loads every chapter registered in the two loaders and walks each document generically, so new fields that follow the naming conventions are covered automatically:

| Check | Level |
| --- | --- |
| Source (id-keyed `sources[]`) missing `published` or `url` | ERROR |
| URL not https / unparseable | ERROR |
| URL host not in `OFFICIAL_SOURCE_DOMAINS` (any `url` field: sources, citations, regulator links, edition refs) | WARN |
| `sourceIds` entry not defined in the enclosing page's `sources` | ERROR (empty list → WARN) |
| Date fields (`date`, `published`, `signed`, `released`, `inForceFrom`, `lastCheckedAt`, `asOf`, `regulationsAsOf`) not ISO | ERROR |
| Date in the future | ERROR (WARN on `pending` changes) |
| `lastCheckedAt` / `asOf` older than `--max-age-days` | WARN |
| Cited HTS edition superseded (`--check-hts`) | WARN |
| `changes[]` not newest-first | ERROR |
| Duplicate `id` in any array | ERROR |
| `tariffEngineering` `ruleIds` / `leverIds` unresolved; matrix cell for an unknown heading; FAQ `link` to a missing section; `chapter.slug` ≠ registered slug | ERROR |
| `industryAreas.scheduleEdition` ≠ `tariffUpdates.now.edition`; content file on disk but not registered | WARN |

Exit code is 1 on any error (or any warning with `--strict`). The validator is **not** wired into CI — run it before every content PR.

## 8. Flush the CloudFront cache after deploy

Chapter pages are cached at the CloudFront edge, so a merged content change is not visible until the cache is invalidated.

- **Targeted (preferred)** — invalidate just the chapter (2 paths against the 1,000-path/month free tier):

  ```bash
  aws cloudfront create-invalidation --distribution-id EZI5H8FKNE9R1 \
    --paths "/industry-tariff-report/chapters/<slug>" "/industry-tariff-report/chapters/<slug>/*"
  ```

  The `/*` path covers the sub-pages (`tariff-updates`, `understand-industry`, `industry-areas`, `tariff-engineering`, `final-conclusion`, `exports`, `exports/tariff-updates`, `exports/markets`); the bare path covers the overview.

- **Everything tariff-related** — run the **Flush CloudFront cache** GitHub workflow (`.github/workflows/flush-cloudfront-cache.yml`) with `flush_tariffs` ticked. Note it has no per-chapter option: it invalidates all of `/industry-tariff-report/*` and `/tariff-reports*`.

Then load each page of the chapter on koalagains.com and confirm the new "as of" / last-checked dates.
