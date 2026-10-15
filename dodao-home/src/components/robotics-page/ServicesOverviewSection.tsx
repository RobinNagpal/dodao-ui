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
    <section id="services" className="relative py-20 bg-gradient-to-b from-bg to-surface">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">What We Offer</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Two services. One foundation.</p>
          <p className="mt-4 text-lg text-body">
            Both services build on the same careful simulation of your cell. Engage us for one or both — most teams start with the simulation and add the data
            pipeline once the world is solid.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {services.map((service, idx) => (
            <div
              key={service.id}
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
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 rounded-xl border border-border bg-surface-2 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">{service.builtWith.label}</p>
                  <p className="mt-1 text-sm text-body">{service.builtWith.tools}</p>
                </div>

                <div className="mt-auto pt-6">
                  <a
                    href={`#${service.id}`}
                    className="inline-flex items-center gap-x-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text shadow-sm hover:bg-primary/85 transition-colors"
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
