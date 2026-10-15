import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { CONTACT_MAILTO } from './DoDAOHomeHero';
import LoopingVideo from './LoopingVideo';
import { ActionLink, SectionIntro } from './SiteUi';

type Step = {
  title: string;
  description: string;
  outcome: string;
};

const steps: Step[] = [
  {
    title: 'Scope the task',
    description: 'We study the cell from a visit or videos, agree on target success rate and cycle time, and decide model or no model for each stage.',
    outcome: 'A written plan with the approach per stage',
  },
  {
    title: 'Build the simulation',
    description: 'Robot, gripper, cameras, parts and cell, modeled to match reality. We check reach and layout and settle the hardware choice.',
    outcome: 'A working simulated cell',
  },
  {
    title: 'Collect data and train',
    description: 'Synthetic images, teleoperated demonstrations and simulated practice feed the perception models and policies.',
    outcome: 'Trained models and the data behind them',
  },
  {
    title: 'Evaluate',
    description: 'Randomized trials in simulation, then a staged test on your hardware, compared against a scripted baseline.',
    outcome: 'A report you can sign off on',
  },
  {
    title: 'Deploy and hand over',
    description: 'Installation on your floor, integration with ROS 2 and your line controls, monitoring, and training for your engineers.',
    outcome: 'A running cell your team owns',
  },
];

export default function EngagementSteps() {
  return (
    <section id="approach" className="relative scroll-mt-20 overflow-clip bg-bg py-24 sm:py-28">
      <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 px-4 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8">
        {/* Intro and footage stay in view while the steps scroll past */}
        <div className="lg:sticky lg:top-28 lg:col-span-5 lg:self-start">
          <SectionIntro title="How a project runs" lead="Five stages, each ending in something you can review before we move on." />
          <div className="mt-10 overflow-hidden rounded-3xl bg-viewport ring-1 ring-border shadow-[0_30px_80px_-30px_rgb(var(--primary-rgb)/0.6)]">
            <LoopingVideo
              src="/robotics/clips/factory-arm.mp4"
              poster="/robotics/clips/factory-arm.jpg"
              label="A robot arm working in a production cell"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <ActionLink href={CONTACT_MAILTO} className="mt-8">
            Start with a scoping call
          </ActionLink>
        </div>

        <div className="relative lg:col-span-7">
          {/* The rail joining the step numbers */}
          <div
            className="pointer-events-none absolute bottom-10 left-6 top-10 w-px bg-gradient-to-b from-primary via-accent/50 to-border sm:left-7"
            aria-hidden="true"
          />
          <ol className="relative space-y-4">
            {steps.map((step, index) => (
              <li key={step.title} className="relative flex gap-4 sm:gap-6">
                <span
                  className="font-display relative flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-surface text-lg font-semibold text-heading ring-1 ring-inset ring-primary/50 sm:h-14 sm:w-14 sm:text-xl"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 rounded-3xl bg-surface/80 p-6 ring-1 ring-border backdrop-blur sm:p-7">
                  <h3 className="text-xl font-semibold text-heading">
                    <span className="sr-only">Step {index + 1}: </span>
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[0.95rem] leading-7 text-body">{step.description}</p>
                  <p className="mt-5 inline-flex items-start gap-2 rounded-xl bg-accent/10 px-3.5 py-2 text-sm font-medium text-heading ring-1 ring-inset ring-accent/25">
                    <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                    {step.outcome}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
