import { SpaceProps } from '@/types/SpaceProps';
import Block from '@dodao/web-core/components/app/Block';
import React from 'react';

const NoBytes = (props: SpaceProps) => {
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="my-2 text-xl font-semibold">No Tidbits present for {props.space.name}</p>
      </Block>
    </div>
  );
};

export default NoBytes;
