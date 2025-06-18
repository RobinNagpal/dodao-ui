'use client';
import Image from 'next/image';
import { useState } from 'react';
import { PDFViewModal } from './PDFViewModal';
import { SectionHeading } from './SectionHeading';
import aiAgent from '@/images/aiAgent.png';

interface HeroTrainingCardProps {
  title: string;
  subtitle: string;
  description: string;
  imageSrc: any;
  imageAlt: string;
  buttonText: string;
  onButtonClick: () => void;
}

function HeroTrainingCardImageLeft({ title, subtitle, description, imageSrc, imageAlt, buttonText, onButtonClick }: HeroTrainingCardProps) {
  return (
    <div className="relative bg-gray-800 min-h-[500px]">
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

export default function AIAgentTraining() {
  const [isClickedAIPDF, setIsClickedAIPDF] = useState(false);

  const handleClickAIPDF = () => {
    setIsClickedAIPDF(true);
  };

  const handleCloseAIPDF = () => {
    setIsClickedAIPDF(false);
  };

  return (
    <section id="agent-training" className="bg-gray-800 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl sm:text-center">
          <div className="mb-6">
            <SectionHeading number="3">Training</SectionHeading>
          </div>
          <h2 className="text-4xl font-semibold text-indigo-400">AI Agent Training</h2>
          <p className="mt-4 text-lg text-gray-300">
            KoalaGains AI Agent Training empowers teams with comprehensive bootcamp programs. From LLM fundamentals to real-world deployment, master intelligent
            automation and stay ahead in the AI revolution.
          </p>
        </div>

        <div className="mt-12">
          <HeroTrainingCardImageLeft
            title="AI Agent Bootcamp"
            subtitle="Advanced AI Training"
            description="DoDAO's AI Agent Bootcamp teaches you end-to-end agent development—from understanding LLMs and crafting effective prompts to designing agent workflows and deploying live solutions. Boost productivity by 10×, future-proof your skills, and apply agents to finance, support, and beyond with hands-on labs and real-world case studies."
            imageSrc={aiAgent}
            imageAlt="AI Agent Bootcamp Training"
            buttonText="View Bootcamp Details"
            onButtonClick={handleClickAIPDF}
          />
        </div>

        {isClickedAIPDF && (
          <PDFViewModal
            onClose={handleCloseAIPDF}
            title="AI Agent Bootcamp"
            pdfUrl="https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com/dodao-io/Koala_AI_Agent_bootcamp.pdf"
          />
        )}
      </div>
    </section>
  );
}
