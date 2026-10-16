import {
  AdjustmentsHorizontalIcon,
  CubeTransparentIcon,
  PuzzlePieceIcon,
  RocketLaunchIcon,
  ScaleIcon,
  ServerStackIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { ComponentType, SVGProps } from 'react';
import { ActionLink, SectionIntro } from './SiteUi';

type HelpPoint = {
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const lead: HelpPoint = {
  title: 'Decide model or no model, stage by stage',
  description:
    'A robot task is a chain: see the part, choose a grasp, move, place. For each link we test a learned model against a programmed approach in your cell, on randomized scenes and then on hardware, and use whichever wins on success rate and cycle time.',
  icon: ScaleIcon,
};

const points: HelpPoint[] = [
  {
    title: 'Latest models, predictable behavior',
    description:
      'We work hands-on with current imitation-learning and vision-language-action models, and wrap them in workspace limits, force limits and fallbacks.',
    icon: SparklesIcon,
  },
  {
    title: 'Designed around your constraints',
    description: 'Cell conditions, network access on the floor, the GPUs you can train on and the compute that fits on the robot all shape the design.',
    icon: AdjustmentsHorizontalIcon,
  },
  {
    title: 'Hybrid designs where they pay off',
    description: 'Learned perception with geometric grasp checks. A planner for free moves, a learned policy for the contact-rich last centimeters.',
    icon: PuzzlePieceIcon,
  },
  {
    title: 'Proven in simulation before you buy',
    description: 'We model your robot, gripper, cameras and cell to check reach, layout and cycle time before you commit budget.',
    icon: CubeTransparentIcon,
  },
  {
    title: 'End to end, demonstration to deployment',
    description: 'Demonstrations, data, training, evaluation and installation on your floor. One team carries the project the whole way.',
    icon: RocketLaunchIcon,
  },
  {
    title: 'Every licence checked before it ships',
    description:
      'YOLO is AGPL, FoundationPose is non-commercial, some grasp models need a locked key. We check code and weights before anything reaches your product.',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Fits your systems, then handed over',
    description: 'ROS 2, your arms, cameras, PLCs and line controls. Then documented code, data and evaluation tools your engineers can run.',
    icon: ServerStackIcon,
  },
];

function PointIcon({ icon: Icon }: { icon: HelpPoint['icon'] }) {
  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
  );
}

export default function HowWeHelp() {
  return (
    <section id="how-we-help" className="dodao-light scroll-mt-20 bg-bg py-24 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          title="How we help"
          lead="A demo that works once is easy. A cell that keeps working when the parts, the lighting and the shift change is the real job."
        />

        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <li className="relative overflow-hidden rounded-3xl bg-primary p-8 text-primary-text sm:col-span-2 lg:p-10">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent to-viewport/50" aria-hidden="true" />
            <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
            <div className="relative">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-text/15 ring-1 ring-inset ring-primary-text/30">
                <lead.icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-display mt-8 max-w-xl text-2xl font-semibold leading-tight lg:text-3xl">{lead.title}</h3>
              <p className="mt-4 max-w-2xl text-base leading-7 text-primary-text/85">{lead.description}</p>
              <ActionLink href="/robotics/model-or-no-model" variant="onColor" className="mt-8">
                How we decide
              </ActionLink>
            </div>
          </li>
          {points.map((point) => (
            <li
              key={point.title}
              className="rounded-3xl bg-surface p-7 ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10"
            >
              <PointIcon icon={point.icon} />
              <h3 className="mt-6 text-lg font-semibold leading-snug text-heading">{point.title}</h3>
              <p className="mt-2.5 text-[0.95rem] leading-6 text-body">{point.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
