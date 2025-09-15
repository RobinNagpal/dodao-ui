'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function StockActions() {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [
    { key: 'create-reports', label: 'Create Reports' },
    { key: 'manage-analysis-factors', label: 'Manage Analysis Factors' },
    { key: 'manage-industries', label: 'Manage Industries' },
  ];

  return (
    <PrivateWrapper>
      <EllipsisDropdown
        items={actions}
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
