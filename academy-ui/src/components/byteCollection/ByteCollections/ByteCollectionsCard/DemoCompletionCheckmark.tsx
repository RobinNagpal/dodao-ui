'use client';

import styles from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard.module.scss';
import { LocalStorageKeys } from '@dodao/web-core/types/deprecated/models/enums';
import CursorArrowRipple from '@heroicons/react/24/solid/CursorArrowRippleIcon';
import CheckIcon from '@heroicons/react/24/solid/CheckIcon';
import React, { useEffect } from 'react';

export interface DemoCompletionCheckmarkProps {
  demoId: string;
}
export default function DemoCompletionCheckmark({ demoId }: DemoCompletionCheckmarkProps) {
  const [isDemoCompleted, setIsDemoCompleted] = React.useState<boolean>(false);

  useEffect(() => {
    const demoCompleted = JSON.parse(localStorage.getItem(LocalStorageKeys.COMPLETED_CLICKABLE_DEMOS) || '[]')?.includes(demoId);
    setIsDemoCompleted(demoCompleted);
  }, [demoId]);

  return (
    <div>
      {isDemoCompleted ? (
        <div className={'bg-green-500 h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white'}>
          <CheckIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </div>
      ) : (
        <span className={'h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white ' + styles.tidbitIconSpan}>
          <CursorArrowRipple className="h-5 w-5 text-white" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
