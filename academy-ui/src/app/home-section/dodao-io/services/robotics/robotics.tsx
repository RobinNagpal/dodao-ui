import { ArrowRightIcon, BeakerIcon, EyeIcon } from '@heroicons/react/24/outline';

type Section = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  whatWeDo: string[];
  stack: string[];
  detailHref: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  accent: string;
  gradient: string;
};

const sections: Section[] = [
  {
    id: 'simulation-setup',
    name: 'Simulation Setup',
    tagline: 'Gazebo and Isaac Sim worlds, modeled for your exact usecase.',
    description:
      'The first thing every robotics project needs is a clean simulation. We model the robot, the bench, the parts and the sensors so your team can start working on the actual problem instead of spending weeks setting up the scene. Movement, control and perception are layered on top later, once the world is solid.',
    whatWeDo: [
      'Robot models with the correct joints and frames from your URDF or USD assets',
      'The bench, table or floor layout of the cell',
      'Every part you pick, place, scan or work with',
      'Camera and sensor placements that match the real setup',
      'Lighting and material settings that match the real conditions',
    ],
    stack: ['Gazebo Harmonic', 'Isaac Sim', 'Isaac Lab', 'URDF', 'USD', 'ROS 2'],
    detailHref: '/home-section/dodao-io/services/simulation-setup',
    icon: BeakerIcon,
    accent: 'text-sky-600',
    gradient: 'from-cyan-500 to-sky-500',
  },
  {
    id: 'synthetic-data',
    name: 'Synthetic Data',
    tagline: 'Labeled images from simulation to train YOLO and other vision models.',
    description:
      'Vision and perception models need a lot of labeled images. Collecting and labeling them from the real world is slow and costly. With a working simulation we can produce thousands of labeled frames in the background, with very little extra effort. We usually mix synthetic and real data so the model learns both.',
    whatWeDo: [
      'Object detection datasets for YOLO and similar models',
      'Segmentation, pose and grasp datasets for perception pipelines',
      'Depth and stereo data for 3D vision models',
      'Domain randomization across lighting, color, texture and clutter',
      'Labels written in the format your training pipeline expects',
    ],
    stack: ['NVIDIA Replicator', 'Isaac Sim', 'Gazebo Harmonic', 'YOLO', 'PyTorch'],
    detailHref: '/home-section/dodao-io/services/synthetic-data',
    icon: EyeIcon,
    accent: 'text-emerald-600',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export default function RoboticsServicesContent() {
  return (
    <div className="not-prose">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Robotics <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Services</span>
        </h1>
        <p className="mt-4 text-lg leading-7 text-gray-600 max-w-3xl">
          At DoDAO we offer two robotics services right now. We set up the simulation world for your project and we generate the labeled data your perception
          models need. Both build on the same foundation: a careful, high quality simulation of your cell.
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
            <p className="text-sm text-emerald-800 mt-1">Simulation first, then perception, then real hardware. One clear order, every project.</p>
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
                <p className="text-xs uppercase tracking-wide font-semibold text-gray-500">Tools we use</p>
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

            <div className="mt-6">
              <a
                href={section.detailHref}
                className={`inline-flex items-center gap-x-2 rounded-xl bg-gradient-to-r ${section.gradient} px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity`}
              >
                Read the full {section.name} page
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 border border-emerald-200 p-8 text-center">
        <p className="text-base font-semibold text-emerald-800">Want to see this in action?</p>
        <p className="mt-2 text-sm text-gray-700 max-w-2xl mx-auto">
          Read our flagship robotics case study. A simulation first robotic arm that loads sample vials into HPLC autosampler trays for chemistry labs.
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
