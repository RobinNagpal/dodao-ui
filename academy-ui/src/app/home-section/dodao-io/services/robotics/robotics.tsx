import { ArrowRightIcon, BeakerIcon, CogIcon, CpuChipIcon, EyeIcon } from '@heroicons/react/24/outline';

type Section = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  whatWeDo: string[];
  stack: string[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: string;
  gradient: string;
};

const sections: Section[] = [
  {
    id: 'software',
    name: 'Robotics Software Engineering',
    tagline: 'ROS 2 stacks, motion planning, controls, and full system integration.',
    description:
      'The software that turns a robot from a bag of motors into a useful product. We architect ROS 2 stacks, write motion-planning code on MoveIt 2, design behavior trees for task orchestration, and integrate sensors, controllers, and grippers into a working cell.',
    whatWeDo: [
      'ROS 2 architecture, package design, and DDS tuning',
      'Motion planning with MoveIt 2 (OMPL, CHOMP) and trajectory optimization',
      'Behavior trees for task-level orchestration (BehaviorTree.CPP)',
      'Joint, Cartesian, and admittance control with controller_manager',
      'Integration of vendor SDKs (UR, Franka, myCobot, Robotiq grippers) under one ROS 2 graph',
    ],
    stack: ['ROS 2 (Humble / Jazzy)', 'MoveIt 2', 'OMPL', 'BehaviorTree.CPP', 'ros2_control', 'Cyclone DDS'],
    icon: CpuChipIcon,
    accent: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'perception',
    name: 'Computer Vision & Perception',
    tagline: 'See, locate, and understand objects in cluttered real-world scenes.',
    description:
      'Robots need to know what they are looking at and where it is. We build perception pipelines that combine classical computer vision, deep models, and modern vision foundation models. The output is reliable detections, poses, and grasps that the motion layer can use.',
    whatWeDo: [
      '6-DoF object pose estimation with FoundationPose / MegaPose for industrial parts',
      'Instance segmentation (Mask R-CNN, SAM 2) for clutter and bin-pick scenes',
      'Visual and visual-inertial SLAM, plus AprilTag-based localization',
      'RGB-D depth fusion, point-cloud filtering, and grasp-point estimation',
      'Hand-eye calibration and camera-intrinsics workflows for new cells',
    ],
    stack: ['OpenCV', 'Open3D', 'PyTorch', 'FoundationPose', 'SAM 2', 'DINOv2', 'Depth-Anything', 'YOLO'],
    icon: EyeIcon,
    accent: 'text-cyan-600',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    id: 'simulation',
    name: 'Simulation & Digital Twins',
    tagline: 'Prove every motion in simulation before you commit to hardware.',
    description:
      'Simulation lets us iterate on perception, motion, and policy work without burning a robot. We build high-fidelity Gazebo and Isaac Sim environments, generate synthetic training data, and run Sim2Real bring-up so customer hardware lands on a stack that already works.',
    whatWeDo: [
      'Gazebo Harmonic worlds and Isaac Sim / Lab environments from your URDF or USD assets',
      'Synthetic data generation with domain randomization for vision-model training',
      'Reinforcement-learning training loops (PPO, SAC) and Sim2Real transfer',
      'Digital-twin views of customer cells for what-if and regression testing',
      'CI-style nightly policy regression runs across a fixed scenario suite',
    ],
    stack: ['Gazebo Harmonic', 'Isaac Sim / Isaac Lab', 'MuJoCo', 'Stable-Baselines3', 'LeRobot', 'NVIDIA Replicator'],
    icon: BeakerIcon,
    accent: 'text-sky-600',
    gradient: 'from-cyan-500 to-sky-500',
  },
  {
    id: 'hardware',
    name: 'Robotics Hardware',
    tagline: 'Arm, gripper, sensors, compute, and the bring-up that ties it together.',
    description:
      'We help you pick the right collaborative arm, gripper, sensors, and compute for the task. Then we bring the cell up from box-open to working pick-and-place. We focus on commercially available, well-supported parts so the system stays maintainable.',
    whatWeDo: [
      'Arm selection across cobot tiers (myCobot 280, UR cobots, Franka research arms)',
      'Gripper selection: parallel-jaw, suction, or a custom 3-finger top-down tool for vial-style tasks',
      'Sensor selection: RGB-D cameras (RealSense, ZED), wrist F/T, encoders, safety scanners',
      'Compute and edge selection (Jetson, Intel NUC) for ROS 2 deployment',
      'Mechanical mounting, power, networking, and operator HMI bring-up',
    ],
    stack: ['Elephant Robotics myCobot 280', 'Universal Robots / Franka', 'Intel RealSense', 'ATI F/T', 'NVIDIA Jetson', 'Custom mounts and base plates'],
    icon: CogIcon,
    accent: 'text-blue-600',
    gradient: 'from-sky-500 to-blue-500',
  },
];

export default function RoboticsServicesContent() {
  return (
    <div className="not-prose">
      <header className="mb-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Robotics <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Services</span>
        </h1>
        <p className="mt-4 text-lg leading-7 text-gray-600 max-w-3xl">
          Most robotics projects need the same four things to ship. Software, perception, simulation, and hardware. We work on all four. You can engage us for
          one layer or the whole stack. Below is what we do in each area, and the open-source and commercial tools we use.
        </p>

        <nav className="mt-6 flex flex-wrap gap-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="inline-flex items-center gap-x-1 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              {section.name}
            </a>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-emerald-900">New here? Read how we approach a robotics project.</p>
            <p className="text-sm text-emerald-800 mt-1">Requirements first, then hardware, then software, then bring-up. One clear order, every project.</p>
          </div>
          <a
            href="/home-section/dodao-io/services/robotics/approach"
            className="inline-flex items-center justify-center rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 transition-colors"
          >
            Our approach
          </a>
        </div>
      </header>

      <div className="space-y-16">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <div className="flex items-start gap-x-4">
              <div className={`flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br ${section.gradient}`}>
                <section.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900">{section.name}</h2>
                <p className={`mt-1 text-sm font-medium ${section.accent}`}>{section.tagline}</p>
              </div>
            </div>

            <p className="mt-4 text-base leading-7 text-gray-700">{section.description}</p>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 rounded-2xl bg-gray-50 border border-gray-200 p-6">
                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">What we do</p>
                <ul className="mt-3 space-y-2">
                  {section.whatWeDo.map((line) => (
                    <li key={line} className="flex items-start gap-x-2 text-sm text-gray-700">
                      <span className={`mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-gradient-to-r ${section.gradient}`}></span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 p-6">
                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">Stack we work with</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {section.stack.map((tool) => (
                    <li
                      key={tool}
                      className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-8 text-center">
        <p className="text-base font-semibold text-emerald-800">Want to see this in action?</p>
        <p className="mt-2 text-sm text-gray-700 max-w-2xl mx-auto">
          Read our flagship robotics case study — a simulation-first robotic arm that loads sample vials into HPLC autosampler trays for chemistry labs.
        </p>
        <a
          href="/home-section/dodao-io/products/hplc-autosampler"
          className="mt-5 inline-flex items-center gap-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-500 hover:to-cyan-500 transition-colors"
        >
          HPLC Autosampler case study
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
