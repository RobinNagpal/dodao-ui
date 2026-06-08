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
            <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent pb-1.5">
              Robotics, AI Agents &amp; DeFi
            </span>
          </h1>

          <p className="mt-6 text-xl leading-8 text-gray-300 max-w-3xl mx-auto">
            DoDAO is a robotics services company. We prove every project in simulation first, then move to hardware. We also build AI Agents and DeFi tools that
            teams use every day.
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
              href="/home-section/dodao-io/services/robotics"
              className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25"
                      />
                    </svg>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">Robotics</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Robotics Software</h3>
                <p className="text-sm text-gray-300">ROS 2, MoveIt 2, and modern perception for robot arms and mobile robots. Proven in simulation first.</p>
                <div className="mt-4 inline-flex items-center text-emerald-400 text-sm font-medium">
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
              href="/home-section/dodao-io/projects/hplc-autosampler"
              className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6"
            >
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/20">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104a2.25 2.25 0 01-.659 1.591L5 8.818m4.75-5.714a48.13 48.13 0 014.5 0M14.25 3.104v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.75-11.396a2.25 2.25 0 00.659 1.591L19 8.818m0 0a2.25 2.25 0 011.591 3.84L13.5 19.5l-3 2.25-3-2.25L.91 12.658a2.25 2.25 0 011.59-3.84m0 0c.413 0 .825.124 1.173.371L5 8.818"
                      />
                    </svg>
                  </div>
                  <span className="text-emerald-400 text-sm font-medium">Robotics</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">HPLC Autosampler</h3>
                <p className="text-sm text-gray-300">
                  Our flagship robotics project. A robot arm that helps chemistry labs prepare and load sample vials into the HPLC autosampler.
                </p>
                <div className="mt-4 inline-flex items-center text-emerald-400 text-sm font-medium">
                  Read the case study
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
            <a
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-400 shadow-sm transition-colors"
            >
              Contact Us
            </a>
            <a
              href="#products"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg text-sm font-semibold text-gray-300 border border-white/20 backdrop-blur-sm hover:bg-white/5 transition-colors"
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
