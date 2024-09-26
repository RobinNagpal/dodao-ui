import { ClickableDemoSummary } from '@/types/clickableDemos/ClickableDemoDto';
import CursorArrowRipple from '@heroicons/react/24/solid/CursorArrowRippleIcon';
import Link from 'next/link';
import styles from './ByteCollectionsCard.module.scss';
import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';

interface DemoItemProps {
  demo: ClickableDemoSummary;
  eventIdx: number;
  itemLength: number;
  threeDotItems: { label: string; key: string }[];
  openDemoEditModal: (demoId: string) => void;
  openItemDeleteModal: (itemId: string, itemType: ByteCollectionItemType | null) => void;
}

export default function DemoItem(props: DemoItemProps) {
  const { demo, eventIdx, threeDotItems, openDemoEditModal, openItemDeleteModal, itemLength } = props;
  const demoViewUrl = `clickable-demos/view/${demo.demoId}`;
  return (
    <li key={demo.demoId}>
      <div className="relative pb-6">
        {eventIdx !== itemLength - 1 ? <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" /> : null}
        <div className="relative flex space-x-3 justify-between">
          <Link className="flex cursor-pointer" href={demoViewUrl}>
            <span className={'h-8 w-8 rounded-full flex items-center justify-center p-1 ' + styles.tidbitIconSpan}>
              <CursorArrowRipple />
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
              <PrivateEllipsisDropdown
                items={threeDotItems}
                onSelect={(key) => {
                  if (key === 'archive') {
                    openItemDeleteModal(demo.demoId, ByteCollectionItemType.ClickableDemo);
                  } else {
                    openDemoEditModal(demo.demoId);
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
