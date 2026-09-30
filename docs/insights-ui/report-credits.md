# Report Credits (Stripe)

How visitors pay to regenerate a stock or ETF report, and where the "Report
generated on …" date comes from. Read this before touching anything under
`insights-ui/src/utils/credits/`, `src/components/credits/`, or the Stripe
routes.

## The product rules

- **1 credit = 1 report = $1.00 USD.** Packs are 5 / 10 / 25 / 50 credits at
  exactly `$1 × credits` — no bonus credits, so the "$1 per report" promise
  holds for every pack. Larger packs exist only to amortize the fixed card fee.
- **Credits never expire** and are not tied to a subscription.
- **A failed generation is refunded automatically.** The user is never left
  paying for a report they did not get.
- **A generation already in flight is free.** If an admin, the nightly job, or
  the user's own earlier click already queued a report, the button says
  "Regenerating…" and no credit is taken.
- **One date per report.** Not one per section — a single
  `lastReportGeneratedAt` on the ticker / ETF.

### Why packs and not a $1 charge per report

Card processing costs roughly `2.9% + $0.30`. On a standalone $1.00 charge that
is ~33% of revenue. Selling a $10 pack drops the same fee to ~3.2% while the
user still pays $1 per report. This is the whole reason the credit indirection
exists — do not "simplify" it into a per-report charge.

## Data model

| Table | What it holds |
|---|---|
| `users.credits` | Denormalized spendable balance. |
| `users.stripe_customer_id` | Reused across purchases so saved cards work. |
| `credit_transactions` | Append-only ledger explaining every balance change. |
| `tickers_v1.last_report_generated_at` | The single freshness date for a stock. |
| `etfs.last_report_generated_at` | Same, for an ETF. |

`users.credits` is a cache: **every** write to it happens inside the same DB
transaction as the `credit_transactions` row that explains it, so the balance
can always be re-derived by summing the ledger. A mismatch is a bug, never a
lost credit.

Ledger row types (`CreditTransactionType`):

- `Purchase` — `+N`, carries the Stripe session / payment-intent ids and the
  amount actually charged.
- `ReportSpend` — `-1`, carries the report target and the generation request id.
- `Refund` — `+1`, written when the paid-for generation ends in `Failed`.
- `AdminGrant` — `+N`, manual grant (support, promo, correction).

### The two idempotency guards

These are the parts that must not be "cleaned up":

1. **`credit_transactions.stripe_checkout_session_id` is `UNIQUE`.** Stripe
   retries webhook deliveries, so `checkout.session.completed` can arrive more
   than once for the same purchase. The unique index makes the duplicate
   transaction roll back — balance increment included.
2. **`credit_transactions.settled_at` on the `ReportSpend` row.** Refund and
   settle both filter on `settled_at IS NULL`, so a credit can be returned at
   most once even if two workers finalize the same request concurrently.

The deduction itself is a conditional `updateMany` (`credits >= cost`), not a
read-then-write, so two simultaneous clicks cannot both spend the last credit.

## Code layout

| Path | Responsibility |
|---|---|
| `src/types/credits.ts` | Pack catalog, prices, request/response shapes. Shared by client and server — the single source of truth for what a credit costs. |
| `src/utils/credits/credit-service.ts` | `grantPurchasedCredits`, `spendCreditForReport`, `settleReportCredit`. All ledger writes live here. |
| `src/utils/credits/report-target.ts` | Resolves `(kind, symbol, exchange)` into a stock or ETF, its freshness date, whether a generation is in flight, and how to create a full-report request. Keeps both report families behind one shape. |
| `src/utils/credits/stripe-client.ts` | Lazily built Stripe client; throws a readable error when keys are missing. |
| `src/utils/credits/credit-format.ts` | Date / USD / "N credits" formatting. |
| `src/utils/credits/credit-return-path.ts` | Browser-only Stripe round-trip helpers (see the `useSearchParams` note below). |
| `src/components/credits/` | High-level, style-free UI: `ReportGenerationControl`, `RegenerateReportModal`, `BuyCreditsPanel`. |
| `src/components/ui/credits/` | The leaf layer for the above (`ReportFreshnessBar`, `CreditPackOption`, `CreditBalanceCard`). All Tailwind lives here — see [ui-leaf-component-system.md](ui-leaf-component-system.md). |
| `src/app/credits/page.tsx` | Balance, pack picker, and credit history. |

## API routes

