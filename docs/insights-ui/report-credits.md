# Report Credits (Stripe)

How visitors pay to regenerate a stock or ETF report, and where the "Report
generated on …" date comes from. Read this before touching anything under
`insights-ui/src/utils/credits/`, `src/components/credits/`, or the Stripe
routes. The [go-live checklist](#go-live-checklist) is at the end.

## The product rules

- **1 credit = 1 report = $1.00 USD.** Packs are 5 / 10 / 25 / 50 credits at
  exactly `$1 × credits` — no bonus credits, so the "$1 per report" promise
  holds for every pack. Larger packs exist only to amortize the fixed card fee.
  Checkout always charges in USD (adaptive pricing is off).
- **Credits never expire** and are not tied to a subscription.
- **A failed generation is never charged.** The credit is reserved while the
  report runs and only taken in Stripe once it exists, so there is nothing to
  refund.
- **Abuse limits, because failed runs are free.** A user can have at most
  **3** paid runs in progress at once (`TooManyInProgress`), and a report whose
  last **3** generation requests (from any source: paid, admin, nightly) all
  ended `Failed` within the last **7 days** is not sold until one succeeds
  (`TemporarilyUnavailable`).
- **Users never see admin or nightly runs.** While one is running the user
  still sees "Report generated on … · Regenerate", and clicking it reserves a
  credit and queues the user's own full request (it may run alongside the
  admin one — rare enough to accept for the simplicity). Only the user's *own*
  unfinished paid run on the same report blocks another one, so a double click
  or second tab can't charge twice. Admin / nightly work is never merged into a
  request a user paid for.
