import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1e202d]/20 to-[#1e202d]/10 -z-10" />

      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#f1f1f3]">Optimize Every DeFi Position</h1>
            <p className="text-xl md:text-2xl text-[#f1f1f3] mb-8">
              Proactive alerts for higher yields, rewards, and inefficient positions across any chain or protocol.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#features"
                className="bg-[#00AD79] hover:bg-[#00AD79]/90 text-white py-3 px-6 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center"
              >
                Explore Features
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#why-alerts"
                className="bg-transparent hover:bg-[#f1f1f3]/10 text-[#f1f1f3] border border-[#f1f1f3] py-3 px-6 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center"
              >
                Why DeFi Alerts
              </Link>
            </div>
          </div>

          <div className="relative aspect-video rounded-lg overflow-hidden border border-[#d1d5da] shadow-xl">
            <div className="absolute inset-0 flex items-center justify-center bg-[#1e202d]">
              <div className="text-[#f1f1f3] p-6 w-full">
                <h3 className="text-xl font-semibold mb-4 text-[#00AD79]">What We Monitor</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>All major blockchains (Ethereum, Polygon, Base, and more)</li>
                  <li>Lending platforms (Compound, Aave, Spark, Morpho)</li>
                  <li>Yield farming, staking, and liquidity pools</li>
                  <li>Decentralized exchanges (DEXs), AMMs, and other DeFi protocols</li>
                </ul>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2 text-[#00AD79]">For Everyone</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-[#0D131A] p-2 rounded">✓ DeFi beginners</div>
                    <div className="bg-[#0D131A] p-2 rounded">✓ Experienced traders</div>
                    <div className="bg-[#0D131A] p-2 rounded">✓ Investment funds</div>
                    <div className="bg-[#0D131A] p-2 rounded">✓ Developers & teams</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
