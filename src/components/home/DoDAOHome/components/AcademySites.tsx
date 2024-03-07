import { SectionHeading } from './SectionHeading';
import Image from 'next/image';
import AAVE from '@/images/DAO/AAVE.png';
import Balancer from '@/images/DAO/Balancer.png';
import Compound from '@/images/DAO/Compound.png';
import Harmony from '@/images/DAO/Harmony.png';
import Near from '@/images/DAO/Near.png';
import Uniswap from '@/images/DAO/Uniswap.png';
import { Container } from './Container';

export function AcademySites() {
  const values = [
    {
      name: 'Guides',
      description:
        'Our nano-courses offer focused learning on specific topics. In just 5-10 minutes, users can absorb information, test their knowledge with multiple-choice questions.',
    },
    {
      name: 'Simulations/Clickable Demos',
      description:
        "We've built simulations to confidently acquaint users with protocols without the risk. Interactive and secure, these demos teach without the fear of clicking wrong links.",
    },
    {
      name: 'TidBits',
      description:
        'Designed for efficiency, TidBits deliver crucial information in compact, easy-to-digest steps. These brief 5-10 sentence pieces allow for rapid understanding without the overwhelm of longer reads.',
    },
    {
      name: 'Courses',
      description:
        'For those seeking depth, our courses combine texts, diagrams, videos, and interactive questions to provide a rich, 30-60 minute learning journey.',
    },
    {
      name: 'Take responsibility',
      description:
        'Sit minus expedita quam in ullam molestiae dignissimos in harum. Tenetur dolorem iure. Non nesciunt dolorem veniam necessitatibus laboriosam voluptas perspiciatis error.',
    },
    {
      name: 'Timelines',
      description:
        'Stay up-to-date with our timelines that track and inform about the latest product developments and releases, keeping customers connected and informed.',
    },
  ];

  return (
    <section id="academy-sites" aria-labelledby="academy-sites-title" className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32">
      {/* <div className="mx-auto max-w-6xl px-6 lg:px-8"> */}
      <Container size="lg">
        <div className="mx-auto lg:mx-0">
          <SectionHeading number="1" id="academy-sites-title">
            Academy Sites
          </SectionHeading>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Dive into tailored learning with our Academy sites, where we create educational experiences for companies. Our resources cater to diverse learning
            preferences and schedules, ensuring everyone has access to the knowledge they need, when they need it.
          </p>
        </div>
        <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {values.map((value) => (
            <div key={value.name}>
              <dt className="font-semibold text-gray-900">{value.name}</dt>
              <dd className="mt-1 text-gray-600">{value.description}</dd>
            </div>
          ))}
        </dl>
      </Container>
      {/* </sdiv> */}
      <div className="relative isolate -z-10 mt-32 sm:mt-48">
        <div className="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center overflow-hidden [mask-image:radial-gradient(50%_45%_at_50%_55%,white,transparent)]">
          <svg className="h-[40rem] w-[80rem] flex-none stroke-gray-200" aria-hidden="true">
            <defs>
              <pattern
                id="e9033f3e-f665-41a6-84ef-756f6778e6fe"
                width={200}
                height={200}
                x="50%"
                y="50%"
                patternUnits="userSpaceOnUse"
                patternTransform="translate(-100 0)"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <svg x="50%" y="50%" className="overflow-visible fill-gray-50">
              <path d="M-300 0h201v201h-201Z M300 200h201v201h-201Z" strokeWidth={0} />
            </svg>
            <rect width="100%" height="100%" strokeWidth={0} fill="url(#e9033f3e-f665-41a6-84ef-756f6778e6fe)" />
          </svg>
        </div>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold leading-8 text-gray-900">Serving Industry Leaders</h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
            <Image
              className="col-span-2 col-start-2 max-h-28 w-full object-contain sm:col-start-auto lg:col-span-1"
              src={Near}
              alt="Near"
              width={158}
              height={150}
            />
            <Image
              className="col-span-2 col-start-2 max-h-24 w-full object-contain sm:col-start-auto lg:col-span-1"
              src={Balancer}
              alt="Balancer"
              width={158}
              height={150}
            />

            <Image
              className="col-span-2 col-start-2 max-h-24 w-full object-contain sm:col-start-auto lg:col-span-1"
              src={Harmony}
              alt="Harmony"
              width={158}
              height={150}
            />
            <Image
              className="col-span-2 col-start-2 max-h-24 w-full object-contain sm:col-start-auto lg:col-span-1"
              src={Compound}
              alt="Compound"
              width={158}
              height={150}
            />
            <Image
              className="col-span-2 col-start-2 max-h-28 w-full object-contain sm:col-start-auto lg:col-span-1"
              src={AAVE}
              alt="AAVE"
              width={158}
              height={150}
            />
            <Image
              className="col-span-2 col-start-2 max-h-28 w-full object-contain sm:col-start-auto lg:col-span-1"
              src={Uniswap}
              alt="Uniswap"
              width={158}
              height={150}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
