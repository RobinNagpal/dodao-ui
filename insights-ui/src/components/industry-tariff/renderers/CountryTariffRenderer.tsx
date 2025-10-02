import React from 'react';
import { CountrySpecificTariff, AllCountriesSpecificTariff } from '@/scripts/industry-tariff-reports/tariff-types';
import { parseMarkdown } from '@/util/parse-markdown';

interface CountryTariffRendererProps {
  countryTariff: CountrySpecificTariff | AllCountriesSpecificTariff;
  sectionId?: string;
  isAllCountries?: boolean;
}

/**
 * Renders a CountrySpecificTariff object with styled components
 * This replaces the markdown generation logic from render-tariff-markdown.ts
 */
export const CountryTariffRenderer: React.FC<CountryTariffRendererProps> = ({ countryTariff, sectionId, isAllCountries = false }) => {
  return (
    <div id={sectionId} className="bg-gray-900 rounded-lg shadow-sm overflow-hidden">
      {/* Country Name Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold heading-color">{countryTariff.countryName}</h2>
      </div>

      {isAllCountries ? (
        // Render for All Countries Tariff Updates (new structure)
        <>
          {/* Trade Volume */}
          <div className="p-4">
            <div className="bg-gray-800 p-3 mb-3 border-b border-gray-700">
              <h3 className="text-base font-medium heading-color">Trade Volume</h3>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown((countryTariff as AllCountriesSpecificTariff).tradeVolume) }} />
          </div>

          {/* Tariffs Before Trump */}
          <div className="border-t border-gray-700">
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h3 className="text-base font-medium heading-color">Tariffs Before Trump Administration</h3>
            </div>
            <div className="p-4">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: parseMarkdown((countryTariff as AllCountriesSpecificTariff).tariffBeforeTrump) }}
              />
            </div>
          </div>

          {/* New Tariff Updates */}
          <div className="border-t border-gray-700">
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h3 className="text-base font-medium heading-color">New Tariff Updates</h3>
            </div>
            <div className="p-4">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: parseMarkdown((countryTariff as AllCountriesSpecificTariff).newTariffUpdates) }}
              />
            </div>
          </div>

          {/* Effective Date */}
          <div className="border-t border-gray-700">
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h3 className="text-base font-medium heading-color">Effective Date</h3>
            </div>
            <div className="p-4">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: parseMarkdown((countryTariff as AllCountriesSpecificTariff).effectiveDate) }}
              />
            </div>
          </div>

          {/* Sources */}
          <div className="border-t border-gray-700">
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h3 className="text-base font-medium heading-color">Sources</h3>
            </div>
            <div className="p-4">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown((countryTariff as AllCountriesSpecificTariff).source) }} />
            </div>
          </div>
        </>
      ) : (
        // Render for Regular Tariff Updates (original structure)
        <>
          {/* Tariff Details */}
          <div className="p-4">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown((countryTariff as CountrySpecificTariff).tariffDetails) }} />
          </div>

          {/* Existing Trade Amount and Agreement */}
          <div className="border-t border-gray-700">
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h3 className="text-base font-medium heading-color">Existing Trade Agreements</h3>
            </div>
            <div className="p-4">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: parseMarkdown((countryTariff as CountrySpecificTariff).existingTradeAmountAndAgreement) }}
              />
            </div>
          </div>

          {/* New Changes */}
          <div className="border-t border-gray-700">
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h3 className="text-base font-medium heading-color">New Tariff Changes</h3>
            </div>
            <div className="p-4">
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown((countryTariff as CountrySpecificTariff).newChanges) }} />
            </div>
          </div>

          {/* Trade Impacted by New Tariff */}
          <div className="border-t border-gray-700">
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h3 className="text-base font-medium heading-color">Trade Impacted by New Tariff</h3>
            </div>
            <div className="p-4">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: parseMarkdown((countryTariff as CountrySpecificTariff).tradeImpactedByNewTariff) }}
              />
            </div>
          </div>

          {/* Trade Exempted by New Tariff */}
          <div className="border-t border-gray-700">
            <div className="bg-gray-800 p-3 border-b border-gray-700">
              <h3 className="text-base font-medium heading-color">Trade Exempted by New Tariff</h3>
            </div>
            <div className="p-4">
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: parseMarkdown((countryTariff as CountrySpecificTariff).tradeExemptedByNewTariff) }}
              />
            </div>
          </div>

          {/* Tariff Changes for Industry Sub-Areas */}
          {(countryTariff as CountrySpecificTariff).tariffChangesForIndustrySubArea &&
            (countryTariff as CountrySpecificTariff).tariffChangesForIndustrySubArea.length > 0 && (
              <div className="border-t border-gray-700">
                <div className="bg-gray-800 p-3 border-b border-gray-700">
                  <h3 className="text-base font-medium heading-color">Impact on Industry Sub-Areas</h3>
                </div>
                <div className="p-4">
                  <ul className="list-disc pl-5 space-y-2">
                    {(countryTariff as CountrySpecificTariff).tariffChangesForIndustrySubArea.map((change, index) => (
                      <li key={index} className="prose max-w-none" dangerouslySetInnerHTML={{ __html: parseMarkdown(change) }} />
                    ))}
                  </ul>
                </div>
              </div>
            )}
        </>
      )}
    </div>
  );
};
