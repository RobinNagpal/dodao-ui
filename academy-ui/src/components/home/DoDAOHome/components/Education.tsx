'use client';
import Image from 'next/image';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import { useState } from 'react';
import { PDFViewModal } from './PDFViewModal';
import { navbarToggleEvent } from './NavbarToggle';
import educationalContent from '@/images/DoDAOHomePage/educationalContent.jpg';
import educationCrypto from '@/images/DoDAOHomePage/educationCrypto.png';
import promptEngineering from '@/images/DoDAOHomePage/promptEngineering.jpg';
import aiAgent from '@/images/DoDAOHomePage/aiAgent.png';
import { IframeViewModal } from './IframeFullScreenModal';

const otherEducation = [
  {
    name: 'Prompt Engineering Guide',
    description:
      'Learn to craft and optimize prompts for any AI workflow with our comprehensive guide—covering prompt design best practices, chaining strategies, and performance tuning techniques.',
    imageSrc: promptEngineering,
    imageAlt: 'Prompt Engineering Guide',
  },
  {
    name: 'Educational Content',
    description:
      'Need engaging educational materials for your blockchain or DeFi project? DoDAO offers comprehensive content creation services tailored to your needs. As a leading provider, we craft end-to-end educational content that empowers your audience to understand and embrace your technology.',
    imageSrc: educationalContent,
    imageAlt: 'Educational Content',
  },
];

interface HeroEducationCardProps {
  title: string;
  subtitle: string;
  description: string;
  imageSrc: any;
  imageAlt: string;
  buttonText: string;
  onButtonClick: () => void;
}

