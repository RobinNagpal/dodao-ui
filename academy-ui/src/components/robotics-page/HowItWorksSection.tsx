import { ChatBubbleLeftRightIcon, ClipboardDocumentListIcon, CubeTransparentIcon, EyeIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const steps = [
  {
    step: '01',
    title: 'Discovery Call',
    desc: 'We talk through your robot, your usecase, and what you need shipped. We pick the right simulator (Gazebo or Isaac Sim) for the job.',
    icon: ChatBubbleLeftRightIcon,
  },
  {
    step: '02',
    title: 'Written Proposal',
    desc: 'Within two business days you get a written proposal with scope, timeline and cost. No surprises later.',
    icon: ClipboardDocumentListIcon,
  },
  {
    step: '03',
    title: 'Simulation World',
    desc: 'We build the robot, workspace, parts, sensors, lighting and physics so the scene matches your real cell.',
    icon: CubeTransparentIcon,
  },
  {
    step: '04',
    title: 'Synthetic Data Pipeline',
    desc: 'If your engagement includes data, we wire up the labeled-data pipeline next: detection, segmentation, depth, pose, demos and more.',
    icon: EyeIcon,
  },
  {
    step: '05',
    title: 'Handoff',
    desc: 'You get the project folder, the data, and a short doc that explains how to extend, retrain and ship to hardware.',
    icon: RocketLaunchIcon,
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-20 bg-surface">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">How Our Engagements Work</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">From discovery call to handoff</p>
          <p className="mt-4 text-lg text-body">
            Every engagement runs through the same five steps. The order is what keeps the timeline honest and the deliverables sharp.
          </p>
        </div>

        <div className="relative mt-16 max-w-4xl mx-auto">
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/40 to-link/40 hidden sm:block" />
          <ul className="space-y-8">
            {steps.map((step) => (
              <li key={step.step} className="relative flex items-start gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-link flex items-center justify-center text-primary-text font-bold text-lg shadow-lg">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1 rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-6">
                  <div className="flex items-start gap-4">
                    <div className="hidden sm:inline-flex items-center justify-center w-10 h-10 flex-none rounded-lg bg-gradient-to-br from-primary to-link">
                      <step.icon className="h-5 w-5 text-primary-text" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-heading">{step.title}</h3>
                      <p className="mt-2 text-base leading-relaxed text-body">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
