import { CreditReportKind, CreditTransactionType } from '@prisma/client';

/** Credits burned by one report generation. */
export const CREDITS_PER_REPORT = 1;

/** Everything is priced and charged in US dollars. */
export const CREDIT_CURRENCY = 'usd';

/** One credit costs exactly $1.00, so "1 report = $1" holds for every pack. */
export const CENTS_PER_CREDIT = 100;

export interface CreditPack {
  key: string;
  credits: number;
  amountInCents: number;
  /** Highlighted as the default choice in the buy-credits UI. */
  recommended?: boolean;
}

/**
 * The packs offered at checkout. Deliberately no bonus credits: a credit is
 * always worth exactly one report and exactly $1, which keeps the pricing
 * explainable in a single sentence. Larger packs exist only to amortize the
 * fixed card-processing fee (~$0.30 per charge) over more reports.
 */
export const CREDIT_PACKS: CreditPack[] = [
  { key: 'credits-5', credits: 5, amountInCents: 5 * CENTS_PER_CREDIT },
  { key: 'credits-10', credits: 10, amountInCents: 10 * CENTS_PER_CREDIT, recommended: true },
  { key: 'credits-25', credits: 25, amountInCents: 25 * CENTS_PER_CREDIT },
  { key: 'credits-50', credits: 50, amountInCents: 50 * CENTS_PER_CREDIT },
];

export function getCreditPack(packKey: string): CreditPack | undefined {
  return CREDIT_PACKS.find((pack) => pack.key === packKey);
}

/** What a regeneration rewrites, listed in the confirm modal. */
export const REFRESHED_SECTIONS: Record<CreditReportKind, string[]> = {
  [CreditReportKind.Stock]: [
    'Business & moat',
    'Financial analysis',
    'Past performance',
    'Future growth',
    'Fair value',
    'Competition',
    'Management team',
    'Stability',
    'Final summary',
  ],
  [CreditReportKind.Etf]: [
    'Performance & returns',
    'Cost efficiency & team',
    'Risk analysis',
    'Future performance outlook',
    'Key facts',
    'Competition',
    'Final summary',
  ],
};

/** Query param appended to the return URL after a successful Stripe Checkout. */
export const CREDITS_PURCHASED_QUERY_PARAM = 'creditsPurchased';

/**
 * Where a report spend stands. The credit is taken when the report is queued so
 * it can't be spent twice, but it only counts as used once the report exists:
 * until then it is shown as reserved, and a failed report gets it back.
 */
export type ReportSpendStatus = 'InProgress' | 'Completed' | 'Refunded';

export interface CreditTransactionResponse {
  id: string;
  type: CreditTransactionType;
  credits: number;
  balanceAfter: number;
  description: string;
  amountInCents: number | null;
  reportLabel: string | null;
  /** Link to the stock / ETF page the row is about, when it still exists. */
  reportHref: string | null;
  /** Only set on report spends. */
  reportStatus: ReportSpendStatus | null;
  /** True for purchases, whose Stripe receipt can be opened. */
  hasReceipt: boolean;
  createdAt: string;
}

/** History rows per "Load more" click on the credits page. */
export const CREDIT_HISTORY_PAGE_SIZE = 50;

export interface CreditBalanceResponse {
  credits: number;
  /** Credits held by reports that are still being generated. */
  reservedCredits: number;
  transactions: CreditTransactionResponse[];
  /** True when older history rows exist beyond `transactions`. */
  hasMore: boolean;
}

/** A paid regeneration that finished since the user last looked. */
export interface ReportResult {
  id: string;
  reportLabel: string;
  reportHref: string | null;
  /** False when it failed and the credit was refunded. */
  succeeded: boolean;
}

export interface ReportResultsResponse {
  results: ReportResult[];
}

export interface CreditReceiptResponse {
  receiptUrl: string;
}

/** One row of the admin "user credits" list: a user who has bought credits. */
export interface AdminCreditUserResponse {
  userId: string;
  name: string | null;
  email: string | null;
  username: string;
  /** Spendable balance right now. */
  credits: number;
  /** Credits bought, summed over every purchase. */
  purchasedCredits: number;
  /** Total charged across those purchases, in USD cents. */
  amountSpentInCents: number;
  purchaseCount: number;
  lastPurchaseAt: string;
  /** Credit-paid report generations, stocks and ETFs together. */
  reportsGenerated: number;
}

export interface AdminCreditUsersResponse {
  users: AdminCreditUserResponse[];
}

/** One user's full credit history, as the admin sees it. */
export interface AdminUserCreditHistoryResponse {
  userId: string;
  name: string | null;
  email: string | null;
  username: string;
  credits: number;
  reservedCredits: number;
  transactions: CreditTransactionResponse[];
  hasMore: boolean;
}

/** Balance only, for the navbar pill. */
export interface CreditBalanceSummaryResponse {
  credits: number;
}

export interface CreateCheckoutSessionRequest {
  packKey: string;
  /**
   * Same-origin path to come back to once payment succeeds — the report page
   * the user started from, so buying credits never loses their place. Absolute
   * URLs are rejected server-side to keep this from becoming an open redirect.
   */
  returnPath: string;
}

export interface CreateCheckoutSessionResponse {
  checkoutUrl: string;
}

export interface ReportTargetRequest {
  kind: CreditReportKind;
  symbol: string;
  exchange: string;
}

export interface ReportGenerationStatusResponse {
  credits: number;
  creditsPerReport: number;
  lastReportGeneratedAt: string | null;
  /**
   * True while a regeneration this user paid for is queued or running. Admin and
   * nightly runs are deliberately not reported: users never see them.
   */
  generationInProgress: boolean;
  /** This user's most recent finished paid regeneration of the report, if any. */
  lastRegeneration: LastRegeneration | null;
}

export interface LastRegeneration {
  /** When it finished (or failed). */
  finishedAt: string;
  /** False when it failed and the credit was refunded. */
  succeeded: boolean;
}

/**
 * Why a regeneration request did or did not start. Expected outcomes are
 * reported as data rather than thrown, so the UI can explain them calmly
 * instead of surfacing a generic error toast.
 */
export type ReportGenerationOutcome = 'Started' | 'AlreadyInProgress' | 'InsufficientCredits';

export interface TriggerReportGenerationResponse extends ReportGenerationStatusResponse {
  outcome: ReportGenerationOutcome;
}
