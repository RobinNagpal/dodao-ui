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

export interface ChatbotSubCategoryHelperFunctions {
  deleteSubCategory: (subCategoryKey: string) => void;
  isSubCategoryValid: (subCategory: UpsertChatbotSubcategoryInput) => boolean;
  upsertChatbotSubCategory: (subCategory: UpsertChatbotSubcategoryInput) => void;
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
      subCategories: [...prev.subCategories.filter((s) => s.key !== subCategory.key), subCategory],
    }));
  }

  async function upsertChatbotCategory(): Promise<void> {
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

  function deleteSubCategory(subCategoryKey: string) {
    setChatbotCategory((prev) => ({
      ...prev,
      subCategories: prev.subCategories.filter((s) => s.key !== subCategoryKey),
    }));
  }

  function isSubCategoryValid(subCategory: UpsertChatbotSubcategoryInput) {
    const allFieldsPresent = subCategory.key && subCategory.name && subCategory.description;
    if (!allFieldsPresent) return false;

    const isKeyUnique = !chatbotCategory.subCategories.find((s) => s.key === subCategory.key);
    const isNameUnique = !chatbotCategory.subCategories.find((s) => s.name === subCategory.name);
    const isKeyValid = /^[a-z0-9]+$/i.test(subCategory.key);
    const isNameLengthValid = subCategory.name.length <= 30 && subCategory.name.length <= 30;
    const isDescriptionLengthValid = subCategory.description.length <= 100;

    return isKeyUnique && isNameUnique && isKeyValid && isNameLengthValid && isDescriptionLengthValid;
  }

  const subCategoryHelperFunctions: ChatbotSubCategoryHelperFunctions = {
    deleteSubCategory,
    isSubCategoryValid,
    upsertChatbotSubCategory,
  };

  return {
    chatbotCategory,
    setChatbotCategoryField,
    subCategoryHelperFunctions,
    upsertChatbotCategory,
    upserting,
  };
}
