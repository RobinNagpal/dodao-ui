import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import { MagnifyingGlassIcon, MapIcon, UsersIcon, PresentationChartLineIcon, StarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const rwa = [
  {
    name: 'RWA Research',
    icon: MagnifyingGlassIcon,
    description:
      'We provide in-depth research on Real World Assets, covering regulations, market trends, and investment opportunities. Our insights help companies make informed decisions and stay ahead in the rapidly evolving RWA landscape.',
  },
  {
    name: 'RWA Landscape',
    icon: MapIcon,
    description:
      'Our comprehensive overview categorizes RWA companies and their offerings, making it easy to navigate the ecosystem. This service helps identify key players and potential partnerships for growth.',
  },
  {
    name: 'Business Development',
    icon: UsersIcon,
    description:
      'We connect RWA companies with strategic partners and assets to drive growth. Our focus on building valuable relationships unlocks new business opportunities and enhances market reach.',
  },
  {
    name: 'Consultations',
    icon: PresentationChartLineIcon,
    description:
      'Our consulting services simplify the legal and compliance aspects of RWA projects. With expert guidance, we help companies navigate regulations and make informed choices to accelerate their development.',
  },
];

const decentralized = [
  {
    name: 'Empowering Collective Solutions',
    icon: UserGroupIcon,
    description:
      'People can propose solutions by submitting a bond. Honest proposals lead to getting their bond back, while the best-rated ideas are rewarded. This system ensures fairness and encourages innovative thinking. With this approach, we motivate communities to actively participate and create impactful solutions.',
  },
  {
    name: 'Ensuring Honest Reviews',
    icon: StarIcon,
    description:
      'Reviews play a vital role in choosing the best products, services, and providers. We apply a similar bonding system to reviews. Reviewers provide a bond, which they lose if they are dishonest. Honest reviewers get their bond back and receive a reward for their genuine feedback.',
  },
];

export default function Research() {
  return (
    <section id="research" aria-labelledby="research-title" className="pb-20">
      <Container size="lg" className="bg-gray-50 pt-8">
        <div className="mx-auto lg:mx-0">
          <SectionHeading number="4" id="research-title">
            Research
          </SectionHeading>
        </div>
        <div className="mx-auto max-w-7xl py-4 sm:py-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Real-World Assets on Blockchain</h2>
              <p className="mt-4 text-base text-gray-500">
                At DoDAO, we specialize in simplifying the complex world of Real World Assets (RWAs) for builders and investors. Our expertise spans research,
                consulting, and business development, helping companies navigate regulatory hurdles, find strategic partners, and optimize their asset
                portfolios.
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-6xl">
              <dl className="flex flex-wrap justify-center gap-y-10">
                {rwa.map((value, index) => (
                  <div key={value.name} className={`relative px-16 w-full sm:w-1/2 ${index === rwa.length - 1 ? 'sm:mx-auto' : ''}`}>
                    <dt className="text-base font-semibold text-gray-900">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                        <value.icon aria-hidden="true" className="h-6 w-6 text-white" />
                      </div>
                      {value.name}
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">{value.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl py-4 sm:py-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Decentralized - Solution & Reviews</h2>
              <p className="mt-4 text-base text-gray-500">
                DoDAO is exploring ways to improve human coordination in both public and private sectors through decentralized systems. We aim to create
                transparent and accountable platforms where everyone can contribute ideas and provide honest feedback, ensuring that resources are used
                effectively and the system benefits all.
              </p>
            </div>
            <div className="mx-auto mt-12 max-w-6xl">
              <dl className="flex flex-wrap justify-center gap-y-10">
                {decentralized.map((value, index) => (
                  <div key={value.name} className={`relative px-16 w-full sm:w-1/2 ${index === decentralized.length - 1 ? 'sm:mx-auto' : ''}`}>
                    <dt className="text-base font-semibold text-gray-900">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                        <value.icon aria-hidden="true" className="h-6 w-6 text-white" />
                      </div>
                      {value.name}
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">{value.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
