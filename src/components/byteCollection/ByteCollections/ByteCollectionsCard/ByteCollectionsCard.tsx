'use client';

import ByteCollectionCardAdminDropdown from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionCardAdminDropdown';
import ByteCompletionCheckmark from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCompletionCheckmark';
import { ByteCollectionFragment, ProjectByteCollectionFragment, ProjectFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import Link from 'next/link';
import React from 'react';
import styles from './ByteCollectionsCard.module.scss';

interface ByteCollectionCardProps {
  isEditingAllowed?: boolean;
  project?: ProjectFragment;
  byteCollection: ByteCollectionFragment | ProjectByteCollectionFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
  space: SpaceWithIntegrationsFragment;
}

export default function ByteCollectionsCard({ byteCollection, isEditingAllowed = true, project, byteCollectionType, space }: ByteCollectionCardProps) {
  return (
    <>
      <div className={`border border-gray-200 rounded-xl overflow-hidden p-4 w-full max-w-xl ` + styles.cardDiv}>
        {isEditingAllowed && (
          <div className="w-full flex justify-end">
            <ByteCollectionCardAdminDropdown byteCollection={byteCollection} byteCollectionType={'byteCollection'} project={project} />
          </div>
        )}

        <div className="mt-3 ml-2 text-xl">
          <div className={styles.headingColor}>{byteCollection.name}</div>
          <div className="my-3 text-sm">{byteCollection.description}</div>
        </div>
        <div className="flow-root p-2">
          <ul role="list" className="-mb-8">
            {byteCollection.bytes.map((byte, eventIdx) => {
              const byteViewUrl =
                byteCollectionType === 'byteCollection'
                  ? `/tidbit-collections/view/${byteCollection.id}/${byte.byteId}`
                  : `/projects/view/${project?.id}/tidbit-collections/view/${byteCollection.id}/${byte.byteId}`;
              return (
                <li key={byte.byteId}>
                  <div className="relative pb-8">
                    {eventIdx !== byteCollection.bytes.length - 1 ? (
                      <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <Link className="flex cursor-pointer" href={byteViewUrl}>
                        <ByteCompletionCheckmark byteId={byte.byteId} />
                        <div className="flex min-w-0 flex-1 justify-between space-x-2 transform hover:scale-95 transition duration-300 ease-in-out">
                          <div className="ml-3 text-sm">
                            <div className="font-bold flex">
                              {`${byte.name}`} <ArrowTopRightOnSquareIcon className={'h-4 w-4 ml-2 ' + styles.openInPopupIcon} />
                            </div>

                            <div className="flex-wrap">{byte.content}</div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
