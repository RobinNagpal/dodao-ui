import React from 'react';
import { FinalConclusion } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseChapterBodyMarkdown, parseMarkdown } from '@/util/parse-markdown';

interface FinalConclusionRendererProps {
  finalConclusion: FinalConclusion;
  // When true, render without nested gray-900 cards — sections become H2 headings + content,
  // designed to sit inside a single outer article card (chapter pages).
  flat?: boolean;
}

/**
 * Renders a FinalConclusion object with styled components
 * This replaces the markdown generation logic from render-tariff-markdown.ts
 */
export const FinalConclusionRenderer: React.FC<FinalConclusionRendererProps> = ({ finalConclusion, flat = false }) => {
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
    if (flat) {
      return <p className="text-muted italic">No content available</p>;
    }
    return (
      <div className="bg-bg rounded-lg p-6 shadow-sm">
        <p className="text-muted italic">No content available</p>
      </div>
    );
  }

  if (flat) {
    const md = parseChapterBodyMarkdown;
    // The page-level H1 already shows `title` (see `getEffectivePageTitle` in chapter-section-page.tsx).
    // Render just the conclusion body here so we keep one H1 per page.
    return (
      <div className="space-y-8">
        {conclusionBrief && (
          <section>
            <div className="prose max-w-none markdown markdown-body" dangerouslySetInnerHTML={{ __html: md(conclusionBrief) }} />
          </section>
        )}

        {(positiveTitle || positiveBody) && (
          <section>
            {positiveTitle && <h2 className="text-xl font-semibold heading-color mb-3">{positiveTitle}</h2>}
            {positiveBody && <div className="prose max-w-none markdown markdown-body" dangerouslySetInnerHTML={{ __html: md(positiveBody) }} />}
          </section>
        )}

        {(negativeTitle || negativeBody) && (
          <section>
            {negativeTitle && <h2 className="text-xl font-semibold heading-color mb-3">{negativeTitle}</h2>}
            {negativeBody && <div className="prose max-w-none markdown markdown-body" dangerouslySetInnerHTML={{ __html: md(negativeBody) }} />}
          </section>
        )}

        {finalStatements && (
          <section>
            <h2 className="text-xl font-semibold heading-color mb-3">Final Statements</h2>
            <div className="prose max-w-none markdown markdown-body" dangerouslySetInnerHTML={{ __html: md(finalStatements) }} />
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {(title || conclusionBrief) && (
        <div className="bg-bg rounded-lg shadow-sm overflow-hidden">
          {title && (
            <div className="bg-surface p-4 border-b border-border">
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
        <div className="bg-bg rounded-lg shadow-sm overflow-hidden">
          {positiveTitle && (
            <div className="bg-surface p-4 border-b border-border">
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
        <div className="bg-bg rounded-lg shadow-sm overflow-hidden">
          {negativeTitle && (
            <div className="bg-surface p-4 border-b border-border">
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
        <div className="bg-bg rounded-lg shadow-sm overflow-hidden">
          <div className="bg-surface p-4 border-b border-border">
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
