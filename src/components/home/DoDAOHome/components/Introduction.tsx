export function Introduction() {
  return (
    <section id="introduction" aria-label="Introduction">
      <div className="py-16 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-4xl lg:text-center">
            <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Welcome to DoDAO: Where Learning Meets Simplicity</p>
            <p className="mt-6 text-lg leading-8">
              We are a customer education platform focused on empowering businesses to educate their customers effectively. Our product portfolio includes a
              range of offerings designed to enhance customer education and awareness. We also provide specialized solutions tailored specifically for
              blockchain companies.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 md:mt-16 lg:mt-16 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-bold leading-7">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                  </div>
                  Tidbits Hub
                </dt>
                <dd className="mt-2 text-base leading-7">
                  This is our latest product where you can create bite sized information, which we call tidbits. These tidbits can then be published to social
                  media or can be used to create printed materials like pamphlets.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-bold leading-7">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"
                      />
                    </svg>
                  </div>
                  Academy Sites
                </dt>
                <dd className="mt-2 text-base leading-7">
                  These are detailed sources of information. With a combination of various innovative formats like guides, tidbits, simulations etc. we make
                  sure users are able to comprehend complex concepts easily.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-bold leading-7">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                      />
                    </svg>
                  </div>
                  AI Chatbot
                </dt>
                <dd className="mt-2 text-base leading-7">
                  Unlike many AI chatbots that can be inaccurate and share irrelevant information, our Chatbot stands out. It is trained on specific data,
                  ensuring accurate responses. It also gives credit to the original source of information.
                </dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-bold leading-7">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                      <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                      <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                    </svg>
                  </div>
                  Blockchain Courses
                </dt>
                <dd className="mt-2 text-base leading-7">
                  We have created a curriculum covering NFTs, DeFi, Layer 2 solutions, and more, providing essential knowledge and practical skills that will
                  set you apart in this rapidly evolving industry.
                </dd>
              </div>
              <div className="lg:col-start-1 lg:col-span-2 lg:ml-64">
                <div className="relative pl-16">
                  <dt className="text-base font-bold leading-7">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33"
                        />
                      </svg>
                    </div>
                    Blockchain Development
                  </dt>
                  <dd className="mt-2 text-base leading-7 lg:w-1/2">
                    If you are looking for experts who can help you accelerate your development, we provide specialized development services for strategic
                    projects.
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
