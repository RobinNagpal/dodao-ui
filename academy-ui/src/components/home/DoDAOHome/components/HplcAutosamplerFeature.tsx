import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/20/solid';

const highlights = [
  'Helps lab staff handle the slow, manual part of HPLC sample prep.',
  'Covers vial transfer, capping, labeling, and loading into the autosampler tray.',
  'Logs every step so labs get a clean audit trail for QC and compliance work.',
];

const stack = [
  { label: 'Sim', value: 'Gazebo Harmonic' },
  { label: 'Middleware', value: 'ROS 2' },
  { label: 'Motion', value: 'MoveIt 2' },
  { label: 'Perception', value: 'RGB-D + AprilTag' },
  { label: 'Arm', value: 'myCobot 280 Pi' },
];

export default function HplcAutosamplerFeature() {
  return (
    <section className="relative overflow-hidden bg-bg py-16 sm:py-20" id="featured-project">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-base font-semibold leading-7 text-primary mb-3">Featured Robotics Project</h2>
            <p className="text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
              HPLC Autosampler <span className="bg-gradient-to-r from-link to-primary bg-clip-text text-transparent">Tray Loader</span>
            </p>
            <p className="mt-4 text-lg leading-7 text-body">
              HPLC is one of the most common chemistry-lab instruments in the world. Lab technicians spend hours every day preparing samples and loading vials
              by hand. We are building the robot arm that takes that work off their plate, accurately and with a full audit trail.
            </p>

            <ul className="mt-6 space-y-3">
              {highlights.map((line) => (
                <li key={line} className="flex items-start gap-x-3">
                  <CheckCircleIcon className="h-5 w-5 flex-none text-primary mt-0.5" aria-hidden="true" />
                  <span className="text-sm leading-6 text-body">{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-2">
              {stack.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary ring-1 ring-primary/40"
                >
                  <span className="text-link mr-1.5">{item.label}:</span>
                  {item.value}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <a
                href="/home-section/dodao-io/products/hplc-autosampler"
                className="inline-flex items-center gap-x-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text shadow-sm hover:bg-primary/85 transition-colors"
              >
                Read the full case study
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl bg-primary/15 p-1 ring-1 ring-primary/40">
              <div className="relative overflow-hidden rounded-xl bg-bg/70 backdrop-blur-sm aspect-[4/3] flex items-center justify-center">
                <div className="text-center px-6">
                  <p className="text-xs uppercase tracking-widest text-primary font-semibold">Simulation Preview</p>
                  <p className="mt-2 text-lg font-semibold text-heading">myCobot 280 Pi in Gazebo Harmonic</p>
                  <p className="mt-3 text-sm text-body max-w-sm mx-auto">
                    A 6-DoF cobot picks vials from a rack, reads barcodes with a wrist camera, and places each vial in the correct 12×32 mm slot of the
                    autosampler tray.
                  </p>
                  <p className="mt-4 text-xs italic text-muted">A short Gazebo simulation clip will be added here as we progress.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
