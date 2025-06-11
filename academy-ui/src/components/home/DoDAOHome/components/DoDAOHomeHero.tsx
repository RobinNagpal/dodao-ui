import ContactUsButton from '@/components/home/DoDAOHome/components/ContactUsButton';

export default function DoDAOHomeHero() {
  return (
    <div
      className="relative isolate overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage:
          'url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2830&q=80&blend=111827&sat=-100&exp=15&blend-mode=multiply)',
        height: '60%',
      }}
    >
      <div className="mx-auto max-w-4xl py-16 sm:py-16 lg:py-24">
        <div className="hidden sm:mb-8 sm:flex sm:justify-center">
          <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-gray-400 ring-1 ring-white/10 hover:ring-white/20">
            Announcing our Latest Product:{' '}
            <a href="https://koalagains.com/" target="_blank" className="font-semibold text-white">
              KoalaGains <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
        <div className="text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">Building the Future with DoDAO</h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            DoDAO is a dedicated team of builders creating meaningful, impact-driven products. We’ve collaborated with leading blockchain projects, offering
            expertise in Smart Contract Development, Blockchain Tooling, Education, and Research. Now, our primary focus is on AI Agent Development and AI Agent
            Training—designing and teaching intelligent agents that automate your most complex workflows, boost productivity, and adapt as your business
            evolves.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <ContactUsButton />
          </div>
        </div>
      </div>
    </div>
  );
}
