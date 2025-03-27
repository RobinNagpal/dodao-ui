'use client';

import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Ticker } from '@prisma/client';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface ActionsDropdownProps {
  tickerKey: string;
  criterionKey: string;
}

export default function CriterionActionsDropdown({ tickerKey, criterionKey }: ActionsDropdownProps) {
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [{ key: 'debug', label: 'Debug Page' }];

  return (
    <EllipsisDropdown
      items={actions}
      onSelect={async (key) => {
        if (key === 'debug') {
          router.push(`/public-equities/debug/tickers/${tickerKey}/criteria/${criterionKey}`);
        }
      }}
    />
  );
}
