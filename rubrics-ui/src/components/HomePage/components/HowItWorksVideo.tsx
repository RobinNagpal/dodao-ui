import { Container } from '@/components/HomePage/components/Container';
import RubricVideo from '@/components/HomePage/images/rubric-video.gif';
import Image from 'next/image';

export default function HowItWorksVideo() {
  return (
    <section id="rubric-site" aria-labelledby="rubric-site-title" className="">
      <Container>
        <div className="mx-auto lg:mx-0"></div>
        <div className="py-5 sm:py-12">
          <div className="mx-auto max-w-5xl px-6 lg:px-8"></div>
          <div className="relative pt-6">
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
