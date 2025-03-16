'use client';

import { Button } from '@/components/home-page/Button';
import DebugCriterionEvaluation from '@/components/ticker/debug/DebugCriterionEvaluation';
import DebugMatchingAttachments from '@/components/ticker/debug/DebugMatchingAttachments';
import { IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { TickerReport } from '@/types/public-equity/ticker-report-types';
import Input from '@dodao/web-core/components/core/input/Input';
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

      const industryGroupCriteria = await fetch(
        `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/${slugify(report.selectedSector.name)}/${slugify(
          report.selectedIndustryGroup.name
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

  return (
    <PageWrapper>
      <h1>S3 File</h1>
      <div>
        <a href={`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${ticker}/latest-10q-report.json`} target="_blank">
          {`/public-equities/US/tickers/${ticker}/latest-10q-report.json`}
        </a>
      </div>
      {reportExists && report && industryGroupCriteria ? (
        <div>
          <DebugMatchingAttachments report={report} industryGroupCriteria={industryGroupCriteria} />
          <DebugCriterionEvaluation report={report} industryGroupCriteria={industryGroupCriteria} />
        </div>
      ) : (
        <FullPageLoader />
      )}
    </PageWrapper>
  );
}
