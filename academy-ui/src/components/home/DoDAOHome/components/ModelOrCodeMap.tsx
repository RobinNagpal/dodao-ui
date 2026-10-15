'use client';

import { AdjustmentsHorizontalIcon, ArrowTrendingUpIcon, CodeBracketIcon, EyeIcon, HandRaisedIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { ComponentType, KeyboardEvent, SVGProps, useRef, useState } from 'react';
import { ActionLink, SectionIntro } from './SiteUi';

type Stage = {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  /** Where this stage usually lands, from 0 (programmed) to 100 (learned). */
  lean: [number, number];
  name: string;
  question: string;
  usualPick: string;
  programmed: string[];
  learned: string[];
  howWeChoose: string;
};

const stages: Stage[] = [
  {
    id: 'perception',
    icon: EyeIcon,
    lean: [60, 90],
    name: 'Perception',
    question: 'Where is the part, and which way is it facing?',
    usualPick: 'Often learned',
    programmed: ['Fixed camera poses and fiducial markers (AprilTag, ArUco)', 'Color and depth thresholds', 'Template matching against CAD models'],
    learned: [
      'Detection and segmentation models (RF-DETR, YOLO, SAM 2)',
      '6-DoF pose estimation for known and new objects',
      'Trained on synthetic images plus a small real set',
    ],
    howWeChoose:
      'If parts, fixtures and lighting are controlled, classical vision is cheaper and easier to certify. With many part types, clutter, or shiny and transparent parts, learned perception usually wins. We prove it on a held-out test set before we commit.',
  },
  {
    id: 'grasp',
    icon: HandRaisedIcon,
    lean: [35, 70],
    name: 'Grasp',
    question: 'Where should the gripper close?',
    usualPick: 'Usually hybrid',
    programmed: ['Grasps precomputed from CAD or simple shapes', 'Suction-point heuristics on flat faces', 'Taught grasp poses for fixed parts'],
    learned: ['Grasp proposals predicted from point clouds', 'Learned grasp-success scoring', 'Policies that grasp and adjust in one motion'],
    howWeChoose:
      'Known parts in known poses get precomputed grasps. Unknown or mixed objects in dense bins get learned proposals, then every proposal is filtered by collision and reachability checks before the arm moves.',
  },
  {
    id: 'motion',
    icon: ArrowTrendingUpIcon,
    lean: [5, 30],
    name: 'Motion',
    question: 'How does the arm get there without hitting anything?',
    usualPick: 'Usually programmed',
    programmed: [
      'MoveIt 2 planners and GPU motion generation (cuRobo)',
      'Inverse kinematics with collision checking',
      'Trajectory optimization for cycle time',
    ],
    learned: ['End-to-end visuomotor policies that output arm actions directly', 'Learned residuals on top of a planned path'],
    howWeChoose:
      'Free-space moves stay programmed. They are fast, verifiable and easy to tune for cycle time. Learned motion is kept for contact-rich or deformable work, where geometry alone stops being enough.',
  },
  {
    id: 'control',
    icon: AdjustmentsHorizontalIcon,
    lean: [15, 85],
    name: 'Control & policy',
    question: 'What does the robot do when contact starts?',
    usualPick: 'Depends on the task',
    programmed: ['State machines and behavior trees', 'Force and torque thresholds', 'Impedance and compliance control'],
    learned: [
      'Imitation learning from demonstrations (ACT, Diffusion Policy)',
      'Vision-language-action models (π0, GR00T, SmolVLA)',
      'Reinforcement learning fine-tuning in simulation',
    ],
    howWeChoose:
      'A learned policy always runs inside a programmed safety envelope: workspace limits, force limits and a fallback behavior. We compare its success rate and cycle time against a scripted baseline before recommending it.',
  },
];

/** Track from "programmed" to "learned" with the stage's usual range highlighted. Decorative: `usualPick` carries the same information as text. */
function LeanBar({ lean, labels }: { lean: Stage['lean']; labels?: boolean }) {
  const [from, to] = lean;
  return (
    <div aria-hidden="true">
      <div className="relative h-1.5 rounded-full bg-surface-2">
        <div
          className="absolute inset-y-0 rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_12px_rgb(var(--accent-rgb)/0.45)]"
          style={{ left: `${from}%`, width: `${to - from}%` }}
        />
      </div>
      {labels && (
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>Programmed</span>
          <span>Learned</span>
        </div>
      )}
    </div>
  );
}

function ApproachCard({ title, icon: Icon, items, dot }: { title: string; icon: Stage['icon']; items: string[]; dot: string }) {
  return (
    <div className="rounded-2xl bg-bg/50 p-6 ring-1 ring-inset ring-border">
      <h3 className="flex items-center gap-2.5 text-base font-semibold text-heading">
        <Icon className="h-5 w-5 text-link" aria-hidden="true" />
        {title}
      </h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-[0.95rem] leading-6 text-body">
            <span className={`mt-[9px] h-1.5 w-1.5 flex-none ${dot}`} aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The interactive four-stage pipeline. Used on the homepage and on /robotics/model-or-no-model. */
export function StageMap() {
  const [activeId, setActiveId] = useState(stages[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const activeIndex = stages.findIndex((s) => s.id === activeId);
  const active = stages[activeIndex];

  // Arrow-key navigation between tabs, per the WAI-ARIA tabs pattern.
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + stages.length) % stages.length;
    setActiveId(stages[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div>
      {/* The pipeline: one node per stage, joined by a line through the icons */}
      <div className="relative">
        <div
          className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-12 hidden h-px bg-gradient-to-r from-primary/40 via-accent/50 to-primary/40 md:block"
          aria-hidden="true"
        />
        <div role="tablist" aria-label="Stages of a manipulation task" className="relative grid grid-cols-2 gap-3 md:grid-cols-4">
          {stages.map((stage, index) => {
            const selected = stage.id === activeId;
            return (
              <button
                key={stage.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                role="tab"
                id={`stage-tab-${stage.id}`}
                aria-selected={selected}
                aria-controls="stage-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(stage.id)}
                onKeyDown={(e) => onKeyDown(e, index)}
                className={`group flex flex-col items-center rounded-3xl px-4 pb-6 pt-5 text-center transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  selected ? 'bg-surface ring-1 ring-inset ring-primary/60' : 'hover:bg-surface/50'
                }`}
              >
                <span
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl transition ${
                    selected
                      ? 'bg-primary text-primary-text shadow-[0_0_0_6px_rgb(var(--primary-rgb)/0.18),0_12px_32px_-8px_rgb(var(--primary-rgb)/0.9)]'
                      : 'bg-surface text-link ring-1 ring-inset ring-border group-hover:ring-primary/50'
                  }`}
                >
                  <stage.icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <span className="mt-4 text-xs text-muted">Stage {index + 1}</span>
                <span className="mt-0.5 text-lg font-semibold text-heading">{stage.name}</span>
                <span className={`mt-1 text-sm ${selected ? 'text-accent' : 'text-muted'}`}>{stage.usualPick}</span>
                <div className="mt-4 w-full max-w-[11rem]">
                  <LeanBar lean={stage.lean} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="stage-panel"
        role="tabpanel"
        aria-labelledby={`stage-tab-${active.id}`}
        className="mt-6 overflow-hidden rounded-3xl bg-surface/80 ring-1 ring-border backdrop-blur"
      >
        <div key={active.id} className="dodao-fade-in grid grid-cols-1 lg:grid-cols-12">
          <div className="border-b border-border p-7 sm:p-9 lg:col-span-5 lg:border-b-0 lg:border-r">
            <p className="text-sm font-medium text-accent">
              Stage {activeIndex + 1} of {stages.length}: {active.name}
            </p>
            <p className="font-display mt-3 text-2xl font-semibold leading-tight text-heading sm:text-3xl">{active.question}</p>
            <div className="mt-8">
              <p className="mb-3 text-sm font-medium text-heading">Our usual call: {active.usualPick}</p>
              <LeanBar lean={active.lean} labels />
            </div>
            <h3 className="mt-8 text-base font-semibold text-heading">How we choose</h3>
            <p className="mt-2 text-[0.95rem] leading-7 text-body">{active.howWeChoose}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-7 lg:col-span-7">
            <ApproachCard title="Programmed approach" icon={CodeBracketIcon} items={active.programmed} dot="rounded-sm bg-muted" />
            <ApproachCard title="Learned approach" icon={SparklesIcon} items={active.learned} dot="rounded-full bg-accent" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ModelOrCodeMap() {
  return (
    <section id="model-or-code" className="dodao-glow relative scroll-mt-20 overflow-hidden bg-bg py-24 sm:py-28">
      <div
        className="dodao-viewport-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionIntro
            kicker="Model or no model"
            title="Learned models where they help, proven code where they don't"
            lead="Every pick-and-place task runs through four stages: finding the part, choosing a grasp, moving the arm and handling contact. At each one we test both approaches and keep whichever is more reliable in your cell."
          />
          <ActionLink href="/robotics/model-or-no-model" variant="secondary" className="flex-none">
            Read our approach
          </ActionLink>
        </div>
        <div className="mt-14">
          <StageMap />
        </div>
      </div>
    </section>
  );
}
