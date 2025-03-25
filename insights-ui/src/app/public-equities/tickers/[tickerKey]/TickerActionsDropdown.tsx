'use client';

import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useRouter } from 'next/navigation';
import React from 'react';

export interface ReportActionsDropdownProps {
  tickerKey: string;
}

export default function TickerActionsDropdown({ tickerKey }: ReportActionsDropdownProps) {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [{ key: 'debug', label: 'View Debug Page' }];

  return (
    <EllipsisDropdown
      items={actions}
      onSelect={async (key) => {
        if (key === 'debug') {
          router.push(`/public-equities/debug/tickers/${tickerKey}`);
        }
      }}
    />
  );
}
