'use client';

import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import PrivateComponent from '@/components/core/PrivateComponent';
import CreateProjectContentModalContents from '@/components/projects/Nav/CreateProjectContentModalContents';
import { ProjectFragment, Space } from '@/graphql/generated/generated-types';
import React from 'react';
import TabLink from './TabLink';
import { isAdmin } from '@/utils/auth/isAdmin';
import { useSession } from 'next-auth/react';
import { Session } from '@/types/auth/Session';

export function ViewProjectHeader({ project, selectedViewType, space }: { project: ProjectFragment; selectedViewType: string; space?: Space }) {
  const [showCreateContentsModal, setShowCreateContentsModal] = React.useState(false);
  const { data: session } = useSession();
  const isUserAdmin = space && session && isAdmin(session as Session, space);
  var tabs = [
    { name: 'Tidbits', href: `/projects/view/${project.id}/tidbits`, current: selectedViewType === 'tidbits' },
    { name: 'Tidbits Collections', href: `/projects/view/${project.id}/tidbit-collections`, current: selectedViewType === 'tidbit-collections' },
    { name: 'Shorts', href: `/projects/view/${project.id}/shorts`, current: selectedViewType === 'shorts' },
  ];

  if (!isUserAdmin) {
    tabs = tabs.filter((tab) => tab.name !== 'Tidbits');
  }

  return (
    <div>
      <div className="relative border-b border-gray-200 pb-5 sm:pb-0 flex justify-between">
        <div className="md:flex md:items-center md:justify-between">
          <h3 className="text-base font-semibold leading-6">{project.name}</h3>
        </div>
        <div className="flex">
          <div>
            <div className="sm:hidden">
              <label htmlFor="current-tab" className="sr-only">
                Select a tab
              </label>
              <select
                id="current-tab"
                name="current-tab"
                className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                defaultValue={tabs.find((tab) => tab.current)?.name}
              >
                {tabs.map((tab) => (
                  <option key={tab.name}>{tab.name}</option>
                ))}
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <TabLink key={tab.name} tab={tab} />
                ))}
              </nav>
            </div>
          </div>
          <PrivateComponent>
            <div className="ml-6 hidden lg:block -mt-2">
              <Button variant="contained" primary className="mr-2" onClick={() => setShowCreateContentsModal(true)}>
                New +
              </Button>
            </div>
          </PrivateComponent>
        </div>
      </div>
      {showCreateContentsModal && (
        <FullScreenModal
          open={showCreateContentsModal}
          onClose={() => setShowCreateContentsModal(false)}
          title={'Create Project Contents'}
          showCloseButton={false}
        >
          <CreateProjectContentModalContents projectId={project.id} hideModal={() => setShowCreateContentsModal(false)} />
        </FullScreenModal>
      )}
    </div>
  );
}
