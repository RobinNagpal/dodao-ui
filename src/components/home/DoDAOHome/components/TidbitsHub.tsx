import { CloudArrowUpIcon, LockClosedIcon, ServerIcon } from '@heroicons/react/20/solid';
import tidbits_demo from '@/images/TidbitsHub/GIFs/tidbits_demo.gif';
import Image from 'next/image';

const features = [
  {
    name: 'Short videos:',
    description: 'Users can watch concise, one-minute videos embedded within tidbits as we are aware that everyone has their own unique learning style.',
    icon: CloudArrowUpIcon,
  },
  {
    name: 'Shareable Content:',
    description: 'These tidbits can then be published to social media or can be used to create printed materials like pamphlets.',
    icon: LockClosedIcon,
  },
  {
    name: 'Call to Actions:',
    description: 'We can embed CTAs within tidbits that lead customers directly to application forms etc.',
    icon: ServerIcon,
  },
];

export default function TidbitsHub() {
  return (
    <div className="overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:ml-auto lg:pl-4">
            <div className="lg:max-w-lg">
              <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Tidbits Hub</p>
              <p className="mt-6 text-lg leading-8">
                At Tidbits Hub, we&apos;ve tapped into understanding precisely what format and style of content resonate most with today&apos;s consumers. Using
                this platform you can craft short, straightforward bite sized pieces of information which we call &quot;tidbits&quot; with each piece containing
                5-10 sentences. It provides quick understanding within 5 minutes, without the need for users to go through extensive material.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-bold">
                      <feature.icon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <div className="flex items-start justify-end lg:order-first">
            <Image
              src={tidbits_demo}
              alt="Product screenshot"
              className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem]"
              style={{
                width: 'auto',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
