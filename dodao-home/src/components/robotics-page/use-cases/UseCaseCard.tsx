import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { UseCase, mediaForUseCase } from './useCases';

/**
 * Card linking to a use case page: a still from the run on top, the story
 * below. Used on the homepage, on the robotics area pages and under each use
 * case ("More use cases").
 */
export default function UseCaseCard({ useCase }: { useCase: UseCase }) {
  return (
    <a
      href={`/robotics/use-cases/${useCase.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-surface ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-viewport">
        <Image
          src={mediaForUseCase(useCase.slug, 'card.jpg')}
          alt=""
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 rounded-full bg-viewport/75 px-3 py-1 text-xs font-medium text-on-viewport backdrop-blur">
          Simulated in {useCase.simulator}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-sm font-medium text-accent">{useCase.sector}</p>
        <h3 className="font-display mt-2 text-2xl font-semibold text-heading">{useCase.name}</h3>
        <p className="mt-2 flex-1 text-[0.95rem] leading-6 text-body">{useCase.summary}</p>
        <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-link">
          See the full run
          <ArrowRightIcon className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
}
