import AcademyGif from '@/images/DoDAOHomePage/Academy_site.gif';
import TidbitsHubGif from '@/images/DoDAOHomePage/Tidbitshub_giffy.gif';
import KoalaGains from '@/images/DoDAOHomePage/koala_gains_reduced.gif';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';

const features = [
  {
    name: 'KoalaGains',
    id: 'koala-gains',
    description:
      'KoalaGains revolutionizes investment research through powerful AI-driven insights, enabling users to quickly analyze crowdfunding projects, REITs, and public companies. It offers automated financial reports, interactive spider charts, sentiment-driven analysis, and detailed scoring explanations using advanced AI Agents. KoalaGains generates precise, reports tailored to different investment strategies. Investors can now effortlessly discover high-value opportunities and make informed decisions faster than ever before.',
    imageSrc: KoalaGains.src,
    imageAlt: 'AI Agent for startups and REITs',
  },
  {
    name: 'Tidbits Hub',
    id: 'tidbits-hub',
    description:
      'Tidbits Hub offers a unique way to quickly absorb information through "tidbits"—short, impactful pieces of content that are only 5-10 sentences long. Each tidbit delivers essential insights in under five minutes and includes concise one-minute videos to suit different learning styles. The platform also features clickable demos, making the learning interactive and practical. Users can easily share these tidbits on social media or in print formats like pamphlets, with embedded calls to action (CTAs) guiding them to applications or further details.',
    imageSrc: TidbitsHubGif.src,
    imageAlt: 'Tidbits Hub',
  },
  {
    name: 'Academy Sites',
    id: 'academy-sites',
    description:
      "Academy Sites offers a streamlined way to learn through various formats that suit everyone's needs. Our nano-courses cover specific topics in 5-10 minutes, with quick quizzes to test understanding. The platform also features safe, interactive simulations and clickable demos that help users learn protocols risk-free. For deeper learning, our full courses blend texts, diagrams, videos, and interactive questions into a comprehensive 30-60 minute session. Additionally, our timelines keep users up-to-date with the latest product developments and releases, ensuring everyone stays informed.",
    imageSrc: AcademyGif.src,
    imageAlt: 'Academy Sites',
  },
];

export default function DoDAOProducts() {
  return (
    <section className="sm:pb-20" id="products">
      <Container size="lg" className="bg-gray-50 pt-8">
        <SectionHeading number="1" id="services-title">
          Products
        </SectionHeading>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 mt-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Empowering Innovation with DoDAO Products</h2>
            <p className="mt-4 text-base text-gray-500">
              At DoDAO, we empower organizations across both blockchain and AI. We specialize in AI agent development tailored to meet the customized needs of
              businesses, ensuring innovative and efficient solutions. Our AI Agent platform, KoalaGains, automates investment research on crowdfunding and REITs with instant, data-driven insights. We also support leading blockchain projects with smart contracts, developer tooling,
              and bite-sized learning through Tidbits Hub and Academy Sites. 
            </p>
          </div>
        </div>
        <div className="py-16 space-y-16">
          {features.map((feature, featureIdx) => {
            const isEven = featureIdx % 2 === 0;
            return (
              <div key={feature.name} className={`lg:pt-6 sm:pt-2 flex flex-col ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'} md:items-center`}>
                <div className="px-3 md:mt-0 md:w-1/2 lg:w-2/5">
                  <h3 className="text-base font-semibold text-gray-900">{feature.name}</h3>
                  <p className="mt-2 text-gray-500 text-base">{feature.description}</p>
                </div>
                <div className="md:w-1/2 lg:w-3/5">
                  <div className={`aspect-w-6 aspect-h-2 overflow-hidden rounded-lg bg-gray-100 ${isEven ? 'float-right' : 'float-left'}`}>
                    <img alt={feature.imageAlt} src={feature.imageSrc.toString()} className="object-cover object-center" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
