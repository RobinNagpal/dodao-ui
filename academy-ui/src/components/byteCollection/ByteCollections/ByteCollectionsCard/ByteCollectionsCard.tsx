'use client';

import ByteCollectionCardAdminDropdown from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionCardAdminDropdown';
import ByteCompletionCheckmark from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCompletionCheckmark';
import ByteCollectionCardAddItem from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionCardAddItem';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { ByteCollectionFragment, ShortVideoFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import Link from 'next/link';
import React from 'react';
import styles from './ByteCollectionsCard.module.scss';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import PlayCircleIcon from '@heroicons/react/24/outline/PlayCircleIcon';
import Bars3BottomLeftIcon from '@heroicons/react/24/solid/Bars3BottomLeftIcon';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { useRouter } from 'next/navigation';
import EditByteView from '@/components/bytes/Edit/EditByteView';
import EditClickableDemo from '@/components/clickableDemos/Create/EditClickableDemo';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';

interface ByteCollectionCardProps {
  byteCollection: ByteCollectionFragment;
  isEditingAllowed?: boolean;
  viewByteBaseUrl: string;
  space: SpaceWithIntegrationsFragment;
  isAdmin?: boolean | undefined;
}

interface VideoModalProps {
  key: string;
  title: string;
  src: string;
}

interface EditByteModalState {
  isVisible: boolean;
  byteId: string | null;
}

interface EditDemoModalState {
  isVisible: boolean;
  demoId: string | null;
}

interface EditShortModalState {
  isVisible: boolean;
  shortId: string | null;
}

