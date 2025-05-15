'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'How do I onboard my protocol?',
    answer:
      'Our onboarding process is streamlined for DeFi teams. We start with a technical discovery call, followed by API integration and customization of your alert parameters. Most protocols are fully onboarded within 2 weeks, with dedicated support throughout the process.',
  },
  {
    question: 'Can I self-host?',
    answer:
      'Yes, we offer both cloud-hosted and self-hosted deployment options. Our self-hosted solution gives you complete control over your data while still benefiting from our regular updates and security patches. We provide comprehensive documentation and support for self-hosted deployments.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="container mx-auto px-4 py-24">
      <h2 className="text-3xl font-bold text-center mb-12 text-[#f1f1f3]">Frequently Asked Questions</h2>

      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div key={index} className="border-b border-[#d1d5da] last:border-b-0">
            <button className="w-full py-5 flex justify-between items-center text-left focus:outline-none" onClick={() => toggleFaq(index)}>
              <span className="text-lg font-medium text-[#f1f1f3]">{faq.question}</span>
              <ChevronDown className={`h-5 w-5 text-[#f1f1f3] transition-transform ${openIndex === index ? 'transform rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 pb-5' : 'max-h-0'}`}>
              <p className="text-[#f1f1f3]/80">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
