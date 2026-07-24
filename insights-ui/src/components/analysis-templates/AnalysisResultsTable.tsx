'use client';

import { useState } from 'react';
import { parseMarkdown } from '@/util/parse-markdown';
import { getAnalysisResultColorClasses } from '@/utils/score-utils';
import { SourceLink } from '@/types/prismaTypes';
import { AnalysisTemplateParameterReport, AnalysisTemplateParameter, AnalysisTemplateCategory } from '@prisma/client';
import SourceLinksModal from './SourceLinksModal';

type ParameterReportWithRelations = AnalysisTemplateParameterReport & {
  analysisTemplateParameter: AnalysisTemplateParameter & {
    category: AnalysisTemplateCategory;
  };
};

interface AnalysisResultsTableProps {
  categoryName: string;
  reports: ParameterReportWithRelations[];
}

export default function AnalysisResultsTable({ categoryName, reports }: AnalysisResultsTableProps) {
  const [selectedSources, setSelectedSources] = useState<SourceLink[] | null>(null);
  const [modalTitle, setModalTitle] = useState<string>('');

  const handleViewSources = (sources: SourceLink[], parameterName: string) => {
    setSelectedSources(sources);
    setModalTitle(`Sources for ${parameterName}`);
  };

  const handleCloseModal = () => {
    setSelectedSources(null);
    setModalTitle('');
  };

  return (
    <>
      <div className="bg-bg rounded-2xl border border-border p-4 mb-6">
        <h3 className="text-base font-semibold text-heading pb-2 pl-2 border-b border-border">{categoryName}</h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted w-1/5">Parameter</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted">Analysis Output</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reports.map((report) => {
                const { textColorClass, bgColorClass, displayLabel } = getAnalysisResultColorClasses(report.result);
                const hasSourceLinks = report.sourceLinks && (report.sourceLinks as SourceLink[]).length > 0;

                return (
                  <tr key={report.id} className="hover:bg-surface transition-colors">
                    <td className="py-3 px-3 align-top">
                      <div className="space-y-2">
                        <div className="font-medium text-heading text-xs block">{report.analysisTemplateParameter.name}</div>
                        {report.result && (
                          <div className="block">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${bgColorClass} bg-opacity-20 ${textColorClass}`}>
                              {displayLabel}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="markdown-body text-xs text-muted leading-relaxed" dangerouslySetInnerHTML={{ __html: parseMarkdown(report.output) }} />

                        {hasSourceLinks && (
                          <button
                            onClick={() => handleViewSources(report.sourceLinks as SourceLink[], report.analysisTemplateParameter.name)}
                            className="text-link hover:text-link text-xs font-medium transition-colors"
                          >
                            Sources ({(report.sourceLinks as SourceLink[]).length})
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sources Modal */}
      {selectedSources && <SourceLinksModal open={!!selectedSources} onClose={handleCloseModal} title={modalTitle} sources={selectedSources} />}
    </>
  );
}
