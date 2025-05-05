'use client';

import DebugFinancialStatements from '@/components/ticker/debug/DebugFinancialStatements';
import DebugMatchingAttachments from '@/components/ticker/debug/DebugMatchingAttachments';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getCriteriaByIds } from '@/lib/industryGroupCriteria';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullNestedTickerReport, LinkedinProfile } from '@/types/public-equity/ticker-report-types';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useEffect, useState } from 'react';
import CriteriaTable from './CriteriaTable';
import DebugTickerInfo from '@/components/ticker/debug/DebugTickerInfo';
import PopulateLatest10QInfoButton from '@/app/public-equities/tickers/[tickerKey]/PopulateLatest10QInfoButton';
import DebugTickerNews from '@/components/ticker/debug/DebugTickerNews';
import PopulateManagementTeamButton from '@/app/public-equities/tickers/[tickerKey]/PopulateManagementTeamButton';

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

  const managementTeam = (tickerReport?.managementTeam as LinkedinProfile[]) || [];

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
          <DebugTickerInfo report={tickerReport} onPostUpdate={onPostUpdate} />
          <DebugTickerNews report={tickerReport} onPostUpdate={onPostUpdate} />
          <h1 className="mt-8 font-bold text-xl">Latest 10Q Info</h1>
          {tickerReport.latest10QInfo ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg">10Q Information</div>
                <PopulateLatest10QInfoButton tickerKey={ticker} onSuccess={onPostUpdate} isRepopulate={true} />
              </div>
              <div className="border-b border-gray-100 text-left">
                <dl className="divide-y text-color">
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium">Reporting Period</dt>
                    <dd className="mt-1 text-sm/6 sm:col-span-2 sm:mt-0">{tickerReport.latest10QInfo.periodOfReport}</dd>
                  </div>
                  <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                    <dt className="text-sm/6 font-medium">SEC 10Q Filing Link</dt>
                    <a href={tickerReport.latest10QInfo.filingUrl} target="_blank" className="link-color mt-1 text-sm/6 sm:col-span-2 sm:mt-0">
                      {tickerReport.latest10QInfo.filingUrl}
                    </a>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <PopulateLatest10QInfoButton tickerKey={ticker} onSuccess={onPostUpdate} />
          )}

          <div className="my-8">
            <div className="font-semibold text-xl text-left my-8">Management Team</div>
            <div className="mx-auto">
              <ul role="list" className="flex flex-wrap justify-center gap-10">
                {managementTeam.length > 0 ? (
                  managementTeam.map((member) => (
                    <li key={member.fullName} className="flex flex-col items-center">
                      <img
                        alt={member.fullName}
                        src={member.profilePicUrl != null ? member.profilePicUrl : '/dummy-avatar.svg'}
                        className="mx-auto size-32 rounded-full"
                      />
                      <h3 className="mt-6 text-base/7 font-semibold tracking-tight">{member.fullName}</h3>
                      <p className="text-sm/6">{member.occupation}</p>
                    </li>
                  ))
                ) : (
                  <PopulateManagementTeamButton tickerKey={ticker} />
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
