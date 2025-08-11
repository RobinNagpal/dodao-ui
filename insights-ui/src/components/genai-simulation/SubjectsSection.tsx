export default function SubjectsSection() {
  const subjects = [
    {
      title: 'Marketing',
      items: ['4Cs Framework', '4Ps Strategy', 'STP Model'],
      icon: '📊',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Operations & Supply Chain',
      items: ['SCOR Model', 'Kraljic Portfolio Matrix', 'EOQ & Safety-Stock'],
      icon: '⚙️',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'Finance',
      items: ['DCF Analysis', 'Financial Statements', 'Scenario Planning'],
      icon: '💰',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'Human Resources',
      items: ['Employee Value Prop', '9-Box Talent Grid', "Kotter's Change Model"],
      icon: '👥',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Economics',
      items: ['Supply & Demand', 'Welfare Analysis', 'Cost-Benefit Analysis'],
      icon: '📈',
      color: 'from-red-500 to-rose-500',
    },
  ];

  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-bold text-white">Comprehensive Subject Coverage</h2>
          <p className="mt-4 text-lg text-gray-300">Ready-to-use case studies across all major business disciplines</p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {subjects.map((subject, index) => (
            <div key={subject.title} className="group relative">
              <div
                className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-2xl blur-xl"
                style={{
                  background: `linear-gradient(to right, ${subject.color.split(' ')[1]}, ${subject.color.split(' ')[3]})`,
                }}
              />
              <div className="relative rounded-2xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm hover:border-gray-600 transition-all duration-300 transform hover:scale-105">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">{subject.icon}</div>
                  <h3 className="text-xl font-semibold text-white">{subject.title}</h3>
                </div>
                <div className="space-y-2">
                  {subject.items.map((item) => (
                    <div key={item} className="inline-flex items-center rounded-full bg-gray-700/60 px-3 py-1 text-sm font-medium text-gray-200 mr-2 mb-2">
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
