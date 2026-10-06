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
- **A failed generation is never charged.** The credit is reserved while the
  report runs and only taken in Stripe once it exists, so there is nothing to
  refund.
- **Users never see admin or nightly runs.** While one is running the user
  still sees "Report generated on … · Regenerate", and clicking it reserves a
  credit and queues the user's own full request (it may run alongside the
  admin one — rare enough to accept for the simplicity). Only the user's *own*
  unfinished paid run on the same report blocks another one, so a double click
  or second tab can't charge twice.
- **One date per report.** Not one per section — a single
  `lastReportGeneratedAt` on the ticker / ETF.

### Why packs and not a $1 charge per report

Card processing costs roughly `2.9% + $0.30`. On a standalone $1.00 charge that
is ~33% of revenue. Selling a $10 pack drops the same fee to ~3.2% while the
user still pays $1 per report. This is the whole reason the credit indirection
exists — do not "simplify" it into a per-report charge.

## Workflows in plain English

The short version: **Stripe keeps the money (the credit balance and its
history). Our database keeps track of which reports are being made.**

### How a KoalaGains user is linked to a Stripe customer

- The first time a logged-in user clicks **Buy**, our server asks Stripe to
  create a *customer* for them, with their email and our user id in its
  metadata. Stripe returns an id like `cus_VOIadSH6fYl02t`.
- We save that id on the user (`users.stripe_customer_id`) and reuse it on
  every later purchase.
- The link is **our user id ↔ the Stripe customer id**. It has nothing to do
  with the card: the same card used on two KoalaGains accounts gives two Stripe
  customers, and one user paying with two cards stays one customer.
- The customer is created before the user pays, so having a customer id doesn't
  mean the user has bought anything. That's why there is a separate
  `first_purchase_at`, set only when a payment goes through.

### 1. Buying credits

The user can buy from the `/credits` page, or from the Regenerate pop-up on any
stock / ETF page when they don't have enough credits. Both use the same pack
picker.

