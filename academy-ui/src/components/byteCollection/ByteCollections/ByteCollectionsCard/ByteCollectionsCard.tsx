'use client';

import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import AddNewItemButton from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/AddNewItemButton';
import ByteCollectionCardAdminDropdown from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionCardAdminDropdown';
import EditByteView from '@/components/bytes/Edit/EditByteView';
import EditShortVideoView from '@/components/shortVideos/Edit/EditShortVideoView';
import { ShortVideoFragment } from '@/graphql/generated/generated-types';
import { ByteCollectionSummary, ByteCollectionDto } from '@/types/byteCollections/byteCollection';
import { PutByteItemRequest } from '@/types/request/ByteRequests';
import { SpaceTypes, SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import { TidbitCollectionTags } from '@/utils/api/fetchTags';
import DeleteConfirmationModal from '@dodao/web-core/components/app/Modal/DeleteConfirmationModal';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import MoveItemModal from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/MoveItemModal';
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import PlayCircleIcon from '@heroicons/react/24/outline/PlayCircleIcon';
import { useUpdateData } from '@dodao/web-core/ui/hooks/fetch/useUpdateData';
import UnarchiveConfirmationModal from '@dodao/web-core/components/app/Modal/UnarchiveConfirmationModal';
import { useRouter } from 'next/navigation';
import React from 'react';
import styles from './ByteCollectionsCard.module.scss';
import ByteItem from './ByteItem';
import DemoItem from './DemoItem';
import ShortItem from './ShortItem';
import { CreateByteCollectionRequest, MoveByteCollectionItemRequest } from '@/types/request/ByteCollectionRequests';
import { useFetchUtils } from '@dodao/web-core/ui/hooks/useFetchUtils';

interface ByteCollectionCardProps {
  byteCollection: ByteCollectionSummary;
  isEditingAllowed?: boolean;
  viewByteBaseUrl: string;
  space: SpaceWithIntegrationsDto;
  isAdmin?: boolean | undefined;
  showArchived?: boolean;
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
  itemName: string | null;
  itemType: ByteCollectionItemType | null;
  deleting: boolean;
}

interface UnarchiveItemModalState {
  isVisible: boolean;
  itemId: string | null;
  itemName: string | null;
  itemType: ByteCollectionItemType | null;
  unarchiving: boolean;
}

interface MoveItemModalState {
  isVisible: boolean;
  itemId: string | null;
  itemName: string | null;
  itemType: ByteCollectionItemType | null;
  byteCollectionId: string | null;
  moving: boolean;
}

interface EditShortModalState {
  isVisible: boolean;
  shortId: string | null;
}

export default function ByteCollectionsCard({
  byteCollection,
  isEditingAllowed = true,
  viewByteBaseUrl,
  space,
  isAdmin,
  showArchived,
}: ByteCollectionCardProps) {
  const [watchVideo, setWatchVideo] = React.useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = React.useState<VideoModalProps>();
  const [videoResponse, setVideoResponse] = React.useState<{ shortVideo?: ShortVideoFragment }>();
  const [editByteModalState, setEditModalState] = React.useState<EditByteModalState>({ isVisible: false, byteId: null });
  const [deleteItemModalState, setDeleteItemModalState] = React.useState<DeleteItemModalState>({
    isVisible: false,
    itemId: null,
    itemName: null,
    itemType: null,
    deleting: false,
  });
  const [unarchiveItemModalState, setUnarchiveItemModalState] = React.useState<UnarchiveItemModalState>({
    isVisible: false,
    itemId: null,
    itemType: null,
    itemName: null,
    unarchiving: false,
  });
  const [moveItemModalState, setMoveItemModalState] = React.useState<MoveItemModalState>({
    isVisible: false,
    itemId: null,
    itemName: null,
    itemType: null,
    byteCollectionId: null,
    moving: false,
  });
  const [showUnarchiveModal, setShowUnarchiveModal] = React.useState<boolean>(false);

  const [editShortModalState, setEditShortModalState] = React.useState<EditShortModalState>({ isVisible: false, shortId: null });

  const { showNotification } = useNotificationContext();

  const redirectPath = space.type === SpaceTypes.AcademySite ? '/byteCollections' : '/';

  const { updateData: archiveItem, loading: archiveItemLoading } = useUpdateData<ByteCollectionDto, PutByteItemRequest>(
    {},
    {
      successMessage: 'Item Archived Successfully',
      errorMessage: 'Failed to archive the item. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const { updateData: unArchiveItem, loading: unArchiveItemLoading } = useUpdateData<ByteCollectionDto, PutByteItemRequest>(
    {},
    {
      successMessage: 'Item Unachived Successfully',
      errorMessage: 'Failed to unarchive the item. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const { updateData: unArchiveByteCollection, loading: unArchiveByteCollectionLoading } = useUpdateData<ByteCollectionDto, CreateByteCollectionRequest>(
    {},
    {
      successMessage: 'Tidbit Collection Unarchived Successfully',
      errorMessage: 'Failed to archive the Tidbit Collection. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const { updateData: moveByteCollectionItem, loading: moveByteCollectionItemLoading } = useUpdateData<ByteCollectionDto, MoveByteCollectionItemRequest>(
    {},
    {
      successMessage: 'Item moved Successfully',
      errorMessage: 'Failed to move the item. Please try again.',
      redirectPath: `${redirectPath}?updated=${Date.now()}`,
    },
    'PUT'
  );

  const onUnarchive = async () => {
    await unArchiveByteCollection(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection?.id}`, {
      name: byteCollection.name,
      description: byteCollection.description,
      order: byteCollection.order,
      videoUrl: byteCollection.videoUrl,
      archive: false,
    });
  };

  const threeDotItems = [
    { label: 'Edit', key: 'edit' },
    { label: 'Move', key: 'move' },
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

  const byteCollectionItems = showArchived ? byteCollection.items : nonArchivedItems;

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

  function openItemDeleteModal(itemId: string, itemName: string, itemType: ByteCollectionItemType | null) {
    setDeleteItemModalState({ isVisible: true, itemId: itemId, itemName: itemName, itemType: itemType, deleting: false });
  }

  function openItemUnarchiveModal(itemId: string, itemName: string, itemType: ByteCollectionItemType | null) {
    setUnarchiveItemModalState({ isVisible: true, itemId: itemId, itemName, itemType: itemType, unarchiving: false });
  }

  function openItemMoveModal(itemId: string, itemName: string, itemType: ByteCollectionItemType | null) {
    setMoveItemModalState({ isVisible: true, itemId: itemId, itemName: itemName, itemType: itemType, byteCollectionId: byteCollection.id, moving: false });
  }

  function openShortEditModal(shortId: string) {
    fetchData(shortId);
    setEditShortModalState({ isVisible: true, shortId: shortId });
  }

  function closeByteEditModal() {
    setEditModalState({ isVisible: false, byteId: null });
  }

  function closeItemDeleteModal() {
    setDeleteItemModalState({ isVisible: false, itemId: null, itemName: null, itemType: null, deleting: false });
  }

  function closeItemUnarchiveModal() {
    setUnarchiveItemModalState({ isVisible: false, itemId: null, itemName: null, itemType: null, unarchiving: false });
  }

  function closeItemMoveModal() {
    setMoveItemModalState({ isVisible: false, itemId: null, itemName: null, itemType: null, byteCollectionId: null, moving: false });
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
    <div className={`border border-color rounded-xl overflow-hidden pl-4 pr-4 pt-4 pb-10 w-full ` + styles.cardDiv}>
      {isEditingAllowed && !byteCollection.id.startsWith('0001-onboarding') && (
        <div className="w-full flex justify-end items-center flex-row gap-4">
          <AddNewItemButton isAdmin={!!isAdmin} space={space} byteCollection={byteCollection} />
          <ByteCollectionCardAdminDropdown byteCollection={byteCollection} space={space} archive={byteCollection.archive!} />
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
          {byteCollection.archive && (
            <span
              className={`inline-flex items-center rounded-xl px-2 py-1 text-xs font-medium max-h-6 ${styles.archiveBadge}`}
              onClick={() => setShowUnarchiveModal(true)}
            >
              Archived
            </span>
          )}
        </div>
        <div className="my-3 text-sm">{byteCollection.description}</div>
      </div>
      <div className="flow-root p-2">
        <ul role="list" className="-mb-8">
          {byteCollectionItems.map((item, eventIdx) => {
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
                    openItemUnarchiveModal={openItemUnarchiveModal}
                    openItemMoveModal={openItemMoveModal}
                    itemLength={byteCollectionItems.length}
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
                    itemLength={byteCollectionItems.length}
                    threeDotItems={threeDotItems}
                    openItemDeleteModal={openItemDeleteModal}
                    openItemUnarchiveModal={openItemUnarchiveModal}
                    openItemMoveModal={openItemMoveModal}
                  />
                );
              case ByteCollectionItemType.ShortVideo:
                return (
                  <ShortItem
                    key={item.short.shortId}
                    short={item.short}
                    eventIdx={eventIdx}
                    threeDotItems={threeDotItems}
                    itemLength={byteCollectionItems.length}
                    openShortEditModal={openShortEditModal}
                    openItemDeleteModal={openItemDeleteModal}
                    openItemUnarchiveModal={openItemUnarchiveModal}
                    openItemMoveModal={openItemMoveModal}
                  />
                );
              default:
                return null;
            }
          })}
        </ul>
      </div>

      {editByteModalState.isVisible && (
        <FullScreenModal open={true} onClose={closeByteEditModal} title={'Edit Tidbit'}>
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
          </div>
        </FullScreenModal>
      )}

      {deleteItemModalState.isVisible && (
        <DeleteConfirmationModal
          title={`Archive ${
            deleteItemModalState.itemType === ByteCollectionItemType.Byte
              ? `Tidbit - ${deleteItemModalState.itemName}`
              : deleteItemModalState.itemType === ByteCollectionItemType.ClickableDemo
              ? `Clickable Demo - ${deleteItemModalState.itemName}`
              : deleteItemModalState.itemType === ByteCollectionItemType.ShortVideo
              ? `Short Video - ${deleteItemModalState.itemName}`
              : 'Item'
          }`}
          deleteButtonText={`Archive ${
            deleteItemModalState.itemType === ByteCollectionItemType.Byte
              ? `Tidbit`
              : deleteItemModalState.itemType === ByteCollectionItemType.ClickableDemo
              ? `Clickable Demo`
              : deleteItemModalState.itemType === ByteCollectionItemType.ShortVideo
              ? `Short Video`
              : 'Item'
          }`}
          open={deleteItemModalState.isVisible}
          onClose={closeItemDeleteModal}
          deleting={archiveItemLoading}
          onDelete={async () => {
            if (!deleteItemModalState.itemId || !deleteItemModalState.itemType) {
              showNotification({ message: 'Some Error occurred', type: 'error' });
              closeItemDeleteModal();
              return;
            }
            await archiveItem(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection?.id}/byte-items`, {
              itemId: deleteItemModalState.itemId,
              itemType: deleteItemModalState.itemType,
              archive: true,
            });
            closeItemDeleteModal();
          }}
        />
      )}

      {unarchiveItemModalState.isVisible && (
        <UnarchiveConfirmationModal
          title={`Unarchive ${
            unarchiveItemModalState.itemType === ByteCollectionItemType.Byte
              ? `Tidbit - ${unarchiveItemModalState.itemName}`
              : unarchiveItemModalState.itemType === ByteCollectionItemType.ClickableDemo
              ? `Clickable Demo - ${unarchiveItemModalState.itemName}`
              : unarchiveItemModalState.itemType === ByteCollectionItemType.ShortVideo
              ? `Short Video - ${unarchiveItemModalState.itemName}`
              : 'Item'
          }`}
          unarchiveButtonText={`Unarchive ${
            unarchiveItemModalState.itemType === ByteCollectionItemType.Byte
              ? `Tidbit`
              : unarchiveItemModalState.itemType === ByteCollectionItemType.ClickableDemo
              ? `Clickable Demo`
              : unarchiveItemModalState.itemType === ByteCollectionItemType.ShortVideo
              ? `Short Video`
              : 'Item'
          }`}
          open={unarchiveItemModalState.isVisible}
          onClose={closeItemUnarchiveModal}
          unarchiving={unArchiveItemLoading}
          onUnarchive={async () => {
            if (!unarchiveItemModalState.itemId || !unarchiveItemModalState.itemType) {
              showNotification({ message: 'Some Error occurred', type: 'error' });
              closeItemUnarchiveModal();
              return;
            }

            await unArchiveItem(`${getBaseUrl()}/api/${space.id}/byte-collections/${byteCollection?.id}/byte-items`, {
              itemId: unarchiveItemModalState.itemId,
              itemType: unarchiveItemModalState.itemType,
              archive: false,
            });
            closeItemUnarchiveModal();
          }}
        />
      )}

      {showUnarchiveModal && (
        <UnarchiveConfirmationModal
          title={`Unarchive Tidbit Collection - ${byteCollection.name}`}
          open={showUnarchiveModal}
          onClose={() => setShowUnarchiveModal(false)}
          onUnarchive={async () => {
            await onUnarchive();
            setShowUnarchiveModal(false);
          }}
          unarchiving={unArchiveByteCollectionLoading}
          unarchiveButtonText={'Unarchive Tidbit Collection'}
        />
      )}

      {moveItemModalState.isVisible && (
        <MoveItemModal
          showSelectByteCollectionModal={moveItemModalState.isVisible}
          onClose={closeItemMoveModal}
          selectByteCollection={async (selectedByteCollection: ByteCollectionSummary) => {
            await moveByteCollectionItem(`${getBaseUrl()}/api/${space.id}/actions/byte-collections/move-item`, {
              itemId: moveItemModalState.itemId!,
              itemType: moveItemModalState.itemType!,
              sourceByteCollectionId: moveItemModalState.byteCollectionId!,
              targetByteCollectionId: selectedByteCollection.id,
            });
          }}
          byteCollectionId={byteCollection.id}
          spaceId={space.id}
        />
      )}
    </div>
  );
}
