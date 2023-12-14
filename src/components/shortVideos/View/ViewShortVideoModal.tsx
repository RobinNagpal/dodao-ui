'use client';

import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { ShortVideoFragment } from '@/graphql/generated/generated-types';
// import { videos } from '../sampleVideos';
import React, { useRef, useState } from 'react';
import SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { History, Keyboard, Mousewheel, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import './styles.css';

interface ViewShortVideoModalProps {
  initialSlide: number;
  videos: ShortVideoFragment[];
  onClose: () => void;
  onShowEditModal: () => void;
}
export default function ViewShortVideoModal({ initialSlide, videos, onClose, onShowEditModal }: ViewShortVideoModalProps) {
  const swiperRef = useRef<SwiperCore>(null);
  const videoRefs = useRef(videos.map(() => React.createRef<HTMLVideoElement>()));
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide);

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
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];
  return (
    <FullScreenModal title={currentVideoTitle} open={true} onClose={onClose} fullWidth={false}>
      <div className="flex justify-end">
        <PrivateEllipsisDropdown
          items={threeDotItems}
          onSelect={async (key) => {
            if (key === 'edit') {
              onShowEditModal();
            }
          }}
          className="mt-2 mr-2"
        />
      </div>
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
              <div className="relative w-[288px] h-[512px] 2xl:w-[585px] 2xl:h-[1040px]">
                <video
                  ref={videoRefs.current[index]}
                  id={vid.id}
                  controls //enables video control options
                  controlsList="nofullscreen" //disable full-screen option - only for Chrome
                  autoPlay //enables auto playing of the videos by default
                  muted //videos are muted by default
                  loop //puts the videos on playback
                  poster={vid.thumbnail} //thumbnail of the video
                  className="absolute inset-0 w-full h-full object-cover"
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
