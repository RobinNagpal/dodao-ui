// app/prompts/edit/create/page.tsx
'use client';

import SampleJsonEditModal from '@/components/prompts/SampleJsonEditModal';
import RawJsonJsonEditModal from '@/components/prompts/RawJsonEditModal';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PromptSchema } from '@/types/prompt-schemas';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import Input from '@dodao/web-core/components/core/input/Input';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import TextareaAutosize from '@dodao/web-core/components/core/textarea/TextareaAutosize';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { getMarkedRenderer } from '@dodao/web-core/utils/ui/getMarkedRenderer';
import { Prisma, Prompt } from '@prisma/client';
import { marked } from 'marked';
import { FormEvent, useState } from 'react';
import SampleBodyEditModal from './SampleBodyEditModal';
import TransformationPatchEditModal from './TransformationPatchEditModal';
import { UpdatePromptRequest } from '@/app/api/[spaceId]/prompts/[promptId]/route';

export interface PromptFormData extends UpdatePromptRequest {
  id?: string;
}

export interface PromptUpsertFormProps {
  prompt?: Prompt;
  upserting?: boolean;
  onUpsert: (prompt: PromptFormData) => Promise<void>;
}

export default function PromptUpsertForm({ prompt, upserting, onUpsert }: PromptUpsertFormProps): JSX.Element {
  const { data: schemas } = useFetchData<PromptSchema[]>(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/schemas`, { cache: 'no-cache' }, 'Failed to fetch schemas.');
  const [formData, setFormData] = useState<PromptFormData>({
    id: prompt?.id,
    name: prompt?.name || '',
    key: prompt?.key || '',
    excerpt: prompt?.excerpt || '',
    inputSchema: prompt?.inputSchema || '',
    outputSchema: prompt?.outputSchema || '',
    sampleJson: prompt?.sampleJson || '',
    notes: prompt?.notes || '',
    sampleBodyToAppend: prompt?.sampleBodyToAppend || '',
    transformationPatch: prompt?.transformationPatch || null,
  });
  const [showSampleJsonModal, setShowSampleJsonModal] = useState(false);
  const [showRawJsonModal, setShowRawJsonModal] = useState(false);
  const [showSampleBodyToAppendModal, setShowSampleBodyToAppendModal] = useState(false);
  const [showTransformationPatchModal, setShowTransformationPatchModal] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onUpsert(formData);
  };

  const handleSampleBodySave = (sampleBody: string) => {
    setFormData((s) => ({ ...s, sampleBodyToAppend: sampleBody }));
    setShowSampleBodyToAppendModal(false);
  };
  const renderer = getMarkedRenderer();

  const sampleBodyToAppend = formData.sampleBodyToAppend && marked.parse(formData.sampleBodyToAppend, { renderer });
  return (
    <>
      <form onSubmit={handleSubmit}>
        <Input modelValue={formData.name} onUpdate={(val) => setFormData((s) => ({ ...s, name: val as string }))}>
          Prompt Name
        </Input>
        <Input modelValue={formData.key} onUpdate={(val) => setFormData((s) => ({ ...s, key: val as string }))}>
          Key
        </Input>
        <Input modelValue={formData.excerpt} onUpdate={(val) => setFormData((s) => ({ ...s, excerpt: val as string }))}>
          Excerpt
        </Input>
        <StyledSelect
          label={'Input Schema'}
          selectedItemId={formData.inputSchema}
          items={schemas?.map((schema: PromptSchema) => ({ id: schema.filePath, label: `${schema.title} - ${schema.filePath}` })) || []}
          setSelectedItemId={(value) => setFormData((s) => ({ ...s, inputSchema: value as string }))}
        />
        <StyledSelect
          label={'Output Schema'}
          selectedItemId={formData.outputSchema}
          items={schemas?.map((schema: PromptSchema) => ({ id: schema.filePath, label: `${schema.title} - ${schema.filePath}` })) || []}
          setSelectedItemId={(value) => setFormData((s) => ({ ...s, outputSchema: value as string }))}
        />

        <TextareaAutosize
          label={'Notes'}
          modelValue={formData.notes}
          autosize={true}
          onUpdate={(value) => setFormData((s) => ({ ...s, notes: value as string }))}
        />
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
            {formData.sampleJson ? (
              <pre className="whitespace-pre-wrap break-words overflow-x-auto max-h-[200px] overflow-y-auto text-xs">
                {JSON.stringify(JSON.parse(formData.sampleJson), null, 2)}
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

        <div className="my-4">
          <div className="flex justify-between w-full mb-2 gap-2 items-center">
            <div>Transformation Patch</div>
            <div>
              <span className="text-sm text-gray-500 ml-2">Edit:</span>
              <IconButton iconName={IconTypes.Edit} onClick={() => setShowTransformationPatchModal(true)} />
            </div>
          </div>
          <div className="block-bg-color w-full py-4 px-2">
            {formData.transformationPatch ? (
              <pre
                className="whitespace-pre-wrap break-words overflow-x-auto max-h-[200px] overflow-y-auto text-xs"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify(formData.transformationPatch, null, 2),
                }}
              />
            ) : (
              <pre className="text-xs">Click on the edit icon to add the transformation patch</pre>
            )}
          </div>
        </div>

        <Button disabled={upserting} variant="contained" primary loading={upserting}>
          Submit
        </Button>
      </form>

      {showSampleJsonModal && (
        <SampleJsonEditModal
          open={showSampleJsonModal}
          onClose={() => setShowSampleJsonModal(false)}
          title="Sample JSON"
          sampleJson={formData.sampleJson ? JSON.parse(formData.sampleJson) : undefined}
          onSave={(json: string) => setFormData((s) => ({ ...s, sampleJson: json }))}
        />
      )}
      {showRawJsonModal && (
        <RawJsonJsonEditModal
          open={showRawJsonModal}
          onClose={() => setShowRawJsonModal(false)}
          title="Raw JSON"
          sampleJson={formData.sampleJson}
          onSave={(json) => setFormData((s) => ({ ...s, sampleJson: json }))}
        />
      )}
      {showSampleBodyToAppendModal && (
        <SampleBodyEditModal
          isOpen={showSampleBodyToAppendModal}
          onClose={() => setShowSampleBodyToAppendModal(false)}
          onSave={handleSampleBodySave}
          initialValue={formData.sampleBodyToAppend || ''}
        />
      )}
      {showTransformationPatchModal && (
        <TransformationPatchEditModal
          open={showTransformationPatchModal}
          onClose={() => setShowTransformationPatchModal(false)}
          title="Transformation Patch"
          transformationPatch={formData.transformationPatch || null}
          onSave={(patch: Prisma.JsonValue) => setFormData((s) => ({ ...s, transformationPatch: patch }))}
        />
      )}
    </>
  );
}
