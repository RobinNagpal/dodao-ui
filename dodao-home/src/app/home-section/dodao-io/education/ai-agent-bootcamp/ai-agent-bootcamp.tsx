import {
  AcademicCapIcon,
  ArrowRightIcon,
  ArrowTrendingUpIcon,
  BeakerIcon,
  BoltIcon,
  BookOpenIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CodeBracketIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const heroStats = [
  { value: '5', label: 'Module learning path' },
  { value: '10×', label: 'Productivity gain' },
  { value: 'Live', label: 'Real-world projects' },
  { value: 'Lifelong', label: 'Follow-up support' },
];

const whyLearn = [
  {
    title: 'Reclaim hours every week',
    description: 'Once you can build agents, the slow cognitive parts of your job take minutes instead of mornings — up to 10× more time back.',
    icon: ArrowTrendingUpIcon,
  },
  {
    title: 'Future-proof your career',
    description: 'AI is rewriting how every industry works. Knowing how to design and ship agents puts you on the right side of that shift.',
    icon: SparklesIcon,
  },
  {
    title: 'Build things that matter',
    description: 'Finance, support, research, ops — the same agent-design playbook works wherever cognitive work is the bottleneck.',
    icon: RocketLaunchIcon,
  },
];

const overview = [
  {
    title: 'Hands-on labs',
    description: 'Every concept lands in a lab where you actually build the agent — no passive lectures, no hypothetical examples.',
    icon: BeakerIcon,
  },
  {
    title: 'Curriculum tuned to your team',
    description: 'We adapt module weights and example scenarios to what your team or company actually does day to day.',
    icon: PuzzlePieceIcon,
  },
  {
    title: 'Live data, not toy demos',
    description: 'Final projects deploy against real systems and live data — production-shaped, not slide-shaped.',
    icon: BoltIcon,
  },
  {
    title: 'Follow-up sessions',
    description: 'After the bootcamp ends, we stick around for follow-up reviews to refine the agents you took home.',
    icon: ClockIcon,
  },
];

type Module = {
  num: string;
  title: string;
  outcome: string;
  topics: string[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const learningPath: Module[] = [
  {
    num: '01',
    title: 'LLM fundamentals',
    outcome: 'You stop treating models as black boxes and start reasoning about token economics, context limits, and where they fail.',
    topics: ['How an LLM actually generates', 'Token + cost mental model', 'When LLMs are the wrong tool'],
    icon: CpuChipIcon,
  },
  {
    num: '02',
    title: 'Advanced prompt engineering',
    outcome: 'You can take a vague task and craft a prompt that returns reliable, structured output the first time — not the fifth.',
    topics: ['Few-shot and chain-of-thought', 'Structured output and JSON modes', 'Eval-driven iteration'],
    icon: ChatBubbleLeftRightIcon,
  },
  {
    num: '03',
    title: 'Agent architecture & design',
    outcome: 'You can sketch an agent that uses tools, holds memory, and runs a planning loop — without copying a tutorial.',
    topics: ['Goals, memory, tools', 'Planning loops + ReAct', 'Multi-agent patterns'],
    icon: CubeTransparentIcon,
  },
  {
    num: '04',
    title: 'Value-driven use cases',
    outcome: 'You can pick the right business problem for an agent — the one where the ROI is obvious and the failure cost is bounded.',
    topics: ['ROI framing', 'Risk-adjusted task selection', 'When to keep a human in the loop'],
    icon: ChartBarIcon,
  },
  {
    num: '05',
    title: 'Testing, monitoring & optimization',
    outcome: 'You can ship an agent to production with real eval coverage, observability, and a plan for tuning it after launch.',
    topics: ['Eval suites + golden sets', 'Observability + tracing', 'Latency and cost tuning'],
    icon: WrenchScrewdriverIcon,
  },
];

const audiences = [
  {
    title: 'Enterprises',
    description: 'Upskill an internal team so you stop sending agent work to external vendors. Curriculum is tuned to your stack and workflows.',
    icon: BuildingOfficeIcon,
    chip: 'Team',
  },
  {
    title: 'Universities',
    description: 'Equip CS, business, and engineering students with the agent skills hiring managers are starting to expect by default.',
    icon: AcademicCapIcon,
    chip: 'Cohort',
  },
  {
    title: 'Developers',
    description: 'Add agent-design to your toolkit so you can take on AI-shaped work without learning it on someone else’s production system.',
    icon: CodeBracketIcon,
    chip: 'Individual',
  },
];

function AiAgentBootcamp() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-bg">
        <div className="dodao-dot-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">Education · AI Agents</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  AI Agent Bootcamp: <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">build agents people use</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  End-to-end agent development — from LLM fundamentals and prompt engineering through to architecture, deployment, and ongoing tuning. By the
                  end you will have shipped a working agent against a real workflow, not a toy demo.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Hands-on labs
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <PuzzlePieceIcon className="h-4 w-4" aria-hidden="true" />
                    Custom curriculum
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <BoltIcon className="h-4 w-4" aria-hidden="true" />
                    Real-world cases
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    Book a cohort
                  </a>
                  <a
                    href="/home-section/dodao-io/education/prompt-engineering-guide"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    Start with prompt engineering
                  </a>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
                  {heroStats.map((s) => (
                    <div key={s.label} className="text-center sm:text-left">
                      <p className="text-3xl font-bold text-heading">{s.value}</p>
                      <p className="mt-1 text-xs text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right side: curriculum at a glance */}
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-surface to-surface-2 p-6 ring-1 ring-border shadow-lg">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary">Curriculum at a glance</p>
                  <ol className="mt-4 space-y-2">
                    {learningPath.map((m) => (
                      <li key={m.num} className="flex items-center gap-3 rounded-lg bg-bg/60 px-3 py-2 ring-1 ring-border">
                        <span className="inline-flex h-6 w-6 flex-none items-center justify-center rounded-md bg-primary/15 text-xs font-semibold text-primary ring-1 ring-primary/30">
                          {m.num}
                        </span>
                        <p className="text-sm text-heading">{m.title}</p>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 rounded-xl bg-link/10 p-3 ring-1 ring-link/30">
                    <p className="text-xs text-body">
                      <span className="font-semibold text-link">Bonus.</span> Final projects ship on top of KoalaGains — our flagship AI investment platform —
                      so you build on real data and real evals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Why learn */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">Why now</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">What you actually get from learning AI agents</h2>
            <p className="mt-4 text-base text-body">
              Three concrete reasons people show up — and walk away with very different skills than a generic AI course would have given them.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {whyLearn.map((b) => (
              <div key={b.title} className="flex flex-col rounded-2xl bg-bg p-6 ring-1 ring-border">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                  <b.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-heading">{b.title}</h3>
                <p className="mt-2 text-sm text-body">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bootcamp overview — 4 feature cards */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-link">How the bootcamp runs</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Built around shipping, not slides</h2>
            <p className="mt-4 text-base text-body">Four structural choices that make this bootcamp different from a typical online course.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {overview.map((f) => (
              <div key={f.title} className="flex gap-5 rounded-2xl bg-surface p-6 ring-1 ring-border">
                <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-link/15 text-link ring-1 ring-link/30">
                  <f.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-heading">{f.title}</h3>
                  <p className="mt-1 text-sm text-body">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Learning path — vertical timeline (left rail, single column) */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">The five-module path</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">How you progress, module by module</h2>
            <p className="mt-4 text-base text-body">Each module ends with a concrete outcome — something you can do, not just something you have seen.</p>
          </div>

          <div className="relative mx-auto mt-16 max-w-3xl">
            <div aria-hidden="true" className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 via-link/40 to-primary/40" />

            <div className="space-y-10">
              {learningPath.map((m) => (
                <div key={m.num} className="relative flex items-start gap-6">
                  <div className="relative z-10 flex h-16 w-16 flex-none items-center justify-center rounded-full bg-bg ring-4 ring-primary/30">
                    <m.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex-1 rounded-2xl bg-bg p-5 ring-1 ring-border">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Module {m.num}</p>
                      <ArrowRightIcon className="h-4 w-4 text-muted" aria-hidden="true" />
                    </div>
                    <h3 className="mt-1 text-lg font-semibold text-heading">{m.title}</h3>
                    <p className="mt-2 text-sm text-body">{m.outcome}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {m.topics.map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/30"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KoalaGains callout + Audiences + CTA */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* KoalaGains callout */}
          <div className="rounded-2xl bg-gradient-to-br from-link/15 to-primary/10 p-8 ring-1 ring-link/30">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-2 flex justify-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-link/20 text-link ring-1 ring-link/40">
                  <ChartBarIcon className="h-8 w-8" aria-hidden="true" />
                </span>
              </div>
              <div className="lg:col-span-7">
                <p className="text-xs uppercase tracking-widest font-semibold text-link">Practice on real ground</p>
                <h3 className="mt-1 text-xl font-semibold text-heading">Final projects ship on KoalaGains</h3>
                <p className="mt-2 text-sm text-body">
                  KoalaGains — DoDAO’s flagship AI investment platform — provides the live data, report generation, and visual analytics you build against. You
                  end the bootcamp with an agent running on a real-world data stack, not a sandbox.
                </p>
              </div>
              <div className="lg:col-span-3">
                <a
                  href="/home-section/dodao-io/products/koalagains"
                  className="inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-link px-4 py-2.5 text-sm font-semibold text-bg shadow-sm hover:bg-link/85 transition-colors"
                >
                  <BookOpenIcon className="h-4 w-4" aria-hidden="true" />
                  See KoalaGains
                </a>
              </div>
            </div>
          </div>

          {/* Audiences */}
          <div className="mt-16">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Who shows up</h2>
              <p className="mt-4 text-base text-body">
                The same curriculum is tuned three different ways depending on whether you bring a team, a class, or just yourself.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {audiences.map((a) => (
                <div key={a.title} className="relative flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-border">
                  <span className="absolute top-4 right-4 inline-flex items-center rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary ring-1 ring-primary/30">
                    {a.chip}
                  </span>
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                    <a.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-heading">{a.title}</h3>
                  <p className="mt-2 text-sm text-body">{a.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary to-link p-8 text-center">
            <p className="text-base font-semibold text-primary-text">Bring the bootcamp to your team</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              We will tailor the modules, scenarios, and final project to what your organization actually needs to ship.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:info@dodao.com"
                className="inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
              >
                <UserGroupIcon className="h-4 w-4" aria-hidden="true" />
                Talk to us about a cohort
              </a>
              <a
                href="/home-section/dodao-io/education/prompt-engineering-guide"
                className="inline-flex items-center gap-x-2 rounded-xl bg-bg/30 px-5 py-2.5 text-sm font-semibold text-primary-text ring-1 ring-primary-text/30 hover:bg-bg/50 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4" aria-hidden="true" />
                Prompt engineering guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AiAgentBootcamp;
