import SearchBar from '@/components/core/SearchBar';
import NewFeaturePill from '@/components/home-page/NewFeaturePill';
import TopIndustriesShowcase from '@/components/home-page/TopIndustriesShowcase';
import CountryAlternatives from '@/components/stocks/CountryAlternatives';
import coverImage from '@/images/koala.png';
import { IndustryWithTopTickers } from '@/types/api/ticker-industries';
import Image from 'next/image';
import Link from 'next/link';

export interface HeroProps {
  industries: IndustryWithTopTickers[];
}

export function Hero({ industries }: HeroProps = { industries: [] }) {
  return (
    <section className="overflow-hidden bg-surface">
      <div>
        <div className="w-full mx-auto max-w-7xl sm:px-2 lg:px-8 px-6 relative isolate pt-2 lg:pt-2">
          <div className="py-2 sm:py-4 lg:py-8">
            {/* New-feature pill: links straight to the ETF reports page */}
            <div className="flex justify-center mb-4">
              <NewFeaturePill label="New: ETF Reports" href="/etfs" />
            </div>

            {/* Stock Search Section */}
            <div className="mb-8 sm:mb-8">
              <div className="mb-2 sm:mb-4 flex w-full justify-center">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 shrink-0">
                    <Image src={coverImage} alt="KoalaGains AI-powered platform" fill className="object-contain rounded-xl" priority />
                  </div>

                  <div className="text-left">
                    <h2 className="text-2xl sm:text-3xl font-semibold text-heading leading-tight">
                      Search <span className="text-primary">5000+ Stock &amp; ETF Analysis Reports</span>
                    </h2>
                    <p className="text-body text-sm sm:text-base lg:text-lg mt-1 max-w-2xl">
                      Get instant access to investment analysis for your favorite stocks &amp; ETFs
                    </p>
                  </div>
                </div>
              </div>

              {/* Search bar — searches stocks and ETFs together */}
              <SearchBar placeholder="Search stocks & ETFs by name or symbol" variant="hero" kind="combined" />
              <div className="flex justify-center">
                <Link
                  href="/stocks"
                  aria-label="Browse all stock reports"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3
                               text-sm sm:text-base font-semibold text-heading
                               bg-gradient-to-r from-amber-500 to-amber-400
                               hover:from-amber-400 hover:to-amber-500
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                               focus-visible:ring-offset-2 focus-visible:ring-offset-gray-800
                               shadow-md hover:shadow-lg transition-all"
                >
                  Browse all US stock reports <span aria-hidden>→</span>
                </Link>
              </div>
              <div className="flex justify-center mt-4">
                <CountryAlternatives currentCountry="US" className="justify-center text-md" enhanced={true} centerContent={true} />
              </div>
            </div>

            {/* Top Industries Showcase */}
            <TopIndustriesShowcase industries={industries} />
          </div>
        </div>
      </div>
    </section>
  );
}
