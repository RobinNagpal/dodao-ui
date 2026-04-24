You are analysing ETF {{symbol}} ({{name}}, {{exchange}}) against its closest peer ETFs for a retail investor who is choosing between this fund and one or two obvious alternatives.

Asset class: **{{assetClass}}**
Fund category: **{{category}}**
ETF group: **{{groupKey}}**
Tracked index (if known): **{{indexName}}**
Issuer: **{{issuer}}**

**No financial data is passed in with this prompt.** You must source facts about the target ETF and each peer from reputable public sources — issuer fund pages, prospectus/summary prospectus, Morningstar, etf.com, Nasdaq, NYSE/CBOE, the index provider, SEC filings. Keep sourcing light (one short attribution where it meaningfully changes a claim; do not paste long URLs).

**Reader profile.** Retail investor with `$1,000`–`$50,000` to allocate. Not a professional. Wants to understand "should I pick this ETF or one of these peers, and why?" Every paragraph must advance that decision. A number without a comparison point does not help them — "is that fee good?" and "is that tracking tight?" are the questions you must answer.

## Scope

- Compare the target ETF against its **closest genuine substitutes** — same or very-similar underlying index, same category, same broad exposure mechanics. **Not** just famous or popular peers. `SPY` is not a valid peer for a gold miners fund just because it is well known.
- Stay on the competitive dimension. Do NOT re-analyse strategy (→ Index & Strategy report), fees / managers in detail (→ Cost & Team report), drawdown severity (→ Risk Analysis report), or forward forecasts (→ Future Performance Outlook report). You can *reference* those angles at a sentence level, but the body of this report is about peer-vs-peer positioning.
- No price targets, no forecasts, no recommendations. The body is a description of how the target stacks up, not "this is the best in the category".
- Missing-field rule: if a fact is missing and you cannot source it quickly/confidently from a reputable public source, **do not mention it**. Never write "data not provided", "not available", "unavailable", "not disclosed", or any equivalent — simply leave the claim out.
- Every comparative claim must carry a numeric anchor (expense ratio in bps, AUM in `$B`, tracking difference in bps, 5Y CAGR gap in pp, etc.). Drop dramatic adjectives — "phenomenal", "staggering", "flawlessly", "extraordinary", "massive", "premier", "elite". Drop intensifier adverbs that do not change meaning — "entirely", "strictly", "totally", "utterly", "absolutely", "perfectly", "precisely", "massively". If removing the word leaves the sentence unchanged, remove it.
- Output is Markdown only. No raw HTML. Use blank lines between paragraphs.
- Do not repeat the same number across paragraphs. State it once, then build on it.

## Peer selection rules

Pick **4–6 peers** that are *genuinely substitutable* for the target.

- **Broad-index equity ETFs** (`broad-equity`, `sector-thematic-equity`): same index family first (e.g. `SPY` ↔ `VOO` ↔ `IVV`), then same category with a different provider, then close-but-tilted alternatives (value/growth/equal-weight variants of the same index).
- **Fixed income** (`fixed-income-core`, `fixed-income-credit`, `muni`): match on credit bucket (IG vs HY), duration bucket (short/intermediate/long), and tax-treatment (muni vs taxable) before anything else. A short-duration Treasury fund is not a peer for a long-duration corporate fund.
- **Leveraged / inverse / mandate-specific** (`leveraged-inverse`, covered-call/derivative-income, managed futures, commodity trusts, defined outcome): peer set is *other funds with the same leverage multiplier / same option overlay / same mandate structure*. An unlevered equivalent is not a peer — it is a comparison point used in the target's own analysis, not a substitute.
- **Allocation / target-date** (`allocation-target-date`): match on equity glidepath / target date / stated risk level, not just provider.
- Do NOT pad the list to hit "at least 6" with loose matches. 4 tight peers beats 6 loose peers.
- Each peer must be listed on one of: `BATS`, `NASDAQ`, `NYSE`, `NYSEARCA`. `companySymbol` must be in uppercase.

## 1. `overallAnalysisDetails` (3–4 paragraphs)

Three or four tight paragraphs. Aim for substance over length — do not pad. If three paragraphs fit the picture in ~300 words, stop there; do not stretch the section to fill space.

1. **What the target does and who its closest peers are.** Name the tracked index and the 4–6 peers you are comparing against, with each peer's ticker in parentheses. Give the target's AUM and expense ratio in context of the peer set — e.g. "`SPY` at `~9.45 bps` sits between `VOO` (`~3 bps`) and `SPLG` (`~2 bps`); AUM of `~$550B` dwarfs `IVV`'s `~$400B`." Explain in one line why this peer set, not a broader one. If the target is a mandate-specific fund (leveraged, covered-call, commodity), name the structural feature that defines the substitute set.
2. **Structural positioning against peers.** Cover tracking behaviour (tracking difference in bps for passive funds; benchmark / peer-median alpha for active), fee posture (in bps, not "low / high"), liquidity/AUM gap vs the nearest peer, and one structural differentiator per peer family — e.g. "`RSP` equal-weights the S&P 500 and therefore runs a materially different factor profile than `SPY`." Use percentage points for return gaps and basis points for fees and tracking. Label each relationship with the comparison labels in §3.
3. **Risk / return differentiation.** 3Y / 5Y / 10Y return and drawdown behaviour vs peers where available. For bond / muni / allocation ETFs, focus on duration-adjusted yield, credit-bucket match, and the `2022` / `2020` / `2008` drawdown prints. For leveraged / inverse / derivative-income funds, show how the compounding or option-overlay mechanics change the return profile vs the nearest peer (e.g. "over 5Y, `JEPI` trailed `SPY` by `~3.5 pp` CAGR but gave up ~half the max drawdown and paid monthly distributions at `~7%`"). One line if the dispersion inside the peer set is tight enough that the differences are noise — say so instead of manufacturing contrast.
4. **Who should pick which, and the takeaway.** Name which peer fits which retail use-case in plain English — "for a taxable account with a `10+` year horizon, `VOO` or `SPLG` edge `SPY` on fees"; "for short-term tactical hedging, `TQQQ` is a valid substitute for `QQQ` for days-to-weeks holds only"; "for income-first retail portfolios, `JEPQ` sits between `JEPI` and a plain Nasdaq-100 ETF — pick based on desired equity participation vs distribution rate". Close with one sentence framing the target's place inside the peer set: "Overall, `{{symbol}}` sits at the `<position>` end of its peer set because …".

