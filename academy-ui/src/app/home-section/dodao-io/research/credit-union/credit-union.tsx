import {
  AcademicCapIcon,
  ArrowRightIcon,
  ArrowTopRightOnSquareIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  FaceSmileIcon,
  HandRaisedIcon,
  HeartIcon,
  LightBulbIcon,
  MegaphoneIcon,
  PaintBrushIcon,
  PresentationChartLineIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const genZStats = [
  { value: '$360B', label: 'Gen Z spending power' },
  { value: '2B+', label: 'Gen Z globally' },
  { value: 'Digital', label: 'Banking preference' },
  { value: 'Values-led', label: 'Brand expectation' },
];

type Tactic = {
  num: string;
  title: string;
  short: string;
  description: string;
  impact: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const tactics: Tactic[] = [
  {
    num: '01',
    title: 'Modernise social media strategy',
    short: 'Show up where Gen Z already spends time, in the tone they actually use.',
    description:
      'A deliberate rework of voice, platform mix, and posting cadence — moving credit unions away from corporate-bulletin energy toward something Gen Z will actually engage with.',
    impact: 'Higher engagement, more brand recognition, and credit unions read as relevant rather than relics.',
    icon: MegaphoneIcon,
  },
  {
    num: '02',
    title: 'Subtle product placement in stories',
    short: 'Weave the financial product into a story instead of advertising it.',
    description:
      'Products land inside relatable narratives about real money moments — moving in, hitting savings goals, surviving a sudden bill — instead of being banner-style ads.',
    impact: 'Audiences see credit unions as allies in their financial life rather than vendors selling at them.',
    icon: PaintBrushIcon,
  },
  {
    num: '03',
    title: 'Informal & relatable content',
    short: 'Genuine, informal, real-life — not polished and corporate.',
    description:
      'Educational and lifestyle content shot in everyday formats — simple videos, behind-the-scenes, real emotional honesty — instead of slick agency-produced spots.',
    impact: 'A community forms around the brand, trust compounds, and engagement keeps climbing without paid push.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    num: '04',
    title: 'Wit & humour',
    short: 'Memes, jokes, and personality — used intentionally, not awkwardly.',
    description:
      'Strategic use of humour and meme formats to make financial content genuinely enjoyable to share — without ever crossing into cringey corporate-tries-to-be-funny territory.',
    impact: 'Organic reach climbs through shares, brand identity sharpens, and the credit union becomes memorable.',
    icon: FaceSmileIcon,
  },
];

const commitments = [
  {
    title: 'Adapt to digital preferences',
    description: 'Embrace tech that meets Gen Z’s demand for instant, mobile-native financial experiences. No more PDFs and branch hours.',
    icon: DevicePhoneMobileIcon,
  },
  {
    title: 'Align with social values',
    description: 'Communicate ethics, community contributions, and stance on issues that matter — Gen Z makes brand decisions based on these signals.',
    icon: HeartIcon,
  },
  {
    title: 'Enhance financial education',
    description: 'Provide accessible, real-world financial literacy content. Build trust and loyalty before Gen Z ever applies for a product.',
    icon: AcademicCapIcon,
  },
];

function CreditUnion() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-bg">
        <div className="dodao-dot-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">Research · Credit Unions & Gen Z</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  How credit unions can <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">actually win Gen Z</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  Generation Z is the next decade of growth for credit unions — but the playbook that won millennials does not move them. Our research lays out
                  the social-first, values-led strategy that does.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Audience-led
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <PresentationChartLineIcon className="h-4 w-4" aria-hidden="true" />
                    Practical tactics
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                    Brand-safe
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="https://www.canva.com/design/DAGV6ZRPKLc/UTqlxBAyMnYwi5RamMDF2Q/view"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-x-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    See the full report
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    Talk to a researcher
                  </a>
                </div>
              </div>

              {/* Right: Gen Z stats */}
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-surface to-surface-2 p-6 ring-1 ring-border shadow-lg">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary">Why Gen Z matters now</p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {genZStats.map((s) => (
                      <div key={s.label} className="rounded-xl bg-bg/60 p-3 ring-1 ring-border">
                        <p className="text-2xl font-bold text-primary">{s.value}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-heading">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Understanding Gen Z intro */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-widest font-semibold text-primary">Understanding the audience</p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Why Gen Z is the credit-union opportunity nobody is winning</h2>
              <p className="mt-4 text-base text-body">
                Gen Z’s growing financial influence, their preference for digital convenience, and their non-negotiable expectation of brand transparency make
                them a different audience than every cohort before them. The strategies that retained millennials simply do not move them.
              </p>
              <p className="mt-3 text-base text-body">
                Credit unions that meet Gen Z where they already are — in feed, in tone, in values — rejuvenate their membership base and stay relevant in a
                rapidly digital-first financial sector.
              </p>
            </div>

            <div className="rounded-2xl bg-bg p-6 ring-1 ring-border">
              <p className="text-xs uppercase tracking-widest font-semibold text-link">What Gen Z notices</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-success" aria-hidden="true" />
                  <p className="text-sm text-body">
                    <span className="font-semibold text-heading">Digital convenience.</span> Banking happens on a phone or it does not happen.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-success" aria-hidden="true" />
                  <p className="text-sm text-body">
                    <span className="font-semibold text-heading">Transparency.</span> Hidden fees and opaque terms are an automatic disqualifier.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-success" aria-hidden="true" />
                  <p className="text-sm text-body">
                    <span className="font-semibold text-heading">Social responsibility.</span> Where a brand stands on issues affects whether they bank with it.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-success" aria-hidden="true" />
                  <p className="text-sm text-body">
                    <span className="font-semibold text-heading">Real voices.</span> Polished agency content reads as inauthentic — even when it is true.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 tactics — zigzag */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-link">Four tactics that work</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">A content-and-channel playbook for Gen Z</h2>
            <p className="mt-4 text-base text-body">
              Each tactic is concrete, testable, and grounded in what is actually working for the institutions that have started to reach Gen Z.
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-4xl">
            <div aria-hidden="true" className="absolute left-1/2 top-0 bottom-0 hidden w-0.5 -translate-x-1/2 bg-primary/20 md:block" />

            <div className="relative space-y-12">
              {tactics.map((t, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={t.num} className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
                    <div className={`md:w-1/2 ${isLeft ? 'md:order-first md:text-right' : 'md:order-last'}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">Tactic {t.num}</p>
                      <h3 className="mt-1 text-xl font-semibold text-heading">{t.title}</h3>
                      <p className="mt-1 text-sm text-body">{t.short}</p>
                    </div>

                    <div className="relative z-10 flex h-16 w-16 flex-none items-center justify-center rounded-full bg-surface ring-4 ring-primary/20">
                      <t.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>

                    <div className={`md:w-1/2 ${isLeft ? 'md:order-last' : 'md:order-first md:text-right'}`}>
                      <p className="text-sm text-body">{t.description}</p>
                      <p className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold text-success`}>
                        <ArrowRightIcon className="h-3 w-3" aria-hidden="true" />
                        {t.impact}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Commitments + CTA */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">How we help credit unions follow through</h2>
            <p className="mt-4 text-base text-body">
              Three commitments shape every engagement — from the research brief through to the implementation playbook.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {commitments.map((c) => (
              <div key={c.title} className="flex flex-col rounded-2xl bg-gradient-to-br from-primary/15 to-link/15 p-6 ring-1 ring-primary/30">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                  <c.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-heading">{c.title}</h3>
                <p className="mt-2 text-sm text-body">{c.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary to-link p-8 text-center">
            <p className="text-base font-semibold text-primary-text">Let us help your credit union win the next generation</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              Read the full report, or get in touch — we will share the implementation playbook and walk through how it applies to your specific institution.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://www.canva.com/design/DAGV6ZRPKLc/UTqlxBAyMnYwi5RamMDF2Q/view"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                See the full report
              </a>
              <a
                href="mailto:info@dodao.com"
                className="inline-flex items-center gap-x-2 rounded-xl bg-bg/30 px-5 py-2.5 text-sm font-semibold text-primary-text ring-1 ring-primary-text/30 hover:bg-bg/50 transition-colors"
              >
                <UserGroupIcon className="h-4 w-4" aria-hidden="true" />
                Book a research call
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreditUnion;
