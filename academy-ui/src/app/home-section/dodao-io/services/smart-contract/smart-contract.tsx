import {
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ArrowTrendingDownIcon,
  ArrowUpRightIcon,
  BeakerIcon,
  CheckCircleIcon,
  CodeBracketIcon,
  CubeTransparentIcon,
  CurrencyDollarIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

type Service = {
  num: string;
  title: string;
  what: string;
  how: string;
  example: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const services: Service[] = [
  {
    num: '01',
    title: 'Custom smart contract development',
    what: 'Bespoke contracts written from scratch to fit your protocol.',
    how: 'Solidity (or Vyper) tailored to your business logic, with the right access control, accounting, and upgrade story baked in from day one.',
    example: 'A new DeFi product? We ship the contract that handles deposits, transactions, and rewards distribution under your specific rules.',
    icon: CodeBracketIcon,
  },
  {
    num: '02',
    title: 'Gas optimization',
    what: 'Refine and tighten existing contracts so they cost less to run.',
    how: 'Storage layout reshuffles, packed structs, custom errors, branchless arithmetic — every gas saving you would expect from a senior engineer.',
    example: 'Lending platforms: we restructure inner loops and storage so small, frequent positions become economical instead of getting priced out.',
    icon: ArrowTrendingDownIcon,
  },
  {
    num: '03',
    title: 'Smart contract audits',
    what: 'Thorough audits that find the bugs before users do.',
    how: 'Manual review by people who have shipped DeFi, plus targeted fuzz tests and invariant suites — not just a checklist with our logo on it.',
    example: 'About to upgrade your DeFi protocol? We audit the new contracts and ship a written, prioritised report of every issue we find.',
    icon: ShieldCheckIcon,
  },
  {
    num: '04',
    title: 'Upgrades & migrations',
    what: 'Extend live contracts to fit new features and new rules.',
    how: 'Safe upgrade paths via proxies, storage gaps, or full migrations — chosen for your contract, not as a one-size-fits-all template.',
    example: 'New compliance rules around user identity? We extend the contract to add the checks without disrupting existing positions.',
    icon: ArrowPathIcon,
  },
  {
    num: '05',
    title: 'Integration services',
    what: 'Wire your contracts up to oracles, bridges, and off-chain systems.',
    how: 'Chainlink, redstone, custom keepers, third-party APIs — whatever your contract needs to talk to, we plug it in and harden it.',
    example: 'Need real-time market data? We integrate oracle feeds so your DeFi platform reacts to price moves, not yesterday’s snapshot.',
    icon: ArrowsRightLeftIcon,
  },
  {
    num: '06',
    title: 'Deployment & maintenance',
    what: 'End-to-end shipping plus ongoing care after launch.',
    how: 'Multi-chain deployment scripts, post-mortems, monitoring dashboards, and a real human to call when something looks off.',
    example: 'After a token sale contract goes live, we watch it run and respond fast if anything breaks — instead of leaving you holding the keys.',
    icon: RocketLaunchIcon,
  },
];

const credibility = [
  { name: 'Compound', detail: 'Lending protocol' },
  { name: 'Uniswap', detail: 'DEX & AMMs' },
  { name: 'DeFi protocols', detail: 'Audits, tooling, dashboards' },
  { name: 'DAO tooling', detail: 'Governance & treasury' },
];

const whyDodao = [
  {
    title: 'Real DeFi experience',
    description: 'Our team has shipped against Compound and Uniswap, not just read their whitepapers.',
    icon: CubeTransparentIcon,
  },
  {
    title: 'Security first',
    description: 'We treat audits and invariants as part of the build, not as an afterthought before launch.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Long-term partner',
    description: 'You get the same engineers post-launch — for upgrades, monitoring, and incident response.',
    icon: SparklesIcon,
  },
];

function SmartContract() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-bg">
        <div className="dodao-dot-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">Blockchain · Smart contracts</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  Smart contracts, <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">battle-tested by design</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  We design, audit, and ship secure smart contracts for protocols, DAOs, and decentralized applications. Our team has worked alongside the
                  engineers who built Compound and Uniswap — that production experience shows up in every line of code we write for you.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    DeFi-experienced
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                    Audit-first
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <CurrencyDollarIcon className="h-4 w-4" aria-hidden="true" />
                    Gas-optimised
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    Get a contract scoped
                  </a>
                  <a
                    href="/home-section/dodao-io/services/defi-analytics"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    See DeFi analytics
                  </a>
                </div>
              </div>

              {/* Right side: credibility band */}
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-surface to-surface-2 p-6 ring-1 ring-border shadow-lg">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary">Where our experience comes from</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {credibility.map((c) => (
                      <div key={c.name} className="rounded-xl bg-bg/60 p-4 ring-1 ring-border">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary ring-1 ring-primary/30">
                            <CubeTransparentIcon className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <p className="text-sm font-semibold text-heading">{c.name}</p>
                        </div>
                        <p className="mt-2 text-xs text-muted">{c.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 6 services — spec-sheet style rows */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">Six ways we help</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">From a fresh contract to a live, optimised protocol</h2>
            <p className="mt-4 text-base text-body">
              Wherever your contract is in its lifecycle — design, optimisation, audit, upgrade, integration, deployment — we pick it up at that stage instead
              of forcing a full rebuild.
            </p>
          </div>

          <div className="mt-14 space-y-6">
            {services.map((s) => (
              <div key={s.num} className="grid grid-cols-1 gap-6 rounded-2xl bg-bg p-6 ring-1 ring-border lg:grid-cols-12 lg:items-start">
                {/* Left: number + icon */}
                <div className="flex items-start gap-4 lg:col-span-3">
                  <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                    <s.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-primary">{s.num}</p>
                    <h3 className="mt-1 text-lg font-semibold text-heading">{s.title}</h3>
                  </div>
                </div>

                {/* Middle: what & how */}
                <div className="space-y-3 lg:col-span-6">
                  <p className="text-sm text-body">
                    <span className="font-semibold text-heading">What it does. </span>
                    {s.what}
                  </p>
                  <p className="text-sm text-muted">
                    <span className="font-semibold text-heading">How we do it. </span>
                    {s.how}
                  </p>
                </div>

                {/* Right: example callout */}
                <div className="rounded-xl bg-link/10 p-4 ring-1 ring-link/30 lg:col-span-3">
                  <div className="flex items-center gap-2">
                    <BeakerIcon className="h-4 w-4 text-link" aria-hidden="true" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-link">Example</p>
                  </div>
                  <p className="mt-2 text-xs text-body">{s.example}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why DoDAO */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Why teams pick DoDAO for smart contracts</h2>
            <p className="mt-4 text-base text-body">
              You are picking a long-term partner for code that will hold real value. Three things make us a safe bet on that.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {whyDodao.map((b) => (
              <div key={b.title} className="flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-border">
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
            <p className="text-base font-semibold text-primary-text">Have a contract idea — or a contract problem?</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              Whether you are about to ship a new protocol or you inherited one that needs to be safer and cheaper, we will pick it up from wherever you are.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:info@dodao.com"
                className="inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
              >
                <WrenchScrewdriverIcon className="h-4 w-4" aria-hidden="true" />
                Talk to an engineer
              </a>
              <a
                href="/home-section/dodao-io/services/defi-analytics"
                className="inline-flex items-center gap-x-2 rounded-xl bg-bg/30 px-5 py-2.5 text-sm font-semibold text-primary-text ring-1 ring-primary-text/30 hover:bg-bg/50 transition-colors"
              >
                <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
                See DeFi analytics
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SmartContract;
