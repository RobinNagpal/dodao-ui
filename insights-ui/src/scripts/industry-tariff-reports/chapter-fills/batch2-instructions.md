<!-- Archived instructions the batch-2 writer agents followed (#1812). Kept for context; to re-run a chapter use
     `pnpm tariff:refresh-chapter <NN>` (docs/insights-ui/tariffs/chapter-content-refresh.md). -->

# Batch 2 chapter migration: shared instructions (#1812)

You migrate ONE HTS chapter of KoalaGains (insights-ui) to the Approach-2 chapter content format. About 24 other agents are doing other chapters in parallel, in the same worktree.

## Where

- **Worktree:** one shared batch worktree (`<worktrees>/chapter-migration-1812-b2`, branch `chapter-migration-1812-b2`). Work only there. Never touch the main checkout or any other worktree.
- **Output:** `insights-ui/src/tariff-data/chapters/<NN>-<slug>.json`, and nothing else.
  - Do NOT edit `chapter-prototype.ts`; I register chapters.
  - Do NOT edit the generator, the validator, `measures.json`, `golden-scenarios.json`, docs, or other chapters' files. Many agents share this worktree, so a shared-file edit breaks the others.
  - Report any needed code or data changes instead.
- **Scratch:** `<scratchpad>/ch<NN>/` only. (These scripts now live in `chapter-fills/<NN>/`; caches go to `$CHAPTER_FILL_CACHE`.)
- **Safety:**
  - `insights-ui/.env` is PRODUCTION. Never write to the DB and never print secrets.
  - Never write the name of the one banned third-party data site (`FORBIDDEN_SOURCE` in `chapter-fills/fillenv.py`; the fill scripts assert it is absent).
  - Do not commit.

## Read first

- `CLAUDE.md` and `docs/insights-ui/README.md`.
- The tariffs docs in `docs/insights-ui/tariffs/`, especially `chapter-content-refresh.md` and `chapter-migration-one-pager.md` if present.
- `src/types/tariff-chapter-prototype.ts`.
- Finished examples, which show the expected depth and tone:
  - `src/tariff-data/chapters/42-leather-articles-and-saddlery.json`
  - `47-wood-pulp-and-scrap.json`
  - `72-iron-and-steel.json` (Section 232 metals)
  - `49-printing-industry-products.json` ("if yes / if no" cells)
- The live pages, for SEO keywords to keep: https://koalagains.com/industry-tariff-report/chapters/<slug>, plus its `/tariff-updates`, `/understand-industry`, `/industry-areas`, `/tariff-engineering` and `/final-conclusion`.

## Steps

1. **Trade data.** I'm fetching `insights-ui/src/tariff-data/trade/chapter-<NN>.json` in the background. Comtrade's quota may delay it by up to an hour. Research meanwhile, and poll for the file every few minutes. Don't fetch it yourself.

2. **Generate.** Run from `insights-ui/`:

   `pnpm tariff:generate-chapter --chapter <NN> --slug <slug> --title "<official HTS chapter title>" --trade-file src/tariff-data/trade/chapter-<NN>.json --countries <list> --hts-file <scratchpad>/hts_2026_revision_21_json.json --force`

   - `--countries`: the top ~10 import sources, plus countries that show key rules (China, Canada, Mexico, the EU's main source, Brazil, the UK, Japan, Vietnam, India where relevant). Add `--claim XX:D`-style claims where a country-tied program matters.
   - Do NOT pass `--include-elections`. The Section 232 certified-parts elections are opt-in, so they're left off pages.
   - Keep the generated data. Write the prose around it, with a re-runnable `run.sh` plus fill script in your scratch folder. The script must do generate → fill → `pnpm tariff:compact-chapters <file>` → `npx prettier --write <file>`.

3. **Fill every TODO from OFFICIAL sources only.**

   - **Allowed sources:** Federal Register, eCFR, USITC/HTS plus the Chapter 98/99 notes, USTR, CBP/CSMS and rulings, Commerce/ITA/BIS, USDA, FDA, EPA, CPSC, FTC, FWS, DHS, govinfo U.S. Code, and UN Comtrade.
   - **Not allowed:** news, company commentary, or unsourced market claims.
   - **Don't cite `uscode.house.gov/view.xhtml` links.** They return "Page Not Found", and the validator now errors on them. Use the govinfo U.S. Code page instead: `https://www.govinfo.gov/link/uscode/<title>/<section>?type=usc&year=mostrecent&link-type=html` resolves to the stable `https://www.govinfo.gov/content/pkg/USCODE-2024-title…htm` URL, so cite that resolved URL.
   - **Verify every exemption** against the Rev 21 Chapter 99 notes:
     - 52(b), the general exemptions;
     - 52(j), the country exception lists;
     - 50(a)(ii), Brazil;
     - the China lists (note 20) and 2024 increases (note 31);
     - Canada note 51 (Section 338);
     - Russia note 30;
     - the Section 232 notes that reach the chapter: 16 and 19 metals, 33 and 38 vehicles and parts, 36/37 wood, 39 semiconductors, and others.
     - Check `measures.json` for what the calculator models, and state exactly what applies, including to USMCA goods.
   - **Change log**, newest first, with official sources:
     - the IEEPA history and its end (2026-02-24);
     - Section 122 (2026-02-24 to 2026-07-23);
     - the 2026 Section 301 (60 economies);
     - Brazil 301;
     - Section 338;
     - any Section 232 actions on the chapter;
     - AD/CVD events.
   - **AD/CVD:** Commerce orders on the chapter's goods. Explain them in text with Federal Register citations, not in the grid.
   - **Duty-paid** stays `null`, with the note "Duty-collected figures aren't available from an official source yet."
   - **tariff-engineering:** agency rules with eCFR citations (`regulationsAsOf`), and real ways to lower duty, mapped to lines.
   - **FAQ:** 11–15 questions taken from real Google search suggestions; record the date.
   - **SEO:** keep the slug and the valuable live keywords, add real searches, and drop stale or wrong facts from the live pages. List what you dropped.
   - **Batch 3 updates.** The generator, data and engine have been fixed since batch 1. Don't add workarounds for these:

     - Matrix cells that depend on a confirmation fact get readable labels from the generator (e.g. "not a vehicle part / car or light-truck part", "informational materials / not informational materials", "quartz surface product over quota"). The validator now cross-checks them.
     - Labels are no longer truncated, every trade partner is mapped to a country, pending changes carry their notice date, and the SPI legend names every program.
     - Note 52(i) (the CAFTA-DR textile/apparel exemption, 9903.05.95) is now modelled. It applies when SPI P/P+ is claimed, but not on lines that are Free at the general rate (no printed P rate).
     - Informational-materials reliefs (9903.05.92 / .09) cover only the CBP list: chapter 49, 3704–3706, 5807, 8310, 9701–9705, 6307.90.30/.85, 8523.29/.41/.49, 8523.80.10 and 9405.61/.69.
     - Since #1838 the engine prices importer-answered base rates:

       - "% on the value of the X content" and "on the value of the rifle + … telescopic sight", via `componentValuesUsd`;
       - "The rate applicable to …" garment ensembles, sets, parts and accessories, and movements, via `referencedLines`;
       - the chapter 58 "See additional U.S. note" rates;
       - "Free, under bond".

       The generator writes these cells in the HTS wording. Explain them in prose: what the importer must provide, and how it's priced.

     - Agents found these programs and gave them separate pages, so match them: the quartz duty (9903.45.30/.31) is a Section 201 safeguard, not Section 232. The DR Congo is an AGOA beneficiary (Proclamation 10128).

4. **Compact and format** (your run.sh does this).

5. **Gates:**
   - `pnpm tariff:validate-chapters --file <file> --check-calculator --check-hts` must give 0 errors, 0 warnings and 0 mismatches. The one warning you may see, "not registered in chapter-prototype.ts", is fine; I register the chapter.
   - No TODO is left.
   - Every source URL resolves:
     - Check Federal Register URLs against the FR API `html_url`, because the site bot-walls scripts.
     - Check eCFR through its API.
     - usitc.gov JSON returning 403 to scripts is known.

## Report back (concise)

- File path and size.
- Gate results: cases compared, mismatches.
- Key facts.
- Source count.
- Anything unresolved.
- Code or data changes needed outside your file, with the file and a proposed diff.
- SEO keywords kept, dropped and added.

I ship each chapter as soon as its report arrives, so finish fully before reporting.
