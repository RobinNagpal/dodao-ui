import {
  BellIcon,
  BoltIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  EyeIcon,
  LinkIcon,
  ScaleIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import DefiGif from '@/images/DoDAOHomePage/defi_alerts.gif';

const benefits = [
  {
    name: 'Never Miss Opportunities',
    description: 'Get instant alerts when supply or borrow rates cross your target across Compound and the protocols you compare it with.',
    icon: BellIcon,
  },
  {
    name: 'Maximize Your Yields',
    description: 'Compare rates across Compound, Aave, Spark and Morpho in real time, so you always know where your assets earn the most.',
    icon: CurrencyDollarIcon,
  },
  {
    name: 'Protect Your Positions',
    description: 'Monitor every active position across protocols with personalised health alerts and early liquidation warnings.',
    icon: ShieldCheckIcon,
  },
];

const features = [
  {
    name: 'Compound Market Monitoring',
    description: 'Track supply and borrow APR on any Compound market. Set multiple thresholds and get notified the moment a rate moves in your favor.',
    icon: EyeIcon,
  },
  {
    name: 'Custom Alert Thresholds',
    description: 'Define precise thresholds for supply rates, borrow rates and position health. Multiple alerts per market with different severity levels.',
    icon: ScaleIcon,
  },
  {
    name: 'Multi-Channel Delivery',
    description: 'Receive alerts via email or webhook endpoints. Route different types of alerts through different channels based on urgency.',
    icon: EnvelopeIcon,
  },
  {
    name: 'Personalized Position Tracking',
    description: 'Pass a wallet address and we automatically fetch and monitor your active positions across Compound, Aave, Spark and Morpho.',
    icon: UserIcon,
  },
  {
    name: 'Cross-Protocol Rate Comparison',
    description: 'Compare Compound rates with Aave, Spark and Morpho in real time. Get notified when one protocol is meaningfully ahead of another.',
    icon: ChartBarIcon,
  },
  {
    name: 'Flexible Notification Frequency',
    description: 'Choose anything from instant alerts to daily summaries, so you stay informed without notification fatigue.',
    icon: ClockIcon,
  },
];

const protocols = [
  {
    name: 'Built for Compound',
    description: 'DeFi Alerts was first built and battle-tested for Compound. We monitor every Compound market with deep integration and real-time data feeds.',
  },
  {
    name: 'Extended to Major Protocols',
    description: 'Coverage has expanded to Aave, Spark and Morpho. Compare rates, track positions and get unified alerts across the lending ecosystem.',
  },
];

const useCases = [
  {
    title: 'For Yield Farmers',
    description: 'Maximise returns by getting instant alerts the moment a better rate becomes available across protocols.',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'For Position Managers',
    description: 'Keep leveraged positions safe with continuous health monitoring and early liquidation warnings.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'For Protocol Teams',
    description: 'Monitor your protocol’s competitive position and user activity with our developer API.',
    icon: LinkIcon,
  },
  {
    title: 'For Wallet Providers',
    description: 'Integrate DeFi alerts into your wallet so users get proactive position management out of the box.',
    icon: WalletIcon,
  },
];

function DeFiAlertsComponent() {
  return (
    <div>
      <div className="relative overflow-hidden bg-bg">
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">DeFi Tool · Real-Time Intelligence</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  DeFi Alerts <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">For Lending Markets</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  Monitor Compound rates, compare them with Aave, Spark and Morpho and get personalised alerts on every active position. Originally built for
                  Compound, the platform extends cleanly to all major DeFi lending protocols.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Compound · Aave · Spark · Morpho
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <BoltIcon className="h-4 w-4" aria-hidden="true" />
                    Real-time rate alerts
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                    Email + webhook delivery
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    Get started
                  </a>
                  <a
                    href="https://compound.defialerts.xyz/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    Live demo
                  </a>
                </div>
              </div>

              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative mx-auto w-full overflow-hidden rounded-2xl bg-gradient-to-br from-surface to-surface-2 ring-1 ring-border shadow-lg">
                  <img alt="DeFi Alerts platform preview" src={DefiGif.src} className="w-full" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">From One Protocol to a Whole Ecosystem</h2>
            <p className="mt-4 text-base text-body">
              Compound is where DeFi Alerts started. Today the platform watches the largest lending protocols and surfaces the best rate at any moment.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {protocols.map((protocol) => (
              <div key={protocol.name} className="rounded-2xl bg-bg p-6 ring-1 ring-border">
                <div className="flex items-center gap-x-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Squares2X2Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold text-heading">{protocol.name}</h3>
                </div>
                <p className="mt-4 text-base text-body">{protocol.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Comprehensive DeFi Monitoring</h2>
            <p className="mt-4 text-base text-body">
              From basic rate monitoring to advanced position management, DeFi Alerts has the pieces you need to stay ahead of fast-moving lending markets.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-border">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                  <feature.icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold tracking-tight text-heading">{feature.name}</h3>
                <p className="mt-2 text-base text-body">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Perfect for Every DeFi User</h2>
            <p className="mt-4 text-base text-body">
              Whether you’re optimising yields, managing positions or building DeFi products, the alerts keep you informed and ahead of the market.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="flex flex-col rounded-2xl bg-bg p-6 ring-1 ring-border">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <useCase.icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-heading">{useCase.title}</h3>
                <p className="mt-2 text-sm text-body">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Stay Ahead of DeFi Markets</h2>
            <p className="mt-4 text-base text-body">
              DeFi moves fast. Rates change by the minute, positions can become unhealthy quickly and opportunities disappear in seconds. The alerts keep you
              informed and your positions safe, without you watching dashboards all day.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.name} className="rounded-2xl bg-surface p-6 ring-1 ring-border">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                  <benefit.icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-heading">{benefit.name}</h3>
                <p className="mt-3 text-base text-body">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary to-link p-8 text-center">
            <p className="text-base font-semibold text-primary-text">Ready to stay ahead of DeFi markets?</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              Try the live platform and see how real-time alerts change the way you manage positions across Compound, Aave, Spark and Morpho.
            </p>
            <a
              href="https://compound.defialerts.xyz/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
            >
              Open DeFi Alerts
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeFiAlertsComponent;
