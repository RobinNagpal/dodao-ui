import {
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ArrowPathRoundedSquareIcon,
  BeakerIcon,
  CameraIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  CogIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FunnelIcon,
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

type SceneObject = {
  name: string;
  tag: string;
  description: string;
  detail: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const sceneObjects: SceneObject[] = [
  {
    name: 'Ketchup Beaker',
    tag: 'Sample',
    description: 'Holds the raw paste before any solvent is added.',
    detail: 'Comes with a stir bar and a solvent reservoir so the dissolution step can be triggered from the behavior tree.',
    icon: BeakerIcon,
  },
  {
    name: 'Mock Dispenser',
    tag: 'Mock station',
    description: 'Pours a measured volume of solvent on cue.',
    detail: 'Exposes a simple ROS 2 topic for volume and flow rate, so the workflow can call it just like a real lab dispenser.',
    icon: FunnelIcon,
  },
  {
    name: 'Mock Mixer',
    tag: 'Mock station',
    description: 'Stands in for the real lab mixer.',
    detail: 'Drives a heat flag and a dwell flag instead of physically stirring, but keeps the same control interface as the hardware mixer.',
    icon: ArrowPathRoundedSquareIcon,
  },
  {
    name: 'Centrifuge Mock',
    tag: 'Mock station',
    description: 'Clarifies the cloudy ketchup extract.',
    detail: 'Models a spin and settle cycle so the downstream filter sees a clean liquid, the same way it would after a real centrifuge run.',
    icon: ArrowPathIcon,
  },
  {
    name: 'Syringe Filter',
    tag: 'Lab tool',
    description: 'Final cleanup before the HPLC vial.',
    detail: 'Pushes the extract through a fine filter into a clean receiving vessel, removing the last traces of tomato pulp.',
    icon: AdjustmentsHorizontalIcon,
  },
  {
    name: 'HPLC Vial Tray',
    tag: 'Output',
    description: 'Empty vials in a numbered autosampler tray.',
    detail: 'Each slot has a fixed pose so the cobot can drop a capped, labeled vial into the right position for the HPLC run.',
    icon: Squares2X2Icon,
  },
  {
    name: 'Cameras + AprilTags',
    tag: 'Perception',
    description: 'Overhead and wrist cameras with markers.',
    detail: 'AprilTag markers on the workcell table give the perception stack a stable reference frame for every pick and place.',
    icon: CameraIcon,
  },
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
      <div className="relative overflow-hidden bg-bg">
        <div className="relative pb-4 sm:pb-12 lg:pb-20">
          <main className="mx-auto mt-8 max-w-7xl px-6 sm:mt-16 lg:mt-20">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:mx-auto md:max-w-2xl lg:col-span-7 lg:text-left">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary">Robotics Case Study</p>
                <h1 className="mt-2 text-4xl font-bold tracking-tight text-heading sm:text-5xl">
                  Ketchup HPLC Workflow <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">in Simulation</span>
                </h1>
                <p className="mt-5 text-lg leading-8 text-body">
                  HPLC sample prep is an eight step workflow. We built a Gazebo simulation of five of those steps for ketchup, which is the much harder usecase
                  compared to the standard paracetamol example. The remaining three steps need tight tolerance hardware moves, so we left them out for now.
                  Isaac Sim port comes next.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-success/15 px-3 py-1 text-sm font-medium text-success ring-1 ring-success/40">
                    <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                    {simulatedCount} of 8 steps in Gazebo
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-warning/15 px-3 py-1 text-sm font-medium text-warning ring-1 ring-warning/40">
                    <ExclamationTriangleIcon className="h-4 w-4" aria-hidden="true" />
                    {skippedCount} steps left for later
                  </span>
                  <span className="inline-flex items-center gap-x-1.5 rounded-full bg-primary/15 px-3 py-1 text-sm font-medium text-primary ring-1 ring-primary/40">
                    <EyeIcon className="h-4 w-4" aria-hidden="true" />
                    Isaac Sim port: in progress
                  </span>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="/home-section/dodao-io/services/simulation-setup"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text hover:bg-primary/85 transition-colors"
                  >
                    See our Simulation Setup service
                  </a>
                </div>
              </div>

              <div className="relative mt-12 sm:mx-auto sm:max-w-lg lg:col-span-5 lg:mx-0 lg:mt-0 lg:flex lg:max-w-none lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-lg">
                  <div className="relative block w-full overflow-hidden rounded-lg bg-gradient-to-br from-surface to-surface-2 ring-1 ring-border">
                    <div className="aspect-[4/3] flex items-center justify-center px-6 py-10 text-center">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-primary font-semibold">Simulation Preview</p>
                        <p className="mt-2 text-lg font-semibold text-heading">Gazebo Harmonic</p>
                        <p className="mt-3 text-sm text-body max-w-sm mx-auto">
                          A 6 axis cobot runs the ketchup sample prep workflow through dissolution, dilution, filtering, transfer and final autosampler
                          placement.
                        </p>
                        <p className="mt-4 text-xs italic text-muted">A Gazebo simulation clip will be added here soon.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">The Eight Step Workflow</h2>
            <p className="mt-4 text-base text-body">
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
                    isSimulated ? 'bg-success/15 border-success/40' : 'bg-warning/15 border-warning/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-x-3">
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${
                          isSimulated ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                        }`}
                      >
                        {step.num}
                      </span>
                      <step.icon className={`h-5 w-5 ${isSimulated ? 'text-success' : 'text-warning'}`} aria-hidden="true" />
                    </div>
                    <span
                      className={`inline-flex items-center gap-x-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                        isSimulated ? 'bg-success/25 text-success' : 'bg-warning/25 text-warning'
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
                  <p className="mt-3 text-base font-semibold text-heading">{step.title}</p>
                  <p className="mt-1 text-sm text-body">{step.what}</p>
                  {step.reason && <p className="mt-3 text-xs italic text-warning">{step.reason}</p>}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="bg-surface py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">What Lives in the Scene</h2>
            <p className="mt-4 text-base text-body">
              A clean simulation is mostly about getting the right objects into the world. The ketchup workflow ships with the cobot, the cell fixtures and the
              mock stations below — all wired up over ROS 2 so a behavior tree can run the workflow end to end.
            </p>
          </div>

          <div className="relative mx-auto mt-16 max-w-4xl">
            <div aria-hidden="true" className="absolute left-1/2 top-0 bottom-0 hidden w-0.5 -translate-x-1/2 bg-primary/20 md:block" />

            <div className="relative space-y-10 md:space-y-12">
              {sceneObjects.map((item, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <div key={item.name} className="flex flex-col items-center gap-4 md:flex-row md:gap-6">
                    <div className={`md:w-1/2 ${isLeft ? 'md:order-first md:text-right' : 'md:order-last'}`}>
                      <h3 className="text-xl font-semibold text-heading">{item.name}</h3>
                      <p className="mt-1 text-sm text-body">{item.description}</p>
                      <span
                        className={`mt-3 inline-flex items-center rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/40 ${
                          isLeft ? 'md:ml-auto' : ''
                        }`}
                      >
                        {item.tag}
                      </span>
                    </div>

                    <div className="relative z-10 flex h-16 w-16 flex-none items-center justify-center rounded-full bg-bg ring-4 ring-primary/20">
                      <item.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                    </div>

                    <div className={`md:w-1/2 ${isLeft ? 'md:order-last' : 'md:order-first md:text-right'}`}>
                      <p className="text-sm text-body">{item.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-bg py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-heading sm:text-4xl">What Comes Next</h2>
            <p className="mt-4 text-base text-body">
              The Gazebo build proves the workflow. Next we port the same scene to Isaac Sim, so the photoreal renderer can drive synthetic data for the vision
              steps and so larger training runs become possible. Hardware bring up of the three skipped steps follows after that.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-success/15 ring-1 ring-success/40 p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-success">Today</p>
              <p className="mt-2 text-lg font-semibold text-heading">Gazebo workflow</p>
              <p className="mt-2 text-sm text-body">Five workflow steps run end to end in Gazebo Harmonic with the mock dispenser and mixer.</p>
            </div>
            <div className="rounded-2xl bg-primary/15 ring-1 ring-primary/40 p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-primary">Next</p>
              <p className="mt-2 text-lg font-semibold text-heading">Isaac Sim port</p>
              <p className="mt-2 text-sm text-body">Same scene, photoreal rendering, ready for synthetic data and larger policy runs.</p>
            </div>
            <div className="rounded-2xl bg-warning/15 ring-1 ring-warning/40 p-6">
              <p className="text-xs uppercase tracking-wide font-semibold text-warning">Later</p>
              <p className="mt-2 text-lg font-semibold text-heading">Hardware bring up</p>
              <p className="mt-2 text-sm text-body">Weighing, capping and labeling move from skipped to live, with real lab instruments in the cell.</p>
            </div>
          </div>

          <div className="mt-12 rounded-2xl bg-gradient-to-br from-primary to-link p-8 text-center">
            <p className="text-base font-semibold text-primary-text">Want a simulation like this for your own workflow?</p>
            <p className="mt-2 text-sm text-primary-text/80 max-w-2xl mx-auto">
              Our Simulation Setup service builds the full scene for your usecase. We modeled the ketchup workflow as a stress test for our own pipeline.
            </p>
            <a
              href="/home-section/dodao-io/services/simulation-setup"
              className="mt-5 inline-flex items-center gap-x-2 rounded-xl bg-heading px-5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-heading/90 transition-colors"
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
