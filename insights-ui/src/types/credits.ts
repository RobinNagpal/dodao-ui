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

/** Query param appended to the return URL after a successful Stripe Checkout. */
export const CREDITS_PURCHASED_QUERY_PARAM = 'creditsPurchased';

export interface CreditTransactionResponse {
  id: string;
  type: CreditTransactionType;
  credits: number;
  balanceAfter: number;
  description: string;
  amountInCents: number | null;
  reportLabel: string | null;
  createdAt: string;
}

export interface CreditBalanceResponse {
  credits: number;
  transactions: CreditTransactionResponse[];
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
  /** True while a generation request for this report is queued or running. */
  generationInProgress: boolean;
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
