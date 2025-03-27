'use client';

import DebugFinancialStatements from '@/components/ticker/debug/DebugFinancialStatements';
import DebugMatchingAttachments from '@/components/ticker/debug/DebugMatchingAttachments';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getCriteriaByIds } from '@/lib/industryGroupCriteria';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect, useState } from 'react';
import CriteriaTable from './CriteriaTable';

export default function TickerDetailsDebugPage({ ticker }: { ticker: string }) {
  // New state for section-specific regeneration confirmation

  const [industryGroupCriteria, setIndustryGroupCriteria] = useState<IndustryGroupCriteriaDefinition>();
  const {
    data: tickerReport,
    loading,
    error,
    reFetchData,
  } = useFetchData<FullNestedTickerReport>(`${getBaseUrl()}/api/tickers/${ticker}`, { cache: 'no-cache' }, 'Failed to fetch ticker report');

  const fetchIndustryGroupCriteria = async (sectorId: number, industryGroupId: number) => {
    const industryGroupCriteria = await getCriteriaByIds(sectorId, industryGroupId);
    setIndustryGroupCriteria(industryGroupCriteria);
  };
  useEffect(() => {
    if (tickerReport?.sectorId && tickerReport?.industryGroupId) {
      fetchIndustryGroupCriteria(tickerReport.sectorId, tickerReport.industryGroupId);
    }
  }, [tickerReport]);

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Debug',
      href: `/public-equities/debug/`,
      current: false,
    },
    {
      name: 'Debug Tickers',
      href: `/public-equities/debug/tickers`,
      current: false,
    },
    {
      name: 'Debug ' + ticker,
      href: `/public-equities/debug/tickers/${ticker}`,
      current: true,
    },
  ];

  const onPostUpdate = async () => {
    await reFetchData();
  };
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      {loading && <FullPageLoader />}
      {error && <div className="text-red-500">{error}</div>}
      {tickerReport && industryGroupCriteria && (
        <div>
          <DebugFinancialStatements report={tickerReport} industryGroupCriteria={industryGroupCriteria} onPostUpdate={onPostUpdate} />
          <DebugMatchingAttachments report={tickerReport} industryGroupCriteria={industryGroupCriteria} onPostUpdate={onPostUpdate} />
          <CriteriaTable
            sectorName={industryGroupCriteria.selectedSector.name}
            industryGroupName={industryGroupCriteria.selectedIndustryGroup.name}
            customCriteria={industryGroupCriteria}
            ticker={ticker}
          />
        </div>
      )}
    </PageWrapper>
  );
}
