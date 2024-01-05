import React from 'react';
import styles from './TidbitItemLoader.module.scss';

export default function TidbitItemLoader() {
  return (
    <>
      <div className="flex ml-6">
        <div className={'w-full h-[200px] ' + styles.shine}></div>
        <div className="p-4 text-center">
          <h2 className="shine h-6 w-full mb-2 rounded"></h2>
          <p className="shine h-16 rounded"></p>
        </div>
        <div className="flex flex-wrap justify-end absolute top-2 left-2">
          <div className="shine w-20 h-5 rounded mb-1"></div>
        </div>
      </div>
    </>
  );
}
