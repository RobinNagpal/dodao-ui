'use client';

import ShortVideoModal from '@/components/shorts/ShortVideoModal';
import React, { useState } from 'react';
import Shorts from '@/components/shorts/Shorts';

const MainShortsComponent: React.FC = () => {
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const handleThumbnailClick = (index: number) => {
    setSelectedVideoIndex(index);
  };

  if (selectedVideoIndex !== null) {
    return <ShortVideoModal initialSlide={selectedVideoIndex} onClose={() => setSelectedVideoIndex(null)} />;
  } else {
    return <Shorts onThumbnailClick={handleThumbnailClick} />;
  }
};

export default MainShortsComponent;
