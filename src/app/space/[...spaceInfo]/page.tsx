'use client';

import SidebarLayout from '@/app/SidebarLayout';
import WithSpace from '@/app/withSpace';
import PageWrapper from '@/components/core/page/PageWrapper';
import ListProjects from '@/components/projects/ListProjects';
import GenerateImage from '@/components/spaces/Image/GenerateImage';
import ListSpaces from '@/components/spaces/ListSpaces';
import AllLoaders from '@/components/spaces/Loaders/AllLoaders';
import { ChatbotSubView, ChatbotView, getBaseUrlForSpaceSubview, ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import SpaceDetails from '@/components/spaces/SpaceDetails';
import GenerateStoryBoard from '@/components/spaces/StoryBoard/GenerateStoryBoard';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import classNames from '@/utils/classNames';
import BuildingOffice2Icon from '@heroicons/react/24/outline/BuildingOffice2Icon';
import CircleStackIcon from '@heroicons/react/24/outline/CircleStackIcon';
import GlobeAltIcon from '@heroicons/react/24/outline/GlobeAltIcon';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import ArrowUturnLeftIcon from '@heroicons/react/24/solid/ArrowUturnLeftIcon';
import ChatBubbleLeftIcon from '@heroicons/react/24/solid/ChatBubbleLeftIcon';
import TableCellsIcon from '@heroicons/react/24/solid/TableCellsIcon';
import CodeBracketIcon from '@heroicons/react/24/solid/CodeBracketIcon';
import ComputerDesktopIcon from '@heroicons/react/24/solid/ComputerDesktopIcon';
import QuestionMarkCircleIcon from '@heroicons/react/24/solid/QuestionMarkCircleIcon';
import AdjustmentsHorizontalIcon from '@heroicons/react/24/solid/AdjustmentsHorizontalIcon';
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
    { name: 'Projects', href: '/space/manage/' + ManageSpaceSubviews.ProjectList, icon: GlobeAltIcon, current: subView === ManageSpaceSubviews.ProjectList },
  ];

  return navigation;
};
function GetSubview(props: { spaceInfo: string[]; space: SpaceWithIntegrationsFragment }) {
  const { spaceInfo } = props;

  console.log('manageInfo', spaceInfo);

  // urls - /manage
  const isHome = spaceInfo.length === 1 && spaceInfo[0] === 'manage';

  const subView = spaceInfo?.[1];

  const entityId = spaceInfo?.[2];

  console.log('subView === ManageSpaceSubviews.SpaceDetails', subView === ManageSpaceSubviews.ViewSpace);

  if (subView === ManageSpaceSubviews.SpacesList) {
    return <ListSpaces />;
  }

  if (subView === ManageSpaceSubviews.ProjectList) {
    return <ListProjects space={props.space} />;
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
function ManageSpace({ params, space }: { params: { spaceInfo: string[] }; space: SpaceWithIntegrationsFragment }) {
  const { spaceInfo } = params;
  const subView = spaceInfo?.[1];
  const subSubView = spaceInfo?.[2];
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

export default WithSpace(ManageSpace);
