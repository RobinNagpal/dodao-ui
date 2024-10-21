import { LightBulbIcon, UserGroupIcon, WrenchIcon, ArrowTrendingUpIcon, RocketLaunchIcon } from '@heroicons/react/24/outline';

const coreValues = [
  {
    name: 'Right Intention',
    description:
      "Inspired by the Buddha's Eightfold Path, it's important to start with the right intentions. We aim to serve our users, develop solutions for our partners, and create a positive impact.",
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
      'Working hard effortlessly is a great blessing. By focusing on the right things and having the right team, we can work hard without feeling burdened.',
    icon: WrenchIcon,
  },
  {
    name: 'Moving Fast',
    description:
      "We are not rushing to build a big team or raise funds. But as a startup, it's important to try many 'home run shots'. We are not afraid of failing, but we are afraid of not trying.",
    icon: RocketLaunchIcon,
  },
  {
    name: 'Collective Growth',
    description:
      'Though we are still far from our goals, we believe each day should be full of learning and growth. We promise intellectual growth every day. Once we find the right business area, we aim to grow financially as a team too.',
    icon: ArrowTrendingUpIcon,
  },
];

export default function CoreValues() {
  return (
    <div className="bg-white py-8 sm:py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Our Core Values</h2>
          <p className="mt-2 text-pretty text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl lg:text-balance">What We Believe In</p>
          <p className="mt-6 text-lg leading-8 text-gray-600">Our journey is guided by our core values. They shape our actions and decisions every day.</p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {coreValues.map((value) => (
              <div key={value.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <value.icon aria-hidden="true" className="h-6 w-6 text-white" />
                  </div>
                  {value.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{value.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}
