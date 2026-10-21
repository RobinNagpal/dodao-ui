'use client';

import StatCardGrid from '@/components/ui/containers/StatCardGrid';
import Stack from '@/components/ui/containers/Stack';
import Heading from '@/components/ui/Heading';
import SectionLoading from '@/components/ui/SectionLoading';
import Text from '@/components/ui/Text';
import TextLink from '@/components/ui/TextLink';
import { AdminCreditInterestPackResponse, AdminCreditInterestResponse, AdminCreditInterestUserResponse } from '@/types/credits';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { formatShortDate, formatUsd } from '@/utils/credits/credit-format';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React from 'react';

const USER_COLUMNS = ['User', 'Name', 'Clicks', 'Last pack', 'Largest pack', 'Bought before', 'First click', 'Last click'];
const USER_COLUMN_WIDTHS = [24, 16, 8, 10, 10, 10, 11, 11];

const PACK_COLUMNS = ['Pack', 'Clicks', 'Users'];
const PACK_COLUMN_WIDTHS = [40, 30, 30];

function toUserRow(user: AdminCreditInterestUserResponse): TableRow {
  return {
    id: user.userId,
    item: user,
    columns: [
      // Only buyers have a credit history to open.
      user.hasPurchased ? (
        <TextLink key="user" href={`/admin-v1/user-credits/${user.userId}`}>
          {user.email ?? user.name ?? user.username}
        </TextLink>
      ) : (
        user.email ?? user.name ?? user.username
      ),
      user.name ?? '—',
      String(user.clicks),
      `${user.lastPackCredits} credits`,
      `${user.maxPackCredits} credits`,
      user.hasPurchased ? 'Yes' : 'No',
      formatShortDate(user.firstClickAt),
      formatShortDate(user.lastClickAt),
    ],
  };
}

function toPackRow(pack: AdminCreditInterestPackResponse): TableRow {
  return {
    id: pack.packKey,
    item: pack,
    columns: [`${pack.credits} credits`, String(pack.clicks), String(pack.users)],
  };
}

export default function AdminCreditInterestPage(): React.JSX.Element {
  const { data, error } = useFetchData<AdminCreditInterestResponse>(
    `${getBaseUrl()}/api/${KoalaGainsSpaceId}/admin/credits/interest`,
    {},
    'Failed to load credit purchase interest'
  );

  return (
    <Stack gap="md">
      <Stack gap="sm">
        <Heading as="h1" size="2xl">
          Credit purchase interest
        </Heading>
        <Text tone="muted">People who clicked &quot;Buy&quot; while buying credits was switched off in App Settings → Payments. Most recent click first.</Text>
      </Stack>

      {data ? (
        data.totalClicks === 0 ? (
          <Text tone="muted">Nobody has clicked &quot;Buy&quot; while buying was switched off.</Text>
        ) : (
          <Stack gap="lg">
            <StatCardGrid
              stats={[
                { label: 'Interested users', value: String(data.uniqueUsers) },
                { label: 'Total clicks', value: String(data.totalClicks) },
                { label: 'Potential revenue', value: formatUsd(data.potentialRevenueInCents), note: 'Largest pack each user picked' },
              ]}
            />

            <Stack gap="sm">
              <Heading as="h2" size="lg">
                By pack
              </Heading>
              <Table data={data.packs.map(toPackRow)} columnsHeadings={PACK_COLUMNS} columnsWidthPercents={PACK_COLUMN_WIDTHS} firstColumnBold />
            </Stack>

            <Stack gap="sm">
              <Heading as="h2" size="lg">
                By user
              </Heading>
              <Table data={data.users.map(toUserRow)} columnsHeadings={USER_COLUMNS} columnsWidthPercents={USER_COLUMN_WIDTHS} firstColumnBold />
            </Stack>
          </Stack>
        )
      ) : error ? (
        <Text tone="muted">We could not load the data. Please refresh the page.</Text>
      ) : (
        <SectionLoading />
      )}
    </Stack>
  );
}
