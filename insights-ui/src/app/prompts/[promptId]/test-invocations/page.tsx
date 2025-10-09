'use client';

import { useState, FormEvent, useEffect } from 'react';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useParams } from 'next/navigation';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Handlebars from 'handlebars';
import Editor from '@monaco-editor/react';
import { FullPromptResponse } from '@/app/api/[spaceId]/prompts/[promptId]/route';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import SampleJsonEditModal from '@/components/prompts/SampleJsonEditModal';
import RawJsonEditModal from '@/components/prompts/RawJsonEditModal';
import SampleBodyEditModal from '@/components/prompts/SampleBodyEditModal';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { PromptInvocationStatus, TestPromptInvocation } from '@prisma/client';
import LoadingOrError from '@/components/core/LoadingOrError';
import TestPromptInvocationModal from './TestPromptInvocationModal';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import Accordion from '@dodao/web-core/utils/accordion/Accordion';
import { parseMarkdown } from '@/util/parse-markdown';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import Popup from '@dodao/web-core/components/core/popup/Popup';
import { LLMProvider, GeminiModel } from '@/types/llmConstants';

// These types come from your API route for test prompt invocations.
export interface TestPromptInvocationRequest {
  spaceId?: string;
  promptTemplate: string;
  promptId: string;
  inputJsonString?: string;
  llmProvider: LLMProvider;
  model: string;
  bodyToAppend?: string;
}

export interface TestPromptInvocationResponse {
  response: Record<string, unknown>;
  error?: any;
}

