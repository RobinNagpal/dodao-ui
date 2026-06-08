'use client';
import {
  ArrowLongRightIcon,
  BeakerIcon,
  BoltIcon,
  ClipboardDocumentCheckIcon,
  CogIcon,
  CpuChipIcon,
  EyeIcon,
  PlayCircleIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import ContactModal from '../../../../../../components/home/DoDAOHome/components/ContactModal';
import { useState } from 'react';

type Phase = {
  num: string;
  name: string;
  tagline: string;
  description: string;
  steps: string[];
  output: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  accent: string;
};

const phases: Phase[] = [
  {
    num: '01',
    name: 'Finalize the Requirements',
    tagline: 'Write down what the robot has to do, before buying anything.',
    description:
      'Most robotics projects fail because the team starts shopping for hardware before they have agreed on the task. We start the other way around. We sit down with you, write the task in one sentence, and answer the basic questions that decide everything else.',
    steps: [
      'Pick the exact task and the limits of v1.',
      'Decide the working area, payload, and reach.',
      'Pick the accuracy needed (millimetre, sub-millimetre, or coarse).',
      'Decide how the robot talks to people and other systems.',
      'List the safety and audit needs of the lab or factory.',
    ],
    output: 'A short, clear written spec. Used as the input for every later choice.',
    icon: ClipboardDocumentCheckIcon,
    gradient: 'from-emerald-500 to-teal-500',
    accent: 'text-emerald-700',
  },
  {
    num: '02',
    name: 'Select the Hardware',
    tagline: 'Pick the arm, gripper, sensors, and compute the spec actually needs.',
    description:
      'With the spec written, hardware choices become small and clear instead of big and political. We work through each piece one at a time, pick the most common, well-supported option that fits, and write down why.',
    steps: [
      'Choose the arm class. Cobot, industrial, or research arm.',
      'Choose the gripper. Parallel-jaw, suction, or a custom top-down tool.',
      'Choose the sensors. RGB-D camera, force/torque, contact, encoders.',
      'Choose compute and power. Jetson or NUC, mains or 24 V supply.',
      'Choose mounting, safety equipment, and the operator interface.',
    ],
    output: 'A bill of materials with vendors, prices, and the reason for each choice.',
    icon: CogIcon,
    gradient: 'from-teal-500 to-cyan-500',
    accent: 'text-teal-700',
  },
  {
    num: '03',
    name: 'Build the Software Stack',
    tagline: 'Pick the open-source layers that fit the hardware and the task.',
    description:
      'Most projects use the same software layers. We choose the version that fits your hardware and task, and we wire them together so the cell behaves the same way in simulation and on the real robot.',
    steps: [
      'Operating system and runtime. Ubuntu LTS, ros2_control.',
      'Middleware. ROS 2 (Humble or Jazzy) with Cyclone DDS.',
      'Motion planning. MoveIt 2 with OMPL, OMPL planners, or CHOMP.',
      'Perception. OpenCV, Open3D, and modern vision foundation models.',
      'Task orchestration. Behavior trees so the workflow is easy to read.',
    ],
    output: 'A working ROS 2 stack we can run in Gazebo before any hardware arrives.',
    icon: CpuChipIcon,
    gradient: 'from-cyan-500 to-sky-500',
    accent: 'text-cyan-700',
  },
  {
    num: '04',
    name: 'Integrate and Bring Up',
    tagline: 'Move from simulation to real hardware in small, safe steps.',
    description:
      'Once the cell works end-to-end in simulation, we move to hardware in small steps. The goal is to find every problem on the bench, not in production. We finish with acceptance tests, operator runbooks, and Day-2 monitoring.',
    steps: [
      'Simulation-first end-to-end run in Gazebo or Isaac Sim.',
      'Calibration (camera, hand-eye) on the real hardware.',
      'Bring-up of each subsystem before running the full task.',
      'Pilot run with the technician in the room.',
      'Acceptance tests, runbooks, and monitoring for the long run.',
    ],
    output: 'A working robot cell you can run, audit, and maintain.',
    icon: BoltIcon,
    gradient: 'from-sky-500 to-blue-500',
    accent: 'text-sky-700',
  },
];

const principles = [
  {
    name: 'Simulation-First',
    description:
      'We do not buy hardware to find a bug. Every motion, every grasp, every behavior is tested in Gazebo or Isaac Sim first. Real hardware lands on a known-working stack.',
    icon: BeakerIcon,
  },
  {
    name: 'Open Source by Default',
    description: 'ROS 2, MoveIt 2, Gazebo, OpenCV, PyTorch. We pick well-supported open layers so your team can read, fix, and extend the stack later.',
    icon: SparklesIcon,
  },
  {
    name: 'Safety in the Spec',
    description:
      'Collaborative arm, force limits, e-stops, status lights, and a clear safety story. We treat safety as part of the requirements, not an add-on.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Audit by Default',
    description: 'Every action the robot takes is logged with a timestamp. For pharma, clinical, and food QC labs, this turns a long audit into a short one.',
    icon: EyeIcon,
  },
];

function RoboticsApproachContent() {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <div>
      {showContactModal && <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />}

      <div className="relative overflow-hidden bg-white">
        <div className="relative pb-4 sm:pb-12 lg:pb-16">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-sm font-semibold tracking-wide text-emerald-600 uppercase">Robotics · Our Approach</p>
                <h1 className="mt-1 block text-4xl font-bold tracking-tight sm:text-5xl">
                  <span className="block text-indigo-600">How We Build a Robot Cell</span>
                </h1>
                <p className="mt-4 text-lg leading-8 text-gray-500">
                  A robotics project has many moving parts. We work in a clear order so the project does not get stuck. First we finalize the requirements. Then
                  we pick the hardware. Then we build the software stack. Then we bring the cell up on real hardware.
                </p>
                <div className="mt-8 sm:flex sm:justify-center lg:justify-start">
                  <a
                    onClick={() => setShowContactModal(true)}
                    className="flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white cursor-pointer hover:bg-indigo-700 md:px-10 md:py-4 md:text-lg"
                  >
                    Talk to us about your project
                  </a>
                </div>
              </div>
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-lg">
                  <div className="relative block w-full overflow-hidden rounded-lg bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 ring-1 ring-emerald-100">
                    <div className="px-6 py-8">
                      <ol className="space-y-4">
                        {phases.map((phase) => (
                          <li key={phase.num} className="flex items-center gap-x-3">
                            <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-white text-emerald-700 text-sm font-semibold shadow-sm ring-1 ring-emerald-200">
                              {phase.num}
                            </span>
                            <span className="text-sm font-semibold text-gray-900">{phase.name}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">The Four Phases of a Robot Cell</h2>
            <p className="mt-4 text-base text-gray-600">
              We walk every robotics project through the same four phases. Each phase has a clear output that the next phase needs. Skipping a phase usually
              means going back and redoing earlier work.
            </p>
          </div>

          <div className="mt-12 space-y-8">
            {phases.map((phase) => (
              <div key={phase.num} className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
                <div className={`h-1.5 bg-gradient-to-r ${phase.gradient}`}></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 lg:p-8">
                  <div className="lg:col-span-1">
                    <div className="flex items-center gap-x-3">
                      <span
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${phase.gradient} text-white font-semibold text-sm`}
                      >
                        {phase.num}
                      </span>
                      <phase.icon className={`h-6 w-6 ${phase.accent}`} aria-hidden="true" />
                    </div>
                    <h3 className="mt-3 text-xl font-bold text-gray-900">{phase.name}</h3>
                    <p className={`mt-1 text-sm font-medium ${phase.accent}`}>{phase.tagline}</p>
                    <p className="mt-4 text-sm leading-6 text-gray-600">{phase.description}</p>
                  </div>
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-5">
                      <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">What we do</p>
                      <ul className="mt-3 space-y-2">
                        {phase.steps.map((step) => (
                          <li key={step} className="flex items-start gap-x-2 text-sm text-gray-700">
                            <span className={`mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-r ${phase.gradient}`}></span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl bg-white border border-emerald-200 p-5">
                      <p className="text-xs uppercase tracking-wide font-semibold text-emerald-700">Output of this phase</p>
                      <p className="mt-3 text-sm leading-6 text-gray-700">{phase.output}</p>
                      <p className="mt-4 text-xs text-gray-500 inline-flex items-center gap-x-1">
                        Goes into the next phase
                        <ArrowLongRightIcon className="h-4 w-4" aria-hidden="true" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Principles We Hold To</h2>
            <p className="mt-4 text-base text-gray-600">
              These four ideas show up in every project we run. They are how we keep a robotics project from drifting into a hardware-shopping project.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {principles.map((principle) => (
              <div key={principle.name} className="flex gap-x-4 rounded-2xl bg-gray-50 border border-gray-200 p-6">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-indigo-100">
                  <principle.icon className="h-6 w-6 text-indigo-700" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{principle.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">{principle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-16">
        <div className="mx-auto max-w-3xl text-center px-6">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">See our approach in action</h2>
          <p className="mt-4 text-base text-gray-700">
            Our flagship robotics project is an HPLC autosampler arm for chemistry labs. The case study walks through the same four phases on a real lab
            workflow.
          </p>
          <div className="mt-8 flex justify-center gap-x-3">
            <button
              type="button"
              onClick={() => setShowContactModal(true)}
              className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700"
            >
              Get started
            </button>
            <a
              href="/home-section/dodao-io/products/hplc-autosampler"
              className="inline-flex items-center justify-center rounded-md border border-indigo-200 bg-white px-6 py-3 text-base font-semibold text-indigo-700 hover:bg-indigo-50"
            >
              <PlayCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              HPLC Autosampler case study
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoboticsApproachContent;
