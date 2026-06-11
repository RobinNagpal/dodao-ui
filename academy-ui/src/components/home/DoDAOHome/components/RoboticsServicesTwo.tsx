import { ArrowRightIcon, BeakerIcon, EyeIcon } from '@heroicons/react/24/outline';

type Offering = {
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  stack: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const offerings: Offering[] = [
  {
    name: 'Simulation Setup',
    tagline: 'Built first, before any movement or perception code.',
    description:
      'We set up the Gazebo and Isaac Sim world for your project. The robot, the bench, the parts, the cameras and the lighting are all modeled to match the real setup, so your team can start working on the actual problem from day one.',
    bullets: [
      'Robot model from your URDF or USD assets',
      'Bench, table, racks and parts for your usecase',
      'Camera and sensor placements that match real hardware',
      'Lighting and material settings tuned to the real conditions',
    ],
    stack: 'Gazebo Harmonic · Isaac Sim · Isaac Lab · URDF · USD',
    href: '/robotics',
    icon: BeakerIcon,
  },
  {
    name: 'Synthetic Data',
    tagline: 'Labeled training data from your simulation, by the thousand.',
    description:
      'Once the simulation is ready, the same scene can produce labeled images for your vision models. Object detection, segmentation, pose, depth and more. Useful when real data is rare, slow to collect or expensive to label.',
    bullets: [
      'Datasets for YOLO and other detection models',
      'Segmentation, pose and grasp datasets',
      'Domain randomization on lighting, color and clutter',
      'Labels written in the format your training code expects',
    ],
    stack: 'NVIDIA Replicator · Isaac Sim · Gazebo Harmonic · YOLO · PyTorch',
    href: '/robotics',
    icon: EyeIcon,
  },
];

export default function RoboticsServicesTwo() {
  return (
<<<<<<< HEAD
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 py-16 sm:py-20" id="robotics-services">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
=======
    <section className="relative overflow-hidden bg-gradient-to-br from-bg to-surface py-16 sm:py-20" id="robotics-services">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-12">
<<<<<<< HEAD
          <h2 className="text-base font-semibold leading-7 text-blue-400 mb-4">Robotics Services</h2>
          <p className="text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
=======
          <h2 className="text-base font-semibold leading-7 text-primary mb-4">Robotics Services</h2>
          <p className="text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
            <span className="block">Two Services We Offer Today</span>
          </p>
          <p className="mt-4 text-lg leading-7 text-body max-w-3xl mx-auto">
            Every robotics project we ship starts with a careful simulation. We build that world for you and we turn it into the labeled data your vision models
            need. You can engage us for one or both.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {offerings.map((offering) => (
            <div
              key={offering.name}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-surface/60 backdrop-blur-sm border border-border hover:bg-surface/80 transition-colors duration-300"
            >
<<<<<<< HEAD
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                    <offering.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{offering.name}</h3>
                    <p className="text-sm font-medium text-blue-300">{offering.tagline}</p>
=======
              <div className="h-1.5 bg-gradient-to-r from-primary to-link"></div>
              <div className="p-6 flex flex-col h-full">
                <div className="flex items-start space-x-4">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-primary to-link">
                    <offering.icon className="h-6 w-6 text-primary-text" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-heading">{offering.name}</h3>
                    <p className="text-sm font-medium text-primary">{offering.tagline}</p>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
                  </div>
                </div>

                <p className="mt-4 text-sm leading-6 text-body">{offering.description}</p>

                <ul className="mt-4 space-y-2">
                  {offering.bullets.map((bullet) => (
<<<<<<< HEAD
                    <li key={bullet} className="flex items-start gap-x-2 text-sm text-gray-300">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-blue-400"></span>
=======
                    <li key={bullet} className="flex items-start gap-x-2 text-sm text-body">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-primary"></span>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 text-xs uppercase tracking-wide text-muted">Tools</p>
                <p className="mt-1 text-sm text-body">{offering.stack}</p>

                <div className="mt-6">
                  <a
                    href={offering.href}
<<<<<<< HEAD
                    className="inline-flex items-center gap-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-colors"
=======
                    className="inline-flex items-center gap-x-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-text shadow-sm hover:bg-primary/85 transition-colors"
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
                  >
                    Read the {offering.name} page
                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
