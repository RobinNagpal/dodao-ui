'use client';
import Block from '@dodao/web-core/components/app/Block';
import { useSpace } from '@/contexts/SpaceContext';
import React from 'react';

const NoClickableDemos = () => {
  const { space } = useSpace();
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="mb-2">No Clickable Demos present for {space?.name}</p>
      </Block>
    </div>
  );
};

export default NoClickableDemos;
