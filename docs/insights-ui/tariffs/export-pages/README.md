# Export Pages of a Chapter Report

A chapter report has two halves. The **import** half (6 pages) covers what the U.S. charges on goods
coming in. The **export** half (5 pages) covers U.S. goods going out: what other countries charge on
them, and what the U.S. requires to ship them. Only chapters with meaningful U.S. exports get export
pages. Chapter 30 (pharmaceuticals) is the reference chapter.

This folder is the content spec: one file per page, saying what each section must contain, which JSON
field feeds it, and where the facts come from. Every chapter follows it, so the pages look and read
the same across chapters. Write chapter-specific facts in the JSON, never in the components.

| Page | URL | File | Spec |
| --- | --- | --- | --- |
| Overview | `/industry-tariff-report/exports/chapters/<slug>` | `overview.json` | [overview.md](overview.md) |
| Tariff updates | `…/<slug>/tariff-updates` | `tariff-updates.json` | [tariff-updates.md](tariff-updates.md) |
| Markets | `…/<slug>/markets` | `markets.json` | [markets.md](markets.md) |
| Export rules | `…/<slug>/rules` | `rules.json` | [rules.md](rules.md) |
| FAQ | `…/<slug>/faq` | `faq.json` | [faq.md](faq.md) |

Files live in `insights-ui/src/tariff-data/chapters/exports/<NN>-<slug>/`. Their shapes are in
`insights-ui/src/types/tariff-chapter-exports.ts`. They are registered in `EXPORTS_BY_SLUG`
(`src/utils/tariff-reports/chapter-exports.ts`).

## One job per page

Each fact has one home. Other pages link to it instead of repeating it.

| Fact | Its page | Others show |
| --- | --- | --- |
| Export values by year, buyer, product | Overview | — |
| A buyer's tariff by product group, and why | Markets | Overview: one short line per buyer |
| What changed since January 2025, and what is coming | Tariff updates | Header "Latest change" line |
| What the U.S. requires before export; ways to pay less abroad | Export rules | — |
| Short answers to real search questions | FAQ | — (answers link to the page with the detail) |

## How a chapter's export pages are built

1. **Import pages first.** The export generator reads the chapter's import content file
   (`src/tariff-data/chapters/<NN>-<slug>.json`) for the slug, title and product-group labels.
2. **Trade data:** `pnpm tariff:fetch-trade --chapter <N> --flow X --ytd` writes
   `src/tariff-data/trade/exports/chapter-NN.json` (UN Comtrade: U.S. exports by year, partner, heading,
   HS6 line, plus this year so far from monthly data).
3. **Library check:** the shared export library (`src/tariff-data/export-library/`) holds what is the
   same for every chapter. Before generating, make sure it is current for this chapter:
   - `foreign-measures.json`: every foreign tariff action on U.S. goods since January 2025, plus dated
     events ahead. For each action, record in `coverage["<N>"]` whether it reaches this chapter's goods
     (`yes` / `partly` / `no`). Actions on all U.S. goods set `allGoods: true` instead.
   - `markets.json`: each market's trade agreement with the U.S. and its trade.gov Country Commercial
     Guide. The generator lists any market missing from it.
   - `us-export-steps.json`: the steps every exporter takes, and the savings that apply to every chapter.
4. **Generate:** `pnpm tariff:generate-exports --chapter <N>` writes the five files with the data parts
   filled and `TODO` placeholders for everything a writer must research or write.
5. **Write:** fill every `TODO` following the page specs in this folder. Facts need an official source
   (see `../chapter-content-refresh.md` §1–2).
6. **Register** the chapter in `EXPORTS_BY_SLUG`, then validate:
   `pnpm tariff:validate-chapters --chapter <slug>`. It fails on any `TODO`, unknown source id, a past
   "What's coming" date, a FAQ link to a page that does not exist, and the other checks listed in
   `../chapter-content-refresh.md` §7.
7. `pnpm lint && pnpm prettier-check && pnpm compile`, PR, deploy, then flush
   `/industry-tariff-report/exports/chapters/<slug>` and `/<slug>/*` from CloudFront.

**Sitemap:** export pages are left out of `/industry-tariff-report/sitemap.xml` for now, while their
content is being finalized. When they are ready to be indexed, add them back in
`src/app/industry-tariff-report/sitemap.xml/route.ts`.

## Writing rules for every export page

- **Plain English.** Short sentences. Say what it means for a U.S. exporter, not just what the rule is.
- **Official sources only** for facts: foreign gazettes and ministries, WTO, U.S. agencies, eCFR,
  Federal Register. News only to find what to check. Each source has `published`; each fact has a date.
- **The buyer's point of view stays out.** VAT, local sales taxes and the buyer's import paperwork are
  the buyer's business. We cover the tariff the buyer's country charges on U.S. goods, the approval
  needed to sell there (named, with a link), and what the U.S. requires.
- **No repeated text across pages.** If a sentence fits two pages, it belongs on one and the other links.
- **Dates:** bump `page.lastCheckedAt` only on pages you actually re-checked.
