import { SpaceProps } from '@/contexts/withSpace';
import Block from '@dodao/web-core/components/app/Block';
import React from 'react';

const NoByteCollectionCategories = (props: SpaceProps) => {
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="mb-2">No categories present for {props.space.name}</p>
      </Block>
    </div>
  );
};

export default NoByteCollectionCategories;
