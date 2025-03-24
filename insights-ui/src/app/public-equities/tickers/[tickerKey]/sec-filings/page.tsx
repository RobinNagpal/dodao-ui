import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { DocumentTextIcon } from '@heroicons/react/20/solid';
import { SecFiling } from '@prisma/client';
import Link from 'next/link';
import RepopulateFilingsButton from './RepopulateButton';

export default async function SecFilingPage({ params }: { params: Promise<{ tickerKey: string }> }) {
  const { tickerKey } = await params;
  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Public Equities',
      href: `/public-equities/tickers`,
      current: false,
    },
    {
      name: tickerKey,
      href: `/public-equities/tickers/${tickerKey}}/sec-filings`,
      current: true,
    },
  ];

  const filingsResponse = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}/sec-filings`, { cache: 'no-cache' });

  const filings = (await filingsResponse.json()) as SecFiling[];
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold text-color py-8">SEC Filings for {tickerKey}</h1>
        <RepopulateFilingsButton tickerKey={tickerKey} />
      </div>
      <div className="flow-root background-color">
        <ul role="list" className="-mb-8">
          {filings.map((filing, idx) => (
            <li key={filing.id}>
              <div className="relative pb-8">
                {idx !== filings.length - 1 && <span aria-hidden="true" className="absolute left-5 top-5 -ml-px h-full w-0.5 divider-bg" />}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="flex size-10 items-center justify-center rounded-full block-bg-color ring-2 ring-white">
                      <DocumentTextIcon aria-hidden="true" className="size-5 text-color" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm">
                      <span className="font-medium heading-color">{filing.form}</span> for <span className="font-medium heading-color">{filing.tickerKey}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-color">Filed on {new Date(filing.filingDate).toLocaleDateString()}</p>
                    <div className="mt-2 text-sm text-color">
                      <p className="flex space-x-5">
                        <a href={filing.filingUrl} target="_blank" rel="noopener noreferrer" className="underline">
                          View Filing
                        </a>
                        {filing.form === '10-Q' ? (
                          <>
                            <Link href={`/public-equities/tickers/${tickerKey}/sec-filings/${filing.id}`} className="link-color">
                              View Attachments
                            </Link>
                          </>
                        ) : (
                          <></>
                        )}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-color whitespace-pre-wrap">
                      <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.
                        Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa.
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Accession Number: {filing.accessionNumber} | Period: {filing.periodOfReport}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageWrapper>
  );
}
