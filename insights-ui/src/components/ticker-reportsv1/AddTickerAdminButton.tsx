'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { KoalaGainsSession } from '@/types/auth';
import { CompetitorTicker } from '@/utils/ticker-v1-model-utils';
import DocumentPlusIcon from '@heroicons/react/24/solid/DocumentPlusIcon';
import Link from 'next/link';
import React from 'react';

interface AddTickerAdminButtonProps {
  competitor: CompetitorTicker;
  session?: KoalaGainsSession;
}

export default function AddTickerAdminButton({ competitor, session }: AddTickerAdminButtonProps) {
  return (
    <PrivateWrapper session={session}>
      {!competitor.existsInSystem && competitor.companySymbol && (
        <Link className="ml-2" href={`/stocks/${competitor.exchangeSymbol || 'NYSE'}/${competitor.companySymbol}/create`}>
          <DocumentPlusIcon width={25} height={25} />
        </Link>
      )}
    </PrivateWrapper>
  );
}
