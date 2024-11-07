import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { useEditChatbotCategory } from '@/components/spaces/Loaders/Categories/useEditChatbotCategory';
import React from 'react';
import { ChatbotCategoryFragment } from '@/graphql/generated/generated-types';

interface DeleteChatbotCategoryModal {
  spaceId: string;
  chatbotCategory: ChatbotCategoryFragment;
  showDeleteModal: boolean;
  setShowDeleteModal: (showDelete: boolean) => void;
}

export default function DeleteChatbotCategoryModal(props: DeleteChatbotCategoryModal) {
  const { deleteChatbotCategory } = useEditChatbotCategory(props.spaceId, props.chatbotCategory.id);

  return (
    <DeleteConfirmationModal
      title={`Delete Category - ${props.chatbotCategory.name}`}
      deleteButtonText="Delete Category"
      open={props.showDeleteModal}
      onClose={() => props.setShowDeleteModal(false)}
      onDelete={async () => {
        deleteChatbotCategory();
        props.setShowDeleteModal(false);
      }}
    />
  );
}
