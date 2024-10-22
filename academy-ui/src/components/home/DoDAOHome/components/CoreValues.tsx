import { LightBulbIcon, UserGroupIcon, WrenchIcon, ArrowTrendingUpIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const coreValues = [
  {
    name: 'Right Intention',
    description:
      "Inspired by the Buddha's Eightfold Path, it's important to start with the right intentions.  We strive to create valuable tools and services for our partners, helping them succeed. We aim to leave a positive impact on everyone we work with.",
    icon: LightBulbIcon,
  },
  {
    name: 'Right Team',
    description:
      'We are not driven by aggressive financial goals. For us, the journey should be full of fun and learning. We are a team of builders always looking to create something new and useful, whether it’s our own product or for our partners.',
    icon: UserGroupIcon,
  },
  {
    name: 'Hard Work',
    description:
      'Being able to work hard without feeling drained is a true blessing. We believe that when we focus on what truly matters and surround ourselves with the right team, hard work becomes more fulfilling and less of a forced effort.',
    icon: WrenchIcon,
  },
  {
    name: 'Moving Fast',
    description:
      "We are not rushing to build a big team or raise funds. But as a startup, it's important to try many 'home run shots'. For us, the biggest failure is not trying at all. Each attempt, whether successful or not, brings us closer to finding what works.",
    icon: RocketLaunchIcon,
  },
  {
    name: 'Collective Growth',
    description:
      "Even though we haven't reached our goals yet, we believe every day should be about learning and growing. We commit to growing our knowledge each day. Once we find the right business area, we aim to achieve financial growth together as a team.",
    icon: ArrowTrendingUpIcon,
  },
];

export default function CoreValues() {
  return (
    <div className="py-8 mt-8 bg-gray-50">
      <div className="mx-auto px-6 w-full">
        <div className="mx-auto max-w-2xl text-center lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Our Core Values</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">What We Believe In</p>
          <p className="mt-4 text-base text-gray-500">Our journey is guided by our core values. They shape our actions and decisions every day.</p>
        </div>
        <div className="mx-auto mt-16 max-w-6xl">
          <dl className="flex flex-wrap justify-center gap-y-10">
            {coreValues.map((value, index) => (
              <div key={value.name} className={`relative px-16 w-full sm:w-1/2 ${index === coreValues.length - 1 ? 'sm:mx-auto' : ''}`}>
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <value.icon aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  {value.name}
                </dt>
                <dd className="mt-2 text-base text-gray-500">{value.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
