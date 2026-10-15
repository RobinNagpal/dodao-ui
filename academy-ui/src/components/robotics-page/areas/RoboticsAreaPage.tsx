import { CONTACT_MAILTO } from '@/components/home/DoDAOHome/components/DoDAOHomeHero';
import { Footer } from '@/components/home/DoDAOHome/components/Footer';
import LoopingVideo from '@/components/home/DoDAOHome/components/LoopingVideo';
import { ActionLink, SectionIntro } from '@/components/home/DoDAOHome/components/SiteUi';
import StartProject from '@/components/home/DoDAOHome/components/StartProject';
import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { AreaMedia, RoboticsArea, roboticsAreas } from './roboticsAreas';

// Full class names so Tailwind can see them.
const capabilityColumns: Record<number, string> = { 1: '', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3' };

function HeroMedia({ media }: { media: AreaMedia }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-viewport ring-1 ring-border shadow-[0_30px_80px_-30px_rgb(var(--primary-rgb)/0.6)]">
      {media.kind === 'video' && <LoopingVideo src={media.src} poster={media.poster} label={media.alt} className="aspect-[4/3] w-full object-cover" />}
      {media.kind === 'image' && <Image src={media.src} alt={media.alt} width={1200} height={900} className="aspect-[4/3] w-full object-cover" priority />}
      {media.kind === 'pair' && (
        <div className="grid grid-cols-2 gap-px bg-on-viewport/10">
          {media.items.map((item) => (
            <figure key={item.src} className="relative">
              <Image src={item.src} alt={item.alt} width={600} height={600} className="aspect-[3/4] w-full object-cover" priority />
              <figcaption className="absolute left-3 top-3 rounded-full bg-viewport/80 px-3 py-1 text-xs font-medium text-on-viewport">{item.label}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-3 text-base leading-7 text-body">
      <span className="mt-[11px] h-1.5 w-1.5 flex-none rounded-full bg-primary" aria-hidden="true" />
      {children}
    </li>
  );
}

export default function RoboticsAreaPage({ area }: { area: RoboticsArea }) {
  const otherAreas = roboticsAreas.filter((a) => a.slug !== area.slug);

  return (
    <div>
      {/* Hero */}
      <section className="dodao-glow relative overflow-hidden bg-bg">
        <div
          className="dodao-viewport-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_70%_at_30%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:pb-28 lg:pt-24">
          <div className="lg:col-span-6">
            <nav aria-label="Breadcrumb" className="text-sm text-muted">
              <a href="/#capabilities" className="hover:text-heading">
                Robotics
              </a>
              <span className="mx-2" aria-hidden="true">
                /
              </span>
              <span className="text-accent">{area.name}</span>
            </nav>
            <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.04] text-heading sm:text-5xl lg:text-6xl">{area.title}</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-body">{area.lead}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <ActionLink href={CONTACT_MAILTO} size="lg">
                Start a project
              </ActionLink>
              <ActionLink href="/robotics/model-or-no-model" size="lg" variant="secondary">
                How we choose models
              </ActionLink>
            </div>
          </div>
          <div className="lg:col-span-6">
            <HeroMedia media={area.heroMedia} />
          </div>
        </div>
      </section>

      {/* Figures from our notes */}
      <section className="border-y border-border bg-surface">
        <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-border px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {area.facts.map((fact) => (
            <div key={fact.value} className="py-8 md:px-8 md:first:pl-0 md:last:pr-0">
              <dt className="sr-only">{fact.label}</dt>
              <dd>
                <span className="font-display block text-3xl font-semibold text-accent">{fact.value}</span>
                <span className="mt-2 block text-[0.95rem] leading-6 text-body">{fact.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* What we do */}
      <section className="dodao-light bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title="What we do" />
          <ul className={`mt-12 grid grid-cols-1 gap-4 ${capabilityColumns[Math.min(area.capabilities.length, 3)]}`}>
            {area.capabilities.map((capability) => (
              <li key={capability.name} className="rounded-3xl bg-surface p-8 ring-1 ring-border">
                <h3 className="font-display text-2xl font-semibold text-heading">{capability.name}</h3>
                <p className="mt-3 text-base leading-7 text-body">{capability.description}</p>
                <ul className={`mt-6 grid gap-x-8 gap-y-2 ${area.capabilities.length === 1 ? 'sm:grid-cols-2' : ''}`}>
                  {capability.details.map((detail) => (
                    <Bullet key={detail}>{detail}</Bullet>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Model or no model, for this area */}
      <section className="relative overflow-hidden bg-bg py-24">
        <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro kicker="Model or no model" title={area.modelCall.question} />
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-3xl bg-surface/80 p-7 ring-1 ring-border backdrop-blur">
              <h3 className="text-lg font-semibold text-heading">Programmed approach</h3>
              <ul className="mt-4 space-y-2">
                {area.modelCall.programmed.map((item) => (
                  <Bullet key={item}>{item}</Bullet>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-surface/80 p-7 ring-1 ring-border backdrop-blur">
              <h3 className="text-lg font-semibold text-heading">Learned approach</h3>
              <ul className="mt-4 space-y-2">
                {area.modelCall.learned.map((item) => (
                  <Bullet key={item}>{item}</Bullet>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl bg-primary p-7 text-primary-text">
              <h3 className="text-lg font-semibold">How we choose</h3>
              <p className="mt-4 text-base leading-7 text-primary-text/90">{area.modelCall.howWeChoose}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="dodao-light bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title={area.table.title} lead={area.table.intro} />
          <div className="mt-10 overflow-x-auto rounded-3xl bg-surface ring-1 ring-border">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-border bg-bg/60 text-sm text-muted">
                <tr>
                  {area.table.columns.map((column) => (
                    <th key={column} scope="col" className="px-6 py-4 font-medium">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {area.table.rows.map((row) => (
                  <tr key={row[0]}>
                    {row.map((cell, index) =>
                      index === 0 ? (
                        <th key={cell} scope="row" className="px-6 py-4 font-semibold text-heading">
                          {cell}
                        </th>
                      ) : (
                        <td key={cell} className="px-6 py-4 text-body">
                          {cell}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {area.table.note && <p className="mt-4 text-sm text-muted">{area.table.note}</p>}
        </div>
      </section>

      {/* Tools and deliverables */}
      <section className="bg-bg py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <h2 className="font-display text-3xl font-semibold text-heading">Tools we use</h2>
            <ul className="mt-8 flex flex-wrap gap-2">
              {area.tools.map((tool) => (
                <li key={tool} className="rounded-full bg-surface px-4 py-2 text-sm font-medium text-heading ring-1 ring-inset ring-border">
                  {tool}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-3xl font-semibold text-heading">What you get</h2>
            <ul className="mt-8 space-y-3">
              {area.deliverables.map((item) => (
                <li key={item} className="flex items-start gap-3 rounded-2xl bg-surface p-5 text-base text-heading ring-1 ring-border">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 flex-none text-accent" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            {area.docLinks.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-medium text-muted">Read more in our notes</p>
                <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                  {area.docLinks.map((doc) => (
                    <li key={doc.href}>
                      <a
                        href={doc.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-link hover:underline"
                      >
                        {doc.title}
                        <ArrowUpRightIcon className="h-4 w-4" aria-hidden="true" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Other areas */}
      <section className="dodao-light bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title="Other areas" />
          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {otherAreas.map((other) => (
              <li key={other.slug}>
                <a
                  href={`/robotics/${other.slug}`}
                  className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-3xl bg-viewport p-6 ring-1 ring-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  <Image
                    src={other.cardImage}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 100vw"
                    className="object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-viewport via-viewport/60 to-transparent" aria-hidden="true" />
                  <div className="relative">
                    <h3 className="text-xl font-semibold text-on-viewport">{other.name}</h3>
                    <p className="mt-1.5 text-sm leading-5 text-on-viewport/80">{other.summary}</p>
                  </div>
                </a>
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
