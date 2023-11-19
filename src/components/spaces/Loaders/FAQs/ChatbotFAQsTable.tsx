import DeleteConfirmationModal from '@/components/app/Modal/DeleteConfirmationModal';
import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { Table, TableRow } from '@/components/core/table/Table';
import UpsertChatbotFAQModal from '@/components/spaces/Loaders/FAQs/UpsertChatbotFAQModal';
import { ChatbotFaqFragment, SpaceWithIntegrationsFragment, useChatbotFaQsQuery, useDeleteChatbotFaqMutation } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';
import { useNotificationContext } from '@/contexts/NotificationContext';

function getFAQsTable(faqs: ChatbotFaqFragment[]): TableRow[] {
  return faqs.map((faq: ChatbotFaqFragment): TableRow => {
    return {
      id: faq.id,
      columns: [faq.id.substring(0, 6), faq.question, faq.answer, faq.priority],
      item: faq,
    };
  });
}

export function ChatbotFAQsTable(props: { space: SpaceWithIntegrationsFragment }) {
  const { data: chatbotFAQsResponse } = useChatbotFaQsQuery({
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

  const [editChatbotFAQ, setEditChatbotFAQ] = useState<ChatbotFaqFragment | null>(null);
  const [showAddChatbotFAQModal, setShowAddChatbotFAQModal] = useState(false);
  const [deleteChatbotFAQ, setDeleteChatbotFAQ] = useState<ChatbotFaqFragment | null>(null);
  const [deleteChatbotFaqMutation] = useDeleteChatbotFaqMutation();
  const { showNotification } = useNotificationContext();
  return (
    <>
      <Table
        addNewLabel={'Add FAQ'}
        onAddNew={() => {
          setEditChatbotFAQ(null);
          setShowAddChatbotFAQModal(true);
        }}
        heading={'FAQs'}
        data={getFAQsTable(chatbotFAQsResponse?.chatbotFAQs || [])}
        columnsHeadings={['Id', 'Question', 'Answer', 'Priority']}
        columnsWidthPercents={[10, 30, 50, 10]}
        actions={{
          items: siteScrapingActionItems,
          onSelect: async (key: string, item: ChatbotFaqFragment) => {
            if (key === 'edit') {
              setEditChatbotFAQ(item);
              setShowAddChatbotFAQModal(true);
            }
            if (key === 'delete') {
              setDeleteChatbotFAQ(item);
            }
          },
        }}
        breakCellText={true}
      />
      {showAddChatbotFAQModal && (
        <UpsertChatbotFAQModal
          space={props.space}
          open={showAddChatbotFAQModal}
          onClose={() => {
            setEditChatbotFAQ(null);
            setShowAddChatbotFAQModal(false);
          }}
          faq={editChatbotFAQ}
        />
      )}
      {deleteChatbotFAQ && (
        <DeleteConfirmationModal
          title={'Delete FAQ'}
          open={!!deleteChatbotFAQ}
          onClose={() => setDeleteChatbotFAQ(null)}
          onDelete={async () => {
            await deleteChatbotFaqMutation({
              variables: {
                spaceId: props.space.id,
                id: deleteChatbotFAQ?.id,
              },
              refetchQueries: ['ChatbotFAQs'],
            });
            showNotification({ message: 'FAQ deleted', type: 'success' });
            setDeleteChatbotFAQ(null);
          }}
        />
      )}
    </>
  );
}
