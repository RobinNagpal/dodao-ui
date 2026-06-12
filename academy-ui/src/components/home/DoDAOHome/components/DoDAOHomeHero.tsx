import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

const tools = [
  { name: 'Gazebo Harmonic', logo: '/robotics/gazebo.png' },
  { name: 'NVIDIA Isaac Sim', logo: '/robotics/nvidia-isaac.webp' },
  { name: 'MuJoCo', logo: '/robotics/mujoco.png' },
];

export default function DoDAOHomeHero() {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-bg to-surface">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="absolute inset-0 opacity-40 dodao-dot-pattern"></div>

      <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:py-20 lg:px-8">
        <div className="text-center mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface/60 px-4 py-1.5 text-sm font-semibold text-primary ring-1 ring-inset ring-border backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-success"></span>
            Robotics, proven in simulation
          </div>

          <h1 className="mt-6 text-3xl font-bold tracking-tight text-heading sm:text-5xl lg:text-6xl">
            <span className="block">Robotics that start in</span>
            <span className="block bg-gradient-to-r from-link to-primary bg-clip-text text-transparent pb-1.5">simulation, first.</span>
          </h1>

          <p className="mt-6 text-lg leading-7 text-body sm:text-xl sm:leading-8 max-w-3xl mx-auto">
            Every robotics project we ship starts with a clean Gazebo or Isaac Sim world, and the labeled synthetic data your vision and policy models learn
            from. We build both for you, before any robot moves.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="/robotics"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-text shadow-lg hover:bg-primary/85 transition-colors"
            >
              See our robotics work
              <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="/contact"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-border bg-surface/60 px-6 py-3 text-base font-semibold text-body backdrop-blur-sm hover:bg-surface/80 transition-colors"
            >
              Tell us about your project
            </a>
          </div>
        </div>

        {/* Centerpiece video — six randomized renders of the same robot motion */}
        <div className="mt-14 mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-2xl shadow-primary/20 backdrop-blur-sm">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="Six parallel renders of the same robot motion with different lighting, textures and objects"
              className="block w-full h-auto"
            >
              <source src="/robotics/robotics_video_1.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            Same robot motion, six randomized scenes — a quick look at the synthetic data we generate for vision and policy training.
          </p>
        </div>

        {/* Sim-to-real strip — visual proof that sim policies run on real hardware */}
        <div className="mt-14 mx-auto max-w-5xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-primary">Built in simulation, run on hardware</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-sm">
              <Image
                src="/robotics/sim_robot.png"
                alt="Universal Robots arm picking a can in NVIDIA Isaac Sim — the simulated training scene"
                width={561}
                height={565}
                className="block w-full h-auto"
              />
              <p className="px-4 py-2 text-center text-[11px] uppercase tracking-widest text-muted">Sim</p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-surface/60 backdrop-blur-sm">
              <Image
                src="/robotics/real_robot.png"
                alt="The same Universal Robots arm picking the same can on real hardware"
                width={562}
                height={562}
                className="block w-full h-auto"
              />
              <p className="px-4 py-2 text-center text-[11px] uppercase tracking-widest text-muted">Real</p>
            </div>
          </div>
          <p className="mt-3 text-center text-sm text-muted">Left: the simulated cell we build. Right: the matching real-world setup the policy runs on.</p>
        </div>

        {/* Tool logos strip */}
        <div className="mt-14 mx-auto max-w-4xl">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">Tools we work with</p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {tools.map((tool) => (
              <div key={tool.name} className="flex items-center justify-center gap-3 rounded-xl border border-border bg-surface/60 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 flex-none items-center justify-center">
                  <Image src={tool.logo} alt={`${tool.name} logo`} width={40} height={40} className="h-full w-full object-contain" />
                </div>
                <span className="text-sm font-semibold text-heading">{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
