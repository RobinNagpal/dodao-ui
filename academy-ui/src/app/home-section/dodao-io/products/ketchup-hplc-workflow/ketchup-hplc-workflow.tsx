'use client';
import {
  BeakerIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CogIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  Squares2X2Icon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

type StepStatus = 'simulated' | 'skipped';

type WorkflowStep = {
  num: string;
  title: string;
  what: string;
  status: StepStatus;
  reason?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const steps: WorkflowStep[] = [
  {
    num: '01',
    title: 'Weighing',
    what: 'Measure out a tiny, exact amount of ketchup before any solvent goes near it.',
    status: 'skipped',
    reason: 'Needs a real balance and fine fluid control. Too movement heavy for this round.',
    icon: WrenchScrewdriverIcon,
  },
  {
    num: '02',
    title: 'Dissolution and Extraction',
    what: 'Add a measured solvent so the target chemical, 5-HMF, leaves the pulp and moves into the liquid. With ketchup the result is a cloudy, pulpy mixture, not a clear solution.',
    status: 'simulated',
    icon: BeakerIcon,
  },
  {
    num: '03',
    title: 'Dilution',
    what: 'Weaken the extract by adding more solvent, so the HPLC machine can read it without saturating.',
    status: 'simulated',
    icon: BeakerIcon,
  },
  {
    num: '04',
    title: 'Filtering',
    what: 'Push the liquid through a fine filter to remove every last bit of tomato pulp before it reaches the instrument.',
    status: 'simulated',
    icon: WrenchScrewdriverIcon,
  },
  {
    num: '05',
    title: 'Transfer to Vial',
    what: 'Move the clear, filtered liquid into the small glass vial the autosampler will pick up.',
    status: 'simulated',
    icon: BeakerIcon,
  },
  {
    num: '06',
    title: 'Capping',
    what: 'Close the vial with a septum cap so the autosampler needle can pierce through it cleanly.',
    status: 'skipped',
    reason: 'Tight tolerance press and twist motion. Hard to model honestly in simulation right now.',
    icon: CogIcon,
  },
  {
    num: '07',
    title: 'Labeling',
    what: 'Print and apply a small label so the vial is traceable to the sample and the run.',
    status: 'skipped',
    reason: 'A printer plus precise sticker handling. Pushed to hardware bring up, not simulation.',
    icon: ClipboardDocumentCheckIcon,
  },
  {
    num: '08',
    title: 'Placement in Autosampler',
    what: 'Drop the capped, labeled vial into the correct numbered slot of the autosampler tray.',
    status: 'simulated',
    icon: Squares2X2Icon,
  },
];

const sceneObjects = [
  'Ketchup beaker, stir bar and solvent reservoir',
  'Mock dispenser station that pours a measured solvent volume',
  'Mock mixer station with a heat and dwell flag',
  'Centrifuge mock for clarifying the cloudy extract',
  'Syringe filter and a clean receiving vessel',
  'Empty HPLC vial and the autosampler tray with numbered slots',
  'Overhead camera, wrist camera, AprilTag markers and the workcell table',
];

const differences = [
  {
    title: 'Sample type',
    paracetamol: 'A clean, dry tablet that dissolves cleanly in methanol.',
    ketchup: 'A thick, pulpy paste with sugar, acid and tomato solids.',
  },
  {
    title: 'What we measure',
    paracetamol: 'The whole tablet, since the active drug is most of the mass.',
    ketchup: 'One trace chemical called 5-HMF, hidden in a busy mixture.',
  },
  {
    title: 'Dissolution',
    paracetamol: 'Everything goes into solution. The liquid is clear.',
    ketchup: 'Only the target gets extracted. The liquid stays cloudy until we filter it.',
  },
  {
    title: 'Risk during prep',
    paracetamol: 'Low. The chemistry is forgiving.',
    ketchup: 'Higher. Too much heat can create more 5-HMF and change the very thing we are measuring.',
  },
  {
    title: 'Simulation difficulty',
    paracetamol: 'A reasonable starter project.',
    ketchup: 'Much harder. More mocked instruments, more state to track, more places to get wrong.',
  },
];

function KetchupHplcWorkflowCaseStudy() {
  const simulatedCount = steps.filter((s) => s.status === 'simulated').length;
  const skippedCount = steps.length - simulatedCount;

  return (
    <div>
      <div className="relative overflow-hidden bg-white">
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-indigo-600">Robotics Case Study</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  Ketchup HPLC Workflow{' '}
                  <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-emerald-600 bg-clip-text text-transparent">in Simulation</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-gray-600">
                  HPLC sample prep is an eight step workflow. We built a Gazebo simulation of five of those steps for ketchup, which is the much harder usecase
                  compared to the standard paracetamol example. The remaining three steps need tight tolerance hardware moves, so we left them out for now.
                  Isaac Sim port comes next.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    {simulatedCount} of 8 steps in Gazebo
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800 ring-1 ring-amber-200">
                    <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                    {skippedCount} steps left for later
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-800 ring-1 ring-violet-200">
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    Isaac Sim port: in progress
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="/home-section/dodao-io/services/simulation-setup"
                    className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
                  >
                    See our Simulation Setup service
                  </a>
                  <a
                    href="/home-section/dodao-io/products/hplc-autosampler"
                    className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200 hover:bg-indigo-50 transition-colors"
                  >
                    Read the original HPLC autosampler concept
                  </a>
                </div>
              </div>

              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-lg">
                  <div className="relative block w-full overflow-hidden rounded-lg bg-gradient-to-br from-indigo-50 via-violet-50 to-emerald-50 ring-1 ring-indigo-100">
                    <div className="aspect-[4/3] flex items-center justify-center px-6 py-10 text-center">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-indigo-600 font-semibold">Simulation Preview</p>
                        <p className="mt-2 text-lg font-semibold text-gray-900">myCobot 280 Pi in Gazebo Harmonic</p>
                        <p className="mt-3 text-sm text-gray-600 max-w-sm mx-auto">
                          A 6 axis cobot runs the ketchup sample prep workflow through dissolution, dilution, filtering, transfer and final autosampler
                          placement.
                        </p>
                        <p className="mt-4 text-xs italic text-gray-500">A Gazebo simulation clip will be added here soon.</p>
                      </div>
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
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why Ketchup, Not Paracetamol</h2>
            <p className="mt-4 text-base text-gray-600">
              Paracetamol is the clean, easy case every HPLC training walks through. Ketchup is what real food labs deal with. We built the simulation around
              ketchup on purpose, so the work would surface every messy detail we will hit later in the lab.
            </p>
          </div>

          <div className="mt-12 overflow-hidden rounded-2xl bg-white ring-1 ring-gray-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    What changes
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Paracetamol
                  </th>
                  <th scope="col" className="px-6 py-3 font-semibold">
                    Ketchup
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {differences.map((row) => (
                  <tr key={row.title} className="align-top">
                    <td className="px-6 py-4 font-semibold text-gray-900">{row.title}</td>
                    <td className="px-6 py-4 text-gray-700">{row.paracetamol}</td>
                    <td className="px-6 py-4 text-gray-700">{row.ketchup}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">The Eight Step Workflow</h2>
            <p className="mt-4 text-base text-gray-600">
              Five steps run in Gazebo today. Three steps are honest about their limits and wait for hardware bring up. Each card explains the step and our
              status on it.
            </p>
          </div>

          <ol className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const isSimulated = step.status === 'simulated';
              return (
                <li
                  key={step.num}
                  className={`flex flex-col rounded-xl border p-5 shadow-sm ${
                    isSimulated ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-3">
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${
                          isSimulated ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {step.num}
                      </span>
                      <step.icon className={`h-5 w-5 ${isSimulated ? 'text-emerald-700' : 'text-amber-700'}`} aria-hidden="true" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-x-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        isSimulated ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
                      }`}
                    >
                      {isSimulated ? (
                        <CheckCircleIcon className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <ExclamationTriangleIcon className="h-3 w-3" aria-hidden="true" />
                      )}
                      {isSimulated ? 'Simulated' : 'Skipped'}
                    </span>
                  </div>
                  <p className="mt-3 text-base font-semibold text-gray-900">{step.title}</p>
                  <p className="mt-1 text-sm text-gray-700">{step.what}</p>
                  {step.reason && <p className="mt-3 text-xs italic text-amber-900">{step.reason}</p>}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What Lives in the Scene</h2>
              <p className="mt-4 text-base text-gray-600">
                A clean simulation is mostly about getting the right objects into the world. For the ketchup workflow the scene carries the cobot, the cell
                fixtures and a set of mock stations that stand in for the real lab instruments.
              </p>
              <p className="mt-4 text-base text-gray-600">
                The mock dispenser and mock mixer expose simple ROS 2 topics so we can drive them from a behavior tree and watch the workflow advance step by
                step.
              </p>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-3 lg:mt-0">
              {sceneObjects.map((item) => (
                <li key={item} className="flex items-start gap-x-3 rounded-xl bg-white p-4 ring-1 ring-gray-200">
                  <CheckCircleIcon className="h-5 w-5 flex-none text-indigo-600 mt-0.5" aria-hidden="true" />
                  <span className="text-sm leading-6 text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What Comes Next</h2>
            <p className="mt-4 text-base text-gray-600">
              The Gazebo build proves the workflow. Next we port the same scene to Isaac Sim, so the photoreal renderer can drive synthetic data for the vision
              steps and so larger training runs become possible. Hardware bring up of the three skipped steps follows after that.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-200 p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-emerald-700">Today</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">Gazebo workflow</p>
              <p className="mt-2 text-sm text-gray-700">Five workflow steps run end to end in Gazebo Harmonic with the mock dispenser and mixer.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-violet-50 to-indigo-50 ring-1 ring-violet-200 p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-violet-700">Next</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">Isaac Sim port</p>
              <p className="mt-2 text-sm text-gray-700">Same scene, photoreal rendering, ready for synthetic data and larger policy runs.</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 ring-1 ring-amber-200 p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-amber-700">Later</p>
              <p className="mt-2 text-lg font-semibold text-gray-900">Hardware bring up</p>
              <p className="mt-2 text-sm text-gray-700">Weighing, capping and labeling move from skipped to live, with real lab instruments in the cell.</p>
            </div>
          </div>

          <div className="mt-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-emerald-600 p-8 text-center">
            <p className="text-base font-semibold text-white">Want a simulation like this for your own workflow?</p>
            <p className="mt-2 text-sm text-white/80 max-w-2xl mx-auto">
              Our Simulation Setup service builds the full scene for your usecase. We modeled the ketchup workflow as a stress test for our own pipeline.
            </p>
            <a
              href="/home-section/dodao-io/services/simulation-setup"
              className="mt-5 inline-flex items-center gap-x-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-gray-100 transition-colors"
            >
              See the Simulation Setup service
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KetchupHplcWorkflowCaseStudy;