- **Refunds and disputes take credits back** (see
  [Refunds and disputes](#refunds-and-disputes)).
- **One date per report.** Not one per section — a single
  `lastReportGeneratedAt` on the ticker / ETF.

### Why packs and not a $1 charge per report

Card processing has a fixed per-charge fee (on the order of $0.30) on top of a
percentage. On a standalone $1.00 charge that fixed part alone is ~30% of
revenue; on a $10 pack it is ~3%, while the user still pays $1 per report. This
is the whole reason the credit indirection exists — do not "simplify" it into a
per-report charge.

### Fees to expect

The Stripe account is **Canadian** (default currency CAD) and every credits
charge is in **USD**. So, unless a USD bank account is added to the Stripe
account for payouts, expect per charge roughly:

- the standard card processing fee (see Stripe's current Canadian pricing),
- plus about **2%** currency conversion (USD charge settled into a CAD balance),
- plus about **0.8%** for international cards (most US buyers' cards are
  international from a Canadian account's point of view).

These are approximations of Stripe's published pricing, not guarantees — check
the Stripe pricing page and the fee breakdown on a real payment in the
dashboard. Adding a USD bank account (so USD is paid out as USD) removes the
conversion part; it is a business decision on the go-live checklist.

## Workflows in plain English

The short version: **Stripe keeps the money (the credit balance and its
history). Our database keeps track of which reports are being made.**

### How a KoalaGains user is linked to a Stripe customer

- The first time a logged-in user clicks **Buy**, our server asks Stripe to
  create a *customer* for them, with their email and our user id in its
  metadata (idempotency key `credit-customer-<userId>-<hash of the create
  params>`, so a double click or two tabs get the same customer, while a user
  whose email changed within Stripe's 24h key window gets a fresh key instead
  of an `idempotency_error`). Stripe returns an id like `cus_…`.
- We save that id on the user (`users.stripe_customer_id`) and reuse it on
  every later purchase. If the stored customer no longer exists in Stripe (a
  test-mode id against the live key, or deleted in the dashboard), it is
  replaced — but only for a user who has never bought; for a buyer the checkout
  is refused and a `MANUAL REPAIR NEEDED` error is logged.
- The link is **our user id ↔ the Stripe customer id**. It has nothing to do
  with the card: the same card used on two KoalaGains accounts gives two Stripe
  customers, and one user paying with two cards stays one customer.
- The customer is created before the user pays, so having a customer id doesn't
  mean the user has bought anything. That's why there is a separate
  `first_purchase_at`, set only when a payment is credited.

### 1. Buying credits

The user can buy from the `/credits` page, or from the Regenerate pop-up on any
stock / ETF page when they don't have enough credits. Both use the same pack
picker. Buying is only offered while the `STRIPE_CREDIT_PURCHASES_ENABLED`
switch is on (`usePurchasesEnabled`; an unreadable switch counts as off).

1. **User picks a pack** (5 / 10 / 25 / 50 credits) and clicks Buy.
2. **Our server → Stripe:** creates a Checkout Session (`mode: 'payment'`) for
   the user's customer:
   - one line item priced in **USD** at the pack price;
   - `adaptive_pricing: { enabled: false }` — no converted local-currency price,
     so "1 credit = $1" holds;
   - `payment_intent_data.statement_descriptor_suffix: 'KOALAGAINS'` (card
     statements read "<account prefix>* KOALAGAINS");
   - `metadata: { userId, spaceId, packKey, credits }`, derived from the pack
     on the server (nothing from the browser is trusted);
   - return URLs from `buildCheckoutReturnUrls` (`checkout-urls.ts`): in
     production the origin is always the canonical URL (`getCanonicalUrl()`),
     never the request origin, which in the container is the internal host; in
     `next dev` it is the request origin (localhost). The return path is
     same-origin only (anything else falls back to `/credits`). The success URL
     is the page the user came from plus
     `?creditsPurchased=N&checkout_session={CHECKOUT_SESSION_ID}` (the
     placeholder is appended un-encoded so Stripe substitutes the session id);
     the cancel URL is the same page without the markers.
3. **User pays on Stripe's page.** We never see the card.
4. **Stripe sends the user back** to that page. `useCheckoutReturn` reads and
   strips the markers from the URL and shows **"Adding your credits…"** (in the
   regenerate modal, which reopens, or on `/credits`) while it polls
   `POST /users/credits/confirm-checkout` with the session id every ~2s for up
   to ~30s. It stops on `credited` / `already_credited` (balance published to
   the navbar immediately) or `not_paid`; `pending` (delayed payment method) or
   a timeout ends with "your credits will appear shortly".
5. **Credits are granted by whichever arrives first** — the signed webhook
   (`checkout.session.completed` / `checkout.session.async_payment_succeeded`)
   or `confirm-checkout`. Both call the same `creditCheckoutSession` →
   `grantPurchasedCredits`, so the second one is a no-op (`already_credited`).
   The grant:
   - **→ Stripe:** "add a 10-credit balance transaction to customer `cus_…`"
     (shows as **-$10.00** = $10 of credit). Stripe returns its id (`cbtxn_…`).
   - Saves a `stripe_credit_purchases` row and sets `first_purchase_at` if it's
     the first purchase.

**Stripe calls:** create customer (first time only), create checkout session;
the grant does one ledger list (dedupe) + one "add balance transaction", and
each `confirm-checkout` call also retrieves the session.

### 2. Seeing the balance (navbar, credits page)

- **Logged out, or never bought** (`first_purchase_at` is empty): show 0 / Buy
  Credits, with **no Stripe call at all**.
- **Has bought before:** read the customer's balance from Stripe, **cached**
  (see [The display cache](#the-display-cache)), so normal page browsing costs
  no Stripe calls.
- What we show = Stripe balance − reports still being made (those credits are
  reserved).
- Each read also kicks off a fire-and-forget reconciliation of *this user's*
  stale paid runs; the page never waits on it.

### 3. Regenerating a report (spending a credit)

1. **User clicks Regenerate** on a stock / ETF page. A pop-up shows the cost
   (1 credit) and the balance after.
2. **User confirms.** Our server first reconciles this user's stale runs
   (awaited), then, in one transaction holding the user row lock
   (`SELECT … FOR NO KEY UPDATE`):
   - refuses if this user is already generating this same report
     (`AlreadyInProgress`),
   - refuses if they already have 3 paid runs going (`TooManyInProgress`),
   - refuses if the report's last 3 runs all failed in the last 7 days
     (`TemporarilyUnavailable`),
   - reads the reserved count, **then** the live Stripe balance (no cache here,
     it must be exact),
   - checks `balance − reserved ≥ 1` (`InsufficientCredits` otherwise),
   - creates the generation request plus a `report_spends` row marked
     **InProgress**. This reserves the credit. **Nothing is taken in Stripe yet.**
3. The navbar now shows one credit fewer (it's reserved), and the report page
   shows **Being generated**.

**Stripe calls:** one balance read.

### 4. The report finishes

Stock runs settle only in `markAsCompleted`, ETF runs only in
`markEtfRequestAsCompleted` (see [Where the date comes from](#where-the-date-comes-from)).
`settleReportCredit(generationRequestId)` reads the request's **stored**
terminal status — the caller never tells it the outcome — and does nothing
while the request is not `Completed` / `Failed`.

- **Completed:** our server **→ Stripe:** "take 1 credit from customer `cus_…`"
  (a +$1.00 balance transaction with `symbol`, `exchange`, `country`,
  `generationRequestId` in its metadata, idempotency key
  `report-spend-<generationRequestId>`). Before charging it searches the
  customer's recent ledger for a charge already written for this request and
  reuses it. On an error the attempt is retried once (after 1s) with the same
  key; if it still fails, the row is closed anyway, the user gets this report
  free, and an error is logged. The `report_spends` row becomes **Completed**.
- **Failed:** **no Stripe call.** The row becomes **Failed** and the
  reserved credit is simply free again. Nothing was taken, so there is nothing
  to refund.
- Either way the user gets an email, and a pop-up the next time they open or
  switch to the site.

**Stripe calls:** one ledger list + one charge if it worked, zero if it failed.

### 5. History

- **Report page tags** ("Being generated", "Generated by you on …", "Failed ·
  not charged") come from our database (`report_spends`), not Stripe.
- **`/credits` history** reads the customer's balance transactions from Stripe
  (purchases, charged reports, refund / dispute debits, manual adjustments),
  plus the reports still being made from our database, merged newest first by
  time. One Stripe call per 100 rows.

### What you see in the Stripe dashboard

Customers → search the user's email → open the customer:

- **Balance:** shown as credit, e.g. "$6.00 credit" = 6 credits (1 credit is
  stored as $1.00).
- **Balance transactions:** "-$10.00 Purchased 10 credits" for a purchase,
  "+$1.00 Report generation for AAPL (NASDAQ)" for each charged report, and
  "Removed N credits (payment refund)" / "(payment dispute)" for a reversal.
  Open one to see its metadata.
- **Payments:** the real card payments ($10 etc.), with receipts.

## Data model

**Stripe is the ledger.** The balance and its history live on the user's Stripe
customer as *customer balance transactions*. The DB only holds what Stripe can't
answer (which runs are still going, purchase dedupe, and the payment → purchase
link that refunds need).

| Where | What it holds |
|---|---|
| Stripe customer balance | The balance. In cents, **negative = credit**; 1 credit is stored as 100 cents, so the dashboard reads "$10.00 credit" for 10 credits. `STRIPE_CENTS_PER_CREDIT` is a storage unit, not the price — never change it. A refund / dispute can push it above zero (credits already spent are owed); the display clamps to 0. |
| Stripe balance transactions | The history. `metadata.type` is `purchase` (with `checkoutSessionId`, `paymentIntentId`, `amountInCents`), `report_spend` (with `reportKind`, `symbol`, `exchange`, `country`, `generationRequestId`), or `refund` / `dispute` (with `sourceId` = the `re_…` / `du_…` id, `paymentIntentId`, `checkoutSessionId`, `credits`). Anything that isn't `purchase` / `report_spend` (refunds, disputes, a manual credit in the dashboard) shows in the history as an `Adjustment`. |
| `users.stripe_customer_id` | `UNIQUE`. Created when the user first opens Checkout — so it is set *before* any payment. |
| `users.first_purchase_at` | Set by the grant (webhook or `confirm-checkout`) on the first credited purchase. Gates every Stripe balance call: a user without it costs no Stripe call. |
| `report_spends` | One paid run: target, label, `generation_request_id` (`UNIQUE`), `status` (`InProgress` / `Completed` / `Failed`), the Stripe debit txn id, `settled_at`, `result_seen_at`. A row's existence is also what marks a generation request as paid. |
| `stripe_credit_purchases` | Grant dedupe (`stripe_checkout_session_id UNIQUE`), the payment intent → purchase lookup for refunds / disputes, and the admin "who bought what" (credits, amount, session / payment-intent / Stripe txn ids). Not a ledger. |
| `tickers_v1.last_report_generated_at` | The single freshness date for a stock. |
| `etfs.last_report_generated_at` | Same, for an ETF. |

Both `report_spends` and `stripe_credit_purchases` reference `users` with
`ON DELETE RESTRICT`: deleting a user who has bought or run a paid report fails
(the admin user-delete API errors) instead of silently erasing the records.

```
spendable credits = Stripe balance − InProgress report_spends
```

Stripe applies a customer balance to the next invoice it finalizes. Checkout in
`payment` mode without `invoice_creation` never touches it — keep it that way
(no subscriptions, no invoice creation) for these customers.

### The display cache

`getUserCredits` (navbar, credits page, admin list) reads the balance through
`getCachedStripeCredits`: a Next `unstable_cache` keyed by the customer id and a
"ledger version" = `<count of stripe_credit_purchases>-<count of charged
report_spends>`. Every purchase and every charge adds one of those rows, so the
next read misses the cache with no invalidation needed (this also holds when a
run is settled outside a request). The 5-minute `revalidate` only catches
changes that add no DB row — manual dashboard edits **and refund / dispute
debits** — so those can take up to 5 minutes to show. Spending never uses the
cache.

### Flow and Stripe calls

| Step | What happens | Stripe calls |
|---|---|---|
| Navbar / credits page balance | `getUserCredits`: no `first_purchase_at` → 0. Otherwise the cached `customers.retrieve` above. Also fires (does not await) this user's stale-run reconciliation. | 0 or 1 (usually cached) |
| Purchase grant (webhook or `confirm-checkout`) | Stop if a `stripe_credit_purchases` row exists for the session. Else search the customer's newest 100 ledger entries for a `purchase` with this `checkoutSessionId` and reuse it, or `createBalanceTransaction(-credits×100)` with idempotency key `credit-purchase-<sessionId>`; then insert `stripe_credit_purchases` and set `first_purchase_at`. | 1–2 |
| Click Regenerate | Reconcile this user's stale runs, then under the user row lock (`SELECT … FOR NO KEY UPDATE` — enough to serialize clicks without blocking FK inserts that reference the user): refuse `AlreadyInProgress` / `TooManyInProgress` / `TemporarilyUnavailable`, read the reserved count and then the **live** Stripe balance (see guard 2 for the order), refuse if `balance − reserved < 1`, else create the generation request + `InProgress` spend. | 1 |
| Run succeeds | Ledger search for an existing `report_spend` with this `generationRequestId`, else `createBalanceTransaction(+100)` with idempotency key `report-spend-<generationRequestId>`; the attempt is retried once with the same key on error; then mark `Completed`. If Stripe still fails the run is closed as `Completed` with no debit (logged) — the user keeps the report free rather than being stuck with a reserved credit. | 2 (up to 4 with the retry) |
| Run fails | Mark `Failed`. Nothing was taken. | 0 |
| Refund / dispute webhook | See [Refunds and disputes](#refunds-and-disputes). | 2–3 per event |
| History page | `listBalanceTransactions` (100 per call) + `InProgress` spends from the DB, merged newest first. | 1 per 100 rows |
| Admin buyer list | `getUserCredits` per buyer, at most 5 at a time. A buyer whose balance can't be read shows "—" (logged), instead of failing the page. | ≤ 1 per buyer (usually cached) |

### The idempotency / race guards

These are the parts that must not be "cleaned up":

1. **Purchase: one idempotent grant path, three layers of dedupe.** The webhook
   and `confirm-checkout` both go through `creditCheckoutSession` →
   `grantPurchasedCredits`, so a race between them is the same as two webhook
   deliveries. The layers: the `stripe_credit_purchases.stripe_checkout_session_id
   UNIQUE` row (checked first; a `P2002` on insert means a concurrent call
   recorded it), a search of the customer's newest 100 ledger entries for a
   `purchase` with the same `checkoutSessionId` (covers retries after Stripe's
   24h idempotency window — webhooks are retried for days), and the idempotency
   key `credit-purchase-<sessionId>`. The Stripe call comes first and the row
   second, so a crash in between is finished by the retry. Every exit re-applies
   `first_purchase_at`, so a replay also repairs a half-finished grant. Only
   `payment_status === 'paid'` is credited; a completed-but-`unpaid` session
   (delayed payment method) is `pending` and is credited later by
   `checkout.session.async_payment_succeeded`. The grant links the session's
   customer to the user if they have none; if a *different* customer is linked
   (or the customer is linked to another user), the credit still goes to the
   customer that paid and a `MANUAL REPAIR NEEDED` error is logged with both ids.
2. **Spend: the user-row lock and the read order.** Everything runs under a
   `FOR NO KEY UPDATE` lock on the user row, so two simultaneous clicks run one
   after the other and can't both use the last credit. The reserved
   (`InProgress`) count is read **before** the live Stripe balance: a settle
   that lands in between then charges Stripe after we counted it as reserved,
   which can only under-state what's spendable, never over-state it.
   Spending fails closed: if Stripe can't confirm the balance, no run starts.
   Display reads (`getUserCredits`) never throw on a Stripe outage; they return
   0 with `stripeUnavailable: true` (the navbar shows "—").
3. **Settle: outcome from the stored status, charge first, then close the row
   with `status = InProgress` in the filter.** `settleReportCredit` derives
   success from the request's stored terminal status and ignores a request that
   is still running, so a stray call can't close a paid run early. The charge
   is deduped by the ledger search plus the `report-spend-<generationRequestId>`
   idempotency key, and retried once. Until the row is closed its credit still
   counts as reserved, so the spendable balance never briefly overstates.
   Concurrent settles close the row only once, and only that one sends the
   email.
4. **Stale `InProgress` spends are reconciled.** A run whose settle never
   landed (crash, Stripe timeout) would hold its credit forever, so
   `reconcileOpenSpends` looks at up to 50 of the oldest `InProgress` spends
   created more than 2 minutes ago:
   - a request that is `Completed` / `Failed` and ended more than 2 minutes ago
     (or no longer exists) is settled through `settleReportCredit` (charged or
     released from its stored status);
   - a request still not finished **12 hours** after the spend was created is
     *stuck*: its credit is released uncharged and a `logError` alert is sent.

   It runs from the generation **heartbeat** (`processPendingTickerRequests` →
   `settleStaleReportSpendsForAllUsers`, at most **10** settles per tick across
   all users, stock and ETF runs alike), per user before every spend (awaited,
   at most 5), and per user on balance reads (fire-and-forget, at most 5).
5. **Paid requests are never merged.** `upsertGenerationRequest`,
   `upsertEtfGenerationRequest` and the per-ticker `generation-requests` POST
   reuse a `NotStarted` request only if it has no `report_spends` row
   (`findPaidGenerationRequestIds`), so admin / nightly work never changes the
   sections, provider or model of a request a user paid for.

## Refunds and disputes

Handled by the webhook (`credit-purchase.ts`). A charge is matched to a credits
purchase by its payment intent (`stripe_credit_purchases.stripe_payment_intent_id`);
charges that aren't credits purchases are ignored.

- **`charge.refunded`** — proportional debit. The charge's refunds are listed
  from Stripe (they aren't in the webhook payload) and, in creation order, each
  refund removes its step of `floor(credits × refundedCents / amountInCents)`
  (capped at the pack size). A refund too small to remove a whole credit
  removes nothing. One debit per refund, idempotency key
  `credit-refund-<re_…>`, skipped if the recent ledger already has a `refund`
  entry with that `sourceId`.
- **`charge.dispute.created`** — full debit of the purchase's credits minus any
  already removed by refunds. Idempotency key `credit-dispute-<du_…>`, plus the
  same ledger check.
- The debit can push the balance above zero (credits already spent are now
  owed); the user simply sees 0. The navbar may take up to 5 minutes to reflect
  it (see [The display cache](#the-display-cache)).
- **`charge.dispute.closed`** — only `status: won` does anything: the
  dispute's own `dispute` debit (found in the recent ledger by `sourceId`) is
  credited back for exactly its amount, as a `dispute_won` entry (`sourceId`,
  `debitTxnId`, `credits`; shows as an `Adjustment`). Idempotency key
  `credit-dispute-won-<du_…>`, plus a ledger check for an existing
  `dispute_won` entry. No debit found → nothing restored: logged as info when
  the purchase was already fully refunded in credits, otherwise a
  `MANUAL CHECK NEEDED` `logError` (usually the debit is older than the
  100-entry lookback — disputes can take months to close). Lost / any other
  status: the debit stands.
- Manual restore (for that `MANUAL CHECK NEEDED` case): in the Stripe
  dashboard open the customer (Customers → email), find the `dispute` balance
  transaction for the payment (`metadata.sourceId` = the `du_…` id,
  `metadata.credits` = credits removed), then **Adjust balance → credit**
  `$<credits>.00` with a description like "Dispute du_… won — credits
  restored". It shows in the history as an `Adjustment`.

## Code layout

| Path | Responsibility |
|---|---|
| `src/types/credits.ts` | Pack catalog, prices, request/response shapes, the return-URL query param names. Shared by client and server — the single source of truth for what a credit costs. Report statuses use the Prisma `ReportSpendStatus` enum directly (no hand-written copy). |
| `src/utils/credits/credit-service.ts` | `getUserCredits`, `grantPurchasedCredits`, `spendCreditForReport` (with the abuse limits), `settleReportCredit`, `chargeReportWithRetry`, stale-run reconciliation. The credit workflow. |
| `src/utils/credits/credit-purchase.ts` | Purchase side: `creditCheckoutSession` (shared by the webhook and `confirm-checkout`), `confirmCheckoutForUser`, the customer link check, and refund / dispute reversal. |
| `src/utils/credits/stripe-credit-ledger.ts` | Every Stripe balance call: live / cached balance, grant, charge, reversal debit, ledger list and the dedupe searches. Owns the cents-per-credit unit and the metadata shape. |
| `src/utils/credits/checkout-urls.ts` | Checkout return origin (canonical URL in production) and the success / cancel URLs. |
| `src/utils/credits/credit-history.ts` | Builds the history page from the Stripe ledger + in-progress spends. |
| `src/utils/credits/report-target.ts` | Resolves `(kind, symbol, exchange)` into a stock (not soft-deleted) or ETF, its freshness date, whether a generation is in flight, and how to create a full-report request. Keeps both report families behind one shape. |
| `src/utils/credits/stripe-client.ts` | Stripe client built from the `STRIPE_SECRET_KEY` App Setting (rebuilt when it changes; 20s timeout, 1 network retry); throws a readable error when keys are missing. |
| `src/utils/credits/credit-format.ts` | Date / USD / "N credits" formatting. |
| `src/utils/credits/credit-return-path.ts` | Browser-only Stripe round-trip helpers (see the `useSearchParams` note below). |
| `src/hooks/useCheckoutReturn.ts` | Return leg of Checkout: reads the markers, polls `confirm-checkout`, shows the outcome. |
| `src/hooks/usePurchasesEnabled.ts` | Reads the purchases switch (cached 5 min in the browser; a failed read counts as off). |
| `src/hooks/useCreditBalance.ts` | One balance per page, shared by the navbar and the regenerate control. |
| `src/components/credits/` | High-level, style-free UI: `ReportGenerationControl`, `RegenerateReportModal`, `BuyCreditsPanel`. |
| `src/components/ui/credits/` | The leaf layer for the above (`ReportFreshnessBar`, `CreditPackOption`, `CreditBalanceCard`). All Tailwind lives here — see [ui-leaf-component-system.md](ui-leaf-component-system.md). |
| `src/app/credits/page.tsx` | Balance, pack picker, and credit history. |
| `src/app/admin-v1/user-credits/` | Admin buyer list and per-user history. |

## API routes

| Route | Auth | Purpose |
|---|---|---|
| `GET /api/[spaceId]/users/credits?limit=50` | `withLoggedInUser` | Balance and the latest `limit` Stripe ledger rows (+ `hasMore`), merged newest first with in-progress runs. Rows carry a `reportHref` and a `hasReceipt` flag. |
| `GET /api/[spaceId]/users/credits/balance` | `withLoggedInUser` | Spendable balance only, for the navbar. |
| `GET /api/[spaceId]/users/credits/receipt?transactionId=…` | `withLoggedInUser` | Stripe-hosted receipt URL for one of the user's purchases (`transactionId` = Stripe balance txn id). |
| `POST /api/[spaceId]/users/credits/checkout-session` | `withLoggedInUser` | Creates a Stripe Checkout Session, returns its URL. Refused with "Buying credits is temporarily unavailable. Please try again later." while `STRIPE_CREDIT_PURCHASES_ENABLED` is off (it only blocks buying; spending reads Stripe too, so it can still fail during a Stripe outage). |
| `POST /api/[spaceId]/users/credits/confirm-checkout` | `withLoggedInUser` | Body `{ sessionId }` (`cs_live_…` / `cs_test_…`). Retrieves the session from Stripe; it must be a credits session whose `metadata.userId` is the caller (otherwise 404, so ids can't be probed). Grants through the same idempotent path as the webhook and returns `{ status: 'credited' \| 'already_credited' \| 'pending' \| 'not_paid', credits }`. |
| `GET /api/[spaceId]/users/report-generation` | `withLoggedInUser` | Balance, freshness date, whether the user's own paid run is in flight, and their `lastRegeneration` (date + succeeded) for one report. |
| `POST /api/[spaceId]/users/report-generation` | `withLoggedInUser` | Reserves a credit and queues a full regeneration. |
| `POST /api/[spaceId]/users/credits/report-results` | `withLoggedInUser` | Returns paid runs that finished or failed since the user last looked, and marks them seen (`result_seen_at`). |
| `GET /api/[spaceId]/admin/credits/users` | `withLoggedInAdmin` | Every buyer with balance, credits bought, amount paid, paid reports (Completed spends actually charged in Stripe; reserved, failed and charge-failed runs excluded). |
| `GET /api/[spaceId]/admin/credits/users/[userId]?limit=50` | `withLoggedInAdmin` | One user's credit history. |
| `POST /api/stripe/webhook` | **Stripe signature** | Grants credits (`checkout.session.completed`, `checkout.session.async_payment_succeeded`) and takes them back (`charge.refunded`, `charge.dispute.created`), and gives a won dispute's credits back (`charge.dispute.closed`). |
| `GET` / `POST /api/[spaceId]/tickers-v1/[ticker]/generation-requests` | `withAdminOrToken` | Admin / automation only (GET returns raw request rows). POST never merges into a paid request. |
| `POST /api/[spaceId]/tickers-v1/[ticker]/update-request-status` | `withAdminOnly` (logged-in admin) | Sets a request's status by hand. It does **not** settle credits; a paid run ended here is charged or released by the heartbeat reconciliation from its stored status. No code calls it. |

Note the deliberate exception to the rule in
[ui-api-routes.md](ui-api-routes.md) that stock/ETF mutations use
`withAdminOrToken`: `report-generation` is a **user-owned** mutation (like
favourites and notes) and is paid for, so it sits on `withLoggedInUser`.

`POST /users/report-generation` never throws for expected outcomes. It returns
`outcome: 'Started' | 'AlreadyInProgress' | 'InsufficientCredits' |
'TooManyInProgress' | 'TemporarilyUnavailable'` as data (the last two with a
`message`) so the modal can offer the next step instead of showing an error
toast. `AlreadyInProgress` means the user's own paid run is still going — never
an admin or nightly one.

### How credits are granted

Credits are granted by the signed webhook **and** by `confirm-checkout` when
the user returns, through the same idempotent `creditCheckoutSession` — so the
user sees their credits even if the webhook is slow, and a lost redirect
(browser closed) is still covered by the webhook. Neither trusts the browser:
the `creditsPurchased` / `checkout_session` query params are only markers; the
session is always read from Stripe (the webhook gets it in the signed event),
and only a `paid` session is credited.

The webhook:

- rejects a request without a `stripe-signature` header (400, warn only) or
  with an invalid signature (400, alert);
- rejects an event whose `livemode` doesn't match the configured key
  (`sk_live_` / `rk_live_` = live) with 400 and an alert — the endpoint is wired
  to the wrong Stripe mode;
- answers 500 (Stripe retries) when payments aren't configured or a handler
  throws; granting and reversing are idempotent, so a retry is always safe;
- answers **200** for things a retry can't fix: a paid session whose user no
  longer exists (logged, nothing credited), a session without credits
  metadata, and event types it doesn't handle.

## Where the date comes from

`markAsCompleted` (stocks, `report-status-utils.ts`) and
`markEtfRequestAsCompleted` (ETFs, `etf-report-status-utils.ts`) are the single
finalization points for every generation request — admin, nightly cron, and
paid alike — and the **only** places a paid run settles. (The
`tickers-v1/[ticker]/update-request-status` route does not settle; see above.)
After giving each failed step one retry, both do three things:

1. Set the request's terminal status — as an **atomic claim**
   (`updateMany` filtered on `status IN (NotStarted, InProgress)`). The
   heartbeat and the step-save trigger can both reach the finalizer for the
   same request; only the caller whose update matched (`count === 1`) goes on
   to steps 2–3, the other returns. If the winner crashes before settling, the
   heartbeat reconciliation settles the run from the stored status.
2. Set `lastReportGeneratedAt` **if at least one step completed** — a partial
   run still rewrote part of the report, so the date genuinely moved.
3. Call `settleReportCredit(requestId)` — it reads the status just stored:
   takes the reserved credit in Stripe on `Completed`, releases it without
   charging on `Failed`. A no-op for requests that never held a credit.

A request that ends in `Failed` is **not charged at all**, even when some
sections succeeded: the user paid for a whole report. That is deliberately generous and
keeps support load near zero.

Both report pages prefer `lastReportGeneratedAt` over the row's `updatedAt` for
the article footer's `dateModified`, so an unrelated column edit can no longer
read as "the report was refreshed".

## UX flow

The control renders as one quiet line above the report:

> 🕐 Report generated on September 2, 2026 (47 days ago) · `[Generated by you on Jul 1, 2026]` &nbsp;&nbsp;&nbsp; **[↻ Regenerate]**

One line: date and the user's own status on the left, a Regenerate button
(styled like the "View Detailed Analysis →" buttons) on the right; on narrow
screens the button wraps underneath. The status part is only for a logged-in
user who has paid to regenerate this report. It uses the same badges as the credits page history
(`REPORT_STATUS_BADGES` in `src/utils/credits/report-status-badges.ts`), so a
state always has the same colour and label:

| User's paid run | Status after the date |
|---|---|
| Running | `[Being generated]` (Regenerate is hidden.) |
| Last one succeeded | `[Generated by you on Jul 1, 2026]` |
| Last one failed | `[Failed · not charged · Jul 1, 2026]` |

The date comes from the user's latest *settled* `ReportSpend`, so it stays true
even if an admin or nightly run replaced the report later. The credits page
adds "· credit reserved" to the running badge; the report page leaves it out.

The "(N days ago)" part is computed in the browser after mount, so server and
client HTML never disagree around midnight.

- **Logged out** → clicking opens the login popup. The date still renders, and
  no status request is made, so the common case costs nothing.
- **Logged in, has credits** → a confirm modal saying every section is
  refreshed, with the current report's date, the balance, the cost, and the
  balance after.
- **Logged in, no credits** → the *same modal* switches to the pack picker (or
  says "Buying credits isn't available right now." while the purchases switch
  is off). Buying does not navigate away from the report: Stripe returns to the
  exact path and query the user was on, and the modal reopens showing **"Adding
  your credits…"** while `confirm-checkout` is polled, then the new balance.
- **Refused** (`TooManyInProgress`, `TemporarilyUnavailable`) → the server's
  message is shown.
- **User's own run in progress** (they hold an unsettled `ReportSpend` for the
  report) → the Regenerate button is hidden and the line shows the
  `[Being generated]` badge. Admin and nightly runs change nothing on the page.
  There is **no polling of the generation** — it can take up to an hour, and
  the new report and date show up on the user's next page load.

### Telling the user a paid report finished

`ReportResultNotifier` (mounted once in `app/layout.tsx`, so it works on every
page) calls `POST /users/credits/report-results`:

- once when the site loads,
- when the user comes back to the tab (`visibilitychange`),
- on navigation,

at most once a minute per tab whatever the trigger.

There is **no timer polling** and no SSE/WebSocket (Vercel functions can't hold
an hour-long connection). The endpoint returns every settled `ReportSpend` with
`result_seen_at IS NULL` and stamps it in the same call — only after the lookups succeed, so a failed call can't swallow a result — so each result is claimed once; the claiming tab
passes it to the user's other open tabs over a `BroadcastChannel` (closing the
notice closes it everywhere), so it is
announced exactly once, whether the user stayed on the site or came back days
later. A top-right toast under the navbar (`ReportResultToast`, one divided row per result, stays until closed) shows each one
with the same badges as elsewhere: `[Generated] AAPL (NASDAQ) report is ready.`
or `[Failed · not charged] … You weren't charged.` It then fires
`notifyCreditsChanged()`, so the navbar balance and the report page's
regenerate status re-read, and `router.refresh()` if the user is on that report.

Known gap: a user who stays on one page, in one visible tab, for the whole run
sees the result on their next navigation or tab switch. Closing it would need a
hosted push service (Pusher / Ably) triggered from `settleReportCredit`; the
result email below still reaches them meanwhile.

### Result email

When a paid run settles, `settleReportCredit` emails the user who paid
(`sendReportResultEmail` in `src/utils/credits/report-result-email.ts`):

- **Success** — "Your AAPL (NASDAQ) report is ready" with a **View report** button.
- **Failure** — "We couldn't generate your AAPL (NASDAQ) report", says no
  credit was taken, with a **Go to report** button.

It is sent through AWS SES via `sendEmail` (`@dodao/web-core/api/email/sendEmail`),
from `contact@koalagains.com` — the same setup as the login emails. Links use
`getCanonicalUrl()` (`https://koalagains.com`), so they point at production
even when sent from a local run. Only the call that actually settles the spend
sends (guarded by the `status = InProgress` update), and any email error is
logged and swallowed so it can never break report completion. Admin and nightly runs send
nothing.

It only fires for credit-paid runs: `settleReportCredit` exits early unless an
open `ReportSpend` row exists for the request, and only `spendCreditForReport`
(the user's paid Regenerate) creates one.

**Testing locally:** SES isn't configured locally, so — exactly like the login
email — `sendEmail` prints the recipient, subject and full HTML to the server
terminal before trying to send, and the send then fails with a logged
`AccessDenied`. Paste the printed HTML into a `.html` file to preview it.

### Credits page (`/credits`)

- **History** — read from the Stripe ledger, merged newest first with runs
  still in progress (from `report_spends`). Rows are split by `metadata.type`
  into tabs: `purchase` → **Purchases**, `report_spend` → **Report
  generations**, anything else (refund / dispute debits, manual dashboard
  credits / debits) → **Adjustments**, a tab shown only when there are any.
  Credit changes are
  whole numbers, floored like the balance (floored balance after − floored
  balance before), so a fractional dashboard adjustment (e.g. $0.50) never
  shows as "+0.5". The **Balance** column is the Stripe ledger balance, which
  excludes reservations. Failed runs never
  touched the balance, so they are not in the history; the report page tag,
  toast and email tell the user about them. Report rows link to the stock / ETF page (resolved by
  `reportTargetId` via `getReportHrefs`, so moved tickers still link correctly;
  deleted ones get no link). Purchase rows have a **Receipt** button.
- **Receipts** — the row id is the Stripe balance transaction id, which maps to
  a `stripe_credit_purchases` row. We only store `stripe_payment_intent_id`, so the receipt URL
  is fetched from Stripe on click (payment intent → `latest_charge.receipt_url`)
  instead of being saved in the DB. No invoices are created, so there is no
  invoice number to show.
- **Load more** — the page asks for `?limit=N` and raises it by
  `CREDIT_HISTORY_PAGE_SIZE` (50) per click, capped server-side at 500 rows
  (each 100 rows is one Stripe list call; at the cap `hasMore` is forced false,
  so the button goes away instead of re-fetching the same 500 rows).
- **Return from Checkout** — shows "Adding your credits…" while
  `useCheckoutReturn` confirms the session.

### Why `window.location` instead of `useSearchParams()`

`useSearchParams()` forces every page that renders the credit UI behind a
Suspense boundary or the Next.js build fails. The control is meant to drop into
any report page, so `credit-return-path.ts` reads `window.location` and clears
the markers with `history.replaceState` instead. Do not reintroduce the hook here.

## Configuration

### App Settings (admin → App Settings → **Payments**)

| Key | Kind | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | secret | `sk_live_…` in production, `sk_test_…` locally. Live and test keys see different customers and balances. Also decides which `livemode` the webhook accepts. |
| `STRIPE_WEBHOOK_SECRET` | secret | `whsec_…` of the endpoint pointing at `/api/stripe/webhook`, from the **same Stripe mode** as the secret key. Without it the webhook credits nothing. |
| `STRIPE_PUBLISHABLE_KEY` | plain | `pk_live_…` / `pk_test_…`. Not used by the current Checkout redirect flow; kept for client-side Stripe.js. |
| `STRIPE_CREDIT_PURCHASES_ENABLED` | boolean | Default **OFF**. Blocks new checkouts on the server and hides Buy in the UI. Payments already in progress are still credited. |

Secrets are SSM `SecureString`s on AWS and never have a committed default.
Resolution is **SSM → env var → bundled default** (SSM only when
`APP_CONFIG_SSM_ENABLED=true`). The server caches SSM values for 30 minutes;
saving from the admin screen invalidates that cache, so **flip the purchases
switch from the admin screen** — a value edited directly in SSM can take up to
30 minutes to be picked up (and browsers re-read the switch at most every 5
minutes). Everything is read lazily, so the app boots and every non-credit page
works without the keys; only checkout and the webhook fail, with an explicit
"payments are not configured" message.

### Stripe webhook endpoint (live)

`https://koalagains.com/api/stripe/webhook`, subscribed to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `charge.refunded`
- `charge.dispute.created`
- `charge.dispute.closed`

The endpoint's API version is the account default; when an event's
`api_version` differs from the version stripe-node is pinned to
(`Stripe.API_VERSION`), the webhook logs one `console.warn` per version per
process. The fields read are stable across versions; pin the endpoint to that
version to silence it.

Its signing secret goes in `STRIPE_WEBHOOK_SECRET`.

### Local setup

Use **test keys** locally (`sk_test_…` and the `whsec_…` printed by
`stripe listen`). Do **not** run the live key locally alongside the production
database (`insights-ui/.env` points at prod): live Checkout takes real money,
and live and test customers / balances don't see each other, so mixing modes
against one DB corrupts the `stripe_customer_id` links. Because SSM wins over
env vars, keep `APP_CONFIG_SSM_ENABLED` off locally, or the live key from SSM
overrides your local test key.

```bash
stripe login
stripe listen \
  --events checkout.session.completed,checkout.session.async_payment_succeeded,charge.refunded,charge.dispute.created,charge.dispute.closed \
  --forward-to localhost:3000/api/stripe/webhook   # prints whsec_... → STRIPE_WEBHOOK_SECRET
```

Test card `4242 4242 4242 4242`, any future expiry and CVC. Newer Stripe CLIs
refuse to start without `--events`. Locally the return URL is the request
origin (localhost), so `confirm-checkout` credits a purchase even without
`stripe listen` (refunds and disputes still need it). To check a user in the
dashboard (test mode): Customers → search their email → the customer page shows
the credit balance and its balance transactions with their metadata.

### Tax

Stripe is a payment processor, not a merchant of record, so tax compliance is
ours: register for US sales tax where required, or enable Stripe Tax.

## Monitoring

`logError` writes the line to the server console (shipped to Grafana Loki) and
posts it to Discord. It is used for:

| Where (log prefix) | Failure |
|---|---|
| `[stripe-webhook]` | Payments not configured (500); signature verification failed (400 — a forged request, or a wrong `STRIPE_WEBHOOK_SECRET`, which blocks every purchase); event `livemode` doesn't match the key (400); handler threw (500, Stripe retries). |
| `[credit-purchase]` | `MANUAL REPAIR NEEDED`: the checkout customer is linked to a different user, or differs from the user's linked customer (credits went to the paying customer); a paid session with no customer (nothing credited). `MANUAL CHECK NEEDED`: a won dispute whose debit isn't in the recent ledger (nothing restored). |
| `[checkout-session]` | `MANUAL REPAIR NEEDED`: a buyer's stored Stripe customer no longer exists in Stripe. |
| `[credit-service]` | Report charge failed twice (report kept free); stuck paid run released after 12h (not charged). |

Console only (Loki, no Discord): a request without `stripe-signature` (warn), a
paid session whose user was deleted (error, answered 200), a Stripe balance
that couldn't be read for display or spend, a failed reconciliation pass, and
the normal grant / settle / reversal info lines.

Loki queries (run from `insights-ui/`; the default is errors only, last 24h —
see [grafana-cloud-logging.md](grafana-cloud-logging.md)):

```bash
pnpm logs:fetch --grep stripe-webhook                                  # webhook errors
pnpm logs:fetch --grep "stripe-webhook|credit-purchase" --level all    # every webhook / grant / reversal line
pnpm logs:fetch --grep "credit-service" --level all --hours 6          # spends, settles, reconciliation
pnpm logs:fetch --grep "MANUAL REPAIR"                                 # anything needing a hand fix
pnpm logs:fetch --grep "checkout-session|confirm-checkout" --level all
```

## Go-live checklist

1. **Confirm settings and webhook events.** App Settings → Payments shows
   `STRIPE_SECRET_KEY` (live), `STRIPE_WEBHOOK_SECRET` (from the live endpoint)
   and `STRIPE_PUBLISHABLE_KEY` set. The live endpoint points at
   `https://koalagains.com/api/stripe/webhook` and subscribes to the five events
   above (`charge.dispute.closed` is new — add it to the live endpoint).
2. **Stripe dashboard.** Branding (icon and colours on receipts; the Checkout
   page's name, logo, button colour and border style are also set per session
   via `branding_settings` in the checkout-session route), statement descriptor / prefix (statements read
   "<prefix>* KOALAGAINS"), and support email / URL on receipts. Decide the
   payout currency: add a USD bank account, or accept the conversion fee (see
   [Fees to expect](#fees-to-expect)).
3. **Flip the switch** — `STRIPE_CREDIT_PURCHASES_ENABLED` ON from the admin
   screen (not in SSM directly).
4. **Test purchase** with a real card on your own account (smallest pack).
   Check: the return page shows "Adding your credits…" then "Your credits have
   been added"; the Stripe customer exists with your email and a "-$5.00
   Purchased 5 credits" balance transaction; the webhook delivery returned 200
   (Developers → Webhooks → endpoint → event); a `stripe_credit_purchases` row
   exists and `users.first_purchase_at` is set; the navbar shows the balance.
5. **Replay** that `checkout.session.completed` event from the Stripe
   dashboard: expect 200, a "was already credited" log line, and no second
   balance transaction.
6. **Spend test:** regenerate one report → the request reaches `Completed`,
   exactly one "+$1.00 Report generation for …" transaction, the
   `report_spends` row is `Completed`, the result email arrives.
7. **Refund test:** refund the test payment in the dashboard → a "Removed N
   credits (payment refund)" transaction appears and the balance drops (the
   navbar may take up to 5 minutes).
8. **Watch logs for 24h** (`pnpm logs:fetch --grep "stripe-webhook|credit-"`
   and the Discord alerts).
9. **Rollback** = flip `STRIPE_CREDIT_PURCHASES_ENABLED` OFF from the admin
   screen. Existing balances, spending and payments already in progress are
   unaffected.

## Adding a new report family

Everything family-specific lives in `resolveReportTarget`. Add a
`CreditReportKind` value, a branch that returns the target's id, label,
freshness date, in-flight check and a `createGenerationRequest` callback, then
drop `<ReportGenerationControl kind={...} />` onto the page. The credit service
also reads request tables directly (`storedRequestStatus`, `loadRequestEnds`,
`isTargetFailingRepeatedly` in `credit-service.ts`), and the new family's
finalization must call `settleReportCredit` — add the new table there too.