| Route | Auth | Purpose |
|---|---|---|
| `GET /api/[spaceId]/users/credits` | `withLoggedInUser` | Balance + last 50 ledger rows. |
| `POST /api/[spaceId]/users/credits/checkout-session` | `withLoggedInUser` | Creates a Stripe Checkout Session, returns its URL. |
| `GET /api/[spaceId]/users/report-generation` | `withLoggedInUser` | Balance, freshness date, and in-flight flag for one report. |
| `POST /api/[spaceId]/users/report-generation` | `withLoggedInUser` | Spends a credit and queues a full regeneration. |
| `POST /api/stripe/webhook` | **Stripe signature** | Grants credits after payment. |

Note the deliberate exception to the rule in
[ui-api-routes.md](ui-api-routes.md) that stock/ETF mutations use
`withAdminOrToken`: `report-generation` is a **user-owned** mutation (like
favourites and notes) and is paid for, so it sits on `withLoggedInUser`.

`POST /users/report-generation` never throws for expected outcomes. It returns
`outcome: 'Started' | 'AlreadyInProgress' | 'InsufficientCredits'` as data so
the modal can offer the next step instead of showing an error toast.

### The webhook is the only thing that grants credits

The redirect back from Stripe carries `?creditsPurchased=N`, but that is only a
UI hint — it is user-controllable and can be lost if the browser closes. Credits
are granted exclusively by the signed `checkout.session.completed` webhook, and
only when `payment_status === 'paid'`. If the handler throws, it returns 500 on
purpose so Stripe retries; granting is idempotent, so a retry is always safe.

## Where the date comes from

`markAsCompleted` (stocks, `report-status-utils.ts`) and
`markEtfRequestAsCompleted` (ETFs, `etf-report-status-utils.ts`) are the single
finalization points for every generation request — admin, nightly cron, and
paid alike. Both now do three things instead of one:

1. Set the request's terminal status (unchanged).
2. Set `lastReportGeneratedAt` **if at least one step completed** — a partial
   run still rewrote part of the report, so the date genuinely moved.
3. Call `settleReportCredit(requestId, succeeded)` — keeps the credit on
   success, refunds it when the request ends in `Failed`. A no-op for requests
   that never held a credit.

A request that ends in `Failed` is refunded **in full**, even when some sections
succeeded: the user paid for a whole report. That is deliberately generous and
keeps support load near zero.

Both report pages prefer `lastReportGeneratedAt` over the row's `updatedAt` for
the article footer's `dateModified`, so an unrelated column edit can no longer
read as "the report was refreshed".

## UX flow

The control renders as one quiet line above the report:

> 🕐 Report generated on September 2, 2026 · **Regenerate**

- **Logged out** → clicking opens the login popup. The date still renders, and
  no status request is made, so the common case costs nothing.
- **Logged in, has credits** → a confirm modal showing the cost, the balance
  after, and the current date.
- **Logged in, no credits** → the *same modal* switches to the pack picker.
  Buying does not navigate away from the report; Stripe returns to the exact
  path and query the user was on, and the modal reopens with the new balance.
- **Generation running** → the button reads "Regenerating…", and the control
  polls every 20s (up to 20 minutes), then calls `router.refresh()` so the new
  report and its new date appear without a manual reload.

### Why `window.location` instead of `useSearchParams()`

`useSearchParams()` forces every page that renders the credit UI behind a
Suspense boundary or the Next.js build fails. The control is meant to drop into
any report page, so `credit-return-path.ts` reads `window.location` and clears
the marker with `history.replaceState` instead. Do not reintroduce the hook here.

## Environment

```
STRIPE_SECRET_KEY=sk_test_...      # sk_live_... in production
STRIPE_WEBHOOK_SECRET=whsec_...    # for /api/stripe/webhook
```

Both are read lazily, so the app boots and every non-credit page works without
them; only checkout and the webhook fail, with an explicit "payments are not
configured" message.

### Local setup

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook   # prints whsec_...
```

Test card `4242 4242 4242 4242`, any future expiry and CVC.

### Production setup

1. Add the webhook endpoint in the Stripe dashboard pointing at
   `https://<host>/api/stripe/webhook`.
2. Subscribe it to `checkout.session.completed` and
   `checkout.session.async_payment_succeeded`.
3. Put the signing secret in `STRIPE_WEBHOOK_SECRET`.
4. Register for US sales tax where required, or enable Stripe Tax — Stripe is a
   payment processor, not a merchant of record, so tax compliance is ours.

## Adding a new report family

Everything family-specific lives in `resolveReportTarget`. Add a
`CreditReportKind` value, a branch that returns the target's id, label,
freshness date, in-flight check and a `createGenerationRequest` callback, then
drop `<ReportGenerationControl kind={...} />` onto the page. No other file needs
to change.
