'use client';

import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import AddNewItemButton from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/AddNewItemButton';
import ByteCollectionCardAdminDropdown from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionCardAdminDropdown';
import EditByteView from '@/components/bytes/Edit/EditByteView';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import { ShortVideoFragment, SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { DeleteByteItemRequest } from '@/types/request/ByteRequests';
import { TidbitCollectionTags } from '@/utils/api/fetchTags';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PlayCircleIcon from '@heroicons/react/24/outline/PlayCircleIcon';
import { useRouter } from 'next/navigation';
import React from 'react';
import styles from './ByteCollectionsCard.module.scss';
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

interface DeleteItemModalState {
  isVisible: boolean;
  itemId: string | null;
  itemType: ByteCollectionItemType | null;
  deleting: boolean;
}

interface EditShortModalState {
  isVisible: boolean;
  shortId: string | null;
}

export default function ByteCollectionsCard({ byteCollection, isEditingAllowed = true, viewByteBaseUrl, space, isAdmin }: ByteCollectionCardProps) {
  const [watchVideo, setWatchVideo] = React.useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = React.useState<VideoModalProps>();
  const [videoResponse, setVideoResponse] = React.useState<{ shortVideo?: ShortVideoFragment }>();
  const [editByteModalState, setEditModalState] = React.useState<EditByteModalState>({ isVisible: false, byteId: null });
  const [deleteItemModalState, setDeleteItemModalState] = React.useState<DeleteItemModalState>({
    isVisible: false,
    itemId: null,
    itemType: null,
    deleting: false,
  });

  const [editShortModalState, setEditShortModalState] = React.useState<EditShortModalState>({ isVisible: false, shortId: null });

  const { showNotification } = useNotificationContext();

  const threeDotItems = [
    { label: 'Edit', key: 'edit' },
    { label: 'Archive', key: 'archive' },
  ];

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
    const response = await fetch(`${getBaseUrl()}/api/short-videos/${shortId}?spaceId=${space.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        tags: [TidbitCollectionTags.GET_TIDBIT_COLLECTIONS.toString()],
      },
    });
    const data = await response.json();
    setVideoResponse(data);
  }

  function openByteEditModal(byteId: string) {
    setEditModalState({ isVisible: true, byteId: byteId });
  }

  function openItemDeleteModal(itemId: string, itemType: ByteCollectionItemType | null) {
    setDeleteItemModalState({ isVisible: true, itemId: itemId, itemType: itemType, deleting: false });
  }

  function openShortEditModal(shortId: string) {
    fetchData(shortId);
    setEditShortModalState({ isVisible: true, shortId: shortId });
  }

  function closeByteEditModal() {
    setEditModalState({ isVisible: false, byteId: null });
  }

  function closeItemDeleteModal() {
    setDeleteItemModalState({ isVisible: false, itemId: null, itemType: null, deleting: false });
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
    <div className={`border border-gray-200 rounded-xl overflow-hidden pl-4 pr-4 pt-4 pb-10 w-full ` + styles.cardDiv}>
      {isEditingAllowed && (
        <div className="w-full flex justify-end items-center flex-row gap-4">
          <AddNewItemButton isAdmin={!!isAdmin} space={space} byteCollection={byteCollection} />
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
                    openItemDeleteModal={openItemDeleteModal}
                    itemLength={nonArchivedItems.length}
                    key={item.byte.byteId}
                  />
                );
              case ByteCollectionItemType.ClickableDemo:
                return (
                  <DemoItem
                    byteCollection={byteCollection}
                    key={item.demo.demoId}
                    demo={item.demo}
                    eventIdx={eventIdx}
                    itemLength={nonArchivedItems.length}
                    threeDotItems={threeDotItems}
                    openItemDeleteModal={openItemDeleteModal}
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
                    openItemDeleteModal={openItemDeleteModal}
                  />
                );
              default:
                return null;
            }
          })}
        </ul>
      </div>

      {editByteModalState.isVisible && (
        <FullScreenModal open={true} onClose={closeByteEditModal} title={'Edit Byte'}>
          <div className="text-left">
            <EditByteView
              space={space}
              byteCollection={byteCollection}
              byteId={editByteModalState.byteId}
              onUpsert={async () => {
                router.push(`/tidbit-collections/view/${byteCollection.id}/${editByteModalState.byteId}`);
              }}
              closeEditByteModal={closeByteEditModal}
            />
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
                closeEditShortModal={closeShortEditModal}
              />
            </PageWrapper>
          </div>
        </FullScreenModal>
      )}

      {deleteItemModalState.isVisible && (
        <DeleteConfirmationModal
          title={`Delete ${
            deleteItemModalState.itemType === ByteCollectionItemType.Byte
              ? 'Byte'
              : deleteItemModalState.itemType === ByteCollectionItemType.ClickableDemo
              ? 'Clickable Demo'
              : deleteItemModalState.itemType === ByteCollectionItemType.ShortVideo
              ? 'Short Video'
              : 'Item'
          }`}
          open={deleteItemModalState.isVisible}
          onClose={closeItemDeleteModal}
          deleting={deleteItemModalState.deleting}
          onDelete={async () => {
            if (!deleteItemModalState.itemId || !deleteItemModalState.itemType) {
              showNotification({ message: 'Some Error occurred', type: 'error' });
              closeItemDeleteModal();
              return;
            }

            setDeleteItemModalState({
              ...deleteItemModalState,
              deleting: true,
            });

            const deleteRequest: DeleteByteItemRequest = {
              itemId: deleteItemModalState.itemId,
              itemType: deleteItemModalState.itemType,
            };
            const response = await fetch(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection.id}/byte-items`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(deleteRequest),
            });

            if (response.ok) {
              const result = await response.json();

              const message =
                deleteItemModalState.itemType === ByteCollectionItemType.Byte
                  ? 'Byte Archived Successfully'
                  : deleteItemModalState.itemType === ByteCollectionItemType.ClickableDemo
                  ? 'Clickable Demo Archived Successfully'
                  : deleteItemModalState.itemType === ByteCollectionItemType.ShortVideo
                  ? 'Short Video Archived Successfully'
                  : 'Item Archived Successfully';

              setDeleteItemModalState({
                ...deleteItemModalState,
                deleting: false,
              });

              closeItemDeleteModal();
              showNotification({ message, type: 'success' });
              const timestamp = new Date().getTime();
              router.push(`/?update=${timestamp}`);
            } else {
              setDeleteItemModalState({
                ...deleteItemModalState,
                deleting: false,
              });

              closeItemDeleteModal();

              return showNotification({ message: 'Failed to archive the item. Please try again.', type: 'error' });
            }
          }}
        />
      )}
    </div>
  );
}
