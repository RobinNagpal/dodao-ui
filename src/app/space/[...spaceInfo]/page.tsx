'use client';

import SidebarLayout from '@/app/SidebarLayout';
import WithSpace from '@/app/withSpace';
import PageWrapper from '@/components/core/page/PageWrapper';
import GenerateImage from '@/components/spaces/Image/GenerateImage';
import ListSpaces from '@/components/spaces/ListSpaces';
import AllLoaders from '@/components/spaces/Loaders/AllLoaders';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import SpaceDetails from '@/components/spaces/SpaceDetails';
import GenerateStoryBoard from '@/components/spaces/StoryBoard/GenerateStoryBoard';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import classNames from '@/utils/classNames';
import BuildingOffice2Icon from '@heroicons/react/24/outline/BuildingOffice2Icon';
import CircleStackIcon from '@heroicons/react/24/outline/CircleStackIcon';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
import PhotoIcon from '@heroicons/react/24/solid/PhotoIcon';
import Link from 'next/link';

const getNavigation = (space: SpaceWithIntegrationsFragment) => {
  const navigation = [
    { name: 'Dashboard', href: `/space/manage/${ManageSpaceSubviews.ViewSpace}/${space.id}`, icon: HomeIcon, current: true },
    { name: 'Image', href: `/space/manage/${ManageSpaceSubviews.GenerateImage}/${space.id}`, icon: PhotoIcon, current: false },
    { name: 'Story Board', href: `/space/manage/${ManageSpaceSubviews.GenerateStoryBoard}/${space.id}`, icon: PhotoIcon, current: false },
    { name: 'Loaders', href: '/space/manage/' + ManageSpaceSubviews.Loaders, icon: CircleStackIcon, current: false },
    { name: 'Spaces', href: '/space/manage/' + ManageSpaceSubviews.SpacesList, icon: BuildingOffice2Icon, current: false },
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
  if (subView === ManageSpaceSubviews.ViewSpace) {
    return <SpaceDetails spaceId={entityId} />;
  }
  if (subView === ManageSpaceSubviews.GenerateImage) {
    return <GenerateImage />;
  }
  if (subView === ManageSpaceSubviews.Loaders) {
    return <AllLoaders space={props.space} spaceInfoParams={spaceInfo} />;
  }

  if (subView === ManageSpaceSubviews.GenerateStoryBoard) {
    return <GenerateStoryBoard />;
  }

  return <SpaceDetails spaceId={props.space.id} />;
}
function ManageSpace({ params, space }: { params: { spaceInfo: string[] }; space: SpaceWithIntegrationsFragment }) {
  const { spaceInfo } = params;
  return (
    <SidebarLayout>
      <ul role="list" className="-mx-2 space-y-1">
        {getNavigation(space).map((item) => (
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
