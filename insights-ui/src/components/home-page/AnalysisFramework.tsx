'use client';

export function AnalysisFramework() {
  return (
    <section className=" bg-gray-800 pt-16 sm:pt-20" id="analysis">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-4">
            <span className="text-indigo-400">Stock Analysis</span> Framework
          </h2>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto">
            Our AI-powered platform analyzes every stock across 6 critical investment dimensions, providing you with investment insights
          </p>
        </div>

        {/* Analysis Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            {
              title: 'Business & Moat',
              description: 'Competitive advantages, market position, and sustainable business model evaluation',
              icon: '🏰',
              color: 'from-blue-500 to-cyan-600',
            },
            {
              title: 'Financial Analysis',
              description: 'Deep dive into financial statements, ratios, and accounting quality assessment',
              icon: '📊',
              color: 'from-green-500 to-emerald-600',
            },
            {
              title: 'Past Performance',
              description: 'Historical revenue, profitability, and operational efficiency track record',
              icon: '📈',
              color: 'from-purple-500 to-violet-600',
            },
            {
              title: 'Future Growth',
              description: 'Growth prospects, market expansion opportunities, and scalability potential',
              icon: '🚀',
              color: 'from-orange-500 to-red-600',
            },
            {
              title: 'Vs Competition',
              description: 'Comparative analysis against industry peers and market leaders',
              icon: '⚔️',
              color: 'from-pink-500 to-rose-600',
            },
            {
              title: 'Fair Value',
              description: 'Intrinsic value calculation using multiple valuation methodologies',
              icon: '💰',
              color: 'from-indigo-500 to-blue-600',
            },
          ].map((category, index) => (
            <div
              key={category.title}
              className="bg-gray-700/40 backdrop-blur-sm rounded-xl p-6 border border-gray-600/40 hover:border-indigo-500/50 transition-all duration-300 hover:transform hover:scale-[1.02] group"
            >
              <div className="text-center">
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r ${category.color} mb-4 text-2xl group-hover:scale-110 transition-transform duration-300`}
                >
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{category.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{category.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/40">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center text-xl">🎯</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Investor Perspective Analysis</h3>
                <p className="text-gray-300 text-sm">
                  See how legendary investors like Warren Buffett would evaluate each stock using their proven investment strategies
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-800/60 to-gray-700/60 backdrop-blur-sm rounded-xl p-6 border border-gray-600/40">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-lg flex items-center justify-center text-xl">⚠️</div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Future Risk Assessment</h3>
                <p className="text-gray-300 text-sm">
                  Comprehensive risk analysis identifying potential threats and challenges that could impact future performance
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Score System */}
        <div className="text-center bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm rounded-xl p-8 border border-gray-600/40">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white mb-3">
              Visual <span className="text-indigo-400">Score System</span>
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Each stock receives a comprehensive score out of 25, with visual spider charts showing strengths and weaknesses across all analysis factors
            </p>
          </div>

          <div className="flex justify-center items-center space-x-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-500 mb-2">22/25</div>
              <div className="text-sm text-gray-400">Excellent</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-yellow-500 mb-2">18/25</div>
              <div className="text-sm text-gray-400">Good</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-500 mb-2">12/25</div>
              <div className="text-sm text-gray-400">Fair</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-500 mb-2">5/25</div>
              <div className="text-sm text-gray-400">Poor</div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-16 sm:mt-20 border-b border-gray-600"></div>
    </section>
  );
}
