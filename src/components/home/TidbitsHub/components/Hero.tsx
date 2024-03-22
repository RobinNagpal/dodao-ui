import { WatchVideoButton } from './../../common/WatchVideoButton';
import { Container } from './Container';
import Image from 'next/image';
import tidbits from '@/images/TidbitsHub/GIFs/tidbits.gif';

export function Hero() {
  return (
    <div className="overflow-hidden py-20 sm:py-12 lg:pb-32 xl:pb-36">
      <Container>
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-8 lg:gap-y-20">
          <div className="relative z-10 mx-auto max-w-2xl lg:col-span-7 lg:max-w-none lg:pt-16 xl:col-span-6">
            <h1 className="text-4xl font-medium tracking-tight">Breaking Down Complex Concepts: The Tidbits Method</h1>
            <p className="mt-6 text-lg">
              We break down concepts into easily digestible information, guiding your customers to make empowered decisions. Equip your clients with knowledge
              and watch their trust in your services grow!
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-4">
              <WatchVideoButton src={'https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com/tidbithub/Tidbits_Hub-Banks.mp4'} />
            </div>
          </div>
          <div className="relative mt-10 sm:mt-20 lg:col-span-5 lg:row-span-2 lg:mt-0 xl:col-span-6">
            <Image src={tidbits} alt="Product screenshot" className="w-full rounded-xl shadow-xl ring-1 ring-gray-400/10" />
          </div>
        </div>
      </Container>
    </div>
  );
}
