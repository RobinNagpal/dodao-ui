import Link from 'next/link';
import { CurrencyDollarIcon, HomeIcon } from '@heroicons/react/20/solid';

const reports = [
  {
    title: 'Crowdfunding Reports',
    description:
      'Get structured insights on crowdfunding projects, highlighting risks, returns, and strengths. Visual spider graphs provide a clear snapshot of investment potential.',
    link: '/crowd-funding',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'Specific REITS Reports',
    description: 'Analyze REITs with key metrics like debt, market positioning, efficiency, and rental income, ensuring smarter investment decisions.',
    link: '/public-equities/tickers',
    icon: HomeIcon,
  },
];

export default function Page() {
  return (
    <div className="background-color py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <p className="mt-2 text-4xl font-semibold tracking-tight heading-color sm:text-5xl lg:text-balance">Smarter Investment Insights</p>
          <p className="mt-6 text-lg/8 text-color">
            KoalaGains simplifies investment research with quick, data-driven reports on crowdfunding projects and REITs, helping investors make informed
            decisions faster.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {reports.map((report, index) => {
              const Icon = report.icon;
              return (
                <div key={index} className="relative pl-9">
                  <dt className="text-base/7 font-semibold heading-color">
                    <div className="absolute top-0 left-0 flex size-10 items-center justify-center rounded-lg primary-color">
                      <report.icon aria-hidden="true" className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                    </div>
                    {report.title}
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
  );
}
