'use client';

import BuyCreditsPanel from '@/components/credits/BuyCreditsPanel';
import CreditHistoryTabs from '@/components/credits/CreditHistoryTabs';
import HeaderWithAside from '@/components/ui/containers/HeaderWithAside';
import Stack from '@/components/ui/containers/Stack';
import CreditBalanceCard from '@/components/ui/credits/CreditBalanceCard';
import Heading from '@/components/ui/Heading';
import SectionLoading from '@/components/ui/SectionLoading';
import Text from '@/components/ui/Text';
import { KoalaGainsSession } from '@/types/auth';
import { CENTS_PER_CREDIT, CREDIT_HISTORY_PAGE_SIZE, CreditBalanceResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatUsd } from '@/utils/credits/credit-format';
import { consumeCreditsPurchasedMarker } from '@/utils/credits/credit-return-path';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const LoginPopup = dynamic(() => import('@/components/login/login-popup').then((m) => ({ default: m.LoginPopup })), { ssr: false });

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
          {/* Spinner until the first load finishes, so an empty state never flashes before real rows. */}
          {data ? (
            <>
              <CreditHistoryTabs transactions={data.transactions} hasMore={data.hasMore} />
              {/* "Load more" pages the whole history, so it keeps filling both tabs. */}
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
