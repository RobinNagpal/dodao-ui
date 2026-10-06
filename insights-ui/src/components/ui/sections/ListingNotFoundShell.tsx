import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ListingNotFoundShellProps {
  breadcrumbs: BreadcrumbsOjbect[];
  title: string;
  description: string;
  browseHref: string;
  browseLabel: string;
  sectionTitle: string;
  sectionDescription: string;
  /** Browse grid rendered below the section heading (e.g. industries or ETF asset classes). */
  children: ReactNode;
}

/**
 * Shared 404 layout for stock / ETF pages: a 404 header with browse links, followed by a browse
 * section so visitors have somewhere to go next.
 */
export default function ListingNotFoundShell({
  breadcrumbs,
  title,
  description,
  browseHref,
  browseLabel,
  sectionTitle,
  sectionDescription,
  children,
}: ListingNotFoundShellProps) {
  return (
    <PageWrapper>
      <div className="overflow-x-auto">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
      </div>

      <section className="w-full mb-8 text-center py-10 sm:py-14">
        <p className="inline-block rounded-full px-4 py-1 text-sm font-semibold tracking-wider text-heading bg-surface ring-1 ring-border">404</p>
        <h1 className="mt-4 text-3xl sm:text-4xl font-bold text-heading">{title}</h1>
        <p className="mt-3 text-base text-body max-w-2xl mx-auto">{description}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href={browseHref}
            className="text-sm bg-gradient-to-r from-amber-500 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-black font-medium px-4 py-2 rounded-lg shadow-md"
          >
            {browseLabel}
          </Link>
          <Link href="/" className="text-sm link-color hover:underline">
            Back to home →
          </Link>
        </div>
      </section>

      <div className="w-full mb-8">
        <h2 className="text-xl font-bold text-heading mb-2">{sectionTitle}</h2>
        <p className="text-body text-md mb-4">{sectionDescription}</p>
      </div>

      {children}
    </PageWrapper>
  );
}
