import { ReactNode } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { KoalaGainsSession } from '@/types/auth';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import StocksPageLayout from './StocksPageLayout';

interface CountryStocksPageLayoutProps {
  breadcrumbs: BreadcrumbsOjbect[];
  title: string;
  description: string;
  currentCountry: string;
  industryKey?: string;
  session?: KoalaGainsSession | undefined;
  showAppliedFilters?: boolean;
  children: ReactNode;
}

export default function CountryStocksPageLayout(props: CountryStocksPageLayoutProps) {
  return (
    <Tooltip.Provider delayDuration={300}>
      <StocksPageLayout {...props} />
    </Tooltip.Provider>
  );
}
