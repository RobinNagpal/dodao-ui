import { permanentRedirect } from 'next/navigation';

export default async function IndustryStocksPage(props: { params: Promise<{ industry: string }> }) {
  const params = await props.params;
  const industryKey = params.industry;

  // Permanent redirect to the new URL structure
  permanentRedirect(`/stocks/industries/${industryKey}`);
}