## 2. Per-peer `competitionAnalysisArray` items

For each peer, produce an object with:

- `companyName` — full ETF name as the issuer brands it.
- `companySymbol` — uppercase ticker.
- `exchangeSymbol` — one of `BATS`, `NASDAQ`, `NYSE`, `NYSEARCA`.
- `exchangeName` — readable exchange name ("NASDAQ Global Select", "NYSE Arca", etc.).
- `detailedComparison` — **2–3 markdown paragraphs** describing how this peer compares with the target ETF. Cover: tracked index / mandate match, expense ratio in bps, AUM and liquidity (average daily volume if known), tracking difference or alpha vs the relevant benchmark, 3Y / 5Y return and drawdown gap in pp, and one crisp line on **who this peer fits better (or worse) than the target** and why. Every claim needs a number. If a claim can't be sourced with a number, drop it.

## 3. Comparison labels

Use these bands when labelling peer-vs-target relationships. Pick one set based on asset class.

Default (equities, alt strategies, allocation):
- `≥ 2 pp better` → **Strong**
- within `±2 pp` → **In Line**
- `≥ 2 pp worse` → **Weak**

Narrow thresholds (bonds, muni, and any dimension where the natural dispersion is tight):
- `≥ 0.5 pp better` → **Strong**
- within `±0.5 pp` → **In Line**
- `≥ 0.5 pp worse` → **Weak**

Fees are compared in basis points — `≥ 5 bps` cheaper is **Strong cheaper**, within `±5 bps` is **In Line**, `≥ 5 bps` more expensive is **Weak (fee drag)**.

## 4. Writing rules

- Markdown only. Wrap tickers, percentages, basis-point figures, AUM, and return numbers in backticks.
- Name the index. Name the peer group. Name the fund category. Never just write "its index" or "its peers" without the actual name.
- Every headline comparison has a **comparison point a retail reader actually sees** — the cheapest peer on fees, the most liquid peer on AUM, the S&P 500 for broad equity, a same-tenor T-bill for core bonds, a plain dividend-equity ETF for covered-call funds. "Is that fee good?" must be answered, not implied.
- Translate jargon on first use — "tracking difference" (how far fund return drifted from its index, in bps), "option overlay" (selling calls on the underlying to earn premia, giving up upside), "duration" (expected price loss per `1 pp` rate rise).
- Do not stack more than one peer per sentence when making a point. One peer, one number, one insight — then move on.
- The **per-peer `detailedComparison` verdict and the overall body must point the same direction.** If the body says the target is best-in-class on fees, do not rank a peer as "Strong cheaper" in its own card without reconciling the difference. If they disagree, rewrite one.

### Pre-emit checklist (run your draft against this before returning it)

- No raw HTML. Search for `<br`, `<p>`, `<div>`, `<table>` — if present, replace with blank lines / markdown.
- No missing-field phrases. Search for `not provided`, `not available`, `not disclosed`, `unavailable`, `omitted`, `data is missing` — if present, delete the sentence that contains them.
- No banned recommendation language: `best-in-class`, `top-tier`, `premier`, `elite`, `formidable`, `crushes`, `dominates`, `core holding`, `wealth-building`. Rewrite or remove.
- No banned dramatic adjectives / intensifier adverbs: `flawlessly`, `staggering`, `massive`, `extraordinary`, `phenomenal`, `incredible`, `astronomical`, `entirely`, `strictly`, `totally`, `utterly`, `absolutely`, `completely`, `perfectly`, `precisely`. Remove if the sentence survives without them.
- No repeated numbers. If the same figure appears in the overall body and again in a per-peer card, cite it once and rely on context the other time.
- `overallAnalysisDetails` is three or four paragraphs separated by blank lines — not a run-on block and not five+ mini-paragraphs.
- You named **who each peer fits** at least once somewhere in the output. If you couldn't tell the use-cases apart, the peers are too loose — tighten the peer set.
- Every comparison in the body and in each `detailedComparison` carries a **number a retail reader understands** (bps of fee, pp of return, `$B` of AUM, years of duration, or the name of a well-known comparison point like `SPY` / `AGG` / a T-bill).
- Every peer in `competitionAnalysisArray` is a **genuine substitute**, not a famous-but-unrelated fund. If you can't answer "would a reasonable retail investor consider picking this peer *instead of* the target?" with a yes, drop it.
