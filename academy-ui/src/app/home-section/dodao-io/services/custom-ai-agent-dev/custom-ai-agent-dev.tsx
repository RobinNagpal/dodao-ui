import {
  AdjustmentsHorizontalIcon,
  ArrowPathRoundedSquareIcon,
  ArrowTrendingUpIcon,
  BoltIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  EyeIcon,
  LightBulbIcon,
  PencilSquareIcon,
  PlayCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const capabilities = [
  {
    name: 'Answer queries and run support',
    description: 'Field user questions, resolve tickets, and hand off only the cases that genuinely need a human.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: 'Read complex financial data',
    description: 'Pull numbers out of filings, statements, and spreadsheets and surface the lines that actually matter.',
    icon: ChartBarIcon,
  },
  {
    name: 'Suggest concrete improvements',
    description: 'Turn raw analysis into clear, prioritised recommendations your team can act on the same day.',
    icon: LightBulbIcon,
  },
  {
    name: 'Automate repetitive cognitive work',
    description: 'Take over the tasks that drain your team — reviews, classifications, lookups — and free them for real strategy.',
    icon: ArrowPathRoundedSquareIcon,
  },
];

type Step = {
  num: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  tone: 'primary' | 'link' | 'success' | 'warning';
};

const lifecycle: Step[] = [
  {
    num: '01',
    title: 'Receive instructions',
    description: 'A user, another agent, or a scheduled trigger hands the agent a prompt or task.',
    icon: PencilSquareIcon,
    tone: 'primary',
  },
  {
    num: '02',
    title: 'Perceive the environment',
    description: 'The agent pulls in context from your data, APIs, and tools — the same way a junior analyst would gather background.',
    icon: EyeIcon,
    tone: 'link',
  },
  {
    num: '03',
    title: 'Set a clear goal',
    description: 'It pins down exactly what success looks like and breaks the goal into smaller, addressable sub-goals.',
    icon: SparklesIcon,
    tone: 'primary',
  },
  {
    num: '04',
    title: 'Plan the work',
    description: 'A strategy is drafted — which tools to call, in what order, with what guardrails — before any action is taken.',
    icon: AdjustmentsHorizontalIcon,
    tone: 'success',
  },
  {
    num: '05',
    title: 'Decide on the best path',
    description: 'For each step, the agent compares options and picks the path most likely to reach the goal cheaply and safely.',
    icon: LightBulbIcon,
    tone: 'warning',
  },
  {
    num: '06',
    title: 'Execute',
    description: 'It calls the right tools, writes the right outputs, and updates the right systems — all under your audit trail.',
    icon: BoltIcon,
    tone: 'link',
  },
  {
    num: '07',
    title: 'Learn from feedback',
    description: 'Outcomes are scored and fed back so the next run is faster, cheaper, and more accurate than the last.',
    icon: ArrowTrendingUpIcon,
    tone: 'primary',
  },
];

const benefits = [
  {
    title: 'Reclaim hours your team is losing',
    description:
      'Reasoning, problem-solving, and data work happen in the background, so your team gets back to the high-leverage decisions you actually hired them for.',
    icon: ArrowTrendingUpIcon,
  },
  {
    title: 'Lower operating cost per task',
    description: 'An agent runs on tokens, not on headcount. The unit cost of cognitive work drops to a fraction of what a human-only workflow charges.',
    icon: CurrencyDollarIcon,
  },
  {
    title: 'Stay ahead of competitors already using AI',
    description: 'AI agents are no longer a luxury — most of your competition is already integrating them. We help you ship before that gap widens.',
    icon: SparklesIcon,
  },
];

const toneToRail: Record<Step['tone'], string> = {
  primary: 'bg-primary',
  link: 'bg-link',
  success: 'bg-success',
  warning: 'bg-warning',
};

const toneToText: Record<Step['tone'], string> = {
  primary: 'text-primary',
  link: 'text-link',
  success: 'text-success',
  warning: 'text-warning',
};

const toneToRing: Record<Step['tone'], string> = {
  primary: 'ring-primary/30',
  link: 'ring-link/30',
  success: 'ring-success/30',
  warning: 'ring-warning/30',
};

function CustomAiAgentDev() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-bg">
        <div className="dodao-dot-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">AI Agents · Custom Development</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  AI Agents, built around <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">your business</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  We design and ship custom AI agents that automate the slow, repetitive parts of your operation — agents that perceive your data, plan their
                  work, take action, and learn from every run. The result is a team that ships more, with fewer late nights.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Goal-driven
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                    Tool-using
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <ArrowTrendingUpIcon className="h-4 w-4" aria-hidden="true" />
                    Learns over time
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    Talk to us about an agent
                  </a>
                  <a
                    href="/home-section/dodao-io/services/maintenance-support"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    See our support service
                  </a>
                </div>
              </div>

              {/* Preview card — anatomy of an agent */}
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-surface to-surface-2 p-6 ring-1 ring-border shadow-lg">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary">Anatomy of an AI Agent</p>
                  <div className="mt-4 space-y-3">
                    {[
                      { label: 'Goal', value: 'What success looks like' },
                      { label: 'Tools', value: 'APIs, DBs, your stack' },
                      { label: 'Memory', value: 'What it has seen before' },
                      { label: 'Reasoning', value: 'How it decides next move' },
                      { label: 'Action', value: 'What it changes in the world' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between rounded-lg bg-bg/60 px-3 py-2 ring-1 ring-border">
                        <span className="text-xs font-semibold uppercase tracking-wide text-primary">{row.label}</span>
                        <span className="text-sm text-body">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* What is an AI Agent? */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-primary">The short definition</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">What is an AI agent, really?</h2>
              <p className="mt-4 text-base text-body">
                An AI agent is an autonomous system that perceives its environment, makes decisions, and takes actions with little to no human in the loop. It
                is built to simulate the way a person actually solves problems — observe, plan, act, learn — so your business can run more of its day-to-day
                cognitive work on autopilot.
              </p>
              <p className="mt-3 text-base text-body">
                The bar we hold ourselves to: an agent we build should be something you would happily put in front of a real customer or a real spreadsheet
                without hovering over it.
              </p>
            </div>

            <div className="relative rounded-2xl bg-bg p-6 ring-1 ring-border">
              <p className="text-xs uppercase tracking-widest font-semibold text-link">Not just a chatbot</p>
              <div className="mt-4 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-success" aria-hidden="true" />
                  <p className="text-sm text-body">
                    <span className="font-semibold text-heading">Acts</span>, not just answers. An agent calls APIs, writes records, and triggers workflows.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-success" aria-hidden="true" />
                  <p className="text-sm text-body">
                    <span className="font-semibold text-heading">Plans ahead</span>. It breaks one big goal into a sequence of small, checkable steps.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-success" aria-hidden="true" />
                  <p className="text-sm text-body">
                    <span className="font-semibold text-heading">Tracks state</span>. It remembers what happened earlier in the conversation and across runs.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-success" aria-hidden="true" />
                  <p className="text-sm text-body">
                    <span className="font-semibold text-heading">Improves</span>. Every run leaves a feedback trail the next run can learn from.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">What an AI agent can do for you</h2>
            <p className="mt-4 text-base text-body">
              Agents shine on the cognitive, repetitive work that consumes your team without producing differentiation. A short and grounded list:
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {capabilities.map((c) => (
              <div key={c.name} className="flex gap-5 rounded-2xl bg-surface p-6 ring-1 ring-border">
                <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                  <c.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-heading">{c.name}</h3>
                  <p className="mt-1 text-sm text-body">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How an AI Agent Works — vertical zigzag timeline */}
      <div className="relative overflow-hidden bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">The seven-stage loop</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">How an AI agent actually works</h2>
            <p className="mt-4 text-base text-body">
              Every agent we ship runs this loop — instruction in, action out, feedback back in. The stages are simple; the engineering is in making each one
              fast, observable, and safe.
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-4xl">
            <div aria-hidden="true" className="absolute left-1/2 top-0 bottom-0 hidden w-0.5 -translate-x-1/2 bg-primary/20 md:block" />

            <div className="relative space-y-10 md:space-y-12">
              {lifecycle.map((step, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={step.num} className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
                    <div className={`md:w-1/2 ${isLeft ? 'md:order-first md:text-right' : 'md:order-last'}`}>
                      <span
                        className={`inline-flex items-center rounded-full bg-bg px-2.5 py-1 text-xs font-semibold ${toneToText[step.tone]} ring-1 ${
                          toneToRing[step.tone]
                        }`}
                      >
                        {step.num}
                      </span>
                      <h3 className="mt-2 text-xl font-semibold text-heading">{step.title}</h3>
                      <p className="mt-1 text-sm text-body">{step.description}</p>
                    </div>

                    <div className="relative z-10 flex h-16 w-16 flex-none items-center justify-center rounded-full bg-bg ring-4 ring-primary/20">
                      <span className={`absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full ${toneToRail[step.tone]}`} aria-hidden="true" />
                      <step.icon className={`h-7 w-7 ${toneToText[step.tone]}`} aria-hidden="true" />
                    </div>

                    <div className={`md:w-1/2 ${isLeft ? 'md:order-last' : 'md:order-first md:text-right'}`} aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* KoalaGains callout — we use this on our own product */}
      <div className="bg-bg py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-link/15 to-primary/10 p-8 ring-1 ring-link/30">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-2 flex justify-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-link/20 text-link ring-1 ring-link/40">
                  <ChartBarIcon className="h-8 w-8" aria-hidden="true" />
                </span>
              </div>
              <div className="lg:col-span-7">
                <p className="text-xs uppercase tracking-widest font-semibold text-link">Built on our own playbook</p>
                <h3 className="mt-1 text-xl font-semibold text-heading">KoalaGains is one of our agents in production</h3>
                <p className="mt-2 text-sm text-body">
                  KoalaGains — our flagship AI investment platform — runs the same seven-stage loop you just read about. Agents read SEC filings, score risks,
                  and surface insights for investors every day. The agents we ship for you go through the same engineering bar.
                </p>
              </div>
              <div className="lg:col-span-3">
                <a
                  href="/home-section/dodao-io/products/koalagains"
                  className="inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-link px-4 py-2.5 text-sm font-semibold text-bg shadow-sm hover:bg-link/85 transition-colors"
                >
                  <ChartBarIcon className="h-4 w-4" aria-hidden="true" />
                  See KoalaGains
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why integrate — benefits */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Why integrate an AI agent now</h2>
            <p className="mt-4 text-base text-body">
              In a market where most of your competition is already deploying AI, doing nothing is the risky move. Agents are how cognitive work scales in 2026
              without scaling headcount.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {benefits.map((b) => (
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
            <p className="text-base font-semibold text-primary-text">Ready to put an agent on your hardest workflow?</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              Tell us the task you would most like to never do again. We will scope an agent for it, build the first version, and ship it into your stack.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:info@dodao.com"
                className="inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
              >
                <CpuChipIcon className="h-4 w-4" aria-hidden="true" />
                Get started
              </a>
              <a
                href="/home-section/dodao-io/services/maintenance-support"
                className="inline-flex items-center gap-x-2 rounded-xl bg-bg/30 px-5 py-2.5 text-sm font-semibold text-primary-text ring-1 ring-primary-text/30 hover:bg-bg/50 transition-colors"
              >
                <PlayCircleIcon className="h-4 w-4" aria-hidden="true" />
                See ongoing support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomAiAgentDev;
