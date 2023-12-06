import DeleteConfirmationModal from '@/components/app/Modal/DeleteConfirmationModal';
import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { Table, TableRow } from '@/components/core/table/Table';
import UpsertChatbotSubCategoryModal from '@/components/spaces/Loaders/Categories/UpsertChatbotSubCategoryModal';
import { ChatbotSubCategoryHelperFunctions } from '@/components/spaces/Loaders/Categories/useEditChatbotCategory';
import { ChatbotSubCategoryFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

function getCategoriesTable(subCategories: ChatbotSubCategoryFragment[]): TableRow[] {
  return subCategories.map((category: ChatbotSubCategoryFragment): TableRow => {
    return {
      id: category.key,
      columns: [category.key, category.name, category.description],
      item: category,
    };
  });
}

export function ChatbotSubCategoriesTable(props: {
  subCategories: ChatbotSubCategoryFragment[];
  subCategoryHelperFunctions: ChatbotSubCategoryHelperFunctions;
}) {
  const siteScrapingActionItems: EllipsisDropdownItem[] = [
    {
      key: 'edit',
      label: 'Edit',
    },
    {
      key: 'delete',
      label: 'Delete',
    },
  ];

  const [showUpsertSubCategoryModal, setShowUpsertSubCategoryModal] = React.useState(false);
  const [editChatbotSubCategory, setEditChatbotSubCategory] = React.useState<ChatbotSubCategoryFragment | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
            if (key === 'delete') {
              setEditChatbotSubCategory(item as ChatbotSubCategoryFragment);
              setShowDeleteModal(true);
            }
          },
        }}
        noDataText="No sub categories"
      />
      {showUpsertSubCategoryModal && (
        <UpsertChatbotSubCategoryModal
          open={showUpsertSubCategoryModal}
          onClose={() => setShowUpsertSubCategoryModal(false)}
          subCategoryHelperFunctions={props.subCategoryHelperFunctions}
          subCategory={editChatbotSubCategory}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          title={'Delete Sub Category'}
          open={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            if (editChatbotSubCategory) {
              props.subCategoryHelperFunctions.deleteSubCategory(editChatbotSubCategory?.key);
              setEditChatbotSubCategory(null);
              setShowDeleteModal(false);
            }
          }}
        />
      )}
    </div>
  );
}
