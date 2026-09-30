'use client';

import BuyCreditsPanel from '@/components/credits/BuyCreditsPanel';
import HeaderWithAside from '@/components/ui/containers/HeaderWithAside';
import Stack from '@/components/ui/containers/Stack';
import CreditBalanceCard from '@/components/ui/credits/CreditBalanceCard';
import Heading from '@/components/ui/Heading';
import StatusBadge, { type StatusBadgeVariant } from '@/components/ui/StatusBadge';
import SectionLoading from '@/components/ui/SectionLoading';
import Text from '@/components/ui/Text';
import { KoalaGainsSession } from '@/types/auth';
import { CENTS_PER_CREDIT, CreditBalanceResponse, CreditTransactionResponse, ReportSpendStatus } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatUsd } from '@/utils/credits/credit-format';
import { consumeCreditsPurchasedMarker } from '@/utils/credits/credit-return-path';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

const HISTORY_COLUMNS = ['Date', 'Activity', 'Credits', 'Amount', 'Balance'];
const HISTORY_COLUMN_WIDTHS = [20, 36, 14, 15, 15];

const REPORT_STATUS_BADGES: Record<ReportSpendStatus, { variant: StatusBadgeVariant; label: string }> = {
  InProgress: { variant: 'info', label: 'Being generated · credit reserved' },
  Completed: { variant: 'success', label: 'Generated' },
  Refunded: { variant: 'warning', label: 'Failed · refunded' },
};

function renderActivity(transaction: CreditTransactionResponse): React.ReactNode {
  if (!transaction.reportStatus) return transaction.description;
  const badge = REPORT_STATUS_BADGES[transaction.reportStatus];
  return (
    <>
      {transaction.description} <StatusBadge variant={badge.variant} label={badge.label} />
    </>
  );
}

function formatTransactionDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function CreditsPage(): JSX.Element {
  const { data: koalaSession, status: sessionStatus } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  const router = useRouter();
  const { showNotification } = useNotificationContext();

  const { data, error, reFetchData } = useFetchData<CreditBalanceResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/credits`,
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
      formatTransactionDate(transaction.createdAt),
      renderActivity(transaction),
      transaction.credits > 0 ? `+${transaction.credits}` : String(transaction.credits),
      transaction.amountInCents !== null ? formatUsd(transaction.amountInCents) : '—',
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
            <Table
              data={historyRows}
              columnsHeadings={HISTORY_COLUMNS}
              columnsWidthPercents={HISTORY_COLUMN_WIDTHS}
              noDataText="No credit activity yet."
              firstColumnBold
            />
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
