import { EllipsisDropdownItem } from '@/components/core/dropdowns/EllipsisDropdown';
import { Table } from '@/components/core/table/Table';
import { ChatbotFaqFragment, SpaceWithIntegrationsFragment, useChatbotFaQsQuery, WebsiteScrapingInfoFragment } from '@/graphql/generated/generated-types';
import React, { useState } from 'react';

function getFAQsTable(param: ChatbotFaqFragment[]) {
  return [];
}

export function ChatbotFAQsTable(props: { space: SpaceWithIntegrationsFragment }) {
  const { data: websiteInfos } = useChatbotFaQsQuery({
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

  const [editChatbotFAQ, setEditChatbotFAQ] = useState<WebsiteScrapingInfoFragment | null>(null);
  const [showAddChatbotFAQModal, setShowAddChatbotFAQModal] = useState(false);

  return (
    <Table
      data={getFAQsTable(websiteInfos?.chatbotFAQs || [])}
      columnsHeadings={['Id', 'Base Url', 'Scraping Start Url', 'Ignore Hash', 'Ignore Query']}
      columnsWidthPercents={[5, 25, 20, 20, 10, 10]}
      actions={{
        items: siteScrapingActionItems,
        onSelect: async (key: string, item: { id: string }) => {
          if (key === 'edit') {
            setEditChatbotFAQ(item as WebsiteScrapingInfoFragment);
            setShowAddChatbotFAQModal(true);
          }
        },
      }}
    />
  );
}
