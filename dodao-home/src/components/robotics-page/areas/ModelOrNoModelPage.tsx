import { CONTACT_MAILTO } from '@/components/home/DoDAOHome/components/DoDAOHomeHero';
import { Footer } from '@/components/home/DoDAOHome/components/Footer';
import { StageMap } from '@/components/home/DoDAOHome/components/ModelOrCodeMap';
import { ActionLink, SectionIntro } from '@/components/home/DoDAOHome/components/SiteUi';
import StartProject from '@/components/home/DoDAOHome/components/StartProject';

const principles = [
  {
    title: 'Start from a scripted baseline',
    description: 'Every learned approach has to beat a programmed one on the same scenes, scored the same way. If it does not, the programmed one ships.',
  },
  {
    title: 'Count successes on your arm',
    description:
      'Success rates from different labs are not comparable. 18 successes in 20 trials only tells you the true rate is somewhere between 68% and 99%, so we run enough trials to decide.',
  },
  {
    title: 'Learn only what geometry gets wrong',
    description:
      'The useful question is not whether to learn, but which quantity is worth learning. Often a small learned part inside a programmed system does best.',
  },
  {
    title: 'Keep a programmed safety envelope',
    description:
      'Current vision-language-action models output positions. None of them controls force and none can refuse, so workspace and force limits stay in code.',
  },
];

const factors = [
  ['Part variety', 'A few known parts with CAD models', 'Many part types, or new ones every week'],
  ['Scene', 'Fixtured parts and controlled lighting', 'Clutter, changing light, shiny or clear parts'],
  ['Data', 'No demonstrations or images available', 'Demonstrations or simulated data are possible'],
  ['Compute on the robot', 'Controller or PLC only', 'A GPU or Jetson-class computer next to the cell'],
  ['Timing', 'Hard real-time loops (2 ms at 500 Hz)', 'Decisions that can take 30 to 100 ms'],
  ['Certification', 'Every behavior must be explainable', 'Behavior can be bounded by a safety envelope'],
];

const hybrids = [
  {
    title: 'Learned perception, programmed motion',
    description: 'A fine-tuned detector finds the part; MoveIt 2 plans a collision-free path to it. The most common design we ship.',
  },
  {
    title: 'Learned proposals, geometric checks',
    description: 'A grasp model proposes where to grip in a cluttered bin; collision and reachability checks reject anything unsafe.',
  },
  {
    title: 'Programmed approach, learned last centimeters',
    description: 'A planner handles free-space moves; a learned policy handles the contact-rich insertion or placement at the end.',
  },
];

export default function ModelOrNoModelPage() {
  return (
    <div>
      <section className="dodao-glow relative overflow-hidden bg-bg">
        <div
          className="dodao-viewport-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(80%_70%_at_50%_0%,black,transparent)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-20 text-center sm:px-6 lg:pb-24 lg:pt-28">
          <nav aria-label="Breadcrumb" className="text-sm text-muted">
            <a href="/#capabilities" className="hover:text-heading">
              Robotics
            </a>
            <span className="mx-2" aria-hidden="true">
              /
            </span>
            <span className="text-accent">Model or no model</span>
          </nav>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.04] text-heading sm:text-6xl">Model or no model?</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-body">
            Learned models handle variety but can surprise you. Programmed approaches are predictable but break when something changes. We make the call
            separately for each stage of a task, and we show you the evidence.
          </p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <ActionLink href={CONTACT_MAILTO} size="lg">
              Start a project
            </ActionLink>
            <ActionLink href="#stages" size="lg" variant="secondary">
              See the four stages
            </ActionLink>
          </div>
        </div>
      </section>

      <section className="dodao-light bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title="Four rules we follow" />
          <ul className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => (
              <li key={principle.title} className="rounded-3xl bg-surface p-7 ring-1 ring-border">
                <h3 className="text-lg font-semibold leading-snug text-heading">{principle.title}</h3>
                <p className="mt-3 text-[0.95rem] leading-6 text-body">{principle.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="stages" className="relative scroll-mt-20 overflow-hidden bg-bg py-24">
        <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro
            title="The call, stage by stage"
            lead="Every pick-and-place task passes through the same four stages. Pick a stage to see both approaches and how we choose."
          />
          <div className="mt-12">
            <StageMap />
          </div>
        </div>
      </section>

      <section className="dodao-light bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title="What tips the decision" lead="Your constraints decide more than the model leaderboard does." />
          <div className="mt-10 overflow-x-auto rounded-3xl bg-surface ring-1 ring-border">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-border bg-bg/60 text-sm text-muted">
                <tr>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Factor
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Points to programmed
                  </th>
                  <th scope="col" className="px-6 py-4 font-medium">
                    Points to learned
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {factors.map(([factor, programmed, learned]) => (
                  <tr key={factor}>
                    <th scope="row" className="px-6 py-4 font-semibold text-heading">
                      {factor}
                    </th>
                    <td className="px-6 py-4 text-body">{programmed}</td>
                    <td className="px-6 py-4 text-body">{learned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionIntro title="Hybrid designs we use" lead="Most systems we build are neither fully learned nor fully programmed." />
          <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {hybrids.map((hybrid) => (
              <li key={hybrid.title} className="rounded-3xl bg-surface p-7 ring-1 ring-border">
                <h3 className="font-display text-xl font-semibold text-heading">{hybrid.title}</h3>
                <p className="mt-3 text-base leading-7 text-body">{hybrid.description}</p>
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
