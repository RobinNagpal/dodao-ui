import { renderIndustryCoverBody } from '@/components/industry-tariff/cover/IndustryCoverBody';
import { fetchIndustryCoverMetadata } from '@/utils/tariff-reports/industry-metadata';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;
  return fetchIndustryCoverMetadata(industryId, `https://koalagains.com/industry-tariff-report/${industryId}`);
}

export default async function EvaluateIndustryAreasPage({ params }: { params: Promise<{ industryId: string }> }) {
  const { industryId } = await params;
  return renderIndustryCoverBody(industryId);
}
