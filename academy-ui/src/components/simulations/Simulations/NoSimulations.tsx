import Block from '@/components/app/Block';
import { useSpace } from '@/contexts/SpaceContext';
import React from 'react';

const NoSimulations = () => {
  const { space } = useSpace();
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="mb-2">No Timelines present for {space?.name}</p>
      </Block>
    </div>
  );
};

export default NoSimulations;
