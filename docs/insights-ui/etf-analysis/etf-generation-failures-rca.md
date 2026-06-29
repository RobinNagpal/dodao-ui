# ETF Generation Failures — Root-Cause Analysis

Investigation into why ETF generation requests end up in the `Failed` state (or
silently never finish). This is an analysis document — no behavior was changed.
It records the failure mechanics so the fixes can be scoped and reviewed
separately.

## TL;DR

The ETF pipeline became **fire-and-forget in-process** by default in
[#1640](../../../) ("default stock + ETF report generation to in-process
background on AWS"). Combined with a pre-existing **5-minute stale-step guard**
that has **no way to abort the work it gives up on**, the result is a pipeline
where a *slow-but-successful* step poisons the whole request:

1. A step's LLM call runs longer than 5 minutes (grounded Gemini + up to 3
   attempts can easily exceed this).
2. On the next poll tick, the stale guard marks that step **and all of its
   dependents** (`FINAL_SUMMARY`) as `failed`, then moves on.
3. The original background task is never cancelled. It eventually **succeeds**
   and writes the report + adds the step to `completedSteps`.
4. The request now has the step in **both** `completedSteps` and `failedSteps`,
   `FINAL_SUMMARY` was force-failed, and `markEtfRequestAsCompleted` flags the
   whole request `Failed` because `failedSteps.length > 0` — even though every
   report was actually generated.

The lead fix is to stop treating "slow" as "failed" (add a real timeout/abort
to the in-process LLM call, and/or make the stale guard reconcile against work
that actually completed). Secondary issues below compound the problem.

## How generation is supposed to work

Entry point is the polling driver `src/scripts/etfs/wait-for-generation.ts`,
which calls `GET /api/{spaceId}/etfs-v1/generate-etf-v1-request` every
~20 seconds (`--tick`, min interval 5s).

```
wait-for-generation.ts  --(every ~20s)-->  GET generate-etf-v1-request
   route.ts: for each NotStarted/InProgress request → triggerEtfGenerationOfAReport()
       picks next pending step (etfDependencyBasedReportOrder)
       markEtfRequestAsInProgress  (sets inProgressStep + lastInvocationTime)
       callEtfLambdaForLLMResponse()
           USE_LAMBDA_FOR_LLM_RESPONSE=true  → POST to AWS Lambda (callback path)
           otherwise (DEFAULT)               → void processEtfReportLLMResponseInBackground()
                                               (fire-and-forget, returns immediately)

   processEtfReportLLMResponseInBackground()  (in-process)
       getLLMResponse()  (Gemini grounded, maxRetries:2 → up to 3 attempts)
       saveEtfReportAndAdvanceGeneration()
           save the report
           completedSteps += step; inProgressStep=null; lastInvocationTime=null
           triggerEtfGenerationOfAReport()  ← chains the NEXT step in-process
```

Key files:

- `src/app/api/[spaceId]/etfs-v1/generate-etf-v1-request/route.ts` — poll/tick handler
- `src/utils/etf-analysis-reports/etf-generation-report-utils.ts` — `triggerEtfGenerationOfAReport`, stale guard, dependency map
- `src/utils/etf-analysis-reports/etf-llm-lambda-utils.ts` — `callEtfLambdaForLLMResponse`, Lambda-vs-background switch
- `src/utils/etf-analysis-reports/background-etf-llm-generation-utils.ts` — in-process runner
- `src/utils/etf-analysis-reports/save-etf-report-callback-utils.ts` — `saveEtfReportAndAdvanceGeneration` (chains next step)
- `src/utils/etf-analysis-reports/save-etf-report-utils.ts` — per-report savers (factor-count guard)
- `src/util/get-llm-response.ts` — the LLM call core
- `src/utils/etf-analysis-reports/etf-report-status-utils.ts` — `markEtfRequest*`
- `src/utils/etf-analysis-reports/etf-report-steps-statuses.ts` — `calculateEtfPendingSteps`

A request is recorded `Failed` in exactly one place — `markEtfRequestAsCompleted`
(`etf-report-status-utils.ts:18-29`): status is `Failed` whenever
`failedSteps.length > 0`, otherwise `Completed`. So "why are requests failing"
reduces to "why do steps land in `failedSteps`", which has two sources: the
synchronous catch in `triggerEtfGenerationOfAReport` and the stale-step guard.

## Root cause #1 (primary) — stale-step guard treats "slow" as "failed", with no abort and a destructive cascade

`triggerEtfGenerationOfAReport` (`etf-generation-report-utils.ts:98-130`):

