import {
  ArrowDownTrayIcon,
  ArrowsRightLeftIcon,
  BellAlertIcon,
  BoltIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  CircleStackIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FaceSmileIcon,
  PresentationChartLineIcon,
  ShieldExclamationIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

type Service = {
  key: string;
  title: string;
  short: string;
  description: string;
  example: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: 'primary' | 'link' | 'success' | 'warning';
};

const services: Service[] = [
  {
    key: 'asset',
    title: 'Asset Analysis Dashboard',
    short: 'Live view of every asset in your protocol.',
    description:
      'A single dashboard that shows performance, transaction volume, and market trends per asset, so you can read the market without juggling tabs.',
    example: 'Tracking a new token — see real-time trading volume, price action, and liquidity in one view.',
    icon: ChartBarIcon,
    accent: 'primary',
  },
  {
    key: 'onchain',
    title: 'On-Chain Activity Tracking',
    short: 'Every protocol transaction, indexed and queryable.',
    description:
      'We index, classify, and surface user behaviour on-chain — deposits, withdrawals, swaps, liquidations — at the level of detail you actually need.',
    example: 'See peak deposit hours, spot bottlenecks in your flow, and reshape product based on real usage.',
    icon: CircleStackIcon,
    accent: 'link',
  },
  {
    key: 'sentiment',
    title: 'Market Sentiment Analysis',
    short: 'Predictive read on where the market is heading.',
    description: 'We blend on-chain signals, social data, and price action into a sentiment score so you can act on shifts early rather than chase them.',
    example: 'Sentiment dips on an asset before its price does — adjust positioning or exposure ahead of the crowd.',
    icon: FaceSmileIcon,
    accent: 'warning',
  },
  {
    key: 'risk',
    title: 'Risk Management Tools',
    short: 'Catch volatility and abuse before they cost you.',
    description: 'Custom alerting and dashboards for the risks that matter to your protocol — concentration, volatility, withdrawal spikes, oracle drift.',
    example: 'Unusual withdrawal pattern? You get paged before it shows up as a story on Twitter.',
    icon: ShieldExclamationIcon,
    accent: 'success',
  },
];

type PipelineStep = {
  num: string;
  title: string;
  subtitle: string;
  detail: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  chip: string;
};

const pipeline: PipelineStep[] = [
  {
    num: '01',
    title: 'Collect',
    subtitle: 'RPC, The Graph, indexers, off-chain APIs',
    detail: 'We pull raw data from on-chain RPC nodes, subgraphs, and any other APIs your protocol cares about — full coverage, not samples.',
    icon: ArrowDownTrayIcon,
    chip: 'Real-time',
  },
  {
    num: '02',
    title: 'Normalise',
    subtitle: 'Decoded, classified, deduped',
    detail: 'Calls, events, and balances are decoded, classified by type, and stored in a schema that survives chain upgrades and re-orgs.',
    icon: Cog6ToothIcon,
    chip: 'Schema-stable',
  },
  {
    num: '03',
    title: 'Analyse',
    subtitle: 'Trends, sentiment, anomalies',
    detail: 'On top of the normalised data, we run trend, sentiment, and anomaly models tailored to your protocol — not a generic dashboard template.',
    icon: CpuChipIcon,
    chip: 'Tailored',
  },
  {
    num: '04',
    title: 'Surface',
    subtitle: 'Dashboards, alerts, APIs',
    detail: 'Insights land where your team already lives — dashboards, alert channels, or your own product UI via the analytics API.',
    icon: PresentationChartLineIcon,
    chip: 'Where you work',
  },
];

const whyDodao = [
  {
    title: 'Trusted by leading DeFi protocols',
    description: 'Our analytics work is used by real protocol teams, not just demoed in pitch decks.',
    icon: SparklesIcon,
  },
  {
    title: 'Data engineering rigour',
    description: 'Re-orgs, missed blocks, chain upgrades — the unglamorous edges we handle so your dashboards never lie.',
    icon: BoltIcon,
  },
  {
    title: 'Bespoke, not generic',
    description: 'We build the metrics that matter to your protocol, not a copy-paste of someone else’s screen.',
    icon: ChartBarSquareIcon,
  },
];

const accentToText: Record<Service['accent'], string> = {
  primary: 'text-primary',
  link: 'text-link',
  success: 'text-success',
  warning: 'text-warning',
};

const accentToBg: Record<Service['accent'], string> = {
  primary: 'bg-primary/15',
  link: 'bg-link/15',
  success: 'bg-success/15',
  warning: 'bg-warning/15',
};

const accentToRing: Record<Service['accent'], string> = {
  primary: 'ring-primary/30',
  link: 'ring-link/30',
  success: 'ring-success/30',
  warning: 'ring-warning/30',
};

function DefiAnalytics() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-bg">
        <div className="dodao-dot-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">Blockchain · DeFi analytics</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  Turn on-chain noise into{' '}
                  <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">decisions you can ship</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  We build the dashboards, indexers, and alerts that protocol teams actually use. Performance per asset, on-chain user behaviour, sentiment
                  shifts, and risk signals — surfaced in real time, in the places your team already works.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Real-time pipelines
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    Full chain coverage
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <BellAlertIcon className="h-4 w-4" aria-hidden="true" />
                    Custom alerts
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    Scope a dashboard
                  </a>
                  <a
                    href="/home-section/dodao-io/services/smart-contract"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    Need smart contracts too?
                  </a>
                </div>
              </div>

              {/* Mock dashboard preview */}
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-surface to-surface-2 p-5 ring-1 ring-border shadow-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest font-semibold text-primary">Protocol dashboard</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success ring-1 ring-success/40">
                      <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                      Live
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-bg/60 p-3 ring-1 ring-border">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">TVL</p>
                      <p className="mt-1 text-base font-bold text-heading">$248M</p>
                      <p className="text-[10px] text-success">+3.4%</p>
                    </div>
                    <div className="rounded-lg bg-bg/60 p-3 ring-1 ring-border">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">24h vol</p>
                      <p className="mt-1 text-base font-bold text-heading">$41.2M</p>
                      <p className="text-[10px] text-link">+1.1%</p>
                    </div>
                    <div className="rounded-lg bg-bg/60 p-3 ring-1 ring-border">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Active</p>
                      <p className="mt-1 text-base font-bold text-heading">12,847</p>
                      <p className="text-[10px] text-warning">−0.6%</p>
                    </div>
                  </div>

                  {/* mock bar chart */}
                  <div className="mt-4 rounded-xl bg-bg/60 p-4 ring-1 ring-border">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Deposits last 7d</p>
                    <div className="mt-3 flex h-20 items-end gap-1.5">
                      {[40, 65, 50, 80, 55, 90, 72].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm bg-gradient-to-t from-primary to-link" style={{ height: `${h}%` }} aria-hidden="true" />
                      ))}
                    </div>
                  </div>

                  <p className="mt-3 text-[10px] italic text-muted">Illustrative preview. Your dashboard is bespoke to your protocol.</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 4 services — visual card grid with mini accent */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">Four analytics modules</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">What we surface for protocol teams</h2>
            <p className="mt-4 text-base text-body">
              Each module is shippable on its own. Most teams start with one or two and add the others once they have seen the data move a decision.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {services.map((s) => (
              <div key={s.key} className="relative flex flex-col rounded-2xl bg-bg p-6 ring-1 ring-border">
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${accentToBg[s.accent]} ${accentToText[s.accent]} ring-1 ${
                      accentToRing[s.accent]
                    }`}
                  >
                    <s.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold text-heading">{s.title}</h3>
                </div>
                <p className={`mt-4 text-xs font-semibold uppercase tracking-wide ${accentToText[s.accent]}`}>{s.short}</p>
                <p className="mt-1 text-sm text-body">{s.description}</p>
                <div className={`mt-5 rounded-xl ${accentToBg[s.accent]} p-3 ring-1 ${accentToRing[s.accent]}`}>
                  <p className={`text-[10px] font-semibold uppercase tracking-wide ${accentToText[s.accent]}`}>For example</p>
                  <p className="mt-1 text-xs text-body">{s.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pipeline — zigzag with center rail */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-link">From raw chain to clear decision</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">How the data pipeline works</h2>
            <p className="mt-4 text-base text-body">
              The dashboard is the last 10% of the work. The first 90% is a hardened pipeline you can trust under volatility and chain re-orgs.
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-4xl">
            <div aria-hidden="true" className="absolute left-1/2 top-0 bottom-0 hidden w-0.5 -translate-x-1/2 bg-link/20 md:block" />

            <div className="relative space-y-12">
              {pipeline.map((step, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={step.num} className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
                    <div className={`md:w-1/2 ${isLeft ? 'md:order-first md:text-right' : 'md:order-last'}`}>
                      <h3 className="text-xl font-semibold text-heading">{step.title}</h3>
                      <p className="mt-1 text-sm text-body">{step.subtitle}</p>
                      <span
                        className={`mt-3 inline-flex items-center rounded-full bg-link/15 px-2.5 py-1 text-xs font-medium text-link ring-1 ring-link/40 ${
                          isLeft ? 'md:ml-auto' : ''
                        }`}
                      >
                        {step.chip}
                      </span>
                    </div>

                    <div className="relative z-10 flex h-16 w-16 flex-none items-center justify-center rounded-full bg-surface ring-4 ring-link/20">
                      <step.icon className="h-7 w-7 text-link" aria-hidden="true" />
                    </div>

                    <div className={`md:w-1/2 ${isLeft ? 'md:order-last' : 'md:order-first md:text-right'}`}>
                      <p className="text-sm text-body">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Why DoDAO */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Why protocol teams pick DoDAO</h2>
            <p className="mt-4 text-base text-body">You are picking the people who will look at your data every day. Three reasons teams choose us.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {whyDodao.map((b) => (
              <div key={b.title} className="flex flex-col rounded-2xl bg-bg p-6 ring-1 ring-border">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                  <b.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-heading">{b.title}</h3>
                <p className="mt-2 text-sm text-body">{b.description}</p>
              </div>
            ))}
          </div>

          {/* Final CTA */}
          <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary to-link p-8 text-center">
            <p className="text-base font-semibold text-primary-text">Want a dashboard that finally tells the truth about your protocol?</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              Tell us the decision you would like better data behind, and we will scope a pipeline and dashboard that delivers it.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:info@dodao.com"
                className="inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
              >
                <ChartBarSquareIcon className="h-4 w-4" aria-hidden="true" />
                Get a quote
              </a>
              <a
                href="/home-section/dodao-io/services/smart-contract"
                className="inline-flex items-center gap-x-2 rounded-xl bg-bg/30 px-5 py-2.5 text-sm font-semibold text-primary-text ring-1 ring-primary-text/30 hover:bg-bg/50 transition-colors"
              >
                <CodeBracketIcon className="h-4 w-4" aria-hidden="true" />
                See smart contracts
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DefiAnalytics;
