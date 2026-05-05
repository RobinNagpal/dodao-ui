import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { resolveChapterRoute } from '@/utils/tariff-reports/chapter-route-helpers';
import type { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { redirect } from 'next/navigation';
import type React from 'react';

export default async function ChapterReportLayout({ children, params }: { children: React.ReactNode; params: Promise<{ chapterSlug: string }> }) {
  const { chapterSlug } = await params;
  const resolved = resolveChapterRoute(chapterSlug);

  // Layout doesn't 404 — let the leaf page handle that so it can also handle malformed
  // section URLs. We only handle the canonical-URL redirect here so it applies to every
  // descendant route uniformly.
  if (resolved && resolved.canonicalSlug !== chapterSlug) {
    redirect(`/industry-tariff-report/chapter/${resolved.canonicalSlug}`);
  }

  const breadcrumbs: BreadcrumbsOjbect[] = [
    { name: 'Tariff Reports', href: '/tariff-reports', current: false },
    {
      name: resolved ? `Chapter ${resolved.chapter.number.toString().padStart(2, '0')} — ${resolved.chapter.shortName}` : 'Chapter',
      href: resolved ? `/industry-tariff-report/chapter/${resolved.canonicalSlug}` : '/tariff-reports',
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-color">{children}</div>
    </PageWrapper>
  );
}
