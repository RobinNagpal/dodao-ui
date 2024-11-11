import { SpaceProps } from '@/contexts/withSpace';
import { SpaceTypes } from '@/types/space/SpaceDto';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';
import { usePathname } from 'next/navigation';

export default function Footer({ space }: SpaceProps) {
  const pathname = usePathname();

  if ((space.type !== SpaceTypes.TidbitsSite && space.type !== SpaceTypes.AcademySite) || pathname !== '/' || space.id === PredefinedSpaces.DODAO_HOME) {
    return null; // Do not render the footer if the conditions are not met
  }

  return (
    <footer>
      <div className="flex justify-center text-sm pb-8 text-slate-500">
        <p>
          Crafted with Passion by{' '}
          <a href={space.type === SpaceTypes.TidbitsSite ? 'https://tidbitshub.org' : 'https://dodao.io/'} className="underline">
            DoDAO
          </a>
        </p>
      </div>
    </footer>
  );
}
