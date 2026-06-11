import {
  ArrowPathRoundedSquareIcon,
  ArrowTrendingUpIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  DocumentChartBarIcon,
  ScaleIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import Chatbot from '@/images/DoDAOHomePage/koala_gains.gif';

const benefits = [
  {
    name: 'Better Investment Choices',
    description: 'KoalaGains turns raw filings and market data into clear facts, so you can see where the best chances are and act on them.',
    icon: ScaleIcon,
  },
  {
    name: 'Less Risk',
    description: 'Each report flags weaknesses, red flags and unresolved questions up front, so you avoid the deals that look good only at first glance.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Complete Analysis',
    description: 'Company performance, financials, team and market signals all show up in one place, so nothing important slips through.',
    icon: ClipboardDocumentCheckIcon,
  },
];

const features = [
  {
    name: 'All-in-One Reports',
    description: 'Cash flow, debt, market standing and team data are pulled together into a single report that shows the full picture of a project.',
    icon: DocumentChartBarIcon,
  },
  {
    name: 'Risk Checks',
    description: 'Strong and weak signals are tagged side by side, so you can see the good and the bad of a crowdfunded project or REIT at a glance.',
    icon: ShieldExclamationIcon,
  },
  {
    name: 'Team Performance',
    description: 'The team’s background and track record are scored, so you know whether they can actually deliver what the deck promises.',
    icon: UserGroupIcon,
  },
  {
    name: 'Up-to-Date Filings',
    description: 'KoalaGains continuously pulls in the latest SEC filings, so the view of any investment is current, not months out of date.',
    icon: ArrowPathRoundedSquareIcon,
  },
  {
    name: 'AI-Powered Insights',
    description: 'Our AI agents read large volumes of filings and summarise them into short, focused notes tailored to what you care about.',
    icon: CpuChipIcon,
  },
  {
    name: 'Side-by-Side Comparison',
    description: 'Compare projects on the same dimensions in one view, so the strongest opportunities stand out without spreadsheet juggling.',
    icon: ChartBarSquareIcon,
  },
];

const incentives = [
  {
    name: 'Goal and Objectives',
    description:
      'Crowdfunded projects and REITs are risky to invest in without full information. KoalaGains exists to close that information gap and surface the data that actually matters before you commit capital.',
    icon: SparklesIcon,
  },
  {
    name: 'The Solution',
    description:
      'Our AI agents read each project’s filings, market signals and team details and turn that raw data into easy-to-read reports. You get strong points, risks and growth potential in one place, so decisions are faster and more confident.',
    icon: CpuChipIcon,
  },
];

function KoalaGainsComponent() {
  return (
    <div>
      <div className="relative overflow-hidden bg-bg">
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">AI Agents · Investment Insights</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  KoalaGains <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">Investment Research, Automated</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  KoalaGains is an AI-powered platform that takes the slow, manual side of investment research off your plate. It reads filings on crowdfunding
                  projects and REITs, scores risks and opportunities and shows the strengths and weaknesses of every deal in plain language.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Filings parsed automatically
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                    Risk & opportunity scoring
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <ArrowTrendingUpIcon className="h-4 w-4" aria-hidden="true" />
                    Crowdfunding + REITs
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
                    href="https://koalagains.com/"
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
                  <img alt="KoalaGains AI investment platform preview" src={Chatbot.src} className="w-full" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Why We Built KoalaGains</h2>
            <p className="mt-4 text-base text-body">
              The problem and the answer in one page — so you know what the platform is for before you dig into the features.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {incentives.map((incentive) => (
              <div key={incentive.name} className="rounded-2xl bg-bg p-6 ring-1 ring-border">
                <div className="flex items-center gap-x-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <incentive.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="text-lg font-semibold text-heading">{incentive.name}</h3>
                </div>
                <p className="mt-4 text-base text-body">{incentive.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Features of KoalaGains</h2>
            <p className="mt-4 text-base text-body">
              Each feature is built to help you understand the key points of a crowdfunded project or REIT in minutes, not days.
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
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Why KoalaGains Helps You</h2>
            <p className="mt-4 text-base text-body">
              The platform sifts through large data sets, uncovers what matters and shows you clear visuals so you can move with confidence, not guesswork.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div key={benefit.name} className="rounded-2xl bg-bg p-6 ring-1 ring-border">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                  <benefit.icon aria-hidden="true" className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-heading">{benefit.name}</h3>
                <p className="mt-3 text-base text-body">{benefit.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl bg-gradient-to-br from-primary to-link p-8 text-center">
            <p className="text-base font-semibold text-primary-text">Ready to see KoalaGains in action?</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              Try the live platform and see how AI-powered reports change the way you research crowdfunding projects and REITs.
            </p>
            <a
              href="https://koalagains.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
            >
              Open KoalaGains
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KoalaGainsComponent;
