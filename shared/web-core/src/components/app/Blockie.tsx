import makeBlockie from 'ethereum-blockies-base64';
import React from 'react';

interface IProps {
  seed?: string;
  style?: React.CSSProperties;
  className?: string;
  alt?: string;
}

const Blockie: React.FC<IProps> = ({ alt, seed, className, style }) => {
  const address = '0x000000000000000000000000000000000000dead';

  const blockie = makeBlockie(seed || address);

  return <img src={blockie} style={style} className={className} alt={alt} />;
};

export default Blockie;
