# REQ-001 — Stock Custom Reports ("Random Reports") for V1 Tickers

> Author: Robin Nagpal · Status: Draft · Branch: `stock-random-reports` · Date: 2026-04-19

## 1. Goal

Today every report attached to a `TickerV1` row is a **predefined, fixed-shape category report** (Business & Moat, Financial Statement Analysis, Past Performance, Future Growth, Fair Value, Vs Competition, Future Risk, Investor Analysis, Final Summary). The set of report types is hardcoded in the `TickerAnalysisCategory` enum and in the `TickerV1GenerationRequest` regenerate-flags.

We need to allow the user (or a curator) to attach **arbitrary, free-form investigation reports** to a ticker — e.g.

- "Why exactly did Beta Farms (BYRN) stock drop in Q1 2026, and is it likely to drop further?"
- "Is the recent insider selling at <ticker> a red flag?"
- "How exposed is <ticker> to a 50% tariff on Chinese imports?"

We are calling these **Custom Reports** (the user has been calling them "random reports"; the docs will use *Custom Reports* as the formal name and treat *random* as a colloquial synonym). Each ticker can have **0..N** Custom Reports, each of which is essentially `(question, answer, metadata)` linked back to a `TickerV1`.

## 2. Non-goals (for v1)

- No multi-turn chat (one-shot prompt → one-shot answer; regeneration replaces the report).
- No cross-ticker reports (a Custom Report is always scoped to exactly one ticker; cross-ticker comes later if useful).
- No public sharing / visibility controls beyond what `spaceId` already provides.
- No editor-style WYSIWYG; LLM output is rendered as markdown.
- We are not extending the existing `TickerV1GenerationRequest` to host this. That model is a hardcoded set of boolean flags for the fixed categories — generalizing it would be a worse fit than a clean new model. See §10.

## 3. Existing architecture we will build on

| Concern | Existing piece | File |
| --- | --- | --- |
| Ticker root entity | `TickerV1` (table `tickers_v1`) | `insights-ui/prisma/schema.prisma:506` |
| Predefined categories | `TickerAnalysisCategory` enum | `insights-ui/prisma/schema.prisma:461` |
| Versioned prompt template | `Prompt` + `PromptVersion` | `insights-ui/prisma/schema.prisma:340`, `:367` |
| Single LLM execution record | `PromptInvocation` (status, input/output JSON, model, error) | `insights-ui/prisma/schema.prisma:396` |
| Helper that runs a prompt end-to-end | `getLLMResponseForPromptViaInvocation` | `insights-ui/src/util/get-llm-response.ts` |
| Existing per-report API pattern | `POST /api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/<report>` (e.g. `future-risk`) | `insights-ui/src/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/future-risk/route.ts` |
| Async batch regeneration | `TickerV1GenerationRequest` with per-section booleans | `insights-ui/prisma/schema.prisma:765` |
| V1 stock detail page (where we surface the new tab) | `app/stocks/[exchange]/[ticker]/page.tsx` | `insights-ui/src/app/stocks/[exchange]/[ticker]/page.tsx` |

The two pieces we will lean on hardest are **`PromptInvocation`** (we get versioning, status, model id, error capture, raw I/O for free) and the **`POST .../exchange/[exchange]/[ticker]/<report>`** route convention (so the new endpoints feel native to the rest of the V1 surface).

## 4. Terminology

- **Custom Report** — one user-initiated, free-form investigation attached to one ticker. Persistent.
- **Custom Report Template** *(optional, see §6.2)* — a curated pre-written prompt (e.g. "Explain a recent stock drop") the user can pick instead of writing a full prompt from scratch. Optional in v1.
- **Custom Report Run** — a single LLM invocation that produced (or is producing) the answer for a Custom Report. Backed by `PromptInvocation`. Regenerating a Custom Report creates a new Run; the latest completed Run is what the UI shows.

## 5. Data model changes

### 5.1 New table: `ticker_v1_custom_reports`

