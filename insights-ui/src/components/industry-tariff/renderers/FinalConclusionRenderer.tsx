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
  return (
    <div className="space-y-8">
      {/* Title and Conclusion Brief */}
      <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold heading-color">{finalConclusion.title}</h2>
        </div>
        <div className="p-4">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(finalConclusion.conclusionBrief) }} />
        </div>
      </div>

      {/* Positive Impacts */}
      <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold heading-color">{finalConclusion.positiveImpacts.title}</h2>
        </div>
        <div className="p-4">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(finalConclusion.positiveImpacts.positiveImpacts) }} />
        </div>
      </div>

      {/* Negative Impacts */}
      <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold heading-color">{finalConclusion.negativeImpacts.title}</h2>
        </div>
        <div className="p-4">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(finalConclusion.negativeImpacts.negativeImpacts) }} />
        </div>
      </div>

      {/* Final Statements */}
      <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-800 p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold heading-color">Final Statements</h2>
        </div>
        <div className="p-4">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(finalConclusion.finalStatements) }} />
        </div>
      </div>
    </div>
  );
};
