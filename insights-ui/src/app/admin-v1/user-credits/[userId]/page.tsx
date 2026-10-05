'use client';

import CreditHistoryTabs from '@/components/credits/CreditHistoryTabs';
import HeaderWithAside from '@/components/ui/containers/HeaderWithAside';
import Stack from '@/components/ui/containers/Stack';
import CreditBalanceCard from '@/components/ui/credits/CreditBalanceCard';
import Heading from '@/components/ui/Heading';
import SectionLoading from '@/components/ui/SectionLoading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import { AdminUserCreditHistoryResponse, CREDIT_HISTORY_PAGE_SIZE } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

export default function AdminUserCreditHistoryPage(): React.JSX.Element {
  const { userId } = useParams<{ userId: string }>();
  const [historyLimit, setHistoryLimit] = useState(CREDIT_HISTORY_PAGE_SIZE);

  const { data, error, loading } = useFetchData<AdminUserCreditHistoryResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/admin/credits/users/${userId}?limit=${historyLimit}`,
    {},
    'Failed to load this user’s credit history'
  );

  return (
    <Stack gap="md">
      <TextLink href="/admin-v1/user-credits">← All credit users</TextLink>

      {data ? (
        <>
          {/* Balance sits beside the heading rather than under it, so the history starts higher up. */}
          <HeaderWithAside aside={<CreditBalanceCard credits={data.credits} reserved={data.reservedCredits} label="User balance" />}>
            <Stack gap="sm">
              <Heading as="h1" size="2xl">
                {data.email ?? data.name ?? data.username}
              </Heading>
              <Text tone="muted">{data.name ? `${data.name} · ` : ''}Report generations and purchases, stocks and ETFs together.</Text>
            </Stack>
          </HeaderWithAside>

          {/* Receipts are hidden: the receipt endpoint only serves the signed-in
              user's own purchases, so an admin cannot open someone else's. */}
          <CreditHistoryTabs transactions={data.transactions} showReceipts={false} />

          {/* "Load more" pages the whole history, so it keeps filling both tabs. */}
          {data.hasMore && (
            <Stack align="start">
              <Button variant="outlined" loading={loading} disabled={loading} onClick={() => setHistoryLimit((limit) => limit + CREDIT_HISTORY_PAGE_SIZE)}>
                Load more
              </Button>
            </Stack>
          )}
        </>
      ) : error ? (
        <Text tone="muted">We could not load this user’s credit history. Please refresh the page.</Text>
      ) : (
        <SectionLoading />
      )}
    </Stack>
  );
}
