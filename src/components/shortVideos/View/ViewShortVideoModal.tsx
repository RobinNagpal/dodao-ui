'use client';

import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import { videos } from '../sampleVideos';
import React, { useRef } from 'react';
import './styles.css';
import SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { History, Keyboard, Mousewheel, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

interface ViewShortVideoModalProps {
  initialSlide: number;
  onClose: () => void;
  onShowEditModal: () => void;
}
export default function ViewShortVideoModal({ initialSlide, onClose, onShowEditModal }: ViewShortVideoModalProps) {
  const swiperRef = useRef<SwiperCore>(null);

  const handleSlideChange = () => {};
  const threeDotItems = [{ label: 'Edit', key: 'edit' }];

  return (
    <FullScreenModal title="" open={true} onClose={onClose} fullWidth={false}>
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
          cssMode={true}
          navigation={true}
          modules={[Keyboard, Mousewheel, History, Navigation]}
          onSlideChange={handleSlideChange}
          initialSlide={initialSlide}
        >
          {videos.map((vid, index) => (
            <SwiperSlide key={index} data-history={`${vid.videoUrl}`}>
              <video
                id={vid.id}
                controls //enables video control options
                controlsList="nofullscreen" //disable full-screen option
                autoPlay //enables auto playing of the videos by default
                muted //videos are muted by default
                loop //puts the videos on playback
                poster={vid.thumbnail} //thumbnail of the video
              >
                <source src={vid.videoUrl} type="video/mp4" />
              </video>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </FullScreenModal>
  );
}
