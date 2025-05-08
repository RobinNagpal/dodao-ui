import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { FileText } from 'lucide-react';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Ticker Reports | KoalaGains';
  const description =
    'Detailed financial analysis of individual companies. Explore comprehensive company evaluations, financial metrics, and investment insights.';
  const canonicalUrl = 'https://koalagains.com/ticker-reports';

  const keywords = ['ticker reports', 'company analysis', 'financial metrics', 'stock analysis', 'investment research', 'financial statements', 'KoalaGains'];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    keywords,
  };
}

export default async function TickerReportsPage() {
  // Set up breadcrumbs
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Reports',
      href: '/reports',
      current: false,
    },
    {
      name: 'Ticker Reports',
      href: '/ticker-reports',
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-color">
        <div className="mx-auto">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">Reports</h1>

          {/* Ticker Reports Section - Future Implementation */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 border-b border-color pb-2">Ticker Reports</h2>
            <p className="mb-6 text-muted-foreground">
              Detailed analyses of individual financial instruments. Ticker reports will provide comprehensive insights into company performance, market
              positioning, and investment opportunities.
            </p>

            <div className="text-center py-12 background-color rounded-lg shadow-sm border border-color">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Coming Soon</h3>
              <p className="mt-2 text-sm text-muted-foreground">Ticker reports are currently in development and will be available in the near future.</p>
            </div>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
