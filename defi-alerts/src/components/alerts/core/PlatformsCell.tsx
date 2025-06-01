'use client';

import { Badge } from '@/components/ui/badge';
import React from 'react';
import { PlatformImage } from './PlatformImage';

interface PlatformsCellProps {
  platforms: string[];
}

/**
 * Component for displaying selected platforms in a table cell
 */
const PlatformsCell: React.FC<PlatformsCellProps> = ({ platforms }) => {
  return (
    <div className="flex flex-wrap gap-1">
      {platforms.map((platform, index) => (
        <Badge key={index} variant="outline" className="border border-primary-color flex items-center gap-1">
          <PlatformImage platform={platform} />
          {platform}
        </Badge>
      ))}
    </div>
  );
};

export default PlatformsCell;
