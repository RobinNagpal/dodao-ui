import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import BlockchainDevelopmentTool from '@/images/DoDAOHomePage/blockchainDevelopmentTool.jpg';
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
        <div className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto grid max-w-2xl grid-cols-1 items-start gap-x-8 gap-y-16 sm:gap-y-24 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div className="lg:pr-4">
                <div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
                  <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
                    <Image src={BlockchainDevelopmentTool} alt="" className="aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover" />
                  </div>
                </div>
              </div>
              <div>
                <div className="text-base leading-7 text-gray-700 lg:max-w-lg">
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Blockchain Development Tooling</h1>
                  <div className="max-w-xl">
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                      Optimize your blockchain development with our suite of intuitive tools. Our advanced tooling simplifies the complexity of smart contracts
                      by decoding call data into human-readable text, ensuring clarity and precision. Features include comprehensive reporting of contract
                      changes with clear before-and-after values and separate tracking of cross-chain modifications for easy analysis.
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                      Further, our tools streamline proposal assessments by automatically identifying and linking to all contracts involved. We enhance team
                      collaboration with integrated notifications that summarize key report insights directly in Discord. Plus, our robust checks for asset
                      management, from additions to updates, provide an extra layer of verification for your peace of mind.
                    </p>
                    <p className="mt-6 text-lg leading-8 text-gray-600">
                      Leverage DoDAO's development tools to bring efficiency and transparency to your blockchain projects.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
