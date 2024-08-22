import ByteCompletionCheckmark from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCompletionCheckmark';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/outline/ArrowTopRightOnSquareIcon';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import SingleSectionModal from '@dodao/web-core/components/core/modals/SingleSectionModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import PlayCircleIcon from '@heroicons/react/24/outline/PlayCircleIcon';
import styles from './ByteCollectionsCard.module.scss';
import Link from 'next/link';
import { ByteSummary } from '@/types/bytes/Byte';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import MoveByteStyles from './ByteItem.module.scss';

interface ByteItemProps {
  viewByteBaseUrl: string;
  byte: ByteSummary;
  currentByteCollectionId: string;
  byteCollections: ByteCollectionSummary[] | undefined;
  spaceId: string;
  eventIdx: number;
  setWatchVideo: (value: boolean) => void;
  setSelectedVideo: (value: VideoModalProps) => void;
  threeDotItems: { label: string; key: string }[];
  itemLength: number;
  openByteEditModal: (byteId: string) => void;
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
    byteCollections,
    spaceId,
    currentByteCollectionId,
    eventIdx,
    setWatchVideo,
    setSelectedVideo,
    threeDotItems,
    openByteEditModal,
    itemLength,
  } = props;
  const byteViewUrl = `${viewByteBaseUrl}/${byte.byteId}`;
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const router = useRouter();
  const allOtherCollections = byteCollections?.filter((collection) => collection.id != currentByteCollectionId);

  const handleCollectionSelect = async (selectedByteCollectionId: string, byteId: string, spaceId: string, currentByteCollectionId: string) => {
    const url = '/api/actions/bytes/move';
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedByteCollectionId: selectedByteCollectionId,
          byteId: byteId,
          spaceId: spaceId,
          currentByteCollectionId: currentByteCollectionId,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setShowSelectionModal(false);
        router.refresh();
      } else {
        throw new Error(data.message || 'Failed to move byte');
      }
    } catch (error) {
      console.error('Error moving byte:', error);
    }
  };

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
            <div className="z-100000">
              <PrivateEllipsisDropdown
                items={threeDotItems}
                onSelect={async (key) => {
                  if (key === 'edit') {
                    openByteEditModal(byte.byteId);
                  } else if (key === 'move') {
                    setShowSelectionModal(true);
                  }
                }}
              />
            </div>
          )}
          {showSelectionModal && (
            <div>
              <SingleSectionModal open={showSelectionModal} onClose={() => setShowSelectionModal(false)} title={'Select Byte Collection'}>
                <div>
                  {allOtherCollections?.map((byteCollection, index) => (
                    <div className="flex flex-col pb-2" key={index}>
                      <Button
                        className={MoveByteStyles.styledHover}
                        onClick={() => handleCollectionSelect(byteCollection.id, byte.byteId, spaceId, currentByteCollectionId)}
                      >
                        {byteCollection.name}
                      </Button>
                    </div>
                  ))}
                </div>
              </SingleSectionModal>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
