import Blockie from '@/components/app/Blockie';
import { getThumbnailImageUri } from '@/types/deprecated/helpers/getThumbnailImageUri';
import { getCDNImageUrl } from '@/utils/images/getCDNImageUrl';
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { formatBytes32String } from '@ethersproject/strings';

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

const ThumbnailImage = styled.img<{ bigTile: boolean; size: string | undefined; maxHeight: string | undefined }>`
  object-fit: ${(props) => (props.bigTile ? 'cover' : 'contain')};
  border-radius: ${(props) => (props.bigTile ? '0' : '50%')};
  width: ${(props) => (props.bigTile ? '100%' : props.size || '22')}px;
  height: ${(props) => (props.bigTile ? props.maxHeight || '262' : props.size || '22')}px;
`;

const Thumbnail: React.FC<ThumbnailProps> = ({ big_tile = false, max_tile_height, size, src, entityId, title, imageClass, className }) => {
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    const url: string | null = getThumbnailImageUri(src);
    setImgSrc(getCDNImageUrl(url));
    setAddress(entityId ? formatBytes32String(entityId.slice(0, 24)) : '');
  }, [src, entityId]);

  const bigTileStyle = {
    bigTile: big_tile,
    size: size,
    maxHeight: max_tile_height,
  };

  return (
    <div className={`flex justify-center ${big_tile ? 'w-full' : ''} ` + className ? className : ''}>
      {imgSrc && !error ? (
        <ThumbnailImage
          src={imgSrc}
          style={bigTileStyle}
          bigTile={big_tile}
          size={size}
          maxHeight={max_tile_height}
          onError={() => setError(true)}
          className={`inline-block align-middle leading-none rounded-lg ${imageClass || ''}`}
          alt={title}
        />
      ) : (
        <Blockie seed={address} style={bigTileStyle} className="inline-block align-middle rounded-lg" alt={title} />
      )}
    </div>
  );
};

export default Thumbnail;
