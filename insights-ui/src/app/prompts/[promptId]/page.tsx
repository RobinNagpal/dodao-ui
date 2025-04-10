// app/prompts/[promptId]/page.tsx
'use client';

import { FullPromptResponse } from '@/app/api/[spaceId]/prompts/[promptId]/route';
import PrivateWrapper from '@/components/auth/PrivateWrapper';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { parseMarkdown } from '@/util/parse-markdown';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import EllipsisDropdown, { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Editor from '@monaco-editor/react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function PromptDetailsPage() {
  const params = useParams() as { promptId?: string };
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const { data: prompt } = useFetchData<FullPromptResponse>(
    `${getBaseUrl()}/api/koala_gains/prompts/${params.promptId}`,
    {
      cache: 'no-cache',
    },
    'Cannot fetch prompt data'
  );

  const actions: EllipsisDropdownItem[] = [
    { key: 'edit', label: 'Edit Page' },
    { key: 'invocations', label: 'Invocations' },
  ];

  if (!prompt)
    return (
      <PageWrapper>
        <FullPageLoader />
      </PageWrapper>
    );

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

  const sampleBodyToAppend = prompt?.sampleBodyToAppend && parseMarkdown(prompt.sampleBodyToAppend);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
                } else if (key === 'invocations') {
                  router.push(`/prompts/${prompt.id}/invocations`);
                }
              }}
            />
          </PrivateWrapper>
        </div>
        <p className="mb-4">Name: {prompt.name}</p>
        <p className="mb-4 flex items-center gap-2">
          <span>Key: {prompt.key}</span>
          <IconButton iconName={IconTypes.Clipboard} onClick={() => handleCopy(prompt.key)} tooltip="Copy key to clipboard" removeBorder />
          {copied && <span className="ml-2 text-color text-sm">Copied!</span>}
        </p>
        <p className="mb-4">Excerpt: {prompt.excerpt}</p>
        <p className="mb-4">Input Schema: {prompt.inputSchema}</p>
        <p className="mb-4">Output Schema: {prompt.outputSchema}</p>
        <p className="mb-4">Notes: {prompt.notes || 'No notes added'}</p>
        <div className="mb-4">
          <div className="mb-2">Current Prompt Template</div>
          <div className="flex-1 border-l border-gray-200">
            <Editor
              height="300px"
              defaultLanguage="markdown"
              value={prompt.activePromptVersion?.promptTemplate || 'No Active Version set for this prompt'}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                lineNumbers: 'off',
                folding: false,
                fontSize: 14,
                fontFamily: 'monospace',
              }}
            />
          </div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Sample Input JSON:</div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {prompt.sampleJson ? (
              <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
                {JSON.stringify(JSON.parse(prompt.sampleJson), null, 2)}
              </pre>
            ) : (
              <pre className="text-xs">No Sample Input JSON Added</pre>
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
        <div className="mb-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Transformation Patch:</div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {prompt.transformationPatch ? (
              <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
                {JSON.stringify(prompt.transformationPatch, null, 2)}
              </pre>
            ) : (
              <pre className="text-xs">No Transformation patch</pre>
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
            {prompt.promptVersions
              .sort((p1, p2) => p2.version - p1.version)
              .map((v) => (
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
        {prompt.promptVersions.length > 0 && (
          <Link href={`/prompts/${prompt.id}/invocations/create`} className="block-bg-color hover:bg-primary-text text-color px-4 py-2 inline-block ml-4">
            Invoke prompt
          </Link>
        )}
        <Link href={`/prompts/${prompt.id}/invocations`} className="block-bg-color hover:bg-primary-text text-color px-4 py-2 inline-block ml-4">
          See Prompt Invocations
        </Link>
        <Link href={`/prompts/${prompt.id}/test-invocations`} className="block-bg-color hover:bg-primary-text text-color px-4 py-2 inline-block ml-4">
          Test Prompt
        </Link>
      </div>
    </PageWrapper>
  );
}
