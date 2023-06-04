import React, { useState, useEffect, CSSProperties } from 'react';
import makeBlockie from 'ethereum-blockies-base64';

interface IProps {
  seed?: string;
  style?: CSSProperties;
  className?: string;
  alt?: string;
}

const Blockie: React.FC<IProps> = ({ alt, seed, className, style }) => {
  const address = '0x000000000000000000000000000000000000dead';
  const [blockie, setBlockie] = useState('');

  useEffect(() => {
    setBlockie(makeBlockie(seed || address));
  }, [seed]);

  return <img src={blockie} style={style} className={className} alt={alt} />;
};

export default Blockie;
