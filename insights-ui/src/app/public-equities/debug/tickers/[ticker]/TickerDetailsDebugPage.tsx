'use client';

import CriteriaTable from './CriteriaTable';
import DebugCriterionEvaluation from '@/components/ticker/debug/DebugCriterionEvaluation';
import DebugMatchingAttachments from '@/components/ticker/debug/DebugMatchingAttachments';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getGicsNames } from '@/lib/gicsHelper';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { useEffect, useState } from 'react';

export default function TickerDetailsDebugPage({ ticker }: { ticker: string }) {
  // New state for section-specific regeneration confirmation
  const [reportExists, setReportExists] = useState(false);
  const [report, setReport] = useState<FullNestedTickerReport>();
  const [industryGroupCriteria, setIndustryGroupCriteria] = useState<IndustryGroupCriteriaDefinition>();

  const checkReportExists = async () => {
    const response = await fetch(`${getBaseUrl()}/api/tickers/${ticker}`, { cache: 'no-cache' });
    if (response.status === 200) {
      setReportExists(true);
      const report: FullNestedTickerReport = await response.json();
      setReport(report);
      const { sectorName, industryGroupName } = getGicsNames(report.sectorId, report.industryGroupId);
      const industryGroupCriteria = await fetch(
        `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/${slugify(sectorName)}/${slugify(
          industryGroupName
        )}/custom-criteria.json`,
        { cache: 'no-cache' }
      );

      if (industryGroupCriteria.status === 200) {
        setIndustryGroupCriteria(await industryGroupCriteria.json());
      }
    } else {
      setReportExists(false);
    }
  };

  useEffect(() => {
    checkReportExists();
  }, []);

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

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      {reportExists && report && industryGroupCriteria ? (
        <div>
          <DebugMatchingAttachments report={report} industryGroupCriteria={industryGroupCriteria} />
          <CriteriaTable
            sectorName={industryGroupCriteria.selectedSector.name}
            industryGroupName={industryGroupCriteria.selectedIndustryGroup.name}
            customCriteria={industryGroupCriteria}
            ticker={ticker}
          />
          <DebugCriterionEvaluation tickerReport={report} industryGroupCriteria={industryGroupCriteria} />
        </div>
      ) : (
        <FullPageLoader />
      )}
    </PageWrapper>
  );
}
