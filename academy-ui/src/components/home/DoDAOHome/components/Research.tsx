import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import { MagnifyingGlassIcon, MapIcon, UsersIcon, PresentationChartLineIcon } from '@heroicons/react/24/outline';

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
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce/icons/icon-delivery-light.svg',
    description:
      'People can propose solutions by submitting a bond. Honest proposals lead to getting their bond back, while the best-rated ideas are rewarded. This system ensures fairness and encourages innovative thinking.',
  },
  {
    name: 'Ensuring Honest Reviews',
    imageSrc: 'https://tailwindui.com/plus/img/ecommerce/icons/icon-warranty-light.svg',
    description:
      'Reviews play a vital role in choosing the best products, services, and providers. We apply a similar bonding system to reviews. Reviewers provide a bond, which they lose if they are dishonest. Honest reviewers get their bond back and receive a reward for their genuine feedback.',
  },
];

export default function Research() {
  return (
    <section id="research" aria-labelledby="research-title" className="pb-20">
      <Container size="lg" className="bg-gray-50 pt-8">
        <div className="mx-auto lg:mx-0">
          <SectionHeading number="3" id="research-title">
            Research
          </SectionHeading>
        </div>
        <div className="mx-auto max-w-7xl py-4 sm:py-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">Real-World Assets on Blockchain</h2>
              <p className="mt-4 text-gray-500">
                At DoDAO, we specialize in simplifying the complex world of Real World Assets (RWAs) for builders and investors. Our expertise spans research,
                consulting, and business development, helping companies navigate regulatory hurdles, find strategic partners, and optimize their asset
                portfolios.
              </p>
            </div>
            <div className="mt-4">
              <h2 className="sr-only">Our RWA Services</h2>
              <div className="mx-auto max-w-7xl py-4 sm:px-2 sm:py-12 lg:px-4">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 px-4 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                  {rwa.map((perk) => (
                    <div key={perk.name} className="sm:flex">
                      <div className="sm:flex-shrink-0">
                        <div className="flow-root">
                          <perk.icon aria-hidden="true" className="h-16 w-20 text-indigo-600" />
                        </div>
                      </div>
                      <div className="mt-3 sm:ml-3 sm:mt-0">
                        <h3 className="text-sm font-medium text-gray-900">{perk.name}</h3>
                        <p className="mt-2 text-sm text-gray-500">{perk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl py-4 sm:py-4">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">Decentralized - Solution & Reviews</h2>
              <p className="mt-4 text-gray-500">
                DoDAO is exploring ways to improve human coordination in both public and private sectors through decentralized systems. We aim to create
                transparent and accountable platforms where everyone can contribute ideas and provide honest feedback, ensuring that resources are used
                effectively and the system benefits all.
              </p>
            </div>
            <div className="mt-4">
              <h2 className="sr-only">Our Decentralized - Solution & Reviews</h2>
              <div className="mx-auto max-w-7xl py-4 sm:px-2 sm:py-12 lg:px-4">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 px-4 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                  {decentralized.map((perk) => (
                    <div key={perk.name} className="sm:flex">
                      <div className="sm:flex-shrink-0">
                        <div className="flow-root">
                          <img alt="" src={perk.imageSrc} className="h-16 w-20" />
                        </div>
                      </div>
                      <div className="mt-3 sm:ml-3 sm:mt-0">
                        <h3 className="text-sm font-medium text-gray-900">{perk.name}</h3>
                        <p className="mt-2 text-sm text-gray-500">{perk.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
