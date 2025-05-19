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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-[#f1f1f3]">Stay Ahead of Every DeFi Move</h1>
            <p className="text-xl md:text-2xl text-[#f1f1f3] mb-8">Custom alerts on supply/borrow rates, on any chain.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="#architecture"
                className="bg-[#00AD79] hover:bg-[#00AD79]/90 text-white py-3 px-6 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center"
              >
                Learn How We Built It
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#case-study"
                className="bg-transparent hover:bg-[#f1f1f3]/10 text-[#f1f1f3] border border-[#f1f1f3] py-3 px-6 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center"
              >
                View Case Study
              </Link>
            </div>
          </div>

          <div className="relative aspect-video rounded-lg overflow-hidden border border-[#d1d5da] shadow-xl">
            {/* Placeholder for Compound integration demo GIF */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#1e202d]">
              <p className="text-[#f1f1f3] text-sm">
                {/* GIF: Compound integration demo */}
                {/* Replace this with the actual GIF when available */}
                <img src="/placeholder.svg?height=400&width=600" alt="Compound integration demo" className="w-full h-full object-cover" />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
