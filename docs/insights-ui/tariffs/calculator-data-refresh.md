# Tariff Calculator Data Refresh (official-source measures)

Runbook for refreshing the data the tariff calculator's official-source engine reads (issue #1785): every Chapter 99 heading, the reviewed extra-duty measures, and the base rates in `hts_codes`. Run it for each new HTS revision and whenever a Federal Register / CBP CSMS action adds, changes or ends a measure.

Nothing here writes to a database from a laptop (only the lines-sync generator reads it, see "Syncing hts_codes lines with a new HTS edition"). Scripts produce **committed JSON + a generated SQL file**; the SQL is reviewed in a PR and applied by a GitHub workflow (dry run first).

## What lives where

| Data                                                                                                                      | Source of truth (committed)                                                   | Table                                                | Produced by                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Every Chapter 99 heading (`9903.xx.xx`): rate text, rate kind/percent, countries, excepted headings, U.S. note references | `insights-ui/src/tariff-data/calculator/ch99-headings.json`                   | `tariff_chapter99_headings`                          | `pnpm tariff:build-ch99` (parsed from the USITC HTS JSON)                                                 |
| Reviewed measures (which heading applies to which countries/HTS lines, conditions, dates, sources)                        | `insights-ui/src/tariff-data/calculator/measures.json`                        | `tariff_measures`                                    | Curated: coverage from the Chapter 99 U.S. notes, dates/conditions from the Federal Register / CBP CSMS   |
| Base rates (General / Special / Column 2) + units per HTS line                                                            | USITC HTS JSON (not committed, ~12 MB)                                        | `hts_codes` (existing rows updated)                  | Embedded in the data SQL by `pnpm tariff:build-data-sql`, or alone via `pnpm tariff:build-base-rates-sql` |
| The HTS lines themselves (rows added / removed by an edition, order, hierarchy)                                           | USITC HTS JSON + a read-only snapshot of `hts_codes`                          | `hts_codes` (rows inserted / deleted / re-sequenced) | `pnpm tariff:build-hts-lines-sync-sql` → `<YYYYMMDD>-<edition-slug>-hts-lines-sync.sql`                   |
| The SQL that loads all of the above                                                                                       | `insights-ui/prisma/data-sql/tariff-calculator/<YYYYMMDD>-<edition-slug>.sql` | —                                                    | `pnpm tariff:build-data-sql`                                                                              |

Types: `insights-ui/src/types/tariff-calculator-measures.ts`. Schema: `TariffChapter99Heading` / `TariffMeasure` in `prisma/schema.prisma` (migration `20261009000000_add_tariff_calculator_measures`). Scripts: `insights-ui/src/scripts/tariff-calculator/`.

## 1. Get the HTS JSON

The newest revision is at `https://www.usitc.gov/sites/default/files/tata/hts/hts_<year>_revision_<n>_json.json` (`pnpm tariff:validate-chapters --check-hts` tells you whether a newer one exists). usitc.gov often answers scripted requests with **403 Access Denied**; the scripts send a browser User-Agent and retry with delays, and cache successful downloads under the OS temp dir. If it still refuses, download the file in a browser and pass `--file` / `--hts-file`.

## 2. Regenerate (from `insights-ui/`)

```bash
# Chapter 99 headings → src/tariff-data/calculator/ch99-headings.json
pnpm tariff:build-ch99 --file ~/Downloads/hts_2026_revision_21_json.json
#   or: pnpm tariff:build-ch99                              (newest revision on usitc.gov)
#   or: pnpm tariff:build-ch99 --edition "2026 Revision 21"
#   --edition is needed with --file when the filename isn't hts_<year>_revision_<n>_json.json

# Re-extract product coverage from the Chapter 99 U.S. notes (needs pdftotext or Python + pypdf):
npx tsx src/scripts/tariff-calculator/extract-ch99-note-coverage.ts   # → note-coverage.json
# Update the reviewed definitions (new/changed/ended measures, dates, sources, htsEdition, reviewedAt) in
# src/scripts/tariff-calculator/build-measures.py, then rebuild measures.json from them + note-coverage.json:
python3 src/scripts/tariff-calculator/build-measures.py && npx prettier --write src/tariff-data/calculator/measures.json
# Never hand-edit measures.json: it is regenerated by build-measures.py — see §3.

# One SQL file for headings + measures + base rates
pnpm tariff:build-data-sql --hts-file ~/Downloads/hts_2026_revision_21_json.json
#   --no-base-rates   headings + measures only
#   --out <path>      different output path

# Base rates only (standalone transaction), when nothing else changed
pnpm tariff:build-base-rates-sql --file ~/Downloads/hts_2026_revision_21_json.json
```

