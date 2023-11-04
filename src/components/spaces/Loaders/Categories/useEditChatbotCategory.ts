import { ChatbotSubView, ChatbotView, getChatbotSubviewUrl } from '@/components/spaces/manageSpaceSubviews';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  UpsertChatbotCategoryInput,
  UpsertChatbotSubcategoryInput,
  useChatbotCategoriesQuery,
  useUpsertChatbotCategoryMutation,
} from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 } from 'uuid';

export interface ChatbotCategoryInputType extends Omit<UpsertChatbotCategoryInput, 'id'> {
  id?: string;
}
export function useEditChatbotCategory(spaceId: string, categoryId?: string) {
  const { showNotification } = useNotificationContext();

  const [upserting, setUpserting] = useState(false);
  const router = useRouter();
  const [upsertChatbotCategoryMutation] = useUpsertChatbotCategoryMutation();
  const { data: categories } = useChatbotCategoriesQuery({
    variables: {
      spaceId: spaceId,
    },
  });

  useEffect(() => {
    if (categories?.chatbotCategories) {
      const category = categories.chatbotCategories.find((c) => c.key === categoryId);
      if (category) {
        setChatbotCategory(category);
      }
    }
  }, [categories?.chatbotCategories]);

  const [chatbotCategory, setChatbotCategory] = useState<UpsertChatbotCategoryInput>({
    description: '',
    id: v4(),
    key: '',
    name: '',
    priority: 50,
    subCategories: [],
  });

  function setChatbotCategoryField(field: keyof ChatbotCategoryInputType, value: any) {
    setChatbotCategory((prev) => ({ ...prev, [field]: value }));
  }

  function upsertChatbotSubCategory(subCategory: UpsertChatbotSubcategoryInput) {
    setChatbotCategory((prev) => ({
      ...prev,
      subcategories: [...prev.subCategories.filter((s) => s.key !== subCategory.key), subCategory],
    }));
  }

  async function upsertChatbotCategory() {
    try {
      setUpserting(true);
      await upsertChatbotCategoryMutation({
        variables: {
          spaceId: spaceId,
          input: chatbotCategory,
        },
        refetchQueries: ['ChatbotCategories'],
      });
      setUpserting(false);
      showNotification({ message: 'Upserted', type: 'success' });
      router.push(getChatbotSubviewUrl(ChatbotView.Categories, ChatbotSubView.CategoriesInfo));
    } catch (error) {
      setUpserting(false);
      showNotification({ message: 'Failed to Upsert', type: 'error' });
    }
  }

  return {
    chatbotCategory,
    setChatbotCategoryField,
    upsertChatbotSubCategory,
    upsertChatbotCategory,
    upserting,
  };
}
