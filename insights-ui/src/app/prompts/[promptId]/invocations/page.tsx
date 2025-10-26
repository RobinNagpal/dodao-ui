'use client';

import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ToggleWithIcon from '@dodao/web-core/components/core/toggles/ToggleWithIcon';
import { Prompt, PromptInvocation, PromptInvocationStatus } from '@prisma/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

interface InvocationWithPrompt extends PromptInvocation {
  prompt: Prompt;
}

export default function PromptInvocationsListPage(): JSX.Element {
  const [promptInvocations, setPromptInvocations] = useState<InvocationWithPrompt[]>([]);
  const [showFailedOnly, setShowFailedOnly] = useState<boolean>(false);
  const params = useParams() as { promptId?: string };

  useEffect(() => {
    const fetchInvocations = async () => {
      const baseUrl = getBaseUrl();
      const path = `/api/koala_gains/prompts/${params.promptId}/invocations`;
      const queryParams = showFailedOnly ? `?status=${PromptInvocationStatus.Failed}` : '';

      // If baseUrl exists, create a full URL; otherwise, use the path directly
      const fetchUrl = baseUrl ? new URL(`${path}${queryParams}`, baseUrl).toString() : `${path}${queryParams}`;

      try {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch invocations');
        }
        const data: InvocationWithPrompt[] = await response.json();
        setPromptInvocations(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchInvocations();
  }, [params.promptId, showFailedOnly]);

  return (
    <PageWrapper>
      <div className="p-4 text-color">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl heading-color">All Invocations</h1>
          <div>
            <ToggleWithIcon label="Show Failed Only" enabled={showFailedOnly} setEnabled={setShowFailedOnly} onClickOnLabel={true} />
          </div>
        </div>
        <table className="mt-4 w-full border border-color">
          <thead className="block-bg-color">
            <tr>
              <th className="text-left p-2 border-color border">Prompt Name</th>
              <th className="text-left p-2 border-color border">Prompt Key</th>
              <th className="text-left p-2 border-color border">Invoked At</th>
              <th className="text-left p-2 border-color border">Ticker</th>
              <th className="text-left p-2 border-color border">Invoked By</th>
              <th className="text-left p-2 border-color border">Status</th>
              <th className="text-left p-2 border-color border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promptInvocations.map((invocation) => (
              <tr
                key={invocation.id}
                className={`border border-color ${invocation.status === PromptInvocationStatus.Failed ? 'bg-red-100 dark:bg-red-900/30' : ''}`}
              >
                <td className="p-2 border border-color">{invocation.prompt.name}</td>
                <td className="p-2 border border-color">{invocation.prompt.key.replace('US/public-equities/real-estate/equity-reits/', 'equity-reits - ')}</td>
                <td className="p-2 border border-color">{new Date(invocation.updatedAt).toLocaleString()}</td>
                <td className="p-2 border border-color">
                  {invocation.inputJson ? JSON.parse(invocation.inputJson.toString())?.symbol : '-'} <br />{' '}
                  <span className="text-sm">{invocation.inputJson ? JSON.parse(invocation.inputJson.toString())?.name : '-'}</span>
                  <br /> <span className="text-xs">{invocation.inputJson ? JSON.parse(invocation.inputJson.toString())?.industryName : '-'}</span>
                  <br /> <span className="text-xs">{invocation.inputJson ? JSON.parse(invocation.inputJson.toString())?.subIndustryName : '-'}</span>
                </td>
                <td className="p-2 border border-color">{invocation.createdBy}</td>
                <td className="p-2 border border-color">{invocation.status}</td>
                <td className="p-2 border border-color">
                  <Link href={`/prompts/${invocation.promptId}/invocations/${invocation.id}`} className="link-color underline mr-4">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
