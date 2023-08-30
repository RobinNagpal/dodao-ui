'use client';
import React, { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import SwiperCore from 'swiper';
import { Mousewheel, Keyboard, History ,Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
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
          modules={[Keyboard, Mousewheel, History,Navigation]}
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
  );
};

export default Shorts;
