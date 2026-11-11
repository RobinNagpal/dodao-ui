import UseCaseCard from '@/components/robotics-page/use-cases/UseCaseCard';
import { useCases } from '@/components/robotics-page/use-cases/useCases';
import { SectionIntro } from './SiteUi';

export default function UseCases() {
  return (
    <section id="use-cases" className="relative scroll-mt-20 overflow-hidden bg-bg py-24 sm:py-28">
      <div className="dodao-viewport-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionIntro
          title="Use cases"
          lead="Tasks we have built end to end, in physics simulation with models of real arms, grippers and sensors. Each one shows the full run and how we built it."
        />
        <ul className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {useCases.map((useCase, index) => (
            <li key={useCase.slug} className={index === useCases.length - 1 ? 'sm:col-span-2 lg:col-span-1' : ''}>
              <UseCaseCard useCase={useCase} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
