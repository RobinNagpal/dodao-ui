import { Metadata } from 'next';
import { SpaceWithIntegrationsDto, SpaceTypes } from '@/types/space/SpaceDto';
import { PredefinedSpaces } from '@dodao/web-core/src/utils/constants/constants';

export function getMetaTags(space: SpaceWithIntegrationsDto): Metadata {
  if (space?.type === SpaceTypes.TidbitsSite) {
    if (space?.id === 'alchemix') {
      return {
        title: 'Tidbits Hub - Learn Alchemix DeFi Platform',
        description:
          'Master Alchemix through bite-sized content and interactive demos. Explore self-repaying loans, alAssets, and DeFi yield strategies with easy-to-understand tidbits.',
        keywords: [
          'Alchemix',
          'Tidbits - Alchemix',
          'DeFi Education',
          'Self-Repaying Loans',
          'Zero Liquidations',
          'Yield Strategies',
          'Learn Alchemix',
          'Learning Platform',
        ],
        robots: {
          index: true,
          follow: true,
        },
        alternates: {
          canonical: 'https://alchemix.tidbitshub.org/',
        },
        openGraph: {
          title: 'Tidbits Hub - Learn Alchemix DeFi Platform',
          description:
            'Explore Alchemix’s self-repaying loans and yield strategies in a user-friendly, bite-sized format. Empower your DeFi journey without liquidations.',
          url: 'https://alchemix.tidbitshub.org/',
          type: 'website',
          images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/alchemix/Space/alchemix/1723555696123_alcx_std_logo.svg'],
          siteName: 'Alchemix Tidbits',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Tidbits Hub - Learn Alchemix DeFi Platform',
          description:
            'Master Alchemix through bite-sized content and interactive demos. Explore self-repaying loans, alAssets, and DeFi yield strategies with easy-to-understand tidbits.',
          images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/alchemix/Space/alchemix/1723555696123_alcx_std_logo.svg'],
          site: '@dodao_io',
          creator: '@dodao_io',
        },
      };
    }
    if (space?.id === 'safe-global') {
      return {
        title: 'Tidbits Hub – Learn Safe Wallet | Secure Smart Account Management',
        description:
          'Explore how Safe, the leading Ethereum multisig wallet, secures your assets with multiple signers and smart modules. Learn with bite-sized tidbits and interactive demos — perfect for individuals or DAOs.',
        keywords: [
          'Safe Wallet Learning',
          'Tidbits Hub - Safe Wallet',
          'Multisig Wallet',
          'Smart Accounts',
          'Safe Wallet Tidbits',
          'DeFi Education',
          'Learning Platform',
          'Gnosis Safe',
        ],
        robots: {
          index: true,
          follow: true,
        },
        alternates: {
          canonical: 'https://safe-global.tidbitshub.org/',
        },
        openGraph: {
          title: 'Tidbits Hub – Learn Safe (Multisig) Wallet',
          description:
            'Explore how Safe, the leading Ethereum multisig wallet, secures your assets with multiple signers and smart modules. Learn with bite-sized tidbits and interactive demos — perfect for individuals or DAOs.',
          url: 'https://safe-global.tidbitshub.org/',
          type: 'website',
          images: ['https://www.blocknative.com/hs-fs/hubfs/Safe_Logos_H-Lockup_White.png'],
          siteName: 'Alchemix Tidbits',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Tidbits Hub – Learn Safe (Multisig) Wallet',
          description:
            'Use Safe to secure funds for individuals or DAOs. Take advantage of multiple signers, modules, and on-chain transaction simulations — taught through short tidbits and step-by-step demos.',
          images: ['https://www.blocknative.com/hs-fs/hubfs/Safe_Logos_H-Lockup_White.png'],
          site: '@dodao_io',
          creator: '@dodao_io',
        },
      };
    }
    return {
      title: `${space?.name} - Tidbits`,
      description: `Learn ${space.name} with the help of Tidbits`,
    };
  }
  if (space?.id === PredefinedSpaces.DODAO_HOME) {
    return {
      title: 'DoDAO - Empowering Blockchain Innovation',
      description: 'DoDAO offers blockchain development, education, and research services to empower innovation in the blockchain ecosystem.',
      keywords: [
        'dodao',
        'DoDAO',
        'DoDAO Website',
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
    return {
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
    return {
      title: `${space?.name} Academy Site`,
      description: `Learn at ${space?.name} with the help of guides, tidbits, shortvideos, and courses`,
    };
  }
  return {
    title: `${space?.name} Academy Site`,
    description: `Learn at ${space?.name} with the help of guides, tidbits, shortvideos, and courses`,
  };
}
