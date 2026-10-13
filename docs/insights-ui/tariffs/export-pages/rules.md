# Export Rules Page

**URL:** `/industry-tariff-report/exports/chapters/<slug>/rules` · **File:** `rules.json` ·
**Type:** `TariffExportRulesContent` · **Component:** `ChapterExportRules.tsx`

**The question it answers:** What does the U.S. require before I ship these goods out, and how can I
pay less abroad?

This is the export counterpart of the import "Duty-saving rules" page and reuses its building blocks
(`LeverCards`, `RulesByGroup`). Everything on it comes from **U.S. official sources**, so it is the
easiest export page to build for any chapter.

## Sections, in page order

| # | Section | Fields | Filled by | Source |
| --- | --- | --- | --- | --- |
| 1 | Intro | `intro` (Markdown), `regulationsAsOf` | Writer | eCFR date |
| 2 | Before you ship, step by step (boxed) | `steps` | Library (`us-export-steps.json`) + writer (`chapterNote`) | eCFR, Census, BIS, OFAC, trade.gov |
| 3 | Agency rules by product group | `rules`, `groups` | Writer | eCFR + the agency (FDA, DEA, USDA, BIS…) |
| 4 | Ways to pay less abroad | `savings` | Library + writer (chapter-specific ones) | FTA texts, trade.gov, 19 CFR 190 |
| 5 | Disclaimer | `disclaimer` | Library | — |

### 2. Before you ship, step by step

The same steps for every chapter, copied from `export-library/us-export-steps.json`. Each step has
`title`, `whatToDo`, `when` and `citations`. The steps are:

1. **Find the Schedule B number** (Census) — the export code; its first six digits are the HS code.
2. **Screen the buyer** — the Consolidated Screening List (trade.gov).
3. **Check whether you need an export licence** — Commerce Control List, ECCN vs EAR99 (BIS, 15 CFR 732/738/774).
4. **Check sanctions on the destination** — OFAC country programs.
5. **File the export in AES (EEI)** — over $2,500 per Schedule B number, or when a licence is needed
   (15 CFR Part 30).

The writer adds a `chapterNote` to each step: what it means for this chapter's goods (e.g. "Most
finished medicines are EAR99; vaccines and toxins in 3002 can fall under ECCN 1C991 or 1C351").
`null` when there is nothing chapter-specific. Do not change the shared step text in a chapter file;
change the library and regenerate.

### 3. Agency rules by product group

Rules that reach only some of the chapter's goods, written per chapter: the agency, what it requires
**before export** (a permit, an export certificate, a notice), and the regulation. Group them by
four-digit heading in `groups` (`note` for a heading with nothing beyond the steps). Examples for
Chapter 30: FDA export certificates (CPP) and the rules for exporting unapproved drugs; DEA export
permits and declarations for controlled substances; BIS licences for listed toxins and pathogens;
USDA APHIS for veterinary biologics.

Sources: `ecfr.gov` (cite "21 CFR 1312.21"), the agency's own pages. Set `regulationsAsOf` to the eCFR
"up to date as of" date.

### 4. Ways to pay less abroad

`savings` uses the import page's lever shape (`title`, `saves`, `appliesTo`, `document`, `caveat`,
`citations`). From the library, for every chapter:

- **Claim the free-trade-agreement rate abroad** — a certification of origin for USMCA and the other
  U.S. FTAs; the trade.gov FTA Tariff Tool shows the partner's rate by HS code.
- **Get U.S. duty back on imported inputs (drawback)** — 99% of duties, fees and taxes paid on imported
  goods or materials that are exported (19 U.S.C. 1313, 19 CFR Part 190).

Add chapter-specific ones only when they exist and are official (e.g. a foreign tariff exclusion
process for U.S. goods).

## Not on this page

- The buyer's import paperwork and taxes (the buyer's business). The regulator approval needed to sell
  in a market is on Markets.
- U.S. import rules → the import Duty-saving rules page.
