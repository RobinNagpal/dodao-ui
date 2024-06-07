import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { useEditChatbotCategory } from '@/components/spaces/Loaders/Categories/useEditChatbotCategory';
import React from 'react';

interface DeleteChatbotCategoryModal {
  spaceId: string;
  chatbotCategoryId: string;
  showDeleteModal: boolean;
  setShowDeleteModal: (showDelete: boolean) => void;
}

export default function DeleteChatbotCategoryModal(props: DeleteChatbotCategoryModal) {
  const { deleteChatbotCategory } = useEditChatbotCategory(props.spaceId, props.chatbotCategoryId);

  return (
    <DeleteConfirmationModal
      title={'Delete Category'}
      open={props.showDeleteModal}
      onClose={() => props.setShowDeleteModal(false)}
      onDelete={async () => {
        deleteChatbotCategory();
        props.setShowDeleteModal(false);
      }}
    />
  );
}
