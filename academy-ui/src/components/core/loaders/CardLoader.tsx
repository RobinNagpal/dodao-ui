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
        skeletonArray.map((sectionIndex) => (
          <div key={`section-${sectionIndex}`} className="flex flex-col bg-white text-white p-4 rounded-lg rounded-lg">
            <div className={'h-4 w-full mb-2 ' + styles.shine}></div>
            <div className={'h-4 w-4/5 mb-4 ' + styles.shine}></div>
            {[...Array(3)].map((_, innerIndex) => (
              <div key={`section-${sectionIndex}-inner-${innerIndex}`} className="flex items-center mb-2">
                <div className={'h-4 w-8 mr-2 ' + styles.shine}></div>
                <div className={'h-4 w-2/5 ' + styles.shine}></div>
              </div>
            ))}
          </div>
        ))}
      {type === CardLoaderType.CardWithThumbnalAndName &&
        skeletonArray.map((_, thumbnailIndex) => (
          <div key={`thumbnail-${thumbnailIndex}`} className="max-w-xs rounded overflow-hidden shadow-lg bg-white p-4">
            <div className={`${styles.shine} w-full h-56 mb-4`}></div>
            <div className={`w-full flex justify-center`}>
              <div className={`${styles.shine} h-6 w-1/2`}></div>
            </div>
          </div>
        ))}
    </>
  );
}
