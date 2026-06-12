import {
  ArrowsRightLeftIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CubeTransparentIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  LightBulbIcon,
  ScaleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

type Pillar = {
  key: string;
  title: string;
  overview: string;
  purpose: string;
  impact: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const pillars: Pillar[] = [
  {
    key: 'integration',
    title: 'RWA integration on-chain',
    overview: 'We study how Real World Assets can be effectively integrated into blockchain, mapping the opportunities and the obstacles in equal weight.',
    purpose: 'Builders get the foundational mental model and the strategic shortcuts before they commit code and capital to a tokenisation thesis.',
    impact: 'Companies move with a clear pathway to leverage blockchain for real-world assets — improving both efficiency and audit-grade transparency.',
    icon: CubeTransparentIcon,
  },
  {
    key: 'compliance',
    title: 'Compliance & legal frameworks',
    overview: 'A deliberate, plain-language look at the legal and regulatory rules that decide whether an RWA initiative can even ship.',
    purpose: 'Newcomers get the lay of the land in one document instead of stitching it together from a dozen law-firm blog posts.',
    impact: 'Companies mitigate compliance risk early and shorten time-to-launch by avoiding the most common false starts.',
    icon: ScaleIcon,
  },
  {
    key: 'insights',
    title: 'Market & securitisation insights',
    overview: 'Trends, opportunities, and the mechanics of securitisation — covered in enough depth to inform a real strategy decision.',
    purpose: 'Builders walk in equipped with the same information serious investors and incumbent issuers are looking at.',
    impact: 'Teams adapt their approach to the actual demands of the RWA market — instead of building for an imagined version of it.',
    icon: ChartBarIcon,
  },
];

type FocusArea = {
  key: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: 'primary' | 'link' | 'warning';
};

const focusAreas: FocusArea[] = [
  {
    key: 'regs',
    title: 'Regulations & securitisation structure',
    description: 'Detailed breakdown of how different securitisation structures actually constrain — or unlock — RWA deployment on-chain.',
    icon: DocumentTextIcon,
    accent: 'primary',
  },
  {
    key: 'jurisdictions',
    title: 'Global regulatory landscape',
    description: 'Cross-jurisdiction analysis of the rules that touch tokenised RWAs — the EU, the US, APAC, and the offshore alternatives.',
    icon: GlobeAltIcon,
    accent: 'link',
  },
  {
    key: 'categories',
    title: 'Eligible asset categories',
    description: 'Which asset classes actually tokenise well, which do not, and the integration implications of each category.',
    icon: BuildingOfficeIcon,
    accent: 'warning',
  },
];

const commitments = [
  { title: 'Accessible', description: 'We translate dense legal text into plain language without losing the nuance.', icon: BookOpenIcon },
  { title: 'Compliant', description: 'Every recommendation is grounded in actual regulatory text, not blog-post folklore.', icon: ShieldCheckIcon },
  { title: 'Strategic', description: 'Insights are framed as decisions — not as a wall of facts you still have to interpret.', icon: SparklesIcon },
];

const focusAccent: Record<FocusArea['accent'], { bg: string; text: string; ring: string }> = {
  primary: { bg: 'bg-primary/15', text: 'text-primary', ring: 'ring-primary/30' },
  link: { bg: 'bg-link/15', text: 'text-link', ring: 'ring-link/30' },
  warning: { bg: 'bg-warning/15', text: 'text-warning', ring: 'ring-warning/30' },
};

function RealWorldAssets() {
  return (
    <div>
      {/* Hero */}
      <div className="relative overflow-hidden bg-bg">
        <div className="dodao-dot-pattern absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">Research · Real World Assets</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  Real World Assets, <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">decoded for builders</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  We research RWA integration end to end — the on-chain mechanics, the compliance reality, and the asset categories that actually work. The
                  output is something a founder or product team can act on, not a 60-page report nobody opens.
                </p>

                <div className="mt-6 flex flex-wrap gap-2 sm:flex-nowrap">
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    Builder-focused
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <ScaleIcon className="h-4 w-4" aria-hidden="true" />
                    Regulation-aware
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 whitespace-nowrap rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <GlobeAltIcon className="h-4 w-4" aria-hidden="true" />
                    Global coverage
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="https://chainedassets.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-x-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    Visit ChainedAssets
                    <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                  </a>
                  <a
                    href="mailto:info@dodao.com"
                    className="inline-flex items-center justify-center rounded-md bg-surface px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-border hover:bg-surface-2 transition-colors"
                  >
                    Request a research call
                  </a>
                </div>
              </div>

              {/* Right side: research at a glance */}
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative w-full rounded-2xl bg-gradient-to-br from-surface to-surface-2 p-6 ring-1 ring-border shadow-lg">
                  <p className="text-xs uppercase tracking-widest font-semibold text-primary">Research at a glance</p>
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl bg-bg/60 p-3 ring-1 ring-border">
                      <p className="text-xs font-semibold uppercase tracking-wide text-link">Scope</p>
                      <p className="mt-1 text-sm text-body">Integration, compliance, securitisation, and asset categories</p>
                    </div>
                    <div className="rounded-xl bg-bg/60 p-3 ring-1 ring-border">
                      <p className="text-xs font-semibold uppercase tracking-wide text-link">Audience</p>
                      <p className="mt-1 text-sm text-body">Founders, builders, and investors evaluating RWA</p>
                    </div>
                    <div className="rounded-xl bg-bg/60 p-3 ring-1 ring-border">
                      <p className="text-xs font-semibold uppercase tracking-wide text-link">Output</p>
                      <p className="mt-1 text-sm text-body">Decision-ready briefs — not academic surveys</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Pillars — 3 large cards with overview/purpose/impact rows */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-primary">Three research pillars</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">How we cover the RWA landscape</h2>
            <p className="mt-4 text-base text-body">
              For every pillar we publish the overview, the purpose behind the inquiry, and the practical impact for teams that act on it.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.key} className="flex flex-col rounded-2xl bg-bg p-6 ring-1 ring-border">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-text shadow-lg">
                  <p.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-lg font-semibold text-heading">{p.title}</h3>
                <p className="mt-3 text-sm text-body">{p.overview}</p>

                <div className="mt-5 space-y-3">
                  <div className="rounded-lg bg-surface p-3 ring-1 ring-border">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-link">Purpose</p>
                    <p className="mt-1 text-xs text-body">{p.purpose}</p>
                  </div>
                  <div className="rounded-lg bg-surface p-3 ring-1 ring-border">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-success">Impact</p>
                    <p className="mt-1 text-xs text-body">{p.impact}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Focus areas — 3 horizontal cards */}
      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs uppercase tracking-widest font-semibold text-link">Key focus areas for builders</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Three lenses every RWA team needs</h2>
            <p className="mt-4 text-base text-body">Most failed RWA pilots ignore one of these. We make sure every project we advise on hits all three.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {focusAreas.map((f) => {
              const a = focusAccent[f.accent];
              return (
                <div key={f.key} className={`flex flex-col rounded-2xl bg-surface p-6 ring-1 ${a.ring}`}>
                  <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${a.bg} ${a.text} ring-1 ${a.ring}`}>
                    <f.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-heading">{f.title}</h3>
                  <p className="mt-2 text-sm text-body">{f.description}</p>
                </div>
              );
            })}
          </div>

          {/* ChainedAssets callout — research turned into a real product */}
          <div className="mt-16 rounded-2xl bg-gradient-to-br from-link/15 to-primary/10 p-8 ring-1 ring-link/30">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-2 flex justify-center">
                <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-link/20 text-link ring-1 ring-link/40">
                  <BuildingLibraryIcon className="h-8 w-8" aria-hidden="true" />
                </span>
              </div>
              <div className="lg:col-span-7">
                <p className="text-xs uppercase tracking-widest font-semibold text-link">Research, shipped as a product</p>
                <h3 className="mt-1 text-xl font-semibold text-heading">We built ChainedAssets on top of this research</h3>
                <p className="mt-2 text-sm text-body">
                  ChainedAssets is our own RWA platform — the place where the regulatory mapping, the asset-category analysis, and the integration playbooks
                  show up as something builders and investors can actually use. It is the proof that the research is operational, not academic.
                </p>
              </div>
              <div className="lg:col-span-3">
                <a
                  href="https://chainedassets.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-x-2 rounded-md bg-link px-4 py-2.5 text-sm font-semibold text-bg shadow-sm hover:bg-link/85 transition-colors"
                >
                  Visit ChainedAssets
                  <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Commitments + CTA */}
      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">Commitment to RWA excellence</h2>
            <p className="mt-4 text-base text-body">
              The same three commitments shape every brief we publish on RWAs. They are also the bar we will hold ourselves to in any project we advise on.
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
            <p className="text-base font-semibold text-primary-text">Working on an RWA initiative?</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              We share our research with builders directly — and dive deep on the specific questions your team is wrestling with right now.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:info@dodao.com"
                className="inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
              >
                <LightBulbIcon className="h-4 w-4" aria-hidden="true" />
                Get our research brief
              </a>
              <a
                href="/home-section/dodao-io/research/credit-union"
                className="inline-flex items-center gap-x-2 rounded-xl bg-bg/30 px-5 py-2.5 text-sm font-semibold text-primary-text ring-1 ring-primary-text/30 hover:bg-bg/50 transition-colors"
              >
                <ArrowsRightLeftIcon className="h-4 w-4" aria-hidden="true" />
                Read other research
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealWorldAssets;
