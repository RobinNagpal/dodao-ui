Use internet to validate the information and make sure to return the result based on the latest information.

You are analyzing the **management team** for a stock or REIT.
The goal is to help retail investors understand who is running the company, how aligned they are with long-term shareholder value, where the founders are now, and whether the management team has any past issues that should worry investors.

The stock is:
- Name: {{name}}
- Exchange: {{exchange}}
- Symbol: {{symbol}}
- Industry: {{industryKey}}
- Sub-industry: {{subIndustryKey}}

---

### Instructions:

1. Write a **summary** (~2 short paragraphs) suitable for the main ticker page. Cover:
    - Who is leading the company (CEO + 1–2 other key leaders).
    - How aligned management is with long-term shareholders (ownership %, comp structure, insider trading direction).
    - Any standout signal — founder-led, heavy insider buying, a known controversy, or a recent C-suite shakeup.
    - End with a one-sentence investor takeaway (e.g., "Investors get a founder-operator with meaningful skin in the game" or "Investors should weigh the recent CFO turnover and net insider selling before getting comfortable").

2. Write a **detailedAnalysis** (5–7 paragraphs). Cover the following in order:

    1. **Management Team Members.** Name the CEO, CFO, COO/President, and 1–2 other key executives. For each: title, joined the company in `<year>`, prior company / prior role (especially if they worked at a competitor or a famous-name firm), and one sentence on why they were brought in or what their mandate is. If the company is a REIT, also name the head of investments / acquisitions.

    2. **Founders — where are they now and why are they not on the management team?** Name every founder of the company. For each, state whether they are still active (CEO, executive chairman, board member, large shareholder) or have left. If a founder has left, explain **why** — sale of the company, retirement, ousted by the board, internal disagreement, moved on to a new venture, passed away, etc. — and cite the year. If a founder is still on the board but no longer in an operating role, say so. If the company spun out of or was acquired by a larger parent, name the parent and the year of the deal. If you cannot confirm a founder's whereabouts, say `unable to verify` rather than making up a fact. This paragraph is one of the most important parts of the report — be specific and cite sources inline as links where useful.

    3. **Ownership and Compensation Alignment.** What `%` of shares does management + the board own collectively, and what `%` does the CEO personally own? Is the CEO paid mostly in cash, options, RSUs, or performance-linked stock? Does the comp structure tie to long-term metrics (multi-year TSR, ROIC, EPS growth) or short-term ones (annual revenue, one-year EPS)? Compare CEO total compensation in `$` to peers in the same industry/sub-industry where possible. Flag any unusual provisions (mega-grants, single-trigger change-of-control, repriced options).

    4. **Insider Buying / Selling.** Summarize insider transactions over the last `12–24 months`. Net buying or net selling? Are large sales pre-scheduled `10b5-1` plans or opportunistic open-market trades? Call out the pattern, not every single transaction. Note which insiders are most active and whether the CEO/CFO have been adding or trimming.

    5. **Past Issues with the Management Team.** This is the second critical section. Cover, where they exist:
        - SEC investigations, restatements, or accounting issues tied to current or recent leadership.
        - Lawsuits, settlements, or regulatory actions involving named executives.
        - High-profile or abrupt departures (CFO leaving suddenly, CEO ousted, activist-driven turnover, CEO turnover within `<3 years` of IPO, etc.) and the reason given.
        - Public controversies — pay disputes, harassment claims, governance complaints, related-party transactions.
        - Failed prior roles (a CEO who ran a previous company into bankruptcy or was forced out elsewhere).
        If there are no known issues, state that clearly — do not invent issues to fill the section.

    6. **Track Record and Capital Allocation.** What has this team actually done with shareholder money? Buybacks at high or low prices? Acquisitions that worked or destroyed value (cite specific deals)? Dividend policy changes? Major strategic pivots (cite year and outcome)? Tie the answer back to whether the team has earned the right to be trusted with future capital.

    7. **Alignment Verdict.** Pull it together: does this team look like an `OWNER_OPERATOR` (founder or large insider with significant skin in the game), `STRONGLY_ALIGNED` (meaningful ownership and comp tied to long-term value, no flags), `ALIGNED` (standard alignment, no red flags), `WEAKLY_ALIGNED` (limited ownership or comp skewed toward short-term metrics), or `MISALIGNED` (heavy insider selling, weak ownership, short-term-focused incentives, or unresolved controversies). State the verdict and the 1–2 strongest reasons for it.

3. Set **alignmentVerdict** to one of: `OWNER_OPERATOR`, `STRONGLY_ALIGNED`, `ALIGNED`, `WEAKLY_ALIGNED`, `MISALIGNED`. The value must match the verdict you wrote in paragraph 7 of the detailed analysis.

#### For output content:
- Use markdown format for output.
- All amounts, dollar values, percentages, dates, and figures should be wrapped in backticks.
- Use simple words. Feel free to use technical terms (e.g., `RSU`, `10b5-1`, `proxy statement`) but explain them on first use.
- Be factual. Cite years, percentages, and dollar figures wherever possible.
- Do not invent founders, executives, lawsuits, or transactions. If you cannot confirm a fact from a reputable source (proxy / 10-K / DEF 14A, SEC filings, the company's IR site, established business press), say `unable to verify`.
- Do not be hagiographic; do not be a hatchet job. Investors want a clear-eyed read.
- Any references should be inline and included as links in the JSON itself.

return output in json
output schema:
type: object
additionalProperties: false
properties:
  summary:
    type: string
    description: '~2 paragraph summary suitable for the main ticker page. Cover who is leading the company, how aligned they are with long-term shareholder value, and any standout signals from compensation, insider transactions, or recent C-suite changes. End with a one-sentence investor takeaway.'
  detailedAnalysis:
    type: string
    description: '5–7 paragraphs covering: (1) the names, roles, and tenure of the key management team members; (2) where the founders are now and the reason they are not (or are) on the management team; (3) ownership stakes and compensation alignment; (4) recent insider buying/selling activity; (5) any past management issues, controversies, lawsuits, or high-profile departures; (6) leadership track record and capital allocation history; (7) overall alignment verdict and the reasoning behind it.'
  alignmentVerdict:
    type: string
    enum:
      - OWNER_OPERATOR
      - STRONGLY_ALIGNED
      - ALIGNED
      - WEAKLY_ALIGNED
      - MISALIGNED
required:
  - summary
  - detailedAnalysis
  - alignmentVerdict


---
## Saving the Result

Once you have produced the JSON object matching the output schema above, save it by
making the following HTTP request:

POST /api/koala_gains/tickers-v1/exchange/{{exchange}}/{{symbol}}/save-json-report

Request body (Content-Type: application/json):
{
  "reportType": "management-team",
  "llmResponse": <your complete JSON output>
}

How the fields map:
- "reportType"   → always "management-team" for this prompt (identifies which report is being saved)
- "llmResponse"  → the complete JSON object you generated, matching the output schema above

The server will validate "llmResponse" against the output schema before persisting it.
Do not modify the structure — send the exact JSON object your analysis produced.
---
