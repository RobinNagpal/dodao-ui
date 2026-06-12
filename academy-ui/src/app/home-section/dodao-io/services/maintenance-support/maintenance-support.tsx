import {
  AcademicCapIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  BellAlertIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  CpuChipIcon,
  HandRaisedIcon,
  LifebuoyIcon,
  RocketLaunchIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

type Pillar = {
  key: string;
  title: string;
  short: string;
  detail: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const pillars: Pillar[] = [
  {
    key: 'guidance',
    title: 'Functionality guidance',
    short: 'We walk your team through the full surface area of the agent.',
    detail: 'New hires get up to speed quickly, and your power-users discover capabilities they would otherwise miss in the docs.',
    icon: AcademicCapIcon,
  },
  {
    key: 'troubleshooting',
    title: 'Troubleshooting',
    short: 'When the agent stalls, mis-routes, or errors, we get to root cause fast.',
    detail: 'Most issues are resolved in the same business day, with a written note so the same class of bug never bites you twice.',
    icon: WrenchScrewdriverIcon,
  },
  {
    key: 'fine-tuning',
    title: 'Fine-tuning',
    short: 'We retune prompts, tools, and policies as your workflows evolve.',
    detail: 'When real usage drifts from what the agent was designed for, we adjust — instead of letting quality silently decay.',
    icon: Cog6ToothIcon,
  },
  {
    key: 'expansion',
    title: 'Capability expansion',
    short: 'Bolt on new tools, data sources, and skills as your business grows.',
    detail: 'The agent grows with you — new SaaS in your stack, new use-cases on your roadmap, all wired up without a rebuild.',
    icon: ArrowTrendingUpIcon,
  },
  {
    key: 'updates',
    title: 'Regular updates',
    short: 'New model releases, new tool versions, new best practices — applied for you.',
    detail: 'The AI ecosystem ships breaking changes every quarter. We track them so your team can keep shipping product instead.',
    icon: ArrowPathIcon,
  },
];

type SupportStep = {
  num: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const supportCycle: SupportStep[] = [
  {
    num: '01',
    title: 'Monitor',
    description: 'We watch error rates, response quality, and tool failures across every agent run.',
    icon: BellAlertIcon,
  },
  {
    num: '02',
    title: 'Triage',
    description: 'Every alert is classified — bug, drift, infra, or genuine new requirement — and routed to the right fix.',
    icon: HandRaisedIcon,
  },
  {
    num: '03',
    title: 'Patch',
    description: 'We ship the fix, write the regression, and verify the change in your environment, not just ours.',
    icon: WrenchScrewdriverIcon,
  },
  {
    num: '04',
    title: 'Improve',
    description: 'Every quarter we land planned upgrades — new tools, sharper prompts, new model versions.',
    icon: RocketLaunchIcon,
  },
];

const promises = [
  { stat: '24/7', label: 'Live monitoring', description: 'Your agent does not get to fail quietly overnight.' },
  { stat: '<24h', label: 'Triage on incidents', description: 'You hear back from us before the next user complains.' },
  { stat: '90d', label: 'Planned upgrade cadence', description: 'Roadmapped improvements every quarter, not just reactive fixes.' },
];

function MaintenanceSupport() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-bg">
        <div className="dodao-dot-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">AI Agents · Long-term partnership</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  Maintenance & Support, <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">built into the deal</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  An AI agent is not a one-time delivery — it is a living system that needs to keep up with new models, new tools, and the way your business
                  actually uses it. We stay on after launch, so the agent you shipped on day one is still the best version of itself a year in.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Always-on monitoring
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <ClockIcon className="h-4 w-4" aria-hidden="true" />
                    Same-day triage
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <RocketLaunchIcon className="h-4 w-4" aria-hidden="true" />
                    Quarterly upgrades
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    Start a support plan
                  </a>
                  <a
                    href="/home-section/dodao-io/services/custom-ai-agent-dev"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    Building a new agent?
                  </a>
                </div>
              </div>

              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-surface to-surface-2 p-6 ring-1 ring-border shadow-lg">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary">Our promise</p>
                  <div className="mt-4 space-y-3">
                    {promises.map((p) => (
                      <div key={p.label} className="flex items-center gap-4 rounded-xl bg-bg/60 p-3 ring-1 ring-border">
                        <p className="w-16 flex-none text-2xl font-bold text-primary text-center">{p.stat}</p>
                        <div className="flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-heading">{p.label}</p>
                          <p className="mt-0.5 text-xs text-body">{p.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 5 Pillars */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">Five pillars of support</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">What our support actually covers</h2>
            <p className="mt-4 text-base text-body">
              We do not hide behind vague SLAs. Here is exactly what is on the table when you sign a support plan with us — and what each pillar means in
              practice.
            </p>
          </div>

          {/* Asymmetric pillar grid: feature pillar #1 wide, others 2x2 */}
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Featured first pillar */}
            {(() => {
              const featured = pillars[0];
              const FeaturedIcon = featured.icon;
              return (
                <div className="relative flex flex-col rounded-2xl bg-gradient-to-br from-primary/15 to-link/15 p-6 ring-1 ring-primary/30 lg:row-span-2">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                    <FeaturedIcon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-semibold text-heading">{featured.title}</h3>
                  <p className="mt-2 text-sm text-body">{featured.short}</p>
                  <p className="mt-4 text-sm text-muted">{featured.detail}</p>
                  <div className="mt-auto pt-6">
                    <span className="inline-flex items-center gap-x-1.5 rounded-full bg-bg/40 px-2.5 py-1 text-xs font-semibold text-primary ring-1 ring-primary/30">
                      Pillar 01
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Remaining 4 in 2x2 */}
            {pillars.slice(1).map((p, i) => (
              <div key={p.key} className="flex flex-col rounded-2xl bg-bg p-6 ring-1 ring-border">
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/30">
                    <p.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">Pillar 0{i + 2}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-heading">{p.title}</h3>
                <p className="mt-1 text-sm text-body">{p.short}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support cycle — horizontal flow */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-link">The support loop</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">How a typical month looks</h2>
            <p className="mt-4 text-base text-body">
              Most months are quiet — monitor, triage the rare incident, ship a planned improvement. The loop is intentionally small so nothing falls through.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-4 md:items-stretch">
            {supportCycle.map((step, i) => (
              <div key={step.num} className="relative flex h-full">
                <div className="flex h-full w-full flex-col items-start rounded-2xl bg-surface p-6 ring-1 ring-border">
                  <div className="flex w-full items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-3xl font-bold text-primary/40">{step.num}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-heading">{step.title}</h3>
                  <p className="mt-1 text-sm text-body">{step.description}</p>
                </div>
                {i < supportCycle.length - 1 && (
                  <div
                    className="absolute top-1/2 -right-5 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-bg ring-1 ring-primary/30 md:flex"
                    aria-hidden="true"
                  >
                    <ArrowRightIcon className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-bg pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-primary to-link p-8 text-center">
            <p className="text-base font-semibold text-primary-text">Already running an agent and worried about drift?</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              We pick up agents that were built by other vendors all the time. Tell us what is running and what is breaking, and we will scope a take-over plan.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:info@dodao.com"
                className="inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
              >
                <LifebuoyIcon className="h-4 w-4" aria-hidden="true" />
                Get a support quote
              </a>
              <a
                href="/home-section/dodao-io/services/custom-ai-agent-dev"
                className="inline-flex items-center gap-x-2 rounded-xl bg-bg/30 px-5 py-2.5 text-sm font-semibold text-primary-text ring-1 ring-primary-text/30 hover:bg-bg/50 transition-colors"
              >
                <CpuChipIcon className="h-4 w-4" aria-hidden="true" />
                See agent development
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MaintenanceSupport;
