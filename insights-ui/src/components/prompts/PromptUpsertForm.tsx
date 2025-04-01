// app/prompts/edit/create/page.tsx
'use client';

import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { PromptSchema } from '@/types/prompt-schemas';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Input from '@dodao/web-core/components/core/input/Input';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import StyledSelect from '@dodao/web-core/components/core/select/StyledSelect';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Prompt } from '@prisma/client';
import { FormEvent, useState } from 'react';

export interface PromptFormData {
  id?: string;
  name: string;
  key: string;
  excerpt: string;
  inputSchema: string;
  outputSchema: string;
  sampleJson: string;
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
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await onUpsert(formData);
  };

  return (
    <PageWrapper>
      <Block title="Create Prompt" className="text-color">
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

          <Input modelValue={formData.sampleJson} onUpdate={(val) => setFormData((s) => ({ ...s, sampleJson: val as string }))}>
            Sample JSON
          </Input>
          <Button disabled={upserting} variant="contained" primary loading={upserting}>
            Submit
          </Button>
        </form>
      </Block>
    </PageWrapper>
  );
}
