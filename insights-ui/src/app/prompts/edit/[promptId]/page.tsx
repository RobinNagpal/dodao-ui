// app/prompts/edit/[promptId]/page.tsx
'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Prompt } from '@prisma/client';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import Input from '@dodao/web-core/components/core/input/Input';
import Button from '@dodao/web-core/components/core/buttons/Button';
import Block from '@dodao/web-core/components/app/Block';

type PromptFormData = Pick<Prompt, 'name' | 'key' | 'excerpt' | 'inputSchema' | 'outputSchema' | 'sampleJson'>;

export default function EditPromptPage(): JSX.Element {
  const router = useRouter();
  const params = useParams() as { promptId?: string };
  const [promptData, setPromptData] = useState<PromptFormData>({
    name: '',
    key: '',
    excerpt: '',
    inputSchema: '',
    outputSchema: '',
    sampleJson: '',
  });
  const [loadingFetch, setLoadingFetch] = useState<boolean>(false);

  const { putData, loading: updateLoading } = usePutData<Prompt, PromptFormData>({
    successMessage: 'Prompt updated successfully!',
    errorMessage: 'Failed to update prompt.',
    redirectPath: `/prompts`,
  });

  useEffect(() => {
    if (!params.promptId) return;
    setLoadingFetch(true);

    fetch(`/api/koala_gains/prompts/${params.promptId}`)
      .then((r) => r.json())
      .then((data: Prompt) => {
        setPromptData({
          name: data.name,
          key: data.key,
          excerpt: data.excerpt || '',
          inputSchema: data.inputSchema || '',
          outputSchema: data.outputSchema || '',
          sampleJson: data.sampleJson || '',
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingFetch(false));
  }, [params.promptId]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!params.promptId) return;
    await putData(`/api/koala_gains/prompts/${params.promptId}`, promptData);
  };

  if (loadingFetch) {
    return <div className="p-4 text-color">Loading existing prompt...</div>;
  }

  return (
    <Block title="Edit Prompt" className="text-color">
      <form onSubmit={handleUpdate}>
        <Input modelValue={promptData.name} onUpdate={(val) => setPromptData((s) => ({ ...s, name: val as string }))}>
          Prompt Name
        </Input>
        <Input modelValue={promptData.key} onUpdate={(val) => setPromptData((s) => ({ ...s, key: val as string }))}>
          Key
        </Input>
        <Input modelValue={promptData.excerpt} onUpdate={(val) => setPromptData((s) => ({ ...s, excerpt: val as string }))}>
          Excerpt
        </Input>
        <Input modelValue={promptData.inputSchema} onUpdate={(val) => setPromptData((s) => ({ ...s, inputSchema: val as string }))}>
          Input Schema
        </Input>
        <Input modelValue={promptData.outputSchema} onUpdate={(val) => setPromptData((s) => ({ ...s, outputSchema: val as string }))}>
          Output Schema
        </Input>
        <Input modelValue={promptData.sampleJson} onUpdate={(val) => setPromptData((s) => ({ ...s, sampleJson: val as string }))}>
          Sample JSON
        </Input>
        <Button disabled={updateLoading} variant="contained" primary loading={updateLoading}>
          {updateLoading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </Block>
  );
}