```ts
if (generationRequest.status === EtfGenerationRequestStatus.InProgress) {
  const inProgressStep = generationRequest.inProgressStep;
  const lastInvocationTime = generationRequest.lastInvocationTime;

  if (inProgressStep && lastInvocationTime) {
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - lastInvocationTime.getTime() < fiveMinutes) {
      console.log(`Waiting for ${inProgressStep} ... to finish...`);
      return;
    }

    const failedSteps = [...generationRequest.failedSteps];
    if (!failedSteps.includes(inProgressStep)) failedSteps.push(inProgressStep);

    // cascade: also fail anything that depends on the timed-out step
    Object.entries(etfReportDependencyMap).forEach(([reportType, dependencies]) => {
      if (dependencies.includes(inProgressStep as EtfReportType) && !failedSteps.includes(reportType as EtfReportType)) {
        failedSteps.push(reportType as EtfReportType);
      }
    });

    generationRequest = await prisma.etfGenerationRequest.update({ ... data: { failedSteps: [...new Set(failedSteps)], inProgressStep: null } });
  }
}
```

Why this fails in the in-process model:

- **5 minutes is too short for the actual work.** `getLLMResponse` runs
  `GEMINI_WITH_GROUNDING` as a two-step call (grounded search → structured
  conversion) with `maxRetries: 2` (up to **3 attempts**, see
  `background-etf-llm-generation-utils.ts:59` and `get-llm-response.ts:237`).
  Three grounded attempts routinely exceed five minutes. Under the old Lambda
  default this latency lived in the Lambda; moving to in-process (#1640) put it
  squarely inside the 5-minute window the poller measures.
- **No abort.** When the guard "fails" the step it only updates the DB row. The
  detached background promise keeps running (`void processEtfReport...`). There
  is no `AbortController`, no cancellation, nothing tying the DB decision to the
  running task. So the work the guard declared dead is still alive.
- **Destructive, irreversible cascade.** The guard force-adds `FINAL_SUMMARY`
  (the only dependent in `etfReportDependencyMap`, lines 25-30) to
  `failedSteps`. Because `calculateEtfPendingSteps` excludes anything in
  `failedSteps` *or* `completedSteps`, `FINAL_SUMMARY` is now permanently
  un-runnable for this request.
- **The orphan then "succeeds" into an inconsistent state.** When the slow task
  finishes, `saveEtfReportAndAdvanceGeneration`
  (`save-etf-report-callback-utils.ts:89-104`) appends the step to
  `completedSteps` and chains forward. The step is now in **both** arrays;
  `FINAL_SUMMARY` stays failed. Net result: all individual reports exist in the
  DB, but the request is marked `Failed`.

This is the most common "failure" signature: **the data is there, but the
request status is `Failed`** (often with `failedSteps` containing a category
step plus `FINAL_SUMMARY`).

## Root cause #2 — no timeout/abort anywhere on the LLM call

`getLLMResponse` (`get-llm-response.ts:225-336`) has retry logic but **no
timeout**. `structured.invoke(finalPrompt)` and the grounded calls can hang
indefinitely on a stalled connection. In the in-process model a hung call means:

- the step stays `InProgress` until the 5-minute guard reclaims it (root cause
  #1), and
- per the file's own caveat (`background-etf-llm-generation-utils.ts:43-45`), a
  redeploy/crash mid-run leaves the step `InProgress` with no live task to
  finish it — only the guard can move it, and it moves it to `failed`.

Without a bounded, abortable call there is no clean "this step genuinely failed
vs. is still working" signal — which is exactly what the guard needs to make a
correct decision.

## Root cause #3 — in-process chaining races the external poll tick (double-trigger)

Two things advance a request concurrently:

1. the background task chains the next step itself
   (`saveEtfReportAndAdvanceGeneration` → `triggerEtfGenerationOfAReport`), and
2. the poller calls `GET generate-etf-v1-request` every ~20s, which also calls
   `triggerEtfGenerationOfAReport` for every `InProgress` request.

Right after a step completes there is a window where `status = InProgress` but
`inProgressStep = null` / `lastInvocationTime = null` (set in
`save-etf-report-callback-utils.ts:95-102`). In that window the stale-guard
branch is skipped (its condition is `if (inProgressStep && lastInvocationTime)`),
so a poll tick proceeds straight to "pick next pending step and start it" — at
the same time the background chain is doing the same. The same step can be
launched **twice**, doubling LLM cost and creating overlapping
`markEtfRequestAsInProgress` / save races. There is no DB-level lock or
compare-and-set guarding the `NotStarted/InProgress → pick next` transition.

## Root cause #4 — failed dependencies do not block `FINAL_SUMMARY` on the non-guard path

The two failure paths handle dependents inconsistently:

- The **stale guard** cascades failure to `FINAL_SUMMARY` (root cause #1).
- The **synchronous catch** in `triggerEtfGenerationOfAReport:142-154` and the
  **background catch** in `background-etf-llm-generation-utils.ts:71-73` do
  **not**. They mark only the single step failed (or nothing, in the background
  case).

So if `RISK_ANALYSIS` fails via the catch path, `FINAL_SUMMARY` is still
pending, gets selected once the earlier steps settle, and runs against whatever
partial data exists. `prepareEtfFinalSummaryInputJson`
(`etf-report-input-json-utils.ts:536-557`) just reads whatever
`categoryAnalysisResults` / `analysisCategoryFactorResults` happen to be in the
DB — it has no completeness check — so the summary is generated from incomplete
inputs instead of being skipped. Dependency enforcement should be centralized in
`calculateEtfPendingSteps` (don't surface `FINAL_SUMMARY` as pending until its
dependencies are in `completedSteps`), not duplicated and divergent across three
catch sites.

## Root cause #5 — strict factor-count guard fails on normal LLM nondeterminism

`saveEtfFactorAnalysisResponse` (`save-etf-report-utils.ts:47-56`) throws if the
number of valid factors returned by the LLM doesn't *exactly* equal the expected
count for the fund's category:

```ts
if (validFactors.length !== expectedFactorCount) {
  throw new Error(`... expected ${expectedFactorCount} factor result(s) but got ${validFactors.length} ...`);
}
```

This is deliberate (don't persist an incomplete report), but it converts a very
common LLM behavior — dropping/renaming one factor key, or returning an extra
one — into a hard step failure. Each such failure then feeds root cause #1/#4.
Worth tracking how often steps fail here vs. on timeout; a one-off factor
mismatch may deserve a retry rather than an immediate fail.

## Root cause #6 — config-state hard failures (surface as instant step failures)

`callEtfLambdaForLLMResponse` throws before any LLM work when DB/config state is
incomplete, and these go straight into `failedSteps` via the synchronous catch:

- **No active prompt version** for the prompt key — `etf-llm-lambda-utils.ts:64-66`.
- **Empty `inputSchema`** on the prompt — `etf-llm-lambda-utils.ts:86-88` throws
  `"Input schema not found for ETF prompt"`. Any ETF prompt row whose
  `inputSchema` column is blank fails **every** generation of that report type,
  100% of the time.
- **Input validation failure** against the schema — `etf-llm-lambda-utils.ts:80-83`.
- **Schema file missing on disk** under `schemas/` — `loadSchema` throws
  (`etf-llm-lambda-utils.ts:78-79, 97-98`).

These are environment/data problems rather than logic bugs, but they present
identically ("request Failed") and should be the **first thing checked against
production data** when a *specific* report type fails consistently: query the
`Prompt` rows for the ETF keys and confirm `activePromptVersion`, `inputSchema`,
and `outputSchema` are all populated and that the referenced files exist.

## Suggested fix ordering (not implemented here)

1. **Make the LLM call bounded and abortable** (root cause #2): wrap
   `getLLMResponse` in a timeout/`AbortController`; on timeout mark the
   invocation `Failed` deterministically. This gives the guard a real signal.
2. **Stop the guard from failing live/successful work** (root cause #1): either
   raise the threshold above the realistic worst-case call time, or have the
   guard reconcile — if the step later lands in `completedSteps`, remove it (and
   its forced dependents) from `failedSteps`; only mark a request `Failed` for
   steps that are failed *and not* completed.
3. **Serialize step advancement** (root cause #3): a compare-and-set / row lock
   so only one actor transitions a request to the next `InProgress` step.
4. **Centralize dependency gating** in `calculateEtfPendingSteps` (root cause
   #4) so `FINAL_SUMMARY` is never started until its dependencies completed.
5. **Soften the factor-count guard** with a bounded retry before hard-failing
   (root cause #5).
6. **Add a config preflight / clearer error** for missing prompt version /
   input schema (root cause #6).

## How to confirm in production

- Look for requests where `status = Failed` but the per-report tables
  (`EtfCategoryAnalysisResult`, `EtfKeyFactsReport`, etc.) are fully populated,
  and where `failedSteps` overlaps `completedSteps` or contains
  `FINAL_SUMMARY` alongside a category step → signature of root cause #1.
- Check `PromptInvocation` durations for ETF prompts; any consistently >5 min
  confirms the guard is firing on slow-but-fine calls.
- For report types that fail 100% of the time, inspect the `Prompt` row's
  `inputSchema` / `activePromptVersion` (root cause #6).
</content>
</invoke>
