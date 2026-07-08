import PrivateWrapper from '@/components/auth/PrivateWrapper';
import ChapterRelatedSections from '@/components/industry-tariff/chapter/ChapterRelatedSections';
import ChapterSectionActions, { type ChapterSectionAction } from '@/components/industry-tariff/chapter/ChapterSectionActions';
import { ChapterRouteInfo } from '@/utils/tariff-reports/chapter-route-helpers';
import type { ReactNode } from 'react';

interface ChapterPlaceholderProps {
  chapter: ChapterRouteInfo;
  // Title shown above the placeholder, e.g. "Tariff Updates" for a section page or chapter name for the cover.
  pageTitle: string;
  // Optional sub-section the user is currently looking at — exclude it from the section nav block.
  currentSectionSlug?: string;
  description: string;
  // Admin actions surfaced above the placeholder body. Mirrors `ChapterSectionHeader` so admins can
  // generate the missing section directly from this page instead of jumping to the admin table.
  actions?: ChapterSectionAction[];
  // Optional "Tools for this chapter" block rendered between the header and the placeholder notice.
  // Passed in pre-built so the placeholder stays a client-safe sync component.
  toolsCrossLinks?: ReactNode;
}

export default function ChapterPlaceholder({ chapter, pageTitle, currentSectionSlug, description, actions, toolsCrossLinks }: ChapterPlaceholderProps) {
  const padded = chapter.number.toString().padStart(2, '0');
  const currentSlug = currentSectionSlug ?? 'overview';

  return (
    <div className="py-4">
      <article className="bg-bg rounded-lg shadow-sm border border-color p-3 sm:p-6 md:p-8">
        {toolsCrossLinks}
        <ChapterRelatedSections chapter={chapter} currentSlug={currentSlug} />

        <header className="mb-6 pb-4 border-b border-color">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight heading-color">{pageTitle}</h1>
              <p className="mt-3 max-w-3xl text-muted-foreground">{description}</p>
            </div>
            {actions && actions.length > 0 && (
              <PrivateWrapper>
                <ChapterSectionActions chapterSlug={chapter.slug} actions={actions} />
              </PrivateWrapper>
            )}
          </div>
        </header>

        <section className="rounded-lg border border-border/60 bg-surface/40 p-5">
          <h2 className="text-lg font-semibold">Detailed analysis is being prepared</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;re building out the full tariff analysis for HTS Chapter {padded} ({chapter.title}). Use the navigation below to explore the sections of
            this chapter as content rolls out.
          </p>
        </section>
      </article>
    </div>
  );
}
