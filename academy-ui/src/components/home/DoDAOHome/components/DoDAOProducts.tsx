import AcademyGif from '@/images/DoDAOHomePage/Academy_site.gif';
import TidbitsHubGif from '@/images/DoDAOHomePage/Tidbitshub_giffy.gif';
import classNames from '@dodao/web-core/utils/classNames';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';

const features = [
  {
    name: 'Tidbits Hub',
    id: 'tidbits-hub',
    description:
      'Tidbits Hub offers a unique way to quickly absorb information through "tidbits"—short, impactful pieces of content that are only 5-10 sentences long. Each tidbit delivers essential insights in under five minutes and includes concise one-minute videos to suit different learning styles. The platform also features clickable demos, making the learning interactive and practical. Users can easily share these tidbits on social media or in print formats like pamphlets, with embedded calls to action (CTAs) guiding them to applications or further details.',
    imageSrc: TidbitsHubGif.src,
    imageAlt: 'White canvas laptop sleeve with gray felt interior, silver zipper, and tan leather zipper pull.',
  },
  {
    name: 'Academy Sites',
    id: 'academy-sites',
    description:
      "Academy Sites offers a streamlined way to learn through various formats that suit everyone's needs. Our nano-courses cover specific topics in 5-10 minutes, with quick quizzes to test understanding. The platform also features safe, interactive simulations and clickable demos that help users learn protocols risk-free. For deeper learning, our full courses blend texts, diagrams, videos, and interactive questions into a comprehensive 30-60 minute session. Additionally, our timelines keep users up-to-date with the latest product developments and releases, ensuring everyone stays informed.",

    imageSrc: AcademyGif.src,
    imageAlt: 'Detail of zipper pull with tan leather and silver rivet.',
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
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Empowering Innovation with DoDAO Products</p>
            <p className="mt-4 text-base text-gray-500">
              At DoDAO, we’re dedicated builders creating impactful products for the blockchain community. We support leading blockchain projects in areas like
              Smart Contract Development, Tooling, Education, and Research. Our products, such as Tidbits Hub and Academy Sites, offer custom learning tools to
              boost your blockchain skills. We’re also developing a decentralized review platform to provide detailed, unbiased evaluations of projects and
              policies.
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
