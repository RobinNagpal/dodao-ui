# Brief for export-page chapter agents

Shared instructions for an agent that writes the U.S.-exports half of one KoalaGains tariff chapter report.
A coordinator session gives each agent its chapter plus chapter-specific research leads, and points it here.

## Goal

Build the five export pages for YOUR chapter: `overview.json`, `tariff-updates.json`, `markets.json`, `rules.json`,
`faq.json` in `insights-ui/src/tariff-data/chapters/exports/<NN>-<slug>/`. Same structure and quality as the
chapters already done, passing the validator.

The point is **more Google clicks**: pages that are genuinely useful to someone landing from search (a U.S.
exporter, a foreign buyer, a trade journalist or analyst). That means accurate, current and specific: numbers,
rates, dates, and named agencies with links, answering the questions people actually type. Never invent a fact to
sound useful. A short answer with an official source beats a long vague one.

## Repo and git

- Repo: the dodao-ui checkout the coordinator names (app in `insights-ui/`). Work directly in that checkout.
  Paths below are relative to the repo root.
- Do NOT create worktrees or branches, and do NOT commit, push or open PRs. The user does git themselves.
- Use pnpm in `insights-ui/`. Check today's date with `date`. Facts must be current as of that date, and
  "What's coming" dates must be after it.

## Other agents work at the same time

Up to ten agents, across two coordinator sessions, may be writing other chapters at the same moment.
- Only create or edit files for YOUR chapter. The exceptions are the shared files below, each with its own rule.
- `export-library/foreign-measures.json` and `export-library/markets.json`: change them ONLY through the
  locked helper `docs/insights-ui/tasks/export-library-lib-edit.py`. Never use Edit, Write or sed on them.
- `export-library/us-export-steps.json`: do not edit it. Per-chapter notes go in your `rules.json` (`chapterNote`).
- `insights-ui/src/utils/tariff-reports/chapter-exports.ts`: you register your own chapter (step 4).
  - Use the Edit tool only, with two small insertions: your five import lines, and your map entry.
  - Re-Read the file immediately before each Edit. If an Edit fails because the file changed, re-read and retry.
  - Never rewrite the file and never touch other chapters' lines.
- `insights-ui/src/scripts/industry-tariff-reports/validate-chapter-content.ts`: you may add a genuine government
  domain to `OFFICIAL_SOURCE_DOMAINS`, one line, with Edit, after re-reading the file.
- Do NOT run `pnpm compile`, `pnpm lint` or `pnpm prettier-check` for the whole project. The coordinator runs them
  at the end. Run `npx prettier --config .prettierrc --write <your files>` from `insights-ui/` on your files only.

## Read first

- `docs/insights-ui/tariffs/export-pages/README.md` (the full process), and `overview.md`, `tariff-updates.md`,
  `markets.md`, `rules.md`, `faq.md` in the same folder. Follow them exactly.
- `docs/insights-ui/tariffs/chapter-content-refresh.md`: sourcing rules (§1–2) and validator checks (§7).
- Reference chapter `insights-ui/src/tariff-data/chapters/exports/30-pharmaceutical-products/`, plus the most recent
  chapters, which are the best current quality:
  - 03 fish
  - 22 beverages
  - 44 wood
  - 48 paper
  - 74 copper
  - 76 aluminum
  - 08 fruit and nuts
  - 72 iron and steel

  Pick the one closest in kind, and match its depth, tone and field usage.
- Types: `insights-ui/src/types/tariff-chapter-exports.ts`.

## Steps

1. **Trade data:** `insights-ui/src/tariff-data/trade/exports/chapter-<NN>.json`.
   - The coordinator fetches it, because UN Comtrade is slow (about 10 minutes per chapter) and rate-limited, so
     fetches run one at a time. Do NOT run `fetch-trade` yourself.
   - If the file doesn't exist yet, research first (steps 2 and 5), then check again.
   - With nothing left to research, wait with the Monitor tool (an until-loop on the file existing).
   - If it is still missing after about 60 minutes, stop and report.
