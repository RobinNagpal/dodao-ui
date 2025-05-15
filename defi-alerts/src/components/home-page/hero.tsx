// defi-alerts/src/components/home-page/hero.tsx
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FG_MUTED = 'hsl(240_3.8%_46.1%)';
const BG_MUTED = 'hsl(240_4.8%_95.9%)';

const Hero = () => (
  <section className="relative overflow-hidden py-20 md:py-32">
    {/* simple light gradient kept as-is */}
    <div className="absolute inset-0 -z-10 bg-gradient-to-br from-purple-50 to-teal-50" />

    <div className="container mx-auto px-4">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="max-w-2xl">
          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">Stay Ahead of Every DeFi Move</h1>
          <p className={`mb-8 text-xl md:text-2xl text-[${FG_MUTED}]`}>Custom alerts on supply / borrow rates, on any chain.</p>

          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="#architecture">
                Learn How We Built It <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button size="lg" variant="outline" asChild>
              <Link href="#case-study">View Case Study</Link>
            </Button>
          </div>
        </div>

        {/* Placeholder video / GIF */}
        <div className="relative overflow-hidden aspect-video rounded-lg border shadow-xl">
          <div className={`absolute inset-0 flex items-center justify-center bg-[${BG_MUTED}]`}>
            <img src="/placeholder.svg?height=400&width=600" alt="Compound integration demo" className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
