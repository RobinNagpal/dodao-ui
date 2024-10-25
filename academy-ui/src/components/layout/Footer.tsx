'use client';

import { SpaceTypes } from '@/types/space/SpaceDto';
import { usePathname } from 'next/navigation';

interface FooterProps {
  spaceType: string;
}

export default function Footer({ spaceType }: FooterProps) {
  const pathname = usePathname(); // Use the useRouter hook to get the current route

  // Check if the pathname is the root and spaceType is TidbitsSite or AcademySite
  if ((spaceType !== SpaceTypes.TidbitsSite && spaceType !== SpaceTypes.AcademySite) || pathname !== '/') {
    return null; // Do not render the footer if the conditions are not met
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
