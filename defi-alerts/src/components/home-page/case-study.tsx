// defi-alerts/src/components/home-page/case-study.tsx
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const CaseStudy = () => {
  return (
    /* bg-muted/50 → muted with 50 % opacity */
    <section id="case-study" className="py-24 bg-[hsl(240_4.8%_95.9%/0.5)]">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold">Case Study Teaser</h2>
          <p className="mb-8 text-xl">See how we drove 99.9 % uptime for Compound Alerts.</p>

          {/* Button component keeps its own internal styling;
              only the parent section’s token classes were removed */}
          <Button size="lg" asChild>
            <Link href="#">
              View Case Study
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CaseStudy;
