// app/prompts/edit/[promptId]/page.tsx
'use client';

import PromptUpsertForm, { PromptFormData } from '@/components/prompts/PromptUpsertForm';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Prompt } from '@prisma/client';
import { useParams } from 'next/navigation';

export default function EditPromptPage(): JSX.Element {
  const params = useParams() as { promptId?: string };

  const { putData, loading: updateLoading } = usePutData<Prompt, PromptFormData>({
    successMessage: 'Prompt updated successfully!',
    errorMessage: 'Failed to update prompt.',
    redirectPath: `/prompts`,
  });

  const { data: prompt } = useFetchData<Prompt>(
    `${getBaseUrl()}/api/koala_gains/prompts/${params.promptId}`,
    { cache: 'no-cache' },
    'Failed to fetch prompt data.'
  );
  const handleUpdate = async (promptData: PromptFormData) => {
    await putData(`${getBaseUrl()}/api/koala_gains/prompts/${params.promptId}`, promptData);
  };

  return <PageWrapper>{prompt ? <PromptUpsertForm onUpsert={handleUpdate} prompt={prompt} upserting={updateLoading} /> : <FullPageLoader />}</PageWrapper>;
}
