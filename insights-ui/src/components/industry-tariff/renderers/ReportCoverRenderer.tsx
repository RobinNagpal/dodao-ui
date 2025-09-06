import React from 'react';
import { ReportCover } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';

interface ReportCoverRendererProps {
  reportCover: ReportCover;
}

/**
 * Renders a ReportCover object with styled components
 * This replaces the markdown generation logic from render-tariff-markdown.ts
 */
export const ReportCoverRenderer: React.FC<ReportCoverRendererProps> = ({ reportCover }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(reportCover.reportCoverContent) }} />
      </div>
    </div>
  );
};
