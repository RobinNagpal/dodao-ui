import { REPORT_TYPES_TO_DISPLAY } from '@/types/project/project';
import Link from 'next/link';
import React from 'react';

export default function DebugReportsPage() {
  return (
    <div>
      <div>
        <div>Choose a report to debug:</div>
        {REPORT_TYPES_TO_DISPLAY.map((reportType) => {
          return (
            <Link href={`/crowd-funding/debug/reports/${reportType}`} key={reportType}>
              <a>{reportType}</a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
