import {
  AdjustmentsHorizontalIcon,
  BeakerIcon,
  CubeIcon,
  CubeTransparentIcon,
  LightBulbIcon,
  RectangleStackIcon,
  VideoCameraIcon,
} from '@heroicons/react/24/outline';

type Piece = {
  title: string;
  desc: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const pieces: Piece[] = [
  {
    title: 'Robot Model',
    desc: 'The robot with the correct joint chain, link frames, and joint limits. Loads cleanly in ROS 2 and MoveIt 2.',
    icon: CubeIcon,
  },
  {
    title: 'Workspace',
    desc: 'The bench, table, floor, fixtures and safety enclosures around the cell. Matches the real dimensions you give.',
    icon: RectangleStackIcon,
  },
  {
    title: 'Parts',
    desc: 'The objects the robot picks, places or scans, at the right size, weight and material for realistic grips.',
    icon: CubeTransparentIcon,
  },
  {
    title: 'Sensors and Cameras',
    desc: 'Cameras, depth sensors and force/torque sensors, placed where they sit on the real cell for in-sim testing.',
    icon: VideoCameraIcon,
  },
  {
    title: 'Lighting and Materials',
    desc: 'Light sources and surface materials matched to the real environment so vision models trained in sim work on camera.',
    icon: LightBulbIcon,
  },
  {
    title: 'Physics and Contacts',
    desc: 'Friction, mass and joint dynamics tuned so grasping, insertion and stacking behave the same in sim as on hardware.',
    icon: AdjustmentsHorizontalIcon,
  },
];

const whyStart = [
  {
    title: 'Catch problems early',
    desc: 'Spot reach, sensor or layout issues before any hardware is built.',
  },
  {
    title: 'Done in weeks',
    desc: 'A working scene ready in weeks, not months.',
  },
  {
    title: 'Right tools picked for you',
    desc: 'We pick Gazebo or Isaac Sim based on your robot.',
  },
];

const tools = [
  {
    name: 'Gazebo',
    note: 'ROS 2 native. Free. Quick to iterate.',
  },
  {
    name: 'Isaac Sim',
    note: 'Realistic images. Built for AI training.',
  },
  {
    name: 'MuJoCo',
    note: 'Best contact and friction model. Great for grasping work.',
  },
];

export default function SimulationSetupSection() {
  return (
    <section id="simulation-setup" className="relative py-20 bg-gradient-to-b from-gray-800 to-gray-900 scroll-mt-24">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-200 ring-1 ring-inset ring-white/20">
            <BeakerIcon className="h-4 w-4" />
            Service One
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">Simulation Setup</h2>
          <p className="mt-4 text-lg text-gray-300">
            When you start a robotics project, the first step is building a <span className="font-semibold text-blue-300">clean simulation world</span>. We
            build that world for you so your team can focus on the parts that are unique to your product.
          </p>
        </div>

        <div className="mt-14">
          <p className="text-base font-semibold text-blue-400 mb-4 text-center">What We Build</p>
          <p className="text-sm text-gray-400 mb-8 text-center max-w-2xl mx-auto">
            Every simulation world has six pieces. We build all six for your specific usecase, then ship the project folder.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pieces.map((piece) => (
              <div key={piece.title} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500">
                    <piece.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-base font-semibold text-white">{piece.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-gray-300">{piece.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          <div className="lg:col-span-2">
            <p className="text-base font-semibold text-blue-400">Why Start Here</p>
            <ul className="mt-4 space-y-3">
              {whyStart.map((reason) => (
                <li key={reason.title} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <span className="mt-2 inline-block h-2 w-2 flex-none rounded-full bg-blue-400"></span>
                  <div>
                    <p className="font-semibold text-white">{reason.title}</p>
                    <p className="text-sm text-gray-300 mt-1">{reason.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-base font-semibold text-blue-400">Tools We Use</p>
            <div className="mt-4 space-y-3">
              {tools.map((tool) => (
                <div key={tool.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="font-semibold text-white">{tool.name}</p>
                  <p className="mt-1 text-sm text-gray-300">{tool.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
