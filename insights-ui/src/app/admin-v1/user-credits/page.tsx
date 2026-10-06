'use client';

import Stack from '@/components/ui/containers/Stack';
import Heading from '@/components/ui/Heading';
import SectionLoading from '@/components/ui/SectionLoading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import { AdminCreditUserResponse, AdminCreditUsersResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatShortDate, formatUsd } from '@/utils/credits/credit-format';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';

const COLUMNS = ['User', 'Name', 'Balance', 'Credits bought', 'Amount paid', 'Purchases', 'Reports', 'Last purchase'];
const COLUMN_WIDTHS = [24, 16, 9, 12, 11, 9, 8, 11];

/** Whatever identifies the user best, linked to their credit history. */
function renderUser(user: AdminCreditUserResponse): React.ReactNode {
  return <TextLink href={`/admin-v1/user-credits/${user.userId}`}>{user.email ?? user.name ?? user.username}</TextLink>;
}

function toRow(user: AdminCreditUserResponse): TableRow {
  return {
    id: user.userId,
    item: user,
    columns: [
      renderUser(user),
      // Plenty of accounts are email-only sign-ups, so this is often blank.
      user.name ?? '—',
      // Null when the balance couldn't be read from Stripe for this user.
      user.credits === null ? '—' : String(user.credits),
      String(user.purchasedCredits),
      formatUsd(user.amountSpentInCents),
      String(user.purchaseCount),
      String(user.reportsGenerated),
      formatShortDate(user.lastPurchaseAt),
    ],
  };
}

export default function AdminUserCreditsPage(): React.JSX.Element {
  const { data, error } = useFetchData<AdminCreditUsersResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/admin/credits/users`,
    {},
    'Failed to load credit purchases'
  );

  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Heading as="h1" size="2xl">
          User credits
        </Heading>
        <Text tone="muted">Everyone who has bought report credits, newest purchase first. Open a user to see their full history.</Text>
      </Stack>

      {data ? (
        data.users.length === 0 ? (
          <Text tone="muted">Nobody has bought credits yet.</Text>
        ) : (
          <Table data={data.users.map(toRow)} columnsHeadings={COLUMNS} columnsWidthPercents={COLUMN_WIDTHS} firstColumnBold />
        )
      ) : error ? (
        <Text tone="muted">We could not load credit purchases. Please refresh the page.</Text>
      ) : (
        <SectionLoading />
      )}
    </Stack>
  );
}
