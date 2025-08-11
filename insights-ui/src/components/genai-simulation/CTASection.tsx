import Link from 'next/link';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

export default function CTASection() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 p-12 sm:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-4xl font-bold text-white mb-6">Ready to Transform Your Classroom?</h2>
            <p className="text-lg text-indigo-100 mb-8">
              Join forward-thinking educators who are preparing students for the AI-powered future. Web-based, scalable, and designed for immediate impact.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/#contact"
                className="group inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-indigo-700 shadow-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
              >
                Get Started Today
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#demo"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white/60 px-8 py-4 text-lg font-semibold text-white hover:bg-white/10 transition-all duration-300"
              >
                Watch Demo
              </Link>
            </div>

            <div className="mt-8 text-indigo-100">
              <p className="text-sm">✓ No setup required ✓ Unlimited participants ✓ Custom pricing available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
