import { WatchVideoButton } from './../../common/WatchVideoButton';
import { Container } from './Container';
import Image from 'next/image';
import tidbits from '@/images/TidbitsHub/GIFs/tidbits.gif';
import ContactUsLink from '../../DoDAOHome/components/ContactUsLink';
import { SetupNewSpaceButton } from '../../common/setupNewSpace';
import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

export function Hero({ space }: { space: SpaceWithIntegrationsFragment | null }) {
  return (
    <div className="overflow-hidden py-20 sm:py-12 lg:pb-32 xl:pb-36">
      <Container>
        <div className="lg:flex lg:gap-x-8 lg:gap-y-20 md:space-y-0 space-y-10">
          <div className="flex-1 relative z-10 mx-auto max-w-2xl lg:max-w-none lg:pt-16">
            <div className="md:max-w-[75%] w-full">
              <h1 className="text-4xl font-medium tracking-tight xl:text-5xl ">
                Breaking Down Complex Concepts:
                <br />
                The Tidbits Method
              </h1>
              <p className="mt-6 text-md xl:text-lg">
                Turn complex concepts into easy-to-understand information. With Tidbits Hub, reduce your customers’ learning time from hours to minutes. Help
                your customers learn quickly with bite-sized content, interactive clickable demos, and short videos. <br></br>
                <br></br>
                <span className="font-bold">Setup New Space</span> to create your own tidbits{' '}
                <span className="ml-2">
                  <SetupNewSpaceButton space={space!} />
                </span>
              </p>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-6">
                <div>
                  <WatchVideoButton src={'https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com/tidbithub/Updated_Tidbits_Hub-Crypto.mp4'} />
                </div>
                <div className="-mt-2">
                  <ContactUsLink />
                </div>
              </div>
            </div>
          </div>
          <div className="relative w-fit m-auto lg:row-span-2 md:block flex justify-center">
            <Image src={tidbits} alt="Tidbits Hub screenshot" className="w-full max-h-[80vh] object-contain rounded-xl shadow-xl ring-1 ring-gray-400/10" />
          </div>
        </div>
      </Container>
    </div>
  );
}