function HeroEducationCardImageLeft({ title, subtitle, description, imageSrc, imageAlt, buttonText, onButtonClick }: HeroEducationCardProps) {
  return (
    <div className="relative bg-gray-900 min-h-[500px]">
      <div className="relative h-80 overflow-hidden bg-indigo-600 md:absolute md:left-0 md:h-full md:w-1/3 lg:w-1/2">
        <Image alt={imageAlt} src={imageSrc} className="size-full object-cover" width={800} height={600} />
        <svg viewBox="0 0 926 676" aria-hidden="true" className="absolute -bottom-24 left-24 w-[57.875rem] transform-gpu blur-[118px]">
          <path
            d="m254.325 516.708-90.89 158.331L0 436.427l254.325 80.281 163.691-285.15c1.048 131.759 36.144 345.144 168.149 144.613C751.171 125.508 707.17-93.823 826.603 41.15c95.546 107.978 104.766 294.048 97.432 373.585L685.481 297.694l16.974 360.474-448.13-141.46Z"
            fill="url(#ai-gradient-left)"
            fillOpacity=".4"
          />
          <defs>
            <linearGradient id="ai-gradient-left" x1="926.392" x2="-109.635" y1=".176" y2="321.024" gradientUnits="userSpaceOnUse">
              <stop stopColor="#776FFF" />
              <stop offset={1} stopColor="#FF4694" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="relative mx-auto max-w-7xl py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="pl-6 pr-6 md:ml-auto md:w-2/3 md:pl-8 lg:w-1/2 lg:pl-12 lg:pr-0 xl:pl-16">
          <h2 className="text-base/7 font-semibold text-indigo-400">{subtitle}</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</p>
          <p className="mt-6 text-base/7 text-gray-300">{description}</p>
          <div className="mt-8">
            <button
              onClick={onButtonClick}
              className="inline-flex rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroEducationCardImageRight({ title, subtitle, description, imageSrc, imageAlt, buttonText, onButtonClick }: HeroEducationCardProps) {
  return (
    <div className="relative bg-gray-900 min-h-[500px]">
      <div className="relative h-80 overflow-hidden bg-indigo-600 md:absolute md:right-0 md:h-full md:w-1/3 lg:w-1/2">
        <Image alt={imageAlt} src={imageSrc} className="size-full object-cover" width={800} height={600} />
        <svg viewBox="0 0 926 676" aria-hidden="true" className="absolute -bottom-24 right-24 w-[57.875rem] transform-gpu blur-[118px]">
          <path
            d="m254.325 516.708-90.89 158.331L0 436.427l254.325 80.281 163.691-285.15c1.048 131.759 36.144 345.144 168.149 144.613C751.171 125.508 707.17-93.823 826.603 41.15c95.546 107.978 104.766 294.048 97.432 373.585L685.481 297.694l16.974 360.474-448.13-141.46Z"
            fill="url(#blockchain-gradient-right)"
            fillOpacity=".4"
          />
          <defs>
            <linearGradient id="blockchain-gradient-right" x1="926.392" x2="-109.635" y1=".176" y2="321.024" gradientUnits="userSpaceOnUse">
              <stop stopColor="#776FFF" />
              <stop offset={1} stopColor="#FF4694" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="relative mx-auto max-w-7xl py-24 sm:py-32 lg:px-8 lg:py-40">
        <div className="pl-6 pr-6 md:mr-auto md:w-2/3 md:pr-16 lg:w-1/2 lg:pr-24 lg:pl-0 xl:pr-32">
          <h2 className="text-base/7 font-semibold text-indigo-400">{subtitle}</h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">{title}</p>
          <p className="mt-6 text-base/7 text-gray-300">{description}</p>
          <div className="mt-8">
            <button
              onClick={onButtonClick}
              className="inline-flex rounded-md bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white cursor-pointer"
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Education() {
  const [isClickedPDF, setIsClickedPDF] = useState(false);
  const [isClickedAIPDF, setIsClickedAIPDF] = useState(false);
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

  const handleClickAIPDF = () => {
    setIsClickedAIPDF(true);
    window.dispatchEvent(navbarToggleEvent);
  };

  const handleCloseAIPDF = () => {
    setIsClickedAIPDF(false);
    window.dispatchEvent(navbarToggleEvent);
  };

  const handleClickPromptEngineering = () => {
    window.open('https://www.youtube.com/playlist?list=PL0ptoOsWb_eu-OEI1zS8LVopKrtp-mMRr', '_blank');
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
                At DoDAO, we empower learners with hands-on blockchain courses (NFTs, DeFi, Layer 2) and an immersive AI Agent Bootcamp—covering LLM
                fundamentals, prompt engineering, and real-world agent deployment—so your team masters both decentralized tech and intelligent automation.
              </p>
            </div>

            {/* Hero-style cards for AI Agent Bootcamp and Blockchain Courses */}
            <div className="mt-6">
              <HeroEducationCardImageLeft
                title="AI Agent Bootcamp"
                subtitle="Advanced AI Training"
                description="DoDAO’s AI Agent Bootcamp guides you through building intelligent automation—from LLM fundamentals and prompt engineering to designing agent workflows and live deployment. With hands-on labs, real-world case studies in finance and support sessions, you’ll learn to automate tasks, boost productivity, and stay ahead."
                imageSrc={aiAgent}
                imageAlt="AI Agent Bootcamp"
                buttonText="View Bootcamp Details"
                onButtonClick={handleClickAIPDF}
              />

              <HeroEducationCardImageRight
                title="Blockchain Courses"
                subtitle="Comprehensive Blockchain Education"
                description="Unlock the potential of blockchain technology with our comprehensive courses. We have created a curriculum that dives deep into the world of NFTs, DeFi, Layer 2 solutions, and more, providing essential knowledge and practical skills that will set you apart in this rapidly evolving industry."
                imageSrc={educationCrypto}
                imageAlt="Blockchain Courses"
                buttonText="Explore Course Curriculum"
                onButtonClick={handleClickPDF}
              />
            </div>

            {/* Grid layout for other education items */}
            <div className="mx-auto max-w-7xl py-8 sm:px-2 sm:py-16 lg:px-4">
              <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 px-4 lg:max-w-none lg:grid-cols-2">
                {otherEducation.map((item) => (
                  <div key={item.name} className="text-center sm:flex sm:text-left lg:block lg:text-center">
                    <div className="sm:flex-shrink-0">
                      <div className="flow-root">
                        <Image alt={item.imageAlt} src={item.imageSrc} className="mx-auto h-40" width={220} height={150} />
                      </div>
                    </div>
                    <div className="mt-3 sm:ml-3 sm:mt-0 lg:ml-0 lg:mt-3">
                      <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
                      <p className="mt-2 text-base text-gray-500">{item.description}</p>
                      {item.name === 'Prompt Engineering Guide' && (
                        <p onClick={handleClickPromptEngineering} className="mt-2 text-base font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer">
                          Watch Video Tutorials →
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

        {isClickedAIPDF && (
          <PDFViewModal
            onClose={handleCloseAIPDF}
            title="AI Agent Bootcamp"
            pdfUrl="https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com/dodao-io/Koala_AI_Agent_bootcamp.pdf"
          />
        )}
        {isClickedPDF && (
          <PDFViewModal
            onClose={handleClosePDF}
            title="Blockchain Bootcamp"
            pdfUrl="https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com/dodao-io/bootcamp_pdf.pdf"
          />
        )}
        {isClickedUni && <IframeViewModal onClose={handleCloseUni} title="Uniswap Educational Website" src="https://uniswap.university/" />}
        {isClickedArbi && <IframeViewModal onClose={handleCloseArbi} title="Arbitrum Educational Website" src="https://arbitrum.education/" />}
      </Container>
    </section>
  );
}
