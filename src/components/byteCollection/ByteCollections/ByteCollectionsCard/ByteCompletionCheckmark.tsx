'use client';

import styles from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard.module.scss';
import { LocalStorageKeys } from '@/types/deprecated/models/enums';
import Bars3BottomLeftIcon from '@heroicons/react/24/solid/Bars3BottomLeftIcon';
import CheckIcon from '@heroicons/react/24/solid/CheckIcon';
import React from 'react';

export interface ByteCompletionCheckmarkProps {
  byteId: string;
}
export default function ByteCompletionCheckmark({ byteId }: ByteCompletionCheckmarkProps) {
  const isByteCompleted = JSON.parse(localStorage.getItem(LocalStorageKeys.COMPLETED_TIDBITS) || '[]')?.includes(byteId);

  return (
    <div>
      {isByteCompleted ? (
        <div className={'bg-green-500 h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white'}>
          <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
      ) : (
        <span className={'h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white ' + styles.tidbitIconSpan}>
          <Bars3BottomLeftIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
