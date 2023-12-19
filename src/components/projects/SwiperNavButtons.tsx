import React from 'react';
import { useSwiper } from 'swiper/react';
import styles from './SwiperNavButton.module.scss';

export const SwiperNavButtons = () => {
  const swiper = useSwiper();

  return (
    <div className="flex justify-end my-4">
      <button className={`rounded-full flex items-center justify-center px-2 mx-2 ${styles.button}`} onClick={() => swiper.slidePrev()}>
        <div className="mb-[2px] mr-px">&#x3c;</div>
      </button>
      <button className={`rounded-full flex items-center justify-center px-2 ${styles.button}`} onClick={() => swiper.slideNext()}>
        <div className="mb-[2px] ml-px">&#x3e;</div>
      </button>
    </div>
  );
};
