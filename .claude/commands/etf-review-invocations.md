# ETF Prompt Review - Skill 3: Review Analysis Invocations

Fetch the LLM prompt and response for each ETF's analysis invocation, then write a concise review (8-10 lines per ETF).

## Arguments
The user provides: `<category> <ETF1> <ETF2> ...` or just `<category>` if ETFs were already picked by Skill 1.

Categories map to prompt keys:
- `PerformanceAndReturns` -> `US/etfs/performance-returns`
- `CostEfficiencyAndTeam` -> `US/etfs/cost-efficiency-team`
- `RiskAnalysis` -> `US/etfs/risk-analysis`

User input: $ARGUMENTS

## Procedure

### Step 1: Get the prompt ID from the prompt key

Call the by-keys API to get the prompt ID:

```
GET https://koalagains.com/api/koala_gains/prompts/by-keys?keys=<PROMPT_KEY>
```

For example, if category is `CostEfficiencyAndTeam`:
```
GET https://koalagains.com/api/koala_gains/prompts/by-keys?keys=US/etfs/cost-efficiency-team
```

Extract the prompt `id` from the response: `response.prompts[0].id`

### Step 2: List recent invocations for this prompt

```
GET https://koalagains.com/api/koala_gains/prompts/<PROMPT_ID>/invocations
```

This returns the last 50 invocations sorted by updatedAt desc. Each invocation has:
- `id` - the invocation ID
- `inputJson` - contains `symbol` and `name` fields for the ETF
- `status` - should be "Completed"
- `outputJson` - the LLM response
- `promptRequestToLlm` - the exact prompt sent to the LLM (may be null in list, fetch detail for it)

### Step 3: Find invocations for the target ETFs

Match invocations to the 4 ETF symbols from Skill 1 (or from arguments). Parse `inputJson` to find `symbol` field.

For each matched ETF, if you need the full `promptRequestToLlm`, fetch the invocation detail:
```
GET https://koalagains.com/api/koala_gains/prompts/<PROMPT_ID>/invocations/<INVOCATION_ID>
```

### Step 4: Review each ETF's analysis

For each ETF, review the prompt sent to the LLM (`promptRequestToLlm`) and the response (`outputJson`).

Write a concise review (8-10 lines max per ETF) covering:
1. **What can we improve in the prompt?** - Missing data, wrong instructions, unclear guidance
2. **What are the good things?** - What the analysis got right
3. **What are the weaknesses?** - Misleading conclusions, missing context
4. **Are analysis factors relevant for this specific ETF?** - Do factors fit this asset class/strategy?
5. **Any other observations** - Tone, data gaps, formatting

### Step 5: Write the review document

Write the reviews to a single file:
```
docs/ai-knowledge/insights-ui/etf-prompt-improvement/<category>-review-<date>.md
```

Format:
```markdown
# ETF Prompt Review: <Category> — <Date>

## <SYMBOL> — <ETF Name> (<pick reason>)
<8-10 line review>

## <SYMBOL> — <ETF Name> (<pick reason>)
<8-10 line review>

...

## Cross-ETF Summary
<Key patterns and shared issues across all 4 ETFs>
```

### Step 6: Commit and push

Commit the review document and push to the current branch.
