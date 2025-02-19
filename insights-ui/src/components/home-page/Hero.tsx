import { Button } from '@/components/home-page/Button';
import { GridPattern } from '@/components/home-page/GridPattern';
import { StarRating } from '@/components/home-page/StarRating';
import coverImage from '@/images/cover.png';
import clsx from 'clsx';
import Image from 'next/image';

function Testimonial() {
  return (
    <figure className="relative mx-auto max-w-md text-center lg:mx-0 lg:text-left">
      <div className="flex justify-center text-indigo-400 lg:justify-start">
        <StarRating />
      </div>
      <blockquote className="mt-2">
        <p className="font-display text-xl font-medium text-white">“This method of designing icons is genius. I wish I had known this method a lot sooner.”</p>
      </blockquote>
      <figcaption className="mt-2 text-sm text-gray-400">
        <strong className="font-semibold text-indigo-400 before:content-['—_']">Stacey Solomon</strong>, Founder at Retail Park
      </figcaption>
    </figure>
  );
}

export function Hero() {
  return (
    <header className="overflow-hidden bg-gray-800 lg:px-5">
      <div className="mx-auto grid max-w-6xl grid-cols-1 grid-rows-[auto_1fr] gap-y-16 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-y-20 lg:px-3 lg:pt-20 lg:pb-36 xl:py-32">
        {/* Image + Pattern */}
        <div className="relative flex items-end lg:col-span-5 lg:row-span-2">
          <div className="absolute -top-20 right-1/2 -bottom-12 left-0 z-10 rounded-br-6xl bg-indigo-600 text-white/10 md:bottom-8 lg:-inset-y-32 lg:right-full lg:left-[-100vw] lg:-mr-40">
            <GridPattern x="100%" y="100%" patternTransform="translate(112 64)" />
          </div>
          <div className="relative z-10 mx-auto flex w-64 rounded-xl bg-white/5 shadow-xl md:w-80 lg:w-auto">
            <Image className="w-full" src={coverImage} alt="" priority />
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative px-4 sm:px-6 lg:col-span-7 lg:pr-0 lg:pb-14 lg:pl-16 xl:pl-20">
          {/* Optional hidden overlay background to preserve layout structure */}
          <div className="hidden lg:absolute lg:-top-32 lg:right-[-100vw] lg:bottom-0 lg:left-[-100vw] lg:block lg:bg-gray-800" />
          <Testimonial />
        </div>

        {/* Hero text and CTA */}
        <div className="pt-16 lg:col-span-7 lg:pt-0 lg:pl-16 xl:pl-20">
          <div className="mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0">
            <h1 className="font-display text-5xl font-extrabold text-white sm:text-6xl">Get lost in the world of icon design.</h1>
            <p className="mt-4 text-3xl text-gray-400">A book and video course that teaches you how to design your own icons from scratch.</p>
            <div className="mt-8 flex gap-4">
              <Button href="#free-chapters" className={clsx('hidden sm:inline-block', 'text-white', 'bg-indigo-600 p-2')} variant="outline">
                Get sample chapter
              </Button>
              <Button href="#pricing" variant="outline" className={clsx('hidden sm:inline-block', 'text-white p-2')}>
                Buy book
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
