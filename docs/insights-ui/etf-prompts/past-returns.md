You are analyzing ETF {{symbol}} ({{name}}, {{exchange}}) for a retail investor who wants a clear performance read before investing.

Analysis category: **{{categoryKey}}** (Past Performance)
ETF group: **{{groupKey}}** — fund category: **{{fundCategory}}**

This report covers only returns, consistency, benchmark/category comparison, momentum, and the risk context that explains the return pattern. Nothing else.

**Reader profile.** The reader has `$1,000`–`$50,000` to allocate, is choosing between this ETF and one or two obvious alternatives, and is not a professional. Every paragraph should advance their decision. A number without a comparison point does not help them — "is that return good?" is the question you must answer, not just "what is the return?". Translate technical terms on first use ("high yield" = below-investment-grade credit with real default risk, "duration" = expected loss per `1 pp` rate rise, "covered call" = giving up equity upside to earn an option premium, etc.) — one short parenthetical is enough.

## Scope

- Stay inside this category. Do NOT analyse strategy (→ Strategy report), fees / managers (→ Cost & Team report), or maximum-drawdown severity (→ Risk Analysis report).
- No forecasts, no price targets, no valuation calls. The summary is a description of what the numbers show, not a recommendation. Do not write "reliable core holding", "highly effective tool", "continues to be", "the fund is a … for investors who …", "delivers precisely on its mandate", "core wealth-building holding", or any variant that tells the reader what to do.
- Treat the data blocks as the latest snapshot. Never invent numbers.
- Missing-field rule: if a field/metric is missing, **do not mention it**. Never write "data not provided", "not available", "missing", "omitted", "not disclosed", "not listed", "technically not provided", "not in the data", "unavailable", or any equivalent — if a metric isn't there, simply leave it out. Use only what's present.
- Every claim must carry at least one numeric anchor from the input. Drop dramatic adjectives — not just "catastrophic", "abysmal", "undeniably", but also "astronomical", "phenomenal", "incredible", "staggering", "flawlessly", "extraordinary", "massive". Also drop intensifier adverbs that do not change the meaning of the sentence: "entirely", "strictly", "totally", "utterly", "absolutely", "completely", "perfectly", "precisely", "massively", "heavily", "deeply", "severely". If removing the word leaves the sentence unchanged in meaning, remove it.
- Do not repeat the same number in more than one paragraph. State it once, then build on it. A single metric cited in the summary, cited again in the overall analysis, and cited a third time in a factor block is three violations of this rule, not one.
- Output is Markdown only. Do not emit raw HTML tags like `<br>` — use blank lines between paragraphs.

## Factor-metric lookup (only when needed)

- If a factor asks for a metric that is not in the provided data blocks, first try to source that metric from reputable public sources (ETF issuer fund page/prospectus, etf.com, Nasdaq, CBOE, index provider, any other source).
- If you successfully find a metric, use it sparingly and attribute it inline (source name + as-of date if available). Do not paste long URLs; one short source mention is enough.
- If you cannot find it quickly or confidently, proceed using only provided data and omit that metric entirely (do not mention that it was unavailable).

## Data source priority (use when sources differ)

- `morReturns` → fund vs category vs index comparison.
- `stockAnalyzerReturns` → period returns, CAGR, YTD, and price-change fields.
- `stockAnalyzerTechnicals` → `MA20/50/150/200`, RSI daily/weekly/monthly, 52-week range, ATH / ATL.
- `financialSummary` → AUM, beta, volume, holdings count, yearHigh/yearLow.
- `morOverview` → category, style box, NAV, strategy text, and `indexName`.
- `yieldAndIncome` → dividend yield, SEC yield, TTM yield, dividend growth, dividend years. For income-first funds this is the headline.
- `fundContext` → expense ratio, inception date, style box (useful for young-fund handling and style/category mismatches).

Always name the actual index from `indexName` when referring to "the benchmark". Never just write "its index".

---

## 1. `overallSummary` (3–5 sentences)

State whether the performance profile is **Strong**, **Mixed**, or **Weak**. Include 3–5 decision-useful numbers (absolute + relative). End with one plain-English takeaway.

## 2. `overallAnalysisDetails` (4 paragraphs)

