// Platform Image component with error handling
import Image from 'next/image';
import { useState } from 'react';

export function PlatformImage({ platform }: { platform: string }) {
  const [imageError, setImageError] = useState(false);

  const imageUrl = `/${platform.toLowerCase()}.svg`;

  if (imageError) {
    // Fallback to a colored div with the first letter of the platform
    return (
      <span
        className="flex items-center justify-center bg-primary-color text-primary-text rounded-full"
        style={{ width: '20px', height: '20px', fontSize: '10px' }}
      >
        {platform.charAt(0)}
      </span>
    );
  }

  if (!imageUrl) {
    console.log(`Got error loading image for platform ${platform}.`);
    return null;
  }

  return <Image src={imageUrl} alt={`${platform} logo`} width={20} height={20} onError={() => setImageError(true)} className="inline" />;
}
