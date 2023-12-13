'use client';

import PrivateEllipsisDropdown from '@/components/core/dropdowns/PrivateEllipsisDropdown';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
// import { videos } from '../sampleVideos';
import React, { useRef, useState } from 'react';
import './styles.css';
import SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { History, Keyboard, Mousewheel, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ShortVideosQuery } from '@/graphql/generated/generated-types';

interface ViewShortVideoModalProps {
  initialSlide: number;
  data: ShortVideosQuery | undefined;
  onClose: () => void;
  onShowEditModal: () => void;
}
export default function ViewShortVideoModal({ initialSlide, data, onClose, onShowEditModal }: ViewShortVideoModalProps) {
  const swiperRef = useRef<SwiperCore>(null);

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
          cssMode={false}
          navigation={true}
          modules={[Keyboard, Mousewheel, History, Navigation]}
          initialSlide={initialSlide - 1}
        >
          {data?.shortVideos?.map((vid, index) => (
            <SwiperSlide key={index} data-history={vid.videoUrl} className="min-w-[300px] max-w-[300px] mx-auto">
              <video
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
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </FullScreenModal>
  );
}
