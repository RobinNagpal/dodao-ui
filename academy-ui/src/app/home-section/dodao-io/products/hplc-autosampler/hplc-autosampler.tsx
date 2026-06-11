'use client';
import {
  BeakerIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  CogIcon,
  CpuChipIcon,
  EyeIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import ContactModal from '../../../../../components/home/DoDAOHome/components/ContactModal';
import { useState } from 'react';

const incentives = [
  {
    name: 'Goal and Objectives',
    description:
      'We want to take the slow, manual sample-prep work off the lab technician. Most chemistry labs run HPLC every day to test products, drugs, and food. The instrument is already automatic. The hours of work before each run are not. Our goal is a small robot arm that handles that human-intensive part safely and with a full audit trail.',
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/1270/1270380.png',
  },
  {
    name: 'The Solution',
    description:
      'A 6-axis cobot sits on the lab bench and takes over the prep steps a general-purpose arm can do well. Transfer, filter, cap, label, and load vials into the autosampler tray in the right order. We prove every motion in Gazebo first, then move to hardware. Every action is logged so QC and pharma teams can defend the result later.',
    imageSrc: 'https://cdn-icons-png.flaticon.com/512/8787/8787168.png',
  },
];

const features = [
  {
    name: 'Covers the Manual Prep Steps',
    description:
      'The HPLC instrument runs itself once a vial is in. The hours before that are manual. The arm handles transfer, filter, cap, label, and placement so technicians can focus on harder work.',
    icon: BeakerIcon,
  },
  {
    name: 'Camera-Driven Perception',
    description:
      'A wrist RGB-D camera finds vials, racks, and the tray. We use AprilTags and modern vision models so the arm keeps working when a beaker or tray is moved by a few millimetres.',
    icon: EyeIcon,
  },
  {
    name: 'Safe Around People',
    description:
      'We pick collaborative arms with built-in force limits and clear status lights. A technician can share the bench with the robot without a safety cage in front of it.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Barcode and LIMS Linked',
    description:
      'Every vial is barcode-scanned. The arm asks the lab’s LIMS or sample list which slot the vial belongs in. There is no guessing, and no manual data entry from the operator.',
    icon: Squares2X2Icon,
  },
  {
    name: 'Open-Source, Modern Stack',
    description:
      'ROS 2 for middleware, MoveIt 2 for motion, Behavior Trees for orchestration, and Gazebo for simulation. Every layer is open source so the lab can maintain and extend the cell.',
    icon: CpuChipIcon,
  },
  {
    name: 'Full Audit Log',
    description:
      'Every pick, scan, and placement is recorded with a timestamp. Pharma and clinical labs need to prove which vial went where. The arm produces that record automatically.',
    icon: ClipboardDocumentCheckIcon,
  },
];

const benefits = [
  {
    name: 'Saves Hours a Day',
    description:
      'A busy QC lab loads dozens of vials a day and runs prep steps for many of them. The arm gives that time back so lab staff can spend it on harder, less repetitive work.',
    icon: ClockIcon,
  },
  {
    name: 'Fewer Wrong-Slot Errors',
    description:
      'Hand-loaded trays have a real human error rate. One wrong-slot vial can invalidate a multi-hour HPLC run. The arm follows the same plan every time.',
    icon: ShieldCheckIcon,
  },
  {
    name: 'Ready for Audits',
    description:
      'In regulated labs, you must prove which vial went where and who placed it. The arm logs every action automatically, so audits and reviews go faster.',
    icon: ClipboardDocumentCheckIcon,
  },
];

const workflowSteps = [
  { num: '01', title: 'Weighing', tool: 'Tool-assisted', icon: WrenchScrewdriverIcon },
  { num: '02', title: 'Dissolve / Extract', tool: 'Arm-assisted', icon: BeakerIcon },
  { num: '03', title: 'Dilute', tool: 'Tool-assisted', icon: BeakerIcon },
  { num: '04', title: 'Filter', tool: 'Arm-led', icon: WrenchScrewdriverIcon },
  { num: '05', title: 'Transfer to Vial', tool: 'Arm-led', icon: BeakerIcon },
  { num: '06', title: 'Cap', tool: 'Arm-led', icon: CogIcon },
  { num: '07', title: 'Label', tool: 'Arm-led', icon: ClipboardDocumentCheckIcon },
  { num: '08', title: 'Place in Autosampler', tool: 'Arm-led', icon: Squares2X2Icon },
];

function HplcAutosamplerCaseStudy() {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <div>
      {showContactModal && <ContactModal open={showContactModal} onClose={() => setShowContactModal(false)} />}

      <div className="relative overflow-hidden bg-bg">
        <div aria-hidden="true" className="hidden lg:absolute lg:inset-0 lg:block">
          <svg fill="none" width={640} height={784} viewBox="0 0 640 784" className="absolute left-1/2 top-0 -translate-y-8 translate-x-64 transform">
            <defs>
              <pattern x={118} y={0} id="hplc-pattern-desktop" width={20} height={20} patternUnits="userSpaceOnUse">
                <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-border" />
              </pattern>
            </defs>
            <rect y={72} fill="currentColor" width={640} height={640} className="text-surface" />
            <rect x={118} fill="url(#hplc-pattern-desktop)" width={404} height={784} />
          </svg>
        </div>

        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-24">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-6 lg:text-left">
                <h1>
                  <span className="mt-1 block text-4xl font-bold tracking-tight sm:text-6xl">
                    <span className="block text-primary">VialBot</span>
                  </span>
                </h1>
                <p className="mt-3 text-lg leading-8 text-body">
                  A small robot arm that helps chemistry labs prepare and load sample vials for HPLC. It takes over the slow, manual prep steps that happen
                  before the instrument runs, and keeps a clean audit log of every move.
                </p>
                <div className="mt-10 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a
                      onClick={() => setShowContactModal(true)}
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-primary-text cursor-pointer hover:bg-primary/85 md:px-10 md:py-4 md:text-lg"
                    >
                      Get started
                    </a>
                  </div>
                  <div className="mt-3 rounded-md shadow sm:ml-3 sm:mt-0">
                    <span
                      aria-disabled="true"
                      title="Live demo coming soon"
                      className="flex w-full items-center justify-center rounded-md border border-transparent bg-surface px-8 py-3 text-base font-medium text-primary cursor-not-allowed opacity-70 md:px-10 md:py-4 md:text-lg"
                    >
                      Live demo
                    </span>
                  </div>
                </div>
              </div>
              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-6 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <svg
                  fill="none"
                  width={640}
                  height={784}
                  viewBox="0 0 640 784"
                  aria-hidden="true"
                  className="absolute left-1/2 top-0 origin-top -translate-x-1/2 -translate-y-8 scale-75 transform sm:scale-100 lg:hidden"
                >
                  <defs>
                    <pattern x={118} y={0} id="hplc-pattern-mobile" width={20} height={20} patternUnits="userSpaceOnUse">
                      <rect x={0} y={0} fill="currentColor" width={4} height={4} className="text-border" />
                    </pattern>
                  </defs>
                  <rect y={72} fill="currentColor" width={640} height={640} className="text-surface" />
                  <rect x={118} fill="url(#hplc-pattern-mobile)" width={404} height={784} />
                </svg>
                <div className="relative mx-auto w-full rounded-lg shadow-lg">
                  <div className="relative block w-full overflow-hidden rounded-lg bg-surface">
                    <div className="aspect-[4/3] flex items-center justify-center px-6 py-10 text-center">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Simulation Preview</p>
                        <p className="mt-2 text-lg font-semibold text-heading">myCobot 280 Pi in Gazebo Harmonic</p>
                        <p className="mt-3 text-sm text-muted max-w-sm mx-auto">
                          A 6-DoF cobot picks vials from a rack, reads barcodes with a wrist camera, and loads each vial into the right slot of an HPLC tray.
                        </p>
                        <p className="mt-4 text-xs italic text-muted">A short Gazebo simulation clip will be added here as we progress.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="bg-surface">
        <div className="mx-auto max-w-7xl py-24 sm:px-2 sm:py-20 lg:px-4 mt-12">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 px-4 lg:max-w-none lg:grid-cols-2">
            {incentives.map((incentive) => (
              <div key={incentive.name} className="text-center sm:flex sm:text-left lg:block lg:text-center">
                <div className="sm:shrink-0">
                  <div className="flow-root">
                    <img alt="" src={incentive.imageSrc} className="mx-auto h-24 w-28" />
                  </div>
                </div>
                <div className="mt-3 sm:ml-3 sm:mt-0 lg:ml-0 lg:mt-3">
                  <h3 className="text-lg font-semibold text-heading">{incentive.name}</h3>
                  <p className="mt-2 text-base text-body">{incentive.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative bg-bg py-20 sm:py-28 lg:py-36">
        <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-5xl">Features of the Robot Arm</h2>
          <p className="mx-auto mt-5 max-w-prose text-base text-body">
            The cell is built around a small collaborative arm, modern perception, and a simulation-first workflow. It is designed to fit on a normal lab bench
            and to be safe near a human technician.
          </p>
          <div className="mt-16">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="pt-6">
                  <div className="flow-root rounded-lg bg-surface px-6 pb-8">
                    <div className="-mt-6">
                      <div>
                        <span className="inline-flex items-center justify-center rounded-xl bg-primary p-3 shadow-lg">
                          <feature.icon aria-hidden="true" className="h-6 w-6 text-primary-text" />
                        </span>
                      </div>
                      <h3 className="mt-8 text-lg/8 font-semibold tracking-tight text-heading">{feature.name}</h3>
                      <p className="mt-5 text-base/7 text-body">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">The Sample-Prep Workflow</h2>
            <p className="mt-4 text-base text-body">
              The HPLC instrument runs itself once a vial is in. The eight steps before that are manual today. The arm focuses on the steps where positioning
              and choreography matter, and the harder fluid-handling steps are done with the right tool.
            </p>
          </div>
          <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {workflowSteps.map((step) => (
              <li key={step.num} className="flex flex-col rounded-xl bg-surface-2 border border-border p-5 shadow-sm">
                <div className="flex items-center gap-x-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary text-sm font-semibold">
                    {step.num}
                  </span>
                  <step.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <p className="mt-3 text-base font-semibold text-heading">{step.title}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">{step.tool}</p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-center text-xs italic text-muted">
            “Arm-led” steps are the ones the robot drives directly. “Tool-assisted” steps use a dedicated lab tool (balance, pipette) under arm control.
          </p>
        </div>
      </div>

      <div className="bg-bg">
        <div className="relative bg-surface pb-32">
          <div className="absolute inset-0">
            <img
              alt=""
              src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=60&sat=-100"
              className="size-full object-cover h-80"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-surface mix-blend-multiply" />
          </div>
          <div className="relative mx-auto max-w-7xl px-6 py-20 sm:py-28 lg:px-8">
            <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-5xl">Why the Robot Arm Helps You</h1>
            <p className="mt-6 max-w-3xl text-base text-body">
              The HPLC sample-prep job is repetitive, exact, and slow. People are good at thinking, not at running the same motion for the hundredth time. The
              arm handles the repetition so your team can focus on the science.
            </p>
          </div>
        </div>
        <section aria-labelledby="contact-heading" className="relative z-10 mx-auto -mt-32 max-w-7xl px-6 pb-32 lg:px-8">
          <div className="grid grid-cols-1 gap-y-20 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {benefits.map((link) => (
              <div key={link.name} className="flex flex-col rounded-2xl bg-surface-2 shadow-xl">
                <div className="relative flex-1 px-6 pb-8 pt-16 md:px-8">
                  <div className="absolute top-0 inline-block -translate-y-1/2 transform rounded-xl bg-primary p-5 shadow-lg">
                    <link.icon aria-hidden="true" className="h-6 w-6 text-primary-text" />
                  </div>
                  <h3 className="text-lg font-semibold text-heading">{link.name}</h3>
                  <p className="mt-4 text-base text-body">{link.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default HplcAutosamplerCaseStudy;
