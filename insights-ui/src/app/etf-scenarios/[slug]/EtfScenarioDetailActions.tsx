'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { revalidateEtfScenarioCache } from '@/utils/cache-actions';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';

interface Props {
  slug: string;
}

export default function EtfScenarioDetailActions({ slug }: Props) {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [
    { key: 'manage-scenarios', label: 'Manage Scenarios' },
    { key: 'revalidate-detail-cache', label: "Revalidate This Scenario's Cache" },
  ];

  return (
    <PrivateWrapper>
      <EllipsisDropdown
        items={actions}
        className="px-2 py-2"
        onSelect={async (key) => {
          if (key === 'manage-scenarios') {
            router.push('/admin-v1/etf-scenarios');
            return;
          }

          if (key === 'revalidate-detail-cache') {
            await revalidateEtfScenarioCache(slug);
            router.refresh();
            return;
          }
        }}
      />
    </PrivateWrapper>
  );
}
