import React from 'react';
import Blockie from '@/components/app/Blockie';
import { getThumbnailImageUri } from '@/types/deprecated/helpers/getThumbnailImageUri';
import { getCDNImageUrl } from '@/utils/images/getCDNImageUrl';
import { formatBytes32String } from '@ethersproject/strings';
import styles from './Thumbnail.module.scss'; // Adjust the import path as necessary

interface ThumbnailProps {
  big_tile?: boolean;
  max_tile_height?: string;
  size?: string;
  src?: string;
  entityId: string;
  title: string;
  imageClass?: string;
  className?: string;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ big_tile = false, max_tile_height, size, src, entityId, title, imageClass, className }) => {
  const url: string | null = getThumbnailImageUri(src);
  const imgSrc = url ? getCDNImageUrl(url) : null;
  const address = entityId ? formatBytes32String(entityId.slice(0, 24)) : '';

  let thumbnailClass = `${styles.thumbnailImage} ${big_tile ? styles.bigTile : ''} ${max_tile_height ? styles.dynamicHeight : ''} ${imageClass || ''}`;

  return (
    <div className={`flex justify-center ${big_tile ? 'w-full' : ''} ${className || ''}`}>
      {imgSrc ? (
        <img src={imgSrc} className={thumbnailClass} alt={title} style={{ width: big_tile ? '100%' : size, height: big_tile ? max_tile_height : size }} />
      ) : (
        <Blockie seed={address} className="inline-block align-middle rounded-lg" alt={title} />
      )}
    </div>
  );
};

export default Thumbnail;
