import { renderIndustryCoverBody } from '@/components/industry-tariff/cover/IndustryCoverBody';
import { fetchIndustryCoverMetadata } from '@/utils/tariff-reports/industry-metadata';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;
  return fetchIndustryCoverMetadata(industryId);
}

export default async function EvaluateIndustryAreaPage({ params }: { params: Promise<{ industryId: string; headingAndSubheadingIndex: string }> }) {
  const { industryId } = await params;
  return renderIndustryCoverBody(industryId);
}
