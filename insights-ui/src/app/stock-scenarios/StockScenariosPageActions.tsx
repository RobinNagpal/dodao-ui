'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { revalidateStockScenariosListingCache } from '@/utils/cache-actions';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function StockScenariosPageActions() {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [
    { key: 'manage-scenarios', label: 'Manage Scenarios' },
    { key: 'revalidate-listing-cache', label: 'Revalidate Scenarios Cache' },
  ];

  return (
    <PrivateWrapper>
      <EllipsisDropdown
        items={actions}
        className="px-2 py-2"
        onSelect={async (key) => {
          if (key === 'manage-scenarios') {
            router.push('/admin-v1/stock-scenarios');
            return;
          }

          if (key === 'revalidate-listing-cache') {
            await revalidateStockScenariosListingCache();
            router.refresh();
            return;
          }
        }}
      />
    </PrivateWrapper>
  );
}
