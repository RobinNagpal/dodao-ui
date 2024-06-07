import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { Table, TableRow } from '@/components/core/table/Table';
import DeleteChatbotCategoryModal from '@/components/spaces/Loaders/Categories/DeleteChatbotCategoryModal';
import { ChatbotSubView, ChatbotView, getChatbotSubviewUrl } from '@/components/spaces/manageSpaceSubviews';
import {
  ChatbotCategoryFragment,
  ChatbotSubCategoryFragment,
  SpaceWithIntegrationsFragment,
  useChatbotCategoriesQuery,
} from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

function getCategoriesTable(categories: ChatbotCategoryFragment[]): TableRow[] {
  return categories.map((category: ChatbotCategoryFragment): TableRow => {
    return {
      id: category.id,
      columns: [category.id.substring(0, 6), category.key, category.name, category.subCategories.map((sc) => sc.name).join(','), category.description],
      item: category,
    };
  });
}

export function ChatbotCategoriesTable(props: { space: SpaceWithIntegrationsFragment }) {
  const { data: categories } = useChatbotCategoriesQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const router = useRouter();

  const categoriesActionItems: EllipsisDropdownItem[] = [
    {
      key: 'edit',
      label: 'Edit',
    },
    {
      key: 'delete',
      label: 'Delete',
    },
  ];

  const [editChatbotCategory, setEditChatbotCategory] = React.useState<ChatbotSubCategoryFragment | null>(null);

  const [deleteChatbotCategory, setDeleteChatbotCategory] = React.useState<ChatbotCategoryFragment | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  return (
    <div>
      <Table
        heading={'Chatbot Categories'}
        data={getCategoriesTable(categories?.chatbotCategories || [])}
        onAddNew={() => {
          router.push(getChatbotSubviewUrl(ChatbotView.Categories, ChatbotSubView.CategoriesUpsert));
        }}
        columnsHeadings={['Id', 'Key', 'Name', 'Sub Categories', 'Description']}
        columnsWidthPercents={[5, 25, 20, 20, 10, 10]}
        actions={{
          items: categoriesActionItems,
          onSelect: async (key: string, item: { id: string }) => {
            if (key === 'edit') {
              router.push(getChatbotSubviewUrl(ChatbotView.Categories, ChatbotSubView.CategoriesUpsert, item.id));
            }

            if (key === 'delete') {
              const category = categories?.chatbotCategories.find((c) => c.id === item.id);
              if (category) {
                setDeleteChatbotCategory(category);
                setShowDeleteModal(true);
              }
            }
          },
        }}
      />

      {showDeleteModal && deleteChatbotCategory && (
        <DeleteChatbotCategoryModal
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={(value) => {
            if (!value) setDeleteChatbotCategory(null);
            setShowDeleteModal(value);
          }}
          spaceId={props.space.id}
          chatbotCategoryId={deleteChatbotCategory.id}
        />
      )}
    </div>
  );
}
