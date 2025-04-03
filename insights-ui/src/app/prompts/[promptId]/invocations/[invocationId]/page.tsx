// app/prompts/[promptId]/invocations/[invocationId]/page.tsx
'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { PromptInvocation, Prompt, PromptVersion } from '@prisma/client';
import { marked } from 'marked';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface PromptInvocationWithDetails extends PromptInvocation {
  prompt: Prompt;
}

export default function PromptInvocationDetailsPage() {
  const [invocation, setInvocation] = useState<PromptInvocationWithDetails | null>(null);
  const params = useParams() as { promptId?: string; invocationId?: string };
  const router = useRouter();

  const actions: EllipsisDropdownItem[] = [{ key: 'new', label: 'New Invocation' }];

  useEffect(() => {
    if (!params.invocationId || !params.promptId) return;
    const fetchData = async () => {
      const res = await fetch(`${getBaseUrl()}/api/koala_gains/prompts/${params.promptId}/invocations/${params.invocationId}`);
      const data = await res.json();
      setInvocation(data);
    };
    fetchData();
  }, [params.invocationId, params.promptId]);

  if (!invocation) return <div className="p-4 text-color">Loading...</div>;

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Prompts',
      href: '/prompts',
      current: false,
    },
    {
      name: invocation.prompt.name,
      href: `/prompts/${invocation.prompt.id}`,
      current: false,
    },
    {
      name: `Invocation ${invocation.id}`,
      href: `/prompts/${invocation.prompt.id}/invocations/${invocation.id}`,
      current: true,
    },
  ];

  const renderer = getMarkedRenderer();

  const bodyToAppend = invocation.bodyToAppend && marked.parse(invocation.bodyToAppend, { renderer });

  return (
    <PageWrapper>
      <div className="text-color">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <div className="flex justify-between">
          <h1 className="text-2xl heading-color mb-2">Invocation Details</h1>
          <PrivateWrapper>
            <EllipsisDropdown
              items={actions}
              onSelect={async (key) => {
                if (key === 'new') {
                  router.push(`/prompts/${invocation.promptId}/invocations/create`);
                }
              }}
            />
          </PrivateWrapper>
        </div>
        <p className="mb-4">Prompt: {invocation.prompt.name}</p>
        <p className="mb-4">Status: {invocation.status}</p>
        <p className="mb-4">Updated At: {new Date(invocation.updatedAt).toLocaleString()}</p>
        <p className="mb-4">Updated By: {invocation.updatedBy}</p>
        <div className="mb-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Input JSON:</div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
              {JSON.stringify(JSON.parse(invocation.inputJson as any), null, 2)}
            </pre>
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Output JSON:</div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {invocation.outputJson ? (
              <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
                {JSON.stringify(JSON.parse(invocation.outputJson as any), null, 2)}
              </pre>
            ) : (
              <pre className="text-xs">No Output JSON</pre>
            )}
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Body to Append:</div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {bodyToAppend ? (
              <pre
                className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs markdown-body"
                dangerouslySetInnerHTML={{ __html: bodyToAppend || '' }}
              />
            ) : (
              <pre className="text-xs">No Body to Append Added</pre>
            )}
          </div>
        </div>

        <Link href={`/prompts/${invocation.promptId}/invocations`} className="block-bg-color hover:bg-primary-text text-color px-4 py-2 inline-block">
          See Prompt Invocations
        </Link>
      </div>
    </PageWrapper>
  );
}
