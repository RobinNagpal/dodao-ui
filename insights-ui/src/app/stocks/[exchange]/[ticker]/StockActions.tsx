'use client';

import { TickerIdentifier } from '@/app/api/[spaceId]/tickers-v1/generation-requests/route';
import MobileStockActionsMenu, { MobileStockActionsMenuProps } from '@/app/stocks/[exchange]/[ticker]/MobileStockActionsMenu';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import { KoalaGainsSession } from '@/types/auth';
import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Admin-only dropdown + 4 modals (Generate Report, Import Prompt, Edit Stock,
// RawJsonEdit) + the `marked` markdown parser used to preview generated JSON.
// Combined that's >300 lines of UI behind PrivateWrapper. Lazy-loading it
// keeps that bundle off the critical path for the 99%+ non-admin visitors.
const StockActionsAdminPanel = dynamic(() => import('./StockActionsAdminPanel'), { ssr: false });

interface StockActionsProps {
  ticker: TickerIdentifier;
  session?: KoalaGainsSession;
  children?: ReactNode;
  mobileActions: MobileStockActionsMenuProps;
  movedExchange?: string | null;
  movedSymbol?: string | null;
  isDeleted?: boolean;
  websiteUrl?: string | null;
}

export default function StockActions({
  ticker,
  children,
  session,
  mobileActions,
  movedExchange,
  movedSymbol,
  isDeleted,
  websiteUrl,
}: StockActionsProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 z-10">
      <div className="hidden sm:flex flex-wrap items-center gap-2">{children}</div>
      <div className="sm:hidden">
        <MobileStockActionsMenu {...mobileActions} />
      </div>
      <PrivateWrapper session={session}>
        <StockActionsAdminPanel ticker={ticker} movedExchange={movedExchange} movedSymbol={movedSymbol} isDeleted={isDeleted} websiteUrl={websiteUrl} />
      </PrivateWrapper>
    </div>
  );
}
