import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { SpaceTypes } from '@/types/space/SpaceDto';
import { PredefinedSpaces } from '@dodao/web-core/src/utils/constants/constants';
import DefaultHome from '@/components/home/DefaultHome/DefaultHome';
import DoDAOHome from '@/components/home/DoDAOHome/DoDAOHome';
import TidbitsHubHome from '@/components/home/TidbitsHub/TidbitsHubHome';
import { getTidbitsSiteHomepageContents } from '@/components/home/TidbitsSite/getTidbitsSiteHomepageContents';
import { getSpaceServerSide } from '@/utils/space/getSpaceServerSide';
import { Session } from '@dodao/web-core/types/auth/Session';
import { getServerSession } from 'next-auth';
import { headers } from 'next/headers';
import React from 'react';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')?.[0];

  const space = await getSpaceServerSide();

  let metadata: Metadata = {
    title: 'Default Title',
    description: 'Default description',
  };

  if (host && (space?.botDomains || [])?.includes(host)) {
    metadata = {
      title: 'Chat with Our Bot',
      description: 'Interact with our AI-powered chatbot.',
    };
  } else if (space?.type === SpaceTypes.TidbitsSite) {
    metadata = {
      title: `${space?.name} - Tidbits`,
      description: `Learn ${space.name} with the help of Tidbits`,
    };
  } else if (host === 'dodao-localhost.io' || host === 'academy.dodao.io' || host === 'dodao.io') {
    metadata = {
      title: 'DoDAO - Empowering Blockchain Innovation',
      description: 'DoDAO offers blockchain development, education, and research services to empower innovation in the blockchain ecosystem.',
      keywords: [
        'dodao',
        'DoDAO',
        'DoDAO website',
        'DoDAO Blockchain',
        'Blockchain Development',
        'Smart Contract',
        'Blockchain Education',
        'Blockchain Research',
        'DeFi Solutions',
        'Real World Assets',
      ],
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: 'https://dodao.io/',
      },
      openGraph: {
        title: 'DoDAO - Empowering Blockchain Innovation',
        description: 'DoDAO offers blockchain development, education, and research services to empower innovation in the blockchain ecosystem.',
        url: 'https://dodao.io/',
        type: 'website',
        images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
        siteName: 'DoDAO',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'DoDAO - Empowering Blockchain Innovation',
        description: 'DoDAO offers blockchain development, education, and research services to empower innovation in the blockchain ecosystem.',
        images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
        site: '@dodao_io',
        creator: '@dodao_io',
      },
    };
  } else if (space?.id === PredefinedSpaces.TIDBITS_HUB) {
    metadata = {
      title: 'Tidbits Hub - Simplify Learning with Bite-Sized Content',
      description: 'Tidbits Hub offers an innovative platform with bite-sized content, interactive demos, and short videos to boost customer engagement.',
      keywords: [
        'Tidbits Hub',
        'Bite-Sized Learning',
        'Short Content',
        'Interactive Learning',
        'Customer Engagement',
        'Education Platform',
        'DoDAO Products',
        'Learning Innovation',
        'Blockchain Education',
      ],
      authors: [{ name: 'DoDAO' }],
      robots: {
        index: true,
        follow: true,
      },
      alternates: {
        canonical: 'https://tidbitshub.org/',
      },
      openGraph: {
        title: 'Tidbits Hub - Simplify Learning with Bite-Sized Content',
        description:
          'Explore Tidbits Hub by DoDAO, an innovative platform offering concise content, one-minute videos, and interactive quizzes to enhance learning and customer engagement.',
        url: 'https://tidbitshub.org/',
        type: 'website',
        images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/dodao_logo.png'],
        siteName: 'Tidbits Hub',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Tidbits Hub - Simplify Learning with Bite-Sized Content',
        description: 'Discover Tidbits Hub by DoDAO, where learning is made simple and engaging with short tidbits, videos, and interactive quizzes.',
        images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/dodao_logo.png'],
        site: '@dodao_io',
        creator: '@dodao_io',
      },
    };
  } else if (space?.type === SpaceTypes.AcademySite) {
    metadata = {
      title: `${space?.name} Academy Site`,
      description: `Learn at ${space?.name} with the help of guides, tidbits, shortvideos, and courses`,
    };
  } else {
    metadata = {
      title: `${space?.name} Academy Site`,
      description: `Learn at ${space?.name} with the help of guides, tidbits, shortvideos, and courses`,
    };
  }

  return metadata;
}

async function Home(props: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const headersList = await headers();
  const host = headersList.get('host')?.split(':')?.[0];

  const space = await getSpaceServerSide();
  const session = (await getServerSession(authOptions)) as Session;

  if (space?.type === SpaceTypes.TidbitsSite) {
    return await getTidbitsSiteHomepageContents(space, session);
  }

  if (host === 'dodao-localhost.io' || host === 'academy.dodao.io' || host === 'dodao.io') {
    return <DoDAOHome />;
  }

  if (space?.id === PredefinedSpaces.TIDBITS_HUB) {
    return <TidbitsHubHome space={space!} />;
  }

  return <DefaultHome space={space!} />;
}

export default Home;
