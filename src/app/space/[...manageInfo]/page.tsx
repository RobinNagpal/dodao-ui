'use client';

import SidebarLayout from '@/app/SidebarLayout';
import PageWrapper from '@/components/core/page/PageWrapper';
import ListSpaces from '@/components/spaces/ListSpaces';
import { ManageSpaceSubviews } from '@/components/spaces/manageSpaceSubviews';
import SpaceDetails from '@/components/spaces/SpaceDetails';
import UpsertSpace from '@/components/spaces/UpsertSpace';
import classNames from '@/utils/classNames';
import { CalendarIcon, ChartPieIcon, CircleStackIcon, DocumentDuplicateIcon, FolderIcon, HomeIcon, UsersIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '#', icon: HomeIcon, current: true },
  { name: 'Team', href: '#', icon: UsersIcon, current: false },
  { name: 'Projects', href: '#', icon: FolderIcon, current: false },
  { name: 'Calendar', href: '#', icon: CalendarIcon, current: false },
  { name: 'Documents', href: '#', icon: DocumentDuplicateIcon, current: false },
  { name: 'Reports', href: '#', icon: ChartPieIcon, current: false },
  { name: 'Spaces', href: '/space/manage/' + ManageSpaceSubviews.SpacesList, icon: CircleStackIcon, current: false },
];

function GetSubview(props: { manageInfo: string[] }) {
  const { manageInfo } = props;

  console.log('manageInfo', manageInfo);

  // urls - /manage
  const isHome = manageInfo.length === 1 && manageInfo[0] === 'manage';

  const subView = manageInfo?.[1];

  const entityId = manageInfo?.[2];

  console.log('subView === ManageSpaceSubviews.SpaceDetails', subView === ManageSpaceSubviews.ViewSpace);

  if (subView === ManageSpaceSubviews.SpacesList) {
    return <ListSpaces />;
  }
  if (subView === ManageSpaceSubviews.ViewSpace) {
    return <SpaceDetails spaceId={entityId} />;
  }

  if (subView === ManageSpaceSubviews.EditSpace) {
    return <UpsertSpace spaceId={entityId} />;
  }

  return null;
}
function ManageSpace({ params }: { params: { manageInfo: string[] } }) {
  const { manageInfo } = params;

  return (
    <SidebarLayout>
      <ul role="list" className="-mx-2 space-y-1">
        {navigation.map((item) => (
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
        <GetSubview manageInfo={manageInfo} />
      </PageWrapper>
    </SidebarLayout>
  );
}

export default ManageSpace;
