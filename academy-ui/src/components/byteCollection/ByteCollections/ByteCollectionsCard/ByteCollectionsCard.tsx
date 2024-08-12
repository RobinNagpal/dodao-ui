'use client';

import ByteCollectionCardAdminDropdown from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionCardAdminDropdown';

import ByteCollectionCardAddItem from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionCardAddItem';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import { ShortVideoFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import React from 'react';
import styles from './ByteCollectionsCard.module.scss';
import Button from '@dodao/web-core/components/core/buttons/Button';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import PlayCircleIcon from '@heroicons/react/24/outline/PlayCircleIcon';
import { useRouter } from 'next/navigation';
import EditByteView from '@/components/bytes/Edit/EditByteView';
import EditClickableDemo from '@/components/clickableDemos/Create/EditClickableDemo';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import axios from 'axios';
import ByteItem from './ByteItem';
import DemoItem from './DemoItem';
import ShortItem from './ShortItem';

interface ByteCollectionCardProps {
  byteCollection: ByteCollectionSummary;
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

  const nonArchivedItems = byteCollection.items.filter((item) => {
    switch (item.type) {
      case ByteCollectionItemType.Byte:
        return !item.byte.archive;
      case ByteCollectionItemType.ClickableDemo:
        return !item.demo.archive;
      case ByteCollectionItemType.ShortVideo:
        return !item.short.archive;
    }
  });

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
          {nonArchivedItems.map((item, eventIdx) => {
            switch (item.type) {
              case ByteCollectionItemType.Byte:
                return (
                  <ByteItem
                    viewByteBaseUrl={viewByteBaseUrl}
                    byte={item.byte}
                    eventIdx={eventIdx}
                    setWatchVideo={setWatchVideo}
                    setSelectedVideo={setSelectedVideo}
                    threeDotItems={threeDotItems}
                    openByteEditModal={openByteEditModal}
                    itemLength={nonArchivedItems.length}
                    key={item.byte.byteId}
                  />
                );
              case ByteCollectionItemType.ClickableDemo:
                return (
                  <DemoItem
                    key={item.demo.demoId}
                    demo={item.demo}
                    eventIdx={eventIdx}
                    itemLength={nonArchivedItems.length}
                    threeDotItems={threeDotItems}
                    openDemoEditModal={openDemoEditModal}
                  />
                );
              case ByteCollectionItemType.ShortVideo:
                return (
                  <ShortItem
                    key={item.short.shortId}
                    short={item.short}
                    eventIdx={eventIdx}
                    threeDotItems={threeDotItems}
                    itemLength={nonArchivedItems.length}
                    openShortEditModal={openShortEditModal}
                  />
                );
              default:
                return null;
            }
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
