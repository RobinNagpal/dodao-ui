import UpsertChatbotFAQModal from '@/components/spaces/Loaders/FAQs/UpsertChatbotFAQModal';
import { ChatbotFaqFragment, useChatbotFaQsQuery, useDeleteChatbotFaqMutation, useIndexChatbotFaQsMutation } from '@/graphql/generated/generated-types';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import orderBy from 'lodash/orderBy';
import React, { useState } from 'react';

function getFAQsTable(faqs: ChatbotFaqFragment[]): TableRow[] {
  return faqs.map((faq: ChatbotFaqFragment): TableRow => {
    return {
      id: faq.id,
      columns: [faq.id.substring(0, 6), faq.question, faq.answer.length > 100 ? faq.answer.substring(0, 100) : faq.answer, faq.priority],
      item: faq,
    };
  });
}

export function ChatbotFAQsTable(props: { space: SpaceWithIntegrationsDto }) {
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
  const [indexChatbotFaQsMutation] = useIndexChatbotFaQsMutation();

  const { showNotification } = useNotificationContext();

  return (
    <div>
      <div className="flex justify-end">
        <Button
          primary
          variant="contained"
          onClick={async () => {
            await indexChatbotFaQsMutation({
              variables: {
                spaceId: props.space.id,
              },
            });
            showNotification({ message: 'Triggered index run', type: 'success' });
          }}
          className="mr-4"
        >
          Trigger Full Index
        </Button>
        <Button
          primary
          variant="contained"
          onClick={async () => {
            setEditChatbotFAQ(null);
            setShowAddChatbotFAQModal(true);
          }}
        >
          Add FAQ
        </Button>
      </div>
      <Table
        heading={'FAQs'}
        data={getFAQsTable(orderBy(chatbotFAQsResponse?.chatbotFAQs || [], ['priority'], ['desc']))}
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
          title={`Delete FAQ - ${deleteChatbotFAQ.question}`}
          deleteButtonText="Delete FAQ"
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
    </div>
  );
}
