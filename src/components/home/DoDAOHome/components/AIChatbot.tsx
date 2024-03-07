import Image from 'next/image';

import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import aichatbot from '@/images/DoDAOHomePage/aichatbot.webp';
export function AIChatbot() {
  return (
    <section id="ai-chatbot" aria-labelledby="ai-chatbot-title" className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32">
      <Container size="lg">
        <SectionHeading number="3" id="ai-chatbot-title">
          AI Chatbot
        </SectionHeading>
        <div className="mt-32 overflow-hidden">
          <div className="mx-auto max-w-7xl lg:flex">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8">
              <div className="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">AI Chatbot</h2>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Enter a new dimension of support with our AI Chatbot, designed to be your customers&apos; personal learning assistant. Ready to respond 24/7,
                  this intelligent tool simplifies complicated subjects, providing immediate, accessible answers. For every question, our AI Chatbot stands by
                  to enhance your customers&apos; understanding, ensuring a continuous and effortless educational experience.
                </p>
              </div>
              <div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
                <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
                  <Image src={aichatbot} alt="" className="aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
