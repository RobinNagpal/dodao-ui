import { Grid4Cols } from '@/components/core/grids/Grid4Cols';
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
        skeletonArray.map((item, index) => (
          <div key={index} className="flex flex-col w-full bg-white shadow-lg rounded-lg overflow-hidden relative">
            <div className="w-2/12 ml-4 bg-gray-300 rounded h-10"></div>
            <div className="w-2/12 ml-4 bg-gray-300 rounded h-10"></div>
            <div className="w-2/12 ml-4 bg-gray-300 rounded h-10"></div>
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
