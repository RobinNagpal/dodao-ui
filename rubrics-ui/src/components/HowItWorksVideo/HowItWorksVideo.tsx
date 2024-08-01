import { Container } from '@/components/Container/Container';
import { ArrowPathIcon, CloudArrowUpIcon, Cog6ToothIcon, LockClosedIcon, FolderOpenIcon, BellAlertIcon } from '@heroicons/react/20/solid';
import RubricVideo from '@/images/rubric-video.gif';
import Image from 'next/image';

export default function HowItWorksVideo() {
  return (
    <section id="rubric-site" aria-labelledby="rubric-site-title" className="scroll-mt-14  sm:scroll-mt-32  pb-16">
      <Container>
        <div className="mx-auto lg:mx-0"></div>
        <div className="py-16 sm:py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-8"></div>
          <div className="relative pt-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
              <Image src={RubricVideo} alt="Rubric Site Gif" className="mb-[-12%]  rounded-xl ring-1 ring-gray-900/10" width={2432} height={1442} />
            </div>
          </div>
          <div className="mx-auto mt-16 max-w-7xl px-6 sm:mt-28 md:mt-32 lg:mt-44 lg:px-8"></div>
        </div>
      </Container>
    </section>
  );
}
