'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';
import { revalidatePortfolioManagersByTypeCache } from '@/utils/cache-actions';
import { PortfolioManagerType } from '@/types/portfolio-manager';

export interface PortfolioManagersPageActionsProps {
  managerType: PortfolioManagerType;
}

export default function PortfolioManagersPageActions({ managerType }: PortfolioManagersPageActionsProps) {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [{ key: 'revalidate-type-tag', label: 'Invalidate Cache' }];

  return (
    <PrivateWrapper>
      <EllipsisDropdown
        items={actions}
        className="px-2 py-2"
        onSelect={async (key) => {
          if (key === 'revalidate-type-tag') {
            await revalidatePortfolioManagersByTypeCache(managerType);
            router.refresh();
            return;
          }
        }}
      />
    </PrivateWrapper>
  );
}
