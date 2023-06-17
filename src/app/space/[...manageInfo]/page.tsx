'use client';

import SidebarLayout from '@/app/SidebarLayout';
import withSpace from '@/app/withSpace';
import PageWrapper from '@/components/core/page/PageWrapper';
import ListSpaces from '@/components/spaces/ListSpaces';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import SpaceDetails from '@/components/spaces/SpaceDetails';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import classNames from '@/utils/classNames';
import { CalendarIcon, ChartPieIcon, DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon, CircleStackIcon } from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
  { name: 'Team', href: '#', icon: UsersIcon, current: false },
  { name: 'Projects', href: '#', icon: FolderIcon, current: false },
  { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
  { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
  { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
  { name: 'Spaces', href: '/space/manage/' + ManageSpaceSubviews.Spaces, icon: CircleStackIcon, current: false },
];

function GetSubview(props: { manageInfo: string[] }) {
  const { manageInfo } = props;

  console.log('manageInfo', manageInfo);

  // urls - /manage
  const isHome = manageInfo.length === 1 && manageInfo[0] === 'manage';

  const subView = manageInfo?.[1];

  const entityId = manageInfo?.[2];

  console.log('subView === ManageSpaceSubviews.SpaceDetails', subView === ManageSpaceSubviews.SpaceDetails);

  if (subView === ManageSpaceSubviews.Spaces) {
    return <ListSpaces />;
  }
  if (subView === ManageSpaceSubviews.SpaceDetails) {
    return <SpaceDetails spaceId={entityId} />;
  }

  return null;
}
function ManageSpace({ params, space }: { params: { manageInfo: string[] }; space: SpaceWithIntegrationsFragment }) {
  const { manageInfo } = params;

  return (
    <SidebarLayout>
      <ul role="list" className="-mx-2 space-y-1">
        {navigation.map((item) => (
          <li key={item.name}>
            <a
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
            </a>
          </li>
        ))}
      </ul>
      <PageWrapper>
        <GetSubview manageInfo={manageInfo} />
      </PageWrapper>
    </SidebarLayout>
  );
}

export default withSpace(ManageSpace);
