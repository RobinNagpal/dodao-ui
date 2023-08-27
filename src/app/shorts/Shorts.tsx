'use client';
import React, { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Mousewheel, Keyboard, History } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import './styles.css';
import PageWrapper from '@/components/core/page/PageWrapper';
import ReactPlayer from 'react-player/lazy';
import { PlayCircleIcon } from '@heroicons/react/20/solid';

const videoUrls = [
  {
    image: 'imge1.jpg',
    title: 'What is leverage',
    topic: 'Blockchain',
    url: 'vid1.mp4',
  },
  {
    image: 'imge1.jpg',
    title: 'What is leverage',
    topic: 'Blockchain',
    url: 'vid2.mp4',
  },
  {
    image: 'imge1.jpg',
    title: 'What is leverage',
    topic: 'Blockchain',
    url: 'vid3.mp4',
  },
  {
    image: 'imge1.jpg',
    title: 'What is leverage',
    topic: 'Blockchain',
    url: 'vid1.mp4',
  },
];
interface MySwiperProps {
  initialSlide: number;
  goBack: () => void;
}
const Shorts: React.FC<MySwiperProps> = ({ initialSlide, goBack }) => {
  const swiperRef = useRef<SwiperCore>(null);
  const playerRefs = useRef<(ReactPlayer | null)[]>([]);

  const playCurrentVideo = () => {
    if (!swiperRef.current) return;

    const currentSlideIndex = swiperRef.current.activeIndex;
    console.log(currentSlideIndex, 'this is index');
    const currentPlayer = playerRefs.current[currentSlideIndex];
    console.log(currentPlayer, 'this is current ');
    if (currentPlayer) {
      const internalPlayer: any = currentPlayer.getInternalPlayer();
      internalPlayer && internalPlayer.play();
    }
  };

  const pauseAllVideos = () => {
    playerRefs.current.forEach((player) => {
      if (player) {
        const internalPlayer: any = player.getInternalPlayer();
        internalPlayer && internalPlayer.pause();
      }
    });
  };
  const goToSlide = (index: number) => {
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  };

  const handleSlideChange = () => {
    pauseAllVideos();
  };

  return (
    <div className="flex justify-around">
      <div className="flex relative">
        <button className="self-center pb-[130%] pr-[10px] text-white relative" onClick={goBack}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 9l-3 3m0 0l3 3m-3-3h7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <Swiper
          ref={swiperRef as any}
          direction={'vertical'}
          className="mySwiper"
          slidesPerView={1}
          spaceBetween={30}
          keyboard={{ enabled: true }}
          mousewheel={true}
          modules={[Keyboard, Mousewheel, History]}
          onSlideChange={handleSlideChange}
          initialSlide={initialSlide}
        >
          {videoUrls.map((vid, index) => (
            <SwiperSlide key={index} data-history={`${vid.url}`}>
              <div className="flex flex-col">
                <ReactPlayer
                  ref={(ref) => (playerRefs.current[index] = ref)}
                  url={vid.url}
                  loop={true}
                  width="100%"
                  height="100%"
                  autoplay={true}
                  playing={false}
                  controls={true}
                  playIcon={<PlayCircleIcon />}
                />
                {/* <h1 className='text-white m-2'>{vid.title} | {vid.topic}</h1> */}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Shorts;
