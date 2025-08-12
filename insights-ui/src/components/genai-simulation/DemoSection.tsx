import { PlayCircleIcon, EyeIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import studentDashboard from '@/images/simulations/studentDashboard.png';
import professorDashboard from '@/images/simulations/professorDashboard.png';
import professorGif from '@/images/simulations/professorGif.gif';

export default function DemoSection() {
  return (
    <section id="demo" className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold text-indigo-400">Experience the Simulation</h2>
          <p className="mt-4 text-lg text-gray-300">See how AI transforms business education</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="aspect-video rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 ring-1 ring-white/10 flex items-center justify-center relative overflow-hidden group">
            <Image src={studentDashboard} alt="Student Interface Dashboard" className="w-full h-full object-cover rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="aspect-video rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 ring-1 ring-white/10 flex items-center justify-center relative overflow-hidden group">
            <Image src={professorDashboard} alt="Professor Dashboard" className="w-full h-full object-cover rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="rounded-2xl border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 ring-1 ring-white/10 relative overflow-hidden group inline-block">
            <Image src={professorGif} alt="Complete Platform Demo" width={1300} height={620} className="rounded-2xl" unoptimized />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </section>
  );
}
