import UseCasePage from '@/components/robotics-page/use-cases/UseCasePage';
import { getUseCase, mediaForUseCase, useCases } from '@/components/robotics-page/use-cases/useCases';
import { SITE_URL } from '@/utils/siteConfig';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Static export: only the known use cases are generated; any other slug 404s.
export const dynamicParams = false;

type UseCasePageArgs = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return useCases.map((useCase) => ({ slug: useCase.slug }));
}

export async function generateMetadata(args: UseCasePageArgs): Promise<Metadata> {
  const useCase = getUseCase((await args.params).slug);
  if (!useCase) return {};
  const title = `${useCase.name} | DoDAO Robotics`;
  const url = `${SITE_URL}/robotics/use-cases/${useCase.slug}`;
  const image = `${SITE_URL}${mediaForUseCase(useCase.slug, 'card.jpg')}`;
  return {
    title,
    description: useCase.lead,
    alternates: { canonical: url },
    openGraph: { title, description: useCase.summary, url, type: 'article', siteName: 'DoDAO', images: [image] },
    twitter: { card: 'summary_large_image', title, description: useCase.summary, images: [image], site: '@dodao_io' },
  };
}

export default async function UseCaseRoute(args: UseCasePageArgs) {
  const useCase = getUseCase((await args.params).slug);
  if (!useCase) notFound();
  return <UseCasePage useCase={useCase} />;
}
