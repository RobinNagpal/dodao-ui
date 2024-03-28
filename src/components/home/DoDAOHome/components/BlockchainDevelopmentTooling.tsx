import { Container } from './Container';
import { SectionHeading } from './SectionHeading';
import BlockchainDevelopmentTool from '@/images/DoDAOHomePage/blockchainDevelopmentTooling.png';
import Image from 'next/image';

export function BlockchainDevelopmentTooling() {
  return (
    <section
      id="blockchain-development-tooling"
      aria-labelledby="blockchain-development-tooling-title"
      className="scroll-mt-14 pb-8 pt-16 sm:scroll-mt-32 sm:pb-10 sm:pt-20 lg:pb-16 lg:pt-16"
    >
      <Container size="lg">
        <SectionHeading number="4" id="blockchain-development-tooling-title">
          Blockchain-Development-Tooling
        </SectionHeading>
        <div className="relative mt-8">
          <div className="mx-auto max-w-7xl lg:flex lg:justify-between lg:px-8 xl:justify-end">
            <div className="lg:flex lg:w-1/2 lg:shrink lg:grow-0 xl:absolute xl:inset-y-0 xl:right-1/2 xl:w-1/2">
              <div className="relative h-80 lg:-ml-8 lg:h-auto lg:w-full lg:grow xl:ml-0">
                <Image
                  className="absolute inset-0 mt-6 h-full w-full rounded-2xl object-cover"
                  src={BlockchainDevelopmentTool}
                  alt="Blockchain Development Tooling"
                />
              </div>
            </div>
            <div className="px-6 lg:contents">
              <div className="mx-auto max-w-2xl pb-24 pt-16 sm:pb-32 sm:pt-20 lg:ml-8 lg:mr-0 lg:w-full lg:max-w-lg lg:flex-none lg:pt-16 xl:w-1/2">
                <h1 className="text-3xl font-bold sm:text-4xl">Blockchain Development</h1>
                <p className="mt-6 text-lg leading-8">
                  With over five years of experience in blockchain development, we specialize in collaborating with strategic projects to speed up their growth.
                  Our focus is on crafting custom blockchain solutions designed specifically for your business requirements. By adopting a flexible approach, we
                  prioritize understanding your needs to develop innovative solutions that streamline your business operations and drive success.
                </p>
                <div className="mt-6 text-lg leading-8">
                  <p>
                    We excel in creating blockchain applications from scratch and can even improve enhancing current products. By incorporating blockchain
                    solutions along with customized UI features, you gain the capacity to swiftly expand your business, adjust to market shifts, and surpass
                    competitors.
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
