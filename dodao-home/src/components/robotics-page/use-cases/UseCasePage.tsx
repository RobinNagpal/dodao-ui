import { CONTACT_MAILTO } from '@/components/home/DoDAOHome/components/DoDAOHomeHero';
import { Footer } from '@/components/home/DoDAOHome/components/Footer';
import LoopingVideo from '@/components/home/DoDAOHome/components/LoopingVideo';
import { ActionLink, Bullet, SectionIntro } from '@/components/home/DoDAOHome/components/SiteUi';
import StartProject from '@/components/home/DoDAOHome/components/StartProject';
import { roboticsAreas } from '@/components/robotics-page/areas/roboticsAreas';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import UseCaseCard from './UseCaseCard';
import { UseCase, mediaForUseCase, useCases } from './useCases';

export default function UseCasePage({ useCase }: { useCase: UseCase }) {
  const otherUseCases = useCases.filter((other) => other.slug !== useCase.slug);
  const areas = roboticsAreas.filter((area) => useCase.relatedAreas.includes(area.slug));

  return (
    <div>
      {/* Hero: the story in two sentences, then the full run */}
      <section className="dodao-glow relative overflow-hidden bg-bg">
        <div
          className="dodao-viewport-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_70%_at_30%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pb-20 lg:pt-24">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <a href="/#use-cases" className="hover:text-heading">
              Use cases
            </a>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-accent">{useCase.name}</span>
          </nav>
          {/* One column, so the spacing is the same whatever the title's length */}
          <h1 className="font-display mt-5 max-w-4xl text-4xl font-semibold leading-[1.04] text-heading sm:text-5xl lg:text-6xl">{useCase.title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-body">{useCase.lead}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ActionLink href={CONTACT_MAILTO} size="lg">
              Start a project
            </ActionLink>
            <ActionLink href="#how-it-works" size="lg" variant="secondary">
              How it works
            </ActionLink>
          </div>

          <figure className="mt-12 lg:mt-16">
            <div className="overflow-hidden rounded-3xl bg-viewport ring-1 ring-border shadow-[0_30px_80px_-30px_rgb(var(--primary-rgb)/0.6)]">
              <LoopingVideo
                src={mediaForUseCase(useCase.slug, 'demo.mp4')}
                poster={mediaForUseCase(useCase.slug, 'demo-poster.jpg')}
                label={useCase.videoAlt}
                controls
                className="block aspect-video w-full bg-viewport object-contain"
              />
            </div>
            <figcaption className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted">
              <span className="rounded-full bg-accent/10 px-3 py-1 font-medium text-heading ring-1 ring-inset ring-accent/25">{useCase.sector}</span>
              <span>The full run, in physics simulation ({useCase.simulator}), with models of the real arm, gripper and sensors.</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* The setup at a glance */}
      <section className="border-y border-border bg-surface">
        <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:divide-x lg:divide-y-0 lg:px-8">
          {useCase.setup.map((fact) => (
            <div key={fact.label} className="py-7 sm:pr-6 lg:px-6 lg:first:pl-0 lg:last:pr-0">
              <dt className="text-sm font-medium text-accent">{fact.label}</dt>
              <dd className="mt-2 text-base leading-7 text-heading">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Why it is hard */}
      <section className="dodao-light bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title="Why it is hard" lead={useCase.challenge.intro} />
          <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {useCase.challenge.points.map((point) => (
              <li key={point.title} className="rounded-3xl bg-surface p-7 ring-1 ring-border">
                <h3 className="text-lg font-semibold text-heading">{point.title}</h3>
                <p className="mt-2.5 text-[0.95rem] leading-7 text-body">{point.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How it works, step by step */}
      <section id="how-it-works" className="relative scroll-mt-20 overflow-clip bg-bg py-24">
        <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
          <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
            <SectionIntro title="How it works" lead="The same steps you see in the video, in order." />
          </div>
          <ol className="relative space-y-4 lg:col-span-8">
            {useCase.steps.map((step, index) => (
              <li key={step.title} className="flex gap-4 sm:gap-6">
                <span
                  className="font-display flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-surface text-lg font-semibold text-heading ring-1 ring-inset ring-primary/50"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 rounded-3xl bg-surface/80 p-6 ring-1 ring-border backdrop-blur">
                  <h3 className="text-lg font-semibold text-heading">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-7 text-body">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Model or no model, for this task */}
      <section className="dodao-light bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro kicker="Model or no model" title={useCase.modelCall.question} />
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-surface p-7 ring-1 ring-border">
              <h3 className="text-lg font-semibold text-heading">Learned</h3>
              <ul className="mt-4 space-y-2">
                {useCase.modelCall.learned.map((item) => (
                  <Bullet key={item}>{item}</Bullet>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-surface p-7 ring-1 ring-border">
              <h3 className="text-lg font-semibold text-heading">Programmed</h3>
              <ul className="mt-4 space-y-2">
                {useCase.modelCall.programmed.map((item) => (
                  <Bullet key={item}>{item}</Bullet>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-primary p-7 text-primary-text">
              <h3 className="text-lg font-semibold">How we chose</h3>
              <p className="mt-4 text-base leading-7 text-primary-text/90">{useCase.modelCall.howWeChose}</p>
              <a href="/robotics/model-or-no-model" className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline">
                How we decide in general
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Engineering decisions */}
      <section className="relative overflow-hidden bg-bg py-24">
        <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title="Decisions that made it work" />
          <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
            {useCase.decisions.map((decision) => (
              <li key={decision.title} className="rounded-3xl bg-surface/80 p-7 ring-1 ring-border backdrop-blur">
                <h3 className="text-lg font-semibold text-heading">{decision.title}</h3>
                <p className="mt-2.5 text-[0.95rem] leading-7 text-body">{decision.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Tools and what comes next */}
      <section className="dodao-light bg-bg py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-semibold text-heading">Tools we used</h2>
            <ul className="mt-8 flex flex-wrap gap-2">
              {useCase.tools.map((tool) => (
                <li key={tool} className="rounded-full bg-surface px-4 py-2 text-sm font-medium text-heading ring-1 ring-inset ring-border">
                  {tool}
                </li>
              ))}
            </ul>
            {areas.length > 0 && (
              <div className="mt-10">
                <p className="text-sm font-medium text-muted">Capabilities this draws on</p>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  {areas.map((area) => (
                    <li key={area.slug}>
                      <a href={`/robotics/${area.slug}`} className="inline-flex items-center gap-1 font-medium text-link hover:underline">
                        {area.name}
                        <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold text-heading">Where it goes next</h2>
            <ul className="mt-8 space-y-3">
              {useCase.next.map((item, index) => (
                <li key={item} className="flex items-start gap-4 rounded-2xl bg-surface p-5 text-base text-heading ring-1 ring-border">
                  <span className="font-display text-sm font-semibold text-accent" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* More use cases */}
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title="More use cases" />
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {otherUseCases.map((other) => (
              <li key={other.slug}>
                <UseCaseCard useCase={other} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <StartProject />
      <Footer showSiteLinks />
    </div>
  );
}
