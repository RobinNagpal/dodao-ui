'use client';

import ByteCollectionCardAdminDropdown from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionCardAdminDropdown';
import ByteCompletionCheckmark from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCompletionCheckmark';
import { ByteCollectionFragment, ProjectByteCollectionFragment, ProjectFragment } from '@/graphql/generated/generated-types';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import Link from 'next/link';
import React from 'react';
import styles from './ByteCollectionsCard.module.scss';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import PlayCircleIcon from '@heroicons/react/24/outline/PlayCircleIcon';

interface ByteCollectionCardProps {
  byteCollection: ByteCollectionFragment | ProjectByteCollectionFragment;
  isEditingAllowed?: boolean;
  project?: ProjectFragment;
  byteCollectionType: 'byteCollection' | 'projectByteCollection';
  viewByteBaseUrl: string;
}

interface VideoModalProps {
  key: string;
  title: string;
  src: string;
}

export default function ByteCollectionsCard({
  byteCollection,
  isEditingAllowed = true,
  project,
  byteCollectionType,
  viewByteBaseUrl,
}: ByteCollectionCardProps) {
  const [watchVideo, setWatchVideo] = React.useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = React.useState<VideoModalProps>();

  if (watchVideo) {
    return (
      <FullScreenModal key={selectedVideo?.key} title={selectedVideo?.title!} open={true} onClose={() => setWatchVideo(false)} fullWidth={false}>
        <div className="flex justify-around">
          <div className="relative">
            <iframe width="100%" style={{ height: '90vh', width: '100vw' }} src={selectedVideo?.src}></iframe>
          </div>
        </div>
      </FullScreenModal>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden p-4 w-full max-w-xl ` + styles.cardDiv}>
      {isEditingAllowed && (
        <div className="w-full flex justify-end">
          <ByteCollectionCardAdminDropdown byteCollection={byteCollection} byteCollectionType={byteCollectionType} project={project} />
        </div>
      )}

      <div className="mt-3 ml-2 text-xl">
        <div className="flex space-x-3">
          <div className={styles.headingColor}>{byteCollection.name}</div>
          {byteCollection?.videoUrl && (
            <PlayCircleIcon
              className={`h-6 w-6 ml-2 ${styles.playVideoIcon} cursor-pointer mt-1`}
              onClick={() => {
                setWatchVideo(true);
                setSelectedVideo({ key: byteCollection.id, title: byteCollection.name, src: byteCollection.videoUrl! });
              }}
            />
          )}
        </div>
        <div className="my-3 text-sm">{byteCollection.description}</div>
      </div>
      <div className="flow-root p-2">
        <ul role="list" className="-mb-8">
          {byteCollection.bytes.map((byte, eventIdx) => {
            const byteViewUrl = `${viewByteBaseUrl}/${byte.byteId}`;

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
                            {`${byte.name}`} <ArrowTopRightOnSquareIcon className={`h-4 w-4 ml-2 ${styles.openInPopupIcon}`} />
                          </div>

                          <div className="flex-wrap">{byte.content}</div>
                        </div>
                      </div>
                    </Link>
                    {byte?.videoUrl && (
                      <PlayCircleIcon
                        className={`h-6 w-6 ml-2 ${styles.playVideoIcon} cursor-pointer`}
                        onClick={() => {
                          setWatchVideo(true);
                          setSelectedVideo({ key: byte.byteId, title: byte.name, src: byte.videoUrl! });
                        }}
                      />
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
