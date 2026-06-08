import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/20/solid';

const highlights = [
  'Picks capped sample vials from an inbound rack and reads each barcode label.',
  'Looks up the correct slot in LIMS and places each vial in the autosampler tray.',
  'Logs the barcode-to-slot mapping for a clean audit trail (pharma / clinical-grade).',
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
    <section className="relative overflow-hidden bg-white py-16 sm:py-20" id="featured-project">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-emerald-100 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-cyan-100 rounded-full blur-3xl"></div>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <h2 className="text-base font-semibold leading-7 text-emerald-700 mb-3">Featured Robotics Project</h2>
            <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              HPLC Autosampler <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Tray Loader</span>
            </p>
            <p className="mt-4 text-lg leading-7 text-gray-600">
              HPLC is one of the most common chemistry-lab instruments on earth. A technician spends hours every day loading sample vials into the autosampler
              tray by hand. We are building the robot that takes over that step — accurately, repeatably, and with a full audit log.
            </p>

            <ul className="mt-6 space-y-3">
              {highlights.map((line) => (
                <li key={line} className="flex items-start gap-x-3">
                  <CheckCircleIcon className="h-5 w-5 flex-none text-emerald-600 mt-0.5" aria-hidden="true" />
                  <span className="text-sm leading-6 text-gray-700">{line}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-2">
              {stack.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200"
                >
                  <span className="text-emerald-500 mr-1.5">{item.label}:</span>
                  {item.value}
                </span>
              ))}
            </div>

            <div className="mt-8">
              <a
                href="/home-section/dodao-io/projects/hplc-autosampler"
                className="inline-flex items-center gap-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-emerald-500 hover:to-cyan-500 transition-colors"
              >
                Read the full case study
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 p-1 ring-1 ring-emerald-200">
              <div className="relative overflow-hidden rounded-xl bg-white/70 backdrop-blur-sm aspect-[4/3] flex items-center justify-center">
                <div className="text-center px-6">
                  <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">Simulation Preview</p>
                  <p className="mt-2 text-lg font-semibold text-gray-900">myCobot 280 Pi in Gazebo Harmonic</p>
                  <p className="mt-3 text-sm text-gray-600 max-w-sm mx-auto">
                    A 6-DoF cobot picks vials from a rack, reads barcodes with a wrist camera, and places each vial in the correct 12×32 mm slot of the
                    autosampler tray.
                  </p>
                  <p className="mt-4 text-xs italic text-gray-500">A Gazebo GIF of the working sim will land here in the next release.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
