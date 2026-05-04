import CalculatorClient from './CalculatorClient';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

export const dynamic = 'force-static';

const PAGE_URL = 'https://koalagains.com/tariff-calculator';
const PAGE_TITLE = 'US Tariff & Duty Calculator | KoalaGains';
const PAGE_DESCRIPTION =
  'Free US import duty calculator. Search any product, pick its HTSUS code, and get a per-line landed-cost breakdown — base HTSUS rate, Section 232/301/IEEPA Chapter 99 special tariffs, plus HMF and MPF.';

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

const BREADCRUMB_LD = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: BREADCRUMBS.map((b, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: b.name,
    item: `https://koalagains.com${b.href}`,
  })),
};

export default function TariffCalculatorPage() {
  return (
    <PageWrapper>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(BREADCRUMB_LD) }} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-color">
        <Breadcrumbs breadcrumbs={BREADCRUMBS} />

        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl heading-color">US Tariff &amp; Duty Calculator</h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base opacity-80">
            Find the HTSUS code for any product, then get a per-line landed-cost breakdown — base HTSUS duty, Chapter 99 special tariffs (Section 232/301,
            IEEPA), plus the Harbor Maintenance Fee and Merchandise Processing Fee for the country and entry date you choose.
          </p>
        </header>

        <CalculatorClient />
      </div>
    </PageWrapper>
  );
}
