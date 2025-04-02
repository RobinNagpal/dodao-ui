'use client';

import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import Block from '@dodao/web-core/components/app/Block';
import Editor from '@monaco-editor/react';
import Handlebars from 'handlebars';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import Link from 'next/link';

export default function ViewPromptVersionPage(): JSX.Element {
  const { promptId, version } = useParams() as { promptId: string; version: string };
  const [sampleData, setSampleData] = useState<any>({});
  const [promptVersion, setPromptVersion] = useState<{
    promptTemplate: string;
    commitMessage?: string;
  } | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [templateError, setTemplateError] = useState<string>('');

  // Fetch the prompt version data
  const {
    data: promptVersionData,
    error: promptVersionError,
    loading: promptVersionLoading,
  } = useFetchData<any>(`/api/koala_gains/prompts/${promptId}/versions/${version}`, { cache: 'no-cache' }, 'Failed to fetch prompt version');

  // Fetch the parent prompt data to get sampleJson
  const {
    data: parentPrompt,
    error: parentPromptError,
    loading: parentPromptLoading,
  } = useFetchData<any>(`/api/koala_gains/prompts/${promptId}`, { cache: 'no-cache' }, 'Failed to fetch prompt data');

  useEffect(() => {
    if (promptVersionData) {
      setPromptVersion({
        promptTemplate: promptVersionData.promptTemplate,
        commitMessage: promptVersionData.commitMessage,
      });
    }
  }, [promptVersionData]);

  useEffect(() => {
    if (parentPrompt && parentPrompt.sampleJson) {
      try {
        const parsed = JSON.parse(parentPrompt.sampleJson);
        setSampleData(parsed);
      } catch (err) {
        console.error('Error parsing sampleJson', err);
      }
    }
  }, [parentPrompt]);

  useEffect(() => {
    if (promptVersion) {
      try {
        const template = Handlebars.compile(promptVersion.promptTemplate);
        const rendered = template(sampleData);
        setPreviewHtml(rendered);
        setTemplateError('');
      } catch (error: any) {
        setTemplateError(error.message || 'Template compilation error');
        setPreviewHtml('');
      }
    }
  }, [promptVersion, sampleData]);

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Prompts',
      href: '/prompts',
      current: false,
    },
    {
      name: parentPrompt?.name || 'Prompt',
      href: `/prompts/${promptId}`,
      current: false,
    },
    {
      name: `Version ${version}`,
      href: `/prompts/${promptId}/versions/${version}`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl heading-color">View Prompt Version</h1>
        <Link href={`/prompts/${promptId}/versions/create`} className="block-bg-color hover:bg-primary-text text-color px-4 py-2 inline-block">
          Create New Version
        </Link>
      </div>
      <Block className="text-color">
        {promptVersion ? (
          <div>
            <div className="mt-4">
              <h2 className="text-xl heading-color mb-2">Template</h2>
              <Editor height="300px" defaultLanguage="handlebars" value={promptVersion.promptTemplate} theme="vs-dark" options={{ readOnly: true }} />
            </div>
            {templateError && <p className="mt-2 text-red-500">Error in template: {templateError}</p>}
            <div className="mt-4">
              <h2 className="text-xl heading-color mb-2">Preview</h2>
              <div className="p-4 border border-color" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
            <p className="mt-4">
              <strong>Commit Message:</strong> {promptVersion.commitMessage}
            </p>
          </div>
        ) : (
          <FullPageLoader />
        )}
      </Block>
    </PageWrapper>
  );
}
