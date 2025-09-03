// app/prompts/[promptId]/invocations/create/page.tsx
'use client';

import { FullPromptResponse } from '@/app/api/[spaceId]/prompts/[promptId]/route';
import { PromptInvocationRequest, PromptInvocationResponse } from '@/app/api/actions/prompt-invocation/full-req-resp/route';
import RawJsonJsonEditModal from '@/components/prompts/RawJsonEditModal';
import SampleBodyEditModal from '@/components/prompts/SampleBodyEditModal';
import SampleJsonEditModal from '@/components/prompts/SampleJsonEditModal';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import Handlebars from 'handlebars';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { Editor } from '@monaco-editor/react';
import { parseMarkdown } from '@/util/parse-markdown';

interface CreateInvocationForm {
  promptVersionId?: string;
  inputJsonString: string;
  llmProvider: 'openai' | 'gemini';
  model: string;
  bodyToAppend?: string;
  commitMessage?: string;
}

export default function CreateInvocationPage(): JSX.Element {
  const { promptId } = useParams() as { promptId: string };
  const router = useRouter();

  // Form state with strict types
  const [formData, setFormData] = useState<CreateInvocationForm>({
    inputJsonString: '',
    llmProvider: 'openai',
    model: 'gpt-4o-mini',
    bodyToAppend: '',
  });

  // Local state for selected template (from chosen prompt version),
  // live preview HTML, and compilation errors.

  const [previewPrompt, setPreviewPrompt] = useState<string>('');
  const [previewError, setPreviewError] = useState<string>('');
  const [showSampleJsonModal, setShowSampleJsonModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);
  const [showSampleBodyToAppendModal, setShowSampleBodyToAppendModal] = useState(false);

  // Fetch available prompt versions for this prompt

  const { data: prompt, loading: promptLoading } = useFetchData<FullPromptResponse>(
    `${getBaseUrl()}/api/koala_gains/prompts/${promptId}`,
    { cache: 'no-cache' },
    'Failed to fetch prompt'
  );

  // When a new version is selected, update the selected template.
  const handleVersionChange = (selectedId: string | null): void => {
    if (!selectedId) return;
    setFormData((prev) => ({ ...prev, promptVersionId: selectedId }));
  };

  // Compile the Handlebars template using the provided input JSON.
  // If the JSON is invalid or the template fails to compile, display an error.
  useEffect(() => {
    try {
      const selectedVersion = prompt?.promptVersions?.find((v) => v.id === formData.promptVersionId);
      if (!prompt || !selectedVersion?.promptTemplate) return;

      const parsedInput = JSON.parse(formData.inputJsonString || prompt.sampleJson || '');
      const template = Handlebars.compile(selectedVersion?.promptTemplate);
      const rendered = template(parsedInput);
      setPreviewPrompt(rendered);
      setPreviewError('');
    } catch (error: any) {
      setPreviewError(error.message || 'Error during template compilation');
      setPreviewPrompt('');
    }
  }, [formData.inputJsonString, formData.promptVersionId]);

  // Use the post hook to send the invocation request.
  const { postData, loading, error } = usePostData<PromptInvocationResponse, PromptInvocationRequest>({
    successMessage: 'Prompt invocation started successfully!',
    errorMessage: 'Failed to start prompt invocation.',
  });

  const handleSubmit = async (e: FormEvent) => {
    if (!prompt) return;

    e.preventDefault();
    const request: PromptInvocationRequest = {
      inputJson: JSON.parse(formData.inputJsonString),
      bodyToAppend: formData.bodyToAppend,
      llmProvider: formData.llmProvider,
      model: formData.model,
      promptKey: prompt.key,
      spaceId: KoalaGainsSpaceId,
      requestFrom: 'ui',
    };
    const data = await postData(`${getBaseUrl()}/api/actions/prompt-invocation/full-req-resp`, request);
    if (!error) {
      router.push(`/prompts/${promptId}/invocations/${data?.invocationId}`);
    }
  };

  const sampleBodyToAppend = formData.bodyToAppend && parseMarkdown(formData.bodyToAppend);

  const llmProviderItems: StyledSelectItem[] = [
    { id: 'openai', label: 'OpenAI' },
    { id: 'gemini', label: 'Gemini' },
  ];

  const getModelItems = (provider: string): StyledSelectItem[] => {
    if (provider === 'gemini') {
      return [{ id: 'models/gemini-2.5-pro', label: 'Gemini 2.5 Pro' }];
    }
    return ['o3-mini', 'o4-mini', 'gpt-4o', 'gpt-4o-mini', 'gpt-4o-search-preview', 'gpt-4o-mini-search-preview'].map((m) => ({
      id: m,
      label: m,
    }));
  };

  const modelItems = getModelItems(formData.llmProvider);

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Prompts',
      href: '/prompts',
      current: false,
    },
    {
      name: prompt?.name || 'Prompt',
      href: `/prompts/${promptId}`,
      current: false,
    },
    {
      name: 'Create Invocation',
      href: `/prompts/${promptId}/invocations/create`,
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <Block title="Run Prompt Invocation" className="text-color">
        {promptLoading ? (
          <FullPageLoader />
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Select the Prompt Version */}
            <div className="mb-4">
              <label className="block mb-2">Select Prompt Version</label>
              <StyledSelect
                label="Version"
                selectedItemId={formData.promptVersionId}
                items={
                  prompt?.promptVersions?.map((v) => ({
                    id: v.id,
                    label: `Version ${v.version} - ${v.commitMessage || 'No commit message'}`,
                  })) || []
                }
                setSelectedItemId={handleVersionChange}
              />
            </div>

            {/* LLM Provider Field */}
            <div className="mb-4">
              <StyledSelect
                label="LLM Provider"
                selectedItemId={formData.llmProvider}
                items={llmProviderItems}
                setSelectedItemId={(provider) => {
                  const newProvider = (provider as 'openai' | 'gemini') || 'openai';
                  const defaultModel = newProvider === 'gemini' ? 'models/gemini-2.5-pro' : 'gpt-4o-mini';
                  setFormData((prev) => {
                    const newFormData: CreateInvocationForm = {
                      ...prev,
                      llmProvider: newProvider,
                      model: defaultModel,
                    };
                    return newFormData;
                  });
                }}
              />
            </div>

            <div className="mb-4">
              <StyledSelect
                label={'Model'}
                items={modelItems}
                setSelectedItemId={(model) =>
                  setFormData({ ...formData, model: model || (formData.llmProvider === 'gemini' ? 'models/gemini-2.5-pro' : 'gpt-4o-mini') })
                }
                selectedItemId={formData.model || (formData.llmProvider === 'gemini' ? 'models/gemini-2.5-pro' : 'gpt-4o-mini')}
              />
            </div>

            <div className="my-4">
              <div className="flex justify-between w-full mb-2 gap-2 items-center">
                <div>Sample Input Json</div>
                <div>
                  <span className="text-sm text-gray-500">Visual Editor:</span>
                  <IconButton iconName={IconTypes.Edit} onClick={() => setShowSampleJsonModal(true)} />
                  <span className="text-sm text-gray-500 ml-2">Raw JSON:</span>
                  <IconButton iconName={IconTypes.Edit} onClick={() => setShowRawJsonModal(true)} />
                </div>
              </div>
              <div className="block-bg-color w-full py-4 px-2">
                {formData.inputJsonString ? (
                  <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[200px] overflow-y-auto text-xs">
                    {JSON.stringify(JSON.parse(formData.inputJsonString), null, 2)}
                  </pre>
                ) : (
                  <pre className="text-xs">Click on the edit icon to add the JSON</pre>
                )}
              </div>
            </div>

            <div className="my-4">
              <div className="flex justify-between w-full mb-2 gap-2 items-center">
                <div>Sample Body to append</div>
                <div>
                  <span className="text-sm text-gray-500 ml-2">Edit:</span>
                  <IconButton iconName={IconTypes.Edit} onClick={() => setShowSampleBodyToAppendModal(true)} />
                </div>
              </div>
              <div className="block-bg-color w-full py-4 px-2">
                {sampleBodyToAppend ? (
                  <div
                    className="block-bg-color whitespace-pre-wrap break-words overflow-x-auto max-h-[200px] overflow-y-auto text-xs markdown-body"
                    dangerouslySetInnerHTML={{ __html: sampleBodyToAppend }}
                  />
                ) : (
                  <pre className="text-xs">Click on the edit icon to add the body to append</pre>
                )}
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between w-full mb-2 gap-2 items-center">
                <div>Transformation Patch:</div>
              </div>
              <div className="block-bg-color w-full py-4 px-2">
                {prompt?.transformationPatch ? (
                  <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
                    {JSON.stringify(prompt.transformationPatch, null, 2)}
                  </pre>
                ) : (
                  <pre className="text-xs">No Transformation patch</pre>
                )}
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="mb-4">
              <h2 className="text-xl heading-color mb-2">Prompt Template Preview</h2>
              {previewError ? (
                <p className="text-red-500">Error: {previewError}</p>
              ) : (
                <div className="flex-1 border-l border-gray-200">
                  <Editor
                    height="300px"
                    defaultLanguage="markdown"
                    value={previewPrompt}
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
              )}
            </div>

            <Button disabled={loading} variant="contained" primary className="mt-4" loading={loading}>
              {loading ? 'Running...' : 'Run Prompt'}
            </Button>
          </form>
        )}
      </Block>
      {showSampleJsonModal && (
        <SampleJsonEditModal
          open={showSampleJsonModal}
          onClose={() => setShowSampleJsonModal(false)}
          title="Sample JSON"
          sampleJson={JSON.parse(formData.inputJsonString)}
          onSave={(json: string) => setFormData((s) => ({ ...s, inputJsonString: json }))}
        />
      )}
      {showRawJsonModal && (
        <RawJsonJsonEditModal
          open={showRawJsonModal}
          onClose={() => setShowRawJsonModal(false)}
          title="Raw JSON"
          sampleJson={formData.inputJsonString}
          onSave={(json) => setFormData((s) => ({ ...s, inputJsonString: json }))}
        />
      )}
      {showSampleBodyToAppendModal && (
        <SampleBodyEditModal
          isOpen={showSampleBodyToAppendModal}
          onClose={() => setShowSampleBodyToAppendModal(false)}
          onSave={(value) => setFormData((s) => ({ ...s, bodyToAppend: value }))}
          initialValue={formData.bodyToAppend || ''}
        />
      )}
    </PageWrapper>
  );
}
