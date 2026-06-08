import { CogIcon, CpuChipIcon, BeakerIcon, EyeIcon } from '@heroicons/react/24/outline';

type Offering = {
  name: string;
  tagline: string;
  description: string;
  stack: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  gradient: string;
  accent: string;
};

const offerings: Offering[] = [
  {
    name: 'Robotics Software Engineering',
    tagline: 'ROS 2, motion planning, controls',
    description:
      'We build production robot software for arms and mobile robots. ROS 2 nodes, MoveIt 2 motion planning, controllers, and behavior trees. The software that turns hardware into a working product.',
    stack: 'ROS 2 · MoveIt 2 · OMPL · BehaviorTree.CPP',
    href: '/home-section/dodao-io/services/robotics#software',
    icon: CpuChipIcon,
    gradient: 'from-emerald-500 to-teal-500',
    accent: 'text-emerald-300',
  },
  {
    name: 'Computer Vision & Perception',
    tagline: 'See, locate, and understand',
    description:
      'Perception pipelines that let robots make sense of cluttered, real-world scenes. We work on 6-DoF pose, instance segmentation, grasp estimation, SLAM, and depth fusion.',
    stack: 'OpenCV · Open3D · FoundationPose · SAM 2 · DINOv2 · YOLO',
    href: '/home-section/dodao-io/services/robotics#perception',
    icon: EyeIcon,
    gradient: 'from-teal-500 to-cyan-500',
    accent: 'text-cyan-300',
  },
  {
    name: 'Simulation & Digital Twins',
    tagline: 'Prove it in sim before hardware',
    description:
      'High-fidelity simulation worlds and digital twins of your cell. Train policies, validate behavior, and catch problems before any robot arrives on the bench.',
    stack: 'Gazebo Harmonic · Isaac Sim / Lab · MuJoCo · Sim2Real domain randomization',
    href: '/home-section/dodao-io/services/robotics#simulation',
    icon: BeakerIcon,
    gradient: 'from-cyan-500 to-sky-500',
    accent: 'text-sky-300',
  },
  {
    name: 'Robotics Hardware',
    tagline: 'Arm, gripper, sensors, compute',
    description:
      'We help you pick and integrate the right arm, gripper, sensors, compute, and power. Then we walk the cell through bring-up to a working production setup.',
    stack: 'myCobot 280 · UR / Franka · RealSense · ATI F/T · Jetson / NUC',
    href: '/home-section/dodao-io/services/robotics#hardware',
    icon: CogIcon,
    gradient: 'from-sky-500 to-blue-500',
    accent: 'text-blue-300',
  },
];

export default function RoboticsOfferings() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-emerald-950 py-16 sm:py-20" id="robotics-services">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-base font-semibold leading-7 text-emerald-400 mb-4">Robotics Services</h2>
          <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            <span className="block">The Four Layers We Build</span>
          </p>
          <p className="mt-4 text-lg leading-7 text-gray-300 max-w-3xl mx-auto">
            Most robotics projects need the same four things to ship. Software, perception, simulation, and hardware. We work on all four. You can engage us for
            one layer or the whole stack.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {offerings.map((offering) => (
            <a
              key={offering.name}
              href={offering.href}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-colors duration-300"
            >
              <div className={`h-1.5 bg-gradient-to-r ${offering.gradient}`}></div>
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-start space-x-4">
                  <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br ${offering.gradient}`}>
                    <offering.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{offering.name}</h3>
                    <p className={`text-sm font-medium ${offering.accent}`}>{offering.tagline}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-300">{offering.description}</p>
                <p className="mt-4 text-xs uppercase tracking-wide text-gray-400">Stack</p>
                <p className="mt-1 text-sm text-gray-200">{offering.stack}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
