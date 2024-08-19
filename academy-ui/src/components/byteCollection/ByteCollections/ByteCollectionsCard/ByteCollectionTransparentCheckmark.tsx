import React from 'react';
import styles from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard.module.scss';
import Bars3BottomLeftIcon from '@heroicons/react/24/solid/Bars3BottomLeftIcon';

const TransparentCheckmark = () => {
  return (
    <div>
      <span className={'h-8 w-8 rounded-full flex items-center justify-center ring-5 ring-white ' + styles.tidbitIconSpan}>
        <Bars3BottomLeftIcon className="h-5 w-5 text-white" aria-hidden="true" />
      </span>
      ;
    </div>
  );
};

export default TransparentCheckmark;