Four tight paragraphs is the target. Aim for substance over length — do not pad. If four
clean paragraphs fit the data in ~400 words, stop there; do not stretch the section just
to fill space.

1. **Recent returns snapshot.** `1M`, `3M`, `6M`, `YTD`, `1Y` picture. Is the ETF beating or lagging its category and its named index right now? Is momentum accelerating or cooling? One line on whether the latest move looks broad-based or just noise.
2. **Longer-term record and peer standing.** `3Y` / `5Y` / `10Y` returns and CAGR where available. Fund vs category vs index gaps in percentage points. Percentile-rank trend across years — cite the actual movement (e.g. `14 → 87 → 18`), not just "volatile". If the peer group is mostly active managers and the fund is passive, say so and adjust the tone (median among active managers is a Pass-grade outcome for a passive fund).
3. **Technical and momentum position.** Price vs `MA50` / `MA200`, `RSI` daily/weekly/monthly, distance from `52w high` / `52w low` / `ATH` / `ATL`. Label the current state: uptrend / downtrend / neutral; overbought / oversold / balanced. For bond, muni, and allocation ETFs where technicals are noise, keep this to 2–3 sentences and say explicitly that MA/RSI signals are thin in this asset class — do not force the analysis.
4. **Strengths, red flags, who this fits, and the takeaway.** 2–3 strengths, each backed by a number. 2–3 risks, each backed by a number when possible. Name the **worst-case drawdown a retail reader should brace for** — cite the fund's worst calendar year (or the 2022 loss for bond / muni / allocation funds, or the leverage-multiplier arithmetic for leveraged / inverse funds: "QQQ fell `-33%` in 2022 → TQQQ fell `-79%`"). Add **one explicit "who this fits" line** naming the retail use-case in plain English — for example: `core equity allocation`, `income-first portfolios at 5-10% weight`, `short-term tactical hedging only`, `portfolio diversifier at 5-10%`, `cash parking with slight duration upside`, `not a fit for buy-and-hold retail investors`. If the fund fits few or no retail use-cases, say so. Close with one sentence: "Overall, this ETF's performance profile looks strong / mixed / weak because …".

## 3. Pass / Fail rule

Pass/Fail logic for each factor lives in the factor JSON itself. Use the factor's `factorAnalysisDescription` (the generic measurement principle and Pass/Fail rule) together with `factorAnalysisGroupInstructions` (the group-specific perspective: right benchmark, right framing, right guardrail). Do not invent a separate Pass/Fail bar for this prompt — the JSON is authoritative.

Two cross-cutting reminders that apply on top of every factor:

- **Missing-data discipline**: if a factor's core metric is absent, first try the “Factor-metric lookup” section. If still unavailable, make a conservative call using the closest related evidence from the provided data blocks. Do not Fail a factor only because one secondary data point is missing.
- **Young funds (< 3 years)**: only judge on the periods actually available; don't Fail for missing long-window metrics.

## 4. For each item in `factorAnalysisArray` produce

- `factorAnalysisKey` — exact key from the input, unchanged.
- `oneLineExplanation` — one sentence with the clearest takeaway.
- `detailedExplanation` — one short paragraph. Use the metrics listed in `factorAnalysisMetrics` and any other strongly relevant input field. Every conclusion needs a numeric anchor. If the factor is a weak fit for this ETF, say so and judge on the closest relevant evidence rather than forcing a Fail.
- `result` — `"Pass"` or `"Fail"` per Section 3.

When the factor carries a `factorAnalysisGroupInstructions` string, treat it as the authoritative perspective rule for this ETF — it names the right benchmark / comparison frame for the fund's group (S&P 500 for US broad equity, the spot underlying for commodity / crypto wrappers, a 60/40 blend for allocation, a duration-matched bond index for IG fixed income, etc.). The generic `factorAnalysisDescription` defines what the factor measures; the group instructions define how to frame it for this specific group. If the two ever appear to conflict, follow the group instructions.

## 5. Comparison labels

Default (equities, alt strategies, allocation):
- `≥ 2 pp better` → **Strong**
- within `±2 pp` → **In Line**
- `≥ 2 pp worse` → **Weak**

Narrow thresholds (bonds, muni, and any factor whose description says so):
- `≥ 0.5 pp better` → **Strong**
- within `±0.5 pp` → **In Line**
- `≥ 0.5 pp worse` → **Weak**

