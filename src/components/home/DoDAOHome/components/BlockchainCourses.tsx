'use client';
import Image from 'next/image';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import blockchainCourses from '@/images/DoDAOHomePage/blockchainCourses.png';
import { useState } from 'react';
import { PDFViewModal } from './PDFViewModal';
import { navbarToggleEvent } from './NavbarToggle';
export function BlockchainCourses() {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    window.dispatchEvent(navbarToggleEvent);
  };

  const handleClose = () => {
    setIsClicked(false);
    window.dispatchEvent(navbarToggleEvent);
  };

  return (
    <section
      id="blockchain-courses"
      aria-labelledby="blockchain-courses-title"
      className="scroll-mt-14 pb-8 pt-4 sm:scroll-mt-32 sm:pb-10 sm:pt-20 lg:pb-16 lg:pt-16"
    >
      <Container size="lg">
        <SectionHeading number="4" id="blockchain-courses-title">
          Blockchain-Courses
        </SectionHeading>
        <div className="relative mt-8">
          <div className="mx-auto max-w-7xl lg:flex lg:justify-between lg:px-8 xl:justify-end">
            <div className="lg:flex lg:w-1/2 lg:shrink lg:grow-0 xl:absolute xl:inset-y-0 xl:right-1/2 xl:w-1/2">
              <div className="relative h-80 lg:-ml-8 lg:h-auto lg:w-full lg:grow xl:ml-0">
                <Image
                  className="absolute inset-0 mt-6 h-full w-full rounded-2xl object-cover"
                  src={blockchainCourses}
                  alt="Blockchain Courses"
                  onClick={handleClick}
                />
              </div>
            </div>
            <div className="px-6 lg:contents">
              <div className="mx-auto max-w-3xl pb-24 pt-16 sm:pb-32 sm:pt-20 lg:ml-10 lg:mr-0 lg:w-full lg:max-w-lg lg:flex-none lg:pt-16 xl:w-1/2">
                <h1 className="text-3xl font-bold sm:text-4xl">Blockchain Courses</h1>
                <p className="mt-6 text-lg leading-8">
                  Unlock the potential of blockchain technology with our comprehensive courses. We have created a curriculum that dives deep into the world of
                  NFTs, DeFi, Layer 2 solutions, and more, providing essential knowledge and practical skills that will set you apart in this rapidly evolving
                  industry.
                </p>
                <div className="mt-6 text-lg leading-8">
                  <p>
                    From understanding the basics to mastering advanced concepts, our educational journey is designed to empower enthusiasts, students, and
                    organizations alike. With DoDAO&apos;s blockchain courses, you&apos;re stepping into a new era of digital innovation and opportunity.
                  </p>
                </div>
                <div className="mt-6 text-lg leading-8">
                  <p onClick={handleClick} className="inline-block mt-4 text-lg font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                    Read more →
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isClicked && <PDFViewModal onClose={handleClose} />}
      </Container>
    </section>
  );
}
