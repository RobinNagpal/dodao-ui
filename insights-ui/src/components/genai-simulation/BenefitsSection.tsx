import { AcademicCapIcon, CheckCircleIcon, ClipboardDocumentListIcon, EyeIcon, WrenchIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function BenefitsSection() {
  const professorBenefits = [
    {
      title: 'Structured Teaching Flow',
      desc: 'Pre-built lesson plans with guided steps and expected outcomes',
      icon: ClipboardDocumentListIcon,
    },
    {
      title: 'Ready-to-Use Case Studies',
      desc: 'Comprehensive scenarios across multiple business disciplines',
      icon: AcademicCapIcon,
    },
    {
      title: 'Real-Time Monitoring',
      desc: 'Live visibility into student progress and AI interactions',
      icon: EyeIcon,
    },
    {
      title: 'AI-Assisted Evaluation',
      desc: 'Automated assessment with your qualitative oversight',
      icon: ChartBarIcon,
    },
    {
      title: 'Customizable Content',
      desc: 'Adapt difficulty levels and add your own case studies',
      icon: WrenchIcon,
    },
    {
      title: 'Time-Saving Prep',
      desc: 'Focus on teaching, not content creation and setup',
      icon: ClockIcon,
    },
  ];

  const studentBenefits = [
    'Understand core business concepts through hands-on application',
    'Develop prompt engineering skills, then apply them in simulations',
    'Learn to structure and format AI responses effectively',
    'Gain practical GenAI experience that employers are looking for',
    'Apply theoretical knowledge to realistic business scenarios',
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
