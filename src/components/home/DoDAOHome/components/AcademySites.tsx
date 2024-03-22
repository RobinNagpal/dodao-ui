import { SectionHeading } from './SectionHeading';
import { Container } from './Container';
import { ArrowPathIcon, CloudArrowUpIcon, Cog6ToothIcon, LockClosedIcon, FolderOpenIcon, BellAlertIcon } from '@heroicons/react/20/solid';
import Academy_site from '@/images/Academy_site.gif';
import Image from 'next/image';

export function AcademySites() {
  const features = [
    {
      name: 'Guides',
      description:
        'Our nano-courses offer focused learning on specific topics. In just 5-10 minutes, users can absorb information, test their knowledge with multiple-choice questions.',
      icon: CloudArrowUpIcon,
    },
    {
      name: 'Simulations/Clickable Demos',
      description:
        "We've built simulations to confidently acquaint users with protocols without the risk. Interactive and secure, these demos teach without the fear of clicking wrong links.",
      icon: FolderOpenIcon,
    },
    {
      name: 'TidBits',
      description:
        'Designed for efficiency, TidBits deliver crucial information in compact, easy-to-digest steps. These brief 5-10 sentence pieces allow for rapid understanding without the overwhelm of longer reads.',
      icon: ArrowPathIcon,
    },
    {
      name: 'Advanced security.',
      description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit aute id magna.',
      icon: LockClosedIcon,
    },
    {
      name: 'Courses',
      description:
        'For those seeking depth, our courses combine texts, diagrams, videos, and interactive questions to provide a rich, 30-60 minute learning journey.',
      icon: Cog6ToothIcon,
    },
    {
      name: 'Timelines',
      description:
        'Stay up-to-date with our timelines that track and inform about the latest product developments and releases, keeping customers connected and informed.',
      icon: BellAlertIcon,
    },
  ];
  return (
    <section id="academy-sites" aria-labelledby="academy-sites-title" className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-16">
      <Container size="lg">
        <div className="mx-auto lg:mx-0">
          <SectionHeading number="2" id="academy-sites-title">
            Academy Sites
          </SectionHeading>
        </div>
        <div className="py-16 sm:py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl sm:text-center">
              <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Academy Sites</p>
              <p className="mt-6 text-lg leading-8">
                Companies rely heavily on extensive technical documentation that can be overwhelming and time-consuming for users to review and comprehend. We
                have created academy sites which utilize a combination of different innovative formats for educating your users.
              </p>
            </div>
          </div>
          <div className="relative pt-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <Image src={Academy_site} alt="Academy Site Gif" className="mb-[-12%] rounded-xl ring-1 ring-gray-900/10" width={2432} height={1442} />
            </div>
          </div>
          <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-28 md:mt-32 lg:mt-44 lg:px-8">
            <dl className="mt-24 mx-auto grid max-w-2xl grid-cols-1 gap-x-6 gap-y-10 text-base leading-7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8 lg:gap-y-16">
              {features.map((feature) => (
                <div key={feature.name} className="relative pl-9">
                  <dt className="inline font-semibold text-gray-900">
                    <feature.icon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                    {feature.name}
                  </dt>{' '}
                  <dd className="inline">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </Container>
    </section>
  );
}
