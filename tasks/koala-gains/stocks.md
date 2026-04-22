# Stock Reports — KoalaGains (Tasks)

## Off-hours automated report refresh (Claude Code cron)

Goal: keep stock reports fresh by letting **Claude Code** regenerate the oldest ones during
hours when the app is otherwise idle, so refresh compute doesn't compete with interactive
usage.

- [ ] **Cron job** that runs during off-hours only.
  - Default window: **10:00 PM – 5:00 AM** (local/app timezone — confirm which timezone and
    document it).
  - Cron ticks periodically inside the window (e.g. every 15–30 min) so the workload spreads
    across the window rather than hitting all at once.
- [ ] **Pick oldest reports first**:
  - Query stocks whose latest report's `updatedAt` (or equivalent "last refreshed" timestamp)
    is the oldest.
  - Batch size per tick should be small and configurable, so a single tick doesn't overrun the
    window.
  - Skip stocks that have been refreshed within a minimum staleness threshold (don't
    re-refresh a report generated a few hours ago).
- [ ] **Claude Code invocation per stock**:
  - For each selected stock, Claude Code runs the existing report prompts (all categories /
    sections we already produce for stocks).
  - Save the results back to the DB using the same pipeline/callback logic the live generation
    path uses — no separate write path.
- [ ] **Guardrails**:
  - Hard stop at the end of the off-hours window (don't run past 5 AM even if the batch isn't
    finished — pick up on the next night).
  - Per-tick timeout so a single slow stock can't hog the window.
  - Skip/flag stocks that fail repeatedly (retry cap + failure log).
- [ ] **Observability**:
  - Log per-run summary: how many stocks attempted, succeeded, failed, total time.
  - Surface failures / stuck stocks somewhere visible (admin page or log).
- [ ] **Config / toggles**:
  - Env / config for: off-hours window (start, end, timezone), batch size per tick, tick
    frequency, minimum staleness threshold, enable/disable flag.
- [ ] **Open questions**:
  - Which category of stock reports are in scope — all of them, or only specific ones that
    tend to go stale fastest?
  - Do we want the same mechanism for ETFs later (the ETF side has a separate "daily
    generation" task in SEO phase — decide whether to unify or keep separate).

## Trends page (stocks)

Goal: a dedicated page where we record long-running **trends** — macro, demographic,
generational, technological, regulatory — and map each trend to the **stocks** that would
likely benefit if the trend plays out. The value is in catching trends whose implications are
**not yet priced in**, so we (and readers) can identify candidates ahead of the move.

- [ ] **Trend entries** — each trend should capture:
  - Title + short description (e.g. "2026 — aging boomer retirement wave drives healthcare
    demand", "younger generation prefers experiences over ownership", "shift from ICE to EV",
    "re-shoring of semiconductor manufacturing", etc.).
  - Time horizon (near-term / multi-year / structural).
  - Evidence / sources (news, data, research) supporting the trend.
  - **Mapped stocks**: tickers that should benefit, with a short thesis per stock.
  - **"Priced-in?" assessment**: our current view on whether the market has already factored
    this in, with rationale (valuation multiples, sentiment, flows).
  - Confidence rating.
  - Author + `createdAt` / `updatedAt`.
- [ ] **Page UI**:
  - Trends index (filter/sort by horizon, confidence, updatedAt, tag).
  - Trend detail page listing mapped stocks and the thesis.
  - From a stock's report page, link to the trends that reference it ("this stock appears in
    the following trends").
- [ ] **Authoring flow**:
  - Admin can create/edit trends.
  - Optional: Claude-assisted draft — given a trend description, suggest candidate stocks +
    initial thesis + "priced-in?" assessment for human review.
- [ ] **Storage**:
  - Prisma model for trends + a join table to stocks (many-to-many with a thesis field).
- [ ] **Open questions**:
  - Should trends be shared between stocks and ETFs (single trend mapped to both), or kept
    as separate datasets? (See ETF-side task for the symmetrical ask.)
  - How do we revisit / retire trends that played out or failed — lifecycle states
    (active / played-out / invalidated)?
