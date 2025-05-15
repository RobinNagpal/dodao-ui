import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const CaseStudy = () => {
  return (
    <section id="case-study" className="py-24 bg-[#1e202d]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6 text-[#f1f1f3]">Case Study Teaser</h2>
          <p className="text-xl mb-8 text-[#f1f1f3]">See how we drove 99.9% uptime for Compound Alerts.</p>
          <Link
            href="#"
            className="bg-[#00AD79] hover:bg-[#00AD79]/90 text-white py-3 px-6 rounded-md text-base font-medium transition-colors inline-flex items-center justify-center"
          >
            View Case Study
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CaseStudy;
