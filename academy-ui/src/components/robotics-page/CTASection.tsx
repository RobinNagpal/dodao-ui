import { ArrowRightIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

export default function CTASection() {
  return (
    <section id="contact" className="relative py-20 bg-bg scroll-mt-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl border border-border bg-surface/60 backdrop-blur-sm p-10 sm:p-14 text-center">
          <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />

          <div className="relative mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-heading sm:text-4xl">Let&rsquo;s talk about your robot</h2>
            <p className="mt-4 text-lg text-body">
              Send us a short note about your robot and what you are trying to ship. We will get back to you with a written proposal that covers scope, timeline
              and cost. No long sales pitch, no commitment to keep talking.
            </p>
            <p className="mt-3 text-base text-muted">Most teams hear back from us within two business days.</p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <a
                href="mailto:info@dodao.com"
                className="group inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-text shadow-lg hover:bg-primary/85 transition-colors sm:w-auto"
              >
                <EnvelopeIcon className="mr-2 h-5 w-5" />
                info@dodao.com
                <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://www.linkedin.com/company/dodao-io"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface/60 px-6 py-3 text-base font-semibold text-body backdrop-blur-sm hover:bg-surface/80 transition-colors sm:w-auto"
              >
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
