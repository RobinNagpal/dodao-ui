'use client';

import { IndustryGroupCriteriaDefinition, CriterionDefinition } from '@/types/public-equity/criteria-types';
import { CreateCustomCriteriaRequestWithCriteria } from '@/types/public-equity/ticker-request-response';
import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import ConfirmationModal from '@dodao/web-core/components/app/Modal/ConfirmationModal';
import React, { useEffect, useRef, useState } from 'react';
import ReactJson from 'react-json-view';
import Ajv, { ErrorObject } from 'ajv';
import schema from './insdustryGroupCriteriaJsonSchema.json';
import { usePostData } from '@dodao/web-core/ui/hooks/fetch/usePostData';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';
import { Form } from '@/components/rjsf';
import { RJSFSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import Head from 'next/head';
interface CriteriaTableProps {
  sectorId: number;
  industryGroupId: number;
  customCriteria?: IndustryGroupCriteriaDefinition;
}

export default function CriteriaTable({ sectorId, industryGroupId, customCriteria }: CriteriaTableProps) {
  const ajv = new Ajv({ allErrors: true });
  const validate = ajv.compile(schema);

  const [criteria, setCriteria] = useState<CriterionDefinition[]>(customCriteria?.criteria || []);
  const [open, setOpen] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<CriterionDefinition | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validationMessages, setValidationMessages] = useState<string[]>();
  const [pendingUpsert, setPendingUpsert] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [criterionToDelete, setCriterionToDelete] = useState<CriterionDefinition | null>(null);

  // Store the original key before editing
  const originalKeyRef = useRef<string | null>(null);

  // ✅ usePostData for Upsert API Call
  const { postData, loading } = usePostData<{ message: string }, CreateCustomCriteriaRequestWithCriteria>({
    errorMessage: 'Failed to upsert custom criteria',
  });

  const updateSelectedCriterion = (updated: CriterionDefinition) => {
    const valid = validate(updated);
    if (!valid) {
      const errors: ErrorObject[] = validate.errors || [];
      const messages = errors.map((err) => `${err.instancePath || 'root'} ${err.message}`);
      setValidationMessages(messages);
    } else {
      setValidationMessages(undefined);
    }
    setSelectedCriterion(updated);
  };

  const handleOpen = (criterion: CriterionDefinition | null = null) => {
    if (criterion) {
      originalKeyRef.current = criterion.key;
      setSelectedCriterion({ ...criterion });
      setIsEditing(true);
    } else {
      originalKeyRef.current = null;
      setSelectedCriterion({
        key: '',
        name: '',
        shortDescription: '',
        matchingInstruction: '',
        importantMetrics: [],
        reports: [],
      });
      setIsEditing(false);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    if (!selectedCriterion || selectedCriterion.key.trim() === '') {
      alert('Key cannot be empty!');
      return;
    }

    setCriteria((prev) => {
      if (isEditing) {
        return prev.map((c) => (c.key === originalKeyRef.current ? { ...selectedCriterion } : c));
      }

      if (prev.some((c) => c.key === selectedCriterion.key)) {
        alert('Key must be unique!');
        return prev;
      }

      return [...prev, { ...selectedCriterion }];
    });

    setPendingUpsert(true);
    handleClose();
  };

  // ✅ Open Confirmation Modal before deleting
  const handleDeleteClick = (criterion: CriterionDefinition) => {
    setCriterionToDelete(criterion);
    setShowConfirmModal(true);
  };

  // ✅ Handle Confirm Delete
  const handleConfirmDelete = () => {
    if (!criterionToDelete) return;

    setCriteria((prev) => prev.filter((c) => c.key !== criterionToDelete.key));

    setShowConfirmModal(false);
    setCriterionToDelete(null);

    setPendingUpsert(true);
  };

  // 🚀 Trigger API call only after criteria is updated
  useEffect(() => {
    if (pendingUpsert) {
      handleUpsertCustomCriteria();
      setPendingUpsert(false);
    }
  }, [criteria, pendingUpsert]);

  const handleUpsertCustomCriteria = async () => {
    await postData(`${getBaseUrl()}/api/custom-criteria`, {
      industryGroupId,
      sectorId,
      criteria,
    });

    console.log('Criteria successfully updated!');
  };
  
  return (
    <PageWrapper>
      <Head>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
      </Head>
      <div className="flex justify-between">
        <div></div>
        <div className="text-4xl">Custom Criteria</div>
        <Button variant="contained" onClick={() => handleOpen()} className="mb-4" primary>
          Add Criterion
        </Button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }} className="mt-4">
        <thead>
          <tr className="text-color">
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
              <tr key={criterion.key}>
                <td style={tableCellStyle}>{criterion.key}</td>
                <td style={tableCellStyle}>{criterion.name}</td>
                <td style={tableCellStyle}>{criterion.shortDescription}</td>
                <td style={tableCellStyle}>{criterion.matchingInstruction}</td>
                <td style={tableCellStyle} className="flex justify-around">
                  <IconButton onClick={() => handleOpen(criterion)} iconName={IconTypes.Edit} removeBorder={true} />
                  <IconButton onClick={() => handleDeleteClick(criterion)} iconName={IconTypes.Trash} removeBorder={true} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal for JSON Editing */}
      <FullPageModal open={open} onClose={handleClose} title={isEditing ? 'Edit Criterion' : 'Add Criterion'}>
        <Block className="text-left scroll-auto min-h-full">
          {/* 🚀 Display validation messages inside the modal */}
          {validationMessages && validationMessages.length > 0 && (
            <div className="text-red-500 bg-red-100 border border-red-400 p-2 rounded mb-2">
              <strong>Validation Errors:</strong>
              <ul className="list-disc ml-4">
                {validationMessages.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          {/* <ReactJson
            src={selectedCriterion || {}}
            onEdit={(edit) => updateSelectedCriterion(edit.updated_src as CriterionDefinition)}
            onAdd={(add) => updateSelectedCriterion(add.updated_src as CriterionDefinition)}
            onDelete={(del) => updateSelectedCriterion(del.updated_src as CriterionDefinition)}
            theme="monokai"
            enableClipboard={false}
            style={{ textAlign: 'left' }}
          /> */}
          <div className="text-left w-full">
            <Form
              schema={schema as RJSFSchema}
              formData={selectedCriterion || {}}
              onChange={(e) => updateSelectedCriterion(e.formData as CriterionDefinition)}
              onSubmit={handleSave}
              validator={validator}
              noHtml5Validate
            />
          </div>
        </Block>
      </FullPageModal>

      {/* Confirmation Modal for Deleting */}
      {showConfirmModal && (
        <ConfirmationModal
          open={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmDelete}
          confirming={loading}
          title="Delete Criterion"
          confirmationText="Are you sure you want to delete this criterion?"
          askForTextInput={true}
        />
      )}
    </PageWrapper>
  );
}

const tableCellStyle = { padding: '10px', border: '1px solid #ddd' };
