import Link from 'next/link';
import { CurrencyDollarIcon, HomeIcon, NewspaperIcon, ChartBarIcon } from '@heroicons/react/20/solid';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports | KoalaGains',
  description:
    'Generate quick, data-driven reports on crowdfunding projects, REITs, tariffs, and specific tickers. KoalaGains helps investors make informed decisions faster.',
  alternates: {
    canonical: 'https://koalagains.com/reports',
  },
};

const breadcrumbs: BreadcrumbsOjbect[] = [
  {
    name: 'Reports',
    href: `/reports`,
    current: true,
  },
];

const reports = [
  {
    title: 'Crowdfunding Reports',
    description:
      'Get structured insights on crowdfunding projects, highlighting risks, returns, and strengths. Visual spider graphs provide a clear snapshot of investment potential.',
    link: '/crowd-funding',
    icon: CurrencyDollarIcon,
    isNew: false,
  },
  {
    title: 'Specific REIT Reports',
    description: 'Analyze REITs with key metrics like debt, market positioning, efficiency, and rental income, ensuring smarter investment decisions.',
    link: '/stocks/industries/REITS',
    icon: HomeIcon,
    isNew: true,
  },
  {
    title: 'Tariff Reports',
    description:
      'Comprehensive analyses of tariff impacts across various industries, providing insights into how trade policies affect industry dynamics and investment opportunities.',
    link: '/tariff-reports',
    icon: NewspaperIcon,
    isNew: false,
  },
  {
    title: 'Ticker Reports',
    description: 'Detailed analysis of individual companies with comprehensive metrics, evaluations, and investment insights.',
    link: '/stocks',
    icon: ChartBarIcon,
    isNew: true,
  },
];

export default function Page() {
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="background-color py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <p className="mt-2 text-4xl font-semibold tracking-tight heading-color sm:text-5xl lg:text-balance">Smarter Investment Insights</p>
            <p className="mt-6 text-lg/8 text-color">
              KoalaGains simplifies investment research with quick, data-driven reports across multiple investment areas, helping investors make informed
              decisions faster.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-5xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 lg:gap-y-16">
              {reports.map((report, index) => {
                const Icon = report.icon;
                return (
                  <div key={index} className="relative pl-9">
                    <dt className="text-base/7 font-semibold heading-color">
                      <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg primary-color">
                        <Icon aria-hidden="true" className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                      </div>
                      <div className="flex items-center">
                        {report.title}
                        {report.isNew && <span className="ml-2 px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-400 text-gray-900">NEW</span>}
                      </div>
                    </dt>
                    <dd className="mt-2 text-base/7 text-color">{report.description}</dd>
                    <Link href={report.link} className="mt-2 inline-block text-sm font-medium link-color">
                      See More &rarr;
                    </Link>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
