// app/prompts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { PromptWithActiveVersion } from '@/app/api/[spaceId]/prompts/route';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Input from '@dodao/web-core/components/core/input/Input';

export default function PromptsListPage(): JSX.Element {
  const { data: prompts, loading } = useFetchData<PromptWithActiveVersion[]>(
    `${getBaseUrl()}/api/koala_gains/prompts`,
    { cache: 'no-cache' },
    'Failed to fetch prompts.'
  );
  const router = useRouter();
  const [filterText, setFilterText] = useState<string>('');

  // Load the saved filter text from local storage on mount.
  useEffect(() => {
    const savedFilterText = localStorage.getItem('prompts_filter_text');
    if (savedFilterText !== null) {
      setFilterText(savedFilterText);
    }
  }, []);

  // Save filterText to local storage whenever it changes.
  useEffect(() => {
    localStorage.setItem('prompts_filter_text', filterText);
  }, [filterText]);

  if (loading)
    return (
      <PageWrapper>
        <FullPageLoader />
      </PageWrapper>
    );

  // Filter prompts based on the filter text provided by the user.
  const filteredPrompts =
    prompts?.filter((prompt) => {
      const lowerFilter = filterText.toLowerCase();
      return prompt.name.toLowerCase().includes(lowerFilter) || prompt.key.toLowerCase().includes(lowerFilter);
    }) || [];

  return (
    <PageWrapper>
      <div className="p-4 text-color">
        <h1 className="text-2xl heading-color mb-4">All Prompts</h1>
        <div className="flex justify-end">
          <Button onClick={() => router.push('/prompts/create')} primary variant="contained">
            Create Prompt
          </Button>
        </div>
        {/* Filter input with help text. Yellow highlight is applied when filterText is not empty */}
        <div className="my-4">
          <Input
            modelValue={filterText}
            onUpdate={(val) => setFilterText(val as string)}
            helpText="Filter prompts by name or key"
            className={`w-full p-2 rounded ${filterText ? 'bg-yellow-200 text-black' : ''}`}
          >
            Filter Prompts
          </Input>
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
            {filteredPrompts.map((prompt) => (
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
