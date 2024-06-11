import SectionLoader from '@dodao/web-core/components/core/loaders/SectionLoader';
import { Table, TableRow } from '@dodao/web-core/components/core/table/Table';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import { DiscordMessage, SpaceWithIntegrationsFragment, useDiscordMessagesQuery, useReFetchDiscordMessagesMutation } from '@/graphql/generated/generated-types';
import moment from 'moment';
import Link from 'next/link';
import React from 'react';

function getMessageRows(discordRuns: DiscordMessage[]): TableRow[] {
  return discordRuns.map((message: DiscordMessage): TableRow => {
    const messageDate = moment(new Date(message.messageDate)).local().format('YYYY/MM/DD HH:mm');
    return {
      id: message.id,
      columns: [message.id.substring(0, 6), message.authorUsername, message.content, messageDate],
      item: message,
    };
  });
}

export default function DiscordMessages(props: { space: SpaceWithIntegrationsFragment; channelId: string }) {
  const { data, loading } = useDiscordMessagesQuery({
    variables: {
      spaceId: props.space.id,
      channelId: props.channelId,
    },
  });
  const { showNotification } = useNotificationContext();

  const [reFetchDiscordMessagesMutation] = useReFetchDiscordMessagesMutation();

  if (loading || !data) {
    return <SectionLoader />;
  }

  return (
    <div className="mt-8 w-full">
      <Link href={'/space/manage/' + ManageSpaceSubviews.Chatbot + '/' + 'discord/channels'} className="text-color">
        <span className="mr-1 font-bold">&#8592;</span>
        All Channels
      </Link>
      <Table
        addNewLabel="Refetch Messages"
        onAddNew={async () => {
          await reFetchDiscordMessagesMutation({
            variables: {
              spaceId: props.space.id,
              channelId: props.channelId,
            },
            refetchQueries: ['DiscordMessages'],
          });
          showNotification({ message: 'Triggered new discourse index run', type: 'success' });
        }}
        heading={'Discord Messages'}
        data={getMessageRows(data?.discordMessages || [])}
        columnsHeadings={['Id', 'Author', 'Content', 'Date']}
        columnsWidthPercents={[20, 50, 20, 10]}
      />
    </div>
  );
}
