'use client';
import Image from 'next/image';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import { useState } from 'react';
import { PDFViewModal } from './PDFViewModal';
import { navbarToggleEvent } from './NavbarToggle';
import educationalContent from '@/images/DoDAOHomePage/educationalContent.jpg';
import educationCrypto from '@/images/DoDAOHomePage/educationCrypto.webp';
import { IframeViewModal } from './IframeFullScreenModal';

const education = [
  {
    name: 'Blockchain Courses',
    description:
      'Unlock the potential of blockchain technology with our comprehensive courses. We have created a curriculum that dives deep into the world of NFTs, DeFi, Layer 2 solutions, and more, providing essential knowledge and practical skills that will set you apart in this rapidly evolving industry.',
    imageSrc: educationCrypto,
    imageAlt: 'Blockchain Courses',
  },
  {
    name: 'Educational Content',
    description:
      'Need engaging educational materials for your blockchain or DeFi project? DoDAO offers comprehensive content creation services tailored to your needs. As a leading provider, we craft end-to-end educational content that empowers your audience to understand and embrace your technology.',
    imageSrc: educationalContent,
    imageAlt: 'Educational Content',
  },
];

export function Education() {
  const [isClickedPDF, setIsClickedPDF] = useState(false);
  const [isClickedUni, setIsClickedUni] = useState(false);
  const [isClickedArbi, setIsClickedArbi] = useState(false);

  const handleClickPDF = () => {
    setIsClickedPDF(true);
    window.dispatchEvent(navbarToggleEvent);
  };

  const handleClosePDF = () => {
    setIsClickedPDF(false);
    window.dispatchEvent(navbarToggleEvent);
  };

  const handleClickUni = () => {
    setIsClickedUni(true);
    window.dispatchEvent(navbarToggleEvent);
  };

  const handleCloseUni = () => {
    setIsClickedUni(false);
    window.dispatchEvent(navbarToggleEvent);
  };

  const handleClickArbi = () => {
    setIsClickedArbi(true);
    window.dispatchEvent(navbarToggleEvent);
  };

  const handleCloseArbi = () => {
    setIsClickedArbi(false);
    window.dispatchEvent(navbarToggleEvent);
  };

  return (
    <section id="education" aria-labelledby="education-title" className="scroll-mt-14 sm:scroll-mt-32 pb-20">
      <Container size="lg" className="bg-gray-50 pt-8">
        <SectionHeading number="3" id="education-title">
          Education
        </SectionHeading>

        <div className="mx-auto max-w-7xl pt-4 sm:pt-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Education</h2>
              <p className="mt-4 text-base text-gray-500">
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
                          <Image alt={item.imageAlt} src={item.imageSrc} className="mx-auto h-40" width={220} height={150} />
                        </div>
                      </div>
                      <div className="mt-3 sm:ml-3 sm:mt-0 lg:ml-0 lg:mt-3">
                        <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                        <p className="mt-2 text-base text-gray-500">{item.description}</p>
                        {item.name === 'Blockchain Courses' && (
                          <p onClick={handleClickPDF} className="mt-2 text-base font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                            Read more →
                          </p>
                        )}

                        {item.name === 'Educational Content' && (
                          <>
                            <p onClick={handleClickUni} className="mt-2 text-base font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                              https://uniswap.university/ →
                            </p>
                            <p onClick={handleClickArbi} className="mt-2 text-base font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                              https://arbitrum.education/ →
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {isClickedPDF && <PDFViewModal onClose={handleClosePDF} />}
        {isClickedUni && <IframeViewModal onClose={handleCloseUni} title="Uniswap Educational Website" src="https://uniswap.university/" />}
        {isClickedArbi && <IframeViewModal onClose={handleCloseArbi} title="Arbitrum Educational Website" src="https://arbitrum.education/" />}
      </Container>
    </section>
  );
}
