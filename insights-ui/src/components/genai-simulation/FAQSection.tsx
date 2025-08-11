'use client';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Who can use this simulation?',
      a: 'Ideal for undergraduate and graduate (MBA) across all business disciplines.',
    },
    {
      q: 'Are there participant limits?',
      a: 'No limits whatsoever. Our platform scales seamlessly from small seminars to large lecture halls with hundreds of students.',
    },
    {
      q: 'What subjects are covered?',
      a: 'Built-in coverage for Marketing, Finance, Operations, HR, and Economics. Plus, you can easily add custom topics and case studies.',
    },
    {
      q: 'Do I need AI expertise to use this?',
      a: 'Not at all. The platform handles all AI interactions automatically, so you can focus entirely on teaching and student guidance.',
    },
    {
      q: 'How does pricing work?',
      a: "We offer flexible pricing based on your institution's needs. Contact us for a customized quote and demo.",
    },
    {
      q: 'Can I track student progress?',
      a: 'Yes. Instructors can monitor each student’s performance, view simulation outputs, and assess how concepts are applied.',
    },
    {
      q: 'Can students work in groups?',
      a: 'The platform runs exercises individually, but professors can assign students into offline groups who take turns completing simulations together.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold text-indigo-400">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-gray-300">Everything you need to know about our GenAI Simulations</p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="group rounded-2xl border border-gray-700 bg-gray-800/30 backdrop-blur-sm hover:bg-gray-800/50 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-2xl"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-medium font-semibold text-white group-hover:text-indigo-300 transition-colors pr-4">{faq.q}</h3>
                    <div className="flex-shrink-0">
                      {openIndex === index ? (
                        <ChevronUpIcon className="h-5 w-5 text-indigo-400 transform transition-transform duration-200" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-indigo-400 transform transition-all duration-200" />
                      )}
                    </div>
                  </div>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-700 pt-4">
                      <p className="text-gray-300 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 px-6 py-3 backdrop-blur-sm">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
              <span className="text-indigo-300 text-sm font-medium">Have more questions? Let’s talk!</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
