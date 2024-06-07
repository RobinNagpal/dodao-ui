import { EllipsisDropdownItem } from '@dodao/web-core/components/core/dropdowns/EllipsisDropdown';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { Table, TableActions, TableRow } from '@dodao/web-core/components/core/table/Table';
import UpsertArticleIndexingInfoModal from '@/components/spaces/Edit/LoadersInfo/UpsertArticleIndexingInfoModal';
import UpsertWebsiteScrapingInfoModal from '@/components/spaces/Edit/LoadersInfo/UpsertWebsiteScrapingInfoModal';
import { ChatbotCategoriesTable } from '@/components/spaces/Loaders/Categories/ChatbotCategoriesTable';
import UpsertChatbotCategory from '@/components/spaces/Loaders/Categories/UpsertChatbotCategory';
import DiscordChannels from '@/components/spaces/Loaders/Discord/DiscordChannels';
import DiscordMessages from '@/components/spaces/Loaders/Discord/DiscordMessages';
import DiscourseIndexRuns from '@/components/spaces/Loaders/Discourse/DiscourseIndexRuns';
import DiscourseInfo from '@/components/spaces/Loaders/Discourse/DiscourseInfo';
import DiscoursePostComments from '@/components/spaces/Loaders/Discourse/DiscoursePostComments';
import { ChatbotFAQsTable } from '@/components/spaces/Loaders/FAQs/ChatbotFAQsTable';
import { ChatbotUserQuestionsTable } from '@/components/spaces/Loaders/UserQuestions/ChatbotUserQuestionsTable';
import WebsiteScrapedURLInfosTable from '@/components/spaces/Loaders/WebsiteScrape/WebsiteScrapedURLInfosTable';
import { ChatbotSubView, ChatbotView, getChatbotSubviewUrl, ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import { useNotificationContext } from '@/contexts/NotificationContext';
import {
  ArticleIndexingInfoFragment,
  SpaceWithIntegrationsFragment,
  useArticleIndexingInfosQuery,
  useTriggerSiteScrapingRunMutation,
  useWebsiteScrapingInfosQuery,
  WebsiteScrapingInfoFragment,
} from '@/graphql/generated/generated-types';
import moment from 'moment/moment';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import ViewCompleteArticleTextModal from '../Edit/LoadersInfo/ViewCompleteArticleTextModal';

function getLoaderRows(): TableRow[] {
  const indexedAt = moment(new Date()).local().format('YYYY/MM/DD HH:mm');
  const tableRows: TableRow[] = [];
  tableRows.push({
    id: 'discourse',
    columns: ['Discourse', indexedAt, 'STATUS'],
    item: {
      id: 'discourse',
    },
  });

  tableRows.push({
    id: 'discord',
    columns: ['Discord', indexedAt, 'STATUS'],
    item: {
      id: 'discord',
    },
  });
  return tableRows;
}

export default function AllLoaders(props: { space: SpaceWithIntegrationsFragment; spaceInfoParams: string[] }) {
  const router = useRouter();

  const websiteScrappingThreeDotItems = [{ label: 'Add', key: 'add' }];

  const [showAddWebsiteScrappingInfoModal, setShowAddWebsiteScrappingInfoModal] = useState(false);
  const [editWebsiteScrappingInfo, setEditWebsiteScrappingInfo] = useState<WebsiteScrapingInfoFragment | undefined>(undefined);

  const [editArticleIndexingInfo, setEditArticleIndexingInfo] = useState<ArticleIndexingInfoFragment | undefined>(undefined);
  const [articleIndexingSpaceAndInfoId, setArticleIndexingSpaceAndInfoId] = useState<{ spaceId: string; articleIndexingInfoId: string } | undefined>(undefined);
  const [showAddArticleIndexingInfoModal, setShowAddArticleIndexingInfoModal] = useState(false);
  const [viewCompleteTextModal, setViewCompleteTextModal] = useState<boolean>(false);

  const { showNotification } = useNotificationContext();
  const { data: websiteInfos } = useWebsiteScrapingInfosQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const { data: articleIndexingInfos } = useArticleIndexingInfosQuery({
    variables: {
      spaceId: props.space.id,
    },
  });

  const [triggerSiteScrapingRunMutation] = useTriggerSiteScrapingRunMutation();

  const siteScrapingActionItems: EllipsisDropdownItem[] = [
    {
      key: 'view',
      label: 'View',
    },
    {
      key: 'edit',
      label: 'Edit',
    },
    {
      key: 'index',
      label: 'Index',
    },
  ];

  function getWebsiteScrapingInfoTable(discoursePosts: WebsiteScrapingInfoFragment[]): TableRow[] {
    return discoursePosts.map((post: WebsiteScrapingInfoFragment): TableRow => {
      return {
        id: post.id,
        columns: [post.id.substring(0, 6), post.baseUrl, post.scrapingStartUrl, post.ignoreHashInUrl.toString(), post.ignoreQueryParams.toString()],
        item: post,
      };
    });
  }

  function getArticleIndexingInfoTable(discoursePosts: ArticleIndexingInfoFragment[]): TableRow[] {
    return discoursePosts.map((post: ArticleIndexingInfoFragment): TableRow => {
      return {
        id: post.id,
        columns: [post.id.substring(0, 6), post.articleUrl, post.textSample, post.textLength, post.status],
        item: post,
      };
    });
  }

  const loaderType = props.spaceInfoParams?.[2];
  const loaderSubview = props.spaceInfoParams?.[3];
  const subviewPathParam = props.spaceInfoParams?.[4];

  const tableActions: TableActions = useMemo(() => {
    return {
      items: [
        {
          key: 'view',
          label: 'View',
        },
      ],
      onSelect: async (key: string, item: { id: string }) => {
        if (key === 'view') {
          if (item.id === 'discourse') {
            const discourseIndexRunsUrl = getChatbotSubviewUrl(ChatbotView.Discourse, ChatbotSubView.DiscourseIndexRuns);
            router.push(discourseIndexRunsUrl);
            return;
          }

          const discordServerId = props.space.spaceIntegrations?.loadersInfo?.discordServerId;
          console.log('discordServerId', discordServerId);
          if (item.id === 'discord' && discordServerId) {
            const discordChannelsUrl = getChatbotSubviewUrl(ChatbotView.Discord, ChatbotSubView.DiscordChannels);
            router.push(discordChannelsUrl);
            return;
          }
        }
      },
    };
  }, []);

  const [selectedTabId, setSelectedTabId] = useState(ChatbotView.Discourse);

  if (loaderSubview === ChatbotSubView.DiscouseInfo) {
    return <DiscourseInfo space={props.space} />;
  }

  if (loaderSubview === ChatbotSubView.CategoriesInfo) {
    return <ChatbotCategoriesTable space={props.space} />;
  }

  if (loaderSubview === ChatbotSubView.CategoriesUpsert) {
    return <UpsertChatbotCategory space={props.space} categoryId={subviewPathParam} />;
  }

  if (loaderSubview === ChatbotSubView.FAQsInfo) {
    return <ChatbotFAQsTable space={props.space} />;
  }

  if (loaderSubview === ChatbotSubView.UserQuestionsInfo) {
    return <ChatbotUserQuestionsTable space={props.space} />;
  }

  if (loaderSubview === ChatbotSubView.DiscourseIndexRuns) {
    return <DiscourseIndexRuns space={props.space} />;
  }

  if (loaderSubview === ChatbotSubView.DiscoursePostComments && subviewPathParam) {
    return <DiscoursePostComments space={props.space} postId={subviewPathParam} />;
  }

  if (loaderSubview === ChatbotSubView.DiscordChannels) {
    return <DiscordChannels space={props.space} />;
  }

  if (loaderSubview === ChatbotSubView.DiscordChannels) {
    return <DiscordChannels space={props.space} />;
  }

  if (loaderSubview === ChatbotSubView.DiscordMessages && subviewPathParam) {
    return <DiscordMessages space={props.space} channelId={subviewPathParam} />;
  }

  if (loaderSubview === ChatbotSubView.WebsiteScrapingURLInfos && subviewPathParam) {
    return <WebsiteScrapedURLInfosTable space={props.space} websiteScrapingInfoId={subviewPathParam} />;
  }
  return (
    <div className="divide-y divide-slate-400  divide-dashed">
      <div className="mb-32">
        <Table
          data={getLoaderRows()}
          heading={'Loader Info'}
          columnsHeadings={['Loader', 'Last Indexed At', 'Status']}
          columnsWidthPercents={[20, 50, 20, 10]}
          actions={tableActions}
        />
      </div>

      <div className="mb-32">
        <div className="flex justify-end mt-4">
          <PrivateEllipsisDropdown items={websiteScrappingThreeDotItems} onSelect={() => setShowAddWebsiteScrappingInfoModal(true)} />
        </div>
        <Table
          heading={'Website Scraping Info'}
          data={getWebsiteScrapingInfoTable(websiteInfos?.websiteScrapingInfos || [])}
          columnsHeadings={['Id', 'Base Url', 'Scraping Start Url', 'Ignore Hash', 'Ignore Query']}
          columnsWidthPercents={[5, 25, 20, 20, 10, 10]}
          actions={{
            items: siteScrapingActionItems,
            onSelect: async (key: string, item: { id: string }) => {
              if (key === 'view') {
                const websiteScrapingInfoUrl = getChatbotSubviewUrl(ChatbotView.WebsiteScraping, ChatbotSubView.WebsiteScrapingURLInfos, item.id);
                router.push(websiteScrapingInfoUrl);
              } else if (key === 'edit') {
                setEditWebsiteScrappingInfo(item as WebsiteScrapingInfoFragment);
                setShowAddWebsiteScrappingInfoModal(true);
              } else if (key === 'index') {
                await triggerSiteScrapingRunMutation({
                  variables: {
                    spaceId: props.space.id,
                    websiteScrapingInfoId: item.id,
                  },
                });
                showNotification({ message: 'Triggered Indexing of the site', type: 'success' });
              }
            },
          }}
        />
      </div>

      <div>
        <div className="flex justify-end mt-4">
          <PrivateEllipsisDropdown items={websiteScrappingThreeDotItems} onSelect={() => setShowAddArticleIndexingInfoModal(true)} />
        </div>
        <Table
          heading={'Article Indexing Info'}
          data={getArticleIndexingInfoTable(articleIndexingInfos?.articleIndexingInfos || [])}
          columnsHeadings={['Id', 'Url', 'Text', 'Text Length', 'Status']}
          columnsWidthPercents={[5, 25, 20, 20, 20]}
          actions={{
            items: [
              {
                key: 'edit',
                label: 'Edit',
              },
              {
                key: 'view',
                label: 'View Complete Text',
              },
            ],
            onSelect: async (key: string, item: { id: string }) => {
              if (key === 'edit') {
                setEditArticleIndexingInfo(item as ArticleIndexingInfoFragment);
                setShowAddArticleIndexingInfoModal(true);
              } else if (key === 'view') {
                setArticleIndexingSpaceAndInfoId({ spaceId: props.space.id, articleIndexingInfoId: item.id });
                setViewCompleteTextModal(true);
              }
            },
          }}
        />
      </div>
      {showAddWebsiteScrappingInfoModal && (
        <UpsertWebsiteScrapingInfoModal
          websiteScrapingInfo={editWebsiteScrappingInfo}
          open={showAddWebsiteScrappingInfoModal}
          onClose={() => {
            setEditWebsiteScrappingInfo(undefined);
            setShowAddWebsiteScrappingInfoModal(false);
          }}
          spaceId={props.space.id}
        />
      )}
      {showAddArticleIndexingInfoModal && (
        <UpsertArticleIndexingInfoModal
          articleIndexingInfo={editArticleIndexingInfo}
          open={showAddArticleIndexingInfoModal}
          onClose={() => {
            setEditArticleIndexingInfo(undefined);
            setShowAddArticleIndexingInfoModal(false);
          }}
          spaceId={props.space.id}
        />
      )}
      {viewCompleteTextModal && (
        <ViewCompleteArticleTextModal
          indexingInfo={articleIndexingSpaceAndInfoId}
          open={viewCompleteTextModal}
          onClose={() => {
            setEditArticleIndexingInfo(undefined);
            setViewCompleteTextModal(false);
          }}
        />
      )}
    </div>
  );
}
