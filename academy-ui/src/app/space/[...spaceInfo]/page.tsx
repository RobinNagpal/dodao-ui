import SidebarLayout from '@/app/SidebarLayout';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import GenerateImage from '@/components/spaces/Image/GenerateImage';
import ListSpaces from '@/components/spaces/ListSpaces';
import AllLoaders from '@/components/spaces/Loaders/AllLoaders';
import { ChatbotSubView, ChatbotView, getBaseUrlForSpaceSubview, ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import SpaceDetails from '@/components/spaces/SpaceDetails';
import GenerateStoryBoard from '@/components/spaces/StoryBoard/GenerateStoryBoard';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import classNames from '@dodao/web-core/utils/classNames';
import BuildingOffice2Icon from '@heroicons/react/24/outline/BuildingOffice2Icon';
import CircleStackIcon from '@heroicons/react/24/outline/CircleStackIcon';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
import AdjustmentsHorizontalIcon from '@heroicons/react/24/solid/AdjustmentsHorizontalIcon';
import ArrowUturnLeftIcon from '@heroicons/react/24/solid/ArrowUturnLeftIcon';
import ChatBubbleLeftIcon from '@heroicons/react/24/solid/ChatBubbleLeftIcon';
import CodeBracketIcon from '@heroicons/react/24/solid/CodeBracketIcon';
import ComputerDesktopIcon from '@heroicons/react/24/solid/ComputerDesktopIcon';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import QuestionMarkCircleIcon from '@heroicons/react/24/solid/QuestionMarkCircleIcon';
import TableCellsIcon from '@heroicons/react/24/solid/TableCellsIcon';
import Link from 'next/link';

interface NavigationElementType {
  name: string;
  href: string;
  icon: any;
  current: boolean;
}

const getNavigation = (space: SpaceWithIntegrationsFragment, subView?: string, subSubView?: string): NavigationElementType[] => {
  if (subView === ManageSpaceSubviews.Chatbot) {
    const chatbotBaseUrl = getBaseUrlForSpaceSubview(space.id, ManageSpaceSubviews.Chatbot);
    return [
      {
        name: 'Back',
        href: `/space/manage/${ManageSpaceSubviews.ViewSpace}/${space.id}`,
        icon: ArrowUturnLeftIcon,
        current: false,
      },
      {
        name: 'Discourse',
        href: chatbotBaseUrl + '/' + ChatbotView.Discourse + '/' + ChatbotSubView.DiscouseInfo,
        icon: TableCellsIcon,
        current: subSubView === ChatbotSubView.DiscouseInfo,
      },
      {
        name: 'Discord',
        href: chatbotBaseUrl + '/' + ChatbotView.Discord + '/' + ChatbotSubView.DiscordInfo,
        icon: ChatBubbleLeftIcon,
        current: subSubView === ChatbotSubView.DiscordInfo,
      },
      {
        name: 'Website',
        href: chatbotBaseUrl + '/' + ChatbotView.WebsiteScraping + '/' + ChatbotSubView.WebScrappingInfo,
        icon: ComputerDesktopIcon,
        current: subSubView === ChatbotSubView.WebScrappingInfo,
      },
      {
        name: 'Github',
        href: chatbotBaseUrl + '/' + ChatbotView.Github + '/' + ChatbotSubView.GithubInfo,
        icon: CodeBracketIcon,
        current: subSubView === ChatbotSubView.GithubInfo,
      },
      {
        name: 'FAQs',
        href: chatbotBaseUrl + '/' + ChatbotView.FAQs + '/' + ChatbotSubView.FAQsInfo,
        icon: QuestionMarkCircleIcon,
        current: subSubView === ChatbotSubView.FAQsInfo,
      },
      {
        name: 'User Questions',
        href: chatbotBaseUrl + '/' + ChatbotView.UserQuestions + '/' + ChatbotSubView.UserQuestionsInfo,
        icon: QuestionMarkCircleIcon,
        current: subSubView === ChatbotSubView.UserQuestionsInfo,
      },
      {
        name: 'Categories',
        href: chatbotBaseUrl + '/' + ChatbotView.Categories + '/' + ChatbotSubView.CategoriesInfo,
        icon: AdjustmentsHorizontalIcon,
        current: subSubView === ChatbotSubView.FAQsInfo,
      },
    ];
  }
  const navigation = [
    {
      name: 'Dashboard',
      href: `/space/manage/${ManageSpaceSubviews.ViewSpace}/${space.id}`,
      icon: HomeIcon,
      current: subView === ManageSpaceSubviews.ViewSpace,
    },
    {
      name: 'Image',
      href: `/space/manage/${ManageSpaceSubviews.GenerateImage}/${space.id}`,
      icon: PhotoIcon,
      current: subView === ManageSpaceSubviews.GenerateImage,
    },
    {
      name: 'Story Board',
      href: `/space/manage/${ManageSpaceSubviews.GenerateStoryBoard}/${space.id}`,
      icon: PhotoIcon,
      current: subView === ManageSpaceSubviews.GenerateStoryBoard,
    },
    {
      name: 'Chatbot',
      href: '/space/manage/' + ManageSpaceSubviews.Chatbot + '/' + ChatbotView.Discourse + '/' + ChatbotSubView.DiscouseInfo,
      icon: CircleStackIcon,
      current: subView === ManageSpaceSubviews.Chatbot,
    },
    { name: 'Spaces', href: '/space/manage/' + ManageSpaceSubviews.SpacesList, icon: BuildingOffice2Icon, current: subView === ManageSpaceSubviews.SpacesList },
  ];

  return navigation;
};
function GetSubview(props: { spaceInfo: string[]; space: SpaceWithIntegrationsFragment }) {
  const { spaceInfo } = props;

  const subView = spaceInfo?.[1];

  const entityId = spaceInfo?.[2];

  if (subView === ManageSpaceSubviews.SpacesList) {
    return <ListSpaces />;
  }

  if (subView === ManageSpaceSubviews.ViewSpace) {
    return <SpaceDetails spaceId={entityId} />;
  }
  if (subView === ManageSpaceSubviews.GenerateImage) {
    return <GenerateImage />;
  }
  if (subView === ManageSpaceSubviews.Chatbot) {
    return <AllLoaders space={props.space} spaceInfoParams={spaceInfo} />;
  }

  if (subView === ManageSpaceSubviews.GenerateStoryBoard) {
    return <GenerateStoryBoard />;
  }

  return <SpaceDetails spaceId={props.space.id} />;
}
async function ManageSpace({ params }: { params: { spaceInfo: string[] } }) {
  const { spaceInfo } = params;
  const subView = spaceInfo?.[1];
  const subSubView = spaceInfo?.[2];
  const space = (await getSpaceServerSide())!;
  return (
    <SidebarLayout>
      <ul role="list" className="-mx-2 space-y-1">
        {getNavigation(space, subView, subSubView).map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={classNames(
                item.current ? 'bg-indigo-700 text-white' : 'text-indigo-200 hover:text-white hover:bg-indigo-700',
                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
              )}
            >
              <item.icon
                className={classNames(item.current ? 'text-white' : 'text-indigo-200 group-hover:text-white', 'h-6 w-6 shrink-0')}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <PageWrapper>
        <GetSubview spaceInfo={spaceInfo} space={space} />
      </PageWrapper>
    </SidebarLayout>
  );
}

export default ManageSpace;
