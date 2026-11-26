import { Footer } from '@/components/home/DoDAOHome/components/Footer';
import LoopingVideo from '@/components/home/DoDAOHome/components/LoopingVideo';
import { PdfDownload as SharedPdfDownload, RoleFlow, SimVsRealShots } from '@/components/home/DoDAOHome/components/ServicePageParts';
import { ActionLink, SectionIntro } from '@/components/home/DoDAOHome/components/SiteUi';
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  DocumentMagnifyingGlassIcon,
  LockClosedIcon,
  ScaleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import {
  challenges,
  engagementSteps,
  keyDates,
  ML_EVAL_CONTACT_MAILTO,
  ML_EVAL_PDF,
  openPoints,
  Package,
  packages,
  REGULATION_URL,
  reportContents,
  roles,
  safeguards,
  scopeItems,
  strengths,
  traceRows,
  trialsExample,
} from './mlEvaluationContent';

function PdfDownload({ onViewport = false }: { onViewport?: boolean }) {
  return <SharedPdfDownload pdf={ML_EVAL_PDF} label="Download the overview" onViewport={onViewport} />;
}

/** A mock excerpt of our test report: what the notified body receives. */
function ReportExcerpt() {
  const rows = [
    { ref: 'III 1.2.1', name: 'Task and movement space', result: 'Pass' },
    { ref: 'III 1.2.1', name: 'Safety-decision log, 1 year', result: 'Pass' },
    { ref: 'III 1.1.9', name: 'Unsigned model blocked', result: 'Gap' },
    { ref: 'IV (g)', name: 'Missed detections, per condition', result: 'Data' },
  ];
  const tone: Record<string, string> = {
    Pass: 'bg-success/15 text-success',
    Gap: 'bg-warning/15 text-warning',
    Data: 'bg-primary/15 text-link',
  };
  return (
    <div className="rounded-3xl bg-surface p-6 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.6)] ring-1 ring-border sm:p-7">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-xs font-medium text-muted">Test report · sample layout</p>
          <p className="mt-1 text-lg font-semibold text-heading">Person detection, robot cell</p>
        </div>
        <ClipboardDocumentCheckIcon className="h-7 w-7 flex-none text-accent" aria-hidden="true" />
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <dt className="text-muted">Model version</dt>
        <dd className="font-mono text-heading">v2.4.1</dd>
        <dt className="text-muted">Model checksum</dt>
        <dd className="font-mono text-heading">sha256 9f3c…a71e</dd>
        <dt className="text-muted">Data version</dt>
        <dd className="font-mono text-heading">test-set 2026-10</dd>
      </dl>
      <ul className="mt-5 space-y-2">
        {rows.map((row) => (
          <li key={row.name} className="flex items-center gap-3 rounded-xl bg-bg/60 px-3 py-2.5 ring-1 ring-border">
            <span className="w-16 flex-none font-mono text-[0.7rem] text-muted">{row.ref}</span>
            <span className="flex-1 text-sm text-heading">{row.name}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone[row.result]}`}>{row.result}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-3 text-xs text-muted">Raw data and scripts attached. No conformity statement: the decision is yours.</p>
    </div>
  );
}

function Hero() {
  return (
    <section className="dodao-glow relative overflow-hidden bg-bg">
      <div
        className="dodao-viewport-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_70%_at_30%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-12 lg:gap-14 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="lg:col-span-7">
          <p className="flex items-center gap-3 text-sm font-medium text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            For notified bodies · EU Machinery Regulation
          </p>
          <h1 className="font-display mt-5 text-balance text-4xl font-semibold leading-[1.04] text-heading sm:text-5xl lg:text-6xl">
            ML testing for your machinery assessments.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-body">
            From 20 January 2027, machinery whose safety depends on machine learning needs a notified body. As your subcontractor, we run the ML technical
            tasks: file review, data and model testing, and checks of the ML safety requirements. You keep the evaluation plan, the review and the decision.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ActionLink href={ML_EVAL_CONTACT_MAILTO} size="lg">
              Discuss a first test plan
            </ActionLink>
            <ActionLink href="#packages" size="lg" variant="secondary">
              See the three packages
            </ActionLink>
          </div>
          <div className="mt-8">
            <PdfDownload />
          </div>
        </div>
        <div className="lg:col-span-5">
          <ReportExcerpt />
        </div>
      </div>
    </section>
  );
}

function TheGap() {
  return (
    <section className="dodao-light bg-bg py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="The scope"
          title={<span className="block text-balance">Two new items in Annex I, Part A</span>}
          lead="For these items a notified body is always required, even when harmonised standards are applied in full. Self-assessment is not an option."
        />
        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {scopeItems.map((item) => (
            <div key={item.ref} className="rounded-3xl bg-surface p-7 ring-1 ring-border">
              <p className="text-sm font-semibold text-accent">{item.ref}</p>
              <p className="mt-3 text-lg leading-7 text-heading">{item.text}</p>
            </div>
          ))}
        </div>

        <h3 className="font-display mt-20 text-2xl font-semibold text-heading sm:text-3xl">Why ML files are hard to assess today</h3>
        <ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {challenges.map((challenge) => (
            <li key={challenge.title} className="border-t-2 border-heading pt-5">
              <h4 className="text-lg font-semibold text-heading">{challenge.title}</h4>
              <p className="mt-2 text-[0.95rem] leading-7 text-body">{challenge.text}</p>
            </li>
          ))}
        </ul>

        <ul className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {keyDates.map((item) => (
            <li key={item.date} className="rounded-3xl bg-primary p-7 text-primary-text">
              <p className="font-display text-3xl font-semibold">{item.date}</p>
              <p className="mt-2 text-[0.95rem] leading-6 text-primary-text/85">{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function WhereWeFit() {
  return (
    <section className="relative overflow-hidden bg-bg py-24 sm:py-28">
      <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="Where we fit"
          title={<span className="block text-balance">We produce the evidence. You decide.</span>}
          lead="The Regulation lets a notified body subcontract specific technical tasks, such as testing. The notified body keeps full responsibility, and the manufacturer agrees in writing."
        />
        <div className="mt-14">
          <RoleFlow roles={roles} highlight="DoDAO" arrowLabels={['File, specimen, consent', 'Report and raw data']} />
        </div>
        <p className="mt-8 max-w-4xl text-sm leading-6 text-muted">
          Legal basis: Regulation (EU) 2023/1230, Article 32 (use of subcontractors by notified bodies). The independence rules of Article 30 apply to us as
          they apply to you. See also the Blue Guide 2022, section 5.2.5. Contract review, the evaluation plan and the certification decision stay with you.
        </p>
      </div>
    </section>
  );
}

const packageIcons = [DocumentMagnifyingGlassIcon, CpuChipIcon, ShieldCheckIcon];

function PackageCard({ pkg }: { pkg: Package }) {
  const Icon = packageIcons[pkg.number - 1];
  return (
    <article id={pkg.id} className="flex scroll-mt-24 flex-col rounded-3xl bg-surface p-7 ring-1 ring-border sm:p-8">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-medium text-accent">Package {pkg.number}</p>
          <h3 className="text-xl font-semibold leading-tight text-heading">{pkg.title}</h3>
        </div>
      </div>
      <p className="mt-5 text-[0.95rem] leading-7 text-body">{pkg.summary}</p>
      <p className="mt-3 text-sm text-muted">Basis: {pkg.basis}</p>
      <div className="mt-6 space-y-5">
        {pkg.groups.map((group) => (
          <div key={group.name}>
            <h4 className="text-sm font-semibold text-heading">{group.name}</h4>
            <ul className="mt-2.5 space-y-2">
              {group.checks.map((check) => (
                <li key={check} className="flex gap-2.5 text-[0.95rem] leading-6 text-body">
                  <span className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-primary" aria-hidden="true" />
                  {check}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-auto pt-7">
        <span className="flex items-start gap-2.5 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-medium text-heading ring-1 ring-inset ring-primary/30">
          <ClipboardDocumentCheckIcon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
          {pkg.output}
        </span>
      </p>
    </article>
  );
}

function Packages() {
  return (
    <section id="packages" className="dodao-light scroll-mt-20 bg-bg py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="What we do"
          title={<span className="block text-balance">Three packages, used alone or together</span>}
          lead="Each package is a set of specific technical tasks you can assign to us. Physical tests on the specimen, such as stopping time or contact force, and production checks that every unit runs the certified model version, can be added where your plan needs them."
        />
        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Traceability() {
  return (
    <section className="relative overflow-hidden bg-bg py-24 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="How results map to the Regulation"
          title={<span className="block text-balance">Every test points to a clause</span>}
          lead="Our reports are organised by requirement, so your reviewer can check each result against the text it supports."
        />
        <div className="mt-12 overflow-x-auto rounded-3xl bg-surface ring-1 ring-border">
          <table className="w-full min-w-[46rem] text-left">
            <thead>
              <tr className="border-b border-border text-sm text-heading">
                <th scope="col" className="px-6 py-4 font-semibold">
                  Requirement
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  How we test it
                </th>
                <th scope="col" className="px-6 py-4 font-semibold">
                  Evidence in the report
                </th>
              </tr>
            </thead>
            <tbody>
              {traceRows.map((row) => (
                <tr key={row.requirement} className="border-b border-border last:border-0 align-top">
                  <td className="px-6 py-4">
                    <p className="text-[0.95rem] font-medium leading-6 text-heading">{row.requirement}</p>
                    <p className="mt-1 font-mono text-xs text-accent">{row.ref}</p>
                  </td>
                  <td className="px-6 py-4 text-[0.95rem] leading-6 text-body">{row.test}</td>
                  <td className="px-6 py-4 text-[0.95rem] leading-6 text-body">{row.evidence}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 rounded-3xl bg-primary/10 p-7 ring-1 ring-inset ring-primary/40 sm:p-9 lg:grid-cols-[auto_1fr] lg:items-center">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-primary text-primary-text">
              <ScaleIcon className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="font-display text-4xl font-semibold text-heading">~3,000</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-heading">Example: checking a 99.9% claim</h3>
            <p className="mt-1.5 text-[0.95rem] leading-7 text-body">
              {trialsExample.claim} {trialsExample.answer} {trialsExample.method} {trialsExample.how}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItRuns() {
  return (
    <section className="dodao-light bg-bg py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="How an engagement runs"
          title={<span className="block text-balance">Six steps, each one on record</span>}
          lead="Every step leaves a record that you and your notifying authority can inspect."
        />
        <ol className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {engagementSteps.map((step, index) => (
            <li key={step.title} className="rounded-3xl bg-surface p-7 ring-1 ring-border">
              <span className="font-display text-4xl font-semibold text-primary/80">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-4 text-lg font-semibold text-heading">{step.title}</h3>
              <p className="mt-2 text-[0.95rem] leading-6 text-body">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-6 rounded-3xl bg-surface p-7 ring-1 ring-border sm:p-9">
          <h3 className="flex items-center gap-2.5 text-xl font-semibold text-heading">
            <ClipboardDocumentCheckIcon className="h-6 w-6 text-accent" aria-hidden="true" />
            What every report contains
          </h3>
          <p className="mt-1.5 text-[0.95rem] text-muted">Laid out along the ISO/IEC 17025 rules for test reports.</p>
          <ul className="mt-6 grid grid-cols-1 gap-x-10 gap-y-3 md:grid-cols-2">
            {reportContents.map((item) => (
              <li key={item} className="flex gap-2.5 text-[0.95rem] leading-6 text-body">
                <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-link" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

const safeguardIcons = [ScaleIcon, UserGroupIcon, LockClosedIcon, ClipboardDocumentCheckIcon];

function Safeguards() {
  return (
    <section className="relative overflow-hidden bg-bg py-24 sm:py-28">
      <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-7">
          <SectionIntro kicker="Safeguards" title={<span className="block text-balance">Work you can rely on in your assessment</span>} />
          <ul className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2">
            {safeguards.map((item, index) => {
              const Icon = safeguardIcons[index];
              return (
                <li key={item.title}>
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-heading">{item.title}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-6 text-body">{item.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-3xl bg-surface p-7 ring-1 ring-border sm:p-9 lg:col-span-5">
          <h3 className="text-xl font-semibold text-heading">Points we agree with you first</h3>
          <p className="mt-2 text-[0.95rem] leading-6 text-body">
            The Regulation leaves these open for ML. We settle them with each notified body before the first job.
          </p>
          <ol className="mt-6 space-y-4">
            {openPoints.map((point, index) => (
              <li key={point} className="flex gap-3.5 text-[0.95rem] leading-6 text-body">
                <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-text">
                  {index + 1}
                </span>
                {point}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function WhyUs() {
  const icons = [CpuChipIcon, CubeTransparentIcon, ClipboardDocumentCheckIcon];
  return (
    <section className="dodao-light bg-bg py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:items-stretch lg:px-8">
        <div className="lg:col-span-5">
          <SectionIntro kicker="Why DoDAO" title={<span className="block text-balance">ML engineers who test robots</span>} />
          <ul className="mt-10 space-y-7">
            {strengths.map((item, index) => {
              const Icon = icons[index];
              return (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-heading">{item.title}</h3>
                    <p className="mt-1.5 text-[0.95rem] leading-6 text-body">{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="flex flex-col rounded-3xl bg-surface p-5 ring-1 ring-border sm:p-7 lg:col-span-7">
          <SimVsRealShots />
          <div className="mt-auto pt-6">
            <h3 className="flex items-center gap-2.5 text-lg font-semibold text-heading">
              <CubeTransparentIcon className="h-6 w-6 text-primary" aria-hidden="true" />
              Search in simulation, confirm on the specimen
            </h3>
            <p className="mt-1.5 text-[0.95rem] leading-6 text-body">
              The same task, matched in simulation and on the real arm. For an assessment, simulation finds the rare conditions worth testing, and the results
              you rely on come from the specimen.
            </p>
            <ActionLink href="/#use-cases" variant="secondary" className="mt-5">
              See our robotics work
            </ActionLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="relative isolate scroll-mt-20 overflow-hidden bg-viewport">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* Placeholder stock footage (Mixkit free licence), same treatment as the /robot-safety closing section */}
        <LoopingVideo
          src="/robotics/stock-footage/industrial-cell.mp4"
          poster="/robotics/stock-footage/industrial-cell.jpg"
          label=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-viewport/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-viewport via-viewport/80 to-primary/30" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-semibold leading-[1.05] text-on-viewport sm:text-5xl lg:text-6xl">Start with one file.</h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-on-viewport/80">
            Pick one upcoming Annex I Part A application. We propose a detailed test plan for the ML tasks, with methods and pass criteria, for your team to
            review.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ActionLink href={ML_EVAL_CONTACT_MAILTO} size="lg">
              Email info@dodao.com
            </ActionLink>
            <ActionLink href={REGULATION_URL} size="lg" variant="onColor" external>
              Read Regulation (EU) 2023/1230
            </ActionLink>
          </div>
          <div className="mt-8">
            <PdfDownload onViewport />
          </div>
          <p className="mt-10 text-sm text-on-viewport-muted">
            References are paraphrased; the Official Journal text governs. This page gives general information and is not legal advice.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function MlEvaluationPage() {
  return (
    <div>
      <Hero />
      <TheGap />
      <WhereWeFit />
      <Packages />
      <Traceability />
      <HowItRuns />
      <Safeguards />
      <WhyUs />
      <Contact />
      <Footer showSiteLinks />
    </div>
  );
}