export default function ByteCollectionsCard({ byteCollection, isEditingAllowed = true, viewByteBaseUrl, space, isAdmin }: ByteCollectionCardProps) {
  const [watchVideo, setWatchVideo] = React.useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = React.useState<VideoModalProps>();
  const [videoResponse, setVideoResponse] = React.useState<{ shortVideo?: ShortVideoFragment }>();
  const [showCreateModal, setShowCreateModal] = React.useState<boolean>(false);
  const [editByteModalState, setEditModalState] = React.useState<EditByteModalState>({ isVisible: false, byteId: null });
  const [editDemoModalState, setEditDemoModalState] = React.useState<EditDemoModalState>({ isVisible: false, demoId: null });
  const [editShortModalState, setEditShortModalState] = React.useState<EditShortModalState>({ isVisible: false, shortId: null });
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];

  const nonArchivedBytes = byteCollection.bytes.filter((byte) => !byte.archive);
  const nonArchivedDemos = byteCollection.demos.filter((demo) => !demo.archive);
  const nonArchivedShorts = byteCollection.shorts.filter((short) => !short.archive);

  async function fetchData(shortId: string) {
    const response = await axios.get(`${getBaseUrl()}/api/short-videos/${shortId}?spaceId=${space.id}`);
    setVideoResponse(response.data);
  }

  function openByteEditModal(byteId: string) {
    setEditModalState({ isVisible: true, byteId: byteId });
  }

  function openDemoEditModal(demoId: string) {
    setEditDemoModalState({ isVisible: true, demoId: demoId });
  }

  function openShortEditModal(shortId: string) {
    fetchData(shortId);
    setEditShortModalState({ isVisible: true, shortId: shortId });
  }

  function closeByteEditModal() {
    setEditModalState({ isVisible: false, byteId: null });
  }

  function closeDemoEditModal() {
    setEditDemoModalState({ isVisible: false, demoId: null });
  }

  function closeShortEditModal() {
    setEditShortModalState({ isVisible: false, shortId: null });
  }
  const router = useRouter();

  if (watchVideo) {
    return (
      <FullScreenModal key={selectedVideo?.key} title={selectedVideo?.title!} open={true} onClose={() => setWatchVideo(false)} fullWidth={false}>
        <div className="flex justify-around overflow-hidden">
          <div className="relative w-fit h-fit">
            <iframe className="xs:h-[94.7vh] s:h-[95vh] sm:h-[89.6vh] lg:h-[90.6vh] w-[100vw]" allow="autoplay" src={selectedVideo?.src}></iframe>
          </div>
        </div>
      </FullScreenModal>
    );
  }

  return (
    <div className={`border border-gray-200 rounded-xl overflow-hidden p-4 w-full ` + styles.cardDiv}>
      {isEditingAllowed && (
        <div className="w-full flex justify-end">
          <ByteCollectionCardAdminDropdown byteCollection={byteCollection} space={space} />
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
          {nonArchivedBytes.map((byte, eventIdx) => {
            const byteViewUrl = `${viewByteBaseUrl}/${byte.byteId}`;

            return (
              <li key={byte.byteId}>
                <div className="relative pb-8">
                  {eventIdx !== nonArchivedBytes.length - 1 ? (
                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <Link className="flex cursor-pointer" href={byteViewUrl}>
                      <ByteCompletionCheckmark byteId={byte.byteId} />
                      <div className="flex min-w-0 flex-1 justify-between space-x-2 duration-300 ease-in-out">
                        <div className="ml-3 text-sm group">
                          <div className="font-bold flex group-hover:underline">{`${byte.name}`}</div>
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
                    {byte.byteId && (
                      <div className="z-10">
                        <PrivateEllipsisDropdown items={threeDotItems} onSelect={() => openByteEditModal(byte.byteId)} />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}

          {nonArchivedDemos.map((demo, eventIdx) => {
            const demoViewUrl = `clickable-demos/view/${demo.demoId}`;
            return (
              <li key={demo.demoId}>
                <div className="relative pb-8">
                  {eventIdx !== nonArchivedDemos.length - 1 ? (
                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <Link className="flex cursor-pointer" href={demoViewUrl}>
                      <span className={'h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white ' + styles.tidbitIconSpan}>
                        <Bars3BottomLeftIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                      <div className="flex min-w-0 flex-1 justify-between space-x-2 duration-300 ease-in-out">
                        <div className="ml-3 text-sm group">
                          <div className="font-bold flex group-hover:underline">{`${demo.title}`}</div>
                          <div className="flex-wrap">{demo.excerpt}</div>
                        </div>
                      </div>
                    </Link>
                    {demo.demoId && (
                      <div className="z-10">
                        <PrivateEllipsisDropdown items={threeDotItems} onSelect={() => openDemoEditModal(demo.demoId)} />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}

          {nonArchivedShorts.map((short, eventIdx) => {
            const shortViewUrl = `shorts/view/${short.shortId}`;
            return (
              <li key={short.shortId}>
                <div className="relative pb-8">
                  {eventIdx !== nonArchivedShorts.length - 1 ? (
                    <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <Link className="flex cursor-pointer" href={shortViewUrl}>
                      <span className={'h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white ' + styles.tidbitIconSpan}>
                        <Bars3BottomLeftIcon className="h-5 w-5 text-white" aria-hidden="true" />
                      </span>
                      <div className="flex min-w-0 flex-1 justify-between space-x-2 duration-300 ease-in-out">
                        <div className="ml-3 text-sm group">
                          <div className="font-bold flex group-hover:underline">{`${short.title}`}</div>
                          <div className="flex-wrap">{short.description}</div>
                        </div>
                      </div>
                    </Link>
                    {short.shortId && (
                      <div className="z-10">
                        <PrivateEllipsisDropdown items={threeDotItems} onSelect={() => openShortEditModal(short.shortId)} />
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}

          {isAdmin && (
            <li>
              <Button
                className="rounded-lg text-color"
                variant="outlined"
                primary
                style={{
                  border: '2px dotted',
                  padding: '0.5rem',
                  marginBottom: '1.25rem',
                  letterSpacing: '0.05em',
                  borderRadius: '0.5rem',
                }}
                onClick={() => setShowCreateModal(true)}
              >
                + Add New Item
              </Button>
            </li>
          )}
        </ul>
      </div>
      <FullPageModal className={'w-1/2'} open={showCreateModal} onClose={() => setShowCreateModal(false)} title={'Create New Item'} showCloseButton={false}>
        <ByteCollectionCardAddItem space={space} hideModal={() => setShowCreateModal(false)} byteCollection={byteCollection} />
      </FullPageModal>

      {editByteModalState.isVisible && (
        <FullScreenModal open={true} onClose={closeByteEditModal} title={'Edit Byte'}>
          <div className="text-left">
            <EditByteView
              space={space}
              byteCollection={byteCollection}
              byteId={editByteModalState.byteId}
              onUpsert={async () => {
                router.push(`/tidbits/view/${editByteModalState.byteId}`);
              }}
            />
          </div>
        </FullScreenModal>
      )}

      {editDemoModalState.isVisible && (
        <FullScreenModal open={true} onClose={closeDemoEditModal} title={'Edit Clickable Demo'}>
          <div className="text-left">
            <EditClickableDemo demoId={editDemoModalState.demoId} byteCollection={byteCollection} />
          </div>
        </FullScreenModal>
      )}

      {editShortModalState.isVisible && (
        <FullScreenModal open={true} onClose={closeShortEditModal} title={'Edit Short Video'}>
          <div className="text-left">
            <PageWrapper>
              <EditShortVideoView
                space={space}
                byteCollection={byteCollection}
                shortVideoToEdit={videoResponse?.shortVideo}
                onAfterSave={() => {
                  router.push(`/shorts/view/${videoResponse?.shortVideo?.id}`);
                }}
                onCancel={() => {
                  router.push('/tidbit-collections');
                }}
              />
            </PageWrapper>
          </div>
        </FullScreenModal>
      )}
    </div>
  );
}
