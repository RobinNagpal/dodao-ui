'use client';

import Block from '@dodao/web-core/components/app/Block';
import Button from '@dodao/web-core/components/core/buttons/Button';
import IconButton from '@dodao/web-core/components/core/buttons/IconButton';
import { IconTypes } from '@dodao/web-core/components/core/icons/IconTypes';
import FullPageModal from '@dodao/web-core/components/core/modals/FullPageModal';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import React, { useRef, useState } from 'react';
import ReactJson from 'react-json-view';

interface Criterion {
  key: string;
  name: string;
  shortDescription: string;
  importantMetrics: string[];
  reports: string[];
}

const CriteriaTable = () => {
  const [criteria, setCriteria] = useState<Criterion[]>([]); // Starts empty
  const [open, setOpen] = useState(false);
  const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Store the original key before editing
  const originalKeyRef = useRef<string | null>(null);

  const handleOpen = (criterion: Criterion | null = null) => {
    if (criterion) {
      originalKeyRef.current = criterion.key; // Store original key
      setSelectedCriterion({ ...criterion }); // Clone for safe editing
      setIsEditing(true);
    } else {
      originalKeyRef.current = null;
      setSelectedCriterion({
        key: '',
        name: '',
        shortDescription: '',
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

  // ✅ Ensure unique key and prevent null keys
  const handleSave = () => {
    if (!selectedCriterion || selectedCriterion.key.trim() === '') {
      alert('Key cannot be empty!'); // Prevent empty keys
      return;
    }

    setCriteria((prev) => {
      if (isEditing) {
        // Find the original item using stored key and replace it
        return prev.map((c) => (c.key === originalKeyRef.current ? { ...selectedCriterion } : c));
      }

      // Prevent duplicate keys when adding a new criterion
      if (prev.some((c) => c.key === selectedCriterion.key)) {
        alert('Key must be unique!');
        return prev;
      }

      return [...prev, { ...selectedCriterion }];
    });

    handleClose();
  };

  return (
    <PageWrapper>
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
            <th style={tableCellStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {criteria.length === 0 ? (
            // Show a full-row message when no criteria exist
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
                <td style={tableCellStyle}>
                  <IconButton onClick={() => handleOpen(criterion)} iconName={IconTypes.Edit} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal for JSON Editing */}
      <FullPageModal open={open} onClose={handleClose} title={isEditing ? 'Edit Criterion' : 'Add Criterion'}>
        <Block className="text-left">
          <ReactJson
            src={selectedCriterion || {}}
            onEdit={(edit) => setSelectedCriterion(edit.updated_src as Criterion)}
            onAdd={(add) => setSelectedCriterion(add.updated_src as Criterion)}
            onDelete={(del) => setSelectedCriterion(del.updated_src as Criterion)}
            theme="monokai"
            enableClipboard={false}
            style={{ textAlign: 'left', height: '60vh' }}
          />

          <Button onClick={handleSave} className="m-4" variant="contained" primary>
            Save Changes
          </Button>

          <Button onClick={handleClose} className="m-4" variant="outlined">
            Close
          </Button>
        </Block>
      </FullPageModal>
    </PageWrapper>
  );
};

const tableCellStyle = { padding: '10px', border: '1px solid #ddd' };

export default CriteriaTable;
