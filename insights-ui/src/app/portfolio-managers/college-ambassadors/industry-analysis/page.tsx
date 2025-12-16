import { TickerV1Industry, TickerV1SubIndustry, Prompt, PromptVersion } from '@prisma/client';
import { notFound } from 'next/navigation';
import { getBaseUrlForServerSidePages } from '@/utils/getBaseUrlForServerSidePages';
import IndustryAnalysisClient from './IndustryAnalysisClient';
import { PROMPTS } from './promptConfig';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';

interface IndustryWithSubIndustries extends TickerV1Industry {
  subIndustries: TickerV1SubIndustry[];
}

export type PromptWithVersion = Prompt & { activePromptVersion: PromptVersion | null };

const PROMPT_KEYS = PROMPTS.map((p) => p.key);

async function fetchIndustries(): Promise<IndustryWithSubIndustries[]> {
  const baseUrl = getBaseUrlForServerSidePages();
  const baseUrlPath = `${baseUrl}/api/industries`;

  const res = await fetch(baseUrlPath, {
    cache: 'no-cache',
  });

  const data = (await res.json()) as IndustryWithSubIndustries[];
  return data;
}

async function fetchPrompts(): Promise<PromptWithVersion[]> {
  const baseUrl = getBaseUrlForServerSidePages();
  const keys = PROMPT_KEYS.join(',');
  const baseUrlPath = `${baseUrl}/api/${KoalaGainsSpaceId}/prompts/by-keys?keys=${encodeURIComponent(keys)}`;

  const res = await fetch(baseUrlPath, {
    cache: 'no-cache',
  });

  const data = await res.json();
  return data.prompts as PromptWithVersion[];
}

export default async function IndustryAnalysisPage() {
  const [industries, prompts] = await Promise.all([fetchIndustries(), fetchPrompts()]);

  if (!industries || industries.length === 0) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Industry Analysis - Prompt Generation</h1>
          <p className="text-gray-400">Select an industry to generate and view prompt inputs for various analysis types.</p>
        </div>

        <IndustryAnalysisClient industries={industries} prompts={prompts} />
      </div>
    </div>
  );
}
