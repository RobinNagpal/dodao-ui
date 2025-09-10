'use client';

import EditAnalysisFactorsModal from '@/components/analysis-factors/EditAnalysisFactorsModal';
import ViewAnalysisFactorsModal from '@/components/analysis-factors/ViewAnalysisFactorsModal';
import UploadJsonModal from '@/components/analysis-factors/UploadJsonModal';
import ExportJsonModal from '@/components/analysis-factors/ExportJsonModal';
import { getIndustryDisplayName, getSubIndustryDisplayName, IndustryKey, SubIndustryKey, TickerAnalysisCategory } from '@/lib/mappingsV1';
import { UpsertAnalysisFactorsRequest } from '@/types/public-equity/analysis-factors-types';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState } from 'react';
import { SuccessStatus } from '@/types/public-equity/common-types';

interface AnalysisFactorsTableProps {
  industryKey: IndustryKey;
  subIndustryKey: SubIndustryKey;
}

function getAnalysisFactorPrompt(industryKey: IndustryKey, subIndustryKey: SubIndustryKey) {
  return `
You are an equity analyst specializing in ${industryKey}. Using the JSON schema below as a template, produce an updated version tailored to **${subIndustryKey}**.

## Output rules
- Keep the top-level \`industryKey: "${industryKey}"\` and replace \`subIndustryKey\` with \`"${subIndustryKey}"\`.
- Preserve the **same category keys**. Within each category, provide **5 factors** that are **distinct, ${subIndustryKey} specific , and non-overlapping**.
- For each factor, return:
  - \`factorAnalysisKey\` (ALL_CAPS_SNAKE_CASE, concise,  ${industryKey} - ${subIndustryKey} specific)
  - \`factorAnalysisTitle\` (clear, title case). Max 6 words.
  - \`factorAnalysisDescription\` (2–3 sentences, ${industryKey} - ${subIndustryKey} context only)
  - \`factorAnalysisMetrics\` (4–7 **measurable** metrics; comma-separated. These metrics should the financial data or ratios which can help make a decision about the factor. For example we have "Weighted Average Lease Term (WALT) years, % of leases with rent escalators, Average annual rent escalator %, Renewal rate %  etc that can be used to measure Lease structure & durability for REITs). They should be specific to the industry and sub-industry. 
- **No commentary outside the JSON**. Return **valid JSON only**.

Category keys can be one of - BusinessAndMoat, FinancialStatementAnalysis, PastPerformance, FutureGrowth, FairValue.


Return the JSON below in the sequence of category keys mentioned above.

## Other important notes
- Each factor should be specific to that category only under which you return the factors.
- There should be no duplicate factors in two different categories.
- Make sure the factors are the most important and relevant to the industry and sub-industry, and the category.
- Below is the example for two categories. You need to return the factors for each category in the sequence mentioned above. Return 5 factors for all 5 categories.
- Respect the output JSON schema.

# Example JSON
{
  "industryKey": "REITS",
  "subIndustryKey": "OFFICE_REITS",
  "categories": [
    {
      "categoryKey": "BusinessAndMoat",
      "factors": [
        {
          "factorAnalysisKey": "DEVELOPMENT_REDEVELOPMENT_EDGE",
          "factorAnalysisTitle": "Development/redevelopment edge",
          "factorAnalysisDescription": "In-house capabilities, entitlement track record, cost control, and historical yield-on-cost.\\nSuperior execution creates internal growth independent of external acquisitions.",
          "factorAnalysisMetrics": "Historical yield-on-cost %, Development pipeline % of total assets, Average development spread vs market cap rates, % of projects delivered on time/budget"
        },
        {
          "factorAnalysisKey": "LEASE_STRUCTURE_DURABILITY",
          "factorAnalysisTitle": "Lease structure & durability",
          "factorAnalysisDescription": "WALT, rent escalators (fixed/CPI), net vs gross, renewal options, and break clauses.\\nLonger terms with escalators hardwire growth and cushion cyclical leasing pressure.",
          "factorAnalysisMetrics": "Weighted Average Lease Term (WALT) years, % of leases with rent escalators, Average annual rent escalator %, Renewal rate %"
        },
        {
          "factorAnalysisKey": "MANAGEMENT_QUALITY_ALIGNMENT",
          "factorAnalysisTitle": "Management quality & alignment",
          "factorAnalysisDescription": "Governance, internal vs external management, capital allocation discipline, and insider ownership.\\nAligned, proven teams protect NAV and compound AFFO across cycles.",
          "factorAnalysisMetrics": "Insider ownership %, 3/5/10-year AFFO growth CAGR %, Dividend payout ratio %, % of debt fixed-rate vs variable"
        },
        {
          "factorAnalysisKey": "PORTFOLIO_QUALITY_LOCATION_MIX",
          "factorAnalysisTitle": "Portfolio quality & location mix",
          "factorAnalysisDescription": "Composition by asset class (A/B/C), CBD vs suburban, gateway vs Sun Belt, and transit access.\\nDrives achievable rents, tenant demand, resilience, and obsolescence/capex risk.",
          "factorAnalysisMetrics": "% of portfolio in Class A assets, Top 5 markets % of NOI, Occupancy rate %, Average rent per sq ft vs market average"
        },
        {
          "factorAnalysisKey": "TENANT_CREDIT_CONCENTRATION",
          "factorAnalysisTitle": "Tenant credit & concentration",
          "factorAnalysisDescription": "Distribution of tenant exposures, top-10 concentration, industries, credit ratings, and guarantees.\\nHigher-quality, diversified tenants reduce cash-flow volatility and default/rollover risk.",
          "factorAnalysisMetrics": "Top 10 tenants % of rent, % investment-grade tenants, Largest tenant % of rent, Tenant retention rate %"
        }
      ]
    },
    {
      "categoryKey": "FinancialStatementAnalysis",
      "factors": [
        {
          "factorAnalysisKey": "CAPEX_LEASING_COSTS_INTENSITY",
          "factorAnalysisTitle": "Capex & leasing costs intensity",
          "factorAnalysisDescription": "Recurring capex, tenant improvements, and leasing commissions relative to NOI.\\nHigh TI/LC burdens suppress true free cash flow if not offset by spreads.",
          "factorAnalysisMetrics": "Tenant Improvement (TI) per square foot (psf), Leasing Commissions (LC) per square foot (psf), Recurring Capex / NOI (%), Free Cash Flow after TI/LC (per share), Spread on new vs expiring leases (%)"
        },
        {
          "factorAnalysisKey": "DIVIDEND_SAFETY_PAYOUT",
          "factorAnalysisTitle": "Dividend safety & payout",
          "factorAnalysisDescription": "Dividend as % of AFFO, policy consistency, and coverage buffers.\\nSustainable payouts lower cut risk and stabilize total returns.",
          "factorAnalysisMetrics": "Dividend Payout Ratio (% of AFFO), AFFO Dividend Coverage (x), Historical Dividend Growth (CAGR, 3–5 years), Dividend Yield (%) vs REIT sector average, Retained AFFO (% reinvested)"
        },
        {
          "factorAnalysisKey": "FFO_AFFO_QUALITY_TRAJECTORY",
          "factorAnalysisTitle": "FFO/AFFO quality & trajectory",
          "factorAnalysisDescription": "Definition, adjustments, recurring add-backs, and growth trend from GAAP to cash metrics.\\nClean, growing AFFO underpins dividend capacity and reinvestment firepower.",
          "factorAnalysisMetrics": "FFO per share (trend YoY), AFFO per share (trend YoY), AFFO Growth Rate (3–5 years), % of FFO adjustments from recurring items (quality check), GAAP Net Income to AFFO reconciliation transparency (score/flag)"
        },
        {
          "factorAnalysisKey": "INTEREST_RATE_MATURITY_PROFILE",
          "factorAnalysisTitle": "Interest-rate & maturity profile",
          "factorAnalysisDescription": "Fixed/floating mix, WA interest rate/maturity, hedges, and near-term maturity wall.\\nMitigates earnings shocks and refinancing risk when rates move.",
          "factorAnalysisMetrics": "Weighted Average Interest Rate (%), Fixed vs Floating Debt Mix (%), Weighted Average Maturity (years), % of Debt Maturing in <2 years, Hedging Coverage Ratio (% of floating debt hedged)"
        },
        {
          "factorAnalysisKey": "LEVERAGE_ASSET_ENCUMBRANCE",
          "factorAnalysisTitle": "Leverage & asset encumbrance",
          "factorAnalysisDescription": "Net Debt/EBITDA, LTV, secured vs unsecured mix, and unencumbered pool size.\\nPrudent leverage and flexibility support credit quality and strategic optionality.",
          "factorAnalysisMetrics": "Net Debt / EBITDA (x), Loan-to-Value (LTV, %), % of Secured Debt vs Unsecured Debt, % of Unencumbered NOI / Assets, Interest Coverage Ratio (EBITDA / Interest Expense)"
        }
      ]
    }]
  }
}

# Schema
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "AnalysisFactors",
  "type": "object",
  "properties": {
    "industryKey": {
      "type": "string",
      "title": "Industry Key",
      "minLength": 3,
      "maxLength": 50
    },
    "subIndustryKey": {
      "type": "string",
      "title": "Sub-Industry Key",
      "minLength": 3,
      "maxLength": 50
    },
    "categories": {
      "type": "array",
      "title": "Analysis Categories",
      "items": {
        "$ref": "#/definitions/CategoryAnalysisFactors"
      }
    }
  },
  "required": ["industryKey", "subIndustryKey", "categories"],
  "definitions": {
    "CategoryAnalysisFactors": {
      "type": "object",
      "properties": {
        "categoryKey": {
          "type": "string",
          "title": "Category Key",
          "enum": ["BusinessAndMoat", "FinancialStatementAnalysis", "PastPerformance", "FutureGrowth", "VsCompetition", "FairValue"]
        },
        "factors": {
          "type": "array",
          "title": "Analysis Factors",
          "items": {
            "$ref": "#/definitions/AnalysisFactorDefinition"
          }
        }
      },
      "required": ["categoryKey", "factors"]
    },
    "AnalysisFactorDefinition": {
      "type": "object",
      "properties": {
        "factorAnalysisKey": {
          "type": "string",
          "title": "Factor Analysis Key",
          "minLength": 3,
          "maxLength": 100
        },
        "factorAnalysisTitle": {
          "type": "string",
          "title": "Factor Analysis Title",
          "minLength": 3,
          "maxLength": 200
        },
        "factorAnalysisDescription": {
          "type": "string",
          "title": "Factor Analysis Description",
          "minLength": 10,
          "maxLength": 1000
        },
        "factorAnalysisMetrics": {
          "type": "string",
          "title": "Factor Analysis Metrics",
          "minLength": 3,
          "maxLength": 1000
        }
      },
      "required": ["factorAnalysisKey", "factorAnalysisTitle", "factorAnalysisDescription"]
    }
  }
}

  `;
}
export default function AnalysisFactorsTable({ industryKey, subIndustryKey }: AnalysisFactorsTableProps) {
  const [analysisFactorsToEdit, setAnalysisFactorsToEdit] = useState<UpsertAnalysisFactorsRequest | null>(null);
  const [analysisFactorsToView, setAnalysisFactorsToView] = useState<UpsertAnalysisFactorsRequest | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const {
    data: analysisFactorsData,
    reFetchData: reloadAnalysisFactors,
    error: loadingError,
  } = useFetchData<UpsertAnalysisFactorsRequest>(
    `${getBaseUrl()}/api/analysis-factors/${industryKey}/${subIndustryKey}`,
    {
      cache: 'no-cache',
    },
    'Failed to fetch analysis factors'
  );

  const {
    postData: saveAnalysisFactors,
    loading: savingAnalysisFactors,
    error: savingError,
  } = usePostData<SuccessStatus, UpsertAnalysisFactorsRequest>({
    successMessage: 'Analysis factors successfully created',
    errorMessage: 'Failed to save analysis factors',
  });

  const {
    putData: updateAnalysisFactors,
    loading: updatingAnalysisFactors,
    error: updatingError,
  } = usePutData<SuccessStatus, UpsertAnalysisFactorsRequest>({
    successMessage: 'Analysis factors successfully updated',
    errorMessage: 'Failed to update analysis factors',
  });

  const {
    deleteData: deleteAnalysisFactors,
    loading: deletingAnalysisFactors,
    error: deletingError,
  } = useDeleteData({
    successMessage: 'Analysis factors successfully deleted',
    errorMessage: 'Failed to delete analysis factors',
  });

  if (!analysisFactorsData) {
    return (
      <PageWrapper>
        <FullPageLoader />
      </PageWrapper>
    );
  }

  const hasData = analysisFactorsData.categories && analysisFactorsData.categories.length > 0;

  const handleEditClick = () => {
    setAnalysisFactorsToEdit(analysisFactorsData);
  };

  const handleViewClick = () => {
    setAnalysisFactorsToView(analysisFactorsData);
  };

  const handleCreateNew = () => {
    // Create default structure for new analysis factors
    const defaultAnalysisFactors: UpsertAnalysisFactorsRequest = {
      industryKey,
      subIndustryKey,
      categories: [
        {
          categoryKey: TickerAnalysisCategory.BusinessAndMoat,
          factors: [
            {
              factorAnalysisKey: 'SAMPLE_FACTOR',
              factorAnalysisTitle: 'Sample Analysis Factor',
              factorAnalysisDescription: 'This is a sample analysis factor. Please update with your specific requirements.',
              factorAnalysisMetrics: 'Optional metrics for now',
            },
          ],
        },
      ],
    };
    setAnalysisFactorsToEdit(defaultAnalysisFactors);
  };

  const handleSaveAnalysisFactors = async (analysisFactors: UpsertAnalysisFactorsRequest, isUpdate: boolean = false) => {
    try {
      if (isUpdate) {
        // Use PUT for updates (when data already exists)
        await updateAnalysisFactors(`${getBaseUrl()}/api/analysis-factors/${industryKey}/${subIndustryKey}`, analysisFactors);
      } else {
        // Use POST for new data
        await saveAnalysisFactors(`${getBaseUrl()}/api/analysis-factors/${industryKey}/${subIndustryKey}`, analysisFactors);
      }
      await reloadAnalysisFactors();
    } catch (error) {
      console.error('Failed to save analysis factors:', error);
      throw error; // Re-throw to let the UI handle the error display
    }
  };

  const handleDeleteAll = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAnalysisFactors(`${getBaseUrl()}/api/analysis-factors/${industryKey}/${subIndustryKey}`);
      setShowConfirmModal(false);
      await reloadAnalysisFactors();
    } catch (error) {
      console.error('Failed to delete analysis factors:', error);
      setShowConfirmModal(false);
    }
  };

  return (
    <PageWrapper>
      <div>
        {/* Header */}
        <div className="flex justify-between">
          <div>
            {(loadingError || savingError || updatingError || deletingError) && (
              <div className="text-red-500 bg-red-100 border border-red-400 p-2 mb-2 rounded">
                {loadingError || savingError || updatingError || deletingError}
              </div>
            )}
          </div>
          <div className="text-4xl">
            Analysis Factors
            <p className="text-lg text-gray-600 mt-1">
              {getIndustryDisplayName(industryKey)} → {getSubIndustryDisplayName(subIndustryKey)}
            </p>
          </div>
          <div className="flex space-x-2">
            {hasData && (
              <Button variant="outlined" onClick={() => setShowExportModal(true)} className="mb-4">
                Export JSON
              </Button>
            )}
            <Button variant="outlined" onClick={() => setShowUploadModal(true)} className="mb-4">
              Add New with JSON
            </Button>
            {hasData ? (
              <Button variant="contained" onClick={handleEditClick} className="mb-4" primary>
                Edit Factors
              </Button>
            ) : (
              <Button variant="contained" onClick={handleCreateNew} className="mb-4" primary>
                Create New
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        {hasData ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }} className="mt-4">
            <thead>
              <tr style={{ fontWeight: 'bold' }} className="text-color">
                <th style={{ ...tableCellStyle, padding: '14px 16px' }}>Category</th>
                <th style={{ ...tableCellStyle, padding: '14px 16px' }}>Factors</th>
                <th style={{ ...tableCellStyle, padding: '14px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {analysisFactorsData.categories.map((category, index) => (
                <tr key={category.categoryKey} style={{ borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd' }}>
                  <td style={tableCellStyle}>{category.categoryKey}</td>
                  <td>
                    {category.factors.map((f, i, arr) => (
                      <div style={getRowStyle(i, i === 0, i === arr.length - 1)} className="text-sm" key={f.factorAnalysisKey}>
                        <span className="inline-block rounded-full px-1 py-0.5 text-xs mr-1">{i + 1}</span>
                        <b>{f.factorAnalysisTitle}</b>
                        <div className="pl-4">{f.factorAnalysisDescription}.</div>
                        <pre className="pl-4 break-words text-xs whitespace-pre-wrap">Metrics - {f.factorAnalysisMetrics}</pre>
                      </div>
                    ))}
                  </td>
                  <td style={tableCellStyle} className="h-full">
                    <div className="flex justify-around h-full">
                      <IconButton
                        onClick={handleEditClick}
                        iconName={IconTypes.Edit}
                        removeBorder={true}
                        loading={savingAnalysisFactors || updatingAnalysisFactors}
                      />
                      <IconButton onClick={handleViewClick} iconName={IconTypes.ArrowsPointingOutIcon} removeBorder={true} />
                      <IconButton onClick={handleDeleteAll} iconName={IconTypes.Trash} removeBorder={true} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }} className="mt-4">
            <thead>
              <tr style={{ fontWeight: 'bold' }} className="text-color">
                <th style={{ ...tableCellStyle, padding: '14px 16px' }}>Category</th>
                <th style={{ ...tableCellStyle, padding: '14px 16px' }}>Factors</th>
                <th style={{ ...tableCellStyle, padding: '14px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="hover:bg-gray-900">
                <td colSpan={3} style={{ padding: '24px' }}>
                  <div style={{ textAlign: 'left' }}>
                    <p className="mb-4 font-italic">No analysis factors configured for this industry and sub-industry combination.</p>
                    <p className="mb-2">Please copy the prompt below to find analysis factors for this industry and sub-industry:</p>
                    <pre className="text-xs whitespace-pre-wrap text-left overflow-auto p-4  border border-gray-300 rounded">
                      {getAnalysisFactorPrompt(industryKey, subIndustryKey)}
                    </pre>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}

        {/* Edit Modal */}
        {analysisFactorsToEdit && (
          <EditAnalysisFactorsModal
            open={!!analysisFactorsToEdit}
            onClose={() => setAnalysisFactorsToEdit(null)}
            title={hasData ? 'Edit Analysis Factors' : 'Create Analysis Factors'}
            analysisFactorsData={analysisFactorsToEdit}
            onSave={async (factors) => {
              setAnalysisFactorsToEdit(null);
              await handleSaveAnalysisFactors(factors, hasData); // Pass hasData to indicate if this is an update
            }}
          />
        )}

        {/* View Modal */}
        {analysisFactorsToView && (
          <ViewAnalysisFactorsModal
            open={!!analysisFactorsToView}
            onClose={() => setAnalysisFactorsToView(null)}
            title={`Analysis Factors - ${getIndustryDisplayName(industryKey)} → ${getSubIndustryDisplayName(subIndustryKey)}`}
            analysisFactors={analysisFactorsToView}
          />
        )}

        {/* Delete Confirmation Modal */}
        {showConfirmModal && (
          <ConfirmationModal
            open={showConfirmModal}
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleConfirmDelete}
            confirming={deletingAnalysisFactors}
            title="Delete All Analysis Factors"
            confirmationText="Are you sure you want to delete all analysis factors for this industry and sub-industry?"
            askForTextInput={true}
          />
        )}

        {/* Upload JSON Modal */}
        {showUploadModal && (
          <UploadJsonModal
            open={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            title="Add New with JSON"
            industryKey={industryKey}
            subIndustryKey={subIndustryKey}
            onSave={(analysisFactors) => handleSaveAnalysisFactors(analysisFactors, true)} // Always update for JSON upload
          />
        )}

        {/* Export JSON Modal */}
        {showExportModal && analysisFactorsData && (
          <ExportJsonModal open={showExportModal} onClose={() => setShowExportModal(false)} title="Export JSON" analysisFactors={analysisFactorsData} />
        )}
      </div>
    </PageWrapper>
  );
}

// Base styles for table elements
const tableCellStyle = {
  padding: '12px 16px',
  borderLeft: '1px solid #ddd',
  borderRight: '1px solid #ddd',
  verticalAlign: 'top',
};

// Function to get row style based on index for alternating colors
const getRowStyle = (index: number, isFirst: boolean = false, isLast: boolean = false) => {
  const baseStyle = {
    padding: '3px 3px',
    marginBottom: isLast ? '0' : '8px',
  };

  return index % 2 === 0 ? { ...baseStyle, backgroundColor: '#272641' } : { ...baseStyle, backgroundColor: '#1e202d' };
};