1. **User picks a pack** (5 / 10 / 25 / 50 credits) and clicks Buy.
2. **Our server → Stripe:** "create a Checkout page for this customer, $10, and
   remember `userId` and `credits = 10`." Stripe returns a payment page URL.
   (If the user has no Stripe customer yet, it's created first, as above.)
3. **User pays on Stripe's page.** We never see the card.
4. **Stripe sends the user back** to the page they came from. That redirect
   grants nothing; it only shows a "payment received" message.
5. **Stripe → our webhook:** "checkout session `cs_…` is paid." This is the only
   thing that adds credits. Our server then:
   - **→ Stripe:** "add a 10-credit balance transaction to customer `cus_…`"
     (shows as **-$10.00** = $10 of credit). Stripe returns its id (`cbtxn_…`).
   - Saves a `stripe_credit_purchases` row (so a repeated webhook is ignored)
     and sets `first_purchase_at` if it's the first purchase.

**Stripe calls:** create customer (first time only), create checkout session,
then on the webhook one "add balance transaction".

### 2. Seeing the balance (navbar, credits page)

- **Logged out, or never bought** (`first_purchase_at` is empty): show 0 / Buy
  Credits, with **no Stripe call at all**.
- **Has bought before:** read the customer's balance from Stripe, **cached**.
  The cache refreshes by itself whenever the user buys or a report is charged,
  so normal page browsing costs no Stripe calls.
- What we show = Stripe balance − reports still being made (those credits are
  reserved).

### 3. Regenerating a report (spending a credit)

1. **User clicks Regenerate** on a stock / ETF page. A pop-up shows the cost
   (1 credit) and the balance after.
2. **User confirms.** Our server:
   - makes sure this user isn't already generating this same report,
   - **→ Stripe:** reads the live balance (no cache here, it must be exact),
   - checks `balance − reports in progress ≥ 1`,
   - creates the generation request plus a `report_spends` row marked
     **InProgress**. This reserves the credit. **Nothing is taken in Stripe yet.**
   This runs one click at a time per user, so two quick clicks can't spend the
   same last credit.
3. The navbar now shows one credit fewer (it's reserved), and the report page
   shows **Being generated**.

**Stripe calls:** one balance read.

### 4. The report finishes

- **It worked:** our server **→ Stripe:** "take 1 credit from customer `cus_…`"
  (a +$1.00 balance transaction with `symbol`, `exchange`, `country`,
  `generationRequestId` in its metadata). The `report_spends` row becomes
  **Completed**. If that Stripe call fails, the row is still closed and the
  user gets this report free; we don't retry.
- **It failed:** **no Stripe call.** The row becomes **Failed** and the
  reserved credit is simply free again. Nothing was taken, so there is nothing
  to refund.
- Either way the user gets an email, and a pop-up the next time they open or
  switch to the site.

**Stripe calls:** one if it worked, zero if it failed.

### 5. History

- **Report page tags** ("Being generated", "Generated by you on …", "Failed ·
  not charged") come from our database (`report_spends`), not Stripe.
- **`/credits` history** reads the customer's balance transactions from Stripe
  (purchases and charged reports), plus the reports still being made from our
  database. One Stripe call per 100 rows.

### What you see in the Stripe dashboard

Customers → search the user's email → open the customer:

- **Balance:** shown as credit, e.g. "$6.00 credit" = 6 credits (1 credit is
  stored as $1.00).
- **Balance transactions:** "-$10.00 Purchased 10 credits" for a purchase,
  "+$1.00 Report generation for AAPL (NASDAQ)" for each charged report. Open
  one to see its metadata.
- **Payments:** the real card payments ($10 etc.), with receipts.

## Data model

**Stripe is the ledger.** The balance and its history live on the user's Stripe
customer as *customer balance transactions*. The DB only holds what Stripe can't
answer (which runs are still going, dedupe for webhook replays).

| Where | What it holds |
|---|---|
| Stripe customer balance | The balance. In cents, **negative = credit**; 1 credit is stored as 100 cents, so the dashboard reads "$10.00 credit" for 10 credits. `STRIPE_CENTS_PER_CREDIT` is a storage unit, not the price — never change it. |
| Stripe balance transactions | The history. `metadata.type` is `purchase` (with `checkoutSessionId`, `paymentIntentId`, `amountInCents`) or `report_spend` (with `reportKind`, `symbol`, `exchange`, `country`, `generationRequestId`). Anything else (e.g. a manual credit in the dashboard) shows as an `Adjustment`. |
| `users.stripe_customer_id` | `UNIQUE`. Created when the user first opens Checkout — so it is set *before* any payment. |
| `users.first_purchase_at` | Set by the webhook on the first paid purchase. Gates every Stripe balance call: a user without it costs no Stripe call. |
| `report_spends` | One paid run: target, label, `generation_request_id` (`UNIQUE`), `status` (`InProgress` / `Completed` / `Failed`), the Stripe debit txn id, `settled_at`, `result_seen_at`. |
| `stripe_credit_purchases` | Webhook dedupe log + admin "who bought what" (credits, amount, session / payment-intent / Stripe txn ids). Not a ledger. |
| `tickers_v1.last_report_generated_at` | The single freshness date for a stock. |
| `etfs.last_report_generated_at` | Same, for an ETF. |

```
spendable credits = Stripe balance − InProgress report_spends
```

Stripe applies a customer balance to the next invoice it finalizes. Checkout in
`payment` mode without `invoice_creation` never touches it — keep it that way
(no subscriptions, no invoice creation) for these customers.

### Flow and Stripe calls

| Step | What happens | Stripe calls |
|---|---|---|
| Navbar / credits page balance | `getUserCredits`: no `first_purchase_at` → 0. Otherwise a cached `customers.retrieve` (Next cache keyed by the count of purchases + charged runs, so any change misses the cache with no invalidation needed; 5-min backstop for dashboard edits). | 0 or 1 (usually cached) |
| Purchase webhook | `createBalanceTransaction(-credits×100)` with idempotency key `credit-purchase-<sessionId>`, then insert `stripe_credit_purchases`, set `first_purchase_at`. | 1 |
| Click Regenerate | Lock the user row (`SELECT … FOR UPDATE`), refuse if this report already has an `InProgress` spend, read the **live** Stripe balance, refuse if `balance − reserved < 1`, else create the generation request + `InProgress` spend. | 1 |
| Run succeeds | `createBalanceTransaction(+100)` with idempotency key `report-spend-<generationRequestId>`, then mark `Completed`. If Stripe fails the run is still closed as `Completed` with no debit — the user keeps the report free rather than being stuck with a reserved credit. | 1 |
| Run fails | Mark `Failed`. Nothing was taken. | 0 |
| History page | `listBalanceTransactions` (100 per call) + `InProgress` spends from the DB on top. | 1 per 100 rows |

### The idempotency / race guards

These are the parts that must not be "cleaned up":

1. **Purchase: idempotency key + `stripe_credit_purchases.stripe_checkout_session_id UNIQUE`.**
   Stripe retries webhooks for days but its idempotency key only lasts 24h. The
   Stripe call comes first and the row second, so a crash in between is
   finished by the retry (same key → same transaction).
2. **Spend: the user-row lock.** The live balance read and the reserved count
   happen under it, so two simultaneous clicks run one after the other and
   can't both use the last credit.
3. **Settle: charge first, then close the row with `status = InProgress` in the
   filter.** Until the row is closed its credit still counts as reserved, so the
   spendable balance never briefly overstates. Concurrent settles reuse the same
   idempotency key and only one closes the row (and sends the email).

## Code layout

| Path | Responsibility |
|---|---|
| `src/types/credits.ts` | Pack catalog, prices, request/response shapes. Shared by client and server — the single source of truth for what a credit costs. |
| `src/utils/credits/credit-service.ts` | `getUserCredits`, `grantPurchasedCredits`, `spendCreditForReport`, `settleReportCredit`. The credit workflow. |
| `src/utils/credits/stripe-credit-ledger.ts` | Every Stripe balance call: live / cached balance, grant, charge, list. Owns the cents-per-credit unit and the metadata shape. |
| `src/utils/credits/credit-history.ts` | Builds the history page from the Stripe ledger + in-progress spends. |
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
| `GET /api/[spaceId]/users/credits?limit=50` | `withLoggedInUser` | Balance and the latest `limit` Stripe ledger rows (+ `hasMore`), with in-progress runs on top. Rows carry a `reportHref` and a `hasReceipt` flag. |
| `GET /api/[spaceId]/users/credits/balance` | `withLoggedInUser` | Spendable balance only, for the navbar. |
| `GET /api/[spaceId]/users/credits/receipt?transactionId=…` | `withLoggedInUser` | Stripe-hosted receipt URL for one of the user's purchases (`transactionId` = Stripe balance txn id). |
| `POST /api/[spaceId]/users/credits/checkout-session` | `withLoggedInUser` | Creates a Stripe Checkout Session, returns its URL. |
| `GET /api/[spaceId]/users/report-generation` | `withLoggedInUser` | Balance, freshness date, whether the user's own paid run is in flight, and their `lastRegeneration` (date + succeeded) for one report. |
| `POST /api/[spaceId]/users/report-generation` | `withLoggedInUser` | Reserves a credit and queues a full regeneration. |
| `POST /api/[spaceId]/users/credits/report-results` | `withLoggedInUser` | Returns paid runs that finished or failed since the user last looked, and marks them seen (`result_seen_at`). |
| `POST /api/stripe/webhook` | **Stripe signature** | Grants credits after payment. |

Note the deliberate exception to the rule in
[ui-api-routes.md](ui-api-routes.md) that stock/ETF mutations use
`withAdminOrToken`: `report-generation` is a **user-owned** mutation (like
favourites and notes) and is paid for, so it sits on `withLoggedInUser`.

`POST /users/report-generation` never throws for expected outcomes. It returns
`outcome: 'Started' | 'AlreadyInProgress' | 'InsufficientCredits'` as data so
the modal can offer the next step instead of showing an error toast.
`AlreadyInProgress` means the user's own paid run is still going — never an
admin or nightly one.

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
paid alike. (The automation callback `tickers-v1/[ticker]/update-request-status`
also settles the credit when it sets `Completed`/`Failed`, so a paid run can't be
left reserved.) Both now do three things instead of one:

1. Set the request's terminal status (unchanged).
2. Set `lastReportGeneratedAt` **if at least one step completed** — a partial
   run still rewrote part of the report, so the date genuinely moved.
3. Call `settleReportCredit(requestId, succeeded)` — takes the reserved credit
   in Stripe on success, releases it without charging when the request ends in
   `Failed`. A no-op for requests that never held a credit.

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
- **Logged in, no credits** → the *same modal* switches to the pack picker.
  Buying does not navigate away from the report; Stripe returns to the exact
  path and query the user was on, and the modal reopens with the new balance.
- **User's own run in progress** (they hold an unsettled `ReportSpend` for the
  report) → the Regenerate button is hidden and the line shows the
  `[Being generated]` badge. Admin and nightly runs change nothing on the page. There is
  **no polling** —
  generation can take up to an hour, and the new report and date show up on the
  user's next page load.

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

It only fires for credit-paid runs: `settleReportCredit` exits early unless a
`ReportSpend` row exists for the request, and only `spendCreditForReport` (the
user's paid Regenerate) creates one.

**Testing locally:** SES isn't configured locally, so — exactly like the login
email — `sendEmail` prints the recipient, subject and full HTML to the server
terminal before trying to send, and the send then fails with a logged
`AccessDenied`. Paste the printed HTML into a `.html` file to preview it.

### Credits page (`/credits`)

- **History** — read from the Stripe ledger (purchases and charged reports),
  with runs still in progress (from `report_spends`) on top. Failed runs never
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
  (each 100 rows is one Stripe list call; at the cap `hasMore` is false, so the
  button goes away).

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
stripe listen \
  --events checkout.session.completed,checkout.session.async_payment_succeeded \
  --forward-to localhost:3000/api/stripe/webhook   # prints whsec_... → STRIPE_WEBHOOK_SECRET
```

Test card `4242 4242 4242 4242`, any future expiry and CVC. Newer Stripe CLIs
refuse to start without `--events`. To check a user in the dashboard (test
mode): Customers → search their email → the customer page shows the credit
balance and its balance transactions with their metadata.

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
