'use client';

import ReceiptButton from '@/components/credits/ReceiptButton';
import CreditHistoryCard from '@/components/ui/credits/CreditHistoryCard';
import CreditHistoryLayout from '@/components/ui/credits/CreditHistoryLayout';
import StatusBadge from '@/components/ui/StatusBadge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import { CreditTransactionResponse } from '@/types/credits';
import { formatShortDate, formatUsd } from '@/utils/credits/credit-format';
import { REPORT_STATUS_BADGES } from '@/utils/credits/report-status-badges';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import { ReportSpendStatus } from '@prisma/client';
import React, { useState } from 'react';

const GENERATION_COLUMNS = ['Date', 'Activity', 'Credits', 'Balance'];
const GENERATION_COLUMN_WIDTHS = [20, 50, 15, 15];

const PURCHASE_COLUMNS = ['Date', 'Activity', 'Credits', 'Amount'];
const PURCHASE_COLUMN_WIDTHS = [20, 46, 16, 18];

const ADJUSTMENT_COLUMNS = ['Date', 'Activity', 'Credits', 'Balance'];
const ADJUSTMENT_COLUMN_WIDTHS = [20, 50, 15, 15];

type HistoryTab = 'generations' | 'purchases' | 'adjustments';

/**
 * Rows are split by ledger type: report spends are generations, purchases are
 * credits bought (the only rows with a dollar amount and a receipt), and
 * anything else — e.g. a manual credit or debit made in the Stripe dashboard —
 * is an adjustment, which has a balance but no price.
 */
function tabOf(transaction: CreditTransactionResponse): HistoryTab {
  switch (transaction.type) {
    case 'ReportSpend':
      return 'generations';
    case 'Purchase':
      return 'purchases';
    default:
      return 'adjustments';
  }
}

/** "AAPL (NASDAQ)" as a link to its report, or plain text when the report no longer exists. */
function renderReportLabel(label: string, href: string | null): React.ReactNode {
  return href ? <TextLink href={href}>{label}</TextLink> : label;
}

/** The row description with its "AAPL (NASDAQ)" part turned into a link to the report. */
function renderDescription(transaction: CreditTransactionResponse): React.ReactNode {
  const { description, reportLabel, reportHref } = transaction;
  const index = reportLabel ? description.indexOf(reportLabel) : -1;
  if (!reportLabel || index === -1) return description;
  return (
    <>
      {description.slice(0, index)}
      {renderReportLabel(reportLabel, reportHref)}
      {description.slice(index + reportLabel.length)}
    </>
  );
}

function renderBadge(transaction: CreditTransactionResponse): React.ReactNode {
  if (!transaction.reportStatus) return null;
  const badge = REPORT_STATUS_BADGES[transaction.reportStatus];
  // Balances matter on this page, so an unfinished run also says its credit is held.
  const label = transaction.reportStatus === ReportSpendStatus.InProgress ? `${badge.label} · credit reserved` : badge.label;
  return <StatusBadge variant={badge.variant} spinning={badge.spinning} label={label} />;
}

/** A run still in progress has no balance yet: its credit is reserved, not taken. */
function formatBalance(balanceAfter: number | null): string {
  return balanceAfter === null ? '—' : String(balanceAfter);
}

function formatCreditChange(credits: number): string {
  return credits > 0 ? `+${credits}` : String(credits);
}

/** `+$10.00` — what the card was charged, signed like the credits it bought. */
function renderAmount(transaction: CreditTransactionResponse): string {
  if (transaction.amountInCents === null) return '—';
  return `+${formatUsd(transaction.amountInCents)}`;
}

export interface CreditHistoryTabsProps {
  transactions: CreditTransactionResponse[];
  /**
   * Whether a purchase row offers its Stripe receipt. The receipt endpoint is
   * scoped to the signed-in user, so an admin looking at someone else's history
   * cannot open it.
   */
  showReceipts?: boolean;
  /**
   * Older history rows exist beyond `transactions`. All tabs are cut from one
   * mixed, newest-first page, so an empty tab then means "none loaded yet", not
   * "none at all" (e.g. 50 recent spends can hide every purchase).
   */
  hasMore?: boolean;
}

/**
 * A user's credit history as tables behind tabs: the report generations they
 * spent credits on (stocks and ETFs together), the purchases that paid for
 * them, and — only when there are any — manual adjustments. Used by the user's own credits page and by the admin view of any user.
 */
