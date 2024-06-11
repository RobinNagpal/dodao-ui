import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import UpsertChatbotUserQuestionModal from '@/components/spaces/Loaders/FAQs/UpsertChatbotUserQuestionModal';
import {
  ChatbotUserQuestionFragment,
  SpaceWithIntegrationsFragment,
  useChatbotUserQuestionsQuery,
  useDeleteChatbotUserQuestionMutation,
} from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';

function getUserQuestionsTable(faqs: ChatbotUserQuestionFragment[]): TableRow[] {
  return faqs.map((faq: ChatbotUserQuestionFragment): TableRow => {
    return {
      id: faq.id,
      columns: [faq.id.substring(0, 6), faq.question],
      item: faq,
    };
  });
}

export function ChatbotUserQuestionsTable(props: { space: SpaceWithIntegrationsFragment }) {
  const { data: chatbotUserQuestionsResponse } = useChatbotUserQuestionsQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

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

  const [editChatbotUserQuestion, setEditChatbotUserQuestion] = useState<ChatbotUserQuestionFragment | null>(null);
  const [showAddChatbotUserQuestionModal, setShowAddChatbotUserQuestionModal] = useState(false);
  const [deleteChatbotUserQuestion, setDeleteChatbotUserQuestion] = useState<ChatbotUserQuestionFragment | null>(null);
  const [deleteChatbotUserQuestionMutation] = useDeleteChatbotUserQuestionMutation();
  const { showNotification } = useNotificationContext();
  return (
    <>
      <Table
        addNewLabel={'Add User Question'}
        onAddNew={() => {
          setEditChatbotUserQuestion(null);
          setShowAddChatbotUserQuestionModal(true);
        }}
        heading={'User Questions'}
        data={getUserQuestionsTable(chatbotUserQuestionsResponse?.chatbotUserQuestions || [])}
        columnsHeadings={['Id', 'Question']}
        columnsWidthPercents={[10, 90]}
        actions={{
          items: siteScrapingActionItems,
          onSelect: async (key: string, item: ChatbotUserQuestionFragment) => {
            if (key === 'edit') {
              setEditChatbotUserQuestion(item);
              setShowAddChatbotUserQuestionModal(true);
            }
            if (key === 'delete') {
              setDeleteChatbotUserQuestion(item);
            }
          },
        }}
        breakCellText={true}
      />
      {showAddChatbotUserQuestionModal && (
        <UpsertChatbotUserQuestionModal
          space={props.space}
          open={showAddChatbotUserQuestionModal}
          onClose={() => {
            setEditChatbotUserQuestion(null);
            setShowAddChatbotUserQuestionModal(false);
          }}
          userQuestion={editChatbotUserQuestion}
        />
      )}
      {deleteChatbotUserQuestion && (
        <DeleteConfirmationModal
          title={'Delete UserQuestion'}
          open={!!deleteChatbotUserQuestion}
          onClose={() => setDeleteChatbotUserQuestion(null)}
          onDelete={async () => {
            await deleteChatbotUserQuestionMutation({
              variables: {
                spaceId: props.space.id,
                id: deleteChatbotUserQuestion?.id,
              },
              refetchQueries: ['ChatbotUserQuestions'],
            });
            showNotification({ message: 'UserQuestion deleted', type: 'success' });
            setDeleteChatbotUserQuestion(null);
          }}
        />
      )}
    </>
  );
}
