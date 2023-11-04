import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { Table, TableRow } from '@/components/core/table/Table';
import {
  ChatbotCategoryFragment,
  SpaceWithIntegrationsFragment,
  useChatbotCategoriesQuery,
  WebsiteScrapingInfoFragment,
} from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

function getCategoriesTable(categories: ChatbotCategoryFragment[]): TableRow[] {
  categories.map((category: ChatbotCategoryFragment): TableRow => {
    return {
      id: category.id,
      columns: [category.id.substring(0, 6), category.key, category.name, category.subcategories.map((sc) => sc.name).join(','), category.description],
      item: category,
    };
  });
  return [];
}

export function ChatbotCategoriesTable(props: { space: SpaceWithIntegrationsFragment }) {
  const { data: websiteInfos } = useChatbotCategoriesQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

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
    <Table
      heading={'Chatbot Categories'}
      data={getCategoriesTable(websiteInfos?.chatbotCategories || [])}
      onAddNew={() => {}}
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
  );
}