`tariff:build-ch99` prints counts per `rateKind`, how many headings have countries / excepted headings / note references, and every heading whose rate it could not parse (`rateKind: "unknown"`). Unknowns are expected for:

- headings with a blank rate column (quota sub-headings such as `9903.17.*`, `9903.18.*`, `9903.52.*`; sanctions/column-2 headings such as `9903.90.08`);
- specific or partial rates: "+ a duty of 25% upon the value of the non-U.S. content", "The duty provided in subheadings 8716.39.00, … + 100%".

A measure that uses such a heading carries its own `rateKind` / `ratePct` in `measures.json`; the heading row is reference data.

How the parser reads a heading:

| Field                  | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rateKind` / `ratePct` | "The duty provided in the applicable subheading + 25%" (also "+25%", "plus 25%", "+ a duty of 25%") → `additive` 25; "10%" → `flat` 10 (in place of the base rate); "Free" → `flat` 0; "The duty provided in the applicable subheading" or "No change" → `relief`; anything else → `unknown`.                                                                                                                                                                                                                                                                                      |
| `countries`            | Every country named in the description (names from `src/utils/tariff-calculator/countries.ts` plus HTS spellings such as "Republic of the Congo", "Türkiye", "Côte d\`Ivoire", "Hong Kong, China" → HK); "European Union" (incl. "a member state of the European Union", "a European Union member country") → the 27 member states. Indented headings with no country of their own inherit the countries named in their parent rows (e.g. `9903.89.05` under "Articles the product of France, of Germany, of Spain or of the United Kingdom:"). The United States is never listed. |
| `exceptCodes`          | Headings after "Except for products described in headings …", "except as provided for in headings …", "Except as provided in heading …" (every clause in the description). Ranges are expanded: `9903.05.85–9903.05.92` → each code; a range that crosses groups (`9903.05.99–9903.06.01`) runs to `.99` and restarts at `.01`.                                                                                                                                                                                                                                                    |
| `noteRefs`             | U.S. notes to subchapter III: "U.S. note 2(a)" → `2(a)`; "subdivision (v)(iv) of U.S. note 2" → `2(v)(iv)`; "subdivisions (c) and (d) of U.S. note 40" → `40(c)`, `40(d)`; "subdivisions (v)(vi) through (v)(xvi)" → `2(v)(vi)–(v)(xvi)`; "notes 20(f) or 20(g)" → both. General notes, statistical notes and notes to other chapters are skipped. Typos are kept verbatim (`9903.01.15` cites "note 2(I)").                                                                                                                                                                       |

## Measure conditions (what the HTS line alone can't tell)

A measure applies only when every condition in its `conditions` matches the shipment. Types: `TariffMeasureConditions` / `TariffShipmentConfirmations` in `insights-ui/src/types/tariff-calculator-measures.ts`. Facts the importer confirms (issue #1790) come in `MeasureEngineInput.confirmations`. A missing confirmation counts as "no": a conditional relief never applies on a guess, and the requirements route asks only the questions that change the duty for that line and country.

| Condition                  | Matches when                                                                                    | Used by (`build-measures.py`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `usmcaQualifying`          | USMCA (SPI `S`/`S+`) is / is not claimed                                                        | Canada/Mexico 2026 Section 301 duty and its relief (notes 52(g)/(h))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `productTypes`             | the chosen product type is listed (`patented`, `generic`, `specialty`, `other`)                 | Section 232 pharmaceuticals (note 40). `other` = 9903.04.69 (not a pharmaceutical article, or neither patented nor generic): no Section 232 measure charges it, so it has no record of its own                                                                                                                                                                                                                                                                                                                                                                |
| `spiClaimed`               | one of these SPI codes is claimed                                                               | CAFTA-DR: `["P", "P+"]` (general note 29(a)(i)) on `s301-2026-except-gt-cafta-dr` (9903.06.06, note 52(j)(6)(iii), 1,737 lines) and `s301-2026-except-sv-cafta-dr` (9903.06.09, note 52(j)(7)(iii), 1,707 lines)                                                                                                                                                                                                                                                                                                                                              |
| `endUse: "pharmaceutical"` | the importer confirms the goods are for use in pharmaceutical applications                      | `s301-2026-exempt-52e-pharma-use` (9903.05.89, the 693 non-Chapter-30 lines of note 52(e)) and `s301-brazil-exempt-50a-v-pharma-use` (9903.05.06, the 698 non-Chapter-30 lines of note 50(a)(v))                                                                                                                                                                                                                                                                                                                                                              |
| `endUse: "research"`       | solely for clinical trials, R&D or other non-commercial use                                     | `s232-pharma-research-use` (9903.04.70, from 2026-09-29, 91 FR 60360)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `usOriginIngredient: true` | the active ingredient is a product of the United States, made into dosage form abroad           | `s232-pharma-us-origin-api` (9903.04.68, Proclamation 11020 clause 11)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `companyProgram`           | the importer confirms the manufacturer is in the program (self-declared, CBP may ask for proof) | `onshoring` → `s232-pharma-onshoring` (9903.04.64, base + 20%, 2026-09-29 to 2030-04-01, not for EU/JP/KR/CH/LI/GB whose rates are lower); `mfnPricing` (Annex II companies and other onshoring + MFN pricing agreements) → `s232-pharma-mfn-pricing` (9903.04.65, + 0%, until 2029-01-19); `annexCompany` (Annex III companies, which paid from July 31, 2026) → `s232-pharma-annex3-patented` / `-deal-15` (9903.04.60 / .62, 2026-07-31 to 2026-09-28). Every other company used `s232-pharma-other-companies-before-0929` (9903.04.61, 0%) in that window |
| `productDescriptionIds`    | the importer confirms the product matches a named-product description                           | Named-product exemptions (notes 52(c), 52(j)(n)(ii), 50(a)(iii)); ids in `note-product-descriptions.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                     |