For muni funds, also give a one-line **tax-equivalent-yield** framing — state the bracket you are assuming (e.g. `~32%` federal) — so the yield is comparable with taxable bond peers.

## 6. Writing rules

- Markdown. Wrap numbers, percentages, prices, RSI, moving averages, yields, and asset figures in backticks.
- Simple, direct English. No dramatic adjectives, no filler, no repetition.
- Name the index. Name the peer group. Name the fund category.
- Do not invent context beyond what the data supports. If a data point isn’t present (and you couldn’t source it via the lookup rule), omit it silently.
- **Every headline number needs a comparison point the retail reader actually sees** — inflation, cash / HYSA, a T-bill at the same tenor, the S&P 500, or the category average. "Is this return good?" must be answered, not implied.
- **Factor Pass/Fail verdicts must agree with the narrative verdict.** If the `overallSummary` says `Strong`, do not stack Fails on borderline factors ("price is `0.3%` below MA200" is not a Fail). If the factor list and the narrative disagree, the narrative is the one that decides whether the fund is a buy — rewrite the factor verdicts to match, or rewrite the narrative. A retail reader scanning a row of red `Fail` bullets under a "Strong" headline will walk away confused.
- **Translate beta / duration / RSI into practical terms.** `beta 1.17` → "expect ~17% amplification of market moves — a `-20%` S&P drop usually means this fund closer to `-23%`." `duration 6 years` → "expect roughly a `-6%` price hit per `1 pp` rise in rates." Bare metric quotes without translation add nothing a retail reader can act on.

### Pre-emit checklist (common slips — run your draft against this before returning it)

- No raw HTML. Search the draft for `<br`, `<p>`, `<div>`, `<table>` — if present, replace with blank lines / markdown.
- No missing-field phrases. Search for `not provided`, `technically not provided`, `not available`, `not disclosed`, `not listed`, `unavailable`, `omitted`, `data is missing` — if present, delete the sentence that contains them (do not rephrase — just drop the field).
- No banned recommendation language. Search for `reliable core`, `core holding`, `core wealth-building`, `highly effective`, `top-tier`, `premier`, `elite`, `formidable`, `crushes`, `dominates` — rewrite or remove.
- No banned dramatic adjectives / intensifier adverbs. Search for `flawlessly`, `staggering`, `massive`, `extraordinary`, `phenomenal`, `incredible`, `astronomical`, `abysmal`, `catastrophic`, `entirely`, `strictly`, `totally`, `utterly`, `absolutely`, `completely`, `perfectly`, `precisely`, `massively`, `heavily`, `deeply`, `severely`, `undeniably`, `definitively`, `structurally` (when it adds no meaning), `highly` (when it adds no meaning). Remove if the sentence survives without them.
- No repeated numbers. If the same figure (e.g. a 10Y CAGR) appears in the summary and again in the overall analysis and again in a factor block, cite it once and rely on context in the other two places.
- `overallAnalysisDetails` is four paragraphs separated by blank lines — not one run-on block and not five+ mini-paragraphs.
- You named **who this fund fits** in paragraph 4 (target retail use-case). If you can't name one, you wrote "most retail investors have no reason to hold this" explicitly.
- Every headline return / yield / drawdown has a **comparison point a retail reader understands** (cash / HYSA, same-tenor T-bill, S&P 500, category average, inflation). Pure figures in a vacuum should not survive the review.
- The **factor Pass/Fail list and the narrative verdict point the same direction.** If `overallSummary` says `Strong` / `Mandate-aligned` but the factor list stacks 2+ Fails on secondary factors (technicals, short-term momentum matching the asset class), downgrade those factor verdicts to Pass with a one-line caveat.
- If the fund matches one of the "tax-treatment flags" below, you added the one-line tax note in paragraph 4. If not, skip it.
- You translated **beta / duration / leverage multiplier** into practical terms at least once (not just the number).

## 7. Retail comparison points (fold into paragraph 1, 2, or 4 of `overallAnalysisDetails` — do not write a separate section)

Pick the comparison that matches the fund type. One well-placed comparison is enough; do not stack all of them.

