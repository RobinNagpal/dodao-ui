import { REPORT_TYPES_TO_DISPLAY } from '@/types/project/project';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';
import React from 'react';

export default function DebugReportsPage() {
  return (
    <PageWrapper>
      <div className="text-color">
        <div>Choose a report to debug:</div>
        {REPORT_TYPES_TO_DISPLAY.map((reportType) => {
          return (
            <Link href={`/crowd-funding/debug/reports/${reportType}`} key={reportType}>
              <div className="link-color hover:underline">{reportType}</div>
            </Link>
          );
        })}
      </div>
    </PageWrapper>
  );
}