export default function CreateTestPromptInvocationPage(): JSX.Element {
  const params = useParams() as { promptId?: string };

  // Fetch the parent prompt so we can populate default values.
  const { data: parentPrompt, loading: parentPromptLoading } = useFetchData<FullPromptResponse>(
    `${getBaseUrl()}/api/koala_gains/prompts/${params.promptId}`,
    { cache: 'no-cache' },
    'Failed to fetch prompt'
  );

  // Configure the post hook using strict types.
  const {
    data: invocationResult,
    postData,
    loading,
    error: invocationError,
  } = usePostData<TestPromptInvocationResponse, TestPromptInvocationRequest>({
    successMessage: 'Test prompt invoked successfully!',
    errorMessage: 'Failed to invoke test prompt.',
  });

  // Initialize our form state. We use a custom type so that the JSON input can be handled as a string.
  const [formData, setFormData] = useState<TestPromptInvocationRequest>({
    spaceId: parentPrompt?.spaceId || '',
    promptTemplate: parentPrompt?.activePromptVersion?.promptTemplate || '',
    promptId: parentPrompt?.id || '',
    inputJsonString: parentPrompt?.sampleJson || '',
    llmProvider: LLMProvider.GEMINI,
    model: GeminiModel.GEMINI_2_5_PRO,
    bodyToAppend: '',
  });
  const [showInvocationsAccordion, setShowInvocationsAccordion] = useState(false);
  const [showSampleJsonModal, setShowSampleJsonModal] = useState(false);
  const [showSingleInvocationModal, setShowSingleInvocationModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);
  const [showSampleBodyToAppendModal, setShowSampleBodyToAppendModal] = useState(false);
  const [templateError, setTemplateError] = useState<string>('');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [selectedInvocation, setSelectedInvocation] = useState<TestPromptInvocation>();

  const modelItems: StyledSelectItem[] = [{ id: GeminiModel.GEMINI_2_5_PRO, label: 'Gemini 2.5 Pro' }];

  // When the parent prompt data loads, update our form state.
  useEffect(() => {
    if (parentPrompt) {
      setFormData({
        spaceId: parentPrompt.spaceId,
        promptTemplate: parentPrompt.activePromptVersion?.promptTemplate || '',
        promptId: parentPrompt.id,
        inputJsonString: parentPrompt.sampleJson || '',
        llmProvider: LLMProvider.GEMINI,
        model: GeminiModel.GEMINI_2_5_PRO,
        bodyToAppend: '',
      });
    }
  }, [parentPrompt]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Build the request payload matching the API's expected type.
    const requestPayload: TestPromptInvocationRequest = {
      spaceId: formData.spaceId,
      promptTemplate: formData.promptTemplate,
      promptId: formData.promptId,
      inputJsonString: formData.inputJsonString,
      llmProvider: formData.llmProvider,
      model: formData.model,
      bodyToAppend: formData.bodyToAppend,
    };

    await postData(`${getBaseUrl()}/api/actions/prompt-invocation/test-req-resp`, requestPayload);
    refetchTestInvocations();
  };
  const handleSampleBodySave = (sampleBody: string) => {
    setFormData((s) => ({ ...s, bodyToAppend: sampleBody }));
    setShowSampleBodyToAppendModal(false);
  };

  // On every change in the template or sample data, compile the template
  useEffect(() => {
    try {
      const template = Handlebars.compile(formData.promptTemplate);
      const rendered = template(JSON.parse(formData.inputJsonString || ''));
      setPreviewHtml(rendered);
      setTemplateError('');
    } catch (error: any) {
      setTemplateError(error.message || 'Template compilation error');
      setPreviewHtml('');
    }
  }, [formData.promptTemplate, formData.inputJsonString]);

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Prompts',
      href: '/prompts',
      current: false,
    },
    {
      name: parentPrompt?.name || 'Prompt',
      href: `/prompts/${params.promptId}`,
      current: false,
    },
    {
      name: `Test Invocations`,
      href: `/prompts/${params.promptId}/test-invocations`,
      current: true,
    },
  ];

  const sampleBodyToAppend =
    (formData.bodyToAppend && parseMarkdown(formData.bodyToAppend)) || (parentPrompt?.sampleBodyToAppend && parseMarkdown(parentPrompt.sampleBodyToAppend));

  const {
    data: promptInvocations,
    loading: promptInvocationsLoading,
    error: promptInvocationsError,
    reFetchData: refetchTestInvocations,
  } = useFetchData<TestPromptInvocation[]>(
    `${getBaseUrl()}/api/koala_gains/prompts/${params.promptId}/test-invocations`,
    { cache: 'no-cache' },
    'Failed to fetch test invocations'
  );

  if (promptInvocationsLoading || promptInvocationsError) {
    return <LoadingOrError error={promptInvocationsError} loading={promptInvocationsLoading} />;
  }

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <div className="text-color px-4">
        <h1 className="heading-color text-2xl mb-4 text-center">Test Prompt Invocation</h1>

        <Accordion isOpen={showInvocationsAccordion} onClick={() => setShowInvocationsAccordion(!showInvocationsAccordion)} label="Test Invocations">
          {promptInvocations && promptInvocations.length > 0 ? (
            <div className="p-y-4 text-color">
              <h1 className="text-2xl heading-color mb-4">All Test Invocations</h1>
              <table className="mt-4 w-full border border-color">
                <thead className="block-bg-color">
                  <tr>
                    <th className="text-left p-2 border-color border">Invoked At</th>
                    <th className="text-left p-2 border-color border">Invoked By</th>
                    <th className="text-left p-2 border-color border">Status</th>
                    <th className="text-left p-2 border-color border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {promptInvocations.map((invocation) => (
                    <tr key={invocation.id} className="border border-color">
                      <td className="p-1 border border-color">{new Date(invocation.updatedAt).toLocaleString()}</td>
                      <td className="p-1 border border-color">{invocation.createdBy}</td>
                      <td className="p-1 border border-color">
                        {invocation.status === PromptInvocationStatus.Failed ? (
                          <div className="flex items-center">
                            <span>{invocation.status}</span>
                            <Popup IconComponent={InformationCircleIcon}>
                              <div
                                className="block-bg-color whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs markdown-body"
                                dangerouslySetInnerHTML={{ __html: parseMarkdown(invocation.error!) }}
                              />
                            </Popup>
                          </div>
                        ) : (
                          invocation.status
                        )}
                      </td>

                      <td
                        className="p-2 border border-color link-color cursor-pointer"
                        onClick={() => {
                          setSelectedInvocation(invocation);
                          setShowSingleInvocationModal(true);
                        }}
                      >
                        View
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-color">
              <div className="text-sm text-color mb-4 text-center">No Test Invocations so far</div>
            </div>
          )}
        </Accordion>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label className="block mb-2">LLM Provider</label>
            <input
              type="text"
              value={formData.llmProvider}
              onChange={(e) => setFormData((prev) => ({ ...prev, llmProvider: e.target.value as LLMProvider }))}
              className="border border-color p-2 w-full text-color block-bg-color"
              readOnly
            />
          </div>

          <div className="mb-4">
            <StyledSelect
              label={'Model'}
              items={modelItems}
              setSelectedItemId={(model) => setFormData({ ...formData, model: model || GeminiModel.GEMINI_2_5_PRO })}
              selectedItemId={formData.model || GeminiModel.GEMINI_2_5_PRO}
            />
          </div>

          <div className="my-4">
            <div className="flex justify-between w-full mb-2 gap-2 items-center">
              <div>Input Json</div>
              <div>
                <span className="text-sm text-gray-500">Visual Editor:</span>
                <IconButton iconName={IconTypes.Edit} onClick={() => setShowSampleJsonModal(true)} />
                <span className="text-sm text-gray-500 ml-2">Raw JSON:</span>
                <IconButton iconName={IconTypes.Edit} onClick={() => setShowRawJsonModal(true)} />
              </div>
            </div>
            <div className="block-bg-color w-full py-4 px-2">
              {formData.inputJsonString ? (
                <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[400px] overflow-y-auto text-xs">
                  {JSON.stringify(JSON.parse(formData.inputJsonString), null, 2)}
                </pre>
              ) : (
                <pre className="text-xs">No Input JSON Added</pre>
              )}
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-xl heading-color mb-2">Prompt Template</h2>
            <Editor
              height="300px"
              defaultLanguage="handlebars"
              value={formData.promptTemplate}
              theme="vs-dark"
              onChange={(value) => setFormData((prev) => ({ ...prev, promptTemplate: value || '' }))}
            />
            {templateError && <p className="mt-2 text-red-500">Error: {templateError}</p>}
          </div>

          <div className="mt-4">
            <h2 className="text-xl heading-color">Preview</h2>
            <div className="flex-1 border-l border-gray-200">
              <Editor
                height="300px"
                defaultLanguage="markdown"
                value={previewHtml}
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

          <div className="my-4">
            <div className="flex justify-between w-full mb-2 gap-2 items-center">
              <div>Body to append</div>
              <div>
                <span className="text-sm text-gray-500 ml-2">Edit:</span>
                <IconButton iconName={IconTypes.Edit} onClick={() => setShowSampleBodyToAppendModal(true)} />
              </div>
            </div>
            <div className="block-bg-color w-full py-4 px-2">
              {sampleBodyToAppend ? (
                <div
                  className="whitespace-pre-wrap break-words overflow-x-auto max-h-[200px] overflow-y-auto text-xs"
                  dangerouslySetInnerHTML={{ __html: sampleBodyToAppend }}
                />
              ) : (
                <pre className="text-xs">Click on the edit icon to add the body to append</pre>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button disabled={loading} type="submit" variant="contained" primary loading={loading}>
              {loading ? 'Invoking...' : 'Invoke Test Prompt'}
            </Button>
          </div>
        </form>

        {invocationResult && (
          <div className="mt-8">
            <h2 className="heading-color text-xl mb-2">Invocation Result</h2>
            <div className="block-bg-color p-4 rounded">
              <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[200px] overflow-y-auto text-xs">
                {JSON.stringify(invocationResult, null, 2)}
              </pre>
            </div>
          </div>
        )}
        {invocationError && <p className="mt-2 text-red-500">Error: {invocationError}</p>}
        {showSampleJsonModal && (
          <SampleJsonEditModal
            open={showSampleJsonModal}
            onClose={() => setShowSampleJsonModal(false)}
            title="Input JSON"
            sampleJson={formData.inputJsonString || ''}
            onSave={(json: string) => setFormData((s) => ({ ...s, inputJsonString: json }))}
          />
        )}
        {showRawJsonModal && (
          <RawJsonEditModal
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
            onSave={handleSampleBodySave}
            initialValue={formData.bodyToAppend || ''}
          />
        )}
        {showSingleInvocationModal && (
          <TestPromptInvocationModal
            open={showSingleInvocationModal}
            onClose={() => {
              setShowSingleInvocationModal(false);
              setSelectedInvocation(undefined);
            }}
            invocation={selectedInvocation!}
          />
        )}
      </div>
    </PageWrapper>
  );
}
