'use client';

import LoadingOrError from '@/components/core/LoadingOrError';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Prompt, PromptInvocation } from '@prisma/client';
import Link from 'next/link';

interface InvocationWithPrompt extends PromptInvocation {
  prompt: Prompt;
}
export default function PromptInvocationsListPage(): JSX.Element {
  const {
    data: promptInvocations,
    loading,
    error,
  } = useFetchData<InvocationWithPrompt[]>(`${getBaseUrl()}/api/koala_gains/invocations`, { cache: 'no-cache' }, 'Failed to fetch invocations');

  if (loading || error) {
    return <LoadingOrError error={error} loading={loading} />;
  }

  return (
    <PageWrapper>
      {promptInvocations && (
        <div className="p-4 text-color">
          <h1 className="text-2xl heading-color mb-4">All Invocations</h1>
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
                <tr key={invocation.id} className="border border-color">
                  <td className="p-2 border border-color">{invocation.prompt.name}</td>
                  <td className="p-2 border border-color">
                    {invocation.prompt.key.replace('US/public-equities/real-estate/equity-reits/', 'equity-reits - ')}
                  </td>
                  <td className="p-2 border border-color">{new Date(invocation.updatedAt).toLocaleString()}</td>
                  <td className="p-2 border border-color">{invocation.inputJson ? JSON.parse(invocation.inputJson.toString())?.ticker : '-'}</td>
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
      )}
    </PageWrapper>
  );
}
