'use client';

import FooterLoginButton from '@/components/layout/FooterLoginButton';
import { SpaceProps } from '@/contexts/withSpace';
import { SpaceTypes } from '@/types/space/SpaceDto';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Session } from '@dodao/web-core/types/auth/Session';

export default function Footer({ space }: SpaceProps) {
  const pathname = usePathname();
  const { data: session } = useSession() as { data: Session | null };

  if (
    (space.type !== SpaceTypes.TidbitsSite && space.type !== SpaceTypes.AcademySite) ||
    pathname !== '/' ||
    space.id === PredefinedSpaces.DODAO_HOME ||
    space.id === PredefinedSpaces.TIDBITS_HUB
  ) {
    return null; // Do not render the footer if the conditions are not met
  }

  return (
    <footer>
      <div className="flex justify-center text-sm my-4 pb-4 text-gray-400">
        <p className="mr-4">
          Crafted with Passion by{' '}
          <Link href={space.type === SpaceTypes.TidbitsSite ? 'https://tidbitshub.org' : 'https://dodao.io/'} className="underline">
            DoDAO
          </Link>
          .
        </p>
        {!session?.username && <FooterLoginButton space={space} />}
      </div>
    </footer>
  );
}
