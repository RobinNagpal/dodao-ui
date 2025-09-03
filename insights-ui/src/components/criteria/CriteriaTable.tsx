'use client';

import EditCriterionModal from '@/components/criteria/EditCriterionModal';
import ViewCriterionModal from '@/components/criteria/ViewCriterionModal';
import { CriterionDefinition, IndustryGroupCriteriaDefinition } from '@/types/public-equity/criteria-types';
import { UpsertCustomCriteriaRequest } from '@/types/public-equity/ticker-request-response';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import FullPageLoader from '@dodao/web-core/components/core/loaders/FullPageLoading';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { useFetchData } from '@dodao/web-core/ui/hooks/fetch/useFetchData';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import React, { useState } from 'react';

interface CriteriaTableProps {
  sectorSlug: string;
  industryGroupSlug: string;
}

const NEW_CRITERION_KEY = 'new-criterion';
export default function CriteriaTable({ sectorSlug, industryGroupSlug }: CriteriaTableProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [criterionToDelete, setCriterionToDelete] = useState<CriterionDefinition | null>(null);
  const [criterionToEdit, setCriterionToEdit] = useState<CriterionDefinition | null>();
  const [criterionToView, setCriterionToView] = useState<CriterionDefinition | null>(null);

  const {
    data: industryGroupCriteria,
    reFetchData: reloadIndustryGroupCriteria,
    error: loadingError,
  } = useFetchData<IndustryGroupCriteriaDefinition>(
    `https://dodao-ai-insights-agent.s3.us-east-1.amazonaws.com/public-equities/US/gics/${sectorSlug}/${industryGroupSlug}/custom-criteria.json`,
    {
      cache: 'no-cache',
    },
    'Failed to fetch custom criteria'
  );

  const {
    postData,
    loading: savingCriteria,
    error: savingError,
  } = usePostData<IndustryGroupCriteriaDefinition, UpsertCustomCriteriaRequest>({
    successMessage: 'Criteria successfully updated',
    errorMessage: 'Failed to upsert custom criteria',
  });

  const handleDeleteClick = (criterion: CriterionDefinition) => {
    setCriterionToDelete(criterion);
    setShowConfirmModal(true);
  };

  const criteria = industryGroupCriteria?.criteria;

  if (!criteria) {
    return (
      <PageWrapper>
        <FullPageLoader />
      </PageWrapper>
    );
  }

  const handleConfirmDelete = async () => {
    if (!criterionToDelete) return;

    const updatedCriterion = industryGroupCriteria?.criteria.filter((c) => c.key !== criterionToDelete.key);
    await postData(`${getBaseUrl()}/api/custom-criteria`, {
      industryGroupId: industryGroupCriteria.selectedIndustryGroup.id,
      sectorId: industryGroupCriteria?.selectedSector.id,
      criteria: updatedCriterion,
    });

    setShowConfirmModal(false);
    setCriterionToDelete(null);
    await reloadIndustryGroupCriteria();
  };

  const handleUpsertCustomCriterion = async (criterionDefinition: CriterionDefinition) => {
    // Edit existing criterion
    if (criteria.find((c) => c.key === criterionDefinition.key)) {
      const updatedCriterion: CriterionDefinition[] = criteria.map((c) => {
        if (c.key === criterionDefinition.key) {
          return { ...criterionDefinition };
        }
        return c;
      });

      await postData(`${getBaseUrl()}/api/custom-criteria`, {
        industryGroupId: industryGroupCriteria.selectedIndustryGroup.id,
        sectorId: industryGroupCriteria?.selectedSector.id,
        criteria: updatedCriterion,
      });
    } else {
      // Add new criterion
      const updatedCriterion: CriterionDefinition[] = [...criteria, criterionDefinition];

      await postData(`${getBaseUrl()}/api/custom-criteria`, {
        industryGroupId: industryGroupCriteria.selectedIndustryGroup.id,
        sectorId: industryGroupCriteria?.selectedSector.id,
        criteria: updatedCriterion,
      });
    }

    await reloadIndustryGroupCriteria();
  };

  const addNewCriterion = async () => {
    const newCriteriaDefinition: CriterionDefinition = {
      key: NEW_CRITERION_KEY,
      name: 'New Criterion Name',
      shortDescription: 'Description of the new criterion',
      matchingInstruction: 'Instruction to be used for matching attachments and management notes',
      importantMetrics: [],
      reports: [],
    };
    setCriterionToEdit(newCriteriaDefinition);
  };
  return (
    <PageWrapper>
      <div className="flex justify-between">
        <div>
          {(loadingError || savingError) && <div className="text-red-500 bg-red-100 border border-red-400 p-2 mb-2 rounded">{loadingError || savingError}</div>}
        </div>
        <div className="text-4xl">Custom Criteria</div>
        <Button variant="contained" onClick={() => addNewCriterion()} className="mb-4" primary>
          Add Criterion
        </Button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }} className="mt-4">
        <thead>
          <tr style={tableRowStyle} className="text-color">
            <th style={tableCellStyle}>Key</th>
            <th style={tableCellStyle}>Name</th>
            <th style={tableCellStyle}>Short Description</th>
            <th style={tableCellStyle}>Matching Instruction</th>
            <th style={tableCellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {criteria.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '10px', fontStyle: 'italic' }}>
                No criteria added yet.
              </td>
            </tr>
          ) : (
            criteria.map((criterion) => (
              <tr style={tableRowStyle} key={criterion.key}>
                <td style={tableCellStyle}>{criterion.key}</td>
                <td style={tableCellStyle}>{criterion.name}</td>
                <td style={tableCellStyle}>{criterion.shortDescription}</td>
                <td style={tableCellStyle}>{criterion.matchingInstruction}</td>
                <td style={tableCellStyle} className="h-full">
                  <div className="flex justify-around h-full">
                    <IconButton
                      onClick={() => {
                        setCriterionToEdit(criterion);
                      }}
                      iconName={IconTypes.Edit}
                      removeBorder={true}
                      loading={criterionToEdit?.key === criterion.key && savingCriteria}
                    />
                    <IconButton onClick={() => handleDeleteClick(criterion)} iconName={IconTypes.Trash} removeBorder={true} />
                    <IconButton onClick={() => setCriterionToView(criterion)} iconName={IconTypes.ArrowsPointingOutIcon} removeBorder={true} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {criterionToEdit && (
        <EditCriterionModal
          open={!!criterionToEdit}
          onClose={() => {
            setCriterionToEdit(null);
          }}
          title={criterionToEdit.key === NEW_CRITERION_KEY ? 'Add Criterion' : 'Edit Criterion'}
          onSave={async (criterion) => {
            setCriterionToEdit(null);
            await handleUpsertCustomCriterion(criterion);
            await reloadIndustryGroupCriteria();
          }}
          criterionDefinition={criterionToEdit}
        />
      )}

      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          confirming={savingCriteria}
          title="Delete Criterion"
          confirmationText="Are you sure you want to delete this criterion?"
          askForTextInput={true}
        />
      )}
      {criterionToView && (
        <ViewCriterionModal
          open={!!criterionToEdit}
          onClose={() => setCriterionToView(null)}
          title={'View Criterion - ' + criterionToView.name}
          criterion={criterionToView}
        />
      )}
    </PageWrapper>
  );
}

const tableRowStyle = { padding: '10px', borderTop: '1px solid #ddd', borderBottom: '1px solid #ddd' };
const tableCellStyle = { padding: '0px 10px', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' };
