'use client';

import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import Editor from '@monaco-editor/react';
import Handlebars from 'handlebars';
import { useParams } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';

interface CreatePromptVersionForm {
  promptTemplate: string;
  commitMessage?: string;
}

export default function CreatePromptVersionPage(): JSX.Element {
  const { promptId } = useParams() as { promptId: string };

  // State for our sample data, preview HTML, and compilation error
  const [sampleData, setSampleData] = useState<any>({});
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [templateError, setTemplateError] = useState<string>('');
  const [sampleBodyToAppend, setSampleBodyToAppend] = useState<string>('');

  const [formData, setFormData] = useState<CreatePromptVersionForm>({
    promptTemplate: '',
    commitMessage: '',
  });

  // Fetch the parent prompt to get its sampleJson for the preview
  const {
    data: parentPrompt,
    error: parentPromptError,
    loading: parentPromptLoading,
  } = useFetchData<any>(`${getBaseUrl()}/api/koala_gains/prompts/${promptId}`, { cache: 'no-cache' }, 'Failed to fetch prompt data');

  const { postData, loading } = usePostData<any, CreatePromptVersionForm>({
    successMessage: 'Prompt version created successfully!',
    errorMessage: 'Failed to create prompt version.',
    redirectPath: `/prompts/${promptId}`,
  });

  // When parentPrompt is loaded, parse its sampleJson
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

  // On every change in the template or sample data, compile the template
  useEffect(() => {
    try {
      const template = Handlebars.compile(formData.promptTemplate);
      const rendered = template(sampleData);
      setPreviewHtml(rendered);
      setTemplateError('');
    } catch (error: any) {
      setTemplateError(error.message || 'Template compilation error');
      setPreviewHtml('');
    }
  }, [formData.promptTemplate, sampleData]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await postData(`${getBaseUrl()}/api/koala_gains/prompts/${promptId}/versions`, formData);
  };

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
      name: 'Create Version',
      href: `/prompts/${promptId}/versions/create`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <Block title="Create Prompt Version" className="text-color">
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <label className="block mb-2">Prompt Template</label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Editor
                  height="300px"
                  defaultLanguage="handlebars"
                  value={formData.promptTemplate}
                  theme="vs-dark"
                  onChange={(value) => setFormData((prev) => ({ ...prev, promptTemplate: value || '' }))}
                />
                {templateError && <p className="mt-2 text-red-500">Error: {templateError}</p>}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-xl heading-color">Preview</h2>
            <div className="flex-1 border-l border-gray-200">
              <Editor
                height="300px"
                defaultLanguage="markdown"
                value={previewHtml}
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
          <Input modelValue={formData.commitMessage} onUpdate={(val) => setFormData((prev) => ({ ...prev, commitMessage: val as string }))}>
            Commit Message
          </Input>
          <Button disabled={loading} variant="contained" primary className="mt-4" loading={loading}>
            {loading ? 'Creating...' : 'Create Prompt Version'}
          </Button>
        </form>
      </Block>
    </PageWrapper>
  );
}
