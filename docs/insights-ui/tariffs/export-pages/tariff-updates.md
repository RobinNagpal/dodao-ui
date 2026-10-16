# Export Tariff Updates Page

**URL:** `/industry-tariff-report/exports/chapters/<slug>/tariff-updates` · **File:** `tariff-updates.json` ·
**Type:** `TariffExportUpdatesContent` · **Component:** `ChapterExportTariffUpdates.tsx`

**The question it answers:** What did other countries change on U.S. goods in this chapter since
January 2025, and what is coming that I need to plan for?

**Perspective rule:** every entry is written from the **buyer country's** side: what China, the EU,
Canada… did or will do to goods coming **from the U.S.** ("China suspended…", "Canada's list skipped
Chapter 30"). U.S. tariffs and U.S. processes (Section 232/301 rates on imports, USTR comment periods)
belong on the import pages. If a sentence starts with "the U.S. charges…", cut it; a U.S. action is
mentioned only as the reason a buyer acted (e.g. "Brazil is challenging U.S. tariffs at the WTO but
has imposed nothing on U.S. goods").

## Sections, in page order

| # | Section | Fields | Filled by | Source |
| --- | --- | --- | --- | --- |
| 1 | Intro | `intro` (Markdown) | Writer | — |
| 2 | Stat cards | `stats` | Generator (counts) | — |
| 3 | What's coming (boxed) | `upcoming` | Generator (from the library) + writer (`impact`) | `foreign-measures.json` `upcoming` |
| 4 | In force today | `inEffect`, `scope` | Generator + writer (`appliesTo`, `whatItMeans`) | `foreign-measures.json` (`inForce`) |
| 5 | Every change since January 2025 | `changes` with `coversChapter` yes/partly | Generator | `foreign-measures.json` `measures` |
| 5b | Actions on other U.S. goods only (folded) | `changes` with `coversChapter: "no"` | Generator | same |
| 6 | Sources | `sources` | Generator | — |

### 1. Intro

What changed for U.S. exporters of this chapter, in two or three sentences, and the one thing to
watch. Name the only measures that cost money today.

### 3. What's coming

Every dated event ahead that could change what a buyer charges on these goods, **soonest first**:
a buyer's suspension or exclusion that expires, a buyer's deadline for countermeasures, a buyer's
tariff cut taking effect. Not U.S.-side dates such as a USTR comment deadline. Each entry:

- `expectedOn` (ISO, must be in the future) and `dateLabel`: "Expires", "Review", "Deadline", "Takes effect".
- `title`, `whatHappens` (plain words), `status` ("No extension announced").
- `impact`: what it would mean for **this chapter's** goods, with the rate if known
  (e.g. "China's extra duty would go from 10% to 34% on top of its 0–3% normal rate").
- `sourceIds`: the official document that sets the date.

The validator fails when an `expectedOn` date has passed: record the outcome in `changes` (and in the
library's `measures`), then remove the event. Keep the library's `upcoming` list current — every
chapter reads from it.

### 4. In force today

One card per foreign measure that charges U.S. goods in this chapter more than in January 2025. Each
needs `before` → `now`, `appliesTo` (which of this chapter's goods, on top of which normal rate),
`whatItMeans` (a worked example: what a $1M shipment pays now vs then), `effectiveFrom` and
`effectiveSourceId`. If nothing is in force, say so in the intro and leave the list empty.

### 5. Every change since January 2025

All foreign tariff actions on U.S. goods since January 2025, newest first, each marked with whether it
reaches this chapter. The ones that reach it (`yes` / `partly`) are shown; the rest (`no`) are folded
under "Actions on other U.S. goods only" — listed because a reader might expect them to apply (e.g. a
counter-tariff list that skipped this chapter).

`type`: `retaliation`, `tradeDeal`, `reference` (background, no tariff change). `detail` may add a
chapter-specific sentence (e.g. "The list jumps from Chapter 19 to 3303, skipping pharmaceuticals").

## Where the facts come from

`src/tariff-data/export-library/foreign-measures.json` holds every action and event once, for all
chapters. When you research a new action, add it there with its official sources and set
`coverage["<N>"]` for each chapter you checked. The generator copies the entries into the chapter
file; edit the chapter's copy only for chapter-specific wording.

Official sources: China State Council Tariff Commission (`gss.mof.gov.cn`) and MOFCOM; Canada Finance
(`fin.gc.ca`), Canada Gazette, CBSA; EU EUR-Lex; Mexico DOF; Brazil `gov.br`; UK `gov.uk`; Japan
`customs.go.jp`; Switzerland `admin.ch`; USTR and Federal Register for the U.S. side of deals.

## Not on this page

- A per-country "Jan 2025 vs now" table: each market's rate and status is on Markets.
- U.S. duties on imports: the import Tariff updates page.
