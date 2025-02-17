import ItemCompletionCheckmark from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ItemCompletionCheckmark';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import PrimaryColorBadge from '@dodao/web-core/components/core/badge/PrimaryColorBadge';
import PlayCircleIcon from '@heroicons/react/24/outline/PlayCircleIcon';
import styles from './ByteCollectionsCard.module.scss';
import Link from 'next/link';
import { ByteSummary } from '@/types/bytes/Byte';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';

interface ByteItemProps {
  space: SpaceWithIntegrationsDto;
  viewByteBaseUrl: string;
  byte: ByteSummary;
  eventIdx: number;
  setWatchVideo: (value: boolean) => void;
  setSelectedVideo: (value: VideoModalProps) => void;
  threeDotItems: { label: string; key: string }[];
  itemLength: number;
  openByteEditModal: (byteId: string) => void;
  openItemDeleteModal: (itemId: string, itemName: string, itemType: ByteCollectionItemType | null) => void;
  openItemUnarchiveModal: (itemId: string, itemName: string, itemType: ByteCollectionItemType | null) => void;
  openItemMoveModal: (itemId: string, itemName: string, itemType: ByteCollectionItemType | null) => void;
  showItemTypeBadge: boolean;
}

interface VideoModalProps {
  key: string;
  title: string;
  src: string;
}

export default function ByteItem(props: ByteItemProps) {
  const {
    viewByteBaseUrl,
    byte,
    eventIdx,
    setWatchVideo,
    setSelectedVideo,
    threeDotItems,
    openByteEditModal,
    openItemDeleteModal,
    openItemUnarchiveModal,
    openItemMoveModal,
    itemLength,
    showItemTypeBadge,
  } = props;
  const byteViewUrl = `${viewByteBaseUrl}/${byte.byteId}`;
  const modifiedThreeDotItems = JSON.parse(JSON.stringify(threeDotItems)); // Creating a deep copy so that it doesn't affect the original array
  if (byte.archive) {
    modifiedThreeDotItems.pop();
    modifiedThreeDotItems.push({ label: 'Unarchive', key: 'unarchive' });
  }

  return (
    <li key={byte.byteId}>
      <div className="relative pb-6">
        {eventIdx !== itemLength - 1 ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
        <div className="relative flex space-x-3 justify-between">
          <Link className="flex cursor-pointer" href={byteViewUrl}>
            <ItemCompletionCheckmark itemId={byte.byteId} itemType={ByteCollectionItemType.Byte} />
            <div className="flex min-w-0 flex-1 justify-between space-x-2 duration-300 ease-in-out">
              <div className="ml-3 text-sm group">
                <div className="flex">
                  <div className="font-bold hover:underline">{`${byte.name}`}</div>
                  {byte?.videoUrl && (
                    <PlayCircleIcon
                      className={`h-6 w-6 ml-6 -mt-1 ${styles.playVideoIcon} cursor-pointer`}
                      onClick={(e) => {
                        setWatchVideo(true);
                        setSelectedVideo({ key: byte.byteId, title: byte.name, src: byte.videoUrl! });
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                  )}
                </div>
                <div className="flex-wrap">{byte.content}</div>
              </div>
            </div>
          </Link>

          <div className="flex">
            {showItemTypeBadge && (
              <Link href={byteViewUrl}>
                <PrimaryColorBadge highlighted={true} className="cursor-pointer">
                  Tidbit
                </PrimaryColorBadge>
              </Link>
            )}
            {byte?.archive && (
              <PrimaryColorBadge onClick={() => openItemUnarchiveModal(byte.byteId, byte.name, ByteCollectionItemType.Byte)}>Archived</PrimaryColorBadge>
            )}
            {byte.byteId && !byte.byteId.startsWith('0001-demo-byte') && (
              <PrivateEllipsisDropdown
                space={props.space}
                items={modifiedThreeDotItems}
                onSelect={(key) => {
                  if (key === 'archive') {
                    openItemDeleteModal(byte.byteId, byte.name, ByteCollectionItemType.Byte);
                  } else if (key === 'unarchive') {
                    openItemUnarchiveModal(byte.byteId, byte.name, ByteCollectionItemType.Byte);
                  } else if (key === 'move') {
                    openItemMoveModal(byte.byteId, byte.name, ByteCollectionItemType.Byte);
                  } else {
                    openByteEditModal(byte.byteId);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
