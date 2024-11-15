'use client';

import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import FullScreenModal from '@dodao/web-core/components/core/modals/FullScreenModal';
import { ShortVideo } from '@/graphql/generated/generated-types';
import React, { useRef, useState, useEffect } from 'react';
import SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { History, Keyboard, Mousewheel, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import './styles.css';

interface ViewShortVideoModalProps {
  initialSlide: number;
  videos: ShortVideo[];
  onClose: () => void;
  onShowEditModal: () => void;
  projectId?: string | undefined;
}
export default function ViewShortVideoModal({ initialSlide, videos, onClose, onShowEditModal, projectId }: ViewShortVideoModalProps) {
  const swiperRef = useRef<SwiperCore>(null);
  const videoRefs = useRef(videos.map(() => React.createRef<HTMLVideoElement>()));
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide);
  useEffect(() => {
    setCurrentSlideIndex(initialSlide);
  }, [initialSlide]);

  const handleSlideChange = (swiper: SwiperCore) => {
    setCurrentSlideIndex(swiper.realIndex);

    // Pause the video in the previously active slide
    const previousVideoRef = videoRefs.current[currentSlideIndex];
    if (previousVideoRef && previousVideoRef.current) {
      previousVideoRef.current.pause();
    }

    // Play the video in the new active slide
    const currentVideoRef = videoRefs.current[swiper.realIndex];
    if (currentVideoRef && currentVideoRef.current) {
      currentVideoRef.current.play();
    }
  };
  const currentVideoTitle = videos[currentSlideIndex]?.title || '';

  return (
    <FullScreenModal title={currentVideoTitle} open={true} onClose={onClose} fullWidth={false}>
      <div className="flex justify-around">
        <Swiper
          ref={swiperRef as any}
          direction={'vertical'}
          className="mySwiper"
          slidesPerView={1}
          spaceBetween={30}
          keyboard={{ enabled: true }}
          mousewheel={true}
          loop={true}
          cssMode={false}
          navigation={true}
          modules={[Keyboard, Mousewheel, History, Navigation]}
          initialSlide={initialSlide}
          style={{ display: 'flex' }}
          onSlideChange={handleSlideChange}
        >
          {videos.map((vid, index) => (
            <SwiperSlide key={index} data-history={vid.videoUrl} className="flex justify-center items-center w-full h-full" style={{ display: 'flex' }}>
              <div className="relative">
                <video
                  ref={videoRefs.current[index]}
                  id={vid.id}
                  controls //enables video control options
                  controlsList="nofullscreen" //disable full-screen option - only for Chrome
                  loop //puts the videos on playback
                  poster={vid.thumbnail} //thumbnail of the video
                  width="100%"
                  style={{ maxHeight: '80vh', maxWidth: '100vw' }}
                >
                  <source src={vid.videoUrl} type="video/mp4" />
                </video>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </FullScreenModal>
  );
}
