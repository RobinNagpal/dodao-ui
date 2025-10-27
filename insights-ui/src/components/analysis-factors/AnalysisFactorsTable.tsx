'use client';

import EditAnalysisFactorsModal from '@/components/analysis-factors/EditAnalysisFactorsModal';
import ExportJsonModal from '@/components/analysis-factors/ExportJsonModal';
import UploadJsonModal from '@/components/analysis-factors/UploadJsonModal';
import ViewAnalysisFactorsModal from '@/components/analysis-factors/ViewAnalysisFactorsModal';
import { UpsertAnalysisFactorsRequest } from '@/types/public-equity/analysis-factors-types';
import { SuccessStatus } from '@/types/public-equity/common-types';
import { TickerAnalysisCategory } from '@/types/ticker-typesv1';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { usePutData } from '@dodao/web-core/ui/hooks/fetch/usePutData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState } from 'react';

interface AnalysisFactorsTableProps {
  industryKey: string;
  industrySummary: string;
  subIndustryKey: string;
  subIndustrySummary: string;
}

function getAnalysisFactorPrompt(props: AnalysisFactorsTableProps) {
  const { industryKey, industrySummary, subIndustryKey, subIndustrySummary } = props;

  return `
You are an equity analyst specializing in ${industryKey}. Using the JSON schema below as a template, produce an updated version tailored to **${subIndustryKey}**.

## About the industry and sub-industry
- ${industryKey}: ${industrySummary}
- ${subIndustryKey}: ${subIndustrySummary}

## Output rules
- Keep the top-level \`industryKey: "${industryKey}"\` and replace \`subIndustryKey\` with \`"${subIndustryKey}"\`.
- Preserve the **same category keys**. Within each category, provide **5 factors** that are **distinct, ${subIndustryKey} specific , and non-overlapping**.
- For each factor, return:
  - \`factorAnalysisKey\` (ALL_CAPS_SNAKE_CASE, concise,  ${industryKey} - ${subIndustryKey} specific)
  - \`factorAnalysisTitle\` (A clear, simple title in Title Case (max 6 words). It must be easily understood by a retail investor)
  - \`factorAnalysisDescription\` (2–3 sentences explaining the factor in plain English. Describe what it is and why it matters to an investor, ${industryKey} - ${subIndustryKey} context only)
  - \`factorAnalysisMetrics\` (A comma-separated list of 4–7 measurable and commonly available metrics. Prioritize well-known financial ratios (e.g., P/E Ratio, Revenue Growth %, Debt-to-Equity) and tangible operational numbers (e.g., Customer Growth Rate, Number of Stores). A retail investor should be able to find these metrics on a standard financial website or in the company's reports. They should be specific to the industry and sub-industry. 
- **No commentary outside the JSON**. Return **valid JSON only**.

Category keys can be one of - BusinessAndMoat, FinancialStatementAnalysis, PastPerformance, FutureGrowth, FairValue.

## Simplicity & Data Availability Guardrails

* **Be specific but simple.** Each factor should hinge on **one plain idea** that a retail investor can grasp without jargon.
* **Use only data a retail investor can easily get** from: company filings (10-K/20-F/10-Q), earnings releases, investor presentations, annual reports, MD&A, exchange filings, and mainstream finance sites (e.g., Yahoo/Google Finance, company IR pages).
* **Avoid** metrics that typically require **proprietary/paid or alternative datasets** (e.g., detailed swipe-data market share, geolocation footfall, web-scraped user panels, custom survey indices).
* **No custom/composite scores** (e.g., “Adjusted Competitive Moat Score”), **no complex models**, and **no equations**. Keep to standard ratios and plainly reported KPIs.
* If an industry KPI (e.g., market share, NPS, churn) is **not commonly reported**, **replace it with a practical proxy** that is widely available (e.g., **gross margin trend, unit growth, price increases**, backlog growth).
* Use straightforward periods: **TTM, YoY, 3Y/5Y CAGR, last 8 quarters**.
* When comparisons are needed, phrase them so an investor can **manually benchmark** against **top peers** or **sector median** using public data (do not require niche datasets).
* In \`factorAnalysisMetrics\`, list **metric names only** (no formulas, no “vs peers” text), separated by commas, using **standard labels** (e.g., Gross Margin %, ROIC %, Net Debt/EBITDA, FCF Yield %, Inventory Turnover).
* **Expand acronyms once** in the description if used, then use the acronym.

Category keys can be one of - BusinessAndMoat, FinancialStatementAnalysis, PastPerformance, FutureGrowth, FairValue.

Return the JSON below in the sequence of category keys mentioned above.


## Other important notes

* Each factor should be specific to that category only under which you return the factors.
* There should be no duplicate factors in two different categories.
* Make sure the factors are the most important and relevant to the industry and sub-industry, and the category.
* You need to return the factors for each category in the sequence mentioned above. Return 5 factors for all 5 categories.
* Respect the output JSON schema.

# Category-specific guardrails

## Notes for FinancialStatementAnalysis category
* Anchor each factor in a **basic financial concept** that is commonly reported and easy to find (e.g., margins, returns, leverage, cash conversion, efficiency).
* Frame the factor so it reflects **how ${industryKey} - ${subIndustryKey} companies make money** and manage costs/working capital.
* Prefer metrics like: **Revenue Growth %, Gross/Operating/Net Margin %, ROIC %, ROE %, Net Debt/EBITDA, Interest Coverage, Operating Cash Flow, FCF, Cash Conversion Cycle, Inventory Turnover/Days, Receivables/Payables Days.**

## Notes for PastPerformance category
* Evaluate **historical performance** using **reported financials and stock data** over **3–5 years (or last 8 quarters)**.
* Prefer metrics like: **3Y/5Y Revenue CAGR, EPS CAGR, Operating Margin Trend (bps), FCF Trend, Dividend Growth %, Share Count Change %, Total Shareholder Return (TSR) %, Volatility vs Sector, Drawdowns vs Benchmark**.

## Notes for BusinessAndMoat category
* Assess **competitive advantages** using **observable, reported indicators** rather than subjective notions.
* Only include market share/NPS/retention **if commonly reported**; otherwise use robust proxies (e.g., **pricing power via gross margin stability, unit economics, repeat purchase/ARPU if disclosed, contract length/backlog**).
* Prefer metrics like: **Gross Margin Stability (bps YoY), Price Increase Announcements, Contract Renewal Rate %, Backlog/Book-to-Bill, Unit Economics (ARPU, Contribution Margin), Store/Unit Count, Same-Store/Like-for-Like Growth %.**

## Notes for FutureGrowth category
* Focus on **near-term, disclosed growth drivers** (e.g., store openings, capacity adds, backlog/pipeline, booked ARR, product launches, geographic expansion, capex plans).
* Prefer metrics like: **Guided Revenue Growth %, Next FY EPS Growth %, Backlog Growth %, Net New Stores/Units, Book-to-Bill, Capex as % of Sales, R&D as % of Sales, ARR Growth %** (only if commonly reported in the sub-industry; otherwise use revenue/EPS guidance).

## Notes for FairValue category
* Emphasize **simple, observable valuation checks** that favor **undervalued** names using **multiples and yields** over complex DCFs.
* Prefer metrics like: **P/E (TTM & NTM), EV/EBITDA, EV/Sales (if early-stage), P/B, FCF Yield %, Dividend Yield %, PEG Ratio** and **comparison to peer median and the company’s 3Y/5Y history**.
* Design the factors so that **undervalued companies pass 4–5**, fairly valued pass **2–3**, and overvalued pass **0–1**—using the above **simple, public metrics**.



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
          "enum": ["BusinessAndMoat", "FinancialStatementAnalysis", "PastPerformance", "FutureGrowth", "FairValue"]
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
export default function AnalysisFactorsTable(props: AnalysisFactorsTableProps) {
  const { industryKey, subIndustryKey } = props;
  const [analysisFactorsToEdit, setAnalysisFactorsToEdit] = useState<UpsertAnalysisFactorsRequest | null>(null);
  const [analysisFactorsToView, setAnalysisFactorsToView] = useState<UpsertAnalysisFactorsRequest | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isPromptAccordionOpen, setIsPromptAccordionOpen] = useState(false);

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
              {industryKey} → {subIndustryKey}
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
          <>
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

            {/* Prompt Accordion for when analysis factors exist */}
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4cursor-pointer" onClick={() => setIsPromptAccordionOpen(!isPromptAccordionOpen)}>
                <div className="flex items-center p-4">
                  <span className="font-bold text-lg">Analysis Factor Prompt</span>
                </div>
                <div className={`transform transition-transform duration-200 ${isPromptAccordionOpen ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {isPromptAccordionOpen && (
                <div className="p-4 border-t border-gray-200">
                  <p className="mb-2">Use the prompt below to generate analysis factors for this industry and sub-industry:</p>
                  <pre className="text-xs whitespace-pre-wrap text-left overflow-auto p-4 border border-gray-300 rounded">{getAnalysisFactorPrompt(props)}</pre>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }} className="mt-4">
              <thead>
                <tr style={{ fontWeight: 'bold' }} className="text-color">
                  <th style={{ ...tableCellStyle, padding: '14px 16px' }}>Category</th>
                  <th style={{ ...tableCellStyle, padding: '14px 16px' }}>Factors</th>
                  <th style={{ ...tableCellStyle, padding: '14px 16px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td colSpan={3} style={{ padding: '24px' }}>
                    <div style={{ textAlign: 'left' }}>
                      <p className="mb-4 font-italic">No analysis factors configured for this industry and sub-industry combination.</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Prompt Accordion for when no analysis factors exist */}
            <div className="mt-6 border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setIsPromptAccordionOpen(!isPromptAccordionOpen)}>
                <div className="flex items-center">
                  <span className="font-medium">Analysis Factor Prompt</span>
                </div>
                <div className={`transform transition-transform duration-200 ${isPromptAccordionOpen ? 'rotate-180' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {isPromptAccordionOpen && (
                <div className="p-4 border-t border-gray-200">
                  <p className="mb-2">Please copy the prompt below to find analysis factors for this industry and sub-industry:</p>
                  <pre className="text-xs whitespace-pre-wrap text-left overflow-auto p-4  border border-gray-300 rounded">
                    {getAnalysisFactorPrompt(props)}
                  </pre>
                </div>
              )}
            </div>
          </>
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
            title={`Analysis Factors - ${industryKey} → ${subIndustryKey}`}
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
