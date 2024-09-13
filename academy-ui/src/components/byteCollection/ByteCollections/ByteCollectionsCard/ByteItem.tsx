import ByteCompletionCheckmark from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCompletionCheckmark';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import PlayCircleIcon from '@heroicons/react/24/outline/PlayCircleIcon';
import styles from './ByteCollectionsCard.module.scss';
import Link from 'next/link';
import { ByteSummary } from '@/types/bytes/Byte';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';

interface ByteItemProps {
  viewByteBaseUrl: string;
  byte: ByteSummary;
  eventIdx: number;
  setWatchVideo: (value: boolean) => void;
  setSelectedVideo: (value: VideoModalProps) => void;
  threeDotItems: { label: string; key: string }[];
  itemLength: number;
  openByteEditModal: (byteId: string) => void;
  openItemDeleteModal: (itemId: string, itemType: ByteCollectionItemType | null) => void;
}

interface VideoModalProps {
  key: string;
  title: string;
  src: string;
}

export default function ByteItem(props: ByteItemProps) {
  const { viewByteBaseUrl, byte, eventIdx, setWatchVideo, setSelectedVideo, threeDotItems, openByteEditModal, openItemDeleteModal, itemLength } = props;
  const byteViewUrl = `${viewByteBaseUrl}/${byte.byteId}`;

  return (
    <li key={byte.byteId}>
      <div className="relative pb-8">
        {eventIdx !== itemLength - 1 ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
        <div className="relative flex space-x-3 justify-between">
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
              <PrivateEllipsisDropdown
                items={threeDotItems}
                // onSelect={() => openByteEditModal(byte.byteId)}
                onSelect={(key) => {
                  if (key === 'archive') {
                    openItemDeleteModal(byte.byteId, ByteCollectionItemType.Byte);
                  } else {
                    openByteEditModal(byte.byteId);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
