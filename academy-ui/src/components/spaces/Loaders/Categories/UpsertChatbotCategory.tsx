import Button from '@/components/core/buttons/Button';
import Input from '@/components/core/input/Input';
import { ChatbotSubCategoriesTable } from '@/components/spaces/Loaders/Categories/ChatbotSubCategoriesTable';
import { useEditChatbotCategory } from '@/components/spaces/Loaders/Categories/useEditChatbotCategory';
import { ChatbotSubView, ChatbotView, getChatbotSubviewUrl } from '@/components/spaces/manageSpaceSubviews';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React from 'react';

interface UpsertChatbotCategoryProps {
  space: SpaceWithIntegrationsFragment;
  categoryId?: string;
}

export default function UpsertChatbotCategory(props: UpsertChatbotCategoryProps) {
  const { chatbotCategory, setChatbotCategoryField, subCategoryHelperFunctions, upsertChatbotCategory, upserting } = useEditChatbotCategory(
    props.space.id,
    props.categoryId
  );

  const router = useRouter();

  return (
    <div className="text-left p-6 divide-y divide-slate-400 divide-dashed">
      <div className="pb-16">
        <Input
          label="Key"
          disabled={!!props.categoryId}
          modelValue={chatbotCategory.key}
          onUpdate={(value) => setChatbotCategoryField('key', value?.toString() || '')}
        />
        <Input label="Name" modelValue={chatbotCategory.name} onUpdate={(value) => setChatbotCategoryField('name', value?.toString() || '')} />
        <Input
          label="Description"
          modelValue={chatbotCategory.description}
          onUpdate={(value) => setChatbotCategoryField('description', value?.toString() || '')}
        />
        <Input label="Priority" number modelValue={chatbotCategory.priority} onUpdate={(value) => setChatbotCategoryField('priority', value || 0)} />
      </div>
      <div className="pb-16 pt-8">
        <ChatbotSubCategoriesTable subCategories={chatbotCategory.subCategories} subCategoryHelperFunctions={subCategoryHelperFunctions} />
      </div>
      <div className="flex pt-8">
        <Button
          className="mr-4"
          disabled={upserting}
          onClick={() => {
            router.push(getChatbotSubviewUrl(ChatbotView.Categories, ChatbotSubView.CategoriesInfo));
          }}
        >
          Cancel
        </Button>
        <Button variant="contained" primary onClick={() => upsertChatbotCategory()} disabled={upserting} loading={upserting}>
          Save
        </Button>
      </div>
    </div>
  );
}
