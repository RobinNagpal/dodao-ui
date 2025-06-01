// Platform Image component with error handling
import Image from 'next/image';
import { useState } from 'react';

export function PlatformImage({ platform }: { platform: string }) {
  const [imageError, setImageError] = useState(false);

  let imageUrl = '';
  if (platform === 'AAVE') imageUrl = '/aave1.svg';
  else if (platform === 'SPARK') imageUrl = '/spark.svg';
  else if (platform === 'MORPHO') imageUrl = '/morpho1.svg';

  if (imageError) {
    // Fallback to a colored div with the first letter of the platform
    return (
      <div
        className="flex items-center justify-center bg-primary-color text-primary-text rounded-full"
        style={{ width: '20px', height: '20px', fontSize: '10px' }}
      >
        {platform.charAt(0)}
      </div>
    );
  }

  return <Image src={imageUrl} alt={`${platform} logo`} width={20} height={20} onError={() => setImageError(true)} />;
}
