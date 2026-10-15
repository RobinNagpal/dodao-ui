import { CheckCircleIcon } from '@heroicons/react/20/solid';
import { SectionIntro } from './SiteUi';

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
    <section id="approach" className="relative scroll-mt-20 overflow-hidden bg-bg py-24 sm:py-28">
      <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro title="How a project runs" lead="Five stages, each ending in something you can review before we move on." />

        <ol className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex flex-col rounded-3xl bg-surface/80 p-6 ring-1 ring-border backdrop-blur">
              <span className="font-display text-5xl font-semibold text-primary/90" aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-6 text-lg font-semibold text-heading">
                <span className="sr-only">Step {index + 1}: </span>
                {step.title}
              </h3>
              <p className="mt-2 flex-1 text-[0.95rem] leading-6 text-body">{step.description}</p>
              <p className="mt-6 flex items-start gap-2 border-t border-border pt-4 text-sm font-medium text-heading">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-none text-accent" aria-hidden="true" />
                {step.outcome}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
