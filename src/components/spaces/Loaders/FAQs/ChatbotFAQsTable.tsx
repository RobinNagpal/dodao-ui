import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { Table, TableRow } from '@/components/core/table/Table';
import UpsertChatbotFAQModal from '@/components/spaces/Loaders/FAQs/UpsertChatbotFAQModal';
import { ChatbotFaqFragment, SpaceWithIntegrationsFragment, useChatbotFaQsQuery, WebsiteScrapingInfoFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

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
  ];

  const [editChatbotFAQ, setEditChatbotFAQ] = useState<ChatbotFaqFragment | null>(null);
  const [showAddChatbotFAQModal, setShowAddChatbotFAQModal] = useState(false);

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
    </>
  );
}
