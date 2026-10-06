import { renderIndustryCoverBody } from '@/components/industry-tariff/cover/IndustryCoverBody';
import { fetchIndustryCoverMetadata } from '@/utils/tariff-reports/industry-metadata';
import { isValidHeadingAndSubheadingIndex, isValidTariffIndustryId, rejectTariffPageParam } from '@/utils/tariff-reports/tariff-input-validation';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ industryId: string }> }): Promise<Metadata> {
  const { industryId } = await params;
  return fetchIndustryCoverMetadata(industryId);
}

export default async function EvaluateIndustryAreaPage({ params }: { params: Promise<{ industryId: string; headingAndSubheadingIndex: string }> }) {
  const { industryId, headingAndSubheadingIndex } = await params;
  // Legacy `<heading>-<subheading>` URL (e.g. `0-1`) that now mirrors the cover. A malformed index is
  // rejected here; a bad industryId is logged by the `[industryId]` layout (and 404s silently in
  // renderIndustryCoverBody), so a request logs at most one `[input-rejected]` line per bad param.
  if (!isValidHeadingAndSubheadingIndex(headingAndSubheadingIndex)) {
    if (isValidTariffIndustryId(industryId)) rejectTariffPageParam('headingAndSubheadingIndex', headingAndSubheadingIndex);
    notFound();
  }
  return renderIndustryCoverBody(industryId);
}
