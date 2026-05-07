import React from 'react';
import { FinalConclusion } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';

interface FinalConclusionRendererProps {
  finalConclusion: FinalConclusion;
}

/**
 * Renders a FinalConclusion object with styled components
 * This replaces the markdown generation logic from render-tariff-markdown.ts
 */
export const FinalConclusionRenderer: React.FC<FinalConclusionRendererProps> = ({ finalConclusion }) => {
  const title = typeof finalConclusion?.title === 'string' ? finalConclusion.title : '';
  const conclusionBrief = typeof finalConclusion?.conclusionBrief === 'string' ? finalConclusion.conclusionBrief : '';
  const positive = finalConclusion?.positiveImpacts;
  const negative = finalConclusion?.negativeImpacts;
  const finalStatements = typeof finalConclusion?.finalStatements === 'string' ? finalConclusion.finalStatements : '';

  const positiveTitle = typeof positive?.title === 'string' ? positive.title : '';
  const positiveBody = typeof positive?.positiveImpacts === 'string' ? positive.positiveImpacts : '';
  const negativeTitle = typeof negative?.title === 'string' ? negative.title : '';
  const negativeBody = typeof negative?.negativeImpacts === 'string' ? negative.negativeImpacts : '';

  const hasAnyContent = title || conclusionBrief || positiveTitle || positiveBody || negativeTitle || negativeBody || finalStatements;

  if (!hasAnyContent) {
    return (
      <div className="bg-gray-900 rounded-lg p-6 shadow-sm">
        <p className="text-gray-500 italic">No content available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(title || conclusionBrief) && (
        <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          {title && (
            <div className="bg-gray-800 p-4 border-b border-gray-700">
              <h2 className="text-2xl font-bold heading-color">{title}</h2>
            </div>
          )}
          {conclusionBrief && (
            <div className="p-4">
              <div className="prose max-w-none markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(conclusionBrief) }} />
            </div>
          )}
        </div>
      )}

      {(positiveTitle || positiveBody) && (
        <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          {positiveTitle && (
            <div className="bg-gray-800 p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold heading-color">{positiveTitle}</h2>
            </div>
          )}
          {positiveBody && (
            <div className="p-4">
              <div className="prose max-w-none markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(positiveBody) }} />
            </div>
          )}
        </div>
      )}

      {(negativeTitle || negativeBody) && (
        <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          {negativeTitle && (
            <div className="bg-gray-800 p-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold heading-color">{negativeTitle}</h2>
            </div>
          )}
          {negativeBody && (
            <div className="p-4">
              <div className="prose max-w-none markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(negativeBody) }} />
            </div>
          )}
        </div>
      )}

      {finalStatements && (
        <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold heading-color">Final Statements</h2>
          </div>
          <div className="p-4">
            <div className="prose max-w-none markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(finalStatements) }} />
          </div>
        </div>
      )}
    </div>
  );
};
