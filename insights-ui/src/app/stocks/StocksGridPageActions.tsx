'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { KoalaGainsSession } from '@/types/auth';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';
import { revalidateStocksPageCache, revalidateIndustryPageCache } from './cache-actions';

export interface StocksGridPageActionsProps {
  session?: KoalaGainsSession;
  currentCountry?: string;
  industryKey?: string;
}
export default function StocksGridPageActions({ session, currentCountry, industryKey }: StocksGridPageActionsProps) {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [
    { key: 'create-reports', label: 'Create Reports' },
    { key: 'manage-analysis-factors', label: 'Manage Analysis Factors' },
    { key: 'manage-industries', label: 'Manage Industries' },
    ...(currentCountry ? [{ key: 'revalidate-country-tag', label: 'Revalidate Country Tag' }] : []),
    ...(currentCountry && industryKey ? [{ key: 'revalidate-industry-tag', label: 'Revalidate Country+Industry Tag' }] : []),
  ];

  return (
    <PrivateWrapper session={session}>
      <EllipsisDropdown
        items={actions}
        className="px-2 py-2"
        onSelect={async (key) => {
          if (key === 'create-reports') {
            router.push(`/admin-v1/create-reports`);
            return;
          }

          if (key === 'manage-analysis-factors') {
            router.push(`/admin-v1/analysis-factors`);
            return;
          }

          if (key === 'manage-industries') {
            router.push(`/admin-v1/industry-management`);
            return;
          }

          if (key === 'revalidate-country-tag' && currentCountry) {
            await revalidateStocksPageCache(currentCountry);
            router.refresh();
            return;
          }

          if (key === 'revalidate-industry-tag' && currentCountry && industryKey) {
            await revalidateIndustryPageCache(currentCountry, industryKey);
            router.refresh();
            return;
          }
        }}
      />
    </PrivateWrapper>
  );
}
