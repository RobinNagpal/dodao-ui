import React from 'react';
import { ExecutiveSummary } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';

interface ExecutiveSummaryRendererProps {
  executiveSummary: ExecutiveSummary;
}

/**
 * Renders an ExecutiveSummary object with styled components
 * This replaces the markdown generation logic from render-tariff-markdown.ts
 */
export const ExecutiveSummaryRenderer: React.FC<ExecutiveSummaryRendererProps> = ({ executiveSummary }) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold heading-color">{executiveSummary.title}</h2>
      </div>
      <div className="p-4">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(executiveSummary.executiveSummary) }} />
      </div>
    </div>
  );
};
