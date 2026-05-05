import CollapsibleLayout from '@/components/industry-tariff/collapsible-layout';
import MobileNavToggle from '@/components/industry-tariff/mobile-nav-toggle';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { chapterCoverHref, resolveChapterRoute } from '@/utils/tariff-reports/chapter-route-helpers';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { redirect } from 'next/navigation';
import type React from 'react';

export default async function ChapterReportLayout({ children, params }: { children: React.ReactNode; params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  const resolved = resolveChapterRoute(chapterSlug);

  if (resolved && resolved.canonicalSlug !== chapterSlug) {
    redirect(`/industry-tariff-report/chapters/${resolved.canonicalSlug}`);
  }

  // Without a resolved chapter the leaf page will 404 — render bare so the chapter-specific
  // breadcrumb/nav chrome doesn't try to read undefined chapter data.
  if (!resolved) {
    return <PageWrapper>{children}</PageWrapper>;
  }

  const padded = resolved.chapter.number.toString().padStart(2, '0');
  const navTitle = `HTS Chapter ${padded} ${resolved.chapter.shortName}`;
  const basePath = chapterCoverHref(resolved.chapter);

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Tariff Reports', href: '/tariff-reports', current: false },
    { name: `Chapter ${padded} — ${resolved.chapter.shortName}`, href: basePath, current: true },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="mx-auto text-color">
        <div className="mx-auto">
          <div className="block lg:hidden fixed bottom-6 left-6 z-50">
            <MobileNavToggle basePath={basePath} navTitle={navTitle} />
          </div>

          <div className="hidden lg:block">
            <CollapsibleLayout basePath={basePath}>{children}</CollapsibleLayout>
          </div>

          <div className="block lg:hidden">
            <div className="flex min-h-[calc(100vh-10rem)] overflow-hidden rounded-lg border border-color background-color shadow-lg">
              <div className="flex-1 bg-background p-2 sm:p-3">
                <div className="mx-auto max-w-4xl">
                  <div className="relative min-h-[calc(100vh-10rem)] rounded-lg block-bg-color p-2 sm:p-2 shadow-md">
                    <div className="absolute right-0 top-0 h-12 w-12 bg-muted/20">
                      <div className="absolute right-0 top-0 h-0 w-0 border-l-[48px] border-b-[48px] border-l-transparent border-b-[var(--block-bg)]"></div>
                    </div>
                    <div className="prose max-w-none">{children}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
