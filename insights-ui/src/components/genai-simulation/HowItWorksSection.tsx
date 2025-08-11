import { ClipboardDocumentListIcon, CogIcon, ChartBarIcon } from '@heroicons/react/24/outline';

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-800" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-white">How It Works</h2>
          <p className="mt-4 text-lg text-gray-300">A structured, step-by-step approach that makes learning both effective and engaging</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {[
            {
              step: '01',
              title: 'Guided Prompting',
              desc: 'Students receive step-by-step instructions, real-world case context, example prompts, and expected output formats for each business concept helping them start with clarity and confidence.',
              icon: ClipboardDocumentListIcon,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              step: '02',
              title: 'AI Interaction & Analysis',
              desc: 'Students interact with GenAI, analyze responses against provided guidelines, and refine their prompts to improve accuracy and relevance, building both AI literacy and critical thinking skills.',
              icon: CogIcon,
              color: 'from-indigo-500 to-purple-500',
            },
            {
              step: '03',
              title: 'Reporting & Feedback',
              desc: 'Each activity contributes to a structured, professional-grade business analysis report. Professors can monitor every step in real time, provide instant feedback, and let AI assist in evaluating final submissions.',
              icon: ChartBarIcon,
              color: 'from-purple-500 to-pink-500',
            },
          ].map((item, index) => (
            <div key={item.step} className="relative group">
              <div
                className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl"
                style={{
                  background: `linear-gradient(to right, ${item.color.split(' ')[1]}, ${item.color.split(' ')[3]})`,
                }}
              />
              <div className="relative rounded-2xl border border-gray-700 bg-gray-800/50 p-8 backdrop-blur-sm hover:border-gray-600 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} text-white font-bold text-lg`}>
                    {item.step}
                  </div>
                  <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-r ${item.color}`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
