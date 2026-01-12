export default function DoDAOHomeHero() {
  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="relative mx-auto max-w-7xl px-6 py-8 sm:py-12 lg:py-16 lg:px-8">
        <div className="mb-8 flex justify-center">
          <div className="relative rounded-full px-4 py-2 text-sm leading-6 text-gray-300 ring-1 ring-white/20 backdrop-blur-sm bg-white/5">
            <span className="inline-flex items-center">
              <span className="h-2 w-2 bg-green-400 rounded-full mr-2"></span>
              Latest Product Launch:{' '}
              <a href="https://koalagains.com/" target="_blank" className="font-semibold text-white ml-1" rel="noreferrer">
                KoalaGains <span aria-hidden="true">&rarr;</span>
              </a>
            </span>
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            <span className="block">Building the Future with</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent pb-1.5">AI Agents & DeFi</span>
          </h1>

          <p className="mt-6 text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
            We specialize in designing intelligent AI agents, training teams to build them, and creating DeFi tools that power the decentralized future.
          </p>

          <div className="mt-10 flex justify-center">
            <div className="inline-flex rounded-md p-1 bg-white/10 backdrop-blur-sm">
              <div className="px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white">Our Services & Products</div>
            </div>
          </div>

          {/* Services and Products Cards */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8 max-w-5xl mx-auto">
            <a
              href="/home-section/dodao-io/services/custom-ai-agent-dev"
              className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <span className="text-blue-400 text-sm font-medium">AI Agent</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Agent Development</h3>
                <p className="text-sm text-gray-300">Custom AI agents that automate workflows and solve complex business problems.</p>
                <div className="mt-4 inline-flex items-center text-blue-400 text-sm font-medium">
                  Explore More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a
              href="/home-section/dodao-io/education/ai-agent-bootcamp"
              className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-500/20">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <span className="text-purple-400 text-sm font-medium">Education</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Agent Training</h3>
                <p className="text-sm text-gray-300">Comprehensive bootcamps teaching teams to build production-ready AI Agents.</p>
                <div className="mt-4 inline-flex items-center text-purple-400 text-sm font-medium">
                  Explore More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a
              href="/home-section/dodao-io/services/defi-tooling"
              className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-indigo-400 text-sm font-medium">DeFi Tool</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">DeFi Development & Tools</h3>
                <p className="text-sm text-gray-300">Advanced tooling, dashboards, and smart contracts for leading DeFi protocols.</p>
                <div className="mt-4 inline-flex items-center text-indigo-400 text-sm font-medium">
                  Explore More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          <h3 className="mt-16 text-xl font-semibold text-white text-center">Our Products</h3>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3 lg:gap-8 max-w-5xl mx-auto">
            <a
              href="/home-section/dodao-io/products/koalagains"
              className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/20">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <span className="text-blue-400 text-sm font-medium">AI Agent</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">KoalaGains Platform</h3>
                <p className="text-sm text-gray-300">AI-powered investment analysis platform for detailed financial insights and reports.</p>
                <div className="mt-4 inline-flex items-center text-blue-400 text-sm font-medium">
                  Explore More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a
              href="/home-section/dodao-io/products/tidbitshub"
              className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-violet-500/20">
                    <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <span className="text-violet-400 text-sm font-medium">Education</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Tidbits Hub</h3>
                <p className="text-sm text-gray-300">
                  Quickly learn complex topics in 5–10 minute interactive bites, complete with videos, quizzes, and demos.
                </p>
                <div className="mt-4 inline-flex items-center text-violet-400 text-sm font-medium">
                  Explore More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>

            <a
              href="/home-section/dodao-io/products/defi-alerts"
              className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/20">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 9l3-3m0 0l3 3m-3-3v12" />
                    </svg>
                  </div>
                  <span className="text-indigo-400 text-sm font-medium">DeFi Tool</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">DeFi Alerts</h3>
                <p className="text-sm text-gray-300">Get real-time DeFi alerts for yields, position health, and market changes with custom thresholds.</p>
                <div className="mt-4 inline-flex items-center text-indigo-400 text-sm font-medium">
                  Explore More
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </a>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="-mt-4">
              <a href="/contact" className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm">
                Contact Us
              </a>
            </div>
            <a
              href="#products"
              className="inline-flex items-center px-6 py-3 rounded-lg text-sm font-semibold text-gray-300 border border-white/20 backdrop-blur-sm"
            >
              Explore Our Work
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
