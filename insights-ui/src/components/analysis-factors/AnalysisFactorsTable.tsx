'use client';

import EditAnalysisFactorsModal from '@/components/analysis-factors/EditAnalysisFactorsModal';
import ViewAnalysisFactorsModal from '@/components/analysis-factors/ViewAnalysisFactorsModal';
import UploadJsonModal from '@/components/analysis-factors/UploadJsonModal';
import { getIndustryDisplayName, getSubIndustryDisplayName, IndustryKey, SubIndustryKey, TickerAnalysisCategory } from '@/lib/mappingsV1';
import { GetAnalysisFactorsResponse } from '@/types/public-equity/analysis-factors-types';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import { useDeleteData } from '@dodao/web-core/ui/hooks/fetch/useDeleteData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState } from 'react';

interface AnalysisFactorsTableProps {
  industryKey: IndustryKey;
  subIndustryKey: SubIndustryKey;
}

export default function AnalysisFactorsTable({ industryKey, subIndustryKey }: AnalysisFactorsTableProps) {
  const [analysisFactorsToEdit, setAnalysisFactorsToEdit] = useState<GetAnalysisFactorsResponse | null>(null);
  const [analysisFactorsToView, setAnalysisFactorsToView] = useState<GetAnalysisFactorsResponse | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const {
    data: analysisFactorsData,
    reFetchData: reloadAnalysisFactors,
    error: loadingError,
  } = useFetchData<GetAnalysisFactorsResponse>(
    `${getBaseUrl()}/api/analysis-factors?industryKey=${industryKey}&subIndustryKey=${subIndustryKey}`,
    {
      cache: 'no-cache',
    },
    'Failed to fetch analysis factors'
  );

  const {
    postData: saveAnalysisFactors,
    loading: savingAnalysisFactors,
    error: savingError,
  } = usePostData<{ success: boolean }, GetAnalysisFactorsResponse>({
    successMessage: 'Analysis factors successfully updated',
    errorMessage: 'Failed to save analysis factors',
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
    const defaultAnalysisFactors: GetAnalysisFactorsResponse = {
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
            },
          ],
        },
      ],
    };
    setAnalysisFactorsToEdit(defaultAnalysisFactors);
  };

  const handleSaveAnalysisFactors = async (analysisFactors: GetAnalysisFactorsResponse) => {
    try {
      await saveAnalysisFactors(`${getBaseUrl()}/api/analysis-factors`, analysisFactors);
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
      await deleteAnalysisFactors(`${getBaseUrl()}/api/analysis-factors?industryKey=${industryKey}&subIndustryKey=${subIndustryKey}`);
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
            {(loadingError || savingError || deletingError) && (
              <div className="text-red-500 bg-red-100 border border-red-400 p-2 mb-2 rounded">{loadingError || savingError || deletingError}</div>
            )}
          </div>
          <div className="text-4xl">
            Analysis Factors
            <p className="text-lg text-gray-600 mt-1">
              {getIndustryDisplayName(industryKey)} → {getSubIndustryDisplayName(subIndustryKey)}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outlined" onClick={() => setShowUploadModal(true)} className="mb-4">
              Raw JSON
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
              <tr style={tableRowStyle} className="text-color">
                <th style={tableCellStyle}>Category</th>
                <th style={tableCellStyle}>Factors Count</th>
                <th style={tableCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {analysisFactorsData.categories.map((category) => (
                <tr style={tableRowStyle} key={category.categoryKey}>
                  <td style={tableCellStyle}>{category.categoryKey}</td>
                  <td style={tableCellStyle}>{category.factors.length} factors</td>
                  <td style={tableCellStyle} className="h-full">
                    <div className="flex justify-around h-full">
                      <IconButton onClick={handleEditClick} iconName={IconTypes.Edit} removeBorder={true} loading={savingAnalysisFactors} />
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
              <tr style={tableRowStyle} className="text-color">
                <th style={tableCellStyle}>Category</th>
                <th style={tableCellStyle}>Factors Count</th>
                <th style={tableCellStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>
                  No analysis factors configured for this industry and sub-industry combination.
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
              await handleSaveAnalysisFactors(factors);
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
            title="Write Raw JSON"
            industryKey={industryKey}
            subIndustryKey={subIndustryKey}
            onSave={handleSaveAnalysisFactors}
          />
        )}
      </div>
    </PageWrapper>
  );
}

const tableRowStyle = { padding: '10px', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd' };
const tableCellStyle = { padding: '0px 10px', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' };
