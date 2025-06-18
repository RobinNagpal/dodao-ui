import platformImage from '@/images/homepage/platform-img.jpg';
import { CpuChipIcon, PuzzlePieceIcon, ShieldCheckIcon } from '@heroicons/react/20/solid';
import Image from 'next/image';

const features = [
  {
    name: 'Custom AI Agents',
    description:
      'Design and deploy AI Agents tailored to your exact reporting logic—whether it’s market risk scoring, healthcare compliance checks, or supply-chain performance. No deep ML expertise required.',
    icon: CpuChipIcon,
  },
  {
    name: 'Cross-Domain Flexibility',
    description:
      'From finance and healthcare to manufacturing and retail, KoalaGains adapts to any industry. Plug in your data sources and let our platform handle aggregation, normalization, and visualization.',
    icon: PuzzlePieceIcon,
  },
  {
    name: 'Ultra-Low Cost & Quick Turnaround',
    description:
      'Generate high-quality, data-rich reports—with charts, references, and stats—in minutes at a fraction (1/100) of traditional research costs. Scale up or down without the admin overhead.',
    icon: ShieldCheckIcon,
  },
];

export default function Features() {
  return (
    <div id="features" className="overflow-hidden bg-gray-800 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <p className="text-base/7 font-semibold text-indigo-400">Automate Your Reporting Workflow</p>
              <h2 className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">Why Teams Choose KoalaGains</h2>
              <p className="mt-6 text-lg/8 text-gray-300">
                KoalaGains brings together data ingestion, AI-driven analysis, and rich visualization in one platform. Configure once and let your custom Agents
                generate consistent, high-fidelity reports on demand.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base/7 text-gray-300 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-white">
                      <feature.icon aria-hidden="true" className="absolute left-1 top-1 h-5 w-5 text-indigo-500" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="block mt-1">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <Image
            src={platformImage}
            alt="KoalaGains AI platform dashboard"
            className="w-[48rem] h-full max-w-none rounded-xl shadow-xl ring-1 ring-white/10 sm:w-[57rem] md:-ml-4 lg:-ml-0 opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
