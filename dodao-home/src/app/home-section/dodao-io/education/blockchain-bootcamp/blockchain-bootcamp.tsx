import {
  AcademicCapIcon,
  ArrowsRightLeftIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CodeBracketIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  LightBulbIcon,
  PresentationChartLineIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

type Topic = {
  num: string;
  title: string;
  summary: string;
  level: 'foundation' | 'intermediate' | 'advanced';
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const curriculum: Topic[] = [
  {
    num: '01',
    title: 'Introduction to Blockchain',
    summary: 'The mental model — blocks, chains, consensus, finality — that everything else assumes you have already internalised.',
    level: 'foundation',
    icon: CubeTransparentIcon,
  },
  {
    num: '02',
    title: 'Navigating DeFi',
    summary: 'Lending, AMMs, stablecoins, restaking — the core mechanisms that turn a blockchain into a financial system.',
    level: 'foundation',
    icon: CurrencyDollarIcon,
  },
  {
    num: '03',
    title: 'Understanding NFTs',
    summary: 'Beyond profile pictures — ownership, royalties, and the genuine business use-cases hiding inside the format.',
    level: 'intermediate',
    icon: SparklesIcon,
  },
  {
    num: '04',
    title: 'Exploring Layer 2 Solutions',
    summary: 'Rollups, sequencers, data availability — the scalability stack that made blockchains usable at consumer prices.',
    level: 'intermediate',
    icon: BoltIcon,
  },
  {
    num: '05',
    title: 'Cross-chain Interactions',
    summary: 'Bridges, messaging, intent layers — the tradeoffs and risks of moving state and value across chains.',
    level: 'advanced',
    icon: ArrowsRightLeftIcon,
  },
  {
    num: '06',
    title: 'Web3 and Gaming',
    summary: 'How decentralised ownership and on-chain economies are reshaping game design, distribution, and player incentives.',
    level: 'advanced',
    icon: PuzzlePieceIcon,
  },
];

const methodology = [
  {
    title: 'In-depth modules',
    description: 'Every topic gets a deep, structured module — not a five-minute video pretending to be a course.',
    icon: AcademicCapIcon,
  },
  {
    title: 'Real case studies',
    description: 'Each concept lands against a real protocol or incident your team can study and learn from.',
    icon: PresentationChartLineIcon,
  },
  {
    title: 'Discussion + hands-on',
    description: 'Live discussion sessions and hands-on labs make sure the ideas survive contact with practice.',
    icon: ChatBubbleLeftRightIcon,
  },
];

const outcomes = [
  {
    metric: 'Robust',
    title: 'Mental model of blockchain mechanics',
    description: 'You can explain consensus, finality, gas, and bridging to a junior engineer without hand-waving.',
    icon: CubeTransparentIcon,
  },
  {
    metric: 'Working',
    title: 'Fluency across DeFi, NFTs, L2s',
    description: 'You can pick the right primitive for a problem instead of defaulting to “whatever this protocol uses.”',
    icon: CurrencyDollarIcon,
  },
  {
    metric: 'Ready',
    title: 'Cross-chain & Web3 confidence',
    description: 'You can scope a cross-chain or Web3-gaming initiative without underestimating the integration risk.',
    icon: ArrowsRightLeftIcon,
  },
];

const whyChoose = [
  {
    title: 'Competitive edge',
    description: 'Stay ahead of the curve in blockchain and DeFi — open up product opportunities your competitors cannot yet evaluate.',
    icon: RocketLaunchIcon,
  },
  {
    title: 'Team cohesion',
    description: 'Bring an entire team to the same understanding — no more uneven knowledge slowing every cross-functional decision.',
    icon: UserGroupIcon,
  },
  {
    title: 'Higher productivity',
    description: 'With a shared mental model, onboarding new hires and troubleshooting issues stops being a time sink.',
    icon: ArrowTrendingUpIcon,
  },
];

const levelClasses: Record<Topic['level'], { chip: string; ring: string; badge: string }> = {
  foundation: { chip: 'bg-success/15 text-success', ring: 'ring-success/30', badge: 'Foundation' },
  intermediate: { chip: 'bg-primary/15 text-primary', ring: 'ring-primary/30', badge: 'Intermediate' },
  advanced: { chip: 'bg-warning/15 text-warning', ring: 'ring-warning/30', badge: 'Advanced' },
};

function BlockchainBootcamp() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-bg">
        <div className="dodao-dot-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">Education · Blockchain</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  Blockchain Bootcamp: <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">basics to cross-chain</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  A structured journey through the six topics that turn engineers and operators into proficient builders in blockchain and DeFi. We tune each
                  session to your organization’s goals — generic theory only goes so far.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />6 modules
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <CubeTransparentIcon className="h-4 w-4" aria-hidden="true" />
                    DeFi + NFTs + L2
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <BuildingOfficeIcon className="h-4 w-4" aria-hidden="true" />
                    Tailored to your org
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    Enroll a team
                  </a>
                  <a
                    href="/home-section/dodao-io/education/educational-content"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    See custom content
                  </a>
                </div>
              </div>

              {/* Skill ladder */}
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-surface to-surface-2 p-6 ring-1 ring-border shadow-lg">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary">Skill ladder</p>
                  <div className="mt-4 space-y-3">
                    {(['foundation', 'intermediate', 'advanced'] as const).map((level) => (
                      <div key={level} className="rounded-xl bg-bg/60 p-3 ring-1 ring-border">
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${levelClasses[level].chip} ring-1 ${levelClasses[level].ring}`}
                          >
                            {levelClasses[level].badge}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">
                            {curriculum.filter((t) => t.level === level).length} module{curriculum.filter((t) => t.level === level).length === 1 ? '' : 's'}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-body">
                          {curriculum
                            .filter((t) => t.level === level)
                            .map((t) => t.title)
                            .join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 6 modules — interactive-feel grid */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">The six modules</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">From first block to cross-chain</h2>
            <p className="mt-4 text-base text-body">
              Six topics that take a team from “I have heard of blockchain” to “I can pick the right primitive for this business problem.”
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {curriculum.map((topic) => {
              const level = levelClasses[topic.level];
              return (
                <div key={topic.num} className="group relative flex flex-col rounded-2xl bg-bg p-6 ring-1 ring-border transition-colors hover:ring-primary/40">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                      <topic.icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="text-3xl font-bold text-primary/30">{topic.num}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-heading">{topic.title}</h3>
                  <p className="mt-1 text-sm text-body">{topic.summary}</p>
                  <span className={`mt-5 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${level.chip} ring-1 ${level.ring}`}>
                    {level.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Methodology — 3 step pipeline */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-link">How we teach it</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">A teaching method built around retention, not attendance</h2>
            <p className="mt-4 text-base text-body">
              We deliberately blend three modes so the concepts land — and stay landed — instead of dissolving the week after the session.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {methodology.map((m, i) => (
              <div key={m.title} className="relative flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-border">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-link text-bg shadow-lg">
                    <m.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-link">Step {i + 1}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-heading">{m.title}</h3>
                <p className="mt-2 text-sm text-body">{m.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Outcomes */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">What you walk away with</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Concrete outcomes, not just a certificate</h2>
            <p className="mt-4 text-base text-body">By the end of the bootcamp, three things should be true about every participant.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {outcomes.map((o) => (
              <div key={o.title} className="flex flex-col rounded-2xl bg-gradient-to-br from-primary/15 to-link/15 p-6 ring-1 ring-primary/30">
                <p className="text-xs uppercase tracking-widest font-semibold text-link">{o.metric}</p>
                <span className="mt-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                  <o.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-heading">{o.title}</h3>
                <p className="mt-2 text-sm text-body">{o.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why teams choose + CTA */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Why teams pick this bootcamp</h2>
            <p className="mt-4 text-base text-body">Three return-on-investment reasons leaders sign off on it.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {whyChoose.map((b) => (
              <div key={b.title} className="flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-border">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                  <b.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-heading">{b.title}</h3>
                <p className="mt-2 text-sm text-body">{b.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary to-link p-8 text-center">
            <p className="text-base font-semibold text-primary-text">Unlock blockchain fluency across your team</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              Each cohort is tailored to your organization’s goals and industry. We will help shape the curriculum so the bootcamp pays for itself.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:info@dodao.com"
                className="inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
              >
                <AcademicCapIcon className="h-4 w-4" aria-hidden="true" />
                Enroll your team
              </a>
              <a
                href="/home-section/dodao-io/education/educational-content"
                className="inline-flex items-center gap-x-2 rounded-xl bg-bg/30 px-5 py-2.5 text-sm font-semibold text-primary-text ring-1 ring-primary-text/30 hover:bg-bg/50 transition-colors"
              >
                <LightBulbIcon className="h-4 w-4" aria-hidden="true" />
                Or commission custom content
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockchainBootcamp;
