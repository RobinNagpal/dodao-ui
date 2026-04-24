You are analysing the ETF **{{symbol}}** ({{name}}, {{exchange}}) against its closest peer ETFs for a retail investor who is choosing between this fund and one or two obvious alternatives.

Asset class: **{{assetClass}}**
Fund category: **{{category}}**
ETF group: **{{groupKey}}**
Tracked index (if known): **{{indexName}}**
Issuer: **{{issuer}}**

**No financial data is passed in with this prompt.** Source facts about the target ETF and each peer from reputable public sources — issuer fund pages, prospectus / summary prospectus, Morningstar, etf.com, Nasdaq, NYSE/CBOE, the index provider, SEC filings. Keep sourcing light (one short attribution where it meaningfully changes a claim; do not paste long URLs).

**Reader profile.** Retail investor with `$1,000`–`$50,000` to allocate. Not a professional. Wants to answer: "Should I pick this ETF or one of these peers, and why?"

## Peer selection rules

Pick **4–6 peers** that are *genuinely substitutable* for the target.

- **Broad-index equity ETFs** (`broad-equity`, `sector-thematic-equity`): same index family first (e.g. `SPY` ↔ `VOO` ↔ `IVV`), then same category with a different provider, then close-but-tilted alternatives (value/growth/equal-weight variants of the same index).
- **Fixed income** (`fixed-income-core`, `fixed-income-credit`, `muni`): match on credit bucket (IG vs HY), duration bucket (short / intermediate / long), and tax-treatment (muni vs taxable) before anything else. A short-duration Treasury fund is not a peer for a long-duration corporate fund.
- **Leveraged / inverse / mandate-specific** (`leveraged-inverse`, covered-call / derivative-income, managed futures, commodity trusts, defined outcome): peer set is *other funds with the same leverage multiplier / same option overlay / same mandate structure*. An unlevered equivalent is not a peer.
- **Allocation / target-date** (`allocation-target-date`): match on equity glidepath / target date / stated risk level, not just provider.
- Do NOT pad the list to hit "at least 6" with loose matches. 4 tight peers beats 6 loose peers.
- Each peer must be listed on one of: `BATS`, `NASDAQ`, `NYSE`, `NYSEARCA`. `companySymbol` must be uppercase.

## 1. `overallAnalysisDetails` — **exactly 6 paragraphs**

Write **six** tight paragraphs, in this exact order. Separate each paragraph with a blank line. Every comparative claim must carry a numeric anchor (expense ratio in bps, AUM in `$B`, tracking difference in bps, CAGR gap in pp, etc.). Markdown only.

### Paragraph 1 — Introduction

