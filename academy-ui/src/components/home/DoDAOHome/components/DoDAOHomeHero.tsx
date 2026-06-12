import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

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

        {/* Headline still: a robot arm working inside a simulated cell */}
        <div className="mt-14 mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-2xl shadow-primary/20 backdrop-blur-sm">
            <Image
              src="/robotics/robotics_sim.jpg"
              alt="A robot arm working inside a simulation scene — Gazebo or Isaac Sim world built for the robot, before any hardware moves"
              width={1280}
              height={720}
              className="block w-full h-auto"
            />
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            A robot arm inside a simulated cell — the kind of Gazebo or Isaac Sim world we build for your project before any hardware moves.
          </p>
        </div>

        {/* Centerpiece video — domain randomization across six renders of the same scene */}
        <div className="mt-14 mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-2xl shadow-primary/20 backdrop-blur-sm">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="Six parallel renders of the same scene with different lighting, textures and colors — domain randomization for synthetic data"
              className="block w-full h-auto"
            >
              <source src="/robotics/robotics_video_1.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            Same scene rendered six times — domain randomization changes lighting, textures and colors so vision models trained on this data generalize to real
            cameras.
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

        {/* Second sim-to-real clip — in motion this time, not just stills */}
        <div className="mt-14 mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 shadow-2xl shadow-primary/20 backdrop-blur-sm">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              aria-label="The same robot motion shown in simulation and on real hardware, side by side"
              className="block w-full h-auto"
            >
              <source src="/robotics/robotics_video_2.mp4" type="video/mp4" />
            </video>
          </div>
          <p className="mt-4 text-center text-sm text-muted">
            The same robot motion in simulation and on real hardware — the policy is trained in sim, then runs unchanged on the real cell.
          </p>
        </div>
      </div>
    </div>
  );
}
