import React from 'react';
import { useSwiper } from 'swiper/react';
import styles from './SwiperNavButton.module.scss';

export const SwiperNavButtons = () => {
  const swiper = useSwiper();

  return (
    <div className="flex justify-end my-4">
      <button className={`rounded-full inline-flex px-2 mx-2 ${styles.button}`} onClick={() => swiper.slidePrev()}>
        <span>&#x3c;</span>
      </button>
      <button className={`rounded-full inline-flex px-2 ${styles.button}`} onClick={() => swiper.slideNext()}>
        <span>&#x3e;</span>
      </button>
    </div>
  );
};