Review notes for these measures:

- **Chapter 30 pharmaceutical use is presumed.** The 7 Chapter 30 lines on the 52(e) / 50(a)(v) lists (`*-pharma-use-ch30`) stay unconditional. Chapter 30 is "Pharmaceutical products": headings 3003/3004 are medicaments and heading 3006 covers the pharmaceutical goods of chapter note 4, so the classification itself establishes the pharmaceutical use. This matches the Chapter 30 content file and its golden scenarios. 3006.92 (waste pharmaceuticals) is presumed the same way. The Chapter 28/29/32/34/35/38/39 lines need the confirmation.
- **Section 232 headings are mutually exclusive** (note 40(a)), and the lowest applicable rate wins (Proclamation 11020 clause 8). Relief/company measures therefore list the 232 headings they displace in `replacesCodes`. Only 9903.04.60–9903.04.66 also displace the 2026 Section 301 and Brazil duties (notes 52(f)(8), 50(a)(vi)(8)). 9903.04.67, .68 and .70 do not.
- **Note 52(i) is not modelled.** It covers CAFTA-DR textile/apparel goods of Costa Rica, the Dominican Republic, El Salvador, Guatemala, Honduras and Nicaragua (9903.05.95). It has no code list and defines its goods by the Annex to the WTO Agreement on Textiles and Clothing (general note 29(d)(v)), which the HTS doesn't reproduce. For Guatemala and El Salvador, the 52(j)(6)(iii)/(7)(iii) lists already give the same relief for the listed lines.
- After a new HTS revision, re-check: the CAFTA-DR SPI codes; the 9903.04.64 rate step (100% from April 2, 2030); the 9903.04.65 expiry (January 20, 2029); and whether Commerce/BIS has published the Annex II/III company lists (phase B of #1790: verified company lists instead of self-declaration).

**Never overwrite a SQL file that is already on `main`.** It may already have been dry-run or applied. `tariff:build-data-sql` writes `<YYYYMMDD>-<edition>.sql`. If that name already exists on `main`, rename the new output to something descriptive (e.g. `20261009-2026-revision-21-conditional-exemptions.sql`) and restore the old file. Each file replaces the tables wholesale, so applying the newest file is enough.

## 3. Review

Open a PR with the regenerated JSON and SQL (plus `measures.json` changes). Reviewers check:

1. **`ch99-headings.json` diff** — new / removed / re-rated headings match the HTS Change Record for the revision; spot-check the countries and exceptions of the headings measures use.
2. **`measures.json`** — every measure has an official source (`federalregister.gov`, CBP CSMS, `hts.usitc.gov`), `effectiveFrom` (and `effectiveTo` if it ended), `htsEdition` = the headings file edition, and `ch99Code` / `replacesCodes` that exist in `ch99-headings.json` (`tariff:build-data-sql` warns otherwise and fails on invalid rate kinds, dates or duplicate keys).
3. **The SQL file header** — edition, source URL, counts, and any `NOTE` (e.g. "measures.json not found — tariff_measures is emptied"). The body is generated; don't hand-edit it — fix the JSON and regenerate.

The data SQL is one transaction:

1. `DELETE` + `INSERT` all `koala_gains` rows of `tariff_chapter99_headings` and `tariff_measures` (rows sorted, ids from `gen_random_uuid()`), so the tables always equal the committed JSON.
2. Stage the edition's numbered HTS rows in a temp table and `UPDATE hts_codes` where `general_rate_of_duty` / `special_rate_of_duty` / `column2_rate_of_duty` / `unit_of_quantity` differ (`IS DISTINCT FROM`), matched on `hts_number`. Formats mirror the original CSV ingest: trimmed text, blank → `NULL`, units as a `TEXT[]` (`{"No.","kg"}`). New HTS lines are **not** inserted and lines the edition dropped are **not** deleted — the SQL prints both counts; sync the lines with `pnpm tariff:build-hts-lines-sync-sql` (see "Syncing hts_codes lines with a new HTS edition").
3. `SELECT` the counts, then `COMMIT`.

It is safe to re-run: the replace is idempotent and the `hts_codes` update only touches differing rows.

## 4. Merge, then apply

1. **Merge the PR.** The `migrate` job of `insights-ui-deploy-aws.yml` applies pending Prisma migrations (e.g. the one that creates the two tables) before the deploy. Wait for it to finish.
2. **Dry run.** GitHub → Actions → **"insights-ui: apply data SQL"** → _Run workflow_ on `main` with
   `sql_file = insights-ui/prisma/data-sql/tariff-calculator/<file>.sql`, `dry_run = true`.
   The workflow checks the path is under `insights-ui/prisma/data-sql/`, that the file is a single `BEGIN; … COMMIT;` transaction, then runs it with its `COMMIT` replaced by `ROLLBACK` and prints the counts. Expect: headings = the file's heading count, measures = its measure count, "hts_codes rows updated" = how many base lines changed since the last refresh (0 on a re-run).
3. **Real run.** Same inputs with `dry_run = false` (`psql -v ON_ERROR_STOP=1 -f <file>`; any error aborts and rolls back the whole transaction).
4. Check the calculator on a few known shipments (the golden scenarios) against the chapter pages' Rates-by-country matrix.

The workflow uses the `DATABASE_URL` repository secret (the same one the deploy's `migrate` job uses), strips Prisma-only URL parameters (`schema`, `connection_limit`, …) before handing it to `psql`, and never prints it.

## Syncing hts_codes lines with a new HTS edition

The base-rate SQL only _reports_ "HTS rows not in hts_codes" and "hts_codes rows not in this edition". To add and remove the lines themselves, run `pnpm tariff:build-hts-lines-sync-sql`. Unlike the other generators it **reads the database** (read-only `findMany`, never writes), because the SQL depends on which rows and header ids exist now:

```bash
# from insights-ui/ — DOTENV_CONFIG_PATH points at an env file with DATABASE_URL (read-only use)
DOTENV_CONFIG_PATH=.env pnpm tariff:build-hts-lines-sync-sql \
  --hts-file ~/Downloads/hts_2026_revision_21_json.json \
  --rollback-out /tmp/hts-lines-sync-rollback.sql
#   --date YYYYMMDD   filename prefix (default: today, UTC)
#   --out <path>      different output path
```

Output: `prisma/data-sql/tariff-calculator/<YYYYMMDD>-<edition-slug>-hts-lines-sync.sql` (committed) and the rollback file (**not** committed — it holds a full copy of the deleted rows and their candidate-code links; keep it until the sync has been checked in production). The same inputs and database state give byte-identical files.

How rows are matched (mirrors the original per-chapter CSV ingest, commit `cca8b5131`):

| Rule                   | Detail                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Chapter                | Numbered rows: the first two digits. Unnumbered header rows: the chapter of the next numbered row (chapter-leading section headers such as "I. CHEMICAL ELEMENTS" belong to chapter 28, not 27).                                                                                                                                                                                                                   |
| `sort_order`           | 0-based position within the chapter, in the edition's order.                                                                                                                                                                                                                                                                                                                                                       |
| `parent_id`            | The most recent row with `indent - 1`, using the original ingest's indent stack (cut back at every row). Indent-0 rows, chapter-leading section headers, and rows below an indent gap in the edition (e.g. `2620.99.75` at indent 3 → `2620.99.75.20` at indent 5) get `NULL` — exactly what the ingest stored (the generator checks that this rule reproduces every current `parent_id` before writing anything). |
| Formats                | Description trimmed; rate / quota / additional-duty cells trimmed, blank → `NULL`; units → `TEXT[]`; `hts_code_10` = the digits of 10-digit lines.                                                                                                                                                                                                                                                                 |
| Existing numbered rows | Matched by `hts_number`. Their `indent` and `description` are synced to the edition too (rates are the base-rate SQL's job).                                                                                                                                                                                                                                                                                       |
| Existing header rows   | Matched by indent + whitespace-normalized description in sequence order (an LCS over the chapter's rows, numbered rows acting as anchors), referenced by id. Unmatched ones are deleted / inserted.                                                                                                                                                                                                                |

Only chapters with a difference (new / removed rows, changed indent, description, order or parent) are touched. The transaction:

0. **Guard** — aborts unless each affected chapter still holds exactly the snapshot's row ids in the same order. A stale file, or a second run after it was applied, fails instead of doing damage: regenerate instead.
1. Stages the affected chapters' edition rows in a temp table keyed by (chapter, position), with each row's parent position, and resolves each to its existing id or a new `gen_random_uuid()`.
2. Deletes the rows the edition dropped (numbered by `hts_number`, headers by id) — their `hts_code_candidate_codes` links cascade; the count is printed first.
3. Inserts the new rows (all columns in the formats above).
4. Re-sequences `sort_order` and re-points `parent_id` (plus `indent` / `description`) for every row of those chapters — only differing rows are written.
5. Integrity checks, printed and asserted (a failing one raises and rolls everything back): per-chapter row count = edition; no duplicate `sort_order`; every row at its edition position; every parent in the same chapter, one indent up and above the row; every `parent_id` = the indent-stack parent; no numbered row outside the edition in the affected chapters; overall numbered diff 0 missing / 0 extra.

Before writing the SQL the generator simulates the post-sync state in memory and asserts the same rules on **every** chapter; it refuses to write the file if any fails. Apply it like any data SQL (§4, dry run first). For HTS 2026 Revision 21 (`20261010-2026-revision-21-hts-lines-sync.sql`): 27 chapters, +363 / −86 numbered lines, +41 / −9 header rows, 9 re-indented and 43 re-described rows, 14,264 candidate-code links removed with the deleted lines.

**Rollback** (after a committed sync): run the rollback file through the same workflow. It deletes the inserted rows (numbered by `hts_number`; headers by chapter + post-sync `sort_order` + indent + description), re-inserts the deleted rows and their links with their original ids and columns, restores every pre-sync row's `sort_order` / `parent_id` / `indent` / `description` / `updated_at`, and checks each chapter's ids and order equal the snapshot. Links only restore while their `tariff_candidate_codes` rows still exist. The rollback file lives outside the repo, so to run it with the workflow, copy it into `prisma/data-sql/` on a branch at that time.

**Page impact.** `/hts-codes/us/[section]/[chapter]` lists a chapter's rows in `sort_order` (anchors are `#<hts_code_10>`; there are no per-line URLs, so nothing 404s). New lines appear and removed ones disappear once the chapter's cache is invalidated — the pages are cached by tag, so after the real run use **Invalidate Cache** in each affected chapter page's admin menu (or wait for the next deploy). Calculator search (`/api/tariff-calculator/hts-search`) reads `hts_codes` directly: removed codes are no longer found (correct — they are not valid for entry under this edition), new codes are found, and breadcrumbs follow the corrected `parent_id` chain. New lines have no candidate-code links until the candidate-code ingest runs for them.

## Gaps / things the scripts don't do

- **Coverage** (which HTS lines a measure covers) is not in the HTS JSON — it lives in the Chapter 99 U.S. notes text and is curated into `measures.json`.
- `9903.92` (a header row, not a 10-character heading) is skipped; its indented headings (`9903.92.10`, `9903.92.80`) inherit its countries.
- Headings whose country wording is unusual (e.g. "any country other than …") are not parsed as exclusions; the measure in `measures.json` must set `countriesExclude`.
- New / removed HTS lines in `hts_codes` are not handled by the base-rate SQL (it only reports them) — use `pnpm tariff:build-hts-lines-sync-sql` (see "Syncing hts_codes lines with a new HTS edition").
