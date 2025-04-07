Create a component for .......


Make sure to keep it consistent with the existing code. Here are some of the things we follow in the codebase:
- The code has very strict types and all types and mentioned explicitly 
- For colors we use special theme classes which uses CSS variables. Below I am passing the theme-styles.scss 
- For making a server side component and request I use normal fetch without any cache. Here is an example 
```ts
export default async function TickerDetailsPage({ params }: { params: Promise<{ tickerKey: string }> }) {
  const { tickerKey } = await params;

  const criteriaResponse = await fetch(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/real-estate/equity-real-estate-investment-trusts-reits/custom-criteria.json`,
    { cache: 'no-cache' }
  );
  const industryGroupCriteria: IndustryGroupCriteriaDefinition = (await criteriaResponse.json()) as IndustryGroupCriteriaDefinition;
  const tickerResponse = await fetch(`${getBaseUrl()}/api/tickers/${tickerKey}`, { cache: 'no-cache' });

```
- For page components I add breadcrumbs.  
```tsx
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
    <div className="text-color">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto lg:text-center">
          Some Content of the component
        </div>
      </div>
    </div>
  </PageWrapper>
);

```
--- For put and post requests I use the helper hooks. I mention the types explicitly. Make sure to mention the types explicitly. 

```tsx
  const { postData, loading: createLoading } = usePostData<Ticker, TickerCreateRequest>({
  successMessage: 'Ticker saved successfully!',
  errorMessage: 'Failed to save ticker. Please try again.',
  redirectPath: `/public-equities/tickers`,
});

const { putData, loading: updateLoading } = usePutData<Ticker, TickerCreateRequest>({
  successMessage: 'Ticker updated successfully!',
  errorMessage: 'Failed to update ticker. Please try again.',
  redirectPath: `/public-equities/tickers`,
});

const handleSave = async () => {
  if (ticker) {
    await putData(`${getBaseUrl()}/api/tickers/${tickerKey}`, {
      tickerKey: tickerForm.tickerKey,
      sectorId: tickerForm.sectorId,
      industryGroupId: tickerForm.industryGroupId,
      companyName: tickerForm.companyName,
      shortDescription: tickerForm.shortDescription,
    });
  } else {
    await postData(`${getBaseUrl()}/api/tickers`, {
      tickerKey: tickerForm.tickerKey,
      sectorId: tickerForm.sectorId,
      industryGroupId: tickerForm.industryGroupId,
      companyName: tickerForm.companyName,
      shortDescription: tickerForm.shortDescription,
    });
  }
};
```
- For client component fetch/get call I use the helper hook.
```tsx
export default function TickerDetailsDebugPage({ ticker }: { ticker: string }) {
  // New state for section-specific regeneration confirmation

  const [industryGroupCriteria, setIndustryGroupCriteria] = useState<IndustryGroupCriteriaDefinition>();
  const {
    data: tickerReport,
    loading,
    error,
    reFetchData,
  } = useFetchData<FullNestedTickerReport>(`${getBaseUrl()}/api/tickers/${ticker}`, { cache: 'no-cache' }, 'Failed to fetch ticker report');
  
}
```

- For buttons I use existing button component. 
```tsx
import Button from '@dodao/web-core/components/core/buttons/Button';

<div className="flex justify-end mb-4">
  <Button
    loading={financialStatementsLoading}
    primary
    variant="contained"
    onClick={() => setShowConfirmModal(true)}
    disabled={financialStatementsLoading}
  >
    Refetch Financial Statements
  </Button>
</div>
```
- All the actions are protected by the `<PrivateWrapper>` Component. 
```tsx
import PrivateWrapper from '@/components/auth/PrivateWrapper';

<PrivateWrapper>
  <div className="flex justify-end mb-4">
    <Button
      loading={financialStatementsLoading}
      primary
      variant="contained"
      onClick={() => setShowConfirmModal(true)}
      disabled={financialStatementsLoading}
    >
      Refetch Financial Statements
    </Button>
  </div>
</PrivateWrapper>
```

- For any modals I crate a new component which use the existing modal component. 
```tsx
import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import { SaveLatest10QFinancialStatementsRequest } from '@/types/public-equity/ticker-request-response';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useState } from 'react';

export interface FinancialStatementsButtonProps {
  tickerKey: string;
  financialStatementsContent?: string;
  onPostUpdate: () => Promise<void>;
}

export default function FinancialStatementsButton({
    tickerKey,
    financialStatementsContent: financialStatementsContentRaw,
    onPostUpdate,
}: FinancialStatementsButtonProps) {
  const [showFinancialStatementsModal, setShowFinancialStatementsModal] = useState(false);
  const [financialStatementsContent, setFinancialStatementsContent] = useState(financialStatementsContentRaw);
  const [showPreview, setShowPreview] = useState(false);

  const {
    postData: saveFinancialStatements,
    loading: financialStatementsLoading,
    error: financialStatementsError,
  } = usePostData<string, SaveLatest10QFinancialStatementsRequest>({
    errorMessage: 'Failed to save financial statements',
    successMessage: 'Financial Statements saved successfully',
    redirectPath: ``,
  });

  const handleSaveFinancialStatements = async () => {
    await saveFinancialStatements(`${getBaseUrl()}/api/tickers/${tickerKey}/financial-statements`, {
      latest10QFinancialStatements: financialStatementsContent ?? '',
    });
    await onPostUpdate();
  };

  return (
    <div>
      <div className="flex justify-end">
        <Button primary onClick={() => setShowFinancialStatementsModal(true)}>
          Upsert Statements
        </Button>
      </div>
      <FullPageModal open={showFinancialStatementsModal} onClose={() => setShowFinancialStatementsModal(false)} title={''}>
        <div className="min-h-[70vh]">
          Content of the modal
        </div>
      </FullPageModal>
    </div>
  );
}
```

- For loading, when the fetch is in progress in the client component, I use the existing loading component. 
```tsx
'use client';

import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default function TickerDetailsDebugPage({ ticker }: { ticker: string }) {
  // New state for section-specific regeneration confirmation

  const [industryGroupCriteria, setIndustryGroupCriteria] = useState<IndustryGroupCriteriaDefinition>();
  const {
    data: tickerReport,
    loading,
    error,
    reFetchData,
  } = useFetchData<FullNestedTickerReport>(`${getBaseUrl()}/api/tickers/${ticker}`, { cache: 'no-cache' }, 'Failed to fetch ticker report');
  
  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      {loading && <FullPageLoader />}
      {error && <div className="text-red-500">{error}</div>}
    </PageWrapper>
  );
}

```


----
theme-styles.scss

```scss
.text-color {
  color: var(--text-color);
}

.heading-color {
  color: var(--heading-color);
}

.primary-text-color {
  color: var(--primary-color);
}

.primary-color {
  color: var(--primary-color);
}

.primary-text-color {
  color: var(--primary-text-color);
}

.link-color {
  color: var(--link-color);
}

.background-color {
  background-color: var(--bg-color);
}

.block-bg-color {
  background-color: var(--block-bg);
}

.block-bg-color:hover {
  background-color: var(--block-bg);
}

.border-color {
  border-color: var(--border-color);
}

.divider-bg {
  background-color: var(--border-color);
}
.bg-primary-text {
  background-color: var(--primary-text-color);
}

.bg-primary-color {
  background-color: var(--primary-color);
}
.ring-border {
  /* When used in conjunction with Tailwind’s ring-1, this sets the ring color */
  --tw-ring-color: var(--border-color);
}

.border-primary-color {
  border-color: var(--primary-color);
}
```
