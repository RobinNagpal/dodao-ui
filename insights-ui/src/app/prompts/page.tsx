// app/prompts/page.tsx
'use client';

import { PromptWithActiveVersion } from '@/app/api/[spaceId]/prompts/route';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Prompt } from '@prisma/client'; // or wherever your TS types are generated
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PromptsListPage(): JSX.Element {
  const { data: prompts, loading } = useFetchData<PromptWithActiveVersion[]>(
    `${getBaseUrl()}/api/koala_gains/prompts`,
    { cache: 'no-cache' },
    'Failed to fetch prompts.'
  );
  const router = useRouter();

  if (loading)
    return (
      <PageWrapper>
        <FullPageLoader />
      </PageWrapper>
    );
  return (
    <PageWrapper>
      <div className="p-4 text-color">
        <h1 className="text-2xl heading-color mb-4">All Prompts</h1>
        <div className="flex justify-end">
          <Button onClick={() => router.push('/prompts/create')} primary variant="contained">
            Create Prompt
          </Button>
        </div>
        <table className="mt-4 w-full border border-color">
          <thead className="block-bg-color">
            <tr>
              <th className="text-left p-2 border-color border">Name</th>
              <th className="text-left p-2 border-color border">Key</th>
              <th className="text-left p-2 border-color border">Active Version</th>
              <th className="text-left p-2 border-color border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prompts?.map((prompt) => (
              <tr key={prompt.id} className="border border-color">
                <td className="p-2 border border-color">{prompt.name}</td>
                <td className="p-2 border border-color">{prompt.key}</td>
                <td className="p-2 border border-color">
                  {prompt.activePromptVersion?.version ? (
                    <>
                      Version: {prompt.activePromptVersion?.version}
                      <br />
                      Commit: {prompt.activePromptVersion?.commitMessage}
                    </>
                  ) : (
                    <>No active version</>
                  )}
                </td>
                <td className="p-2 border border-color">
                  <Link href={`/prompts/${prompt.id}`} className="link-color underline mr-4">
                    View
                  </Link>
                  <Link href={`/prompts/edit/${prompt.id}`} className="link-color underline mr-4">
                    Edit
                  </Link>
                  <Link href={`/prompts/${prompt.id}/invocations`} className="link-color underline">
                    Invocations
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
