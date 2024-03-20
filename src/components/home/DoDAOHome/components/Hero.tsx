import { WatchVideoButton } from '@/components/home/common/WatchVideoButton';
import ContactUsLink from '@/components/home/DoDAOHome/components/ContactUsLink';
import Image from 'next/image';
import AAVE from '@/images/DAO/AAVE.png';
import Balancer from '@/images/DAO/Balancer.png';
import Compound from '@/images/DAO/Compound.png';
import Harmony from '@/images/DAO/Harmony.png';
import Near from '@/images/DAO/Near.png';
import Uniswap from '@/images/DAO/Uniswap.png';
import Optimism from '@/images/DAO/Optimism.png';
import Arbitrum from '@/images/DAO/Arbitrum.png';

export function Hero() {
  return (
    <div className="pb-16 pt-20 text-center lg:pt-32 w-full">
      <h1 className="mx-auto max-w-4xl font-display text-5xl font-medium tracking-tight text-slate-900 sm:text-7xl">
        Empower Your Customers with{' '}
        <span className="relative whitespace-nowrap text-blue-600">
          <svg aria-hidden="true" viewBox="0 0 418 42" className="absolute left-0 top-2/3 h-[0.58em] w-full fill-blue-300/70" preserveAspectRatio="none">
            <path d="M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z" />
          </svg>
          <span className="relative">DoDAO:</span>
        </span>{' '}
        The Ultimate Customer Education Platform
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg tracking-tight text-slate-700">
        Elevate Customer Satisfaction and Streamline Support Costs through an All-Inclusive Knowledge Hub.
      </p>
      <div className="mt-10 flex justify-center gap-x-6">
        <WatchVideoButton src={'https://dodao-prod-public-assets.s3.us-east-1.amazonaws.com/dodao-io/DoDAO.mp4'} />
      </div>
      <div>
        <ContactUsLink />
      </div>

      <div className="relative isolate mt-32 sm:mt-48">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="text-center text-lg font-semibold leading-8">Trusted by the top blockchain companies</h2>
          <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-6">
            <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={Near} alt="Near" width={130} height={130} />
            <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={Balancer} alt="Balancer" width={150} height={150} />
            <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={Harmony} alt="Harmony" width={150} height={150} />
            <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={Compound} alt="Compound" width={150} height={150} />
            <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={AAVE} alt="AAVE" width={150} height={150} />
            <Image className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1" src={Uniswap} alt="Uniswap" width={150} height={150} />
            <Image
              className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1 lg:col-start-3"
              src={Arbitrum}
              alt="Arbitrum"
              width={200}
              height={200}
            />
            <Image
              className="col-span-2 col-start-2 object-contain sm:col-start-auto lg:col-span-1 lg:col-start-4"
              src={Optimism}
              alt="Optimism"
              width={200}
              height={200}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
