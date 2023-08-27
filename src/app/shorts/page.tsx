"use client"
import React, { useState } from 'react';
import ShortsUI from './ShortsUI';
import Shorts from './Shorts';

const MainShortsComponent: React.FC = () => {
    const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
    const handleThumbnailClick = (index: number) => {
      setSelectedVideoIndex(index);
    };
  
    const handleGoBack = () => {
      setSelectedVideoIndex(null);
    };
  
    if (selectedVideoIndex !== null) {
      return <Shorts initialSlide={selectedVideoIndex} goBack={handleGoBack} />;
    } else {
      return <ShortsUI onThumbnailClick={handleThumbnailClick} />;
    }
  };
  

export default MainShortsComponent;
