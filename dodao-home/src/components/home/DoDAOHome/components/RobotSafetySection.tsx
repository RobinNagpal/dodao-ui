import { safetyAreas, SAFETY_CONTACT_MAILTO, SAFETY_PDF } from '@/components/robot-safety/robotSafetyContent';
import { ArrowUpRightIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { ActionLink } from './SiteUi';

/** Home page band introducing the robot safety & security readiness service (/robot-safety). */
export default function RobotSafetySection() {
  return (
    <section id="robot-safety" className="relative isolate scroll-mt-20 overflow-hidden bg-primary py-20 text-primary-text sm:py-24">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-transparent to-viewport/60" aria-hidden="true" />
      <div className="dodao-viewport-grid pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <p className="flex items-center gap-3 text-sm font-medium text-primary-text/80">
            <span className="h-px w-8 bg-primary-text/60" aria-hidden="true" />
            Robot safety &amp; security readiness
          </p>
          <h2 className="font-display mt-4 text-3xl font-semibold leading-[1.08] sm:text-4xl lg:text-5xl">Already have a robot? We get it cleared for work.</h2>
          <p className="mt-5 text-lg leading-8 text-primary-text/85">
            Buyers, inspectors and regulators each ask for proof that a robot is safe and secure. We find what is missing, run the tests and put the evidence in
            order for the lab or auditor who signs off.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ActionLink href="/robot-safety" variant="inverse">
              See how it works
            </ActionLink>
            <ActionLink href={SAFETY_CONTACT_MAILTO} variant="onColor">
              Free 30-min call
            </ActionLink>
          </div>
          <a
            href={SAFETY_PDF.href}
            download={SAFETY_PDF.fileName}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary-text/85 underline-offset-4 hover:text-primary-text hover:underline"
          >
            <DocumentArrowDownIcon className="h-5 w-5" aria-hidden="true" />
            Or download the 3-page overview (PDF)
          </a>
        </div>

        <div className="lg:col-span-7">
          <p className="text-sm font-medium text-primary-text/80">Four questions every buyer asks</p>
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {safetyAreas.map((area) => (
              <li key={area.id}>
                <a
                  href={`/robot-safety#${area.id}`}
                  className="group flex h-full flex-col rounded-2xl bg-primary-text/10 p-6 ring-1 ring-inset ring-primary-text/25 backdrop-blur transition hover:bg-primary-text/15 hover:ring-primary-text/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-text"
                >
                  <span className="flex items-center justify-between">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-text text-sm font-semibold text-primary">
                      {area.number}
                    </span>
                    <ArrowUpRightIcon className="h-5 w-5 text-primary-text/60 transition group-hover:text-primary-text" aria-hidden="true" />
                  </span>
                  <span className="mt-5 text-lg font-semibold leading-snug">{area.question}</span>
                  <span className="mt-1.5 text-sm text-primary-text/75">{area.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
