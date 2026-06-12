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