```prisma
enum TickerV1CustomReportStatus {
  NotStarted
  InProgress
  Completed
  Failed
}

model TickerV1CustomReport {
  id        String @id @default(uuid())
  tickerId  String @map("ticker_id")
  spaceId   String @default("koala_gains") @map("space_id")

  // What the user asked
  title         String  @map("title")              // short label for the listing UI
  userQuestion  String  @map("user_question")      // the actual prompt body (markdown allowed)
  templateKey   String? @map("template_key")       // null => fully free-form, else a curated template key (see §6.2)

  // Latest answer (denormalized for cheap reads on the ticker page)
  latestAnswerMarkdown String?                     @map("latest_answer_markdown")
  latestAnswerJson     Json?                       @map("latest_answer_json") @db.JsonB
  latestSources        Json?                       @map("latest_sources") @db.JsonB
  latestRunId          String?                     @map("latest_run_id")
  latestRun            TickerV1CustomReportRun?    @relation("LatestRun", fields: [latestRunId], references: [id])

  status    TickerV1CustomReportStatus @default(NotStarted) @map("status")
  archived  Boolean  @default(false) @map("archived")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  createdBy String?  @map("created_by")
  updatedBy String?  @map("updated_by")

  ticker TickerV1                  @relation(fields: [tickerId], references: [id], onDelete: Cascade)
  runs   TickerV1CustomReportRun[] @relation("ReportRuns")

  @@index([tickerId])
  @@index([spaceId, tickerId])
  @@index([spaceId, tickerId, archived])
  @@map("ticker_v1_custom_reports")
}
```

### 5.2 New table: `ticker_v1_custom_report_runs`

One row per LLM invocation. We keep history so the user can compare answers over time (e.g. "what did we think about this dip last week vs. now?").

```prisma
model TickerV1CustomReportRun {
  id                String                       @id @default(uuid())
  customReportId    String                       @map("custom_report_id")
  spaceId           String                       @default("koala_gains") @map("space_id")
  promptInvocationId String?                     @unique @map("prompt_invocation_id")

  status            TickerV1CustomReportStatus   @map("status")
  answerMarkdown    String?                      @map("answer_markdown")
  answerJson        Json?                        @map("answer_json") @db.JsonB
  sources           Json?                        @map("sources") @db.JsonB
  llmProvider       String?                      @map("llm_provider")
  llmModel          String?                      @map("llm_model")
  errorMessage      String?                      @map("error_message")

  startedAt   DateTime? @map("started_at")
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  createdBy   String?   @map("created_by")

  customReport       TickerV1CustomReport      @relation("ReportRuns", fields: [customReportId], references: [id], onDelete: Cascade)
  latestForReport    TickerV1CustomReport?     @relation("LatestRun")
  promptInvocation   PromptInvocation?         @relation(fields: [promptInvocationId], references: [id])

  @@index([customReportId])
  @@index([spaceId, customReportId, status])
  @@map("ticker_v1_custom_report_runs")
}
```

### 5.3 Touching `TickerV1`

Add a backref so a ticker page can `include` its custom reports:

```prisma
model TickerV1 {
  // ...existing fields...
  customReports TickerV1CustomReport[]
}
```

### 5.4 Optional: curated templates table

If we ship template support in v1 (recommended — see §6.2), add a small lookup table:

```prisma
model TickerV1CustomReportTemplate {
  id           String   @id @default(uuid())
  spaceId      String   @default("koala_gains") @map("space_id")
  templateKey  String   @map("template_key")
  title        String   @map("title")              // "Explain a recent stock drop"
  description  String   @map("description")
  promptBody   String   @map("prompt_body")        // template with {{ticker}} / {{symbol}} / {{recentNews}} placeholders
  archived     Boolean  @default(false) @map("archived")

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@unique([spaceId, templateKey])
  @@map("ticker_v1_custom_report_templates")
}
```

We deliberately do **not** reuse the existing `Prompt` / `PromptVersion` tables for templates because those are for *system-defined* prompts that ship with the app. Custom-Report templates are user-curated content that should be editable in the admin UI without bumping a `Prompt` version.

### 5.5 Migration

Standard `prisma migrate dev --name add_ticker_v1_custom_reports`. No backfill required.

## 6. API surface

### 6.1 Routes

