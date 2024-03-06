import { SpaceTypes } from '@/graphql/generated/generated-types';

interface FooterProps {
  spaceType: string;
}

export default function Footer({ spaceType }: FooterProps) {
  console.log('spaceType: ', spaceType);
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
