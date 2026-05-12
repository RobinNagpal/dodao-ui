import React from 'react';
import { UnderstandIndustry } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseChapterBodyMarkdown, parseMarkdown } from '@/util/parse-markdown';

interface UnderstandIndustryRendererProps {
  understandIndustry: UnderstandIndustry;
  // When true, render without nested gray-900 cards — sections are H2/H3 headings + content,
  // designed to sit inside a single outer article card (chapter pages).
  flat?: boolean;
}

/**
 * Renders an UnderstandIndustry object with styled components
 * This replaces the markdown generation logic from render-tariff-markdown.ts
 */
export const UnderstandIndustryRenderer: React.FC<UnderstandIndustryRendererProps> = ({ understandIndustry, flat = false }) => {
  const sections = Array.isArray(understandIndustry?.sections) ? understandIndustry.sections : [];
  const title = typeof understandIndustry?.title === 'string' ? understandIndustry.title : '';

  if (!title && sections.length === 0) {
    if (flat) {
      return <p className="text-gray-500 italic">No content available</p>;
    }
    return (
      <div className="bg-gray-900 rounded-lg p-6 shadow-sm">
        <p className="text-gray-500 italic">No content available</p>
      </div>
    );
  }

  if (flat) {
    // The page-level H1 already shows this section's title (see `getEffectivePageTitle` in
    // chapter-section-page.tsx). Skip rendering it again here so we keep one H1 per page.
    return (
      <div className="space-y-8">
        {sections.map((section, index) => {
          const paragraphs = Array.isArray(section?.paragraphs) ? section.paragraphs : [];
          const sectionTitle = typeof section?.title === 'string' ? section.title : '';
          if (!sectionTitle && paragraphs.length === 0) return null;
          return (
            <section key={index}>
              {sectionTitle && <h2 className="text-xl font-semibold heading-color mb-3">{sectionTitle}</h2>}
              <div className="prose max-w-none space-y-4">
                {paragraphs.map((paragraph, pIndex) => (
                  <div key={pIndex} className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseChapterBodyMarkdown(paragraph) }} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {title && (
        <div className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold heading-color">{title}</h2>
          </div>
        </div>
      )}

      {sections.map((section, index) => {
        const paragraphs = Array.isArray(section?.paragraphs) ? section.paragraphs : [];
        const sectionTitle = typeof section?.title === 'string' ? section.title : '';
        if (!sectionTitle && paragraphs.length === 0) return null;
        return (
          <div key={index} className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
            {sectionTitle && (
              <div className="bg-gray-800 p-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold heading-color">{sectionTitle}</h3>
              </div>
            )}
            <div className="p-4">
              <div className="prose max-w-none space-y-4">
                {paragraphs.map((paragraph, pIndex) => (
                  <div key={pIndex} className="markdown markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(paragraph) }} />
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
