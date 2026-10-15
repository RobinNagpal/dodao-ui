import { CONTACT_MAILTO } from './DoDAOHomeHero';
import LoopingVideo from './LoopingVideo';
import { ActionLink } from './SiteUi';

export default function StartProject() {
  return (
    <section id="contact" className="relative isolate scroll-mt-20 overflow-hidden bg-viewport">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {/* Placeholder stock footage (Mixkit free licence) */}
        <LoopingVideo src="/robotics/clips/industrial-cell.mp4" poster="/robotics/clips/industrial-cell.jpg" label="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-viewport/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-viewport via-viewport/80 to-primary/30" />
      </div>
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="max-w-3xl">
          <h2 className="font-display text-4xl font-semibold leading-[1.05] text-on-viewport sm:text-5xl lg:text-6xl">
            Tell us what you want a robot arm to do.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-on-viewport/80">
            Send a short description or a phone video of the task. We will reply with what we would simulate first, and whether a learned model belongs in it.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ActionLink href={CONTACT_MAILTO} size="lg">
              Email info@dodao.com
            </ActionLink>
            <ActionLink href="https://docs.dodao.io" external size="lg" variant="onColor">
              Read our robotics notes
            </ActionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