2. **Shared library check:**
   - See which library entries have no coverage for your chapter:
     `python3 docs/insights-ui/tasks/export-library-lib-edit.py show-coverage <N>`
     `<N>` is the unpadded chapter number (`3`, not `03`).
   - Set coverage on every measure AND every upcoming event without `allGoods`:
     `python3 docs/insights-ui/tasks/export-library-lib-edit.py set-coverage <N> <id>=<yes|partly|no> ...`
     An upcoming event set to `no` stays off your "What's coming". Never hand-delete library events from your page.
   - **New foreign action:** if you find a foreign action on U.S. goods since January 2025 that the library lacks
     (a chapter-specific retaliation, an anti-dumping duty on U.S. goods, an import suspension), add it:
     `python3 docs/insights-ui/tasks/export-library-lib-edit.py add-measure <entry.json>`
     - `entry.json` is `{"measures":[...], "upcoming":[...], "sources":[...]}`, using the exact shapes of the
       existing entries. Keep the JSON file in your own scratch folder.
     - First check that the library doesn't already hold the same action or the same source URL under another id.
     - Then set its coverage for your chapter. If the action is product-specific and plainly cannot reach other
       chapters, also set `no` for every other chapter folder in `chapters/exports/`.
     - If it might reach other chapters (a broad trade deal, an all-goods measure), leave their coverage unset and
       say so in your report. The coordinator decides those.
   - **Missing market:** if the generator reports a missing market, add it with
     `python3 docs/insights-ui/tasks/export-library-lib-edit.py add-market <entry.json>`.
3. **Generate:** `pnpm tariff:generate-exports --chapter <N>` from `insights-ui/`. Add `--top-markets 9` if a buyer
   that people search for would otherwise drop off the Markets page.
   - Afterwards, check that `git diff --stat insights-ui/src/tariff-data/export-library/` dropped no one's entries.
4. **Register** your chapter in `EXPORTS_BY_SLUG`.
   - Follow the existing pattern: `ch<NN>Faq` … imports and a map entry keyed by the import chapter's
     `chapter.slug`, which is unpadded (e.g. `3-fish-and-crustaceans`).
   - From then on, validate with the real validator: `pnpm tariff:validate-chapters --chapter <slug>`.
5. **Write:** fill every TODO with researched, officially sourced facts.
   - Official sources:
     - foreign gazettes and ministries
     - customs tariff schedules (EU TARIC, UK Trade Tariff, CBSA, Japan Customs, Korea, China's MOF Tariff
       Commission, GACC)
     - WTO / WITS
     - USTR, the Federal Register and eCFR
     - USDA FAS/GAIN, BIS
     - the trade.gov FTA Tariff Tool and Country Commercial Guides

     News only tells you what to check.
   - Be precise about China, Canada, the EU, India, Mexico and Brazil: retaliation status and the 2025–2026 deals.
   - If you script the fill (as recent chapters did), keep the script in your scratch folder and name it in your
     report. Regenerating wipes the written text; the script restores it.
6. **Validate** until the chapter has 0 errors and no export-page warnings.
   - Age warnings on the import side or on the shared library are not yours to fix.
   - **"library measure X is missing":** another agent added a measure while you worked. Set your coverage for it
     with the helper, then run
     `python3 -I docs/insights-ui/tasks/export-library-merge.py --chapter <your folder>`
     It merges the new library entries into your tariff-updates page without touching your text. Then run prettier
     on your file.

## Search value (what makes these pages earn clicks)

- **Search titles:** set `page.seo` on all five pages.
  - `title` is about 65 characters plus the " | KoalaGains" suffix the other chapters use. Lead with the words
    people search: "U.S. Bourbon Exports & Foreign Tariffs…", not "HTS Chapter 22: Beverages…".
  - `shortDescription` is up to about 160 characters: a concrete number or fact, plus what the page answers.
  - `keywords` holds 5–8 real search phrases.
  - Each page gets a DIFFERENT title and description matching its own question. Markets is "what each country
    charges"; Rules is "Schedule B, export licence, certificates".
- **FAQ:** 10–12 questions built from real Google suggestions, fetched with curl. Don't use WebSearch for this:
  its budget is shared and has run out mid-task before.
  ```
  curl -s "https://suggestqueries.google.com/complete/search?client=firefox&q=<url-encoded query>"
  ```
  - Try everyday product names people use (bourbon, lobster, scrap, lumber, toilet paper, tires, sofas), not just
    HS wording.
  - Also try "tariff on us <product> <country>", "<country> retaliation <product>", "did <country> tariff
    <product>", "schedule b <product>", "hs code <product>", "export license <product>".
  - Record the queries in `questionSource`, and the matching suggestions in each FAQ's `searchedAs`.
  - Answers may only restate facts that are on the other export pages (spec rule).
- **Intros:** the first sentence answers the main question with the key number. Use the everyday product names
  alongside the HS wording.
- **Markets:** the buyers people search for most (usually China, Canada, the EU, Mexico, Japan, plus any buyer that
  targeted this product) need the most precise rates and a clear `headline`.
- **Tariff updates:** be complete and precise about anything that hit THIS chapter's goods specifically.

## Final report (short)

Give:
- the files created
- the shared-library changes: measure ids added, coverage set (and any broad measure whose coverage you left
  unset for other chapters), markets added, domains added
- the validator's final lines
- facts you could not source officially or chose to leave out
- the headline numbers (latest-year exports, top buyers)
- the five SEO titles
- the path of your fill script, if you made one
