import blockchainCourses from '@/images/DoDAOHomePage/blockchainCourses.webp';
import Image from 'next/image';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';

export function BlockchainCourses() {
  return (
    <section
      id="blockchain-courses"
      aria-labelledby="blockchain-courses-title"
      className="scroll-mt-14 pb-8 pt-16 sm:scroll-mt-32 sm:pb-10 sm:pt-20 lg:pb-16 lg:pt-32"
    >
      <Container size="lg">
        <SectionHeading number="4" id="blockchain-courses-title">
          Blockchain-Courses
        </SectionHeading>
        <div className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-16 sm:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div className="lg:pr-4">
                <div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
                  <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
                    <Image src={blockchainCourses} alt="" className="aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover" />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-base leading-7 text-gray-700 lg:max-w-lg">
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Blockchain Courses</h1>
                  <div className="max-w-xl">
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                      Unlock the potential of blockchain technology with our comprehensive courses. We have created a curriculum that dives deep into the world
                      of NFTs, DeFi, Layer 2 solutions, and more, providing essential knowledge and practical skills that will set you apart in this rapidly
                      evolving industry.
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                      From understanding the basics to mastering advanced concepts, our educational journey is designed to empower enthusiasts, students, and
                      organizations alike. With DoDAO's blockchain courses, you're stepping into a new era of digital innovation and opportunity.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
