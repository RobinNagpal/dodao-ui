'use client';

import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface NewChallenger {
  aboutManagement: string;
  companyDescription: string;
  companyName: string;
  companyTicker: string;
  companyWebsite: string;
  competitors: string;
  impactOfTariffs: string;
  uniqueAdvantage: string;
  products: Array<{
    productName: string;
    productDescription: string;
    percentageOfRevenue: string;
    competitors: string[];
  }>;
  pastPerformance: {
    revenueGrowth: string;
    costOfRevenue: string;
    profitabilityGrowth: string;
    rocGrowth: string;
  };
  futureGrowth: {
    revenueGrowth: string;
    costOfRevenue: string;
    profitabilityGrowth: string;
    rocGrowth: string;
  };
}

interface EditNewChallengersClientProps {
  industryId: string;
  headingAndSubheadingIndex: string;
  initialChallengers: NewChallenger[];
}

export default function EditNewChallengersClient({ industryId, headingAndSubheadingIndex, initialChallengers }: EditNewChallengersClientProps) {
  const router = useRouter();
  const [challengers, setChallengers] = useState<NewChallenger[]>(initialChallengers);

  const { postData: saveContent, loading: isSaving } = usePostData<any, any>({
    successMessage: 'New challengers updated successfully!',
    errorMessage: 'Failed to update new challengers. Please try again.',
    redirectPath: `/industry-tariff-report/${industryId}/evaluate-industry-areas/${headingAndSubheadingIndex}`,
  });

  const handleSave = async () => {
    await saveContent(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/save-json`, {
      section: 'evaluate-industry-areas',
      headingAndSubheadingIndex,
      sectionType: 'new-challengers',
      data: challengers,
    });
  };

  const updateChallengerField = (challengerIndex: number, field: keyof NewChallenger, value: any) => {
    setChallengers((prev) => prev.map((challenger, index) => (index === challengerIndex ? { ...challenger, [field]: value } : challenger)));
  };

  const updateChallengerSubField = (challengerIndex: number, section: string, field: string, value: string) => {
    setChallengers((prev) =>
      prev.map((challenger, index) =>
        index === challengerIndex
          ? {
              ...challenger,
              [section]: {
                ...(challenger as any)[section],
                [field]: value,
              },
            }
          : challenger
      )
    );
  };

  const getRedirectPath = () => {
    return `/industry-tariff-report/${industryId}/evaluate-industry-areas/${headingAndSubheadingIndex}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Edit New Challengers</h1>
            <p className="text-gray-600 mt-2">Industry Area: {headingAndSubheadingIndex}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push(getRedirectPath())}>Cancel</Button>
            <Button primary loading={isSaving} onClick={handleSave} disabled={isSaving}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {challengers.map((challenger, challengerIndex) => (
          <div key={challengerIndex} className="border rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-bold mb-6">
              {challenger.companyName} ({challenger.companyTicker})
            </h2>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={challenger.companyName}
                  onChange={(e) => updateChallengerField(challengerIndex, 'companyName', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Ticker</label>
                <input
                  type="text"
                  value={challenger.companyTicker}
                  onChange={(e) => updateChallengerField(challengerIndex, 'companyTicker', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Website</label>
                <input
                  type="url"
                  value={challenger.companyWebsite}
                  onChange={(e) => updateChallengerField(challengerIndex, 'companyWebsite', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Competitors</label>
                <MarkdownEditor
                  label=""
                  modelValue={challenger.competitors}
                  placeholder="Enter competitors information..."
                  onUpdate={(value) => updateChallengerField(challengerIndex, 'competitors', value || '')}
                  objectId={`challenger-competitors-${challengerIndex}`}
                  maxHeight="150px"
                />
              </div>
            </div>

            {/* Markdown Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Description</label>
                <MarkdownEditor
                  label=""
                  modelValue={challenger.companyDescription}
                  placeholder="Enter company description..."
                  onUpdate={(value) => updateChallengerField(challengerIndex, 'companyDescription', value || '')}
                  objectId={`challenger-description-${challengerIndex}`}
                  maxHeight="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">About Management</label>
                <MarkdownEditor
                  label=""
                  modelValue={challenger.aboutManagement}
                  placeholder="Enter information about management..."
                  onUpdate={(value) => updateChallengerField(challengerIndex, 'aboutManagement', value || '')}
                  objectId={`challenger-management-${challengerIndex}`}
                  maxHeight="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unique Advantage</label>
                <MarkdownEditor
                  label=""
                  modelValue={challenger.uniqueAdvantage}
                  placeholder="Enter unique advantage..."
                  onUpdate={(value) => updateChallengerField(challengerIndex, 'uniqueAdvantage', value || '')}
                  objectId={`challenger-advantage-${challengerIndex}`}
                  maxHeight="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Impact of Tariffs</label>
                <MarkdownEditor
                  label=""
                  modelValue={challenger.impactOfTariffs}
                  placeholder="Enter impact of tariffs..."
                  onUpdate={(value) => updateChallengerField(challengerIndex, 'impactOfTariffs', value || '')}
                  objectId={`challenger-tariffs-${challengerIndex}`}
                  maxHeight="200px"
                />
              </div>
            </div>

            {/* Performance Sections */}
            <div className="mt-6 space-y-6">
              {/* Past Performance */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Past Performance</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Revenue Growth</label>
                    <MarkdownEditor
                      label=""
                      modelValue={challenger.pastPerformance.revenueGrowth}
                      placeholder="Enter past revenue growth..."
                      onUpdate={(value) => updateChallengerSubField(challengerIndex, 'pastPerformance', 'revenueGrowth', value || '')}
                      objectId={`challenger-past-revenue-${challengerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cost of Revenue</label>
                    <MarkdownEditor
                      label=""
                      modelValue={challenger.pastPerformance.costOfRevenue}
                      placeholder="Enter past cost of revenue..."
                      onUpdate={(value) => updateChallengerSubField(challengerIndex, 'pastPerformance', 'costOfRevenue', value || '')}
                      objectId={`challenger-past-cost-${challengerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Profitability Growth</label>
                    <MarkdownEditor
                      label=""
                      modelValue={challenger.pastPerformance.profitabilityGrowth}
                      placeholder="Enter past profitability growth..."
                      onUpdate={(value) => updateChallengerSubField(challengerIndex, 'pastPerformance', 'profitabilityGrowth', value || '')}
                      objectId={`challenger-past-profit-${challengerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ROC Growth</label>
                    <MarkdownEditor
                      label=""
                      modelValue={challenger.pastPerformance.rocGrowth}
                      placeholder="Enter past ROC growth..."
                      onUpdate={(value) => updateChallengerSubField(challengerIndex, 'pastPerformance', 'rocGrowth', value || '')}
                      objectId={`challenger-past-roc-${challengerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                </div>
              </div>

              {/* Future Growth */}
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Future Growth</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Revenue Growth</label>
                    <MarkdownEditor
                      label=""
                      modelValue={challenger.futureGrowth.revenueGrowth}
                      placeholder="Enter future revenue growth..."
                      onUpdate={(value) => updateChallengerSubField(challengerIndex, 'futureGrowth', 'revenueGrowth', value || '')}
                      objectId={`challenger-future-revenue-${challengerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cost of Revenue</label>
                    <MarkdownEditor
                      label=""
                      modelValue={challenger.futureGrowth.costOfRevenue}
                      placeholder="Enter future cost of revenue..."
                      onUpdate={(value) => updateChallengerSubField(challengerIndex, 'futureGrowth', 'costOfRevenue', value || '')}
                      objectId={`challenger-future-cost-${challengerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Profitability Growth</label>
                    <MarkdownEditor
                      label=""
                      modelValue={challenger.futureGrowth.profitabilityGrowth}
                      placeholder="Enter future profitability growth..."
                      onUpdate={(value) => updateChallengerSubField(challengerIndex, 'futureGrowth', 'profitabilityGrowth', value || '')}
                      objectId={`challenger-future-profit-${challengerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ROC Growth</label>
                    <MarkdownEditor
                      label=""
                      modelValue={challenger.futureGrowth.rocGrowth}
                      placeholder="Enter future ROC growth..."
                      onUpdate={(value) => updateChallengerSubField(challengerIndex, 'futureGrowth', 'rocGrowth', value || '')}
                      objectId={`challenger-future-roc-${challengerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
