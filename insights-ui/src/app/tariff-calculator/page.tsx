import CalculatorClient from './CalculatorClient';
import BreadcrumbsWithJsonLd from '@/components/ui/BreadcrumbsWithJsonLd';
import ToolPills from '@/components/tariff-cross-links/ToolPills';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { FileText, ListTree } from 'lucide-react';
import { Metadata } from 'next';

export const dynamic = 'force-static';

const PAGE_URL = 'https://koalagains.com/tariff-calculator';
const PAGE_TITLE = 'US Tariff & Duty Calculator | KoalaGains';
const PAGE_DESCRIPTION =
  'Free US import duty calculator. Search what you ship, pick its HTS code, and see the full cost — base HTS rate, Section 232, 301 and IEEPA tariffs, plus the usual port and processing fees.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    siteName: 'KoalaGains',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  keywords: [
    'tariff calculator',
    'US import duty calculator',
    'HTS duty calculator',
    'HTSUS calculator',
    'Section 301 tariff calculator',
    'Section 232 tariff calculator',
    'IEEPA tariff calculator',
    'landed cost calculator',
    'import duty estimator',
    'customs duty calculator',
    'China tariff calculator',
    'Mexico tariff calculator',
    'Canada tariff calculator',
  ],
};

const BREADCRUMBS: BreadcrumbsOjbect[] = [
  { name: 'Reports', href: '/reports', current: false },
  { name: 'Tariff Reports', href: '/tariff-reports', current: false },
  { name: 'Tariff Calculator', href: '/tariff-calculator', current: true },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'US Tariff & Duty Calculator',
  url: PAGE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  description: PAGE_DESCRIPTION,
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'KoalaGains', url: 'https://koalagains.com' },
};

export default function TariffCalculatorPage() {
  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <BreadcrumbsWithJsonLd breadcrumbs={BREADCRUMBS} />

      <div className="text-color" style={{ colorScheme: 'dark', accentColor: '#fbbf24' }}>
        <header className="mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">US Tariff &amp; Duty Calculator</h1>
            <ToolPills
              links={[
                {
                  href: '/hts-codes',
                  label: 'HTS Code Browser',
                  description: 'Open the full HTSUS section + chapter catalog to confirm the exact code for what you ship.',
                  icon: <ListTree className="h-4 w-4" />,
                  tone: 'emerald',
                },
                {
                  href: '/tariff-reports',
                  label: 'Tariff Reports',
                  description: 'Industry-level tariff impact analysis — context behind the rates this calculator returns.',
                  icon: <FileText className="h-4 w-4" />,
                  tone: 'indigo',
                },
              ]}
            />
          </div>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            Search for what you ship and see what it costs to bring into the US. We add the base HTS rate, extra tariffs like Section 232, 301 and IEEPA, and
            the usual port and processing fees. Pick the country you ship from and the date your goods arrive to get the final cost.
          </p>
        </header>

        <CalculatorClient />
      </div>
    </PageWrapper>
  );
}
