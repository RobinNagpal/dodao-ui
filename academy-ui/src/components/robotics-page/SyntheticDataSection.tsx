import { CameraIcon, CodeBracketIcon, CubeTransparentIcon, DocumentTextIcon, EyeIcon, ExclamationTriangleIcon, SignalIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

type Produced = {
  title: string;
  desc: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const produced: Produced[] = [
  {
    title: 'Detection images and masks',
    desc: 'Camera frames with bounding boxes plus segmentation masks at every pixel. Ready to train YOLO or any model your team already runs.',
    icon: CameraIcon,
  },
  {
    title: 'Depth, pose and grasp labels',
    desc: 'Depth at every pixel plus the position, orientation and grasp points of every object. The data picking and assembly models need.',
    icon: CubeTransparentIcon,
  },
  {
    title: 'Demonstration trajectories',
    desc: 'Full observation and action logs of a teleoperated expert doing the task. The training set for behaviour cloning, diffusion policy and VLA models.',
    icon: CodeBracketIcon,
  },
  {
    title: 'Rare and edge cases',
    desc: 'Occlusions, damaged goods, glare, spills and people in the path. Generated on purpose so your model sees what real data rarely captures.',
    icon: ExclamationTriangleIcon,
  },
  {
    title: 'Non-camera sensors',
    desc: 'Lidar point clouds, thermal frames, ultrasonic returns and force readings with realistic noise. For robots that rely on more than cameras.',
    icon: SignalIcon,
  },
  {
    title: 'OCR / barcode renders',
    desc: 'Camera frames with generated text, codes and labels at random fonts, glare and angles. The training data OCR and barcode pipelines need.',
    icon: DocumentTextIcon,
  },
];

const methods = ['Domain Randomization', 'Procedural Scenes', 'Photo-Real Rendering', 'Sensor Noise Modelling'];

const formats = ['LeRobot', 'COCO JSON', 'Custom HDF5', 'MCAP rosbags', 'YOLO labels'];

export default function SyntheticDataSection() {
  return (
    <section id="synthetic-data" className="relative py-20 bg-bg scroll-mt-24">
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface/60 px-4 py-1.5 text-xs font-semibold text-primary ring-1 ring-inset ring-border">
            <EyeIcon className="h-4 w-4" />
            Service Two
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-heading sm:text-4xl">Synthetic Data</h2>
          <p className="mt-4 text-lg text-body">
            Real-world data is <span className="font-semibold text-primary">slow and expensive</span> to label. Synthetic data is rendered inside the simulator,
            where the system already knows the ground truth of every pose, every contact force, and every pixel.
          </p>
        </div>

        <div className="mt-12 mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-sm">
              <Image
                src="/robotics/sim_robot.png"
                alt="Universal Robots arm picking a can in NVIDIA Isaac Sim — the simulated training scene"
                width={561}
                height={565}
                className="block w-full h-auto"
              />
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-sm">
              <Image
                src="/robotics/real_robot.png"
                alt="The same Universal Robots arm picking the same can on real hardware"
                width={562}
                height={562}
                className="block w-full h-auto"
              />
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            Same robot, same task — left side is the simulation we build, right side is the real cell. Policies trained on the left run on the right.
          </p>
        </div>

        <div className="mt-16">
          <p className="text-base font-semibold text-primary mb-8 text-center">What We Produce</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {produced.map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-6 hover:border-primary/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-primary to-link">
                    <item.icon className="h-5 w-5 text-primary-text" />
                  </div>
                  <h3 className="text-base font-semibold text-heading">{item.title}</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-body">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <p className="text-base font-semibold text-primary mb-4 text-center">How We Generate It</p>
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            {methods.map((m) => (
              <span
                key={m}
                className="inline-flex items-center justify-center rounded-full border border-border bg-surface/60 px-4 py-2 text-center text-sm font-medium text-body backdrop-blur-sm"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 mx-auto max-w-4xl rounded-2xl border border-border bg-gradient-to-br from-primary/10 to-link/10 p-6 backdrop-blur-sm">
          <p className="text-base font-semibold text-primary text-center">Shipped in your format</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {formats.map((f) => (
              <span key={f} className="inline-flex items-center rounded-md bg-surface-2 px-3 py-1 text-xs font-medium text-body">
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
