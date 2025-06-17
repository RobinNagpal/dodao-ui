'use client';
import {
  BellIcon,
  ChartBarIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  EyeIcon,
  LinkIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import ContactModal from '../../../../../components/home/DoDAOHome/components/ContactModal';
import DefiGif from '@/images/DoDAOHomePage/defi_alerts.gif';
import { useState } from 'react';

const benefits = [
  {
    name: 'Never Miss Opportunities',
    href: '#',
    description: 'Get instant alerts when supply/borrow rates hit your target thresholds across Compound and competitor protocols.',
    icon: BellIcon,
  },
  {
    name: 'Maximize Your Yields',
    href: '#',
    description: 'Compare rates across Compound, Aave, Spark, and Morpho to always know where your assets can earn the most.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Protect Your Positions',
    href: '#',
    description: 'Monitor your active positions across all protocols with personalized health alerts and liquidation warnings.',
    icon: ShieldCheckIcon,
  },
];

const features = [
  {
    name: 'Compound Market Monitoring',
    description: 'Monitor any market on Compound with supply and borrow APR tracking. Set multiple thresholds and get notified when rates move in your favor.',
    icon: EyeIcon,
  },
  {
    name: 'Custom Alert Thresholds',
    description:
      'Define precise thresholds for supply rates, borrow rates, and position health. Set multiple alerts per market with different severity levels.',
    icon: ScaleIcon,
  },
  {
    name: 'Multi-Channel Delivery',
    description: 'Receive alerts via email or webhook endpoints. Configure different delivery channels for different types of alerts based on urgency.',
    icon: EnvelopeIcon,
  },
  {
    name: 'Personalized Position Tracking',
    description: 'Give your wallet address to automatically fetch and monitor your active positions across Compound, Aave, Spark, and Morpho.',
    icon: UserIcon,
  },
  {
    name: 'Cross-Protocol Rate Comparison',
    description: 'Compare Compound rates with Aave, Spark, and Morpho in real-time. Set alerts when Compound offers better rates by your specified margin.',
    icon: ChartBarIcon,
  },
  {
    name: 'Flexible Notification Frequency',
    description: 'Control how often you get notified - from instant alerts to daily summaries. Avoid notification fatigue while staying informed.',
    icon: ClockIcon,
  },
];

const protocols = [
  {
    name: 'Built for Compound',
    description:
      'DeFi Alerts was originally built and battle-tested for Compound DeFi protocol. We provide comprehensive monitoring of all Compound markets with deep integration and real-time data feeds.',
    imageSrc: 'https://d31h13bdjwgzxs.cloudfront.net/academy/compound-eth-1/Space/compound/1717288684207_compound-comp-logo.png',
  },
  {
    name: 'Extended to Major Protocols',
    description:
      "We've expanded our platform to monitor Aave, Spark, and Morpho protocols. Compare rates, track positions, and get unified alerts across the entire DeFi lending ecosystem.",
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/8787/8787168.png',
  },
];

const useCases = [
  {
    title: 'For Yield Farmers',
    description: 'Maximize returns by getting instant alerts when better rates become available across protocols.',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'For Position Managers',
    description: 'Keep your leveraged positions safe with health monitoring and liquidation warnings.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'For Protocol Teams',
    description: 'Monitor your protocol’s competitive position and user activity with our developer API.',
    icon: LinkIcon,
  },
  {
    title: 'For Wallet Providers',
    description: 'Integrate DeFi alerts into your wallet to provide users with proactive position management.',
    icon: WalletIcon,
  },
];

function DeFiAlertsComponent() {
  const [showContactModal, setShowContactModal] = useState(false);

  return (
    <div>
      <div>
        {showContactModal && <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />}
        <div className="relative overflow-hidden bg-white">
          <div aria-hidden="true" className="hidden lg:absolute lg:inset-0 lg:block">
            <svg fill="none" width={640} height={784} viewBox="0 0 640 784" className="absolute left-1/2 top-0 -translate-y-8 translate-x-64 transform">
              <defs>
                <pattern x={118} y={0} id="9ebea6f4-a1f5-4d96-8c4e-4c2abf658047" width={20} height={20} patternUnits="userSpaceOnUse">
                  <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-gray-200" />
                </pattern>
              </defs>
              <rect y={72} fill="currentColor" width={640} height={640} className="text-gray-50" />
              <rect x={118} fill="url(#9ebea6f4-a1f5-4d96-8c4e-4c2abf658047)" width={404} height={784} />
            </svg>
          </div>

          <div className="relative pb-4 sm:pb-12 lg:pb-20">
            <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-24">
              <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
                  <h1>
                    <span className="mt-1 block text-4xl font-bold tracking-tight sm:text-6xl">
                      <span className="block text-indigo-600">DeFi Alerts</span>
                    </span>
                  </h1>
                  <p className="mt-3 text-lg leading-8 text-gray-500">
                    Real-time intelligence for DeFi markets. Monitor Compound rates, compare with Aave, Spark, and Morpho, and get personalized alerts for your
                    positions. Originally built for Compound, our platform is designed to extend seamlessly to all DeFi lending protocols.
                  </p>
                  <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                    <div className="rounded-md shadow">
                      <a
                        onClick={() => setShowContactModal(true)}
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:px-10 md:py-4 md:text-lg cursor-pointer"
                      >
                        Get started
                      </a>
                    </div>
                    <div className="mt-3 rounded-md shadow sm:ml-3 sm:mt-0">
                      <a
                        href="https://compound.defialerts.xyz/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-indigo-600 hover:bg-gray-50 md:px-10 md:py-4 md:text-lg"
                      >
                        Live demo
                      </a>
                    </div>
                  </div>
                </div>
                <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                  <svg
                    fill="none"
                    width={640}
                    height={784}
                    viewBox="0 0 640 784"
                    aria-hidden="true"
                    className="absolute left-1/2 top-0 origin-top -translate-x-1/2 -translate-y-8 scale-75 transform sm:scale-100 lg:hidden"
                  >
                    <defs>
                      <pattern x={118} y={0} id="4f4f415c-a0e9-44c2-9601-6ded5a34a13e" width={20} height={20} patternUnits="userSpaceOnUse">
                        <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-gray-200" />
                      </pattern>
                    </defs>
                    <rect y={72} fill="currentColor" width={640} height={640} className="text-gray-50" />
                    <rect x={118} fill="url(#4f4f415c-a0e9-44c2-9601-6ded5a34a13e)" width={404} height={784} />
                  </svg>
                  <div className="relative mx-auto w-full rounded-lg shadow-lg">
                    <button
                      type="button"
                      className="relative block w-full overflow-hidden rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                      <span className="sr-only">DeFi Alerts Platform Demo</span>
                      <img alt="DeFi Alerts Platform Demo" src={DefiGif.src} className="w-full" />
                    </button>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      <div className="bg-gray-50">
        <div className="mx-auto max-w-7xl py-24 sm:px-2 sm:py-20 lg:px-4 mt-12">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 px-4 lg:max-w-none lg:grid-cols-2">
            {protocols.map((protocol) => (
              <div key={protocol.name} className="text-center sm:flex sm:text-left lg:block lg:text-center">
                <div className="sm:shrink-0">
                  <div className="flow-root">
                    <img alt="" src={protocol.imageSrc} className="mx-auto h-24 w-28" />
                  </div>
                </div>
                <div className="mt-3 sm:ml-3 sm:mt-0 lg:ml-0 lg:mt-3">
                  <h3 className="text-lg font-semibold text-gray-900">{protocol.name}</h3>
                  <p className="mt-2 text-base text-gray-500">{protocol.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative bg-white py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Comprehensive DeFi Monitoring</h2>
          <p className="mx-auto mt-5 max-w-prose text-base text-gray-500">
            From basic rate monitoring to advanced position management, DeFi Alerts provides everything you need to stay ahead in the fast-moving DeFi
            landscape.
          </p>
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="pt-6">
                  <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center rounded-xl bg-indigo-500 p-3 shadow-lg">
                          <feature.icon aria-hidden="true" className="h-6 w-6 text-white" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg/8 font-semibold tracking-tight text-gray-900">{feature.name}</h3>
                      <p className="mt-5 text-base/7 text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Perfect for Every DeFi User</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Whether you’re optimizing yields, managing positions, or building DeFi products, our alerts keep you informed and ahead of the market.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2 lg:max-w-none lg:grid-cols-4">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-indigo-100">
                  <useCase.icon className="h-8 w-8 text-indigo-600" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-semibold text-gray-900">{useCase.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="relative bg-gray-800 pb-32">
          <div className="absolute inset-0">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              className="size-full object-cover h-80"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gray-800 mix-blend-multiply" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">Stay Ahead of DeFi Markets</h1>
            <p className="mt-6 max-w-3xl text-base text-gray-300">
              DeFi moves fast. Rates change by the minute, positions can become unhealthy quickly, and opportunities disappear in seconds. Don’t rely on manual
              checking—let our intelligent alerts keep you informed and your positions safe.
            </p>
          </div>
        </div>
        <section aria-labelledby="contact-heading" className="relative z-10 mx-auto -mt-32 max-w-7xl px-6 pb-32 lg:px-8">
          <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {benefits.map((benefit) => (
              <div key={benefit.name} className="flex flex-col rounded-2xl bg-white shadow-xl">
                <div className="relative flex-1 px-6 pb-8 pt-16 md:px-8">
                  <div className="absolute top-0 inline-block -translate-y-1/2 transform rounded-xl bg-indigo-600 p-5 shadow-lg">
                    <benefit.icon aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{benefit.name}</h3>
                  <p className="mt-4 text-base text-gray-500">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default DeFiAlertsComponent;