All under the existing namespace pattern:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET`  | `/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/custom-reports` | List Custom Reports (latest answer summary) for a ticker. |
| `POST` | `/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/custom-reports` | Create a new Custom Report and kick off the first Run. |
| `GET`  | `/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/custom-reports/[reportId]` | Full report incl. all Runs. |
| `POST` | `/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/custom-reports/[reportId]/regenerate` | Spawn a new Run; updates `latestRunId` on success. |
| `PATCH`| `/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/custom-reports/[reportId]` | Edit title / archive flag. |
| `GET`  | `/api/[spaceId]/tickers-v1/custom-report-templates` | List curated templates (admin and report-creation modal). |

Each handler follows the existing convention seen in `future-risk/route.ts:9` — thin controller, work delegated to a util in `src/utils/analysis-reports/` (new file: `custom-report-utils.ts`).

### 6.2 Prompt building

Two creation modes:

1. **Free-form**: user types the question verbatim. We wrap it in a fixed system prompt that includes:
   - Ticker symbol, name, exchange, industry, sub-industry.
   - Cached financial info (`TickerV1FinancialInfo`).
   - Latest summary (`TickerV1.summary`, `aboutReport`).
   - Recent price action snippet (last 30d from `TickerV1PriceHistory`).
   - The user's question.
2. **Templated**: user picks a `TickerV1CustomReportTemplate`. We substitute placeholders (`{{symbol}}`, `{{name}}`, `{{recentNewsBlock}}`, `{{priceMove30d}}`) before sending to the LLM.

In both cases the LLM call goes through `getLLMResponseForPromptViaInvocation`, but with `promptKey: 'US/public-equities-v1/custom-report'` (a single, generic system prompt registered in `Prompt`). The `inputJson` carries everything — the ticker context **and** the user's question / chosen template — so we still get full prompt-versioning and `PromptInvocation` history for free.

### 6.3 Response shape

We ask the LLM to return both:

- `answerMarkdown` — long-form answer suitable for direct rendering on the report page.
- `answerJson` with structured fields:
  ```ts
  {
    summary: string;                    // 1-2 paragraph TL;DR for the listing card
    keyPoints: string[];                // bullet TL;DR
    verdict?: 'Bullish' | 'Bearish' | 'Neutral';
    confidence?: 'Low' | 'Medium' | 'High';
    sources?: { title: string; url: string }[];
  }
  ```

The split lets the listing UI show a tight card (summary + verdict pill) and the detail page show the full markdown.

## 7. UI changes

### 7.1 V1 stock detail page

`insights-ui/src/app/stocks/[exchange]/[ticker]/page.tsx` currently renders fixed sections in a long scroll (categories → competition → investors → similar). Add a **new section** below the predefined ones titled **"Custom Reports"**, structured as:

- Header row with `[+ New Report]` button.
- Grid of cards, one per `TickerV1CustomReport` (showing `title`, `latestAnswerJson.summary`, `verdict` pill, `updatedAt`).
- Empty state when none exist: a single CTA card explaining the feature with the Beta Farms example.

Each card links to a new sub-page:

### 7.2 New sub-page

`insights-ui/src/app/stocks/[exchange]/[ticker]/custom-reports/[reportId]/page.tsx` — full markdown render of `latestAnswerMarkdown`, sources list, "Regenerate" button (only if user has permission), and a collapsed history panel showing prior Runs.

### 7.3 New report modal

A modal launched from the section header with two tabs:

- **From template** — dropdown of `TickerV1CustomReportTemplate` rows, with a preview of the substituted prompt.
- **Free-form** — title input + question textarea.

Submit posts to `POST .../custom-reports`. Optimistically show the report card with status `InProgress`, then poll/refresh until `Completed` (similar to how `TickerV1GenerationRequest` is polled today).

### 7.4 Listing inside admin

Reuse the existing admin tooling layout under `app/admin/...` (or wherever curated templates live) to add a CRUD page for `TickerV1CustomReportTemplate`.

## 8. Generation flow (end-to-end)

1. User submits "Why did Beta Farms drop?" via the modal.
2. API handler:
   1. Loads the ticker via `fetchTickerRecordBySymbolAndExchangeWithIndustryAndSubIndustry` (existing util).
   2. Inserts a `TickerV1CustomReport` row with `status='NotStarted'`.
   3. Inserts a `TickerV1CustomReportRun` with `status='InProgress'`.
   4. Returns `201 { reportId, runId }` immediately.
3. A background task (Next.js route handler `await`s it directly for v1; queue later — see §10) calls `getLLMResponseForPromptViaInvocation`.
4. On success: update the Run with `answerMarkdown` / `answerJson` / `promptInvocationId` and flip status to `Completed`. Update the Custom Report's `latestRunId`, `latestAnswer*` fields, and status.
5. On failure: store `errorMessage`, mark Run `Failed`, leave the Custom Report at its prior state if a previous successful Run exists, else mark it `Failed`.

For v1 we run the LLM call **synchronously inside the POST handler** (matches how `future-risk/route.ts` does it). This is fine for one-off reports where the user is actively waiting. We move to a queued model later if (a) report generation is multi-step, or (b) we want to spawn many Custom Reports in bulk.

## 9. Permissions, quotas, abuse

- **Auth**: Custom Reports are space-scoped via `spaceId`. Reuse the existing space membership check used by the other V1 POST endpoints.
- **Per-user quota**: cap N Custom Reports per ticker per user per day (config-driven). Enforce in the create handler before opening the LLM invocation.
- **Cost guardrails**: the system prompt should hard-cap output length and forbid the LLM from running tools that fan out (no recursive web research in v1).
- **Visibility**: any space member can see all Custom Reports for the ticker; only the creator (or admin) can edit/archive. No row-level deletion in v1 — archive only.

## 10. Why we are NOT extending `TickerV1GenerationRequest`

`TickerV1GenerationRequest` (`schema.prisma:765`) is a fixed shape: one boolean column per predefined section (`regenerateBusinessAndMoat`, `regenerateFutureRisk`, ...). It works because the set of sections is closed. Custom Reports are open-ended, identified by a per-row id, can have N runs, and need their own status independent of the batch-regeneration workflow. Bolting them onto `TickerV1GenerationRequest` would require:

- a new `customReportIds: String[]` column (orthogonal to all existing flags),
- duplicate status/step tracking per id,
- coupling user-driven one-off reports to the nightly batch regen pipeline.

A separate `TickerV1CustomReport(+Run)` pair is cleaner and lets the batch regen system stay focused on the canonical sections.

## 11. Open questions

1. **Streaming UX**: do we want to stream the LLM answer into the UI (SSE) for v1, or just spinner-then-render? Recommendation: spinner-then-render for v1; streaming is a follow-up.
2. **Citations**: do we expect the model to cite real sources (web search tool) or just synthesize from the input context? v1 = synthesize only. Web-search citations need a separate design.
3. **Free-form vs. templated only**: should v1 ship free-form at all, or templates only (safer / cheaper)? Recommendation: ship both, but mark free-form as "beta" and put it behind a feature flag so we can disable it cheaply if quality is bad.
4. **Cross-ticker comparison reports** (e.g. "Compare BYRN vs ABC"): explicitly out of scope here; will need its own model with `tickerIds: String[]`.
5. **Reuse of `AnalysisTemplate*` family**: those tables (`AnalysisTemplate`, `AnalysisTemplateReport`, etc.) look adjacent but are designed for multi-parameter, multi-step workflows attached to an Analysis Template, not to a ticker. For a single-shot, single-question Custom Report on a ticker, the new dedicated tables are simpler. If Custom Reports later grow into multi-step "investigations", revisit and consider unifying.

## 12. Phased rollout

| Phase | Scope | Ships |
| --- | --- | --- |
| **P0** | Schema + migration + admin curated-template CRUD. No user-facing UI yet. | Backend ready. |
| **P1** | List + detail page + create-from-template modal on the V1 ticker page. | Curated reports usable. |
| **P2** | Free-form prompt option behind a feature flag. Per-user quota. | Power users can ask anything. |
| **P3** | Streaming answers, web-search citations, history diff view. | Nice-to-have polish. |

## 13. Concrete file checklist (when we implement)

- `insights-ui/prisma/schema.prisma` — add 2 (or 3) models + enum + `TickerV1.customReports` backref.
- `insights-ui/prisma/migrations/<ts>_add_ticker_v1_custom_reports/` — generated.
- `insights-ui/src/types/ticker-typesv1.ts` — add `CustomReportResponse`, `CustomReportListResponse`, `CustomReportRunResponse`, `CustomReportStatus` types.
- `insights-ui/src/utils/analysis-reports/custom-report-utils.ts` — load helpers, prompt-input builder, save helpers.
- `insights-ui/src/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/custom-reports/route.ts` — `GET`, `POST`.
- `insights-ui/src/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/custom-reports/[reportId]/route.ts` — `GET`, `PATCH`.
- `insights-ui/src/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/custom-reports/[reportId]/regenerate/route.ts` — `POST`.
- `insights-ui/src/app/api/[spaceId]/tickers-v1/custom-report-templates/route.ts` — `GET`, `POST` (admin-gated).
- `insights-ui/src/app/stocks/[exchange]/[ticker]/page.tsx` — new "Custom Reports" section.
- `insights-ui/src/app/stocks/[exchange]/[ticker]/custom-reports/[reportId]/page.tsx` — new detail page.
- `insights-ui/src/components/ticker-reportsv1/CustomReports/` — `CustomReportsSection.tsx`, `CustomReportCard.tsx`, `NewCustomReportModal.tsx`.
- A new `Prompt` row (seed) with `key='US/public-equities-v1/custom-report'` and an `outputSchema` that matches §6.3.

## 14. References

- V1 ticker model: `insights-ui/prisma/schema.prisma:506`
- Generation request model (the thing we are NOT extending): `insights-ui/prisma/schema.prisma:765`
- Prompt + invocation infra we are reusing: `insights-ui/prisma/schema.prisma:340-418`
- API handler we are mirroring: `insights-ui/src/app/api/[spaceId]/tickers-v1/exchange/[exchange]/[ticker]/future-risk/route.ts:1`
- V1 stock detail page (where the new section slots in): `insights-ui/src/app/stocks/[exchange]/[ticker]/page.tsx:1`
