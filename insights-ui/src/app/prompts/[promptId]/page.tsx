// app/prompts/[promptId]/page.tsx
'use client';

import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useEffect, useState } from 'react';
import { Prompt, PromptVersion } from '@prisma/client';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface PromptWithVersions extends Prompt {
  promptVersions: PromptVersion[];
}

export default function PromptDetailsPage(): JSX.Element {
  const [prompt, setPrompt] = useState<PromptWithVersions | null>(null);
  const params = useParams() as { promptId?: string };

  useEffect(() => {
    if (!params.promptId) return;
    const fetchData = async () => {
      const res = await fetch(`/api/koala_gains/prompts/${params.promptId}`);
      const data = await res.json();
      setPrompt(data);
    };
    fetchData();
  }, [params.promptId]);

  if (!prompt) return <div className="p-4 text-color">Loading...</div>;

  return (
    <PageWrapper>
      <div className="p-4 text-color">
        <h1 className="text-2xl heading-color mb-2">Prompt Details</h1>
        <p className="mb-4">Name: {prompt.name}</p>
        <p className="mb-4">Key: {prompt.key}</p>
        <p className="mb-4">Excerpt: {prompt.excerpt}</p>

        <Link href={`/prompts/${prompt.id}/versions/create`} className="block-bg-color hover:bg-primary-text text-color px-4 py-2 inline-block">
          Create New Version
        </Link>

        <h2 className="text-xl heading-color mt-8 mb-2">Versions</h2>
        <table className="w-full border border-color">
          <thead className="block-bg-color">
            <tr>
              <th className="text-left p-2 border border-color">Version</th>
              <th className="text-left p-2 border border-color">Commit Message</th>
              <th className="text-left p-2 border border-color">Is Current</th>
              <th className="text-left p-2 border border-color">Actions</th>
            </tr>
          </thead>
          <tbody>
            {prompt.promptVersions.map((v) => (
              <tr key={v.id} className="border border-color">
                <td className="p-2 border border-color">{v.version}</td>
                <td className="p-2 border border-color">{v.commitMessage || ''}</td>
                <td className="p-2 border border-color">{prompt.activePromptVersionId === v.id ? 'Yes' : ''}</td>
                <td className="p-2 border border-color">
                  <Link href={`/prompts/${prompt.id}/versions/${v.version}`} className="link-color underline mr-4">
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