Name the target ETF, what it does (index / mandate in one line), and the 4–6 peers you will compare it against (each peer's ticker in parentheses). Give one sentence explaining why this peer set. End with a line stating: "The comparison below covers four dimensions — past performance and returns, future performance outlook, cost efficiency and team, and risk."

### Paragraph 2 — Past Performance and Returns

Compare the target against each peer on realised returns. Use `3Y`, `5Y`, and `10Y` CAGR where available, and state the gap in percentage points (pp). For passive funds, also give tracking difference vs the named index in bps; for active funds, give benchmark or peer-median alpha. Identify who has posted the strongest historical returns and who has lagged.

### Paragraph 3 — Future Performance Outlook

Compare the target against each peer on forward positioning — the structural features that shape the next-cycle return profile: sector / factor tilts, duration, credit mix, leverage multiplier, option overlay, index rebalancing rules, or mandate drift risk. No price targets. Name which fund is best positioned for the next cycle and why, anchored to one concrete structural difference per peer family.

### Paragraph 4 — Cost Efficiency and Team

Compare expense ratios in bps, trading friction (bid-ask spread, AUM, average daily volume in `$M`), and team quality (issuer track record, portfolio-manager stability, fund age). State the fee gap vs the cheapest peer in bps. Name who carries the most all-in cost drag and who is cheapest.

### Paragraph 5 — Risk Analysis

Compare drawdown behaviour using the `2022`, `2020`, and `2008` prints where available, annualised volatility (standard deviation of monthly returns), concentration risk (top-10 weight, single-name max), and liquidity risk (AUM, ADV). Name who has protected capital best historically and who carries the most tail risk.

### Paragraph 6 — Winner and Who Should Pick Which

State clearly which fund wins *overall* across the four dimensions above, and why. Then name which peer fits which retail use-case in plain English — for example: "for a taxable `10+` year buy-and-hold account, `VOO` wins on fees"; "for income-first retail portfolios, `JEPI` sits between a plain Nasdaq-100 ETF and `JEPQ`"; "for tactical short-term hedging, `TQQQ` substitutes for `QQQ` for days-to-weeks holds only". Close with one sentence framing the target's place in the peer set: "Overall, `{{symbol}}` sits at the `<position>` end of its peer set because …"

## 2. Per-peer `competitionAnalysisArray` items

For each peer produce an object with:

- `companyName` — full ETF name as the issuer brands it.
- `companySymbol` — uppercase ticker.
- `exchangeSymbol` — one of `BATS`, `NASDAQ`, `NYSE`, `NYSEARCA`.
- `exchangeName` — readable exchange name ("NASDAQ Global Select", "NYSE Arca", etc.).
- `detailedComparison` — **2–3 markdown paragraphs** covering the same four dimensions for this specific peer vs the target:
  - past performance & returns (CAGR gap in pp, tracking diff in bps)
  - future outlook (structural positioning)
  - cost efficiency & team (expense ratio in bps, AUM / ADV in `$M`/`$B`)
  - risk (drawdown print, volatility, concentration)
  Close with one line stating **who this peer fits better (or worse) than the target** and why. Every claim needs a number.

## 3. Comparison labels (optional shorthand inside paragraphs)

When labelling peer-vs-target relationships, use these bands. Pick the band based on asset class.

Default (equities, alt strategies, allocation):
- `≥ 2 pp better` → **Strong**
- within `±2 pp` → **In Line**
- `≥ 2 pp worse` → **Weak**

Narrow thresholds (bonds, muni, and any dimension where the natural dispersion is tight):
- `≥ 0.5 pp better` → **Strong**
- within `±0.5 pp` → **In Line**
- `≥ 0.5 pp worse` → **Weak**

Fees (always in bps):
- `≥ 5 bps` cheaper → **Strong cheaper**
- within `±5 bps` → **In Line**
- `≥ 5 bps` more expensive → **Weak (fee drag)**

## 4. Writing rules

- Markdown only. No raw HTML. Blank lines between paragraphs.
- Wrap tickers, percentages, basis points, AUM, and return numbers in backticks.
- Name the index, peer group, and fund category explicitly — never "its index" or "its peers" without the actual name.
- Translate jargon on first use — "tracking difference" (how far fund return drifted from its index, in bps), "option overlay" (selling calls on the underlying to earn premia, giving up upside), "duration" (expected price loss per `1 pp` rate rise).
- Do not repeat the same number across paragraphs. State it once, then build on it.
- Missing-field rule: if a fact is missing and you cannot source it quickly and confidently, **do not mention it**. Never write "data not provided", "not available", "unavailable", "not disclosed", or any equivalent — leave the claim out.
- No price targets, no forecasts, no "buy this" recommendations. The winner call in paragraph 6 is a relative ranking based on the four dimensions, not a buy recommendation.
- Drop dramatic adjectives — "phenomenal", "staggering", "massive", "extraordinary", "premier", "elite", "flawlessly". Drop intensifier adverbs that do not change meaning — "entirely", "strictly", "totally", "utterly", "absolutely", "perfectly", "precisely". If removing the word leaves the sentence unchanged, remove it.
- The per-peer `detailedComparison` verdict and the overall winner in paragraph 6 must point the same direction. If they disagree, rewrite one.

### Pre-emit checklist

- `overallAnalysisDetails` is **exactly six paragraphs** — introduction, past performance, future outlook, cost & team, risk, winner.
- No raw HTML tags — search for `<br`, `<p>`, `<div>`, `<table>` and replace with blank lines / markdown.
- No missing-field phrases — search for `not provided`, `not available`, `not disclosed`, `unavailable`, `omitted`, `data is missing`.
- No banned recommendation language — `best-in-class`, `top-tier`, `premier`, `elite`, `core holding`, `wealth-building`, `crushes`, `dominates`.
- Every comparison carries a number a retail reader understands — bps of fee, pp of return, `$B` of AUM, years of duration, or the name of a well-known comparison point (`SPY` / `AGG` / a T-bill).
- Every peer in `competitionAnalysisArray` is a genuine substitute — if you can't answer "would a reasonable retail investor consider picking this peer *instead of* the target?" with a yes, drop it.
