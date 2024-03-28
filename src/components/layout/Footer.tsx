'use client';

import { SpaceTypes } from '@/graphql/generated/generated-types';
import { usePathname } from 'next/navigation';

interface FooterProps {
  spaceType: string;
}

export default function Footer({ spaceType }: FooterProps) {
  const pathname = usePathname(); // Use the useRouter hook to get the current route

  // Check if the current pathname is the root ('/')
  if (pathname !== '/') {
    return null; // Do not render anything if not on the root path
  }

  return (
    <footer>
      <div className="flex justify-center text-sm pb-8 text-slate-500">
        <p>
          Crafted with Passion by{' '}
          <a href={spaceType === SpaceTypes.TidbitsSite ? 'https://tidbitshub.org' : 'https://dodao.io/'} className="underline">
            DoDAO
          </a>
        </p>
      </div>
    </footer>
  );
}
