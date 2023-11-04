import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { Table, TableRow } from '@/components/core/table/Table';
import UpsertChatbotSubCategoryModal from '@/components/spaces/Loaders/Categories/UpsertChatbotSubCategoryModal';
import { ChatbotSubCategoryFragment } from '@/graphql/generated/generated-types';
import React from 'react';

function getCategoriesTable(categories: ChatbotSubCategoryFragment[]): TableRow[] {
  categories.map((category: ChatbotSubCategoryFragment): TableRow => {
    return {
      id: category.key,
      columns: [category.key, category.name, category.description],
      item: category,
    };
  });
  return [];
}

export function ChatbotSubCategoriesTable(props: {
  subCategories: ChatbotSubCategoryFragment[];
  upsertChatbotSubCategory: (subCategory: ChatbotSubCategoryFragment) => void;
}) {
  const siteScrapingActionItems: EllipsisDropdownItem[] = [
    {
      key: 'edit',
      label: 'Edit',
    },
  ];

  const [showUpsertSubCategoryModal, setShowUpsertSubCategoryModal] = React.useState(false);
  const [editChatbotSubCategory, setEditChatbotSubCategory] = React.useState<ChatbotSubCategoryFragment | null>(null);

  return (
    <div>
      <Table
        heading={'Sub Categories'}
        data={getCategoriesTable(props.subCategories)}
        onAddNew={() => {
          setShowUpsertSubCategoryModal(true);
        }}
        columnsHeadings={['Key', 'Name', 'Description']}
        columnsWidthPercents={[20, 30, 50]}
        actions={{
          items: siteScrapingActionItems,
          onSelect: async (key: string, item: { key: string }) => {
            if (key === 'edit') {
              setEditChatbotSubCategory(item as ChatbotSubCategoryFragment);
              setShowUpsertSubCategoryModal(true);
            }
          },
        }}
        noDataText="No sub categories"
      />
      {showUpsertSubCategoryModal && (
        <UpsertChatbotSubCategoryModal
          open={showUpsertSubCategoryModal}
          onClose={() => setShowUpsertSubCategoryModal(false)}
          upsertSubCategory={(subCategory) => {
            props.upsertChatbotSubCategory(subCategory);
            setShowUpsertSubCategoryModal(false);
          }}
          subCategory={editChatbotSubCategory}
        />
      )}
    </div>
  );
}
