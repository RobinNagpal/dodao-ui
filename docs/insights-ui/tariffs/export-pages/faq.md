# Export FAQ Page

**URL:** `/industry-tariff-report/exports/chapters/<slug>/faq` · **File:** `faq.json` ·
**Type:** `TariffExportFaqContent` · **Component:** `ChapterExportFaq.tsx` (reuses `ChapterFaqApproach2`)

**The question it answers:** The questions people actually search about exporting these goods, each
answered in a few sentences, with a link to the page that has the detail.

Same layout and FAQPage structured data (for Google rich results) as the import FAQ.

## Sections, in page order

| # | Section | Fields | Filled by |
| --- | --- | --- | --- |
| 1 | Intro (one sentence, plain text) | `intro` | Writer |
| 2 | In short (3 takeaways) | `keyTakeaways` | Writer |
| 3 | Frequently asked questions | `faqs`, `questionSource` | Writer |

### Finding the questions

Use real searches, not invented ones. Google search suggestions work well:
`https://suggestqueries.google.com/complete/search?client=firefox&q=<query>` for queries like
"<product> export tariff", "tariff on us <product> to china", "schedule b code for <product>",
"export license <product>", "do i need to file eei for <product>". Record what you used in
`questionSource`, and the matching suggestions in each FAQ's `searchedAs`.

Aim for 8–12 questions, covering each export page at least once:

- Tariffs abroad: "Does China tariff U.S. <product>?", "What tariff does the EU charge on U.S. <product>?" → Markets
- Changes: "Did <country> retaliate against U.S. <product>?", "When does <suspension> end?" → Tariff updates
- Rules: "What is the Schedule B code for <product>?", "Do I need an export license for <product>?" → Export rules
- Trade: "How much <product> does the U.S. export?", "Who buys the most U.S. <product>?" → Overview

### Answers

- Plain text (also emitted in the FAQPage JSON-LD), two to four sentences.
- Only restate facts already on the other export pages — same numbers, same dates. When a page changes,
  search `faq.json` for the old number.
- `link`: the export page with the detail — `exports`, `exports/tariff-updates`, `exports/markets`,
  `exports/rules` (the validator rejects anything else).

## Not on this page

- New facts. If an answer needs a fact that isn't on another page, add it to that page first.
