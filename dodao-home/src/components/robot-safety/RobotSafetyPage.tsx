import { Footer } from '@/components/home/DoDAOHome/components/Footer';
import LoopingVideo from '@/components/home/DoDAOHome/components/LoopingVideo';
import { ActionLink, SectionIntro } from '@/components/home/DoDAOHome/components/SiteUi';
import { ArrowPathIcon, ArrowRightIcon, CheckCircleIcon, CubeTransparentIcon, LinkIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { ReactNode } from 'react';
import {
  approvalChecks,
  engagementSteps,
  keyFacts,
  markets,
  milestones,
  roles,
  SAFETY_CONTACT_MAILTO,
  SafetyArea,
  safetyAreas,
  sharedEvidence,
} from './robotSafetyContent';
import { AttackSurfaceIllustration, DataFlowIllustration, SafetyZonesIllustration } from './SafetyIllustrations';
import SafetySelfCheck from './SafetySelfCheck';

/** The page is a static export, so "in force" vs "coming" is decided at build time. */
const BUILD_DATE = new Date();

function Hero() {
  const evidence = ['Risk assessment', 'AI test scenes', 'Pen test report', 'SOC 2 controls'];
  return (
    <section className="dodao-glow relative overflow-hidden bg-bg">
      <div
        className="dodao-viewport-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_70%_at_30%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:pb-28 lg:pt-24">
        <div className="lg:col-span-6">
          <p className="flex items-center gap-3 text-sm font-medium text-accent">
            <span className="h-px w-8 bg-accent" aria-hidden="true" />
            Robot safety &amp; security readiness
          </p>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.04] text-heading sm:text-5xl lg:text-6xl">
            Get your robot cleared to work around people.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-body">
            Before a robot goes live at a customer site, buyers, inspectors and regulators all want proof that it is safe and secure. We prepare that proof: we
            find the gaps, run the tests in simulation and on your robot, and hand a complete evidence pack to the lab or auditor who signs off.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ActionLink href={SAFETY_CONTACT_MAILTO} size="lg">
              Book a free 30-min call
            </ActionLink>
            <ActionLink href="#self-check" size="lg" variant="secondary">
              Check what applies to you
            </ActionLink>
          </div>
          <p className="mt-8 text-sm text-muted">For robot makers, AI robotics startups and integrators.</p>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-viewport ring-1 ring-border">
            <Image
              src="/robotics/stock-footage/factory-arm.jpg"
              alt="An industrial robot arm working inside a fenced cell on a factory floor"
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-viewport/80 via-transparent to-transparent" aria-hidden="true" />
          </div>
          {/* The output of the work: an evidence pack, floating over the cell */}
          <div className="relative -mt-16 ml-auto w-[min(100%,18rem)] rounded-2xl bg-surface/95 p-5 shadow-[0_20px_48px_-16px_rgb(0_0_0/0.6)] ring-1 ring-border backdrop-blur sm:-mt-24 sm:mr-6">
            <p className="text-xs font-medium text-muted">Evidence pack</p>
            <ul className="mt-3 space-y-2.5">
              {evidence.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-heading">
                  <CheckCircleIcon className="h-5 w-5 flex-none text-success" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted">Ready for the lab, the inspector and the buyer.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ApprovalPath() {
  return (
    <section className="dodao-light bg-bg py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="The road to the shop floor"
          title="There is no single approval"
          lead="A robot passes four separate checks between the factory and daily work, and each one is signed by someone different. Passing one does not pass the next."
        />
        <div className="relative mt-14">
          {/* Line joining the four numbered checks */}
          <div
            className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[2.9rem] hidden h-px bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 lg:block"
            aria-hidden="true"
          />
          <ol className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {approvalChecks.map((check, index) => (
              <li key={check.name} className="relative rounded-3xl bg-surface p-6 ring-1 ring-border">
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-text shadow-[0_0_0_6px_rgb(var(--bg-rgb))]">
                  {index + 1}
                </span>
                <h3 className="mt-5 text-xl font-semibold text-heading">{check.name}</h3>
                <p className="mt-1 text-sm font-medium text-accent">Signed by: {check.signedBy}</p>
                <p className="mt-3 text-[0.95rem] leading-6 text-body">{check.question}</p>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-8 max-w-3xl text-base leading-7 text-body">
          In the US, the site check is often the slowest step, and an on-site approval covers only that one site. Each new customer site needs its own.
        </p>
      </div>
    </section>
  );
}

function AreaVisual({ area }: { area: SafetyArea }) {
  if (area.id === 'ai-behaviour') {
    const scenes = ['Person steps into the cell', 'A part drops mid-move', 'New model version: re-run every scene'];
    return (
      <div className="relative h-full min-h-[360px] overflow-hidden rounded-3xl bg-viewport ring-1 ring-border">
        <Image
          src="/robotics/demos/franka-arm-simulation.jpg"
          alt="A robot arm picking a block in one of our physics simulations"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-viewport via-viewport/30 to-transparent" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <p className="text-xs font-medium text-on-viewport-muted">Test scenes, run in simulation</p>
          <ul className="mt-3 space-y-2">
            {scenes.map((scene) => (
              <li
                key={scene}
                className="flex items-center gap-2.5 rounded-xl bg-viewport/70 px-3 py-2 text-sm text-on-viewport ring-1 ring-on-viewport/15 backdrop-blur"
              >
                <CheckCircleIcon className="h-5 w-5 flex-none text-success" aria-hidden="true" />
                {scene}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }
  const Illustration = { 'physical-safety': SafetyZonesIllustration, cybersecurity: AttackSurfaceIllustration, 'company-security': DataFlowIllustration }[
    area.id
  ];
  return (
    <div className="relative flex h-full min-h-[300px] items-center justify-center overflow-hidden rounded-3xl bg-viewport p-4 ring-1 sm:p-8 ring-border">
      <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative w-full max-w-xl">{Illustration && <Illustration />}</div>
    </div>
  );
}

function Detail({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-heading">{title}</h4>
      <p className="mt-1.5 text-[0.95rem] leading-7 text-body">{children}</p>
    </div>
  );
}

function FourQuestions() {
  return (
    <section id="four-questions" className="relative scroll-mt-20 overflow-hidden bg-bg py-24 sm:py-28">
      <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="What we cover"
          title="Four questions, asked at every check"
          lead="Whoever is doing the check, they ask the same four things. One change, like a new AI model, can touch all four at once, so we handle them together."
        />
        <nav aria-label="The four questions" className="mt-10 flex flex-wrap gap-2">
          {safetyAreas.map((area) => (
            <a
              key={area.id}
              href={`#${area.id}`}
              className="rounded-full bg-surface px-4 py-2 text-sm font-medium text-heading ring-1 ring-border transition hover:bg-primary hover:text-primary-text hover:ring-primary"
            >
              {area.number} · {area.short}
            </a>
          ))}
        </nav>

        <div className="mt-16 space-y-20 lg:space-y-24">
          {safetyAreas.map((area, index) => (
            <article key={area.id} id={area.id} className="grid scroll-mt-24 grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-14">
              <div className={index % 2 ? 'lg:order-2' : ''}>
                <AreaVisual area={area} />
              </div>
              <div className="flex flex-col justify-center">
                <p className="flex items-center gap-3 text-sm font-medium text-accent">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-text">
                    {area.number}
                  </span>
                  {area.label}
                </p>
                <h3 className="font-display mt-4 text-3xl font-semibold leading-tight text-heading sm:text-4xl">{area.question}</h3>
                <div className="mt-7 space-y-5">
                  <Detail title="Why it is harder now">{area.whyNow}</Detail>
                  <Detail title="What we do">{area.whatWeDo}</Detail>
                </div>
                <div className="mt-7">
                  <h4 className="text-sm font-semibold text-heading">You get</h4>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {area.youGet.map((item) => (
                      <li key={item} className="rounded-full bg-primary/15 px-3 py-1.5 text-sm font-medium text-heading ring-1 ring-inset ring-primary/40">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="mt-6 text-sm text-muted">Standards and laws: {area.standards.join(' · ')}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyNow() {
  return (
    <section className="dodao-light bg-bg py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="Why now"
          title="The rules changed in 2025, and more arrive in 2026 and 2027"
          lead="The main robot safety standard was rewritten, and new EU laws on product security, liability and machinery start one after another."
        />
        <ol className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {milestones.map((milestone) => {
            const inForce = new Date(milestone.iso) <= BUILD_DATE;
            return (
              <li
                key={milestone.iso + milestone.title}
                className={`flex flex-col rounded-3xl p-6 ring-1 ${inForce ? 'bg-surface ring-border' : 'bg-surface/60 ring-primary/30'}`}
              >
                <span
                  className={`self-start whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    inForce ? 'bg-success/15 text-success' : 'bg-primary/10 text-primary'
                  }`}
                >
                  {inForce ? 'In force' : 'Coming'}
                </span>
                <p className="font-display mt-3 text-xl font-semibold text-heading">{milestone.date}</p>
                <p className="mt-4 flex-1 text-[0.95rem] leading-6 text-heading">{milestone.title}</p>
                <p className="mt-4 text-sm text-muted">{milestone.law}</p>
              </li>
            );
          })}
        </ol>

        <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {keyFacts.map((fact) => (
            <li key={fact.value} className="rounded-3xl bg-primary p-7 text-primary-text">
              <p className="font-display text-3xl font-semibold">{fact.value}</p>
              <p className="mt-2 text-[0.95rem] leading-6 text-primary-text/85">{fact.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function TwoMarkets() {
  return (
    <section className="dodao-glow relative overflow-hidden bg-bg py-24 sm:py-28">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="An example"
          title="One robot, two first customers"
          lead="A startup sells an AI robot cell to a car-parts factory in Germany and to a warehouse in the US. The rules work differently in each place."
        />
        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {markets.map((market) => (
            <div key={market.region} className="rounded-3xl bg-surface p-7 ring-1 ring-border sm:p-9">
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-base font-bold text-link ring-1 ring-inset ring-primary/40">
                  {market.region}
                </span>
                <div>
                  <h3 className="text-xl font-semibold text-heading">{market.title}</h3>
                  <p className="text-sm text-accent">{market.summary}</p>
                </div>
              </div>
              <ul className="mt-6 space-y-3">
                {market.points.map((point) => (
                  <li key={point} className="flex gap-3 text-base leading-7 text-body">
                    <span className="mt-[11px] h-1.5 w-1.5 flex-none rounded-full bg-primary" aria-hidden="true" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Where the two paths meet: most of the evidence is the same */}
        <div className="mt-4 rounded-3xl bg-primary/10 p-7 ring-1 ring-inset ring-primary/40 sm:p-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <h3 className="flex items-center gap-2.5 text-xl font-semibold text-heading">
                <LinkIcon className="h-6 w-6 text-accent" aria-hidden="true" />
                Most of the evidence is the same
              </h3>
              <p className="mt-2 text-[0.95rem] leading-6 text-body">
                So we build it once. Selling later in the UK, Canada, Japan or Korea? Their rules mostly build on the same ISO 10218 standard.
              </p>
            </div>
            <ul className="flex flex-wrap gap-2 lg:max-w-xl lg:justify-end">
              {sharedEvidence.map((item) => (
                <li key={item} className="rounded-full bg-surface px-4 py-2 text-sm font-medium text-heading ring-1 ring-border">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function SelfCheck() {
  return (
    <section id="self-check" className="dodao-light scroll-mt-20 bg-bg py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="Self-check"
          title="Which questions apply to you?"
          lead="Tick each line that is true for your company. The panel shows which of the four questions to start with."
        />
        <div className="mt-12">
          <SafetySelfCheck />
        </div>
      </div>
    </section>
  );
}

function HowWeWork() {
  return (
    <section className="relative overflow-hidden bg-bg py-24 sm:py-28">
      <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          kicker="How we work"
          title="Know where you stand before you commit"
          lead="Six steps. The first two are small and fixed in cost, and they tell you exactly what is missing before you sign up for anything larger."
        />
        <ol className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {engagementSteps.map((step, index) => {
            const startsHere = index < 2;
            const repeats = index >= 3;
            return (
              <li key={step.title} className={`relative rounded-3xl p-7 ring-1 ${startsHere ? 'bg-primary/10 ring-primary/50' : 'bg-surface ring-border'}`}>
                <div className="flex items-center justify-between gap-3">
                  <span className="font-display text-4xl font-semibold text-primary/80">{String(index + 1).padStart(2, '0')}</span>
                  {startsHere && <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-text">Start here</span>}
                  {repeats && <ArrowPathIcon className="h-5 w-5 text-accent" aria-label="Repeats after every change" />}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-heading">{step.title}</h3>
                <p className="mt-1 text-sm font-medium text-accent">{step.when}</p>
                <p className="mt-3 text-[0.95rem] leading-6 text-body">{step.text}</p>
              </li>
            );
          })}
        </ol>
        <p className="mt-6 flex items-center gap-2.5 text-sm text-muted">
          <ArrowPathIcon className="h-5 w-5 flex-none text-accent" aria-hidden="true" />
          Steps 4 to 6 repeat whenever the gripper, the software or the AI model changes.
        </p>

        <h3 className="font-display mt-20 text-2xl font-semibold text-heading sm:text-3xl">Who does what</h3>
        <div className="mt-8 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {roles.map((role, index) => (
            <RoleColumn
              key={role.name}
              role={role}
              highlight={role.name === 'Us'}
              arrowAfter={index < roles.length - 1 ? (index === 0 ? 'Access and decisions' : 'Ready evidence pack') : undefined}
            />
          ))}
        </div>
        <p className="mt-6 flex items-start gap-2.5 text-base leading-7 text-body">
          <ShieldCheckIcon className="mt-0.5 h-6 w-6 flex-none text-accent" aria-hidden="true" />
          We do not issue certificates. That keeps the final check independent, which is what your customers and regulators expect.
        </p>
      </div>
    </section>
  );
}

function RoleColumn({ role, highlight, arrowAfter }: { role: (typeof roles)[number]; highlight: boolean; arrowAfter?: string }) {
  return (
    <>
      <div className={`rounded-3xl p-7 ring-1 ${highlight ? 'bg-primary text-primary-text ring-primary' : 'bg-surface ring-border'}`}>
        <p className={`text-2xl font-semibold ${highlight ? '' : 'text-heading'}`}>{role.name}</p>
        <p className={`text-sm ${highlight ? 'text-primary-text/80' : 'text-accent'}`}>{role.role}</p>
        <ul className="mt-5 space-y-2.5">
          {role.duties.map((duty) => (
            <li key={duty} className={`flex gap-2.5 text-[0.95rem] leading-6 ${highlight ? 'text-primary-text' : 'text-body'}`}>
              <CheckCircleIcon className={`mt-0.5 h-5 w-5 flex-none ${highlight ? 'text-primary-text/80' : 'text-link'}`} aria-hidden="true" />
              {duty}
            </li>
          ))}
        </ul>
      </div>
      {arrowAfter && (
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted lg:flex-col lg:px-1">
          <ArrowRightIcon className="h-5 w-5 rotate-90 text-accent lg:rotate-0" aria-hidden="true" />
          <span className="lg:max-w-[5.5rem] lg:text-center">{arrowAfter}</span>
        </div>
      )}
    </>
  );
}

function WhyUs() {
  const reasons = [
    {
      icon: ShieldCheckIcon,
      title: 'Safety, AI and security in one place',
      text: 'A new AI model or a remote-access feature can affect all three. We check them together, instead of you coordinating three firms.',
    },
    {
      icon: CubeTransparentIcon,
      title: 'Simulation before hardware',
      text: 'We find risky contact points and edge cases early, before you buy safety parts or book a lab.',
    },
    {
      icon: LinkIcon,
      title: 'Evidence that stays current',
      text: 'Each test is linked to the risk it covers. After a change, you re-test only what is affected instead of starting again.',
    },
  ];
  return (
    <section className="dodao-light bg-bg py-24 sm:py-28">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <SectionIntro kicker="Why us" title="Built on the same tools we use to build robots" />
          <ul className="mt-10 space-y-7">
            {reasons.map((reason) => (
              <li key={reason.title} className="flex gap-4">
                <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                  <reason.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-heading">{reason.title}</h3>
                  <p className="mt-1.5 text-[0.95rem] leading-6 text-body">{reason.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-surface p-5 ring-1 ring-border sm:p-7">
            <div className="grid grid-cols-2 gap-3">
              {[
                { src: '/robotics/demos/ur-arm-pick-simulation.png', label: 'In simulation', alt: 'A UR robot arm picking a part in our simulation' },
                { src: '/robotics/demos/ur-arm-pick-real.png', label: 'On the real robot', alt: 'The same UR robot arm picking the part in the real cell' },
              ].map((shot) => (
                <figure key={shot.src}>
                  <div className="relative aspect-square overflow-hidden rounded-2xl bg-viewport">
                    <Image src={shot.src} alt={shot.alt} fill sizes="(min-width: 1024px) 28vw, 50vw" className="object-cover" />
                  </div>
                  <figcaption className="mt-2 text-center text-sm font-medium text-muted">{shot.label}</figcaption>
                </figure>
              ))}
            </div>
            <p className="mt-5 text-[0.95rem] leading-6 text-body">
              We model real arms, grippers, cameras and cells in physics simulation for our own robotics projects. The same models let us test safety cases
              before anyone stands next to the robot.
            </p>
            <ActionLink href="/#use-cases" variant="secondary" className="mt-5">
              See our simulation work
            </ActionLink>
          </div>
        </div>
      </div>
    </section>
  );
}

function StartCall() {
  return (
    <section id="contact" className="relative isolate scroll-mt-20 overflow-hidden bg-viewport">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* Placeholder stock footage (Mixkit free licence) */}
        <LoopingVideo
          src="/robotics/stock-footage/factory-arm.mp4"
          poster="/robotics/stock-footage/factory-arm.jpg"
          label=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-viewport/85" />
        <div className="absolute inset-0 bg-gradient-to-r from-viewport via-viewport/80 to-primary/30" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-semibold leading-[1.05] text-on-viewport sm:text-5xl lg:text-6xl">
            Start with a free <span className="whitespace-nowrap">30-minute</span> call.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-on-viewport/80">
            Tell us what your robot does and where you sell it. We will tell you which checks apply and what is missing.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ActionLink href={SAFETY_CONTACT_MAILTO} size="lg">
              Email info@dodao.com
            </ActionLink>
            <ActionLink href="#self-check" size="lg" variant="onColor">
              Take the self-check
            </ActionLink>
          </div>
          <p className="mt-12 text-sm text-on-viewport-muted">This page gives general information. It is not legal advice.</p>
        </div>
      </div>
    </section>
  );
}

export default function RobotSafetyPage() {
  return (
    <div>
      <Hero />
      <ApprovalPath />
      <FourQuestions />
      <WhyNow />
      <TwoMarkets />
      <SelfCheck />
      <HowWeWork />
      <WhyUs />
      <StartCall />
      <Footer showSiteLinks />
    </div>
  );
}
