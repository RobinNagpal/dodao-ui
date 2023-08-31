'use client';
import React, { useState } from 'react';
import ShortsUI from './ShortsUI';
import Shorts from './Shorts';
import FullScreenModal from '@/components/core/modals/FullScreenModal';

const MainShortsComponent: React.FC = () => {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const handleThumbnailClick = (index: number) => {
    setSelectedVideoIndex(index);
  };
  const handleGoBack = () => {
    setSelectedVideoIndex(null);
  };

  if (selectedVideoIndex !== null) {
    return (
      <FullScreenModal title="" open={true} onClose={handleGoBack} fullWidth={false}>
        <Shorts initialSlide={selectedVideoIndex} goBack={handleGoBack} />
      </FullScreenModal>
    );
  } else {
    return <ShortsUI onThumbnailClick={handleThumbnailClick} />;
  }
};

export default MainShortsComponent;