export default function CreditHistoryTabs({ transactions, showReceipts = true, hasMore = false }: CreditHistoryTabsProps): React.JSX.Element {
  // Generations is the default: spending credits is the everyday activity,
  // buying them is the occasional one.
  const [historyTab, setHistoryTab] = useState<HistoryTab>('generations');

  const generationTransactions = transactions.filter((transaction) => tabOf(transaction) === 'generations');
  const purchaseTransactions = transactions.filter((transaction) => tabOf(transaction) === 'purchases');
  const adjustmentTransactions = transactions.filter((transaction) => tabOf(transaction) === 'adjustments');
  // Adjustments are rare (made by hand in Stripe), so their tab only appears when there are some.
  const showAdjustments = adjustmentTransactions.length > 0;

  /**
   * The activity cell: what happened, a status badge for spends, and — for a
   * purchase — the receipt link, which belongs with the description rather than
   * tucked into the Amount column.
   */
  const renderActivity = (transaction: CreditTransactionResponse): React.ReactNode => (
    <>
      {renderDescription(transaction)} {renderBadge(transaction)}
      {showReceipts && transaction.hasReceipt && <ReceiptButton transactionId={transaction.id} />}
    </>
  );

  /** Generations and adjustments share a shape: what happened, the credit change, the balance after. */
  const toGenerationRow = (transaction: CreditTransactionResponse): TableRow => ({
    id: transaction.id,
    item: transaction,
    columns: [
      formatShortDate(transaction.createdAt),
      renderActivity(transaction),
      formatCreditChange(transaction.credits),
      formatBalance(transaction.balanceAfter),
    ],
  });

  const toPurchaseRow = (transaction: CreditTransactionResponse): TableRow => ({
    id: transaction.id,
    item: transaction,
    columns: [formatShortDate(transaction.createdAt), renderActivity(transaction), formatCreditChange(transaction.credits), renderAmount(transaction)],
  });

  /** Phone version of a history row: everything the table shows, stacked. */
  const renderHistoryCard = (transaction: CreditTransactionResponse): React.ReactNode => (
    <CreditHistoryCard
      key={transaction.id}
      title={
        <>
          {renderDescription(transaction)}
          {showReceipts && transaction.hasReceipt && <ReceiptButton transactionId={transaction.id} />}
        </>
      }
      credits={formatCreditChange(transaction.credits)}
      badge={renderBadge(transaction)}
      meta={
        <>
          {formatShortDate(transaction.createdAt)}
          {/* Each card mirrors its own table: amount for a purchase, balance for everything else. */}
          {tabOf(transaction) === 'purchases' ? <> · {renderAmount(transaction)}</> : <> · Balance {formatBalance(transaction.balanceAfter)}</>}
        </>
      }
    />
  );

  return (
    <Tabs value={historyTab} onValueChange={(value: string) => setHistoryTab(value as HistoryTab)}>
      <TabsList>
        <TabsTrigger value="generations">Report generations</TabsTrigger>
        <TabsTrigger value="purchases">Purchases</TabsTrigger>
        {showAdjustments && <TabsTrigger value="adjustments">Adjustments</TabsTrigger>}
      </TabsList>

      <TabsContent value="generations">
        {generationTransactions.length === 0 ? (
          <Text tone="muted">{hasMore ? 'No report generations in the loaded history. Load more to see older activity.' : 'No report generations yet.'}</Text>
        ) : (
          <CreditHistoryLayout
            table={
              <Table
                data={generationTransactions.map(toGenerationRow)}
                columnsHeadings={GENERATION_COLUMNS}
                columnsWidthPercents={GENERATION_COLUMN_WIDTHS}
                firstColumnBold
              />
            }
            cards={generationTransactions.map(renderHistoryCard)}
          />
        )}
      </TabsContent>

      <TabsContent value="purchases">
        {purchaseTransactions.length === 0 ? (
          <Text tone="muted">{hasMore ? 'No credit purchases in the loaded history. Load more to see older activity.' : 'No credit purchases yet.'}</Text>
        ) : (
          <CreditHistoryLayout
            table={
              <Table
                data={purchaseTransactions.map(toPurchaseRow)}
                columnsHeadings={PURCHASE_COLUMNS}
                columnsWidthPercents={PURCHASE_COLUMN_WIDTHS}
                firstColumnBold
              />
            }
            cards={purchaseTransactions.map(renderHistoryCard)}
          />
        )}
      </TabsContent>

      {showAdjustments && (
        <TabsContent value="adjustments">
          <CreditHistoryLayout
            table={
              <Table
                data={adjustmentTransactions.map(toGenerationRow)}
                columnsHeadings={ADJUSTMENT_COLUMNS}
                columnsWidthPercents={ADJUSTMENT_COLUMN_WIDTHS}
                firstColumnBold
              />
            }
            cards={adjustmentTransactions.map(renderHistoryCard)}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
