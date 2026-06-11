import { ArrowRightIcon, BeakerIcon, EyeIcon } from '@heroicons/react/24/outline';

type Service = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
  builtWith: { label: string; tools: string };
};

const services: Service[] = [
  {
    id: 'simulation-setup',
    name: 'Simulation Setup',
    tagline: 'A clean simulation world for your robot.',
    description:
      'When you start a robotics project, the first step is building a clean simulation world. We build that world for you so your team can focus on the parts that are unique to your product.',
    bullets: [
      'Robot model with the correct joint chain, link frames and joint limits',
      'Workspace bench, table, floor, fixtures and safety enclosures',
      'Cameras, depth sensors and force/torque sensors placed to match the real cell',
      'Lighting and material settings tuned to the real conditions',
      'Physics, friction, mass and joint dynamics tuned for grasping and insertion',
    ],
    builtWith: {
      label: 'Built with',
      tools: 'Gazebo Harmonic · Isaac Sim · Isaac Lab · URDF · USD · ROS 2',
    },
  },
  {
    id: 'synthetic-data',
    name: 'Synthetic Data',
    tagline: 'Labeled training data for your models.',
    description:
      'Real-world data is slow and expensive to label. Synthetic data is rendered inside the simulator, where the system already knows the ground truth of every pose, every contact force and every pixel.',
    bullets: [
      'Camera frames with bounding boxes and segmentation masks',
      'Depth at every pixel, plus pose and grasp labels',
      'Demonstration trajectories for behaviour cloning and diffusion policy',
      'Rare and edge cases generated on purpose',
      'Lidar, thermal, ultrasonic and force readings with realistic noise',
    ],
    builtWith: {
      label: 'Shipped in',
      tools: 'LeRobot · Robomimic · RLDS · COCO JSON · HDF5 · MCAP rosbags · YOLO labels',
    },
  },
];

export default function ServicesOverviewSection() {
  return (
<<<<<<< HEAD
    <section id="services" className="relative py-20 bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-400">What We Offer</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Two services. One foundation.</p>
          <p className="mt-4 text-lg text-gray-300">
=======
    <section id="services" className="relative py-20 bg-gradient-to-b from-bg to-surface">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">What We Offer</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Two services. One foundation.</p>
          <p className="mt-4 text-lg text-body">
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
            Both services build on the same careful simulation of your cell. Engage us for one or both — most teams start with the simulation and add the data
            pipeline once the world is solid.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {services.map((service, idx) => (
            <div
              key={service.id}
<<<<<<< HEAD
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/20 transition-colors"
            >
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <div className="flex flex-col h-full p-8">
                <div className="flex items-start gap-x-4">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500">
                    {idx === 0 ? <BeakerIcon className="h-6 w-6 text-white" /> : <EyeIcon className="h-6 w-6 text-white" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{service.name}</h3>
                    <p className="mt-1 text-sm text-blue-300">{service.tagline}</p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-gray-300">{service.description}</p>

                <ul className="mt-5 space-y-2">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-x-2 text-sm text-gray-300">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-blue-400"></span>
=======
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-sm hover:border-primary/40 transition-colors"
            >
              <div className="h-1.5 bg-gradient-to-r from-primary to-link"></div>
              <div className="flex flex-col h-full p-8">
                <div className="flex items-start gap-x-4">
                  <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-primary to-link">
                    {idx === 0 ? <BeakerIcon className="h-6 w-6 text-primary-text" /> : <EyeIcon className="h-6 w-6 text-primary-text" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-heading">{service.name}</h3>
                    <p className="mt-1 text-sm text-primary">{service.tagline}</p>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-6 text-body">{service.description}</p>

                <ul className="mt-5 space-y-2">
                  {service.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-x-2 text-sm text-body">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 flex-none rounded-full bg-primary"></span>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

<<<<<<< HEAD
                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-300">{service.builtWith.label}</p>
                  <p className="mt-1 text-sm text-gray-200">{service.builtWith.tools}</p>
=======
                <div className="mt-6 rounded-xl border border-border bg-surface-2 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{service.builtWith.label}</p>
                  <p className="mt-1 text-sm text-body">{service.builtWith.tools}</p>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
                </div>

                <div className="mt-auto pt-6">
                  <a
                    href={`#${service.id}`}
<<<<<<< HEAD
                    className="inline-flex items-center gap-x-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-blue-500 hover:to-indigo-500 transition-colors"
=======
                    className="inline-flex items-center gap-x-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text shadow-sm hover:bg-primary/85 transition-colors"
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
                  >
                    See the details
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
