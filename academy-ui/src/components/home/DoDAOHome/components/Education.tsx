'use client';
import Image from 'next/image';
import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import { useState } from 'react';
import { PDFViewModal } from './PDFViewModal';
import { navbarToggleEvent } from './NavbarToggle';
import aiAgent from '@/images/DoDAOHomePage/aiAgent.png';

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
        <div className="pl-6 pr-6 md:ml-auto md:w-2/3 md:pl-8 lg:w-1/2 lg:pl-12 lg:pr-8 xl:pl-16 xl:pr-12">
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
  const [isClickedAIPDF, setIsClickedAIPDF] = useState(false);

  const handleClickAIPDF = () => {
    setIsClickedAIPDF(true);
    window.dispatchEvent(navbarToggleEvent);
  };

  const handleCloseAIPDF = () => {
    setIsClickedAIPDF(false);
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
                At DoDAO, we empower teams with comprehensive AI Agent training. Our immersive bootcamp covers LLM fundamentals, prompt engineering, and
                real-world agent deployment—so your team masters intelligent automation and stays ahead in the AI revolution.
              </p>
            </div>

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
      </Container>
    </section>
  );
}
