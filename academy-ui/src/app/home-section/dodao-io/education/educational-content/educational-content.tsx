import {
  AcademicCapIcon,
  ArrowRightIcon,
  ArrowsRightLeftIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CubeTransparentIcon,
  CursorArrowRaysIcon,
  DocumentTextIcon,
  HandRaisedIcon,
  LightBulbIcon,
  PaintBrushIcon,
  PencilSquareIcon,
  PresentationChartLineIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  SparklesIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';

type Format = {
  key: string;
  title: string;
  description: string;
  bestFor: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: 'primary' | 'link' | 'success' | 'warning';
};

const formats: Format[] = [
  {
    key: 'guides',
    title: 'Guides & tutorials',
    description: 'Step-by-step walkthroughs and deep-dive explanations that turn intimidating blockchain or DeFi topics into a clear path.',
    bestFor: 'Onboarding new users, teaching workflows.',
    icon: BookOpenIcon,
    accent: 'primary',
  },
  {
    key: 'visuals',
    title: 'Visual aids',
    description: 'Infographics and diagrams that make complex flows — like cross-chain bridges or AMM mechanics — readable at a glance.',
    bestFor: 'Decks, marketing, technical docs.',
    icon: PaintBrushIcon,
    accent: 'link',
  },
  {
    key: 'interactive',
    title: 'Interactive modules',
    description: 'Quizzes and clickable demos that turn passive reading into practice. Knowledge sticks because the learner had to act on it.',
    bestFor: 'Learning platforms, certifications.',
    icon: CursorArrowRaysIcon,
    accent: 'success',
  },
  {
    key: 'video',
    title: 'Video tutorials',
    description: 'Concise videos that overview a topic in two minutes — or take a deep dive in twenty, with screen and concept narration.',
    bestFor: 'Marketing, social, async training.',
    icon: VideoCameraIcon,
    accent: 'warning',
  },
];

type Step = {
  num: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const process: Step[] = [
  {
    num: '01',
    title: 'Scope',
    description: 'We map your audience, the gaps in their knowledge, and the outcomes you want them to walk away with.',
    icon: ClipboardDocumentCheckIcon,
  },
  {
    num: '02',
    title: 'Draft',
    description: 'Outlines, scripts, storyboards — whatever the format needs — written by people who actually understand the subject.',
    icon: PencilSquareIcon,
  },
  {
    num: '03',
    title: 'Produce',
    description: 'Visuals, videos, interactive modules, and code-along demos built to a quality bar you would happily put your logo on.',
    icon: PaintBrushIcon,
  },
  {
    num: '04',
    title: 'Iterate',
    description: 'Feedback from your team and a sample of your audience comes back into the content — until it lands the way you wanted.',
    icon: ArrowsRightLeftIcon,
  },
];

const whyDodao = [
  {
    title: 'Engagement, not just delivery',
    description: 'Content that earns and holds attention. We sweat the hook, the pacing, and the moment of payoff in every piece.',
    icon: SparklesIcon,
  },
  {
    title: 'Customised to your project',
    description: 'Material is tailored to your protocol, product, and audience — not stitched together from generic blockchain explainers.',
    icon: PuzzlePieceIcon,
  },
  {
    title: 'Empowerment, not gatekeeping',
    description: 'Learners leave with the confidence to use your technology themselves, not the impression that they need to hire someone first.',
    icon: HandRaisedIcon,
  },
];

const accentClasses: Record<Format['accent'], { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary/15', text: 'text-primary', ring: 'ring-primary/30' },
  link: { bg: 'bg-link/15', text: 'text-link', ring: 'ring-link/30' },
  success: { bg: 'bg-success/15', text: 'text-success', ring: 'ring-success/30' },
  warning: { bg: 'bg-warning/15', text: 'text-warning', ring: 'ring-warning/30' },
};

function EducationalContent() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-bg">
        <div className="dodao-dot-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">Education · Custom Content</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  Educational content that <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">actually lands</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  Bespoke guides, visuals, interactive modules, and videos for blockchain and DeFi projects. We bridge the gap between “your team built this”
                  and “your audience can actually use it.”
                </p>

                <div className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />4 content formats
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <PuzzlePieceIcon className="h-4 w-4" aria-hidden="true" />
                    Tailored to your project
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                    Built for engagement
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    Brief us on a project
                  </a>
                  <a
                    href="/home-section/dodao-io/education/blockchain-bootcamp"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    Or run the bootcamp
                  </a>
                </div>
              </div>

              {/* Format mosaic preview */}
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-surface to-surface-2 p-5 ring-1 ring-border shadow-lg">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary">Format mosaic</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {formats.map((f) => (
                      <div key={f.key} className={`rounded-xl bg-bg/60 p-3 ring-1 ${accentClasses[f.accent].ring}`}>
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${accentClasses[f.accent].bg} ${accentClasses[f.accent].text}`}
                        >
                          <f.icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <p className="mt-2 text-xs font-semibold text-heading">{f.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 4 formats */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">Four content formats</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Built for different ways people learn</h2>
            <p className="mt-4 text-base text-body">
              Most projects need two or three of these in the mix. We help you pick the right combination for your audience and channel.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {formats.map((f) => {
              const a = accentClasses[f.accent];
              return (
                <div key={f.key} className={`flex flex-col rounded-2xl bg-bg p-6 ring-1 ${a.ring}`}>
                  <div className="flex items-center gap-4">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${a.bg} ${a.text} ring-1 ${a.ring}`}>
                      <f.icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <h3 className="text-lg font-semibold text-heading">{f.title}</h3>
                  </div>
                  <p className="mt-4 text-sm text-body">{f.description}</p>
                  <div
                    className={`mt-5 inline-flex items-center gap-2 self-start rounded-full ${a.bg} px-3 py-1 text-xs font-semibold ${a.text} ring-1 ${a.ring}`}
                  >
                    Best for: {f.bestFor}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Process — horizontal 4-step pipeline */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-link">How a project runs</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">A four-step process, no surprises</h2>
            <p className="mt-4 text-base text-body">
              From brief to launch — you always know what we are doing this week, what we will be doing next, and where the asset stands.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-4">
            {process.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="flex flex-col items-start rounded-2xl bg-surface p-6 ring-1 ring-border">
                  <div className="flex w-full items-center justify-between">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-link text-bg shadow-lg">
                      <step.icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-3xl font-bold text-link/40">{step.num}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-heading">{step.title}</h3>
                  <p className="mt-1 text-sm text-body">{step.description}</p>
                </div>
                {i < process.length - 1 && (
                  <div className="absolute top-1/2 -right-3 hidden h-6 w-6 -translate-y-1/2 items-center justify-center md:flex">
                    <ArrowRightIcon className="h-5 w-5 text-link" aria-hidden="true" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Why DoDAO + CTA */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Why teams pick DoDAO for content</h2>
            <p className="mt-4 text-base text-body">Three commitments shape every piece of educational content we ship.</p>
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

          <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary to-link p-8 text-center">
            <p className="text-base font-semibold text-primary-text">Have a learning audience to serve?</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              Tell us who they are and what you want them to do differently — and we will scope the content to make that change happen.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:info@dodao.com"
                className="inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
              >
                <DocumentTextIcon className="h-4 w-4" aria-hidden="true" />
                Talk to a content lead
              </a>
              <a
                href="/home-section/dodao-io/education/blockchain-bootcamp"
                className="inline-flex items-center gap-x-2 rounded-xl bg-bg/30 px-5 py-2.5 text-sm font-semibold text-primary-text ring-1 ring-primary-text/30 hover:bg-bg/50 transition-colors"
              >
                <AcademicCapIcon className="h-4 w-4" aria-hidden="true" />
                See the bootcamp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EducationalContent;
