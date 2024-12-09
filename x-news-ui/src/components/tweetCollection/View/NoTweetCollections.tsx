import Block from '@dodao/web-core/components/app/Block';
import React from 'react';

const NoTweetCollections = () => {
  return (
    <div className="mb-3 text-center">
      <Block className="pt-1">
        <p className="my-2 text-xl font-semibold">No Tweet Collections at the moment</p>
      </Block>
    </div>
  );
};

export default NoTweetCollections;
