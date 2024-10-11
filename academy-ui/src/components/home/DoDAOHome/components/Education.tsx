'use client';
import Image from 'next/image';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import blockchainCourses from '@/images/DoDAOHomePage/blockchainCourses.png';
import { useState } from 'react';
import { PDFViewModal } from './PDFViewModal';
import { navbarToggleEvent } from './NavbarToggle';
import educationalContent from '@/images/DoDAOHomePage/educationalContent.jpg';

const education = [
  {
    name: 'Blockchain Courses',
    description:
      'Unlock the potential of blockchain technology with our comprehensive courses. We have created a curriculum that dives deep into the world of NFTs, DeFi, Layer 2 solutions, and more, providing essential knowledge and practical skills that will set you apart in this rapidly evolving industry.',
    imageSrc: blockchainCourses,
  },
  {
    name: 'Educational Content',
    description:
      'Need engaging educational materials for your blockchain or DeFi project? DoDAO offers comprehensive content creation services tailored to your needs. As a leading provider in the industry, we craft end-to-end educational content that empowers your audience to understand and embrace your technology.',
    imageSrc: educationalContent,
  },
];

export function Education() {
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
    <section id="education" aria-labelledby="education-title" className="scroll-mt-14 sm:scroll-mt-32 pb-20">
      <Container size="lg" className="bg-gray-50 pt-8">
        <SectionHeading number="4" id="education-title">
          Education
        </SectionHeading>

        <div className="mx-auto max-w-7xl py-4 sm:py-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-4xl font-bold tracking-tight text-gray-900">Education</h2>
              <p className="mt-4 text-gray-500">
                At DoDAO, we are dedicated to spreading knowledge about blockchain technology and decentralized finance (DeFi). We offer a variety of
                educational services to help individuals and businesses understand and embrace this rapidly evolving industry.
              </p>
            </div>
            <div>
              <div className="mx-auto max-w-7xl py-8 sm:px-2 sm:py-16 lg:px-4">
                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 px-4 lg:max-w-none lg:grid-cols-2">
                  {education.map((item) => (
                    <div key={item.name} className="text-center sm:flex sm:text-left lg:block lg:text-center">
                      <div className="sm:flex-shrink-0">
                        <div className="flow-root">
                          <Image alt="" src={item.imageSrc} className="mx-auto" width={144} height={128} />
                        </div>
                      </div>
                      <div className="mt-3 sm:ml-3 sm:mt-0 lg:ml-0 lg:mt-3">
                        <h3 className="text-base font-medium text-gray-900">{item.name}</h3>
                        <p className="mt-2 text-sm text-gray-500">{item.description}</p>
                      </div>
                    </div>
                  ))}
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
