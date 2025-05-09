// app/prompts/edit/create/page.tsx
'use client';

import { PromptFormData } from '@/components/prompts/PromptUpsertForm';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import dynamic from 'next/dynamic';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { BreadcrumbsOjbect } from '@dodao/web-core/components/core/breadcrumbs/BreadcrumbsWithChevrons';
import { useRouter } from 'next/navigation';
import { Prompt } from '@prisma/client';

export default function CreatePromptPage() {
  const router = useRouter();
  const { postData, loading, error } = usePostData<Prompt, PromptFormData>({
    successMessage: 'Prompt created successfully!',
    errorMessage: 'Failed to create prompt.',
  });

  const PromptUpsertForm = dynamic(() => import('@/components/prompts/PromptUpsertForm'), { ssr: false });

  const breadcrumbs: BreadcrumbsOjbect[] = [
    {
      name: 'Prompts',
      href: '/prompts',
      current: false,
    },
    {
      name: 'Create Prompt',
      href: '/prompts/create',
      current: true,
    },
  ];

  return (
    <PageWrapper>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <PromptUpsertForm
        upserting={loading}
        onUpsert={async (formData: PromptFormData) => {
          const response = await postData(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/prompts`, formData);
          if (!error) {
            router.push(`/prompts/${response?.id}`);
          }
        }}
      />
    </PageWrapper>
  );
}
