// app/prompts/[promptId]/page.tsx
'use client';

import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { Prompt, PromptVersion } from '@prisma/client';
import { marked } from 'marked';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface PromptWithVersions extends Prompt {
  promptVersions: PromptVersion[];
}

export default function PromptDetailsPage() {
  const [prompt, setPrompt] = useState<PromptWithVersions | null>(null);
  const params = useParams() as { promptId?: string };
  const router = useRouter();

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

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Prompts',
      href: '/prompts',
      current: false,
    },
    {
      name: prompt.name,
      href: `/prompts/${prompt.id}`,
      current: true,
    },
  ];

  const renderer = getMarkedRenderer();

  const sampleBodyToAppend = prompt?.sampleBodyToAppend && marked.parse(prompt.sampleBodyToAppend, { renderer });

  return (
    <PageWrapper>
      <div className="text-color">
        <Breadcrumbs breadcrumbs={breadcrumbs} />
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
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {prompt.sampleJson ? (
              <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
                {JSON.stringify(JSON.parse(prompt.sampleJson), null, 2)}
              </pre>
            ) : (
              <pre className="text-xs">No Sample JSON Added</pre>
            )}
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Sample Body to Append:</div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {sampleBodyToAppend ? (
              <pre
                className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs markdown-body"
                dangerouslySetInnerHTML={{ __html: sampleBodyToAppend || '' }}
              />
            ) : (
              <pre className="text-xs">No Body String Added</pre>
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
