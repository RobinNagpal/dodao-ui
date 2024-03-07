import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import BlockchainDevelopmentTool from '@/images/DoDAOHomePage/blockchainDevelopmentTooling.jpg';
import Image from 'next/image';

export function BlockchainDevelopmentTooling() {
  return (
    <section
      id="blockchain-development-tooling"
      aria-labelledby="blockchain-development-tooling-title"
      className="scroll-mt-14 pb-8 pt-16 sm:scroll-mt-32 sm:pb-10 sm:pt-20 lg:pb-16 lg:pt-32"
    >
      <Container size="lg">
        <SectionHeading number="4" id="blockchain-development-tooling-title">
          Blockchain-Development-Tooling
        </SectionHeading>
        <div className="relative bg-white">
          <div className="mx-auto max-w-7xl lg:flex lg:justify-between lg:px-8 xl:justify-end">
            <div className="lg:flex lg:w-1/2 lg:shrink lg:grow-0 xl:absolute xl:inset-y-0 xl:right-1/2 xl:w-1/2">
              <div className="relative h-80 lg:-ml-8 lg:h-auto lg:w-full lg:grow xl:ml-0">
                <Image className="absolute inset-0 mt-6 h-full w-full rounded-2xl bg-gray-50 object-cover" src={BlockchainDevelopmentTool} alt="" />
              </div>
            </div>
            <div className="px-6 lg:contents">
              <div className="mx-auto max-w-2xl pb-24 pt-16 sm:pb-32 sm:pt-20 lg:ml-8 lg:mr-0 lg:w-full lg:max-w-lg lg:flex-none lg:pt-32 xl:w-1/2">
                <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Blockchain Development Tooling</h1>
                <p className="mt-6 text-lg leading-8 text-gray-600">
                  Optimize your blockchain development with our suite of intuitive tools. Our advanced tooling simplifies the complexity of smart contracts by
                  decoding call data into human-readable text, ensuring clarity and precision. Features include comprehensive reporting of contract changes with
                  clear before-and-after values and separate tracking of cross-chain modifications for easy analysis.
                </p>
                <div className="mt-6 text-lg leading-8 text-gray-600">
                  <p>
                    Further, our tools streamline proposal assessments by automatically identifying and linking to all contracts involved. We enhance team
                    collaboration with integrated notifications that summarize key report insights directly in Discord. Plus, our robust checks for asset
                    management, from additions to updates, provide an extra layer of verification for your peace of mind.
                  </p>

                  <p className="mt-6 text-lg leading-8 text-gray-600">
                    Leverage DoDAO&apos;s development tools to bring efficiency and transparency to your blockchain projects.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
