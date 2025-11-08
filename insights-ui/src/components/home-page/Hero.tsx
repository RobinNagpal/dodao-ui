import SearchBar from '@/components/core/SearchBar';
import TopIndustriesShowcase, { IndustryWithTopTickers } from '@/components/home-page/TopIndustriesShowcase';
import coverImage from '@/images/koala.png';
import Image from 'next/image';
import Link from 'next/link';

export interface HeroProps {
  industries: IndustryWithTopTickers[];
}
export function Hero({ industries }: HeroProps = { industries: [] }) {
  return (
    <section className="overflow-hidden bg-gray-800">
      <div>
        <div className="w-full mx-auto max-w-7xl sm:px-2 lg:px-8 px-6 relative isolate pt-2 lg:pt-2">
          <div className="py-2 sm:py-4 lg:py-8">
            <div className="text-center">
              {/* Logo */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                  <Image src={coverImage} alt="KoalaGains AI-powered platform" fill className="object-contain rounded-xl" priority />
                </div>
              </div>

              {/* Stock Search Section */}
              <div className="mb-8 sm:mb-10">
                <div className="mb-2 sm:mb-4">
                  <h2 className="text-2xl font-semibold text-white mb-2 sm:mb-3">
                    Search Our <span className="text-indigo-400">5000+ Stock Analysis Reports</span>
                  </h2>
                  <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto">
                    Get instant access to detailed investment analysis for your favorite stocks
                  </p>
                </div>

                {/* Keep search bar colors, but make it taller and add amber border */}
                <SearchBar placeholder="Search by company name or stock symbol" variant="hero" />
                <div className="flex justify-center">
                  <Link
                    href="/stocks"
                    aria-label="Browse all stock reports"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3
                               text-sm sm:text-base font-semibold text-gray-900
                               bg-gradient-to-r from-[#F59E0B] to-[#FBBF24]
                               hover:from-[#FBBF24] hover:to-[#F59E0B]
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                               focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800
                               shadow-md hover:shadow-lg transition-all"
                  >
                    Browse all stock reports <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>

              {/* Top Industries Showcase */}
              <TopIndustriesShowcase industries={industries} />
            </div>
          </div>
        </div>
        <div className="mt-12 sm:mt-16 border-b border-gray-600"></div>
      </div>
    </section>
  );
}
