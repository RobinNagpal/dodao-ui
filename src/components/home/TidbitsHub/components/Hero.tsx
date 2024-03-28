import { WatchVideoButton } from './../../common/WatchVideoButton';
import { Container } from './Container';
import Image from 'next/image';
import tidbits from '@/images/TidbitsHub/GIFs/tidbits.gif';

export function Hero() {
  return (
    <div className="overflow-hidden py-20 sm:py-12 lg:pb-32 xl:pb-36">
      <Container>
        <div className="md:flex lg:gap-x-8 lg:gap-y-20 md:space-y-0 space-y-10">
          <div className="flex-1 relative z-10 mx-auto max-w-2xl lg:max-w-none lg:pt-16">
            <div className="md:max-w-[75%] w-full">
              <h1 className="text-4xl font-medium tracking-tight">
                Breaking Down Complex Concepts:
                <br />
                The Tidbits Method
              </h1>
              <p className="mt-6 text-lg">
                We break down concepts into easily digestible information, guiding your customers to make empowered decisions. Equip your clients with knowledge
                and watch their trust in your services grow!
              </p>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
                <WatchVideoButton src={'https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com/tidbithub/Tidbits_Hub-Banks.mp4'} />
              </div>
            </div>
          </div>
          <div className="relative w-fit m-auto lg:row-span-2 md:block flex justify-center">
            <Image src={tidbits} alt="Product screenshot" className="w-full max-h-[80vh] object-contain rounded-xl shadow-xl ring-1 ring-gray-400/10" />
          </div>
        </div>
      </Container>
    </div>
  );
}
