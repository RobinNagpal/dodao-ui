// app/prompts/[promptId]/invocations/create/page.tsx
'use client';

import RawJsonJsonEditModal from '@/components/prompts/RawJsonEditModal';
import SampleBodyEditModal from '@/components/prompts/SampleBodyEditModal';
import SampleJsonEditModal from '@/components/prompts/SampleJsonEditModal';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { marked } from 'marked';
import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import StyledSelect, { StyledSelectItem } from '@dodao/web-core/components/core/select/StyledSelect';
import Handlebars from 'handlebars';

import type { Prompt, PromptVersion } from '@prisma/client';

interface CreateInvocationForm {
  promptVersionId: string;
  inputJson: string;
  llmProvider: string;
  model: string;
  bodyToAppend?: string;
}

export default function CreateInvocationPage(): JSX.Element {
  const { promptId } = useParams() as { promptId: string };
  const router = useRouter();

  // Form state with strict types
  const [formData, setFormData] = useState<CreateInvocationForm>({
    promptVersionId: '',
    inputJson: '',
    llmProvider: 'openai',
    model: 'gpt-3.5-turbo',
    bodyToAppend: '',
  });

  // Local state for selected template (from chosen prompt version),
  // live preview HTML, and compilation errors.
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [previewPrompt, setPreviewPrompt] = useState<string>('');
  const [previewError, setPreviewError] = useState<string>('');
  const [showSampleJsonModal, setShowSampleJsonModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);
  const [showSampleBodyToAppendModal, setShowSampleBodyToAppendModal] = useState(false);

  // Fetch available prompt versions for this prompt
  const {
    data: promptVersions,
    error: promptVersionsError,
    loading: promptVersionsLoading,
  } = useFetchData<PromptVersion[]>(`${getBaseUrl()}/api/koala_gains/prompts/${promptId}/versions`, { cache: 'no-cache' }, 'Failed to fetch prompt versions');

  const { data: prompt } = useFetchData<Prompt>(`${getBaseUrl()}/api/koala_gains/prompts/${promptId}`, { cache: 'no-cache' }, 'Failed to fetch prompt');
  // When prompt versions load, set the default selected version if not already chosen
  useEffect(() => {
    if (promptVersions && promptVersions.length > 0 && !formData.promptVersionId) {
      const defaultVersion = promptVersions[0];
      setFormData((prev) => ({ ...prev, promptVersionId: defaultVersion.id }));
      setSelectedTemplate(defaultVersion.promptTemplate);
    }
  }, [promptVersions, formData.promptVersionId]);

  // When a new version is selected, update the selected template.
  const handleVersionChange = (selectedId: string | null): void => {
    if (!selectedId) return;
    setFormData((prev) => ({ ...prev, promptVersionId: selectedId }));
    const version = promptVersions?.find((v) => v.id === selectedId);
    if (version) {
      setSelectedTemplate(version.promptTemplate);
    }
  };

  // Compile the Handlebars template using the provided input JSON.
  // If the JSON is invalid or the template fails to compile, display an error.
  useEffect(() => {
    try {
      if (!prompt) {
        return;
      }
      const parsedInput = JSON.parse(formData.inputJson || prompt.sampleJson || '');
      const template = Handlebars.compile(selectedTemplate);
      const rendered = template(parsedInput);
      setPreviewPrompt(rendered);
      setPreviewError('');
    } catch (error: any) {
      setPreviewError(error.message || 'Error during template compilation');
      setPreviewPrompt('');
    }
  }, [formData.inputJson, selectedTemplate, prompt]);

  useEffect(() => {
    setFormData({
      bodyToAppend: prompt?.sampleBodyToAppend || '',
      inputJson: prompt?.sampleJson || '{}',
      llmProvider: formData.llmProvider,
      model: formData.model,
      promptVersionId: formData.promptVersionId,
    });
  }, [prompt]);

  // Use the post hook to send the invocation request.
  const { postData, loading } = usePostData<any, CreateInvocationForm>({
    successMessage: 'Prompt invocation started successfully!',
    errorMessage: 'Failed to start prompt invocation.',
    redirectPath: `/prompts/${promptId}`,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await postData(`${getBaseUrl()}/api/actions/prompt-invocation/full-req-resp`, formData);
  };

  const renderer = getMarkedRenderer();

  const sampleBodyToAppend = formData.bodyToAppend && marked.parse(formData.bodyToAppend, { renderer });

  const modelItems: StyledSelectItem[] = ['o3-mini', 'gpt-4o', 'gpt-4o-mini'].map((m) => ({
    id: m,
    label: m,
  }));

  return (
    <PageWrapper>
      <Block title="Run Prompt Invocation" className="text-color">
        {promptVersionsLoading ? (
          <p>Loading versions...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Select the Prompt Version */}
            <div className="mb-4">
              <label className="block mb-2">Select Prompt Version</label>
              <StyledSelect
                label="Version"
                selectedItemId={formData.promptVersionId}
                items={
                  promptVersions?.map((v) => ({
                    id: v.id,
                    label: `Version ${v.version} - ${v.commitMessage || 'No commit message'}`,
                  })) || []
                }
                setSelectedItemId={handleVersionChange}
              />
            </div>

            {/* LLM Provider Field */}
            <div className="mb-4">
              <label className="block mb-2">LLM Provider</label>
              <input
                type="text"
                value={formData.llmProvider}
                onChange={(e) => setFormData((prev) => ({ ...prev, llmProvider: e.target.value }))}
                className="border border-color p-2 w-full text-color block-bg-color"
              />
            </div>

            <div className="mb-4">
              <StyledSelect
                label={'Model'}
                items={modelItems}
                setSelectedItemId={(model) => setFormData({ ...formData, model: model || 'gpt-4o-mini' })}
                selectedItemId={formData.model || 'gpt-4o-mini'}
              />
            </div>

            <div className="my-4">
              <div className="flex justify-between w-full mb-2 gap-2 items-center">
                <div>Sample Json</div>
                <div>
                  <span className="text-sm text-gray-500">Visual Editor:</span>
                  <IconButton iconName={IconTypes.Edit} onClick={() => setShowSampleJsonModal(true)} />
                  <span className="text-sm text-gray-500 ml-2">Raw JSON:</span>
                  <IconButton iconName={IconTypes.Edit} onClick={() => setShowRawJsonModal(true)} />
                </div>
              </div>
              <div className="block-bg-color w-full py-4 px-2">
                {formData.inputJson ? (
                  <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[200px] overflow-y-auto text-xs">
                    {JSON.stringify(JSON.parse(formData.inputJson), null, 2)}
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
                  <pre
                    className="whitespace-pre-wrap break-words overflow-x-auto max-h-[200px] overflow-y-auto text-xs"
                    dangerouslySetInnerHTML={{ __html: sampleBodyToAppend }}
                  />
                ) : (
                  <pre className="text-xs">Click on the edit icon to add the body to append</pre>
                )}
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="mb-4">
              <h2 className="text-xl heading-color mb-2">Preview</h2>
              {previewError ? (
                <p className="text-red-500">Error: {previewError}</p>
              ) : (
                <div className="p-4 border border-color" dangerouslySetInnerHTML={{ __html: previewPrompt }} />
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
          sampleJson={JSON.parse(formData.inputJson)}
          onSave={(json: string) => setFormData((s) => ({ ...s, inputJson: json }))}
        />
      )}
      {showRawJsonModal && (
        <RawJsonJsonEditModal
          open={showRawJsonModal}
          onClose={() => setShowRawJsonModal(false)}
          title="Raw JSON"
          sampleJson={formData.inputJson}
          onSave={(json) => setFormData((s) => ({ ...s, inputJson: json }))}
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
