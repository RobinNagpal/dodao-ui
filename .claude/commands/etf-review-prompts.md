# ETF Prompt Review - Skill 2: Review ETF Analysis Prompts

## Goal
For a set of ETFs (from Skill 1 or specified manually), review the analysis prompt output quality
and write improvement documentation following the established format.

## Input
Either:
- Run `/project:etf-pick-and-fetch` first to get a list of ETFs, OR
- User provides specific ETF symbols to review

## Procedure

### Step 1: For each ETF, fetch the analysis data

Fetch the current analysis output:
```
GET https://koalagains.com/api/koala_gains/etfs-v1/exchange/<EXCHANGE>/<SYMBOL>/analysis
```

Also fetch the raw input data to compare:
```
GET https://koalagains.com/api/koala_gains/etfs-v1/exchange/<EXCHANGE>/<SYMBOL>/mor-info
```

If no analysis exists yet, note it and skip to the next ETF.

### Step 2: Review the analysis output

For each ETF's analysis, evaluate across ALL 3 categories (PerformanceAndReturns, CostEfficiencyAndTeam, RiskAnalysis):

#### Review criteria:
1. **What can we improve in the prompt?** - Missing instructions, unclear guidance, wrong thresholds
2. **What are the good things?** - What the analysis got right, where the prompt works well
3. **What are the weaknesses?** - Misleading conclusions, missing context, wrong framing
4. **Are analysis factors relevant for this specific ETF?** - Do the factors make sense for this asset class/strategy?
5. **Other observations** - Tone, formatting, data gaps, cross-cutting issues

#### Key things to check:
- Is yield/income data present and used for bond/income ETFs?
- Is price return vs total return properly distinguished?
- Are factor thresholds appropriate for this asset class (not one-size-fits-all)?
- Is percentile rank data utilized in the analysis?
- Is passive vs active fund distinction made?
- How are young funds handled (insufficient data vs Fail)?
- Is the benchmark identity resolved (not null/missing)?
- Is the output tone appropriate (not overly dramatic for index trackers)?
- Is the category code resolved to full name (not just "LB", "LV")?
- Are comparisons using the correct benchmark for this ETF's strategy?

### Step 3: Write per-ETF review docs

For each ETF reviewed, write a markdown file following this format:

```
docs/ai-knowledge/insights-ui/etf-prompt-improvement/<category>-<asset-class>-etf-<SYMBOL>.md
```

Example: `performance-and-returns-equity-etf-VOO.md`

Each file should follow this structure:
```markdown
# Prompt Improvement Analysis: <Category> -- <AssetClass> ETF (<SYMBOL>)

**ETF**: <Full Name> (<SYMBOL>)
**Category**: <PerformanceAndReturns | CostEfficiencyAndTeam | RiskAnalysis>
**Asset Class**: <e.g. Equity -- Large Blend (Passive Index Tracking)>
**Date**: <today>

---

## What This ETF Is
<1-2 sentences about the ETF, its AUM, what it tracks, key characteristics>

---

## What the Output Got Right
<Bullet points of what the analysis did well>

---

## Issue 1: <Title>
### What's wrong
<Description with specific data points from the analysis>
### What to fix
<Concrete prompt improvement suggestions>

---

## Issue 2: <Title>
...
```

### Step 4: Write cross-ETF summary

After reviewing all ETFs, write a summary file:
```
docs/ai-knowledge/insights-ui/etf-prompt-improvement/prompt-improvement-summary-all-etfs.md
```

Group findings by asset class (Bond, Equity, Income/Derivative, Commodity, etc.) and include a
"Cross-Cutting Issues" table at the end showing issues that affect multiple ETFs.

See the existing file at this path for the exact format to follow.

### Step 5: Commit and push

Commit the review docs and push to the current branch.
