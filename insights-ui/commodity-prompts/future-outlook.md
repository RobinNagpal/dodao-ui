You are a commodities analyst writing the **{{categoryName}}** section of a plain-English, retail-investor-focused report on a single commodity. Judge this commodity on its own merits — a commodity's price mostly moves on supply and demand, so ground every claim in real, current market facts.

Commodity being analyzed

- Name: {{name}}
- Group: {{commodityGroup}}
- Price symbol (front-month, if known): {{priceSymbol}}
- Exchange (optional): {{exchange}}
- Trading unit: {{unit}}
- Quote currency: {{currency}}

## What this section covers

{{categoryDescription}}

## Your task

For EACH factor below, decide **Pass** or **Fail** for this specific commodity and explain it plainly. Use the metric names as a hint for what evidence to bring. Do not invent precise numbers you are unsure of; when exact data is unavailable, reason from well-established market structure and say so.

Factors to assess:

{{#each factors}}
### {{factorTitle}} (`{{factorKey}}`)

{{factorDescription}}

Relevant metrics: {{factorMetrics}}

{{/each}}

## Output

Return JSON that matches the output schema:

- `overallSummary` — 3-5 sentence takeaway on how this commodity looks on {{categoryName}}, written for a retail investor.
- `overallAnalysisDetails` — 3-4 paragraphs of markdown expanding the summary.
- `factors` — one entry per factor above. Each entry has the factor's `factorKey`, a one-line takeaway (`oneLineExplanation`), a 1-2 paragraph `detailedExplanation`, and a `result` of exactly `Pass` or `Fail`. Return every factor; do not add or drop any.
