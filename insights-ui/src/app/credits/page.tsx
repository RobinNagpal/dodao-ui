'use client';

import BuyCreditsPanel from '@/components/credits/BuyCreditsPanel';
import ReceiptButton from '@/components/credits/ReceiptButton';
import HeaderWithAside from '@/components/ui/containers/HeaderWithAside';
import Stack from '@/components/ui/containers/Stack';
import CreditBalanceCard from '@/components/ui/credits/CreditBalanceCard';
import CreditHistoryCard from '@/components/ui/credits/CreditHistoryCard';
import CreditHistoryLayout from '@/components/ui/credits/CreditHistoryLayout';
import Heading from '@/components/ui/Heading';
import StatusBadge from '@/components/ui/StatusBadge';
import SectionLoading from '@/components/ui/SectionLoading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import { KoalaGainsSession } from '@/types/auth';
import { CENTS_PER_CREDIT, CREDIT_HISTORY_PAGE_SIZE, CreditBalanceResponse, CreditTransactionResponse, ReportSpendStatus } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatShortDate, formatUsd } from '@/utils/credits/credit-format';
import { consumeCreditsPurchasedMarker } from '@/utils/credits/credit-return-path';
import { REPORT_STATUS_BADGES } from '@/utils/credits/report-status-badges';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

const HISTORY_COLUMNS = ['Date', 'Activity', 'Credits', 'Amount', 'Balance'];
const HISTORY_COLUMN_WIDTHS = [20, 36, 14, 15, 15];

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
  const label = transaction.reportStatus === 'InProgress' ? `${badge.label} · credit reserved` : badge.label;
  return <StatusBadge variant={badge.variant} label={label} />;
}

function renderActivity(transaction: CreditTransactionResponse): React.ReactNode {
  return (
    <>
      {renderDescription(transaction)} {renderBadge(transaction)}
    </>
  );
}

function formatCreditChange(credits: number): string {
  return credits > 0 ? `+${credits}` : String(credits);
}

/** Phone version of a history row: everything the table shows, stacked. */
function renderHistoryCard(transaction: CreditTransactionResponse): React.ReactNode {
  return (
    <CreditHistoryCard
      key={transaction.id}
      title={renderDescription(transaction)}
      credits={formatCreditChange(transaction.credits)}
      badge={renderBadge(transaction)}
      meta={
        <>
          {formatShortDate(transaction.createdAt)} · Balance {transaction.balanceAfter}
          {transaction.amountInCents !== null && <> · {renderAmount(transaction)}</>}
        </>
      }
    />
  );
}

function renderAmount(transaction: CreditTransactionResponse): React.ReactNode {
  if (transaction.amountInCents === null) return '—';
  return (
    <>
      {formatUsd(transaction.amountInCents)} {transaction.hasReceipt && <ReceiptButton transactionId={transaction.id} />}
    </>
  );
}

export default function CreditsPage(): JSX.Element {
  const { data: koalaSession, status: sessionStatus } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  const router = useRouter();
  const { showNotification } = useNotificationContext();

  // "Load more" raises the limit; the hook refetches when the URL changes and
  // keeps showing the current rows until the longer list arrives.
  const [historyLimit, setHistoryLimit] = useState(CREDIT_HISTORY_PAGE_SIZE);
  const { data, error, loading, reFetchData } = useFetchData<CreditBalanceResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/credits?limit=${historyLimit}`,
    { skipInitialFetch: !session },
    'Failed to load your credits'
  );

  // Returning from Stripe. The webhook is what actually grants the credits, and
  // it can land a moment after the redirect, so re-read the balance instead of
  // trusting the URL.
  useEffect(() => {
    if (!session || !consumeCreditsPurchasedMarker()) {
      return;
    }
    showNotification({ type: 'success', message: 'Payment received. Your credits have been added.' });
    void reFetchData();
  }, [session, showNotification, reFetchData]);

  if (sessionStatus !== 'loading' && !session) {
    return (
      <PageWrapper>
        <Stack gap="md">
          <Heading as="h1" size="2xl">
            Report credits
          </Heading>
          <Text>Sign in to see your credit balance and buy more.</Text>
          <LoginPopup open={true} onClose={() => router.push('/')} />
        </Stack>
      </PageWrapper>
    );
  }

  const credits = data?.credits ?? 0;
  const reservedCredits = data?.reservedCredits ?? 0;
  const historyRows: TableRow[] = (data?.transactions ?? []).map((transaction) => ({
    id: transaction.id,
    item: transaction,
    columns: [
      formatShortDate(transaction.createdAt),
      renderActivity(transaction),
      formatCreditChange(transaction.credits),
      renderAmount(transaction),
      String(transaction.balanceAfter),
    ],
  }));

  return (
    <PageWrapper>
      <Stack gap="xl">
        {/* No balance until it has loaded, so a user with credits never sees a 0 flash. */}
        <HeaderWithAside aside={data && <CreditBalanceCard credits={credits} reserved={reservedCredits} />}>
          <Stack gap="sm">
            <Heading as="h1" size="2xl">
              Report credits
            </Heading>
            <Text tone="muted">Each credit costs {formatUsd(CENTS_PER_CREDIT)} and gets you one full report. Credits never expire.</Text>
          </Stack>
        </HeaderWithAside>

        <Stack gap="md">
          <Heading as="h2" size="lg">
            Buy credits
          </Heading>
          <BuyCreditsPanel />
        </Stack>

        <Stack gap="md">
          <Heading as="h2" size="lg">
            History
          </Heading>
          {/* Spinner until the first load finishes, so "No credit activity yet." never flashes before real rows. */}
          {data ? (
            <>
              {data.transactions.length === 0 ? (
                <Text tone="muted">No credit activity yet.</Text>
              ) : (
                <CreditHistoryLayout
                  table={<Table data={historyRows} columnsHeadings={HISTORY_COLUMNS} columnsWidthPercents={HISTORY_COLUMN_WIDTHS} firstColumnBold />}
                  cards={data.transactions.map(renderHistoryCard)}
                />
              )}
              {data.hasMore && (
                <Button variant="outlined" loading={loading} disabled={loading} onClick={() => setHistoryLimit((limit) => limit + CREDIT_HISTORY_PAGE_SIZE)}>
                  Load more
                </Button>
              )}
            </>
          ) : error ? (
            <Text tone="muted">We could not load your history. Please refresh the page.</Text>
          ) : (
            <SectionLoading />
          )}
        </Stack>
      </Stack>
    </PageWrapper>
  );
}
