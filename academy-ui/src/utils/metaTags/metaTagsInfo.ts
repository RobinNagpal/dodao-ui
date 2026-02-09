import { Metadata } from 'next';
import { SpaceWithIntegrationsDto, SpaceTypes } from '@/types/space/SpaceDto';
import { PredefinedSpaces } from '@dodao/web-core/utils/constants/constants';

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
      title: `Tidbits Hub - ${space?.name}`,
      description: `Learn ${space.name} with the help of Tidbits`,
    };
  }
  if (space?.id === PredefinedSpaces.DODAO_HOME) {
    return {
      title: 'DoDAO – Building AI Agents & DeFi Tools',
      description: 'DoDAO helps teams build, deploy, and train AI Agents and DeFi tools for real-world use cases in finance, education, and Web3.',
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
        title: 'DoDAO – Building AI Agents & DeFi Tools',
        description: 'DoDAO helps teams build, deploy, and train AI Agents and DeFi tools for real-world use cases in finance, education, and Web3.',
        url: 'https://dodao.io/',
        type: 'website',
        images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png'],
        siteName: 'DoDAO',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'DoDAO – Building AI Agents & DeFi Tools',
        description: 'DoDAO helps teams build, deploy, and train AI Agents and DeFi tools for real-world use cases in finance, education, and Web3.',
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
    if (space.id === 'compound-eth-1') {
      return {
        title: 'Compound Academy – Learn DeFi Lending & Borrowing',
        description:
          'Explore how Compound Finance powers decentralized lending and borrowing. Understand Compound III, interest rates, liquidation, and governance with our academy website.',
        keywords: [
          'Compound',
          'Compound III',
          'DeFi Education',
          'Lending and Borrowing',
          'Interest Rates',
          'Liquidation',
          'COMP Token',
          'Governance',
          'Learning Platform',
        ],
        robots: {
          index: true,
          follow: true,
        },
        alternates: {
          canonical: 'https://compound.education/',
        },
        openGraph: {
          title: 'Compound Academy – Learn DeFi Lending & Borrowing',
          description:
            'Discover how Compound Finance enables lending & borrowing. Dive into interest rates, liquidation, and governance with our academy website.',
          url: 'https://compound.education/',
          type: 'website',
          images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/compound-eth-1/Space/compound/1717288684207_compound-comp-logo.png'],
          siteName: 'Compound Academy',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Compound Academy – Learn DeFi Lending & Borrowing',
          description:
            'Master Compound Finance with the help of guides, tidbits, clickable demos, and courses. Explore interest rates, liquidation, and COMP governance for a deeper DeFi understanding.',
          images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/compound-eth-1/Space/compound/1717288684207_compound-comp-logo.png'],
          site: '@dodao_io',
          creator: '@dodao_io',
        },
      };
    }
    if (space.id === 'uniswap-eth-1') {
      return {
        title: 'Uniswap Academy – AMMs, Concentrated Liquidity & Strategies',
        description:
          'Learn how Uniswap V3 revolutionizes decentralized exchanges with concentrated liquidity, capital efficiency, and advanced AMM strategies. Explore ticks, impermanent loss, and more with academy website.',
        keywords: ['Uniswap', 'Uniswap V3', 'AMM', 'Concentrated Liquidity', 'Impermanent Loss', 'Ticks', 'Strategies', 'DeFi Education', 'Academy'],
        robots: {
          index: true,
          follow: true,
        },
        alternates: {
          canonical: 'https://uniswap.university/',
        },
        openGraph: {
          title: 'Uniswap Academy – AMMs, Concentrated Liquidity & Strategies',
          description:
            'Dive into Uniswap V3’s core concepts—AMM, ticks, IL—via tidbits and interactive demos. Perfect for anyone aiming to master DeFi liquidity strategies.',
          url: 'https://uniswap.university/',
          type: 'website',
          images: ['https://upload.wikimedia.org/wikipedia/commons/5/5a/Uniswap_Logo_and_Wordmark.svg'],
          siteName: 'Uniswap Academy',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Uniswap Academy – AMMs, Concentrated Liquidity & Strategies',
          description:
            'Discover how Uniswap V3 uses concentrated liquidity and capital efficiency. Learn impermanent loss, ticks, and strategy backtesting with our academy website.',
          images: ['https://upload.wikimedia.org/wikipedia/commons/5/5a/Uniswap_Logo_and_Wordmark.svg'],
          site: '@dodao_io',
          creator: '@dodao_io',
        },
      };
    }
    if (space.id === 'arbitrum-university') {
      return {
        title: 'Arbitrum Academy – L2 Rollups, Nitro & AnyTrust',
        description:
          'Explore how Arbitrum enhances Ethereum scalability with Optimistic Rollups and Nitro tech. Learn bridging, governance, and security with our academy website.',
        keywords: ['Arbitrum', 'Layer 2', 'Optimistic Rollups', 'Nitro', 'AnyTrust', 'DAO Governance', 'DeFi Education', 'Academy'],
        robots: {
          index: true,
          follow: true,
        },
        alternates: {
          canonical: 'https://arbitrum.education/',
        },
        openGraph: {
          title: 'Arbitrum Academy – L2 Rollups, Nitro & AnyTrust',
          description:
            'Learn Arbitrum’s key features: bridging, governance, security, and Nitro. Short tidbits and interactive demos make Layer-2 scaling simple.',
          url: 'https://arbitrum.education/',
          type: 'website',
          images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/arbitrum-university/AcademyLogo/arbitrum_university/1696374389613_arbitrum_logo.png'],
          siteName: 'Arbitrum Academy',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Arbitrum Academy – L2 Rollups, Nitro & AnyTrust',
          description:
            'Master Arbitrum’s rollup technology and improved scalability through guides, tidbits, clickable demos, and courses. Understand the bridge, DAOs, and AnyTrust with ease.',
          images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/arbitrum-university/AcademyLogo/arbitrum_university/1696374389613_arbitrum_logo.png'],
          site: '@dodao_io',
          creator: '@dodao_io',
        },
      };
    }
    if (space.id === 'optimism-university') {
      return {
        title: 'Optimism Academy – L2 Rollups, OP Governance & RetroPGF',
        description:
          'Learn how Optimism scales Ethereum with Layer-2 solutions, OP governance houses, RetroPGF grants, and more. Explore bridges, citizenship, and node operations with our academy website',
        keywords: ['Optimism', 'OP token', 'Layer-2 Rollups', 'RetroPGF', 'Governance', 'Optimism Collective', 'DeFi Education', 'Academy'],
        robots: {
          index: true,
          follow: true,
        },
        alternates: {
          canonical: 'https://optimism.university/',
        },
        openGraph: {
          title: 'Optimism Academy – L2 Rollups, OP Governance & RetroPGF',
          description:
            'Discover Optimism’s approach to Ethereum scaling with L2, OP governance, RetroPGF grants, and bridging. Learn it all through concise tidbits and step-by-step demos.',
          url: 'https://optimism.university/',
          type: 'website',
          images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/optimism-university/AcademyLogo/optimism_university/1694773002830_optimism-logo.png'],
          siteName: 'Optimism Academy',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Optimism Academy – L2 Rollups, OP Governance & RetroPGF',
          description:
            'Master Optimism’s key features—bridging, governance houses, RetroPGF, and more—through guides and courses. Perfect for anyone wanting a deeper L2 understanding.',
          images: ['https://d31h13bdjwgzxs.cloudfront.net/academy/optimism-university/AcademyLogo/optimism_university/1694773002830_optimism-logo.png'],
          site: '@dodao_io',
          creator: '@dodao_io',
        },
      };
    }
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
