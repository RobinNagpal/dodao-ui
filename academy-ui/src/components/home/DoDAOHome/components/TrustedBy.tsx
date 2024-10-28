import Image from 'next/image';
import AAVE from '@/images/DAO/AAVE.png';
import Balancer from '@/images/DAO/Balancer.png';
import Compound from '@/images/DAO/Compound.png';
import Harmony from '@/images/DAO/Harmony.png';
import Near from '@/images/DAO/Near.png';
import Uniswap from '@/images/DAO/Uniswap.png';
import Optimism from '@/images/DAO/Optimism.png';
import Arbitrum from '@/images/DAO/Arbitrum.png';

export function TrustedBy() {
  return (
    <div className="relative isolate mt-20 sm:mt-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-lg font-semibold leading-8">Trusted by the top blockchain companies</h2>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-6">
          <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={Near} alt="Near" width={130} height={130} />
          <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={Balancer} alt="Balancer" width={150} height={150} />
          <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={Harmony} alt="Harmony" width={150} height={150} />
          <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={Compound} alt="Compound" width={150} height={150} />
          <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={AAVE} alt="AAVE" width={130} height={150} />
          <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={Uniswap} alt="Uniswap" width={150} height={150} />
          <Image
            className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1 lg:col-start-3"
            src={Arbitrum}
            alt="Arbitrum"
            width={200}
            height={150}
          />
          <Image
            className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1 lg:col-start-4"
            src={Optimism}
            alt="Optimism"
            width={150}
            height={150}
          />
        </div>
      </div>
    </div>
  );
}
