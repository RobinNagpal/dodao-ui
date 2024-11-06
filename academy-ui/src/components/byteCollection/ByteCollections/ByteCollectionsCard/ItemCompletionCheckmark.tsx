'use client';

import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';
import styles from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard.module.scss';
import { LocalStorageKeys } from '@dodao/web-core/types/deprecated/models/enums';
import Bars3BottomLeftIcon from '@heroicons/react/24/solid/Bars3BottomLeftIcon';
import CursorArrowRipple from '@heroicons/react/24/solid/CursorArrowRippleIcon';
import CheckIcon from '@heroicons/react/24/solid/CheckIcon';
import React, { useEffect } from 'react';

export interface ItemCompletionCheckmarkProps {
  itemType: string;
  itemId: string;
}
export default function ByteCompletionCheckmark({ itemId, itemType }: ItemCompletionCheckmarkProps) {
  const [isItemCompleted, setIsItemCompleted] = React.useState<boolean>(false);
  const localStorageKey = itemType === ByteCollectionItemType.Byte ? LocalStorageKeys.COMPLETED_TIDBITS : LocalStorageKeys.COMPLETED_CLICKABLE_DEMOS;

  useEffect(() => {
    const itemCompleted = JSON.parse(localStorage.getItem(localStorageKey) || '[]')?.includes(itemId);
    setIsItemCompleted(itemCompleted);
  }, [itemId]);

  return (
    <div>
      {isItemCompleted ? (
        <div className={'bg-green-500 h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white'}>
          <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
      ) : (
        <span className={'h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white ' + styles.tidbitIconSpan}>
          {itemType === ByteCollectionItemType.Byte ? (
            <Bars3BottomLeftIcon className="h-5 w-5 text-white" aria-hidden="true" />
          ) : (
            <CursorArrowRipple className="h-5 w-5 text-white" aria-hidden="true" />
          )}
        </span>
      )}
    </div>
  );
}
