// app/prompts/[promptId]/page.tsx
'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { Prompt, PromptVersion } from '@prisma/client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface PromptWithVersions extends Prompt {
  promptVersions: PromptVersion[];
}

export default function PromptDetailsPage(): JSX.Element {
  const [prompt, setPrompt] = useState<PromptWithVersions | null>(null);
  const params = useParams() as { promptId?: string };
  const router = useRouter();
  const [showSampleJsonModal, setShowSampleJsonModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);

  const actions: EllipsisDropdownItem[] = [{ key: 'edit', label: 'Edit Page' }];

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
        <div className="flex justify-between">
          <h1 className="text-2xl heading-color mb-2">Prompt Details</h1>
          <PrivateWrapper>
            <EllipsisDropdown
              items={actions}
              onSelect={async (key) => {
                if (key === 'edit') {
                  router.push(`/prompts/edit/${prompt.id}`);
                }
              }}
            />
          </PrivateWrapper>
        </div>
        <p className="mb-4">Name: {prompt.name}</p>
        <p className="mb-4">Key: {prompt.key}</p>
        <p className="mb-4">Excerpt: {prompt.excerpt}</p>
        <p className="mb-4">Input Schema: {prompt.inputSchema}</p>
        <p className="mb-4">Output Schema: {prompt.outputSchema}</p>
        <div className="mb-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Sample JSON:</div>
            <div>
              <span className="text-sm text-gray-500">Visual Editor:</span>
              <IconButton iconName={IconTypes.Edit} onClick={() => setShowSampleJsonModal(true)} />
              <span className="text-sm text-gray-500 ml-2">Raw JSON:</span>
              <IconButton iconName={IconTypes.Edit} onClick={() => setShowRawJsonModal(true)} />
            </div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {prompt.sampleJson ? (
              <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[200px] overflow-y-auto text-xs">
                {JSON.stringify(JSON.parse(prompt.sampleJson), null, 2)}
              </pre>
            ) : (
              <pre className="text-xs">Click on the edit icon to add the JSON</pre>
            )}
          </div>
        </div>

        <h2 className="text-xl heading-color mt-8 mb-2">Versions</h2>
        <table className="w-full border border-color mb-4">
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
        <Link href={`/prompts/${prompt.id}/versions/create`} className="block-bg-color hover:bg-primary-text text-color px-4 py-2 inline-block">
          Create New Version
        </Link>
      </div>
    </PageWrapper>
  );
}
