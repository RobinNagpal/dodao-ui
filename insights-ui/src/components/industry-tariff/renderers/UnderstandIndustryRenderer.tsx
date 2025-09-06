import React from 'react';
import { UnderstandIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';

interface UnderstandIndustryRendererProps {
  understandIndustry: UnderstandIndustry;
}

/**
 * Renders an UnderstandIndustry object with styled components
 * This replaces the markdown generation logic from render-tariff-markdown.ts
 */
export const UnderstandIndustryRenderer: React.FC<UnderstandIndustryRendererProps> = ({ understandIndustry }) => {
  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold heading-color">{understandIndustry.title}</h2>
        </div>
      </div>

      {/* Sections */}
      {understandIndustry.sections.map((section, index) => (
        <div key={index} className="bg-white dark:bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-50 dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold heading-color">{section.title}</h3>
          </div>
          <div className="p-4">
            <div className="prose max-w-none space-y-4">
              {section.paragraphs.map((paragraph, pIndex) => (
                <div key={pIndex} dangerouslySetInnerHTML={{ __html: parseMarkdown(paragraph) }} />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
