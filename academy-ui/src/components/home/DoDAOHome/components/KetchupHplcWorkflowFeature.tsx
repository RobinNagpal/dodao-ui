import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon, MinusCircleIcon } from '@heroicons/react/20/solid';

const highlights = ['Models the HPLC sample prep workflow for ketchup.', 'Five of the eight workflow steps run end to end in Gazebo Harmonic today.'];

const stack = [
  { label: 'Sim', value: 'Gazebo Harmonic' },
  { label: 'Next', value: 'Isaac Sim port' },
];

type StepPreview = {
  num: string;
  title: string;
  done: boolean;
};

const stepPreview: StepPreview[] = [
  { num: '01', title: 'Weighing', done: false },
  { num: '02', title: 'Dissolution', done: true },
  { num: '03', title: 'Dilution', done: true },
  { num: '04', title: 'Filtering', done: true },
  { num: '05', title: 'Transfer to Vial', done: true },
  { num: '06', title: 'Capping', done: false },
  { num: '07', title: 'Labeling', done: false },
  { num: '08', title: 'Autosampler Place', done: true },
];

export default function KetchupHplcWorkflowFeature() {
  return (
    <section className="relative overflow-hidden bg-bg py-16 sm:py-20" id="featured-project">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
<<<<<<< HEAD
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-blue-100 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-indigo-100 rounded-full blur-3xl"></div>
=======
        <div className="absolute -top-32 -right-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
<<<<<<< HEAD
            <h2 className="text-base font-semibold leading-7 text-indigo-700 mb-3">Featured Robotics Project</h2>
            <p className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
              Ketchup HPLC Workflow <span className="text-indigo-600">in Simulation</span>
=======
            <h2 className="text-base font-semibold leading-7 text-primary mb-3">Featured Robotics Project</h2>
            <p className="text-2xl font-bold tracking-tight text-heading sm:text-3xl lg:text-4xl">
              Ketchup HPLC Workflow <span className="text-primary">in Simulation</span>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
            </p>
            <p className="mt-4 text-lg leading-7 text-body">
              HPLC sample prep is an eight step workflow. Most training material uses paracetamol because it is clean and easy. We built our simulation around
              ketchup instead. The chemistry is messier, the simulation has to handle more state, and the gaps show up sooner. Five steps run in Gazebo today.
              The Isaac Sim port comes next.
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
                href="/home-section/dodao-io/products/ketchup-hplc-workflow"
<<<<<<< HEAD
                className="inline-flex items-center gap-x-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
=======
                className="inline-flex items-center gap-x-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text shadow-sm hover:bg-primary/85 transition-colors"
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
              >
                Read the case study
                <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="relative">
<<<<<<< HEAD
            <div className="relative overflow-hidden rounded-2xl bg-indigo-50 p-1 ring-1 ring-indigo-200">
              <div className="relative overflow-hidden rounded-xl bg-white p-6">
                <p className="text-xs uppercase tracking-widest text-indigo-700 font-semibold text-center">Workflow Status</p>
                <p className="mt-2 text-lg font-semibold text-gray-900 text-center">5 of 8 steps in Gazebo</p>
=======
            <div className="relative overflow-hidden rounded-2xl bg-primary/15 p-1 ring-1 ring-primary/40">
              <div className="relative overflow-hidden rounded-xl bg-surface p-6">
                <p className="text-xs uppercase tracking-widest text-primary font-semibold text-center">Workflow Status</p>
                <p className="mt-2 text-lg font-semibold text-heading text-center">5 of 8 steps in Gazebo</p>
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17

                <ul className="mt-6 grid grid-cols-2 gap-2">
                  {stepPreview.map((step) => (
                    <li
                      key={step.num}
                      className={`flex items-center gap-x-2 rounded-lg px-3 py-2 text-xs ${
<<<<<<< HEAD
                        step.done ? 'bg-indigo-50 text-indigo-900 ring-1 ring-indigo-200' : 'bg-slate-50 text-slate-700 ring-1 ring-slate-200'
                      }`}
                    >
                      {step.done ? (
                        <CheckCircleIcon className="h-4 w-4 flex-none text-indigo-600" aria-hidden="true" />
                      ) : (
                        <MinusCircleIcon className="h-4 w-4 flex-none text-slate-400" aria-hidden="true" />
=======
                        step.done ? 'bg-primary/15 text-primary ring-1 ring-primary/40' : 'bg-surface-2 text-body ring-1 ring-border'
                      }`}
                    >
                      {step.done ? (
                        <CheckCircleIcon className="h-4 w-4 flex-none text-primary" aria-hidden="true" />
                      ) : (
                        <MinusCircleIcon className="h-4 w-4 flex-none text-muted" aria-hidden="true" />
>>>>>>> 6115279d181e8293b6e2501ed4253d6624d39a17
                      )}
                      <span className="font-mono text-[10px] opacity-70">{step.num}</span>
                      <span className="font-medium">{step.title}</span>
                    </li>
                  ))}
                </ul>

                <p className="mt-4 text-xs italic text-muted text-center">A short Gazebo simulation clip will be added here.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
