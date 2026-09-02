'use client';

import BuyCreditsPanel from '@/components/credits/BuyCreditsPanel';
import Stack from '@/components/ui/containers/Stack';
import CreditBalanceCard from '@/components/ui/credits/CreditBalanceCard';
import Heading from '@/components/ui/Heading';
import Text from '@/components/ui/Text';
import { KoalaGainsSession } from '@/types/auth';
import { CENTS_PER_CREDIT, CREDIT_CURRENCY, CreditBalanceResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatReports, formatUsd } from '@/utils/credits/credit-format';
import { consumeCreditsPurchasedMarker } from '@/utils/credits/credit-return-path';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

const HISTORY_COLUMNS = ['Date', 'Activity', 'Credits', 'Amount', 'Balance'];
const HISTORY_COLUMN_WIDTHS = [20, 36, 14, 15, 15];

function formatTransactionDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function CreditsPage(): JSX.Element {
  const { data: koalaSession, status: sessionStatus } = useSession();
  const session: KoalaGainsSession | null = koalaSession as KoalaGainsSession | null;

  const router = useRouter();
  const { showNotification } = useNotificationContext();

  const { data, reFetchData } = useFetchData<CreditBalanceResponse>(
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
    showNotification({ type: 'success', message: 'Payment received — your credits have been added.' });
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
  const historyRows: TableRow[] = (data?.transactions ?? []).map((transaction) => ({
    id: transaction.id,
    item: transaction,
    columns: [
      formatTransactionDate(transaction.createdAt),
      transaction.description,
      transaction.credits > 0 ? `+${transaction.credits}` : String(transaction.credits),
      transaction.amountInCents !== null ? formatUsd(transaction.amountInCents) : '—',
      String(transaction.balanceAfter),
    ],
  }));

  return (
    <PageWrapper>
      <Stack gap="xl">
        <Stack gap="sm">
          <Heading as="h1" size="2xl">
            Report credits
          </Heading>
          <Text tone="muted">
            One credit generates one full report, and costs {formatUsd(CENTS_PER_CREDIT)} in {CREDIT_CURRENCY.toUpperCase()}. Credits never expire.
          </Text>
        </Stack>

        <CreditBalanceCard credits={credits} detail={`Enough for ${formatReports(credits)}`} />

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
          <Table
            data={historyRows}
            columnsHeadings={HISTORY_COLUMNS}
            columnsWidthPercents={HISTORY_COLUMN_WIDTHS}
            noDataText="No credit activity yet."
            firstColumnBold
          />
        </Stack>
      </Stack>
    </PageWrapper>
  );
}
