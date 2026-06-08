import { ArrowRightIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const inScope = [
  'See an inbound rack of ready vials on a lab bench.',
  'Pick a vial without dropping, tipping, or cracking it.',
  'Move it past a barcode reader to read its label.',
  'Look up the vial’s assigned tray slot in the LIMS.',
  'Place it upright in the correct slot of the autosampler tray.',
  'Log the barcode-to-slot mapping for an audit trail.',
  'Repeat until the rack is empty or the tray is full.',
];

const outOfScope = [
  'Sample preparation (weighing, dissolving, diluting, filtering).',
  'Capping or crimping vials — caps are already on.',
  'Microlitre liquid pipetting.',
  'Putting the loaded tray into the HPLC drawer.',
  'Operating the HPLC instrument itself.',
  'Multi-tray, 24-hour unattended operation (v1 is one tray).',
];

const whyMatters = [
  {
    title: 'It saves people from boring work',
    body: 'A QC lab loads hundreds of vials a day. The act is mechanical and repetitive — exactly the work a robot should take over.',
  },
  {
    title: 'It removes a common source of error',
    body: 'Human-loaded trays have real mistake rates. One wrong-slot vial can invalidate a multi-hour HPLC run.',
  },
  {
    title: 'It produces a clean audit trail',
    body: 'In regulated labs (pharma, clinical), you must prove which vial went where. A robot does this automatically; a human notebook is hard to defend.',
  },
];

const stack = [
  { layer: 'Simulator', value: 'Gazebo Harmonic' },
  { layer: 'Middleware', value: 'ROS 2 (Humble)' },
  { layer: 'Arm motion', value: 'MoveIt 2 + OMPL' },
  { layer: 'Perception', value: 'RGB-D + AprilTag (geometric baseline)' },
  { layer: 'Grasping', value: 'Analytical top-down (VLA later)' },
  { layer: 'Orchestration', value: 'Behavior Trees' },
  { layer: 'Arm', value: 'Elephant Robotics myCobot 280 Pi' },
  { layer: 'Vial standard', value: '12 × 32 mm, 96-slot tray (Agilent / Waters / Shimadzu / Thermo Fisher)' },
];

export default function HplcAutosamplerCaseStudy() {
  return (
    <div className="not-prose">
      <header>
        <p className="text-sm font-semibold text-emerald-700">Featured Robotics Project</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          HPLC Autosampler <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Tray Loader</span>
        </h1>
        <p className="mt-4 text-lg leading-7 text-gray-600 max-w-3xl">
          A simulation-first robotic arm that picks small glass sample vials from a rack, reads the barcode on each, and places each one in the right slot of an
          HPLC autosampler tray — accurately, repeatably, and with a full audit log of which vial went where.
        </p>
      </header>

      <section className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-6">
          <p className="text-xs uppercase tracking-wide font-semibold text-emerald-700">The Task — in one sentence</p>
          <p className="mt-2 text-base leading-7 text-gray-800">
            Build a robot arm that picks small glass sample vials from a rack, reads the barcode on each, and places each one in the right slot of an HPLC
            autosampler tray.
          </p>
        </div>

        <div className="rounded-2xl bg-white border border-gray-200 p-6">
          <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">Context</p>
          <p className="mt-2 text-base leading-7 text-gray-700">
            HPLC is one of the most common chemistry instruments on earth. Almost every drug batch made anywhere is tested with HPLC before it ships. Most
            instruments use the same standard 12 × 32 mm vial and a 96-slot tray — which makes this task portable across vendors.
          </p>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Why this is worth doing</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {whyMatters.map((item) => (
            <div key={item.title} className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
              <p className="text-base font-semibold text-gray-900">{item.title}</p>
              <p className="mt-2 text-sm leading-6 text-gray-700">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">What the robot does — and does not — do</h2>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-emerald-200 p-6">
            <p className="text-sm font-semibold text-emerald-800 mb-3">In scope (v1)</p>
            <ul className="space-y-2">
              {inScope.map((line) => (
                <li key={line} className="flex items-start gap-x-2 text-sm text-gray-700">
                  <CheckCircleIcon className="h-5 w-5 flex-none text-emerald-600 mt-0.5" aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 p-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Out of scope (later, if useful)</p>
            <ul className="space-y-2">
              {outOfScope.map((line) => (
                <li key={line} className="flex items-start gap-x-2 text-sm text-gray-700">
                  <XMarkIcon className="h-5 w-5 flex-none text-gray-400 mt-0.5" aria-hidden="true" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">The cell, end-to-end</h2>
        <p className="mt-3 text-base leading-7 text-gray-700 max-w-3xl">
          A small 6-axis collaborative arm sits on a lab bench, bolted to a base plate. To the left of the arm: an inbound rack with up to 24–48 capped,
          barcoded vials. To the right: an empty autosampler tray on a benchtop alignment plate (the tray is loaded on the bench, not inside the instrument,
          which simplifies the cell). Between rack and tray: a fixed barcode reader. A wrist-mounted RGB-D camera sees the rack and the tray. A small PC runs
          perception, motion planning, and the LIMS link. A technician is in the room with clear Start / Stop controls and visible status lights.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Our stack</h2>
        <p className="mt-3 text-base leading-7 text-gray-700 max-w-3xl">
          Open-source, simulation-first, and reproducible. We prove the entire pick-decap-dispense-cap-label-load loop in Gazebo before any hardware order.
        </p>
        <div className="mt-6 rounded-2xl bg-white border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Layer</th>
                <th className="px-4 py-3">Choice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stack.map((row) => (
                <tr key={row.layer}>
                  <td className="px-4 py-3 font-medium text-gray-900">{row.layer}</td>
                  <td className="px-4 py-3 text-gray-700">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">Status</h2>
        <p className="mt-3 text-base leading-7 text-gray-700 max-w-3xl">
          Active. Simulation milestones underway (perception with YOLO + AprilTag; motion with MoveIt 2; hand-eye calibration done; learning items — behavior
          cloning, PPO, VLA — next). We will publish the working sim and short GIFs as each milestone lands.
        </p>
      </section>

      <section className="mt-12 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-8 text-center">
        <p className="text-base font-semibold text-emerald-800">Looking to automate a lab workflow?</p>
        <p className="mt-2 text-sm text-gray-700 max-w-2xl mx-auto">
          We work across the four robotics layers — software, perception, simulation, and hardware bring-up. Reach out and tell us what you are trying to do.
        </p>
        <a
          href="/contact"
          className="mt-5 inline-flex items-center gap-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-500 hover:to-cyan-500 transition-colors"
        >
          Contact DoDAO
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}
