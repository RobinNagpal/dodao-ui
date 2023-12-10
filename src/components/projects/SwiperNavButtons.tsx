import React from 'react';
import { useSwiper } from 'swiper/react';

export const SwiperNavButtons = () => {
  const swiper = useSwiper();

  return (
    <div className="flex justify-end my-4">
      <button className="bg-gray-500 hover:bg-gray-400 rounded-full inline-flex px-2 mx-2" onClick={() => swiper.slidePrev()}>
        <span>&#x3c;</span>
      </button>
      <button className="bg-gray-500 hover:bg-gray-400 rounded-full inline-flex px-2" onClick={() => swiper.slideNext()}>
        <span>&#x3e;</span>
      </button>
    </div>
  );
};
