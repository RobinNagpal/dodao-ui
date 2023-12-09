'use client';
import { videos } from '@/components/shorts/sampleVideos';
import FullScreenModal from '@/components/core/modals/FullScreenModal';
import Plyr from 'plyr';
import React, { useEffect, useRef } from 'react';
import SwiperCore from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { History, Keyboard, Mousewheel, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'src/app/shorts/styles.css';
import 'plyr/dist/plyr.css';

interface MySwiperProps {
  initialSlide: number;
  onClose: () => void;
}
export default function ShortVideoModal({ initialSlide, onClose }: MySwiperProps) {
  const swiperRef = useRef<SwiperCore>(null);

  const handleSlideChange = () => {};

  useEffect(() => {
    const plyrs = Array.from(document.querySelectorAll('.play-js-player')).map((p: any) => new Plyr(p));
  }, [initialSlide]);
  return (
    <FullScreenModal title="" open={true} onClose={onClose} fullWidth={false}>
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
            <SwiperSlide key={index} data-history={`${vid.link}`}>
              <video
                id={vid.id}
                controls //enables video control options
                controlsList="nofullscreen" //disable full-screen option
                autoPlay //enables auto playing of the videos by default
                muted //videos are muted by default
                loop //puts the videos on playback
                poster={vid.image} //thumbnail of the video
              >
                <source src={vid.link} type="video/mp4" />
              </video>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </FullScreenModal>
  );
}
