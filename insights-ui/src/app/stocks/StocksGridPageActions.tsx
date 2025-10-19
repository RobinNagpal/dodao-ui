'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { KoalaGainsSession } from '@/types/auth';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface StocksGridPageActionsProps {
  session?: KoalaGainsSession;
}
export default function StocksGridPageActions({ session }: StocksGridPageActionsProps) {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [
    { key: 'create-reports', label: 'Create Reports' },
    { key: 'manage-analysis-factors', label: 'Manage Analysis Factors' },
    { key: 'manage-industries', label: 'Manage Industries' },
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
          }

          if (key === 'manage-industries') {
            router.push(`/admin-v1/industry-management`);
          }
        }}
      />
    </PrivateWrapper>
  );
}
