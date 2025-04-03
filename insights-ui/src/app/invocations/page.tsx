'use client';

import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Prompt, PromptInvocation } from '@prisma/client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface InvocationWithPrompt extends PromptInvocation {
  prompt: Prompt;
}
export default function PromptInvocationsListPage(): JSX.Element {
  const [promptInvocations, setPromptInvocations] = useState<InvocationWithPrompt[]>([]);

  useEffect(() => {
    fetch(`${getBaseUrl()}/api/koala_gains/invocations`)
      .then((res) => res.json())
      .then((data: InvocationWithPrompt[]) => setPromptInvocations(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <PageWrapper>
      <div className="p-4 text-color">
        <h1 className="text-2xl heading-color mb-4">All Invocations</h1>
        <table className="mt-4 w-full border border-color">
          <thead className="block-bg-color">
            <tr>
              <th className="text-left p-2 border-color border">Prompt Name</th>
              <th className="text-left p-2 border-color border">Prompt Key</th>
              <th className="text-left p-2 border-color border">Invoked At</th>
              <th className="text-left p-2 border-color border">Invoked By</th>
              <th className="text-left p-2 border-color border">Status</th>
              <th className="text-left p-2 border-color border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promptInvocations.map((invocation) => (
              <tr key={invocation.id} className="border border-color">
                <td className="p-2 border border-color">{invocation.prompt.name}</td>
                <td className="p-2 border border-color">{invocation.prompt.key}</td>
                <td className="p-2 border border-color">{new Date(invocation.updatedAt).toLocaleString()}</td>
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
