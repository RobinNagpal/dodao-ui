import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { ChartBar, FileText } from 'lucide-react';
import { Metadata } from 'next';
import Link from 'next/link';

// not using this file yet, but setting up for future use
// we were using it before, but now we have moved the ticker reports to a separate page
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

  // Features of upcoming Ticker Reports
  const features = [
    'Comprehensive financial metrics and ratios',
    'Historical performance tracking and visualization',
    'Competitive landscape analysis',
    'Management team evaluation',
    'Growth projections and valuation models',
    'Risk assessment frameworks',
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
            <p className="mb-8 text-muted-foreground">
              Detailed analyses of individual financial instruments. Ticker reports provide comprehensive insights into company performance, market positioning,
              and investment opportunities. Our advanced AI-driven analysis helps investors identify valuable opportunities and potential risks.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
              <div className="background-color rounded-lg shadow-sm border border-color p-6">
                <h3 className="text-xl font-medium mb-4">What to Expect</h3>
                <p className="mb-4 text-muted-foreground">
                  Our upcoming Ticker Reports will provide deep dives into individual companies, utilizing sophisticated analysis techniques and comprehensive
                  data sources.
                </p>
                <ul className="space-y-2">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2 text-primary-color">•</span>
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-center py-12 background-color rounded-lg shadow-sm border border-color flex flex-col items-center justify-center">
                <ChartBar className="mx-auto h-12 w-12 text-primary-color mb-4" />
                <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Launching Soon
                </div>
                <h3 className="text-xl font-medium mb-2">Ticker Reports</h3>
                <p className="text-muted-foreground px-6">
                  We are putting the finishing touches on our Ticker Reports. Be among the first to gain access to these powerful analytical tools
                </p>
                <Link
                  href="/reports"
                  className="mt-6 inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                >
                  Back to Reports
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageWrapper>
  );
}
