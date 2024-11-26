import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ShortVideo } from '@/types/shortVideos/shortVideo';
import PrimaryColorBadge from '@dodao/web-core/components/core/badge/PrimaryColorBadge';
import React from 'react';
import styles from './ByteCollectionsCard.module.scss';
import Link from 'next/link';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import ItemCompletionCheckmark from './ItemCompletionCheckmark';

interface ShortItemProps {
  short: ShortVideo;
  eventIdx: number;
  threeDotItems: { label: string; key: string }[];
  itemLength: number;
  openShortEditModal: (shortId: string) => void;
  openItemDeleteModal: (itemId: string, itemName: string, itemType: ByteCollectionItemType | null) => void;
  openItemUnarchiveModal: (itemId: string, itemName: string, itemType: ByteCollectionItemType | null) => void;
  openItemMoveModal: (itemId: string, itemName: string, itemType: ByteCollectionItemType | null) => void;
  showItemTypeBadge: boolean;
}

export default function ShortItem(props: ShortItemProps) {
  const { short, eventIdx, threeDotItems, openShortEditModal, openItemDeleteModal, openItemUnarchiveModal, openItemMoveModal, itemLength, showItemTypeBadge } =
    props;
  const shortViewUrl = `shorts/view/${short.shortId}`;
  const modifiedThreeDotItems = JSON.parse(JSON.stringify(threeDotItems)); // Creating a deep copy so that it doesn't affect the original array
  if (short.archive) {
    modifiedThreeDotItems.pop();
    modifiedThreeDotItems.push({ label: 'Unarchive', key: 'unarchive' });
  }
  return (
    <li key={short.shortId}>
      <div className="relative pb-6">
        {eventIdx !== itemLength - 1 ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
        <div className="relative flex space-x-3 justify-between">
          <Link className="flex cursor-pointer" href={shortViewUrl}>
            <ItemCompletionCheckmark itemId={short.shortId} itemType={ByteCollectionItemType.ShortVideo} />
            <div className="flex min-w-0 flex-1 justify-between space-x-2 duration-300 ease-in-out">
              <div className="ml-3 text-sm group">
                <div className="font-bold flex group-hover:underline">{`${short.title}`}</div>
                <div className="flex-wrap">{short.description}</div>
              </div>
            </div>
          </Link>
          <div className="flex">
            {showItemTypeBadge && <PrimaryColorBadge>Short Video</PrimaryColorBadge>}
            {short.archive && (
              <PrimaryColorBadge onClick={() => openItemUnarchiveModal(short.shortId, short.title, ByteCollectionItemType.ShortVideo)}>
                Archived
              </PrimaryColorBadge>
            )}
            {short.shortId && (
              <div className="z-15">
                <PrivateEllipsisDropdown
                  items={modifiedThreeDotItems}
                  onSelect={(key) => {
                    if (key === 'archive') {
                      openItemDeleteModal(short.shortId, short.title, ByteCollectionItemType.ShortVideo);
                    } else if (key === 'unarhive') {
                      openItemUnarchiveModal(short.shortId, short.title, ByteCollectionItemType.ShortVideo);
                    } else if (key === 'move') {
                      openItemMoveModal(short.shortId, short.title, ByteCollectionItemType.ShortVideo);
                    } else {
                      openShortEditModal(short.shortId);
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
