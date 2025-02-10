import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import EditClickableDemo from '@/components/clickableDemos/Create/EditClickableDemo';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteCollectionSummary } from '@/types/byteCollections/byteCollection';
import { ClickableDemoSummary } from '@/types/clickableDemos/ClickableDemoDto';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import PrimaryColorBadge from '@dodao/web-core/components/core/badge/PrimaryColorBadge';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import ItemCompletionCheckmark from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ItemCompletionCheckmark';
import Link from 'next/link';
import React from 'react';
import styles from './ByteCollectionsCard.module.scss';

interface DemoItemProps {
  byteCollection: ByteCollectionSummary;
  demo: ClickableDemoSummary;
  eventIdx: number;
  itemLength: number;
  threeDotItems: { label: string; key: string }[];
  openItemDeleteModal: (itemId: string, itemName: string, itemType: ByteCollectionItemType | null) => void;
  openItemUnarchiveModal: (itemId: string, itemName: string, itemType: ByteCollectionItemType | null) => void;
  openItemMoveModal: (itemId: string, itemName: string, itemType: ByteCollectionItemType | null) => void;
  showItemTypeBadge: boolean;
  space: SpaceWithIntegrationsDto;
}

interface EditDemoModalState {
  isVisible: boolean;
  demoId: string | null;
}

export default function DemoItem(props: DemoItemProps) {
  const {
    byteCollection,
    demo,
    eventIdx,
    threeDotItems,
    openItemDeleteModal,
    openItemUnarchiveModal,
    openItemMoveModal,
    itemLength,
    showItemTypeBadge,
    space,
  } = props;
  const demoViewUrl = `clickable-demos/view/${demo.demoId}`;
  const [editDemoModalState, setEditDemoModalState] = React.useState<EditDemoModalState>({ isVisible: false, demoId: null });

  const modifiedThreeDotItems = JSON.parse(JSON.stringify(threeDotItems)); // Creating a deep copy so that it doesn't affect the original array
  if (demo.archive) {
    modifiedThreeDotItems.pop();
    modifiedThreeDotItems.push({ label: 'Unarchive', key: 'unarchive' });
  }

  return (
    <li key={demo.demoId}>
      <div className="relative pb-6">
        {eventIdx !== itemLength - 1 ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
        <div className="relative flex space-x-3 justify-between">
          <Link className="flex cursor-pointer" href={demoViewUrl}>
            <span className={'h-8 w-8 rounded-full flex items-center justify-center p-1 ' + styles.tidbitIconSpan}>
              <ItemCompletionCheckmark itemId={demo.demoId} itemType={ByteCollectionItemType.ClickableDemo} />
            </span>
            <div className="flex min-w-0 flex-1 justify-between space-x-2 duration-300 ease-in-out">
              <div className="ml-3 text-sm group">
                <div className="font-bold flex group-hover:underline">{`${demo.title}`}</div>
                <div className="flex-wrap">{demo.excerpt}</div>
              </div>
            </div>
          </Link>
          <div className="flex">
            {showItemTypeBadge && (
              <Link href={demoViewUrl}>
                <PrimaryColorBadge highlighted={true} className="cursor-pointer">
                  Clickable Demo
                </PrimaryColorBadge>
              </Link>
            )}
            {demo?.archive && (
              <PrimaryColorBadge onClick={() => openItemUnarchiveModal(demo.demoId, demo.title, ByteCollectionItemType.ClickableDemo)}>
                Archived
              </PrimaryColorBadge>
            )}
            {demo.demoId && (
              <div className="z-15">
                <PrivateEllipsisDropdown
                  space={space}
                  items={modifiedThreeDotItems}
                  onSelect={(key) => {
                    if (key === 'archive') {
                      openItemDeleteModal(demo.demoId, demo.title, ByteCollectionItemType.ClickableDemo);
                    } else if (key === 'unarchive') {
                      openItemUnarchiveModal(demo.demoId, demo.title, ByteCollectionItemType.ClickableDemo);
                    } else if (key === 'move') {
                      openItemMoveModal(demo.demoId, demo.title, ByteCollectionItemType.ClickableDemo);
                    } else {
                      setEditDemoModalState({ isVisible: true, demoId: demo.demoId });
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {editDemoModalState.isVisible && (
        <FullScreenModal
          open={true}
          onClose={function () {
            setEditDemoModalState({ isVisible: false, demoId: null });
          }}
          title={'Edit Clickable Demo'}
        >
          <div className="text-left">
            <EditClickableDemo
              space={space}
              demoId={editDemoModalState.demoId}
              byteCollection={byteCollection}
              closeDemoEditModal={function () {
                setEditDemoModalState({ isVisible: false, demoId: null });
              }}
            />
          </div>
        </FullScreenModal>
      )}
    </li>
  );
}
