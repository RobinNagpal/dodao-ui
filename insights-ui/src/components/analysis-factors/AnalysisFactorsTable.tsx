'use client';

import EditAnalysisFactorsModal from '@/components/analysis-factors/EditAnalysisFactorsModal';
import ViewAnalysisFactorsModal from '@/components/analysis-factors/ViewAnalysisFactorsModal';
import UploadJsonModal from '@/components/analysis-factors/UploadJsonModal';
import ExportJsonModal from '@/components/analysis-factors/ExportJsonModal';
import { TickerAnalysisCategory } from '@/lib/mappingsV1';
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
- You need to return the factors for each category in the sequence mentioned above. Return 5 factors for all 5 categories.
- Respect the output JSON schema.

# Notes for BusinessAndMoat category
- The business and moat factors should be such that they consider the superiority of the business and moat as compared to the competitors in the same industry and sub-industry. 
- Only business who have a real advantage over others should be able to get pass on all the  five factors, so design the factors in such a way that it evaluates the business and moat vs the competitors in the same industry and sub-industry.

# Notes for FairValue category
- The fair value factors should be such that they consider the fair value of the company as compared to the competitors in the same industry and sub-industry.
- Design the factors in such a way that only the undervalued companies can get pass on all the 5 or 4 factors, the fair value get 3 or 2 and over values gets 1 pass. So design the factors in such a way that it evaluates the fair value of the company vs the competitors in the same industry and sub-industry.


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
