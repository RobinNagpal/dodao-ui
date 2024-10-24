import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import CoreValues from './components/CoreValues';
import DoDAOHelpButton from './components/DoDAOHelpButton';
import DoDAOHomeHero from './components/DoDAOHomeHero';
import DoDAOProducts from './components/DoDAOProducts';
import { Education } from './components/Education';
import { Footer } from './components/Footer';
import { NavBar } from './components/NavBar';
import Research from './components/Research';
import Services from './components/Services';
import Head from 'next/head';

export default function DoDAOHome() {
  return (
    <div>
      <Head>
        <title>DoDAO - Empowering Blockchain Innovation with Education, Research, and Development</title>
        <meta
          name="description"
          content="DoDAO is your gateway to blockchain expertise, offering services in Smart Contract Development, Blockchain Education, Research, and DeFi solutions to empower the ecosystem."
        />
        <meta
          name="keywords"
          content="DoDAO, DoDAO website, DoDAO Blockchain, Blockchain Development, Smart Contract, Blockchain Education, Blockchain Research, DeFi Solutions, Real World Assets"
        />
        <meta name="author" content="DoDAO" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <meta property="og:title" content="DoDAO - Empowering Blockchain Innovation" />
        <meta
          property="og:description"
          content="DoDAO offers blockchain development, education, and research services to empower innovation in the blockchain ecosystem."
        />
        <meta property="og:url" content="https://dodao.io/" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png"
        />
        <meta property="og:site_name" content="DoDAO" />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DoDAO - Empowering Blockchain Innovation" />
        <meta
          name="twitter:description"
          content="DoDAO offers blockchain development, education, and research services to empower innovation in the blockchain ecosystem."
        />
        <meta
          name="twitter:image"
          content="https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png"
        />
        <meta name="twitter:site" content="@dodao_io" />
        <meta name="twitter:creator" content="@dodao_io" />

        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://dodao.io/" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'DoDAO',
              url: 'https://dodao.io/',
              logo: 'https://d31h13bdjwgzxs.cloudfront.net/academy/tidbitshub/Space/tidbitshub/1711618687477_dodao_logo%2Btext%20rectangle.png',
              sameAs: ['https://twitter.com/dodao_io', 'https://www.linkedin.com/company/dodao/mycompany/'],
            }),
          }}
        />
      </Head>

      <DoDAOHomeHero />

      <PageWrapper>
        <DoDAOHelpButton />
        <CoreValues />
        <NavBar />
        <DoDAOProducts />
        <Services />
        <Education />
        <Research />
        <Footer />
      </PageWrapper>
    </div>
  );
}
