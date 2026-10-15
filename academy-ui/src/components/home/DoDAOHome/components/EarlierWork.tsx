import AcademyGif from '@/images/DoDAOHomePage/Academy_site.gif';
import DefiGif from '@/images/DoDAOHomePage/defi_alerts.gif';
import KoalaGainsGif from '@/images/DoDAOHomePage/koala_gains.gif';
import TidbitsHubGif from '@/images/DoDAOHomePage/Tidbitshub_giffy.gif';
import Image, { StaticImageData } from 'next/image';
import { SectionIntro } from './SiteUi';
import { partnerLogos } from './TrustedBy';

type Product = {
  name: string;
  kind: string;
  description: string;
  image: StaticImageData;
  href: string;
};

const products: Product[] = [
  {
    name: 'KoalaGains',
    kind: 'AI agents',
    description: 'AI agents that read filings and score public companies, REITs and crowdfunding projects.',
    image: KoalaGainsGif,
    href: '/home-section/dodao-io/products/koalagains',
  },
  {
    name: 'DeFi Alerts',
    kind: 'DeFi tooling',
    description: 'Real-time alerts on yields, rates and position health across DeFi protocols and chains.',
    image: DefiGif,
    href: '/home-section/dodao-io/products/defi-alerts',
  },
  {
    name: 'Tidbits Hub',
    kind: 'Education',
    description: 'Short step-by-step lessons, one-minute videos and clickable demos.',
    image: TidbitsHubGif,
    href: '/home-section/dodao-io/products/tidbitshub',
  },
  {
    name: 'Academy Sites',
    kind: 'Education',
    description: 'Training sites with nano-courses, guides and demos, built for protocols and teams.',
    image: AcademyGif,
    href: '/home-section/dodao-io/products/academy-sites',
  },
];

const services = [
  { name: 'AI agent development', href: '/home-section/dodao-io/services/custom-ai-agent-dev' },
  { name: 'Smart contracts and DeFi tooling', href: '/home-section/dodao-io/services/smart-contract' },
  { name: 'DeFi analytics', href: '/home-section/dodao-io/services/defi-analytics' },
];

export default function EarlierWork() {
  return (
    <section id="earlier-work" className="dodao-glow relative scroll-mt-20 bg-bg py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionIntro
              title="Before robotics: AI agents and DeFi"
              lead="DoDAO spent years building AI agents and DeFi tooling for some of the largest protocols in Web3. Those products still run, and the habits carry over: ship to production, measure, and teach what we learn."
            />
          </div>
          <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="text-sm font-medium text-muted">We still take on</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {services.map((service) => (
                <li key={service.href}>
                  <a
                    href={service.href}
                    className="inline-flex rounded-full bg-surface px-4 py-2 text-sm font-medium text-heading ring-1 ring-inset ring-border transition hover:ring-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {service.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.name}>
              <a
                href={product.href}
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface ring-1 ring-border transition hover:-translate-y-0.5 hover:ring-primary/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <div className="overflow-hidden border-b border-border">
                  <Image
                    src={product.image}
                    alt={`${product.name} product preview`}
                    unoptimized
                    className="aspect-[16/10] w-full object-cover object-top transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="text-xs font-medium text-accent">{product.kind}</p>
                  <h3 className="mt-1.5 text-lg font-semibold text-heading">{product.name}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-6 text-body">{product.description}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-20">
          <p className="text-center text-sm font-medium text-muted">Teams we have built for</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {partnerLogos.map((logo) => (
              <li key={logo.name} className="flex h-20 items-center justify-center rounded-2xl bg-on-viewport px-6">
                <Image src={logo.src} alt={logo.name} className="max-h-9 w-auto max-w-[130px] object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
