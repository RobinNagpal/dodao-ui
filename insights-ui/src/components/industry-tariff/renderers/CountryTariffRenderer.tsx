import React from 'react';
import { CountrySpecificTariff } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';

interface CountryTariffRendererProps {
  countryTariff: CountrySpecificTariff;
  sectionId?: string;
}

/**
 * Renders a CountrySpecificTariff object with styled components
 * This replaces the markdown generation logic from render-tariff-markdown.ts
 */
export const CountryTariffRenderer: React.FC<CountryTariffRendererProps> = ({ countryTariff, sectionId }) => {
  return (
    <div id={sectionId} className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
      {/* Country Name Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold heading-color">{countryTariff.countryName}</h2>
      </div>

      {/* Tariff Details */}
      <div className="p-4">
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(countryTariff.tariffDetails) }} />
      </div>

      {/* Existing Trade Amount and Agreement */}
      <div className="border-t border-gray-700">
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <h3 className="text-base font-medium heading-color">Existing Trade Agreements</h3>
        </div>
        <div className="p-4">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(countryTariff.existingTradeAmountAndAgreement) }} />
        </div>
      </div>

      {/* New Changes */}
      <div className="border-t border-gray-700">
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <h3 className="text-base font-medium heading-color">New Tariff Changes</h3>
        </div>
        <div className="p-4">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(countryTariff.newChanges) }} />
        </div>
      </div>

      {/* Tariff Changes for Industry Sub-Areas */}
      {countryTariff.tariffChangesForIndustrySubArea && countryTariff.tariffChangesForIndustrySubArea.length > 0 && (
        <div className="border-t border-gray-700">
          <div className="bg-gray-800 p-3 border-b border-gray-700">
            <h3 className="text-base font-medium heading-color">Impact on Industry Sub-Areas</h3>
          </div>
          <div className="p-4">
            <ul className="list-disc pl-5 space-y-2">
              {countryTariff.tariffChangesForIndustrySubArea.map((change, index) => (
                <li key={index} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(change) }} />
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Trade Impacted by New Tariff */}
      <div className="border-t border-gray-700">
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <h3 className="text-base font-medium heading-color">Trade Impacted by New Tariff</h3>
        </div>
        <div className="p-4">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(countryTariff.tradeImpactedByNewTariff) }} />
        </div>
      </div>

      {/* Trade Exempted by New Tariff */}
      <div className="border-t border-gray-700">
        <div className="bg-gray-800 p-3 border-b border-gray-700">
          <h3 className="text-base font-medium heading-color">Trade Exempted by New Tariff</h3>
        </div>
        <div className="p-4">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(countryTariff.tradeExemptedByNewTariff) }} />
        </div>
      </div>
    </div>
  );
};
