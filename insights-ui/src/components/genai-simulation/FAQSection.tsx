export default function FAQSection() {
  const faqs = [
    {
      q: 'Who can use this simulation?',
      a: 'Ideal for undergraduate, graduate (MBA), executive education, and professional development programs across all business disciplines.',
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
  ];

  return (
    <section id="faq" className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="text-4xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-gray-300">Everything you need to know about our GenAI simulation platform</p>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-gray-700 bg-gray-800/30 p-6 hover:bg-gray-800/50 transition-colors">
                <h3 className="text-lg font-semibold text-white mb-3">{faq.q}</h3>
                <p className="text-gray-300 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