- **Broad equity** (`broad-equity` group): name the benchmark index and say how the fund's tilt (large blend vs growth vs value, US vs foreign, etc.) changes expected return / volatility vs `SPY` or a plain total-market fund.
- **Sector / thematic equity** (`sector-thematic-equity`): compare the 5Y / 10Y return to the S&P 500 so the reader sees the sector-concentration premium or discount.
- **Daily-leveraged / inverse** (`leveraged-inverse`): the comparison is "vs not holding this at all." State explicitly that most retail investors should not hold these beyond a few trading days. Spell out the leverage-multiplier arithmetic in a drawdown (see §2.4).
- **Investment-grade fixed income — government, IG corporate, muni, TIPS, MMF** (`fixed-income-investment-grade`): compare the ETF yield to a same-tenor T-bill / Treasury and to a HYSA. Frame expected 5Y total return as roughly starting yield ± duration move. If the ETF yield is lower than cash, state that the reason to hold it is optionality (price rally if rates fall), not yield. For muni funds inside this group, also give the tax-equivalent yield at a stated federal bracket (`24%`, `32%`, `35%`) and compare to a same-tenor Treasury yield; for national muni, note that state-specific funds may yield more after state tax for CA / NY / NJ / MA / OH / MN residents.
- **Credit / high-yield / preferred / bank-loan / EM debt / convertibles / high-yield muni** (`fixed-income-credit-and-income`): compare yield to investment-grade corporate and to the broad-equity dividend yield. Translate "high yield" explicitly — below-investment-grade credit, real default risk — and name the worst-case credit drawdown (the fund's 2008 / 2020 / 2022 move).
- **Covered-call / defined-outcome / hedge-style strategy** (`derivative-income`): compare *net total return* (not headline yield) against the underlying equity index and a plain dividend-equity ETF. Flag that the distribution level can shrink when option premia contract (cite `divGrowth3y` / `divGrowth5y` if negative).
- **Commodity / precious-metals / digital-asset wrapper** (`commodities-and-digital-assets`): compare price return to a broad commodity basket (gold, broad commodities, spot BTC / ETH). Name the asset's role ("portfolio diversifier at `5-10%` weight, not a yield or growth engine"). For precious-metals *equity* funds (miners) the group is `sector-thematic-equity` — frame those against gold spot AND a small-cap equity index.
- **Allocation / target-date** (`allocation-target-date`): compare to the DIY equivalent the reader could build themselves (e.g. "`80% VTI + 20% BND`" for aggressive, "`30% VTI + 70% AGG`" for conservative). State clearly that the ETF's value-add is automatic rebalancing, not alpha.

## 8. Tax-treatment flags (one line in paragraph 4 of `overallAnalysisDetails`, only when applicable)

Skip this entirely when none apply. When one does, a single sentence is enough — do not lecture.

- **Commodity trusts (physical gold / silver / platinum structures)** → gains are taxed at the **collectibles rate (max `28%`)** in taxable accounts, not the regular long-term capital-gains rate.
- **Covered-call / derivative-income ETFs** → distributions are typically **ordinary income** and option premia are short-term — best held in a tax-advantaged account (`401(k)`, `IRA`).
- **Preferred-stock ETFs** → mix of qualified and ordinary distributions; less tax-efficient than common-stock dividend ETFs.
- **National muni funds** → federal-tax-exempt but generally **not state-exempt** for out-of-state issuers. A state-specific muni fund may be more efficient for CA / NY / NJ residents.
- **Daily-leveraged / inverse ETFs** → frequent cap-gain distributions from the swap-reset mechanism; tax-inefficient in taxable accounts.

---

### Factors to analyse

{{#each factorAnalysisArray}}
- **{{factorAnalysisTitle}}** (`{{factorAnalysisKey}}`)
  {{factorAnalysisDescription}}
  {{#if factorAnalysisGroupInstructions}}Group-specific perspective ({{../groupKey}}): {{factorAnalysisGroupInstructions}}
  {{/if}}Metrics: {{factorAnalysisMetrics}}
{{/each}}

### Data

- stockAnalyzerReturns: {{stockAnalyzerReturns}}
- stockAnalyzerTechnicals: {{stockAnalyzerTechnicals}}
- morReturns: {{morReturns}}
- morOverview: {{morOverview}}
- financialSummary: {{financialSummary}}
- yieldAndIncome: {{yieldAndIncome}}
- fundContext: {{fundContext}}
