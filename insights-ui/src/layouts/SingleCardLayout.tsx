import React, { PropsWithChildren } from 'react';
import styles from './SingleCardLayout.module.scss';

const SingleCardLayout = ({ children }: PropsWithChildren) => {
  return <div className={`lg:px-6 sm:px-2 py-4 rounded-2xl sm:shadow-lg ${styles.cardContainer}`}>{children}</div>;
};

export default SingleCardLayout;
