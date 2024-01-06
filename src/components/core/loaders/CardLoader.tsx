import React from 'react';
import styles from './CardLoader.module.scss';
export enum CardLoaderType {
  CardWithThumbnalAndName = 'CardWithThumbnalAndName',
  CardWithSections = 'CardWithSections',
}
export interface CardLoaderProps {
  numberOfCards?: number;
  type?: CardLoaderType;
}
export default function CardLoader({ numberOfCards = 3, type = CardLoaderType.CardWithThumbnalAndName }: CardLoaderProps) {
  const skeletonArray = new Array(numberOfCards).fill(0);

  return (
    <>
      {type === CardLoaderType.CardWithSections &&
        skeletonArray.map(() => (
          <div className="flex flex-col bg-white text-white p-4 rounded-lg rounded-lg">
            <div className={'h-4 w-full mb-2 ' + styles.shine}></div>
            <div className={'h-4 w-4/5 mb-4 ' + styles.shine}></div>
            {[...Array(3)].map((_, index) => (
              <div key={index} className="flex items-center mb-2">
                <div className={'h-4 w-8 mr-2 ' + styles.shine}></div>
                <div className={'h-4 w-2/5 ' + styles.shine}></div>
              </div>
            ))}
          </div>
        ))}
      {type === CardLoaderType.CardWithThumbnalAndName &&
        skeletonArray.map((item, index) => (
          <div key={index} className="flex flex-col w-full bg-white shadow-lg rounded-lg overflow-hidden relative">
            <div className={'w-full h-[200px] ' + styles.shine}></div>
            <div className="p-4 text-center">
              <h2 className="shine h-6 w-full mb-2 rounded"></h2>
              <p className="shine h-16 rounded"></p>
            </div>
            <div className="flex flex-wrap justify-end absolute top-2 left-2">
              <div className="shine w-20 h-5 rounded mb-1"></div>
            </div>
          </div>
        ))}
    </>
  );
}
