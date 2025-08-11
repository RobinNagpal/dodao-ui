import { ChartBarIcon, CogIcon, CurrencyDollarIcon, UserGroupIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

export default function SubjectsSection() {
  const subjects = [
    {
      title: 'Marketing',
      items: ['4Cs Framework', '4Ps Strategy', 'STP Model'],
      icon: ChartBarIcon,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Finance',
      items: ['DCF Analysis', 'Financial Statements', 'Scenario Planning'],
      icon: CurrencyDollarIcon,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Economics',
      items: ['Supply & Demand', 'Welfare Analysis', 'Cost-Benefit Analysis'],
      icon: ArrowTrendingUpIcon,
      color: 'from-red-500 to-rose-500',
    },
    {
      title: 'Human Resources',
      items: ['Employee Value Prop', '9-Box Talent Grid', "Kotter's Change Model"],
      icon: UserGroupIcon,
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Operations & Supply Chain',
      items: ['SCOR Model', 'Kraljic Portfolio Matrix', 'EOQ & Safety-Stock'],
      icon: CogIcon,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section className="relative py-20">
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-indigo-400">Comprehensive Subject Coverage</h2>
          <p className="mt-4 text-lg text-gray-300">Ready-to-use case studies across all major business disciplines with AI-powered learning paths</p>
        </div>

        <div className="mt-16 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-10 blur-xl" />

          <div className="space-y-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {subjects.slice(0, 3).map((subject, index) => (
                <div key={subject.title} className="group relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${subject.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-xl`}
                  />
                  <div className="relative rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm hover:border-gray-600 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${subject.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <subject.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors">{subject.title}</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Key Topics</div>
                      <div className="flex flex-wrap gap-2">
                        {subject.items.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center rounded-full bg-gray-700/60 px-3 py-1 text-xs font-medium text-gray-200 hover:bg-gray-600/60 transition-colors"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`mt-4 h-1 w-full bg-gradient-to-r ${subject.color} rounded-full opacity-50 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {subjects.slice(3, 5).map((subject, index) => (
                <div key={subject.title} className="group relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${subject.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-2xl blur-xl`}
                  />

                  <div className="relative rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm hover:border-gray-600 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${subject.color} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <subject.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors">{subject.title}</h3>
                    </div>

                    <div className="space-y-2">
                      <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Key Topics</div>
                      <div className="flex flex-wrap gap-2">
                        {subject.items.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center rounded-full bg-gray-700/60 px-3 py-1 text-xs font-medium text-gray-200 hover:bg-gray-600/60 transition-colors"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className={`mt-4 h-1 w-full bg-gradient-to-r ${subject.color} rounded-full opacity-50 group-hover:opacity-100 transition-opacity`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-800/50 border border-gray-700 px-6 py-3 backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-gray-300 text-sm font-medium">+ Add Your Own Custom Case Studies</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
