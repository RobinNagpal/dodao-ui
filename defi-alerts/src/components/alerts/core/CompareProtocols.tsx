'use client';

import React from 'react';
import { PlatformImage } from '@/components/alerts/core/PlatformImage';

interface CompareProtocolsProps {
  protocols: string[];
}

/**
 * Reusable component for displaying a list of protocol images
 */
const CompareProtocols: React.FC<CompareProtocolsProps> = ({ protocols }) => {
  if (!protocols || protocols.length === 0) {
    return null;
  }

  return (
    <>
      {protocols.map((protocol, index) => (
        <span key={index}>
          <PlatformImage platform={protocol} />
          {index < protocols.length - 1 ? ', ' : ''}
        </span>
      ))}
    </>
  );
};

export default CompareProtocols;
