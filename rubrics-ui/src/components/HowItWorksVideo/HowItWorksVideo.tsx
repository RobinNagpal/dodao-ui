import { Container } from '@/components/Container/Container';
import { ArrowPathIcon, CloudArrowUpIcon, Cog6ToothIcon, LockClosedIcon, FolderOpenIcon, BellAlertIcon } from '@heroicons/react/20/solid';
// import Academy_site from '@/images/Academy_site.gif';
import Image from 'next/image';

export default function HowItWorksVideo() {
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
    <section id="rubric-site" aria-labelledby="rubric-site-title" className="scroll-mt-14  sm:scroll-mt-32  pb-16">
      <Container>
        <div className="mx-auto lg:mx-0"></div>
        <div className="py-16 sm:py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8"></div>
          <div className="relative pt-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <Image src="" alt="Rubric Site Gif" className="mb-[-12%] rounded-xl ring-1 ring-gray-900/10" width={2432} height={1442} />
            </div>
          </div>
          <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-28 md:mt-32 lg:mt-44 lg:px-8"></div>
        </div>
      </Container>
    </section>
  );
}
