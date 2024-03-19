'use client';
import Image from 'next/image';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import blockchainCourses from '@/images/DoDAOHomePage/blockchainCourses.png';
import { useState } from 'react';
import { PDFViewModal } from './PDFViewModal';

export function BlockchainCourses() {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
  };
  return (
    <section
      id="blockchain-courses"
      aria-labelledby="blockchain-courses-title"
      className="scroll-mt-14 pb-8 pt-16 sm:scroll-mt-32 sm:pb-10 sm:pt-20 lg:pb-16 lg:pt-16"
    >
      <Container size="lg">
        <SectionHeading number="4" id="blockchain-courses-title">
          Blockchain-Courses
        </SectionHeading>
        <div className="overflow-hidden py-24 sm:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div className="lg:ml-auto lg:pl-4">
                <div className="lg:max-w-lg">
                  <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Blockchain Courses</p>
                  <p className="mt-6 text-lg leading-8">
                    Unlock the potential of blockchain technology with our comprehensive courses. We have created a curriculum that dives deep into the world of
                    NFTs, DeFi, Layer 2 solutions, and more, providing essential knowledge and practical skills that will set you apart in this rapidly evolving
                    industry.
                  </p>
                  <p className="mt-6 text-lg leading-8 ">
                    From understanding the basics to mastering advanced concepts, our educational journey is designed to empower enthusiasts, students, and
                    organizations alike. With DoDAO&apos;s blockchain courses, you&apos;re stepping into a new era of digital innovation and opportunity.
                  </p>
                  <p className="mt-6 text-lg leading-8 ">
                    In our blockchain courses, we share real-world case studies, giving you a firsthand look at how blockchain technology is being applied
                    across industries. From revolutionizing the financial sector through DeFi to transforming art and media with NFTs, these case studies not
                    only highlight the practical applications of blockchain but also illustrate the challenges and solutions encountered in real-life scenarios.
                    This approach ensures you gain valuable insights and practical knowledge that can be applied in your future projects or career.
                  </p>
                </div>
              </div>
              <div className="flex items-start justify-end lg:order-first">
                <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
                  <Image src={blockchainCourses} alt="" className="w-[37rem] max-w-none rounded-2xl object-cover" onClick={handleClick} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {isClicked && <PDFViewModal onClose={() => setIsClicked(false)} />}
      </Container>
    </section>
  );
}
