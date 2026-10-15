import RoboticsAreaPage from '@/components/robotics-page/areas/RoboticsAreaPage';
import { getRoboticsArea, roboticsAreas } from '@/components/robotics-page/areas/roboticsAreas';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type AreaPageArgs = { params: Promise<{ area: string }> };

export function generateStaticParams() {
  return roboticsAreas.map((area) => ({ area: area.slug }));
}

export async function generateMetadata(args: AreaPageArgs): Promise<Metadata> {
  const area = getRoboticsArea((await args.params).area);
  if (!area) return {};
  const title = `${area.name} | DoDAO Robotics`;
  return {
    title,
    description: area.lead,
    alternates: { canonical: `https://dodao.io/robotics/${area.slug}` },
    openGraph: { title, description: area.summary, url: `https://dodao.io/robotics/${area.slug}`, type: 'website', siteName: 'DoDAO' },
  };
}

export default async function RoboticsAreaRoute(args: AreaPageArgs) {
  const area = getRoboticsArea((await args.params).area);
  if (!area) notFound();
  return <RoboticsAreaPage area={area} />;
}
