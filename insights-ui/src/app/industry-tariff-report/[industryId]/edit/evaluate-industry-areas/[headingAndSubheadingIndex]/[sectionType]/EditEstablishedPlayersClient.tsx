'use client';

import MarkdownEditor from '@/components/Markdown/MarkdownEditor';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface EstablishedPlayer {
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

interface EditEstablishedPlayersClientProps {
  industryId: string;
  headingAndSubheadingIndex: string;
  initialPlayers: EstablishedPlayer[];
}

export default function EditEstablishedPlayersClient({ industryId, headingAndSubheadingIndex, initialPlayers }: EditEstablishedPlayersClientProps) {
  const router = useRouter();
  const [players, setPlayers] = useState<EstablishedPlayer[]>(initialPlayers);

  const { postData: saveContent, loading: isSaving } = usePostData<any, any>({
    successMessage: 'Established players updated successfully!',
    errorMessage: 'Failed to update established players. Please try again.',
    redirectPath: `/industry-tariff-report/${industryId}/evaluate-industry-areas/${headingAndSubheadingIndex}`,
  });

  const handleSave = async () => {
    await saveContent(`${getBaseUrl()}/api/industry-tariff-reports/${industryId}/save-json`, {
      section: 'evaluate-industry-areas',
      headingAndSubheadingIndex,
      sectionType: 'established-players',
      data: players,
    });
  };

  const updatePlayerField = (playerIndex: number, field: keyof EstablishedPlayer, value: any) => {
    setPlayers((prev) => prev.map((player, index) => (index === playerIndex ? { ...player, [field]: value } : player)));
  };

  const updatePlayerSubField = (playerIndex: number, section: string, field: string, value: string) => {
    setPlayers((prev) =>
      prev.map((player, index) =>
        index === playerIndex
          ? {
              ...player,
              [section]: {
                ...(player as any)[section],
                [field]: value,
              },
            }
          : player
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
            <h1 className="text-3xl font-bold">Edit Established Players</h1>
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
        {players.map((player, playerIndex) => (
          <div key={playerIndex} className="border rounded-lg p-6 bg-white">
            <h2 className="text-2xl font-bold mb-6">
              {player.companyName} ({player.companyTicker})
            </h2>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={player.companyName}
                  onChange={(e) => updatePlayerField(playerIndex, 'companyName', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Ticker</label>
                <input
                  type="text"
                  value={player.companyTicker}
                  onChange={(e) => updatePlayerField(playerIndex, 'companyTicker', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Company Website</label>
                <input
                  type="url"
                  value={player.companyWebsite}
                  onChange={(e) => updatePlayerField(playerIndex, 'companyWebsite', e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Competitors</label>
                <MarkdownEditor
                  label=""
                  modelValue={player.competitors}
                  placeholder="Enter competitors information..."
                  onUpdate={(value) => updatePlayerField(playerIndex, 'competitors', value || '')}
                  objectId={`competitors-${playerIndex}`}
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
                  modelValue={player.companyDescription}
                  placeholder="Enter company description..."
                  onUpdate={(value) => updatePlayerField(playerIndex, 'companyDescription', value || '')}
                  objectId={`company-description-${playerIndex}`}
                  maxHeight="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">About Management</label>
                <MarkdownEditor
                  label=""
                  modelValue={player.aboutManagement}
                  placeholder="Enter information about management..."
                  onUpdate={(value) => updatePlayerField(playerIndex, 'aboutManagement', value || '')}
                  objectId={`about-management-${playerIndex}`}
                  maxHeight="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Unique Advantage</label>
                <MarkdownEditor
                  label=""
                  modelValue={player.uniqueAdvantage}
                  placeholder="Enter unique advantage..."
                  onUpdate={(value) => updatePlayerField(playerIndex, 'uniqueAdvantage', value || '')}
                  objectId={`unique-advantage-${playerIndex}`}
                  maxHeight="200px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Impact of Tariffs</label>
                <MarkdownEditor
                  label=""
                  modelValue={player.impactOfTariffs}
                  placeholder="Enter impact of tariffs..."
                  onUpdate={(value) => updatePlayerField(playerIndex, 'impactOfTariffs', value || '')}
                  objectId={`impact-tariffs-${playerIndex}`}
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
                      modelValue={player.pastPerformance.revenueGrowth}
                      placeholder="Enter past revenue growth..."
                      onUpdate={(value) => updatePlayerSubField(playerIndex, 'pastPerformance', 'revenueGrowth', value || '')}
                      objectId={`past-revenue-${playerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cost of Revenue</label>
                    <MarkdownEditor
                      label=""
                      modelValue={player.pastPerformance.costOfRevenue}
                      placeholder="Enter past cost of revenue..."
                      onUpdate={(value) => updatePlayerSubField(playerIndex, 'pastPerformance', 'costOfRevenue', value || '')}
                      objectId={`past-cost-${playerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Profitability Growth</label>
                    <MarkdownEditor
                      label=""
                      modelValue={player.pastPerformance.profitabilityGrowth}
                      placeholder="Enter past profitability growth..."
                      onUpdate={(value) => updatePlayerSubField(playerIndex, 'pastPerformance', 'profitabilityGrowth', value || '')}
                      objectId={`past-profit-${playerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ROC Growth</label>
                    <MarkdownEditor
                      label=""
                      modelValue={player.pastPerformance.rocGrowth}
                      placeholder="Enter past ROC growth..."
                      onUpdate={(value) => updatePlayerSubField(playerIndex, 'pastPerformance', 'rocGrowth', value || '')}
                      objectId={`past-roc-${playerIndex}`}
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
                      modelValue={player.futureGrowth.revenueGrowth}
                      placeholder="Enter future revenue growth..."
                      onUpdate={(value) => updatePlayerSubField(playerIndex, 'futureGrowth', 'revenueGrowth', value || '')}
                      objectId={`future-revenue-${playerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cost of Revenue</label>
                    <MarkdownEditor
                      label=""
                      modelValue={player.futureGrowth.costOfRevenue}
                      placeholder="Enter future cost of revenue..."
                      onUpdate={(value) => updatePlayerSubField(playerIndex, 'futureGrowth', 'costOfRevenue', value || '')}
                      objectId={`future-cost-${playerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Profitability Growth</label>
                    <MarkdownEditor
                      label=""
                      modelValue={player.futureGrowth.profitabilityGrowth}
                      placeholder="Enter future profitability growth..."
                      onUpdate={(value) => updatePlayerSubField(playerIndex, 'futureGrowth', 'profitabilityGrowth', value || '')}
                      objectId={`future-profit-${playerIndex}`}
                      maxHeight="200px"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">ROC Growth</label>
                    <MarkdownEditor
                      label=""
                      modelValue={player.futureGrowth.rocGrowth}
                      placeholder="Enter future ROC growth..."
                      onUpdate={(value) => updatePlayerSubField(playerIndex, 'futureGrowth', 'rocGrowth', value || '')}
                      objectId={`future-roc-${playerIndex}`}
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
