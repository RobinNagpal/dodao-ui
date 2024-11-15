import alchemix from '@/images/TidbitsHub/GIFs/tidbits-hub.gif';
import { SpaceWithIntegrationsDto } from '@/types/space/SpaceDto';
import Image from 'next/image';
import { SetupNewSpaceButton } from '../../common/setupNewSpace';
import ContactUsLink from '../../DoDAOHome/components/ContactUsLink';
import { WatchVideoButton } from './../../common/WatchVideoButton';

export function Hero({ space }: { space: SpaceWithIntegrationsDto | null }) {
  return (
    <div className="bg-white">
      <div className="relative isolate">
        <div aria-hidden="true" className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          />
        </div>
        <div className="py-20 sm:py-28 lg:pb-32">
          <div className="mx-auto w-full sm:max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <div className="text-balance text-2xl tracking-tight text-gray-900 sm:text-3xl mb-4">Breaking Down Complex Concepts:</div>
              <h1 className="text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-6xl">The Tidbits Method</h1>
              <p className="mt-4 md:mt-8 text-pretty text-md font-medium text-gray-500 sm:text-xl/8">
                With TidbitsHub, reduce your customers’ learning time from hours to minutes. Help your customers learn quickly with bite-sized content,
                interactive clickable demos, and short videos.
              </p>
              <div className="my-2">
                <WatchVideoButton src="https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com/tidbithub/Updated_Tidbits_Hub-Crypto.mp4" />
              </div>
              <div className="mt-2 flex items-center justify-center gap-x-6">
                <SetupNewSpaceButton space={space!} />
                <ContactUsLink />
              </div>
            </div>
            <div className="mt-16 flow-root sm:mt-24">
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                <Image src={alchemix} alt="TidbitsHub Demo" className="rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10" />
              </div>
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
          />
        </div>
      </div>
    </div>
  );
}
