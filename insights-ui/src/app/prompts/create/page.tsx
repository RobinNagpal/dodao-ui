// app/prompts/edit/create/page.tsx
'use client';

import { PromptFormData } from '@/components/prompts/PromptUpsertForm';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import dynamic from 'next/dynamic';

export default function CreatePromptPage() {
  const { postData, loading } = usePostData<any, PromptFormData>({
    successMessage: 'Prompt created successfully!',
    errorMessage: 'Failed to create prompt.',
    redirectPath: '/prompts',
  });

  const PromptUpsertForm = dynamic(() => import('@/components/prompts/PromptUpsertForm'), { ssr: false });
  return (
    <PageWrapper>
      <PromptUpsertForm
        upserting={loading}
        onUpsert={async (formData: PromptFormData) => {
          await postData(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/prompts`, formData);
        }}
      />
    </PageWrapper>
  );
}
