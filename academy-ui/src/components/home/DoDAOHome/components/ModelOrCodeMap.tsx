'use client';

import { KeyboardEvent, useRef, useState } from 'react';
import { ActionLink, SectionIntro } from './SiteUi';

type Stage = {
  id: string;
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

/** The interactive four-stage map. Used on the homepage and on /robotics/model-or-no-model. */
export function StageMap() {
  const [activeId, setActiveId] = useState(stages[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = stages.find((s) => s.id === activeId)!;

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
      <div role="tablist" aria-label="Stages of a manipulation task" className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
              className={`group relative flex flex-col items-start rounded-2xl px-5 py-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                selected
                  ? 'bg-primary text-primary-text shadow-[0_12px_32px_-12px_rgb(var(--primary-rgb)/0.8)]'
                  : 'bg-surface/70 text-heading ring-1 ring-inset ring-border hover:bg-surface'
              }`}
            >
              <span className={`text-xs ${selected ? 'text-primary-text/75' : 'text-muted'}`}>Stage {index + 1}</span>
              <span className="mt-1 text-lg font-semibold">{stage.name}</span>
              <span
                className={`mt-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  selected ? 'bg-primary-text/20 text-primary-text' : 'bg-primary/15 text-link'
                }`}
              >
                {stage.usualPick}
              </span>
            </button>
          );
        })}
      </div>

      <div
        id="stage-panel"
        role="tabpanel"
        aria-labelledby={`stage-tab-${active.id}`}
        className="mt-4 overflow-hidden rounded-2xl bg-surface/80 ring-1 ring-border backdrop-blur"
      >
        <p className="border-b border-border px-6 py-5 text-xl font-semibold text-heading">{active.question}</p>
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          <div className="px-6 py-6">
            <h3 className="text-base font-semibold text-heading">Programmed approach</h3>
            <ul className="mt-3 space-y-2.5">
              {active.programmed.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-7 text-body">
                  <span className="mt-[11px] h-1.5 w-1.5 flex-none rounded-sm bg-muted" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="px-6 py-6">
            <h3 className="text-base font-semibold text-heading">Learned approach</h3>
            <ul className="mt-3 space-y-2.5">
              {active.learned.map((item) => (
                <li key={item} className="flex gap-3 text-base leading-7 text-body">
                  <span className="mt-[11px] h-1.5 w-1.5 flex-none rounded-full bg-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-primary/10 px-6 py-6">
            <h3 className="text-base font-semibold text-heading">How we choose</h3>
            <p className="mt-3 text-base leading-7 text-body">{active.howWeChoose}</p>
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
            title="Model or no model, decided per stage"
            lead="Learned models handle variety but can surprise you. Programmed approaches are predictable but brittle. Every pick-and-place task passes through the same four stages, and we make the call for each one separately."
          />
          <ActionLink href="/robotics/model-or-no-model" variant="secondary" className="flex-none">
            Read our approach
          </ActionLink>
        </div>
        <div className="mt-12">
          <StageMap />
        </div>
      </div>
    </section>
  );
}
