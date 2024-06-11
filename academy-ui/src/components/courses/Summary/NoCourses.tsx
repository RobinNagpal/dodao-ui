import Block from '@dodao/web-core/components/app/Block';
import { useSpace } from '@dodao/web-core/ui/contexts/SpaceContext';
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
