import { Footer } from '../DoDAOHome/components/Footer';
import { Faqs } from './components/Faqs';
import { Hero } from './components/Hero';
import { PrimaryFeatures } from './components/PrimaryFeatures';
import { SecondaryFeatures } from './components/SecondaryFeatures';
import React from 'react';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';
import Head from 'next/head';

export default function TidbitsHubHome({ space }: { space: SpaceWithIntegrationsFragment }) {
  return (
    <>
      <Head>
        <title>Tidbits Hub - Simplify Learning with Bite-Sized Content</title>
        <meta
          name="description"
          content="Tidbits Hub offers an innovative learning platform with short, impactful content, one-minute videos, and interactive quizzes to enhance customer engagement and simplify education."
        />
        <meta
          name="keywords"
          content="Tidbits Hub, Bite-Sized Learning, Short Content, Interactive Learning, Customer Engagement, Education Platform, DoDAO Products, Learning Innovation"
        />
        <meta name="author" content="DoDAO" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta property="og:title" content="Tidbits Hub - Simplify Learning with Bite-Sized Content" />
        <meta
          property="og:description"
          content="Explore Tidbits Hub by DoDAO, an innovative platform offering concise content, one-minute videos, and interactive quizzes to enhance learning and customer engagement."
        />
        <meta property="og:url" content="https://tidbitshub.org/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Tidbits Hub" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tidbits Hub - Simplify Learning with Bite-Sized Content" />
        <meta
          name="twitter:description"
          content="Discover Tidbits Hub by DoDAO, where learning is made simple and engaging with short tidbits, videos, and interactive quizzes."
        />
        <meta
          name="twitter:image"
          content="https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png"
        />
        <meta name="twitter:site" content="@dodao_io" />
        <meta name="twitter:creator" content="@dodao_io" />

        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://tidbitshub.org/" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Tidbits Hub',
              url: 'https://tidbitshub.org/',
              description:
                'Tidbits Hub offers an innovative learning platform with short, impactful content, one-minute videos, and interactive quizzes to enhance customer engagement and simplify education.',
              publisher: {
                '@type': 'Organization',
                name: 'DoDAO',
                url: 'https://dodao.io/',
                logo: {
                  '@type': 'ImageObject',
                  url: 'https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png',
                },
              },
              sameAs: ['https://twitter.com/dodao_io', 'https://www.linkedin.com/company/dodao/mycompany/'],
            }),
          }}
        />
      </Head>

      <Hero space={space!} />
      <PrimaryFeatures />
      <SecondaryFeatures />
      <Faqs />
      <Footer />
    </>
  );
}
