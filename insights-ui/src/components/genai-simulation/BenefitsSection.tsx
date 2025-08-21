import { AcademicCapIcon, CheckCircleIcon, ClipboardDocumentListIcon, EyeIcon, WrenchIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function BenefitsSection() {
  const professorBenefits = [
    {
      title: 'Practical Learning',
      desc: 'Move beyond textbooks to teach with real-world applications',
      icon: ClipboardDocumentListIcon,
    },
    {
      title: 'Ready-to-Use Cases',
      desc: 'Save time with pre-defined case studies across multiple disciplines',
      icon: AcademicCapIcon,
    },
    {
      title: 'Student Progress Tracking',
      desc: 'See which students need help and which are moving quickly',
      icon: EyeIcon,
    },
    {
      title: 'Detailed Exercise Review',
      desc: 'Review prompts and AI responses to provide immediate feedback',
      icon: ChartBarIcon,
    },
    {
      title: 'Custom Case Studies',
      desc: 'Add your own business cases to match specific course goals',
      icon: WrenchIcon,
    },
    {
      title: 'Time-Saving Setup',
      desc: 'Simple, straightforward product with detailed student guidelines',
      icon: ClockIcon,
    },
  ];

  const studentBenefits = [
    'Learn core business concepts while using Gen AI for real-world problems',
    'Create effective prompts and understand how small changes affect AI outputs',
    'Get structured output from AI by refining your prompting techniques',
    'Analyze AI responses and use that information for next steps',
    'Work through connected exercises that build on each other like real projects',
    'Gain industry-relevant experience before graduation',
  ];

  return (
    <section className="relative py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500">
                <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-indigo-400">For Professors</h2>
            </div>
            <p className="text-lg text-gray-300 mb-8">Streamline your teaching with AI-powered tools that enhance both efficiency and student engagement.</p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {professorBenefits.map((benefit) => (
                <div key={benefit.title} className="rounded-xl border border-gray-700 bg-gray-800/30 p-4 hover:bg-gray-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <benefit.icon className="h-5 w-5 text-indigo-400 mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-white text-sm">{benefit.title}</h3>
                      <p className="text-gray-300 text-sm mt-1">{benefit.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                <AcademicCapIcon className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-indigo-400">For Students</h2>
            </div>
            <p className="text-lg text-gray-300 mb-8">Use AI-powered simulations to speed up your learning and apply concepts to real-world cases.</p>

            <div className="space-y-4">
              {studentBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3 rounded-xl border border-gray-700 bg-gray-800/30 p-4 hover:bg-gray-800/50 transition-colors">
                  <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
