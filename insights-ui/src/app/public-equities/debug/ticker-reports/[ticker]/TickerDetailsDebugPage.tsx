'use client';

import DebugCriterionEvaluation from '@/components/ticker/debug/DebugCriterionEvaluation';
import DebugMatchingAttachments from '@/components/ticker/debug/DebugMatchingAttachments';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { getGicsNames } from '@/lib/gicsHelper';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { TickerReport } from '@/types/public-equity/ticker-report-types';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { slugify } from '@dodao/web-core/utils/auth/slugify';
import { useEffect, useState } from 'react';

export default function TickerDetailsDebugPage({ ticker }: { ticker: string }) {
  // New state for section-specific regeneration confirmation
  const [reportExists, setReportExists] = useState(false);
  const [report, setReport] = useState<TickerReport>();
  const [industryGroupCriteria, setIndustryGroupCriteria] = useState<IndustryGroupCriteriaDefinition>();

  const checkReportExists = async () => {
    const response = await fetch(`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${ticker}/latest-10q-report.json`, {
      cache: 'no-cache',
    });
    if (response.status === 200) {
      setReportExists(true);
      const report: TickerReport = await response.json();
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
      name: 'Debug Tickers',
      href: `/public-equities/debug/ticker-reports`,
      current: false,
    },
    {
      name: 'Debug ' + ticker,
      href: `/public-equities/debug/ticker-reports/${ticker}`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <h1>S3 File</h1>
      <div>
        <a href={`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${ticker}/latest-10q-report.json`} target="_blank">
          {`/public-equities/US/tickers/${ticker}/latest-10q-report.json`}
        </a>
      </div>
      {reportExists && report && industryGroupCriteria ? (
        <div>
          <DebugMatchingAttachments report={report} industryGroupCriteria={industryGroupCriteria} />
          <DebugCriterionEvaluation tickerReport={report} industryGroupCriteria={industryGroupCriteria} />
        </div>
      ) : (
        <FullPageLoader />
      )}
    </PageWrapper>
  );
}
