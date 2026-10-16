import AcademyGif from '@/images/DoDAOHomePage/Academy_site.gif';
import DefiGif from '@/images/DoDAOHomePage/defi_alerts.gif';
import KoalaGainsGif from '@/images/DoDAOHomePage/koala_gains.gif';
import TidbitsHubGif from '@/images/DoDAOHomePage/Tidbitshub_giffy.gif';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
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
    <section id="earlier-work" className="dodao-light scroll-mt-20 bg-bg py-24 sm:py-28">
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

        <ul className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2">
          {products.map((product) => (
            <li key={product.name}>
              <a
                href={product.href}
                className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface ring-1 ring-border transition hover:shadow-xl hover:shadow-primary/10 hover:ring-primary/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              >
                <div className="overflow-hidden border-b border-border bg-viewport">
                  <Image
                    src={product.image}
                    alt={`${product.name} product preview`}
                    unoptimized
                    className="aspect-[16/9] w-full object-cover object-top transition duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-1 items-start justify-between gap-6 p-7 sm:p-8">
                  <div>
                    <p className="text-sm font-medium text-accent">{product.kind}</p>
                    <h3 className="font-display mt-1.5 text-2xl font-semibold text-heading">{product.name}</h3>
                    <p className="mt-2 max-w-md text-base leading-7 text-body">{product.description}</p>
                  </div>
                  <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-inset ring-primary/20 transition group-hover:bg-primary group-hover:text-primary-text">
                    <ArrowUpRightIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-20">
          <p className="text-center text-sm font-medium text-muted">Teams we have built for</p>
          <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {partnerLogos.map((logo) => (
              <li key={logo.name} className="flex h-20 items-center justify-center rounded-2xl bg-surface px-6 ring-1 ring-border">
                <Image src={logo.src} alt={logo.name} className="max-h-9 w-auto max-w-[130px] object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
