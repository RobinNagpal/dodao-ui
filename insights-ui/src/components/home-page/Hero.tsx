import { StarRating } from '@/components/home-page/StarRating';
import coverImage from '@/images/koala.png';
import Image from 'next/image';
import Link from 'next/link';

function Testimonial() {
  return (
    <figure className="relative mx-auto max-w-md text-center lg:mx-0 lg:text-left">
      <div className="flex justify-center text-indigo-400 lg:justify-start">
        <StarRating />
      </div>
      <blockquote className="mt-2">
        <p className="font-display text-xl font-medium text-white">
          “All intelligent investing is value investing — acquiring more that you are paying for. You must value the business in order to value the stock.”
        </p>
      </blockquote>
      <figcaption className="mt-2 text-sm text-gray-400">
        <strong className="font-semibold text-indigo-400 before:content-['—_']">Charlie Munger</strong>
      </figcaption>
    </figure>
  );
}
export function Hero() {
  return (
    <header className="overflow-hidden bg-gray-800 lg:px-5">
      <div className="mx-auto grid max-w-6xl grid-cols-1 grid-rows-[auto_1fr] gap-y-16 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-y-20 lg:px-3 lg:pt-20 lg:pb-36 xl:py-32">
        {/* Hero Image + Background Pattern */}
        <div className="relative flex items-end lg:col-span-5 lg:row-span-2">
          <div className="relative z-10 mx-auto flex w-64 rounded-xl shadow-xl md:w-80 lg:w-auto">
            <Image src={coverImage} alt="Hero image representing KoalaGains." priority />
          </div>
        </div>

        {/* Testimonial on the right */}
        <div className="relative px-4 sm:px-6 lg:col-span-7 lg:pr-0 lg:pb-14 lg:pl-16 xl:pl-20">
          <Testimonial />
        </div>

        {/* Main Hero Text and CTA */}
        <div className="pt-16 lg:col-span-7 lg:pt-0 lg:pl-16 xl:pl-20">
          <div className="mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0">
            <h1 className="font-display text-4xl font-extrabold text-white sm:text-3xl">Value Investing with Deeper AI Created Insights</h1>
            <p className="mt-4 text-xl text-gray-400">Powerful AI insights and deep data extraction to unlock new opportunities. All in one place.</p>
            <div className="mt-8 flex gap-4">
              <Link
                href="/custom-reports"
                className="inline-flex items-center rounded-md bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-500"
              >
                See Our Reports
              </Link>
              <a
                href="#contact"
                className="inline-flex items-center rounded-md border border-indigo-600 px-5 py-3 text-sm font-medium text-indigo-300 hover:text-white hover:bg-indigo-600"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
