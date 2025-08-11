import { PlayCircleIcon, EyeIcon } from '@heroicons/react/24/outline';

export default function DemoSection() {
  return (
    <section id="demo" className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold text-white">See It in Action</h2>
          <p className="mt-4 text-lg text-gray-300">Experience the platform through wireframes and interactive demos</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-video rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 ring-1 ring-white/10 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-4">
                <PlayCircleIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-semibold text-white">Student Interface</p>
              <p className="text-sm text-gray-400 mt-1">Interactive case study walkthrough</p>
            </div>
          </div>

          <div className="aspect-video rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 ring-1 ring-white/10 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-4">
                <EyeIcon className="h-8 w-8 text-white" />
              </div>
              <p className="text-lg font-semibold text-white">Professor Dashboard</p>
              <p className="text-sm text-gray-400 mt-1">Real-time monitoring and feedback</p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="aspect-video rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 ring-1 ring-white/10 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-6">
                <PlayCircleIcon className="h-10 w-10 text-white" />
              </div>
              <p className="text-2xl font-semibold text-white mb-2">Complete Platform Demo</p>
              <p className="text-gray-400">Full walkthrough of the GenAI simulation experience</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
