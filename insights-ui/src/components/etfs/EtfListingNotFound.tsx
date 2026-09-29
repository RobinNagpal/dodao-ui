import Breadcrumbs from '@/components/ui/Breadcrumbs';
import EmptyStateCard from '@/components/ui/EmptyStateCard';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'No ETFs Found | KoalaGains',
  description: 'This ETF listing has no ETFs. Browse ETFs by category, provider, or asset class on KoalaGains.',
  robots: { index: false, follow: true },
};

const breadcrumbs: BreadcrumbsOjbect[] = [
  { name: 'US ETFs', href: '/etfs', current: false },
  { name: 'Not Found', href: '#', current: true },
];

/**
 * Generic 404 for ETF listing pages (provider / asset class / group / category, US or per-country).
 * Those pages call `notFound()` when the listing is confirmed empty, so Google gets a real 404
 * instead of a soft 404. Re-exported as `not-found.tsx` from each listing route folder.
 */
export default function EtfListingNotFound() {
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <EmptyStateCard
        title="No ETFs found for this listing"
        description="This ETF listing doesn't have any ETFs right now. It may be a provider, category, or asset class we don't cover in this country yet."
        ctaHref="/etfs"
        ctaLabel="Browse All ETFs"
      />
    </PageWrapper>
  );
}
