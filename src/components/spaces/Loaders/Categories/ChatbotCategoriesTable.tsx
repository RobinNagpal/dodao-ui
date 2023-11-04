import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { Table, TableRow } from '@/components/core/table/Table';
import { ChatbotSubView, ChatbotView, getChatbotSubviewUrl } from '@/components/spaces/manageSpaceSubviews';
import {
  ChatbotCategoryFragment,
  SpaceWithIntegrationsFragment,
  useChatbotCategoriesQuery,
  WebsiteScrapingInfoFragment,
} from '@/graphql/generated/generated-types';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

function getCategoriesTable(categories: ChatbotCategoryFragment[]): TableRow[] {
  categories.map((category: ChatbotCategoryFragment): TableRow => {
    return {
      id: category.id,
      columns: [category.id.substring(0, 6), category.key, category.name, category.subCategories.map((sc) => sc.name).join(','), category.description],
      item: category,
    };
  });
  return [];
}

export function ChatbotCategoriesTable(props: { space: SpaceWithIntegrationsFragment }) {
  const { data: categories } = useChatbotCategoriesQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const router = useRouter();

  const siteScrapingActionItems: EllipsisDropdownItem[] = [
    {
      key: 'view',
      label: 'View',
    },
    {
      key: 'edit',
      label: 'Edit',
    },
  ];

  const [editChatbotCategory, setEditChatbotCategory] = useState<WebsiteScrapingInfoFragment | null>(null);
  const [showAddChatbotCategoryModal, setShowAddChatbotCategoryModal] = useState(false);

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
          items: siteScrapingActionItems,
          onSelect: async (key: string, item: { id: string }) => {
            if (key === 'edit') {
              setEditChatbotCategory(item as WebsiteScrapingInfoFragment);
              setShowAddChatbotCategoryModal(true);
            }
          },
        }}
      />
    </div>
  );
}
