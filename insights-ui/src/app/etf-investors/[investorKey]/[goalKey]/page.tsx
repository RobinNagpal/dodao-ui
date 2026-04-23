import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EtfInvestorGoalDetailView from '@/components/etf-investors/EtfInvestorGoalDetailView';
import EtfInvestorPageLayout from '@/components/etf-investors/EtfInvestorPageLayout';
import { getAllInvestors, getInvestorGoal } from '@/etf-analysis-data/etf-investor-taxonomy';

export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

type RouteParams = Promise<Readonly<{ investorKey: string; goalKey: string }>>;

export function generateStaticParams(): Array<{ investorKey: string; goalKey: string }> {
  const params: Array<{ investorKey: string; goalKey: string }> = [];
  for (const investor of getAllInvestors()) {
    for (const goal of investor.etfInvestorGoals) {
      params.push({ investorKey: investor.key, goalKey: goal.key });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: RouteParams }): Promise<Metadata> {
  const { investorKey, goalKey } = await params;
  const lookup = getInvestorGoal(investorKey, goalKey);
  if (!lookup) {
    return { title: 'Investor Goal Not Found | KoalaGains' };
  }
  return {
    title: `${lookup.goal.name} — ${lookup.investor.name} | KoalaGains`,
    description: lookup.goal.shortDescription,
  };
}

export default async function EtfInvestorGoalPage({ params }: { params: RouteParams }) {
  const { investorKey, goalKey } = await params;
  const lookup = getInvestorGoal(investorKey, goalKey);

  if (!lookup) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'US ETFs', href: '/etfs', current: false },
    { name: 'Investor Goals', href: '/etf-investors', current: false },
    { name: lookup.investor.name, href: '/etf-investors', current: false },
    { name: lookup.goal.name, href: `/etf-investors/${lookup.investor.key}/${lookup.goal.key}`, current: true },
  ];

  return (
    <EtfInvestorPageLayout title={lookup.goal.name} breadcrumbs={breadcrumbs}>
      <EtfInvestorGoalDetailView investor={lookup.investor} goal={lookup.goal} />
    </EtfInvestorPageLayout>
  );
}
