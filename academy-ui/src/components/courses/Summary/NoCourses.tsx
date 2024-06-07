import Block from '@/components/app/Block';
import { useSpace } from '@/contexts/SpaceContext';
import React from 'react';

const NoBytes = () => {
  const { space } = useSpace();
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="mb-2">No courses present</p>
      </Block>
    </div>
  );
};

export default NoBytes;
