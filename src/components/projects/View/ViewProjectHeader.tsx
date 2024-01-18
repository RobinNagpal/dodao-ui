'use client';

import Button from '@/components/core/buttons/Button';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import PrivateComponent from '@/components/core/PrivateComponent';
import CreateProjectContentModalContents from '@/components/projects/Nav/CreateProjectContentModalContents';
import { ProjectFragment } from '@/graphql/generated/generated-types';
import classNames from '@/utils/classNames';
import Link from 'next/link';
import React from 'react';
import styles from './ViewProjectHeader.module.scss';

export function ViewProjectHeader({ project, selectedViewType }: { project: ProjectFragment; selectedViewType: string }) {
  const [showCreateContentsModal, setShowCreateContentsModal] = React.useState(false);

  const tabs = [
    { name: 'Tidbits', href: `/projects/view/${project.id}/tidbits`, current: selectedViewType === 'tidbits' },
    { name: 'Tidbits Collections', href: `/projects/view/${project.id}/tidbit-collections`, current: selectedViewType === 'tidbit-collections' },
    { name: 'Shorts', href: `/projects/view/${project.id}/shorts`, current: selectedViewType === 'shorts' },
  ];
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
                {tabs.map((tab) =>
                  tab.name === 'Tidbits' ? (
                    <PrivateComponent key={tab.name}>
                      <option key={tab.name}>{tab.name}</option>
                    </PrivateComponent>
                  ) : (
                    <option key={tab.name}>{tab.name}</option>
                  )
                )}
              </select>
            </div>
            <div className="hidden sm:block">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) =>
                  tab.name === 'Tidbits' ? (
                    <PrivateComponent key={tab.name}>
                      <Link
                        key={tab.name}
                        href={tab.href}
                        className={classNames(
                          tab.current ? styles.selectedHeaderTab : 'border-transparent text hover:border-gray-300 ',
                          'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium'
                        )}
                        aria-current={tab.current ? 'page' : undefined}
                      >
                        {tab.name}
                      </Link>
                    </PrivateComponent>
                  ) : (
                    <Link
                      key={tab.name}
                      href={tab.href}
                      className={classNames(
                        tab.current ? styles.selectedHeaderTab : 'border-transparent text hover:border-gray-300 ',
                        'whitespace-nowrap border-b-2 px-1 pb-4 text-sm font-medium'
                      )}
                      aria-current={tab.current ? 'page' : undefined}
                    >
                      {tab.name}
                    </Link>
                  )
                )}
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
