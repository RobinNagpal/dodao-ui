import {
  AcademicCapIcon,
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  BeakerIcon,
  BoltIcon,
  BookOpenIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CodeBracketIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  PuzzlePieceIcon,
  RectangleStackIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const whyMatters = [
  {
    title: 'Better outcomes',
    description: 'A precise prompt gets a precise answer. Quality goes up, hallucinations go down, and reviews stop being rewrites.',
    icon: SparklesIcon,
    accent: 'primary',
  },
  {
    title: 'Lower cost per call',
    description: 'Tight prompts use fewer tokens. Over thousands of calls per day, that turns into a real line item back in your budget.',
    icon: CurrencyDollarIcon,
    accent: 'link',
  },
  {
    title: 'Faster iteration',
    description: 'Clear instructions and good examples cut the trial-and-error loop from days to hours.',
    icon: BoltIcon,
    accent: 'success',
  },
] as const;

type Module = {
  num: string;
  title: string;
  summary: string;
  highlights: string[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const modules: Module[] = [
  {
    num: '01',
    title: 'Introduction to prompt engineering',
    summary: 'Why prompts are leverage — and where the biggest wins come from on day one.',
    highlights: ['What a prompt actually is', 'Why it matters more than model choice', 'The cost of a bad prompt'],
    icon: BookOpenIcon,
  },
  {
    num: '02',
    title: 'Anatomy of a prompt',
    summary: 'The five-part skeleton every reliable prompt has — context, instruction, input, examples, output format.',
    highlights: ['Context vs instruction', 'Examples and shot count', 'Specifying output schema'],
    icon: RectangleStackIcon,
  },
  {
    num: '03',
    title: 'Core principles',
    summary: 'The non-negotiables: clarity, specificity, structure, and the discipline of showing instead of telling.',
    highlights: ['Clarity over cleverness', 'Specificity tightens output', 'Structure beats prose'],
    icon: PuzzlePieceIcon,
  },
  {
    num: '04',
    title: 'Advanced techniques',
    summary: 'Once the basics work, this is where you compound. Zero-shot, few-shot, chain-of-thought, prompt chaining.',
    highlights: ['Few-shot patterns', 'Chain-of-thought when it helps', 'Prompt chains that compose'],
    icon: CpuChipIcon,
  },
  {
    num: '05',
    title: 'Iteration strategies',
    summary: 'How to compress without losing accuracy, refine without regressing, and verify outputs at scale.',
    highlights: ['Compression without loss', 'Refinement loops', 'Verification at scale'],
    icon: AdjustmentsHorizontalIcon,
  },
];

const anatomy = [
  { label: 'Context', value: 'Who the AI is and the world it operates in.' },
  { label: 'Instruction', value: 'The specific task — phrased as an action.' },
  { label: 'Input', value: 'The actual content the AI needs to operate on.' },
  { label: 'Examples', value: 'One or more known-good input → output pairs.' },
  { label: 'Output format', value: 'JSON, markdown, schema — whatever downstream consumers expect.' },
];

const audiences = [
  {
    title: 'AI developers & engineers',
    description: 'Cut your debugging loops. Ship features that work first time instead of after seven prompt tweaks.',
    icon: CodeBracketIcon,
  },
  {
    title: 'Product managers',
    description: 'Write requirements precise enough that engineering can implement them — and AI can execute them — without back-and-forth.',
    icon: ClipboardDocumentCheckIcon,
  },
  {
    title: 'Researchers & analysts',
    description: 'Get structured, reproducible outputs from LLMs instead of long prose you have to manually parse every time.',
    icon: ChartBarIcon,
  },
];

const accentToBg = {
  primary: 'bg-primary/15',
  link: 'bg-link/15',
  success: 'bg-success/15',
  warning: 'bg-warning/15',
} as const;

const accentToText = {
  primary: 'text-primary',
  link: 'text-link',
  success: 'text-success',
  warning: 'text-warning',
} as const;

const accentToRing = {
  primary: 'ring-primary/30',
  link: 'ring-link/30',
  success: 'ring-success/30',
  warning: 'ring-warning/30',
} as const;

function PromptEngineeringGuide() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-bg">
        <div className="dodao-dot-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">Education · Prompt Engineering</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  Prompt engineering, <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">demystified</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  Five modules that take you from “the AI ignored my instructions again” to writing clear, structured, cost-aware prompts that get usable output
                  the first time — every time.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />5 modules
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <CurrencyDollarIcon className="h-4 w-4" aria-hidden="true" />
                    Cost-aware
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                    Practical-first
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    Get the guide
                  </a>
                  <a
                    href="/home-section/dodao-io/education/ai-agent-bootcamp"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    See AI Agent Bootcamp
                  </a>
                </div>
              </div>

              {/* Mock prompt card */}
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-surface to-surface-2 p-5 ring-1 ring-border shadow-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-widest font-semibold text-primary">Sample prompt</p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted">v3 · 38 tokens</span>
                  </div>
                  <div className="mt-3 rounded-xl bg-bg/70 p-4 font-mono text-xs leading-relaxed ring-1 ring-border">
                    <p>
                      <span className="text-primary">## Context</span>
                      <br />
                      You are an SEC filings analyst.
                    </p>
                    <p className="mt-2">
                      <span className="text-primary">## Task</span>
                      <br />
                      Extract every risk factor from the section below.
                    </p>
                    <p className="mt-2">
                      <span className="text-primary">## Input</span>
                      <br />
                      <span className="text-muted">{'{filing_text}'}</span>
                    </p>
                    <p className="mt-2">
                      <span className="text-primary">## Output</span>
                      <br />
                      JSON {'{ risks: [{ title, severity }] }'}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[10px] text-muted">
                    <CheckCircleIcon className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                    Clear roles · structured output · low token count.
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Why it matters */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">Why this is leverage</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Three reasons prompt engineering moves the needle</h2>
            <p className="mt-4 text-base text-body">
              Most AI projects fail at the prompt before they ever get to the model. Three concrete reasons it is worth taking seriously.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {whyMatters.map((b) => (
              <div key={b.title} className={`flex flex-col rounded-2xl p-6 ring-1 ${accentToBg[b.accent]} ${accentToRing[b.accent]}`}>
                <span
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-bg ${accentToText[b.accent]} ring-1 ${accentToRing[b.accent]}`}
                >
                  <b.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-heading">{b.title}</h3>
                <p className="mt-2 text-sm text-body">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5 modules — zigzag */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-link">The five modules</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">From “why” all the way to “refine at scale”</h2>
            <p className="mt-4 text-base text-body">Each module has one clear job, ends with hands-on practice, and feeds the next.</p>
          </div>

          <div className="relative mx-auto mt-16 max-w-4xl">
            <div aria-hidden="true" className="absolute left-1/2 top-0 bottom-0 hidden w-0.5 -translate-x-1/2 bg-primary/20 md:block" />

            <div className="relative space-y-12">
              {modules.map((m, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={m.num} className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
                    <div className={`md:w-1/2 ${isLeft ? 'md:order-first md:text-right' : 'md:order-last'}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Module {m.num}</p>
                      <h3 className="mt-1 text-xl font-semibold text-heading">{m.title}</h3>
                      <p className="mt-1 text-sm text-body">{m.summary}</p>
                    </div>

                    <div className="relative z-10 flex h-16 w-16 flex-none items-center justify-center rounded-full bg-surface ring-4 ring-primary/20">
                      <m.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>

                    <div className={`md:w-1/2 ${isLeft ? 'md:order-last' : 'md:order-first md:text-right'}`}>
                      <ul className={`space-y-1.5 ${isLeft ? '' : 'md:flex md:flex-col md:items-end'}`}>
                        {m.highlights.map((h) => (
                          <li key={h} className="flex items-center gap-2 text-sm text-body">
                            <CheckCircleIcon className="h-4 w-4 flex-none text-success" aria-hidden="true" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Anatomy block */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-link">A peek inside</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">The anatomy of a prompt you can trust</h2>
              <p className="mt-4 text-base text-body">
                Every reliable prompt is built on the same five parts. The module on anatomy walks you through each in detail, with examples and
                counter-examples from real production prompts.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-link">
                <BeakerIcon className="h-4 w-4" aria-hidden="true" />
                Lab: rewrite a real-world prompt using all five parts.
              </div>
            </div>

            <div className="rounded-2xl bg-bg p-6 ring-1 ring-border">
              <div className="space-y-2">
                {anatomy.map((row) => (
                  <div key={row.label} className="flex items-start gap-3 rounded-lg bg-surface px-3 py-3 ring-1 ring-border">
                    <span className="mt-0.5 inline-flex items-center justify-center rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary ring-1 ring-primary/30">
                      {row.label}
                    </span>
                    <p className="text-sm text-body">{row.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Audiences + CTA */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Who this guide is for</h2>
            <p className="mt-4 text-base text-body">Three reader profiles get distinct value. None of them are “people who want to learn AI in general.”</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {audiences.map((a) => (
              <div key={a.title} className="flex gap-5 rounded-2xl bg-surface p-6 ring-1 ring-border">
                <span className="inline-flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                  <a.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-heading">{a.title}</h3>
                  <p className="mt-1 text-sm text-body">{a.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary to-link p-8 text-center">
            <p className="text-base font-semibold text-primary-text">Ready to write prompts your future self will not have to rewrite?</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              Dive into the modules, run the labs, and start shipping AI features that hold up under real usage.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:info@dodao.com"
                className="inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
              >
                <BookOpenIcon className="h-4 w-4" aria-hidden="true" />
                Get access
              </a>
              <a
                href="/home-section/dodao-io/education/ai-agent-bootcamp"
                className="inline-flex items-center gap-x-2 rounded-xl bg-bg/30 px-5 py-2.5 text-sm font-semibold text-primary-text ring-1 ring-primary-text/30 hover:bg-bg/50 transition-colors"
              >
                <LightBulbIcon className="h-4 w-4" aria-hidden="true" />
                Pair with the bootcamp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PromptEngineeringGuide;
