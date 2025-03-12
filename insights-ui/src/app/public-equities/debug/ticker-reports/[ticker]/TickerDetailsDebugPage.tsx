'use client';

import { Button } from '@/components/home-page/Button';
import DebugCriterionEvaluation from '@/components/ticker/debug/DebugCriterionEvaluation';
import DebugMatchingAttachments from '@/components/ticker/debug/DebugMatchingAttachments';
import { TickerReport } from '@/types/public-equity/ticker-report-types';
import Input from '@dodao/web-core/components/core/input/Input';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useEffect, useState } from 'react';

export default function TickerDetailsDebugPage({ ticker }: { ticker: string }) {
  // New state for section-specific regeneration confirmation
  const [reportExists, setReportExists] = useState(false);
  const [report, setReport] = useState<TickerReport>();

  const checkReportExists = async () => {
    const response = await fetch(`https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/tickers/${ticker}/latest-10q-report.json`, {
      cache: 'no-cache',
    });
    if (response.status === 200) {
      setReportExists(true);
      const report: TickerReport = await response.json();
      setReport(report);
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
      {reportExists && report && (
        <div>
          <DebugMatchingAttachments report={report} />
          <DebugCriterionEvaluation report={report} />
        </div>
      )}
    </PageWrapper>
  );
}
