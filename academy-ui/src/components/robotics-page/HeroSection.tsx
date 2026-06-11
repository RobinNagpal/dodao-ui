import { ArrowRightIcon, BeakerIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function HeroSection() {
  const services = [
    {
      icon: BeakerIcon,
      title: 'Simulation Setup',
      desc: 'Robot, bench, parts, sensors and lighting modeled to match your real cell.',
    },
    {
      icon: EyeIcon,
      title: 'Synthetic Data',
      desc: 'Labeled images, masks, depth, pose, sensor data and demonstrations.',
    },
  ];

  return (
<<<<<<< HEAD
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
=======
    <section className="relative overflow-hidden bg-gradient-to-br from-bg to-surface">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20 lg:py-24 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
<<<<<<< HEAD
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-blue-200 ring-1 ring-inset ring-white/20 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-green-400"></span>
            Two services for robotics teams
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            DoDAO <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">Robotics</span>
          </h1>

          <p className="mt-6 text-lg leading-7 text-gray-300 sm:text-xl sm:leading-8">
=======
          <div className="inline-flex items-center gap-2 rounded-full bg-surface/60 px-4 py-1.5 text-xs font-semibold text-primary ring-1 ring-inset ring-border backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-success"></span>
            Two services for robotics teams
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-heading sm:text-5xl lg:text-6xl">
            DoDAO <span className="bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">Robotics</span>
          </h1>

          <p className="mt-6 text-lg leading-7 text-body sm:text-xl sm:leading-8">
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
            Robotics teams need two things before training and testing: a clean simulation world for the robot, and the labeled synthetic data the vision and
            policy models will learn from. We build both for you.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="#contact"
<<<<<<< HEAD
              className="inline-flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:from-blue-500 hover:to-indigo-500 transition-colors sm:w-auto"
=======
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-text shadow-lg hover:bg-primary/85 transition-colors sm:w-auto"
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
            >
              Tell us about your project
              <ArrowRightIcon className="ml-2 h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="#services"
<<<<<<< HEAD
              className="inline-flex w-full items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-gray-200 backdrop-blur-sm hover:bg-white/10 transition-colors sm:w-auto"
=======
              className="inline-flex w-full items-center justify-center rounded-lg border border-border bg-surface/60 px-6 py-3 text-base font-semibold text-body backdrop-blur-sm hover:bg-surface/80 transition-colors sm:w-auto"
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
            >
              See how it works
            </a>
          </div>
        </div>

<<<<<<< HEAD
=======
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
            Same robot motion, six randomized scenes — one short example of the synthetic data we generate for vision and policy training.
          </p>
        </div>

>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
          {services.map((service) => (
            <div
              key={service.title}
<<<<<<< HEAD
              className="group rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 hover:shadow-xl hover:shadow-blue-500/20"
            >
              <div className="flex items-center gap-x-4">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 transition-transform duration-300 group-hover:scale-110">
                  <service.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-white">{service.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-300">{service.desc}</p>
=======
              className="group rounded-2xl border border-border bg-surface/60 backdrop-blur-sm p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-surface/80 hover:shadow-xl hover:shadow-primary/20"
            >
              <div className="flex items-center gap-x-4">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-gradient-to-br from-primary to-link transition-transform duration-300 group-hover:scale-110">
                  <service.icon className="h-6 w-6 text-primary-text" aria-hidden="true" />
                </div>
                <h3 className="text-lg font-semibold text-heading">{service.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-body">{service.desc}</p>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
