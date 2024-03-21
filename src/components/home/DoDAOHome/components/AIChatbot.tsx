import Image from 'next/image';

import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import aichatbot from '@/images/DoDAOHomePage/aichatbot.png';
export function AIChatbot() {
  return (
    <section id="ai-chatbot" aria-labelledby="ai-chatbot-title" className="scroll-mt-14 py-4 sm:scroll-mt-32 sm:py-20 lg:py-16">
      <Container size="lg">
        <SectionHeading number="3" id="ai-chatbot-title">
          AI Chatbot
        </SectionHeading>
        <div className="mt-16 overflow-hidden">
          <div className="mx-auto max-w-7xl lg:flex">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:min-w-full lg:max-w-none lg:flex-none lg:gap-y-8">
              <div className="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">
                <h2 className="text-3xl font-bold tracking-tightsm:text-4xl">AI Chatbot</h2>
                <p className=" mt-6 text-lg leading-8">
                  For blockchain projects, platforms like Discourse and Discord are inundated with new inquiries. Many newcomers hesitate to ask questions,
                  fearing they might appear uninformed. Simultaneously, even long-standing members often struggle to locate specific information.
                </p>
                <p className="mt-4 text-lg leading-8">
                  We have designed an AI chatbot for blockchain projects which can be trained on governance forums and documentation. It can provide accurate
                  information alongwith the links to sources, benefiting both new and experienced users. This AI chatbot is projected to save thousands of hours
                  for community members monthly, showcasing its return on investment (ROI) within just the first month.
                </p>
              </div>
              <div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8">
                <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end mb-9">
                  <Image src={aichatbot} alt="AI ChatBot Image" className="aspect-[7/5] w-[37rem] max-w-none rounded-2xl object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
