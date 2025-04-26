Here is my page component which uses other components. I use this as the convention for all the pages. All the 
edit or admin actions are wrapped in a PrivateWrapper component. 

For the pages use
- PageWrapper component to wrap the page content
- Breadcrumbs component to show the breadcrumbs
- If there are any admin actions, use the PrivateWrapper component to wrap the actions
- Also add generateMetadata function to generate the metadata for the page
- I want the pages to be server components, so use async/await for the params
- Don't use any state in the page component
- Any components that need to have onClick or onChange should be separate client components

```tsx
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { FullNestedTickerReport } from '@/types/public-equity/ticker-report-types';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Metadata } from 'next';
import TickerActionsDropdown from './TickerActionsDropdown';
import TickerNewsSection from './TickerNewsSection';

export async function generateMetadata({ params }: { params: Promise<{ tickerKey: string }> }): Promise<Metadata> {
  const { tickerKey } = await params;

  const tickerResponse = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}`, { cache: 'no-cache' });
  let tickerData: FullNestedTickerReport | null = null;

  if (tickerResponse.ok) {
    tickerData = await tickerResponse.json();
  }

  const companyName = tickerData?.companyName ?? tickerKey;
  const shortDescription = `Financial analysis and reports for ${companyName} (${tickerKey}). Explore key metrics, insights, and AI-driven evaluations to make informed investment decisions.`;
  const canonicalUrl = `https://koalagains.com/public-equities/tickers/${tickerKey}`;
  const dynamicKeywords = [
    companyName,
    `Analysis on ${companyName}`,
    `Financial Analysis on ${companyName}`,
    `Reports on ${companyName}`,
    `${companyName} REIT analysis`,
    'investment insights',
    'public equities',
    'KoalaGains',
  ];

  return {
    title: `${companyName} (${tickerKey}) | KoalaGains`,
    description: shortDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${companyName} (${tickerKey}) | KoalaGains`,
      description: shortDescription,
      url: canonicalUrl,
      siteName: 'KoalaGains',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} (${tickerKey}) | KoalaGains`,
      description: shortDescription,
    },
    keywords: dynamicKeywords,
  };
}

export default async function TickerDetailsPage({ params }: { params: Promise<{ tickerKey: string }> }) {
  const { tickerKey } = await params;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Public Equities',
      href: `/public-equities/tickers`,
      current: false,
    },
    {
      name: tickerKey,
      href: `/public-equities/tickers/${tickerKey}}`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-color">
        <div className="mx-auto lg:text-center">
          {/* Private Ellipsis */}
          <div className="flex justify-end">
            <PrivateWrapper>
              <TickerActionsDropdown tickerKey={tickerKey} />
            </PrivateWrapper>
          </div>

          <div className="mx-auto max-w-7xl"></div>

          {/* Icons row */}

          {/* Latest News block */}

          {/* Reports Section */}

          {/* News section */}

          <TickerNewsSection articles={tickerNews?.articles ?? []} />
        </div>
      </div>
    </PageWrapper>
  );
}

```


```tsx
import Link from 'next/link';
import ChevronRightIcon from '@heroicons/react/20/solid/ChevronRightIcon';
import HomeIcon from '@heroicons/react/24/solid/HomeIcon';

export interface BreadcrumbsOjbect {
  name: string;
  href: string;
  current: boolean;
}

interface BreadcrumbsWithChevronsProps {
  breadcrumbs: BreadcrumbsOjbect[];
}

export default function BreadcrumbsWithChevrons({ breadcrumbs }: BreadcrumbsWithChevronsProps) {
  return breadcrumbs.length === 0 ? null : (
    <nav className="flex" aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        <li>
          <Link className="cursor-pointer" href={'/'}>
            <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {breadcrumbs.map((breadcrumb) => (
          <li key={breadcrumb.name}>
            <div className="flex items-center">
              <ChevronRightIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <Link
                href={breadcrumb.href}
                className={`ml-4 text-sm font-medium ${breadcrumb.current ? 'cursor-default' : 'cursor-pointer link-color'}`}
                aria-current={breadcrumb.current ? 'page' : undefined}
              >
                {breadcrumb.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
}

```

```tsx

'use client';

import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Ticker } from '@prisma/client';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';

export interface ReportActionsDropdownProps {
  tickerKey: string;
}

export default function TickerActionsDropdown({ tickerKey }: ReportActionsDropdownProps) {
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [
    { key: 'debug', label: 'Debug Page' },
    { key: 'edit', label: 'Edit Page' },
    { key: 'sec', label: 'SEC Filings' },
    { key: 'delete', label: 'Delete' },
  ];

  const { loading, deleteData } = useDeleteData<Ticker, null>({
    successMessage: 'Ticker deleted successfully.',
    errorMessage: 'Failed to delete ticker.',
    redirectPath: '/public-equities/tickers',
  });

  const handleConfirmDelete = async () => {
    await deleteData(`${getBaseUrl()}/api/tickers/${tickerKey}`);
    setShowConfirmModal(false);
  };

  return (
    <>
      <EllipsisDropdown
        items={actions}
        onSelect={async (key) => {
          if (key === 'debug') {
            router.push(`/public-equities/debug/tickers/${tickerKey}`);
          } else if (key === 'edit') {
            router.push(`/public-equities/tickers/${tickerKey}/edit`);
          } else if (key === 'sec') {
            router.push(`/public-equities/tickers/${tickerKey}/sec-filings`);
          } else if (key === 'delete') {
            setShowConfirmModal(true);
          }
        }}
      />
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Ticker"
          confirmationText={`Are you sure you want to delete all records of ${tickerKey}?`}
          confirming={loading}
          askForTextInput={false}
        />
      )}
    </>
  );
}

```

```tsx
'use client';

import { isAdmin } from '@/util/auth/isAdmin';
import { ReactNode, useEffect, useState } from 'react';

interface ClientOnlyAdminProps {
  children: ReactNode;
}

export default function PrivateWrapper({ children }: ClientOnlyAdminProps) {
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setAdmin(isAdmin());
  }, []);

  return admin ? <>{children}</> : null;
}

```


```tsx
import BreadcrumbsWithChevrons, { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';

interface BreadcrumbsProps {
  breadcrumbs: BreadcrumbsOjbect[];
}

export default function Breadcrumbs({ breadcrumbs }: BreadcrumbsProps) {
  return (
    <div className="my-5 text-color">
      <BreadcrumbsWithChevrons breadcrumbs={breadcrumbs} />
    </div>
  );
}

```

```tsx
export default function MainContainer({ children }: { children: React.ReactNode }) {
  return <div className="w-full mx-auto max-w-7xl sm:px-2 lg:px-8">{children}</div>;
}

```

```tsx

import MainContainer from '@dodao/web-core/components/main/Container/MainContainer';
import { PropsWithChildren, ReactElement } from 'react';

export default function PageWrapper({ children, className }: (PropsWithChildren | { children?: ReactElement | undefined }) & { className?: string }) {
  return (
    <MainContainer>
      <div className={`py-6 md:py-8 lg:py-12 pl-2 pr-2 ${className || ''}`}>{children}</div>
    </MainContainer>
  );
}

```

